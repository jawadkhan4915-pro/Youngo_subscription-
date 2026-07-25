import React, { useState, useEffect, useRef } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';

/**
 * Custom High-Performance Google Translator Dropdown Component
 * Handles instant language translation without creating layout shift or double scrollbars.
 */
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
];

const LanguageTranslator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const dropdownRef = useRef(null);

  // Initialize Google Translate Hidden Element & Cookie Check
  useEffect(() => {
    // Check existing googtrans cookie
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };

    const googCookie = getCookie('googtrans');
    if (googCookie) {
      const code = googCookie.split('/').pop();
      if (code && languages.some((l) => l.code === code)) {
        setCurrentLang(code);
      }
    }

    // Dynamically inject Google Translate script if missing
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            autoDisplay: false,
          },
          'google_translate_hidden_element'
        );
      }
    };

    // Close dropdown when clicking outside
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (langCode) => {
    setCurrentLang(langCode);
    setIsOpen(false);

    // 1. Set Google Translate Cookies across domain & path
    const domain = window.location.hostname;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain}`;
    document.cookie = `googtrans=/en/${langCode}; path=/;`;

    // 2. Trigger native select if Google Translate script loaded
    const selectElem = document.querySelector('.goog-te-combo');
    if (selectElem) {
      selectElem.value = langCode;
      selectElem.dispatchEvent(new Event('change'));
    }

    // 3. Reload window to enforce full page translation if needed
    window.location.reload();
  };

  const selectedLangObj = languages.find((l) => l.code === currentLang) || languages[0];

  return (
    <div ref={dropdownRef} className="translator-wrapper" style={{ position: 'relative' }}>
      {/* Hidden Google Translate Mount Container */}
      <div id="google_translate_hidden_element" style={{ display: 'none', visibility: 'hidden' }} />

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="glass-btn"
        style={{
          padding: '0.4rem 0.85rem',
          fontSize: '0.85rem',
          gap: '0.4rem',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-color)',
          background: 'rgba(99, 102, 241, 0.08)'
        }}
        title="Switch Language"
      >
        <Globe size={16} className="text-indigo-400" />
        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
          {selectedLangObj.flag} {selectedLangObj.name}
        </span>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
      </button>

      {/* Clean Custom Language Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '180px',
            maxHeight: '260px',
            overflowY: 'auto',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-premium)',
            padding: '0.4rem',
            zIndex: 1000,
            backdropFilter: 'blur(16px)'
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => changeLanguage(lang.code)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                background: currentLang === lang.code ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: currentLang === lang.code ? 'var(--color-primary)' : 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: currentLang === lang.code ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.2s ease'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </span>
              {currentLang === lang.code && <Check size={14} color="var(--color-primary)" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageTranslator;
