import bcrypt from 'bcryptjs';
import Category from '../models/Category.js';
import AITool from '../models/AITool.js';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';

const seedDatabase = async () => {
  try {
    // 1. Seed Admin if not exists
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@youngo.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      console.log('Seeding Administrator Account...');
      const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'AdminPassword123';
      
      const admin = await User.create({
        name: 'Youngo Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'Admin',
        isVerified: true,
        referralCode: 'YGO-ADMIN'
      });

      await Wallet.create({
        user: admin._id,
        totalCredits: 999999
      });

      console.log(`Admin account created! Email: ${adminEmail} | Password: ${adminPassword}`);
    }

    // 2. Seed Categories if empty
    const categoryCount = await Category.countDocuments();
    let chatbotsCat, codingCat, imageCat, voiceCat;

    if (categoryCount === 0) {
      console.log('Seeding AI Categories...');
      chatbotsCat = await Category.create({ name: 'Chatbots', icon: 'MessageSquare', description: 'Interactive AI Chat assistants' });
      codingCat = await Category.create({ name: 'Coding', icon: 'Code', description: 'AI Coding tools & copilots' });
      imageCat = await Category.create({ name: 'Images', icon: 'Image', description: 'AI Image generators' });
      voiceCat = await Category.create({ name: 'Voice', icon: 'Mic', description: 'AI Text-to-speech generators' });
      await Category.create({ name: 'Video', icon: 'Video', description: 'AI video generation tools' });
      console.log('Categories seeded.');
    } else {
      chatbotsCat = await Category.findOne({ name: 'Chatbots' });
      codingCat = await Category.findOne({ name: 'Coding' });
      imageCat = await Category.findOne({ name: 'Images' });
      voiceCat = await Category.findOne({ name: 'Voice' });
    }

    // 3. Seed AI Tools if empty
    const toolCount = await AITool.countDocuments();
    if (toolCount === 0) {
      console.log('Seeding AI Tools...');

      const toolsData = [
        {
          name: 'ChatGPT Plus',
          category: chatbotsCat?._id,
          price: 500,
          creditsPerPurchase: 100,
          description: 'Access OpenAI\'s most advanced conversational model ChatGPT GPT-4o for complex reasoning and tasks.',
          features: ['GPT-4o reasoning capabilities', 'Supports text and file uploads', 'Browse and generate files'],
          rules: ['Do not send spam prompts', 'Max 50 requests per day limit applies'],
          logo: 'https://cdn.oaistatic.com/_next/static/media/favicon-32x32.be0861c0.png',
          banner: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600',
          maxDailyLimit: 50,
          maxMonthlyLimit: 1000,
          remainingCredits: 5000
        },
        {
          name: 'Gemini Advanced',
          category: chatbotsCat?._id,
          price: 450,
          creditsPerPurchase: 100,
          description: 'Google\'s premium model Gemini 1.5 Pro, featuring an ultra-large context window for complex data analysis.',
          features: ['Gemini 1.5 Pro reasoning', 'Massive file uploads support', 'Integration with Google Workspace'],
          rules: ['No account harvesting', 'Max 50 queries per day'],
          logo: 'https://www.gstatic.com/lamda/images/favicon_v1_150160d152bd23a2a6e9.png',
          banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600',
          maxDailyLimit: 50,
          maxMonthlyLimit: 1000,
          remainingCredits: 5000
        },
        {
          name: 'Claude Pro',
          category: chatbotsCat?._id,
          price: 600,
          creditsPerPurchase: 120,
          description: 'Anthropic\'s Claude 3.5 Sonnet, ideal for advanced coding, coding tasks, logical thinking, and natural conversation.',
          features: ['Claude 3.5 Sonnet processing', 'Excellent coding assistance', 'High context limit'],
          rules: ['Respect daily query limits', 'Do not share codes'],
          logo: 'https://www.anthropic.com/images/icons/favicon-32x32.png',
          banner: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=600',
          maxDailyLimit: 40,
          maxMonthlyLimit: 800,
          remainingCredits: 4000
        },
        {
          name: 'Cursor Pro',
          category: codingCat?._id,
          price: 800,
          creditsPerPurchase: 150,
          description: 'The premier AI-first code editor. Autocompletes code blocks and edits whole directories.',
          features: ['Autopilot coding actions', 'Chat context in workspace', 'Instant bug fixing suggestions'],
          rules: ['Do not use for massive scraping', 'Individual workspace access only'],
          logo: 'https://www.cursor.com/assets/images/favicon.svg',
          banner: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600',
          maxDailyLimit: 60,
          maxMonthlyLimit: 1200,
          remainingCredits: 8000
        },
        {
          name: 'Midjourney',
          category: imageCat?._id,
          price: 700,
          creditsPerPurchase: 80,
          description: 'Generate stunning photorealistic visuals and digital artwork based on descriptive text prompts.',
          features: ['Photorealistic art rendering', 'Supports --v 6 engine', 'Fast generating hours queue'],
          rules: ['No NSFW prompts allowed', '5 credits deducted per generated visual'],
          logo: 'https://www.midjourney.com/apple-touch-icon.png',
          banner: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600',
          maxDailyLimit: 20,
          maxMonthlyLimit: 300,
          remainingCredits: 3000
        },
        {
          name: 'ElevenLabs',
          category: voiceCat?._id,
          price: 500,
          creditsPerPurchase: 100,
          description: 'Ultra-realistic AI voice generation and text-to-speech rendering in dozens of custom voices.',
          features: ['Multi-language support', 'Voice cloning capabilities', 'High fidelity sound export'],
          rules: ['Do not generate hate speech audio', '5 credits per voice synthesis request'],
          logo: 'https://elevenlabs.io/static/images/favicon.png',
          banner: 'https://images.unsplash.com/photo-1484755560695-a4c740285fa6?q=80&w=600',
          maxDailyLimit: 30,
          maxMonthlyLimit: 500,
          remainingCredits: 4000
        }
      ];

      for (const tool of toolsData) {
        await AITool.create(tool);
      }
      console.log('Sample AI Tools seeded.');
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

export default seedDatabase;
