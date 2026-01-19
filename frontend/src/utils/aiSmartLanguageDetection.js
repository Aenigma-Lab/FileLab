/**
 * 🤖 Smart Language Detection for OCR
 * 
 * Advanced language detection using multiple statistical methods:
 * - N-gram frequency analysis
 * - Character frequency patterns
 * - Script-based language mapping
 * - Confidence scoring with suggestions
 */

import { generateAIId } from './aiIndex';

/**
 * Language n-gram profiles (3-grams and 4-grams)
 * Higher scores = more likely for that language
 */
const LANGUAGE_NGRAMS = {
  // Latin Script Languages
  en: {
    ngrams3: ['the', 'and', 'ing', 'ion', 'tion', 'ent', 'for', 'hat', 'thi', 'was', 'with', 'are', 'his', 'her', 'was', 'not', 'tha', 'all', 'was'],
    ngrams4: ['tion', 'eing', 'that', 'with', 'ing', 'tion', 'ment', 'ther', 'from', 'have', 'this', 'which', 'would', 'there'],
    common: 'etaoinshrdlucmwfgypbvkxjq',
    articles: ['the', 'a', 'an']
  },
  es: {
    ngrams3: ['que', 'del', 'ión', 'los', 'las', 'con', 'por', 'para', 'una', 'los', 'des', 'ada', 'ión', 'tra', 'ent', 'res', 'con'],
    ngrams4: ['ción', 'ente', 'ión', 'para', 'ción', 'ques', 'tion', 'de la', 'del ', ' los', ' las'],
    common: 'eaosrnidlcpumtvgbqhfzñ',
    articles: ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas']
  },
  fr: {
    ngrams3: ['ion', 'ent', 'les', 'des', 'tion', 'ement', 'la', 'le', 'et', 'est', 'que', 'our', 'ait', 'ère', 'ion'],
    ngrams4: ['tion', 'ement', 'ques', 'ette', 'tion', 'ement', 'ière', 'onde', 'pour', 'dans'],
    common: 'esaitnrulodcpmévqfhgbzjàâäéèêëïîôùûüç',
    articles: ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'au']
  },
  de: {
    ngrams3: ['ung', 'sch', 'ich', 'den', 'die', 'und', 'ein', 'keit', 'lich', 'ten', 'gen', 'ung', 'rei', 'ung'],
    ngrams4: ['ung', 'sch', 'keit', 'lich', 'gen', 'heit', 'sung', 'sch', 'tion', 'dass'],
    common: 'enirstaudlgcmphobvfkzwjäöüß',
    articles: ['der', 'die', 'das', 'den', 'dem', 'ein', 'eine', 'einer', 'einem']
  },
  pt: {
    ngrams3: ['ção', 'men', 'de', 'que', 'os', 'as', 'por', 'com', 'não', 'para', 'ção', 'ent', 'res', 'ado'],
    ngrams4: ['ção', 'ente', 'ção', 'ques', 'dade', 'ção', 'ento', 'ação', ' para'],
    common: 'aãêéíõóúâôç',
    articles: ['o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da']
  },
  it: {
    ngrams3: ['ione', 'zione', 'are', 'ere', 'ire', 'gli', 'che', 'per', 'una', 'del', 'ion', 'zione'],
    ngrams4: ['ione', 'zione', 'zione', 'ione', 'zione', 'ente', 'ione', 'amento'],
    common: 'aeiouilndrstcmopgvbzfqhkjxwy',
    articles: ['il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'una', 'uno']
  },
  nl: {
    ngrams3: ['gen', 'en ', 'de ', 'ing', 'end', 'ver', 'een', 'et ', 'ie ', 'ing', 'sch'],
    ngrams4: ['ende', 'ingen', 'egen', 'atie', 'esch', 'heid', 'ing'],
    common: 'enatidorhsvlkgcmbpwjzfquxy',
    articles: ['de', 'het', 'een', 'de ', 'het ', 'een']
  },
  pl: {
    ngrams3: ['nie', 'ie ', 'ów ', 'eni', 'ego', 'ej ', 'cji', 'ał ', 'ony', 'ać'],
    ngrams4: ['enie', 'acji', 'owsk', 'stwo', 'enia', 'ności'],
    common: 'aąbcćdeęfghijklłmnńoóprsśtuwyźż',
    articles: ['ten', 'ta', 'to', 'te', 'tych', 'tą', 'tym']
  },
  ru: {
    ngrams3: ['ов ', 'овн', 'ани', ' ен', 'ии', 'ост', 'тел', 'ьн', 'про', 'стр', 'ова', 'ени'],
    ngrams4: ['ова', 'ений', 'ство', 'ова', 'нной', 'рован'],
    common: 'оеаинтрслвпдмкругбзчйхцшщъыьэюя',
    articles: ['в', 'на', 'с', 'по', 'за', 'из', 'к', 'о', 'от', 'до']
  },
  // CJK Languages
  zh: {
    ngrams3: ['的', '是', '了', '不', '在', '人', '有', '我', '这', '个', '们', '来', '上', '大', '为', '和', '国'],
    ngrams4: ['的是', '不了', '我在', '人们', '这个', '我们', '中国', '是的'],
    common: '的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面',
    is_cjk: true
  },
  ja: {
    ngrams3: ['の', 'に', 'は', 'を', 'た', 'で', 'が', 'と', 'し', 'て', 'いる', 'です', 'ある', 'こと'],
    ngrams4: ['ので', 'には', 'と ', 'で ', 'は ', 'ので', 'に ', 'の '],
    common: 'のいうはれたりでがくとそしめた',
    is_cjk: true
  },
  ko: {
    ngrams3: ['의', '이', '에', '는', '을', '가', '하', '고', ' 있', ' 수', '는 ', '으로', '에서'],
    ngrams4: ['있는', '에서', '으로', '하는', '것이', '있습니다', '입니다'],
    common: '이다omethaneointusrclhkpgybvqxfzwj',
    is_cjk: true
  },
  // Arabic/Persian
  ar: {
    ngrams3: ['ال', ' في', ' لا', ' على', ' من', ' إنه', ' مع', ' عن', ' ذلك', ' هذا', 'ال ', ' في '],
    ngrams4: ['التي', 'الذي', 'الة', ' على ', ' في ال', ' من ', 'ذلك'],
    common: 'الطريقةالعربيةفيمنهعلى',
    is_rtl: true,
    articles: ['ال', 'في', 'على', 'من', 'إلى', 'عن', 'مع']
  },
  // Indic Scripts
  hi: {
    ngrams3: ['ी', 'ा', 'े', 'ो', 'न', 'र', 'है', 'से', 'क', 'लि', 'ति', 'ना', 'हो', 'का'],
    ngrams4: ['हैं', 'था', 'होगा', 'करने', 'किए', 'जो ', 'ने ', 'से '],
    common: 'करणस्थपतिव्यक्तजनस्वदेभभगौकवनयदरथकपालमनमुशकि',
    is_indic: true
  },
  bn: {
    ngrams3: ['র', 'ে', 'া', 'ি', 'ন', 'ক', 'ত', 'স', 'এ', 'ই', 'য', 'দ', 'ব', 'প'],
    ngrams4: ['করে', 'হয়', 'সেই', 'এই ', 'আর', 'তার', 'কিন্তু'],
    common: 'েররাজনীতিআমাদেরদেশেসমাজসংস্কারপ্রশ্ন',
    is_indic: true
  },
  ta: {
    ngrams3: ['து', 'க்', 'து', 'ரு', 'ன ', 'கு', 'ல்', 'ன்', 'த்', 'ி', 'ா', 'ை', 'ோ'],
    ngrams4: ['க்கு', 'து', 'இது', 'அது', 'உங்கள்', 'என்று'],
    common: 'குதமில்ரன்றின்சுத்தும்படியாய்ப்பொறுத்து',
    is_indic: true
  },
};

