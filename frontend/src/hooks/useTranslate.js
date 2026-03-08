/**
 * pAIr - Real-time Google Translate Integration
 * Replaces manual translations dictionary with Google Translate API
 * Caches results in localStorage for performance
 */
import { useState, useCallback, useRef, useEffect } from 'react';

const GOOGLE_TRANSLATE_KEY = 'AIzaSyBgb4ourlz3_N7aAqm2BbpvAt9O3eGeagI';
const CACHE_KEY = 'pair-translate-cache';
const CACHE_VERSION = 'v2';

// In-memory cache for instant lookups (populated from localStorage on load)
let memoryCache = {};
try {
  const stored = localStorage.getItem(CACHE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed._version === CACHE_VERSION) {
      memoryCache = parsed;
    }
  }
} catch (_) { /* */ }

// Pending translation promises to deduplicate concurrent requests
const pendingRequests = {};

function getCacheKey(text, targetLang) {
  return `${targetLang}::${text}`;
}

function saveCache() {
  try {
    memoryCache._version = CACHE_VERSION;
    localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
  } catch (_) { /* quota exceeded - clear old entries */ }
}

/**
 * Translate a single string using Google Translate API
 */
async function translateText(text, targetLang) {
  if (!text || targetLang === 'en') return text;

  const cacheKey = getCacheKey(text, targetLang);
  if (memoryCache[cacheKey]) return memoryCache[cacheKey];

  // Deduplicate: if same request is in-flight, wait for it
  if (pendingRequests[cacheKey]) return pendingRequests[cacheKey];

  const promise = (async () => {
    try {
      const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, target: targetLang, source: 'en', format: 'text' }),
      });
      const data = await res.json();
      if (data?.data?.translations?.[0]?.translatedText) {
        const translated = data.data.translations[0].translatedText;
        // Decode HTML entities that Google API returns
        const decoded = translated
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        memoryCache[cacheKey] = decoded;
        saveCache();
        return decoded;
      }
      return text;
    } catch (err) {
      console.warn('Translation failed:', err);
      return text;
    } finally {
      delete pendingRequests[cacheKey];
    }
  })();

  pendingRequests[cacheKey] = promise;
  return promise;
}

/**
 * Batch translate multiple strings in one API call (max 128 per call)
 */
async function translateBatch(texts, targetLang) {
  if (!texts.length || targetLang === 'en') return texts;

  // Split into cached and uncached
  const results = new Array(texts.length);
  const uncachedIndices = [];
  const uncachedTexts = [];

  texts.forEach((text, i) => {
    if (!text) { results[i] = text; return; }
    const cached = memoryCache[getCacheKey(text, targetLang)];
    if (cached) {
      results[i] = cached;
    } else {
      uncachedIndices.push(i);
      uncachedTexts.push(text);
    }
  });

  if (uncachedTexts.length === 0) return results;

  // Batch API call (Google supports up to 128 q params)
  try {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_KEY}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: uncachedTexts, target: targetLang, source: 'en', format: 'text' }),
    });
    const data = await res.json();
    if (data?.data?.translations) {
      data.data.translations.forEach((t, idx) => {
        const decoded = (t.translatedText || uncachedTexts[idx])
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        const origIdx = uncachedIndices[idx];
        results[origIdx] = decoded;
        memoryCache[getCacheKey(uncachedTexts[idx], targetLang)] = decoded;
      });
      saveCache();
    }
  } catch (err) {
    console.warn('Batch translation failed:', err);
    uncachedIndices.forEach((origIdx, idx) => {
      results[origIdx] = uncachedTexts[idx];
    });
  }

  return results;
}

/**
 * React hook for Google Translate integration.
 * Usage:
 *   const { gt } = useTranslate();
 *   <span>{gt('Hello World')}</span>
 *
 * gt() returns English instantly, then re-renders with translated text.
 */
export function useTranslate(langCode = 'en') {
  const [translations, setTranslations] = useState({});
  const queueRef = useRef(new Set());
  const timerRef = useRef(null);
  const langRef = useRef(langCode);

  // Reset translations when language changes
  useEffect(() => {
    if (langRef.current !== langCode) {
      langRef.current = langCode;
      setTranslations({});
      queueRef.current.clear();
    }
  }, [langCode]);

  const flushQueue = useCallback(() => {
    const texts = Array.from(queueRef.current);
    queueRef.current.clear();
    if (!texts.length || langCode === 'en') return;

    translateBatch(texts, langCode).then(results => {
      setTranslations(prev => {
        const next = { ...prev };
        texts.forEach((text, i) => {
          next[text] = results[i];
        });
        return next;
      });
    });
  }, [langCode]);

  /**
   * gt(englishText) - Get Translation
   * Returns cached translation immediately, or English as fallback while loading.
   */
  const gt = useCallback((text) => {
    if (!text || langCode === 'en') return text;

    // Check memory cache first (instant)
    const cacheKey = getCacheKey(text, langCode);
    if (memoryCache[cacheKey]) return memoryCache[cacheKey];

    // Check component state
    if (translations[text]) return translations[text];

    // Queue for batch translation
    if (!queueRef.current.has(text)) {
      queueRef.current.add(text);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flushQueue, 50); // 50ms debounce
    }

    return text; // Return English while loading
  }, [langCode, translations, flushQueue]);

  return { gt, translateText: (t) => translateText(t, langCode), translateBatch: (arr) => translateBatch(arr, langCode) };
}

// Export standalone function for non-hook usage
export { translateText, translateBatch };
export default useTranslate;
