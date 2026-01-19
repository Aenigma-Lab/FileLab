/**
 * 🤖 AI Language Detection
 * 
 * Advanced language detection for documents and text
 * using multiple detection methods.
 */

import { debounce, generateAIId } from './aiIndex';

/**
 * Common n-grams for different languages
 */
const LANGUAGE_NGRAMS = {
  en: ['the', 'and', 'ing', 'tion', 'that', 'with', 'for', 'have', 'this', 'from'],
  es: ['que', 'del', 'ión', 'los', 'las', 'con', 'por', 'para', 'una', 'los'],
  fr: ['ion', 'ent', 'les', 'des', 'tion', 'ement', 'la', 'le', 'et', 'est'],
  de: ['ung', 'sch', 'ich', 'den', 'die', 'und', 'ein', 'keit', 'lich', 'ten'],
  pt: ['ção', 'men', 'de', 'que', 'os', 'as', 'por', 'com', 'não', 'para'],
  it: ['ione', 'zione', 'are', 'ere', 'ire', 'gli', 'che', 'per', 'una', 'del'],
  ru: ['ов', 'овн', 'ани', ' ен', 'ии', 'ост', 'тел', 'ьн', 'про', 'стр'],
  zh: ['的', '是', '了', '不', '在', '人', '有', '我', '这', '个'],
  ja: ['の', 'に', 'は', 'を', 'た', 'で', 'が', 'と', 'し', 'て'],
  ko: ['의', '이', '에', '는', '을', '가', '하', '고', ' 있', ' 수'],
  ar: ['ال', ' في', ' لا', ' على', ' من', ' إنه', ' مع', ' عن', ' ذلك', ' هذا'],
  hi: ['ी', 'ा', 'े', 'ो', 'न', 'र', 'है', 'से', 'क', 'लि'],
};

/**
 * Character frequency analysis for languages
 */
const LANGUAGE_CHARACTERS = {
  en: { letters: 'abcdefghijklmnopqrstuvwxyz', common: 'etaoinshrdlucmwfgypbvkxjq' },
  es: { letters: 'abcdefghijklmnñopqrstuvwxyz', common: 'eaosrnidlcpumtvgbqhfzñ' },
  fr: { letters: 'abcdefghijklmnopqrstuvwxyzàâäéèêëïîôùûüç', common: 'esaitnrulodcpmévqfhgbzjàâäéèêëïîôùûüç' },
  de: { letters: 'abcdefghijklmnopqrstuvwxyzäöüß', common: 'enirstaudlgcmphobvfkzwjäöüß' },
  ru: { letters: 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя', common: 'оеаинтрслвпдмкругбзчйхцшщъыьэюя' },
  zh: { letters: '的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面', common: '的一是在不了有和人这中大为上个国' },
  ja: { letters: 'あいablishうえおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもやゆよらりるれろわをん', common: 'のいうはれたりで' },
  ar: { letters: 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي', common: 'العربيةفيمنهعلى' },
};

/**
 * Detect script type from text
 */
export function detectScript(text) {
  const scripts = {
    latin: /[a-zA-Z]/,
    cyrillic: /[а-яА-ЯёЁ]/,
    cjk: /[\u4e00-\u9fff\u3400-\u4dbf]/,
    arabic: /[\u0600-\u06ff\u0750-\u077f]/,
    devanagari: /[\u0900-\u097f]/,
    korean: /[가-힣]/,
    japanese: /[\u3040-\u309f\u30a0-\u30ff]/,
  };
  
  for (const [script, regex] of Object.entries(scripts)) {
    if (regex.test(text)) {
      return script;
    }
  }
  
  return 'unknown';
}

/**
 * Calculate n-gram frequency
 */
function calculateNGramFrequency(text, n = 3) {
  const ngrams = {};
  const cleanText = text.toLowerCase().replace(/[^a-zа-яё]/g, '');
  
  for (let i = 0; i <= cleanText.length - n; i++) {
    const ngram = cleanText.slice(i, i + n);
    ngrams[ngram] = (ngrams[ngram] || 0) + 1;
  }
  
  return ngrams;
}

/**
 * Calculate language probability based on n-grams
 */
function calculateLanguageProbability(ngrams, lang) {
  const langNgrams = LANGUAGE_NGRAMS[lang] || [];
  let score = 0;
  
  for (const ngram of langNgrams) {
    if (ngrams[ngram.toLowerCase()]) {
      score += ngrams[ngram.toLowerCase()];
    }
  }
  
  return score;
}

/**
 * Calculate character frequency match
 */
function calculateCharacterMatch(text, lang) {
  const langConfig = LANGUAGE_CHARACTERS[lang];
  if (!langConfig) return 0;
  
  const textLower = text.toLowerCase();
  let matches = 0;
  let totalChars = 0;
  
  for (const char of textLower) {
    if (langConfig.letters.includes(char)) {
      matches++;
    }
    totalChars++;
  }
  
  return totalChars > 0 ? matches / totalChars : 0;
}

/**
 * Detect language from text - main function
 * @param {string} text - Text to analyze
 * @param {Object} options - Detection options
 * @returns {Object} - Detection result
 */
export function detectLanguage(text, options = {}) {
  const result = {
    id: generateAIId(),
    timestamp: new Date().toISOString(),
    text: text.slice(0, 500), // Store sample
    textLength: text.length,
    detectedScript: detectScript(text),
    languages: [],
    primaryLanguage: null,
    confidence: 0,
    suggestions: [],
  };
  
  if (!text || text.trim().length < 10) {
    result.error = 'Text too short for reliable detection';
    result.suggestions = ['Provide more text for better accuracy'];
    return result;
  }
  
  // Calculate n-gram frequencies
  const ngrams = calculateNGramFrequency(text, 3);
  
  // Score each language
  const langScores = {};
  const totalNGrams = Object.values(ngrams).reduce((a, b) => a + b, 0);
  
  for (const [lang, config] of Object.entries(LANGUAGE_CHARACTERS)) {
    const ngramScore = calculateLanguageProbability(ngrams, lang);
    const charMatch = calculateCharacterMatch(text, lang);
    
    // Normalize scores
    const normalizedNGram = totalNGrams > 0 ? ngramScore / totalNGrams : 0;
    
    // Combined score with weights
    langScores[lang] = (normalizedNGram * 0.7) + (charMatch * 0.3);
  }
  
  // Sort by score
  const sortedLangs = Object.entries(langScores)
    .sort((a, b) => b[1] - a[1]);
  
  // Build results
  result.languages = sortedLangs.slice(0, 5).map(([lang, score], index) => ({
    code: lang,
    name: getLanguageName(lang),
    score: (score * 100).toFixed(1),
    rank: index + 1,
    isLikely: score > 0.3,
  }));
  
  // Primary language
  if (result.languages.length > 0) {
    result.primaryLanguage = result.languages[0];
    result.confidence = parseFloat(result.languages[0].score);
  }
  
  // Add script-specific suggestions
  if (result.detectedScript === 'cjk') {
    result.suggestions = ['Consider using OCR with language-specific models'];
  } else if (result.confidence < 50) {
    result.suggestions = ['Low confidence - provide more text for better detection'];
  } else if (result.languages.length > 1 && result.languages[1].score > result.confidence * 0.8) {
    result.suggestions = [`Possible mixed content - also detected ${result.languages[1].name}`];
  }
  
  return result;
}

/**
 * Get language name from code
 */
export function getLanguageName(code) {
  const names = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    pt: 'Portuguese',
    it: 'Italian',
    ru: 'Russian',
    zh: 'Chinese',
    ja: 'Japanese',
    ko: 'Korean',
    ar: 'Arabic',
    hi: 'Hindi',
    nl: 'Dutch',
    pl: 'Polish',
    sv: 'Swedish',
    tr: 'Turkish',
    uk: 'Ukrainian',
    vi: 'Vietnamese',
    th: 'Thai',
    id: 'Indonesian',
  };
  
  return names[code] || code.toUpperCase();
}

/**
 * Get language code from name
 */
export function getLanguageCode(name) {
  const codes = {
    'english': 'en',
    'spanish': 'es',
    'french': 'fr',
    'german': 'de',
    'portuguese': 'pt',
    'italian': 'it',
    'russian': 'ru',
    'chinese': 'zh',
    'japanese': 'ja',
    'korean': 'ko',
    'arabic': 'ar',
    'hindi': 'hi',
  };
  
  return codes[name.toLowerCase()] || name.toLowerCase();
}

/**
 * Batch detect languages for multiple texts
 */
export function batchDetectLanguages(texts) {
  return texts.map(text => detectLanguage(text));
}

/**
 * Detect language from file content
 * @param {File} file - File to analyze
 * @returns {Promise<Object>} - Detection result
 */
export async function detectLanguageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const result = detectLanguage(text);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file.slice(0, 10240)); // Read first 10KB
  });
}