/**
 * Script detection patterns for initial screening
 */
const SCRIPT_PATTERNS = {
  latin: /[a-zA-Zà-ÿÀ-ß]/,
  cyrillic: /[а-яА-ЯёЁ]/,
  cjk: /[\u4e00-\u9fff\u3400-\u4dbf]/,
  japanese_hiragana: /[\u3040-\u309f]/,
  japanese_katakana: /[\u30a0-\u30ff]/,
  korean: /[가-힣]/,
  arabic: /[\u0600-\u06ff\u0750-\u077f]/,
  devanagari: /[\u0900-\u097f]/,
  bengali: /[\u0980-\u09ff]/,
  tamil: /[\u0b80-\u0bff]/,
  thai: /[\u0e00-\u0e7f]/,
  greek: /[\u0370-\u03ff]/,
  hebrew: /[\u0590-\u05ff]/,
};

/**
 * Script to language mapping
 */
const SCRIPT_TO_LANGUAGES = {
  latin: ['en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'pl', 'cs', 'da', 'fi', 'hu', 'ro', 'sk', 'sl', 'sv', 'tr', 'vi', 'id', 'ca', 'eu', 'gl', 'lt', 'lv', 'et', 'mt'],
  cyrillic: ['ru', 'ukr', 'bul', 'bel', 'srp', 'mkd', 'kaz', 'uzb', 'tgk', 'kir', 'mon'],
  cjk: ['chi_sim', 'chi_tra'],
  japanese_hiragana: ['jpn'],
  japanese_katakana: ['jpn'],
  korean: ['kor'],
  arabic: ['ara', 'fas', 'urd', 'pus', 'div', 'snd'],
  devanagari: ['hin', 'mar', 'nep', 'san', 'bod', 'kas', 'mai'],
  bengali: ['ben', 'asm'],
  tamil: ['tam'],
  thai: ['tha'],
  greek: ['ell'],
  hebrew: ['heb'],
};

/**
 * Extended language names mapping
 */
const LANGUAGE_NAMES = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German',
  pt: 'Portuguese', it: 'Italian', nl: 'Dutch', pl: 'Polish',
  ru: 'Russian', ukr: 'Ukrainian', bul: 'Bulgarian', bel: 'Belarusian',
  zh: 'Chinese', chi_sim: 'Chinese (Simplified)', chi_tra: 'Chinese (Traditional)',
  ja: 'Japanese', ko: 'Korean', ar: 'Arabic', fa: 'Persian',
  hi: 'Hindi', bn: 'Bengali', ta: 'Tamil', te: 'Telugu',
  mr: 'Marathi', ml: 'Malayalam', kn: 'Kannada', gu: 'Gujarati',
  th: 'Thai', vi: 'Vietnamese', id: 'Indonesian', tr: 'Turkish',
  el: 'Greek', he: 'Hebrew', cs: 'Czech', sv: 'Swedish',
  da: 'Danish', fi: 'Finnish', hu: 'Hungarian', ro: 'Romanian',
  sk: 'Slovak', sl: 'Slovenian', hr: 'Croatian', bg: 'Bulgarian',
  uk: 'Ukrainian', no: 'Norwegian', ca: 'Catalan', eu: 'Basque',
  gl: 'Galician', lt: 'Lithuanian', lv: 'Latvian', et: 'Estonian',
  sq: 'Albanian', mk: 'Macedonian', sr: 'Serbian', cy: 'Welsh',
  ga: 'Irish', mt: 'Maltese', is: 'Icelandic', sw: 'Swahili',
  af: 'Afrikaans', mg: 'Malagasy', swa: 'Swahili', fas: 'Persian',
  urd: 'Urdu', pus: 'Pashto', div: 'Dhivehi', snd: 'Sindhi',
  san: 'Sanskrit', nep: 'Nepali', asm: 'Assamese', bod: 'Tibetan',
  kas: 'Kashmiri', mai: 'Maithili', orm: 'Oromo', amh: 'Amharic',
  tir: 'Tigrinya', som: 'Somali', lug: 'Luganda', lin: 'Lingala',
};

