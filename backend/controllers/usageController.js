import Subscription from '../models/Subscription.js';
import AITool from '../models/AITool.js';
import UsageLog from '../models/UsageLog.js';
import Transaction from '../models/Transaction.js';
import { asyncHandler } from '../middlewares/error.js';
import axios from 'axios';

// ============================================================
// REAL AI ENGINE — calls Gemini Free Tier as the universal AI
// Falls back to smart simulation if no key or API error
// ============================================================

/**
 * Call Google Gemini API (free tier works without billing)
 * Used as the universal AI backend for ALL tool types
 */
async function callGeminiAPI(systemContext, userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('No Gemini API key configured');

  const fullPrompt = systemContext
    ? `${systemContext}\n\nUser: ${userPrompt}`
    : userPrompt;

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 1024,
        topK: 40,
        topP: 0.95
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
      ]
    },
    { timeout: 20000 }
  );

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini API');
  return text;
}

/**
 * Build a system context prompt based on tool type
 * Gemini impersonates each AI tool's persona
 */
function buildSystemContext(toolName) {
  const name = toolName.toLowerCase();

  if (name.includes('chatgpt') || name.includes('openai')) {
    return `You are ChatGPT, a helpful AI assistant by OpenAI. Respond clearly, helpfully, and concisely. Format responses with markdown when appropriate.`;
  }
  if (name.includes('claude')) {
    return `You are Claude, an AI assistant by Anthropic. You are thoughtful, nuanced, and thorough in your responses. Use markdown formatting.`;
  }
  if (name.includes('gemini')) {
    return `You are Gemini, Google's most capable AI model. Respond with accuracy, depth, and helpful formatting using markdown.`;
  }
  if (name.includes('grok')) {
    return `You are Grok, an AI by xAI. You are witty, insightful, and have access to real-time knowledge. Respond conversationally but informatively.`;
  }
  if (name.includes('perplexity')) {
    return `You are Perplexity AI, a search-augmented AI assistant. Provide accurate, well-sourced information with structured formatting and citations where relevant.`;
  }
  if (name.includes('copilot') || name.includes('github')) {
    return `You are GitHub Copilot, an AI coding assistant. Help with code generation, debugging, and technical explanations. Always include code examples in markdown code blocks.`;
  }
  if (name.includes('cursor')) {
    return `You are Cursor AI, an intelligent coding assistant. Generate clean, efficient, production-ready code with explanations. Use markdown code blocks with language syntax highlighting.`;
  }
  if (name.includes('midjourney') || name.includes('dalle') || name.includes('leonardo') || name.includes('designer')) {
    return `You are an AI image generation assistant. Describe the image that would be generated, provide optimized prompt parameters, and return a picsum.photos demo URL as a placeholder image in markdown format like: ![Generated Image](https://picsum.photos/seed/RANDOMWORD/800/450)`;
  }
  if (name.includes('elevenlabs') || name.includes('suno') || name.includes('udio')) {
    return `You are an AI voice and audio synthesis assistant. Describe the audio/music that would be generated, provide technical details, and include a demo audio reference.`;
  }
  if (name.includes('runway') || name.includes('kling') || name.includes('pika')) {
    return `You are an AI video generation assistant. Describe the video sequence that would be created, provide cinematic details and estimated duration.`;
  }
  if (name.includes('notion') || name.includes('productivity')) {
    return `You are an AI productivity assistant. Help organize, plan, and structure information clearly. Use markdown headers, bullet points, and tables.`;
  }

  // Default: generic powerful AI assistant
  return `You are a highly intelligent AI assistant from the Youngo Premium AI Platform. Respond helpfully, clearly, and with markdown formatting when appropriate.`;
}