/**
 * Get compatible OCR languages for detected language
 */
export function getCompatibleOCRLanguages(detectedLang) {
  const ocrMapping = {
    en: ['eng', 'enm'],
    es: ['spa', 'cat', 'glg'],
    fr: ['fra', 'frm', 'bre'],
    de: ['deu', 'frk', 'ell'],
    pt: ['por', 'ita'],
    it: ['ita', 'lat'],
    ru: ['rus', 'bel', 'ukr'],
    zh: ['chi_sim', 'chi_tra'],
    ja: ['jpn'],
    ko: ['kor'],
    ar: ['ara'],
    hi: ['hin'],
  };
  
  return ocrMapping[detectedLang] || ['eng'];
}

/**
 * Estimate reading time for language
 */
export function estimateReadingTime(wordCount, langCode = 'en') {
  const wordsPerMinute = {
    en: 200,
    es: 220,
    fr: 190,
    de: 180,
    pt: 210,
    it: 200,
    ru: 150,
    zh: 250, // Characters per minute
    ja: 200,
    ko: 200,
  };
  
  const wpm = wordsPerMinute[langCode] || 200;
  const minutes = Math.ceil(wordCount / wpm);
  
  return {
    minutes,
    formatted: minutes < 1 ? '< 1 min' : `${minutes} min`,
    wordCount,
  };
}

/**
 * Get text statistics
 */
export function getTextStats(text) {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  
  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    characterCount: characters,
    characterCountNoSpaces: charactersNoSpaces,
    averageWordLength: (charactersNoSpaces / words.length).toFixed(1),
    averageSentenceLength: (words.length / sentences.length).toFixed(1),
  };
}

// Debounced version for real-time use
export const debouncedDetect = debounce(detectLanguage, 200);

export default {
  detectLanguage,
  detectScript,
  detectLanguageFromFile,
  getLanguageName,
  getLanguageCode,
  batchDetectLanguages,
  getCompatibleOCRLanguages,
  estimateReadingTime,
  getTextStats,
  debouncedDetect,
};