/**
 * Detect script type from text
 * @param {string} text - Text to analyze
 * @returns {string} - Detected script type
 */
export function detectScript(text) {
  for (const [script, regex] of Object.entries(SCRIPT_PATTERNS)) {
    if (regex.test(text)) {
      return script;
    }
  }
  return 'unknown';
}

/**
 * Calculate n-gram frequency score for a language
 * @param {string} text - Text to analyze
 * @param {string} lang - Language code
 * @returns {number} - Score (0-100)
 */
function calculateNGramScore(text, lang) {
  const langData = LANGUAGE_NGRAMS[lang];
  if (!langData) return 0;
  
  const textLower = text.toLowerCase();
  let score = 0;
  let matches = 0;
  
  // Check 3-grams
  for (const ngram of langData.ngrams3) {
    const regex = new RegExp(ngram.toLowerCase(), 'g');
    const count = (textLower.match(regex) || []).length;
    if (count > 0) {
      score += count;
      matches++;
    }
  }
  
  // Check 4-grams (weighted more)
  for (const ngram of langData.ngrams4) {
    const regex = new RegExp(ngram.toLowerCase(), 'g');
    const count = (textLower.match(regex) || []).length;
    if (count > 0) {
      score += count * 1.5;
      matches++;
    }
  }
  
  // Check for articles (if applicable)
  if (langData.articles) {
    for (const article of langData.articles) {
      const regex = new RegExp(`\\b${article}\\b`, 'g');
      const count = (textLower.match(regex) || []).length;
      if (count > 0) {
        score += count * 0.5;
      }
    }
  }
  
  return score;
}