// @desc    Execute AI Tool Prompt (Playground proxy)
// @route   POST /api/usage/execute
// @access  Private
export const executeToolPrompt = asyncHandler(async (req, res, next) => {
  const { toolId, prompt } = req.body;

  if (!prompt || !prompt.trim()) {
    res.status(400);
    throw new Error('Please enter a prompt or instruction');
  }

  if (!toolId) {
    res.status(400);
    throw new Error('Tool ID is required');
  }

  // 1. Fetch AI Tool details
  const tool = await AITool.findById(toolId);
  if (!tool) {
    res.status(404);
    throw new Error('AI Tool not found. Please re-select your subscription.');
  }

  if (tool.status === 'Inactive' || tool.status === 'Hidden') {
    res.status(403);
    throw new Error('This AI tool is currently offline. Please contact support.');
  }

  // 2. Verify Active Subscription
  const sub = await Subscription.findOne({
    user: req.user.id,
    tool: toolId,
    status: 'Active'
  });

  if (!sub) {
    res.status(403);
    throw new Error('No active subscription found for this tool. Please purchase a plan from the Tools catalog.');
  }

  if (sub.expiresAt < Date.now()) {
    res.status(403);
    throw new Error('Your subscription for this tool has expired. Please renew your plan.');
  }

  // 3. Determine Credit Cost
  const toolNameLower = tool.name.toLowerCase();
  let creditCost = 1;
  const heavyToolKeywords = [
    'midjourney', 'leonardo', 'dall', 'designer',
    'elevenlabs', 'runway', 'kling', 'pika', 'suno', 'udio'
  ];
  if (heavyToolKeywords.some(k => toolNameLower.includes(k))) {
    creditCost = 5;
  }

  if (sub.creditsRemaining < creditCost) {
    res.status(403);
    throw new Error(
      `Insufficient credits! This action costs ${creditCost} credit${creditCost > 1 ? 's' : ''}, ` +
      `but you only have ${sub.creditsRemaining} remaining. Please top up your wallet.`
    );
  }

  // 4. Check Daily Usage Limits
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const dailyLogsCount = await UsageLog.countDocuments({
    user: req.user.id,
    tool: toolId,
    createdAt: { $gte: startOfDay }
  });

  if (dailyLogsCount >= tool.maxDailyLimit) {
    res.status(429);
    throw new Error(
      `Daily limit reached! You've used all ${tool.maxDailyLimit} daily requests for this tool. ` +
      `Resets at midnight.`
    );
  }

  // 5. Call AI Engine — Real Gemini API → Smart Simulation fallback
  let responseData = '';
  let aiEngine = 'simulation';

  try {
    const systemContext = buildSystemContext(tool.name);
    responseData = await callGeminiAPI(systemContext, prompt);
    aiEngine = 'gemini';
  } catch (apiError) {
    console.log(`[Playground] Gemini API unavailable (${apiError.message}), using smart simulation for ${tool.name}`);
    responseData = getSmartSimulatedResponse(tool.name, prompt);
    aiEngine = 'simulation';
  }

  // 6. Deduct Credits & Save Subscription
  sub.creditsRemaining -= creditCost;
  sub.dailyUsed = (sub.dailyUsed || 0) + creditCost;
  sub.monthlyUsed = (sub.monthlyUsed || 0) + creditCost;
  await sub.save();

  // 7. Log Usage & Transaction
  await UsageLog.create({
    user: req.user.id,
    tool: toolId,
    prompt: prompt.length > 500 ? prompt.substring(0, 500) + '...' : prompt,
    creditsDeducted: creditCost,
    status: 'Success',
    ipAddress: req.ip
  });

  await Transaction.create({
    user: req.user.id,
    type: 'Credit_Deduction',
    amount: creditCost,
    description: `Used ${creditCost} credit${creditCost > 1 ? 's' : ''} on ${tool.name} Playground`,
    referenceId: toolId.toString()
  });

  res.status(200).json({
    success: true,
    tool: tool.name,
    engine: aiEngine,
    creditsSpent: creditCost,
    creditsRemaining: sub.creditsRemaining,
    result: responseData
  });
});


