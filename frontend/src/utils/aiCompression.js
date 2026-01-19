/**
 * 🤖 AI Compression
 * 
 * Smart compression recommendations based on file content
 * and optimal quality/size balance.
 */

import { generateAIId } from './aiIndex';

/**
 * Compression presets
 */
export const COMPRESSION_PRESETS = {
  minimum: {
    name: 'Minimum Compression',
    description: 'Best quality, largest file',
    compressionLevel: 1,
    quality: 1.0,
    optimization: 'quality',
  },
  low: {
    name: 'Low Compression',
    description: 'High quality, moderate size',
    compressionLevel: 5,
    quality: 0.9,
    optimization: 'balanced',
  },
  medium: {
    name: 'Medium Compression',
    description: 'Balanced quality and size',
    compressionLevel: 7,
    quality: 0.8,
    optimization: 'balanced',
  },
  high: {
    name: 'High Compression',
    description: 'Lower quality, smaller file',
    compressionLevel: 9,
    quality: 0.6,
    optimization: 'size',
  },
  maximum: {
    name: 'Maximum Compression',
    description: 'Smallest file, lowest quality',
    compressionLevel: 10,
    quality: 0.4,
    optimization: 'size',
  },
};

/**
 * File type compression strategies
 */
export const COMPRESSION_STRATEGIES = {
  pdf: {
    methods: ['recompress', 'ghostscript', 'linearize'],
    recommendedPreset: 'medium',
    minSizeReduction: 0.2,
    maxSizeReduction: 0.8,
    lossless: true,
  },
  image: {
    methods: ['resize', 'format_conversion', 'quality_reduction'],
    recommendedPreset: 'medium',
    minSizeReduction: 0.3,
    maxSizeReduction: 0.9,
    lossless: false,
  },
  document: {
    methods: ['zip', 'remove_metadata'],
    recommendedPreset: 'medium',
    minSizeReduction: 0.1,
    maxSizeReduction: 0.5,
    lossless: true,
  },
  archive: {
    methods: ['solid_archive', 'dictionary_size'],
    recommendedPreset: 'high',
    minSizeReduction: 0.05,
    maxSizeReduction: 0.3,
    lossless: true,
  },
  video: {
    methods: ['bitrate_reduction', 'resolution_reduction', 'codec_optimization'],
    recommendedPreset: 'high',
    minSizeReduction: 0.4,
    maxSizeReduction: 0.9,
    lossless: false,
  },
  audio: {
    methods: ['bitrate_reduction', 'codec_optimization'],
    recommendedPreset: 'medium',
    minSizeReduction: 0.3,
    maxSizeReduction: 0.8,
    lossless: false,
  },
};

/**
 * Analyze file for compression potential
 */
export function analyzeCompressionPotential(file) {
  const result = {
    id: generateAIId(),
    timestamp: new Date().toISOString(),
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
    },
    analysis: null,
    recommendations: [],
    error: null,
  };
  
  try {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const sizeKB = file.size / 1024;
    const sizeMB = sizeKB / 1024;
    
    // Detect file type
    let fileType = detectFileType(file);
    const strategy = COMPRESSION_STRATEGIES[fileType] || COMPRESSION_STRATEGIES.document;
    
    // Analyze compression potential
    const analysis = {
      fileType,
      strategy,
      currentSizeKB: sizeKB,
      currentSizeMB: sizeMB,
      estimatedMinSize: sizeKB * (1 - strategy.maxSizeReduction),
      estimatedMaxSize: sizeKB * (1 - strategy.minSizeReduction),
      recommendedPreset: strategy.recommendedPreset,
      isAlreadyCompressed: isAlreadyCompressed(file),
      hasRedundantData: hasRedundantData(file),
    };
    
    result.analysis = analysis;
    
    // Generate recommendations
    if (analysis.isAlreadyCompressed) {
      result.recommendations.push({
        type: 'warning',
        message: 'File appears to already be compressed. Further compression may have minimal effect.',
        priority: 'low',
      });
    }
    
    if (sizeMB > 50) {
      result.recommendations.push({
        type: 'size_warning',
        message: 'Large file detected - consider splitting or reducing quality',
        priority: 'high',
      });
    }
    
    if (strategy.lossless) {
      result.recommendations.push({
        type: 'info',
        message: 'Lossless compression available - no quality loss',
        priority: 'low',
      });
    } else {
      result.recommendations.push({
        type: 'warning',
        message: 'Compression may result in quality loss. Preview recommended.',
        priority: 'medium',
      });
    }
    
    // Add format-specific suggestions
    if (fileType === 'image') {
      if (['.png'].includes(ext)) {
        result.recommendations.push({
          type: 'suggestion',
          message: 'Converting PNG to WebP could reduce size by up to 30%',
          priority: 'medium',
        });
      }
    }
    
    if (fileType === 'pdf') {
      result.recommendations.push({
        type: 'suggestion',
        message: 'Linearizing PDF can improve loading speed in browsers',
        priority: 'low',
      });
    }
    
  } catch (error) {
    result.error = error.message;
    console.error('Compression analysis error:', error);
  }
  
  return result;
}

