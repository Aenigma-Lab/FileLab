/**
 * 🤖 Enhanced OCR Utility with Smart Language Detection
 * 
 * Features:
 * - Smart language detection with confidence scores
 * - Auto-detection with manual override option
 * - Multi-language suggestions with confidence bars
 * - Smart OCR extraction with fallback
 */

import axios from "axios";

// Get API base URL
const getBackendUrl = () => {
  const url = process.env.REACT_APP_BACKEND_URL;
  if (!url || url.trim() === '') {
    return '';
  }
  return url;
};

const BACKEND_URL = getBackendUrl();
const API = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";

/**
 * Get confidence level color
 */
export const getConfidenceColor = (confidence) => {
  if (confidence >= 80) return "text-green-500";
  if (confidence >= 50) return "text-yellow-500";
  if (confidence >= 30) return "text-orange-500";
  return "text-red-500";
};

/**
 * Get confidence level label
 */
export const getConfidenceLabel = (confidence) => {
  if (confidence >= 80) return "High";
  if (confidence >= 50) return "Medium";
  if (confidence >= 30) return "Low";
  return "Very Low";
};

/**
 * Get confidence level for display (with color and background)
 */
export const getConfidenceInfo = (confidence) => {
  if (confidence >= 80) {
    return {
      label: "High",
      color: "text-green-600",
      bgColor: "bg-green-100",
      borderColor: "border-green-300"
    };
  }
  if (confidence >= 50) {
    return {
      label: "Medium",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-300"
    };
  }
  if (confidence >= 30) {
    return {
      label: "Low",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      borderColor: "border-orange-300"
    };
  }
  return {
    label: "Very Low",
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-300"
  };
};

/**
 * Smart detect language using multi-stage analysis
 */
export const smartDetectLanguage = async (file, options = {}) => {
  const {
    showToast = true,
    onSuccess = () => {},
    onError = () => {}
  } = options;

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API}/ocr/detect-smart`, formData);
    
    if (response.data.success) {
      const detection = response.data.detection;
      
      onSuccess({
        primaryLanguage: detection.primary_language,
        languages: detection.languages,
        confidence: detection.confidence,
        confidenceLevel: detection.confidence_level,
        suggestedLanguages: detection.suggested_languages,
        script: detection.detected_script,
        suggestions: detection.suggestions,
        stages: detection.stages
      });
      
      return {
        success: true,
        data: detection
      };
    } else {
      throw new Error("Detection failed");
    }
  } catch (error) {
    console.error("Smart language detection failed:", error);
    onError(error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Smart OCR extract with auto-detection and fallback
 */
export const smartExtractTextOCR = async (file, preferredLanguage = null, options = {}) => {
  const {
    showToast = true,
    onSuccess = () => {},
    onError = () => {}
  } = options;

  try {
    const formData = new FormData();
    formData.append("file", file);
    if (preferredLanguage) {
      formData.append("preferred_language", preferredLanguage);
    }

    const response = await axios.post(`${API}/ocr/extract-smart`, formData);
    
    const result = response.data;
    
    if (result.success) {
      onSuccess(result);
      
      return {
        success: true,
        text: result.text,
        language: result.language,
        languageName: getLanguageName(result.language),
        confidence: result.language_confidence,
        detection: result.detection,
        suggestions: result.suggestions
      };
    } else {
      throw new Error(result.error || "OCR extraction failed");
    }
  } catch (error) {
    console.error("Smart OCR extraction failed:", error);
    onError(error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get language name from code
 */
export const getLanguageName = (code) => {
  const languageNames = {
    'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
    'pt': 'Portuguese', 'it': 'Italian', 'nl': 'Dutch', 'pl': 'Polish',
    'ru': 'Russian', 'uk': 'Ukrainian', 'bg': 'Bulgarian',
    'zh': 'Chinese', 'chi_sim': 'Chinese (Simplified)', 'chi_tra': 'Chinese (Traditional)',
    'ja': 'Japanese', 'ko': 'Korean', 'ar': 'Arabic',
    'hi': 'Hindi', 'bn': 'Bengali', 'ta': 'Tamil', 'te': 'Telugu',
    'mr': 'Marathi', 'ml': 'Malayalam', 'kn': 'Kannada', 'gu': 'Gujarati',
    'th': 'Thai', 'vi': 'Vietnamese', 'id': 'Indonesian', 'tr': 'Turkish',
    'el': 'Greek', 'he': 'Hebrew', 'cs': 'Czech', 'sv': 'Swedish',
    'da': 'Danish', 'fi': 'Finnish', 'hu': 'Hungarian', 'ro': 'Romanian',
  };
  
  return languageNames[code] || code?.toUpperCase() || 'Unknown';
};

/**
 * Format detection result for display
 */
export const formatDetectionResult = (detection) => {
  if (!detection) return null;
  
  return {
    script: detection.detected_script || 'Unknown',
    primaryLanguage: detection.primary_language ? {
      code: detection.primary_language.code,
      name: getLanguageName(detection.primary_language.code),
      confidence: parseFloat(detection.primary_language.confidence)
    } : null,
    confidence: detection.confidence || 0,
    confidenceLevel: detection.confidence_level || 'unknown',
    languages: (detection.languages || []).map(lang => ({
      code: lang.code,
      name: getLanguageName(lang.code),
      confidence: parseFloat(lang.confidence),
      isLikely: lang.is_likely,
      isHighConfidence: lang.is_high_confidence
    })),
    suggestions: detection.suggestions || [],
    stages: detection.stages || []
  };
};

export default {
  smartDetectLanguage,
  smartExtractTextOCR,
  getLanguageName,
  getConfidenceInfo,
  getConfidenceColor,
  getConfidenceLabel,
  formatDetectionResult
};