// ============================================================
// SMART SIMULATION ENGINE
// Used when Gemini API key is not set or API is unreachable
// Produces highly realistic, contextual responses per tool
// ============================================================

function getSmartSimulatedResponse(toolName, prompt) {
  const name = toolName.toLowerCase();
  const p = prompt.trim();
  const words = p.split(' ');
  const topic = words.slice(0, 6).join(' ');
  const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // ── CHAT / PRODUCTIVITY AI ──
  if (
    name.includes('chatgpt') || name.includes('gpt') ||
    name.includes('gemini') || name.includes('claude') ||
    name.includes('grok') || name.includes('perplexity') ||
    name.includes('llama') || name.includes('mistral') ||
    name.includes('deepseek')
  ) {
    return generateChatResponse(toolName, p, topic);
  }

  // ── CODING AI ──
  if (
    name.includes('copilot') || name.includes('cursor') ||
    name.includes('codeium') || name.includes('windsurf') ||
    name.includes('replit') || name.includes('tabnine')
  ) {
    return generateCodingResponse(toolName, p);
  }

  // ── IMAGE GENERATION AI ──
  if (
    name.includes('midjourney') || name.includes('dall') ||
    name.includes('leonardo') || name.includes('designer') ||
    name.includes('ideogram') || name.includes('stable diffusion') ||
    name.includes('firefly') || name.includes('imagen')
  ) {
    return generateImageResponse(toolName, p);
  }

  // ── VOICE / MUSIC AI ──
  if (
    name.includes('elevenlabs') || name.includes('suno') ||
    name.includes('udio') || name.includes('mubert')
  ) {
    return generateAudioResponse(toolName, p);
  }

  // ── VIDEO AI ──
  if (
    name.includes('runway') || name.includes('kling') ||
    name.includes('pika') || name.includes('sora') ||
    name.includes('luma') || name.includes('haiper')
  ) {
    return generateVideoResponse(toolName, p);
  }

  // ── DEFAULT SMART RESPONSE ──
  return generateChatResponse(toolName, p, topic);
}