/**
 * Calculate character frequency match score
 * @param {string} text - Text to analyze
 * @param {string} lang - Language code
 * @returns {number} - Score (0-100)
 */
function calculateCharScore(text, lang) {
  const langData = LANGUAGE_NGRAMS[lang];
  if (!langData || !langData.common) return 0;
  
  const textLower = text.toLowerCase();
  const langChars = langData.common.toLowerCase();
  let matchCount = 0;
  let totalChars = 0;
  
  for (const char of textLower) {
    if (/[a-zA-Z]/.test(char) || /[\u0400-\u04ff]/.test(char) || /[\u4e00-\u9fff]/.test(char)) {
      if (langChars.includes(char)) {
        matchCount++;
      }
      totalChars++;
    }
  }
  
  return totalChars > 0 ? (matchCount / totalChars) * 100 : 0;
}

/**
 * Extract unique characters for script verification
 * @param {string} text - Text to analyze
 * @returns {Set} - Set of unique characters
 */
function extractUniqueChars(text) {
  const chars = new Set();
  for (const char of text) {
    if (char.trim()) {
      chars.add(char);
    }
  }
  return chars;
}

/**
 * Check for language-specific diacritics and special characters
 * @param {string} text - Text to analyze
 * @param {string} lang - Language code
 * @returns {number} - Score (0-100)
 */
function checkDiacritics(text, lang) {
  const diacriticMap = {
    en: ['\u0027', '\u002E', '\u002C'],
    fr: ['\u00E9', '\u00E0', '\u00E8', '\u00EA', '\u00EB', '\u00EE', '\u00EF', '\u00F4', '\u00F9', '\u00FB', '\u00E7', '\u00E2'],
    de: ['\u00E4', '\u00F6', '\u00FC', '\u00DF', '\u00C4', '\u00D6', '\u00DC'],
    es: ['\u00F1', '\u00E1', '\u00E9', '\u00ED', '\u00F3', '\u00FA', '\u00E8', '\u00EC', '\u00F2', '\u00F9', '\u00E0'],
    pt: ['\u00E3', '\u00E1', '\u00E9', '\u00ED', '\u00F3', '\u00FA', '\u00E7', '\u00F4', '\u00FC'],
    pl: ['\u0105', '\u0107', '\u0119', '\u0117', '\u0142', '\u0144', '\u00F3', '\u00B3', '\u017C', '\u017A', '\u015B'],
    ru: ['\u0430', '\u0431', '\u0432', '\u0433', '\u0434', '\u0435', '\u0436', '\u0437', '\u0438', '\u0439'],
    ar: ['\u0627', '\u0628', '\u062A', '\u062B', '\u062C', '\u062D', '\u062E', '\u062F', '\u0630'],
  };
  
  const langDiacritics = diacriticMap[lang] || [];
  if (langDiacritics.length === 0) return 50; // Neutral score for languages without special diacritics
  
  let foundCount = 0;
  for (const diacritic of langDiacritics) {
    if (text.includes(diacritic)) {
      foundCount++;
    }
  }
  
  return Math.min((foundCount / langDiacritics.length) * 100, 100);
}