/**
 * Detect file type
 */
function detectFileType(file) {
  const mimeType = file.type || '';
  const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
  
  if (mimeType.includes('pdf') || ext === '.pdf') return 'pdf';
  if (mimeType.includes('image') || ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)) return 'image';
  if (mimeType.includes('word') || ['.doc', '.docx'].includes(ext)) return 'document';
  if (mimeType.includes('zip') || ['.zip', '.rar', '.7z'].includes(ext)) return 'archive';
  if (mimeType.includes('video') || ['.mp4', '.avi', '.mov'].includes(ext)) return 'video';
  if (mimeType.includes('audio') || ['.mp3', '.wav', '.ogg'].includes(ext)) return 'audio';
  
  return 'document';
}

/**
 * Check if file is already compressed
 */
function isAlreadyCompressed(file) {
  const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
  
  // Archives are already compressed
  if (['.zip', '.rar', '.7z', '.gz', '.bz2'].includes(ext)) {
    return true;
  }
  
  // Check file size vs content ratio
  // This is a simple heuristic
  const sizeKB = file.size / 1024;
  
  // JPEG and MP3 have high compression ratios
  if (['.jpg', '.jpeg', '.mp3'].includes(ext)) {
    return true;
  }
  
  return false;
}

/**
 * Check for redundant data in file
 */
function hasRedundantData(file) {
  const sizeKB = file.size / 1024;
  const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
  
  // Large images may have metadata
  if (['.png', '.jpg', '.jpeg', '.tiff'].includes(ext) && sizeKB > 2000) {
    return true;
  }
  
  // PDFs with images may have redundant image data
  if (ext === '.pdf' && sizeKB > 5000) {
    return true;
  }
  
  return false;
}

/**
 * Get compression recommendation
 */
export function getCompressionRecommendation(file, options = {}) {
  const { targetSizeKB, preserveQuality = false } = options;
  
  const analysis = analyzeCompressionPotential(file);
  const { analysis: data } = analysis;
  
  if (!data) {
    return null;
  }
  
  let recommendedPreset = data.recommendedPreset;
  
  // Adjust based on target size
  if (targetSizeKB) {
    const currentSizeKB = data.currentSizeKB;
    const sizeRatio = targetSizeKB / currentSizeKB;
    
    if (sizeRatio < 0.3) {
      recommendedPreset = 'maximum';
    } else if (sizeRatio < 0.5) {
      recommendedPreset = 'high';
    } else if (sizeRatio < 0.7) {
      recommendedPreset = 'medium';
    }
  }
  
  // Don't reduce quality if requested
  if (preserveQuality && ['high', 'maximum'].includes(recommendedPreset)) {
    recommendedPreset = 'medium';
  }
  
  const preset = COMPRESSION_PRESETS[recommendedPreset];
  
  return {
    preset: recommendedPreset,
    ...preset,
    estimatedSize: Math.round(data.currentSizeKB * (1 - preset.compressionLevel / 12)),
    estimatedReduction: `${Math.round((1 - preset.compressionLevel / 12) * 100)}%`,
  };
}

/**
 * Estimate compression results
 */
export function estimateCompressionResults(file, preset) {
  const settings = COMPRESSION_STRATEGIES[preset] || COMPRESSION_STRATEGIES.medium;
  const compressionRatio = 1 - (settings.compressionLevel / 12);
  
  const originalSize = file.size;
  const estimatedSize = Math.round(originalSize * compressionRatio);
  const savedBytes = originalSize - estimatedSize;
  
  return {
    originalSize,
    estimatedSize,
    savedBytes,
    savedPercentage: Math.round((savedBytes / originalSize) * 100),
    compressionLevel: settings.compressionLevel,
    quality: settings.quality,
  };
}

/**
 * Get best compression method for file type
 */
export function getBestCompressionMethod(fileType) {
  const strategy = COMPRESSION_STRATEGIES[fileType];
  
  if (!strategy) {
    return {
      method: 'generic',
      description: 'Standard compression',
      supported: true,
    };
  }
  
  return {
    method: strategy.methods[0],
    description: `Best for ${fileType} files`,
    supported: true,
    lossless: strategy.lossless,
  };
}

/**
 * Batch analyze multiple files
 */
export function batchAnalyzeCompression(files) {
  return files.map(file => analyzeCompressionPotential(file));
}

/**
 * Format bytes for display
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default {
  COMPRESSION_PRESETS,
  COMPRESSION_STRATEGIES,
  analyzeCompressionPotential,
  getCompressionRecommendation,
  estimateCompressionResults,
  getBestCompressionMethod,
  batchAnalyzeCompression,
  formatBytes,
};

