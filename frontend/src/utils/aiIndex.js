/**
 * 🤖 AI-Powered FileLab - Central AI Index
 * 
 * This is the main entry point for all AI-powered features.
 * Import any AI utility from this central module.
 */

// AI Search & Discovery
export * from './aiSearch';
export * from './aiSmartDetection';

// File Analysis & Detection
export * from './aiAutoFormat';
export * from './aiLanguageDetection';
export * from './aiFileOrganization';

// Image AI
export * from './aiImageOptimization';
export * from './aiCompression';

// Document AI
export * from './aiDocumentAI';
export * from './aiSmartWatermark';
export * from './aiOcrEnhancement';

// Search & Analysis
export * from './aiSemanticSearch';

// ============================================
// AI Service Configuration
// ============================================

export const AI_CONFIG = {
  // Confidence thresholds
  CONFIDENCE_THRESHOLD: 0.7,
  HIGH_CONFIDENCE: 0.9,
  MEDIUM_CONFIDENCE: 0.7,
  LOW_CONFIDENCE: 0.5,
  
  // Feature flags
  FEATURES: {
    SMART_DETECTION: true,
    AUTO_FORMAT: true,
    IMAGE_OPTIMIZATION: true,
    DOCUMENT_AI: true,
    SMART_WATERMARK: true,
    OCR_ENHANCEMENT: true,
    SEMANTIC_SEARCH: true,
    FILE_ORGANIZATION: true,
    COMPRESSION: true,
    LANGUAGE_DETECTION: true,
  },
  
  // Performance settings
  PERFORMANCE: {
    MAX_FILE_SIZE_MB: 50,
    PROCESSING_TIMEOUT_MS: 30000,
    CACHE_DURATION_MINUTES: 30,
  },
  
  // AI model settings
  MODELS: {
    DEFAULT: 'standard',
    ADVANCED: 'advanced',
    FAST: 'fast',
  },
};

// ============================================
// AI Utility Functions
// ============================================

/**
 * Check if AI features are enabled
 */
export const isAIFeatureEnabled = (feature) => {
  return AI_CONFIG.FEATURES[feature] ?? false;
};

/**
 * Get confidence level label
 */
export const getConfidenceLabel = (score) => {
  if (score >= AI_CONFIG.HIGH_CONFIDENCE) return 'Very High';
  if (score >= AI_CONFIG.MEDIUM_CONFIDENCE) return 'High';
  if (score >= AI_CONFIG.LOW_CONFIDENCE) return 'Medium';
  return 'Low';
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Debounce utility for AI operations
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle utility for AI operations
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Calculate processing time estimate
 */
export const estimateProcessingTime = (fileSize, operation) => {
  const sizeMB = fileSize / (1024 * 1024);
  const timePerMB = {
    'convert': 0.5,
    'ocr': 2,
    'compress': 0.3,
    'merge': 0.2,
    'split': 0.2,
    'watermark': 0.4,
    'search': 0.1,
    'optimize': 1,
  };
  
  const baseTime = timePerMB[operation] || 0.5;
  return Math.ceil(sizeMB * baseTime);
};

/**
 * Generate unique ID for AI operations
 */
export const generateAIId = () => {
  return `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * AI Operation Status Types
 */
export const AI_STATUS = {
  IDLE: 'idle',
  ANALYZING: 'analyzing',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error',
  CANCELLED: 'cancelled',
};

/**
 * Create AI operation context
 */
export const createAIOperation = (type, data = {}) => ({
  id: generateAIId(),
  type,
  status: AI_STATUS.IDLE,
  progress: 0,
  confidence: 0,
  result: null,
  error: null,
  timestamp: Date.now(),
  ...data,
});

/**
 * Format time remaining for display
 */
export const formatTimeRemaining = (seconds) => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
};

/**
 * Get recommended operation based on file type
 */
export const getRecommendedOperations = (fileType) => {
  const operationMap = {
    pdf: ['convert', 'ocr', 'merge', 'split', 'watermark', 'compress', 'search'],
    image: ['convert', 'optimize', 'compress', 'ocr'],
    document: ['convert', 'compress'],
    archive: ['extract', 'compress'],
    presentation: ['convert', 'compress'],
    spreadsheet: ['convert', 'compress'],
  };
  
  return operationMap[fileType] || ['convert', 'compress'];
};

/**
 * AI Feature metadata
 */
export const AI_FEATURES = {
  SMART_DETECTION: {
    name: 'Smart Detection',
    description: 'Automatically detect the best operation for your file',
    icon: '🧠',
    category: 'discovery',
  },
  AUTO_FORMAT: {
    name: 'Auto Format Detection',
    description: 'Detect file format from content, not just extension',
    icon: '🔍',
    category: 'analysis',
  },
  IMAGE_OPTIMIZATION: {
    name: 'AI Image Optimization',
    description: 'Intelligently optimize images for best quality/size ratio',
    icon: '🎨',
    category: 'image',
  },
  DOCUMENT_AI: {
    name: 'Document Analysis',
    description: 'Analyze and understand document content',
    icon: '📄',
    category: 'document',
  },
  SMART_WATERMARK: {
    name: 'Smart Watermark',
    description: 'AI-generated watermark recommendations',
    icon: '✍️',
    category: 'pdf',
  },
  OCR_ENHANCEMENT: {
    name: 'Enhanced OCR',
    description: 'Context-aware text extraction with smart corrections',
    icon: '📝',
    category: 'ocr',
  },
  SEMANTIC_SEARCH: {
    name: 'Semantic Search',
    description: 'Search by meaning, not just keywords',
    icon: '🔎',
    category: 'search',
  },
  FILE_ORGANIZATION: {
    name: 'Smart Organization',
    description: 'AI-powered file categorization and organization',
    icon: '📁',
    category: 'organization',
  },
  COMPRESSION: {
    name: 'Smart Compression',
    description: 'Intelligent compression with quality preservation',
    icon: '📦',
    category: 'optimization',
  },
  LANGUAGE_DETECTION: {
    name: 'Language Detection',
    description: 'Automatically detect document language',
    icon: '🌍',
    category: 'analysis',
  },
};

export default {
  AI_CONFIG,
  AI_STATUS,
  AI_FEATURES,
  isAIFeatureEnabled,
  getConfidenceLabel,
  formatFileSize,
  debounce,
  throttle,
  estimateProcessingTime,
  generateAIId,
  createAIOperation,
  formatTimeRemaining,
  getRecommendedOperations,
};