/**
 * Main smart language detection function
 * @param {string} text - Text to analyze
 * @param {Object} options - Detection options
 * @returns {Object} - Detection result
 */
export function smartDetectLanguage(text, options = {}) {
  const {
    maxResults = 5,
    minConfidence = 10,
    availableLanguages = null,
  } = options;
  
  const result = {
    id: generateAIId(),
    timestamp: new Date().toISOString(),
    textLength: text.length,
    sampleText: text.slice(0, 200),
    detectedScript: detectScript(text),
    languages: [],
    primaryLanguage: null,
    confidence: 0,
    suggestions: [],
    metadata: {
      method: 'multi-stage',
      stages: ['script_detection', 'ngram_analysis', 'character_frequency', 'diacritic_check'],
    },
  };
  
  if (!text || text.trim().length < 3) {
    result.error = 'Text too short for reliable detection';
    result.suggestions = ['Provide more text for better accuracy'];
    return result;
  }
  
  // Get candidate languages based on script
  let candidateLangs = SCRIPT_TO_LANGUAGES[result.detectedScript] || [];
  
  // If specific languages are available, filter candidates
  if (availableLanguages && availableLanguages.length > 0) {
    const availableSet = new Set(availableLanguages.map(l => l.toLowerCase()));
    candidateLangs = candidateLangs.filter(lang => availableSet.has(lang.toLowerCase()));
  }
  
  // If no script-based candidates, try all known languages
  if (candidateLangs.length === 0) {
    candidateLangs = Object.keys(LANGUAGE_NGRAMS);
  }
  
  // Calculate scores for each candidate language
  const langScores = {};
  
  for (const lang of candidateLangs) {
    const ngramScore = calculateNGramScore(text, lang);
    const charScore = calculateCharScore(text, lang);
    const diacriticScore = checkDiacritics(text, lang);
    
    // Weighted combination
    const totalScore = (ngramScore * 0.5) + (charScore * 0.3) + (diacriticScore * 0.2);
    
    langScores[lang] = {
      ngram: ngramScore,
      char: charScore,
      diacritic: diacriticScore,
      total: totalScore,
    };
  }
  
  // Sort languages by score
  const sortedLangs = Object.entries(langScores)
    .sort((a, b) => b[1].total - a[1].total)
    .filter(([lang, scores]) => scores.total > minConfidence);
  
  // Build results
  result.languages = sortedLangs.slice(0, maxResults).map(([lang, scores], index) => {
    const confidencePercent = Math.min(scores.total, 99.9);
    return {
      code: lang,
      name: LANGUAGE_NAMES[lang] || lang.toUpperCase(),
      confidence: confidencePercent.toFixed(1),
      rank: index + 1,
      breakdown: {
        ngramScore: scores.ngram.toFixed(2),
        charScore: scores.char.toFixed(1),
        diacriticScore: scores.diacritic.toFixed(1),
      },
      isLikely: confidencePercent > 50,
      isHighConfidence: confidencePercent > 80,
    };
  });
  
  // Set primary language
  if (result.languages.length > 0) {
    result.primaryLanguage = result.languages[0];
    result.confidence = parseFloat(result.languages[0].confidence);
  }
  
  // Generate suggestions
  if (result.detectedScript === 'cjk' || result.detectedScript === 'korean') {
    result.suggestions = ['Consider using script-specific OCR models for best results'];
  } else if (result.confidence > 80) {
    result.suggestions = ['High confidence detection - OCR should work well'];
  } else if (result.confidence > 50) {
    result.suggestions = ['Medium confidence - you may want to manually verify language selection'];
  } else if (result.confidence > 30) {
    result.suggestions = ['Low confidence - consider trying multiple languages'];
  } else {
    result.suggestions = ['Very low confidence - text may be short or contain mixed languages'];
  }
  
  // Check for potential mixed languages
  if (result.languages.length >= 2 && result.languages[1].confidence > result.confidence * 0.7) {
    result.suggestions.push(`Possible mixed content - also detected ${result.languages[1].name}`);
  }
  
  return result;
}