function generateChatResponse(toolName, prompt, topic) {
  const responses = [
    `Thank you for your question about **"${topic}"**.\n\nHere's a comprehensive breakdown:\n\n## Analysis\n\n${prompt.length > 30 ? `Your query touches on an important subject. Let me address it systematically:` : 'Here is a direct answer:'}\n\n**Key Points:**\n- The core concept here involves understanding the relationship between the components you've mentioned\n- Best practice suggests approaching this with a structured, step-by-step methodology\n- Consider the broader context: how does this fit into your overall goals?\n\n**Recommended Approach:**\n1. Start by clearly defining your objectives\n2. Break the problem into smaller, manageable components\n3. Test and iterate on each component before combining\n4. Document your process for future reference\n\n**Summary:** ${prompt.substring(0, 80)}${prompt.length > 80 ? '...' : ''} — This is a well-formed query that can be addressed with the framework above.\n\n*Powered by ${toolName} via Youngo AI Platform*`,

    `Great question! Let me analyze **"${topic}"** for you.\n\n## Direct Answer\n\nBased on my analysis, here are the most relevant insights:\n\n> The fundamental principle at work here is that **clarity leads to better outcomes**. When we examine "${topic}", we see several interconnected factors.\n\n### What You Need to Know:\n\n1. **Context matters** — Understanding the background helps frame the right solution\n2. **Practical application** — Theory is only useful when it can be implemented\n3. **Iterative improvement** — Start with a working solution, then optimize\n\n### Action Steps:\n- ✅ Define your success criteria first\n- ✅ Gather the necessary resources and information\n- ✅ Implement in small, testable increments\n- ✅ Review and refine based on results\n\n*Response generated by ${toolName} · Youngo Premium Platform*`,

    `I understand you're asking about: *"${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"*\n\n## My Response\n\n${toolName} processes this through multiple reasoning layers. Here's what I found:\n\n**Core Answer:**\nThis topic—"${topic}"—involves several key considerations that are worth exploring in depth.\n\n**Detailed Breakdown:**\n\n| Aspect | Details |\n|--------|--------|\n| Primary Focus | ${topic} |\n| Complexity Level | Intermediate |\n| Recommended Approach | Systematic Analysis |\n\n**Insights:**\n- The most effective strategy involves breaking this into logical components\n- Applying proven frameworks helps ensure consistent results\n- Reviewing similar cases provides valuable reference points\n\n**Conclusion:** Your prompt has been fully processed. The approach outlined above provides a solid foundation for moving forward.\n\n---\n*${toolName} · Youngo Shared AI Node · Response time: <1s*`
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

function generateCodingResponse(toolName, prompt) {
  const isQuestion = prompt.toLowerCase().includes('how') || prompt.toLowerCase().includes('what') || prompt.toLowerCase().includes('why');
  const seed = Math.floor(Math.random() * 3);

  if (seed === 0) {
    return `## ${toolName} Code Generation\n\nHere's a clean implementation for: *"${prompt.substring(0, 60)}..."*\n\n\`\`\`javascript\n// Generated by ${toolName} — Youngo AI Platform\nasync function solution(input) {\n  // Validate input parameters\n  if (!input || typeof input !== 'object') {\n    throw new Error('Invalid input: expected an object');\n  }\n\n  // Core processing logic\n  const result = await processData(input);\n  \n  // Return structured response\n  return {\n    success: true,\n    data: result,\n    timestamp: new Date().toISOString(),\n    processingTime: Date.now()\n  };\n}\n\nasync function processData(data) {\n  // Apply transformation logic\n  return Object.entries(data).reduce((acc, [key, value]) => {\n    acc[key] = typeof value === 'string' ? value.trim() : value;\n    return acc;\n  }, {});\n}\n\n// Usage example:\nconst output = await solution({ query: '${prompt.substring(0, 30)}', mode: 'standard' });\nconsole.log(output);\n\`\`\`\n\n**Code Quality Notes:**\n- ✅ Async/await pattern for non-blocking execution\n- ✅ Input validation at function entry point\n- ✅ Structured error handling\n- ✅ Clean return format with metadata\n\n*Generated by ${toolName} · O(n) complexity · Production-ready*`;
  }

  if (seed === 1) {
    return `## ${toolName} Technical Analysis\n\n**Query:** *"${prompt.substring(0, 80)}..."*\n\n\`\`\`python\n# ${toolName} Solution — Youngo AI\nfrom typing import Optional, Dict, Any\nimport json\n\ndef process_request(prompt: str, options: Optional[Dict] = None) -> Dict[str, Any]:\n    """\n    Process AI request with error handling and structured output.\n    \n    Args:\n        prompt: The user's input query\n        options: Optional configuration parameters\n    \n    Returns:\n        Structured response dictionary\n    """\n    config = options or {}\n    \n    # Process and analyze the input\n    analysis = {\n        'input_length': len(prompt),\n        'tokens_estimate': len(prompt.split()),\n        'complexity': 'medium' if len(prompt) > 50 else 'simple'\n    }\n    \n    return {\n        'success': True,\n        'result': f'Processed: {prompt[:50]}...',\n        'analysis': analysis,\n        'model': '${toolName}'\n    }\n\n# Execute\nresponse = process_request('${prompt.substring(0, 40).replace(/'/g, "\\'")}...')\nprint(json.dumps(response, indent=2))\n\`\`\`\n\n**Output:**\n\`\`\`json\n{\n  "success": true,\n  "result": "Processed successfully",\n  "analysis": { "complexity": "medium", "tokens": ${Math.floor(Math.random() * 100) + 20} },\n  "model": "${toolName}"\n}\n\`\`\`\n\n*${toolName} · Youngo Premium · Python 3.10+*`;
  }

  return `## ${toolName} — Code Review & Solution\n\nAnalyzing your request: *"${prompt.substring(0, 70)}..."*\n\n\`\`\`typescript\n// TypeScript Implementation — ${toolName}\ninterface RequestConfig {\n  prompt: string;\n  model: string;\n  maxTokens?: number;\n  temperature?: number;\n}\n\ninterface AIResponse {\n  success: boolean;\n  content: string;\n  usage: {\n    promptTokens: number;\n    completionTokens: number;\n    totalTokens: number;\n  };\n}\n\nasync function executeAIRequest(config: RequestConfig): Promise<AIResponse> {\n  const { prompt, model, maxTokens = 1024, temperature = 0.7 } = config;\n  \n  // Simulate processing\n  const tokens = Math.ceil(prompt.length / 4);\n  \n  return {\n    success: true,\n    content: \`Response for: \${prompt.substring(0, 50)}...\`,\n    usage: {\n      promptTokens: tokens,\n      completionTokens: maxTokens,\n      totalTokens: tokens + maxTokens\n    }\n  };\n}\n\n// Example usage\nconst result = await executeAIRequest({\n  prompt: '${prompt.substring(0, 40).replace(/'/g, "\\'")}',\n  model: '${toolName.toLowerCase().replace(/\s+/g, '-')}',\n  maxTokens: 1024\n});\n\`\`\`\n\n**TypeScript Benefits:** Type-safe, auto-complete, compile-time error checking.\n\n*${toolName} · Youngo AI Platform · TypeScript 5.x*`;
}

function generateImageResponse(toolName, prompt) {
  const seeds = ['cosmic', 'digital', 'neon', 'forest', 'urban', 'abstract', 'fantasy', 'retro'];
  const seed = seeds[Math.floor(Math.random() * seeds.length)] + Math.floor(Math.random() * 999);
  const width = [800, 900, 1024, 768][Math.floor(Math.random() * 4)];
  const height = [450, 500, 576, 432][Math.floor(Math.random() * 4)];
  const styles = ['--style raw', '--style scenic', '--style expressive', '--v 6.1'];
  const style = styles[Math.floor(Math.random() * styles.length)];
  const ratios = ['16:9', '1:1', '4:3', '3:2'];
  const ratio = ratios[Math.floor(Math.random() * ratios.length)];

  return `## 🎨 ${toolName} — Image Generation Complete\n\n**Prompt Processed:** *"${prompt}"*\n\n**Generation Parameters:**\n\`\`\`\nPrompt: ${prompt}\n${style} --ar ${ratio} --q 2\nModel: ${toolName} Premium Engine\nSeeds: ${Math.floor(Math.random() * 9999999)}\nUpscale: 4x Creative\n\`\`\`\n\n**Generated Image:**\n\n![AI Generated: ${prompt.substring(0, 40)}](https://picsum.photos/seed/${seed}/${width}/${height})\n\n**Generation Details:**\n| Parameter | Value |\n|-----------|-------|\n| Resolution | ${width}×${height}px (4K upscaled) |\n| Style | ${style} |\n| Aspect Ratio | ${ratio} |\n| Processing Time | ${(Math.random() * 15 + 5).toFixed(1)}s |\n| Quality Score | ${Math.floor(Math.random() * 5) + 95}/100 |\n\n💡 *Right-click the image to save. This is a demo render — connect your ${toolName} API key for full HD generation.*\n\n*${toolName} · Youngo AI Platform · Credits used: 5*`;
}

function generateAudioResponse(toolName, prompt) {
  const isMusic = prompt.toLowerCase().includes('music') || prompt.toLowerCase().includes('song') || prompt.toLowerCase().includes('beat');
  const duration = `${Math.floor(Math.random() * 3) + 1}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}`;

  if (isMusic || toolName.toLowerCase().includes('suno') || toolName.toLowerCase().includes('udio')) {
    return `## 🎵 ${toolName} — Music Generation Complete\n\n**Prompt:** *"${prompt}"*\n\n**Generated Track:**\n\n🎼 **Track Details:**\n| Field | Value |\n|-------|-------|\n| Genre | ${['Electronic', 'Ambient', 'Pop', 'Hip-Hop', 'Cinematic'][Math.floor(Math.random() * 5)]} |\n| Tempo | ${Math.floor(Math.random() * 60) + 90} BPM |\n| Key | ${['C Major', 'A Minor', 'G Major', 'D Minor'][Math.floor(Math.random() * 4)]} |\n| Duration | ${duration} |\n| Format | MP3 Stereo (320kbps) |\n| Model | ${toolName} Premium Engine |\n\n**🔊 Demo Audio Player:**\n\n> [▶ Click to play demo track](https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${Math.floor(Math.random() * 17) + 1}.mp3)\n\n*Note: Playing a demo track. Connect your ${toolName} API key to generate custom audio from your prompt.*\n\n*${toolName} · Youngo AI Platform · Credits used: 5*`;
  }

  return `## 🔊 ${toolName} — Voice Synthesis Complete\n\n**Script:** *"${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"*\n\n**Voice Generation Details:**\n| Setting | Value |\n|---------|-------|\n| Voice Model | Rachel (Premium Clone) |\n| Stability | 78% |\n| Clarity + Similarity | 90% |\n| Style Exaggeration | 25% |\n| Format | MP3 Stereo (320kbps) |\n| Duration | ${duration} |\n| Characters Used | ${prompt.length} / 5000 |\n\n**🔊 Generated Audio:**\n\n> [▶ Play synthesized voice output](https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3)\n\n📥 Download MP3 · Share Link · Edit Voice Settings\n\n*${toolName} · Youngo AI Platform · Credits used: 5*`;
}

function generateVideoResponse(toolName, prompt) {
  const duration = `${Math.floor(Math.random() * 10) + 4}s`;
  const fps = [24, 30, 60][Math.floor(Math.random() * 3)];
  const resolutions = ['1080p', '4K', '720p'];
  const resolution = resolutions[Math.floor(Math.random() * 3)];
  const seed = Math.floor(Math.random() * 9999);

  return `## 🎬 ${toolName} — Video Generation Complete\n\n**Scene Description:** *"${prompt}"*\n\n**Video Specifications:**\n| Parameter | Value |\n|-----------|-------|\n| Duration | ${duration} |\n| Resolution | ${resolution} (${fps}fps) |\n| Codec | H.264 / WebM |\n| Motion Style | ${['Cinematic', 'Dynamic', 'Smooth', 'Dramatic'][Math.floor(Math.random() * 4)]} |\n| Camera | ${['Dolly in', 'Pan right', 'Static', 'Orbit'][Math.floor(Math.random() * 4)]} |\n| Seed | ${seed} |\n\n**Preview Frame:**\n\n![Video Frame Preview](https://picsum.photos/seed/video${seed}/800/450)\n\n**Generation Log:**\n\`\`\`\n[00:00] Initializing ${toolName} render engine...\n[00:02] Parsing scene description...\n[00:05] Generating keyframes (${Math.floor(Math.random() * 20) + 10} frames)...\n[00:${Math.floor(Math.random() * 30) + 10}] Applying motion interpolation...\n[00:${Math.floor(Math.random() * 20) + 40}] Video rendered successfully ✓\n\`\`\`\n\n*${toolName} · Youngo AI Platform · Credits used: 5*`;
}


// @desc    Get user's complete usage history logs
// @route   GET /api/usage/my-logs
// @access  Private
export const getMyLogs = asyncHandler(async (req, res, next) => {
  const logs = await UsageLog.find({ user: req.user.id })
    .populate('tool', 'name logo')
    .sort('-createdAt')
    .limit(100);

  res.status(200).json({
    success: true,
    data: logs
  });
});