/**
 * Batch detect languages for multiple texts
 * @param {string[]} texts - Array of texts to analyze
 * @param {Object} options - Detection options
 * @returns {Object[]} - Array of detection results
 */
export function batchSmartDetect(texts, options = {}) {
  return texts.map((text, index) => ({
    ...smartDetectLanguage(text, options),
    textIndex: index,
  }));
}

/**
 * Get compatible OCR language codes for detected language
 * @param {string} langCode - Detected language code
 * @returns {string[]} - Array of Tesseract-compatible language codes
 */
export function getOCRLanguages(langCode) {
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
    bn: ['ben'],
    ta: ['tam'],
    te: ['tel'],
    mr: ['mar'],
    ml: ['mal'],
    kn: ['kan'],
    gu: ['guj'],
    th: ['tha'],
    vi: ['vie'],
    id: ['ind'],
    tr: ['tur'],
    el: ['ell'],
    he: ['heb'],
    cs: ['ces'],
    sv: ['swe'],
    da: ['dan'],
    fi: ['fin'],
    hu: ['hun'],
    ro: ['ron'],
    pl: ['pol'],
    uk: ['ukr'],
  };
  
  return ocrMapping[langCode] || ['eng'];
}

/**
 * Get confidence level label
 * @param {number} confidence - Confidence score (0-100)
 * @returns {string} - Confidence level label
 */
export function getConfidenceLevel(confidence) {
  if (confidence >= 80) return 'high';
  if (confidence >= 50) return 'medium';
  if (confidence >= 30) return 'low';
  return 'very_low';
}

/**
 * Format detection result for display
 * @param {Object} result - Detection result
 * @returns {Object} - Formatted result for UI
 */
export function formatForDisplay(result) {
  return {
    ...result,
    primaryDisplay: result.primaryLanguage ? {
      code: result.primaryLanguage.code,
      name: result.primaryLanguage.name,
      confidence: `${result.primaryLanguage.confidence}%`,
      level: getConfidenceLevel(result.confidence),
    } : null,
    alternatives: result.languages.slice(1).map(lang => ({
      code: lang.code,
      name: lang.name,
      confidence: `${lang.confidence}%`,
    })),
    scriptLabel: result.detectedScript.charAt(0).toUpperCase() + result.detectedScript.slice(1),
  };
}

/**
 * Quick detect - fast single-language detection
 * @param {string} text - Text to analyze
 * @returns {Object} - Simple detection result
 */
export function quickDetect(text) {
  const result = smartDetectLanguage(text);
  return {
    language: result.primaryLanguage?.code || 'unknown',
    confidence: result.confidence,
    script: result.detectedScript,
  };
}

export default {
  detectScript,
  smartDetectLanguage,
  batchSmartDetect,
  getOCRLanguages,
  getConfidenceLevel,
  formatForDisplay,
  quickDetect,
  LANGUAGE_NGRAMS,
  SCRIPT_PATTERNS,
  SCRIPT_TO_LANGUAGES,
  LANGUAGE_NAMES,
};

