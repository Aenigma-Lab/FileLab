/**
 * 🤖 AI Image Optimization
 * 
 * Intelligently optimizes images using AI-based compression
 * and format recommendations.
 */

import { generateAIId, debounce } from './aiIndex';

/**
 * Image quality presets for different use cases
 */
export const IMAGE_PRESETS = {
  web: {
    name: 'Web Optimized',
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    format: 'webp',
    targetSizeKB: 200,
  },
  social: {
    name: 'Social Media',
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.85,
    format: 'jpeg',
    targetSizeKB: 500,
  },
  print: {
    name: 'Print Quality',
    maxWidth: null,
    maxHeight: null,
    quality: 1.0,
    format: 'png',
    targetSizeKB: null,
  },
  thumbnail: {
    name: 'Thumbnail',
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.7,
    format: 'jpeg',
    targetSizeKB: 50,
  },
  email: {
    name: 'Email Attachment',
    maxWidth: 800,
    maxHeight: 600,
    quality: 0.75,
    format: 'jpeg',
    targetSizeKB: 100,
  },
  archive: {
    name: 'Archive (Max Compression)',
    maxWidth: null,
    maxHeight: null,
    quality: 0.6,
    format: 'webp',
    targetSizeKB: null,
  },
};

/**
 * Get image dimensions
 * @param {File} file - Image file
 * @returns {Promise<Object>} - Image dimensions
 */
export function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
        orientation: img.naturalWidth >= img.naturalHeight ? 'landscape' : 'portrait',
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Analyze image content for smart optimization
 * @param {ImageData} imageData - Canvas image data
 * @returns {Object} - Analysis result
 */
export function analyzeImageContent(imageData) {
  const { data, width, height } = imageData;
  const totalPixels = width * height;
  
  // Analyze color complexity
  let uniqueColors = new Set();
  let edgePixels = 0;
  let highContrastPixels = 0;
  let skinTonePixels = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Count unique colors (sample every 16th pixel for performance)
    if (i % 64 === 0) {
      uniqueColors.add(`${r},${g},${b}`);
    }
    
    // Simple edge detection
    if (i > 3 && i < data.length - 4) {
      const prevR = data[i - 4];
      const prevG = data[i - 3];
      const prevB = data[i - 2];
      const contrast = Math.abs(r - prevR) + Math.abs(g - prevG) + Math.abs(b - prevB);
      if (contrast > 50) edgePixels++;
    }
    
    // High contrast detection
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    if (luminance > 200 || luminance < 55) highContrastPixels++;
    
    // Skin tone detection (simple range)
    if (r > 95 && g > 40 && b > 20 && 
        r > g && r > b && 
        Math.abs(r - g) > 15 &&
        r - b > 15) {
      skinTonePixels++;
    }
  }
  
  const edgeRatio = edgePixels / totalPixels;
  const contrastRatio = highContrastPixels / totalPixels;
  const skinRatio = skinTonePixels / totalPixels;
  
  // Determine image characteristics
  const characteristics = {
    isComplex: uniqueColors.size > 10000,
    isHighDetail: edgeRatio > 0.1,
    isHighContrast: contrastRatio > 0.3,
    isPortrait: skinRatio > 0.1,
    isSimpleGraphic: edgeRatio < 0.02 && uniqueColors.size < 100,
    isTextDocument: false, // Would need OCR for this
  };
  
  // Calculate recommended compression level
  let recommendedQuality = 0.85;
  if (characteristics.isComplex) {
    recommendedQuality = 0.9;
  } else if (characteristics.isSimpleGraphic) {
    recommendedQuality = 0.7;
  }
  
  // Recommend output format
  let recommendedFormat = 'jpeg';
  if (characteristics.isSimpleGraphic) {
    recommendedFormat = 'png';
  } else if (characteristics.isHighDetail) {
    recommendedFormat = 'webp';
  }
  
  return {
    characteristics,
    stats: {
      width,
      height,
      totalPixels,
      uniqueColors: uniqueColors.size,
      edgeRatio: (edgeRatio * 100).toFixed(1),
      contrastRatio: (contrastRatio * 100).toFixed(1),
      skinRatio: (skinRatio * 100).toFixed(1),
    },
    recommendations: {
      quality: recommendedQuality,
      format: recommendedFormat,
    },
  };
}

/**
 * Smart image resize with aspect ratio preservation
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {HTMLCanvasElement} - Resized canvas
 */
export function smartResize(canvas, maxWidth, maxHeight) {
  if (!maxWidth && !maxHeight) return canvas;
  
  const ctx = canvas.getContext('2d');
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  
  let { width, height } = canvas;
  
  // Calculate new dimensions
  if (maxWidth && width > maxWidth) {
    const ratio = maxWidth / width;
    width = maxWidth;
    height = height * ratio;
  }
  
  if (maxHeight && height > maxHeight) {
    const ratio = maxHeight / height;
    height = maxHeight;
    width = width * ratio;
  }
  
  tempCanvas.width = width;
  tempCanvas.height = height;
  
  // Use high-quality resampling
  tempCtx.imageSmoothingEnabled = true;
  tempCtx.imageSmoothingQuality = 'high';
  tempCtx.drawImage(canvas, 0, 0, width, height);
  
  return tempCanvas;
}

/**
 * Compress image to target size
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {string} format - Output format
 * @param {number} quality - Quality (0-1)
 * @param {number} targetSizeKB - Target size in KB
 * @returns {Blob} - Compressed image blob
 */
export async function compressToTargetSize(canvas, format, quality, targetSizeKB) {
  const maxSizeBytes = targetSizeKB * 1024;
  let currentQuality = quality;
  let bestBlob = null;
  let minDiff = Infinity;
  
  // Binary search for optimal quality
  for (let i = 0; i < 5; i++) {
    const blob = await canvasToBlob(canvas, format, currentQuality);
    const sizeDiff = Math.abs(blob.size - maxSizeBytes);
    
    if (sizeDiff < minDiff) {
      minDiff = sizeDiff;
      bestBlob = blob;
    }
    
    if (blob.size > maxSizeBytes) {
      currentQuality = Math.max(0.1, currentQuality - 0.1);
    } else {
      currentQuality = Math.min(1.0, currentQuality + 0.05);
    }
    
    // If we're close enough, break
    if (sizeDiff < maxSizeBytes * 0.1) break;
  }
  
  return bestBlob || await canvasToBlob(canvas, format, quality);
}

/**
 * Convert canvas to blob
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {string} format - Output format
 * @param {number} quality - Quality (0-1)
 * @returns {Promise<Blob>} - Image blob
 */
export function canvasToBlob(canvas, format, quality) {
  return new Promise((resolve) => {
    const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`;
    canvas.toBlob(
      (blob) => resolve(blob),
      mimeType,
      quality
    );
  });
}

/**
 * Smart image optimization - main function
 * @param {File} file - Image file
 * @param {Object} options - Optimization options
 * @returns {Promise<Object>} - Optimization result
 */
export async function optimizeImageAI(file, options = {}) {
  const startTime = Date.now();
  const result = {
    id: generateAIId(),
    timestamp: new Date().toISOString(),
    processingTime: 0,
    original: {
      name: file.name,
      size: file.size,
      type: file.type,
    },
    analysis: null,
    optimization: null,
    recommendations: [],
    error: null,
  };
  
  try {
    // Get image dimensions
    const dimensions = await getImageDimensions(file);
    result.original.dimensions = dimensions;
    
    // Create canvas for processing
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    await new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // Analyze image content
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        result.analysis = analyzeImageContent(imageData);
        result.analysis.dimensions = dimensions;
        
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });
    
    URL.revokeObjectURL(url);
    
    // Determine optimization strategy
    const preset = options.preset || 'web';
    const presetConfig = IMAGE_PRESETS[preset] || IMAGE_PRESETS.web;
    
    // Apply optimization
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    // Resize if needed
    if (presetConfig.maxWidth || presetConfig.maxHeight) {
      const resizedCanvas = smartResize(canvas, presetConfig.maxWidth, presetConfig.maxHeight);
      canvas.width = resizedCanvas.width;
      canvas.height = resizedCanvas.height;
      ctx.drawImage(resizedCanvas, 0, 0);
    }
    
    // Get optimized blob
    const format = presetConfig.format || 'webp';
    const quality = options.quality || result.analysis.recommendations.quality;
    const optimizedBlob = await canvasToBlob(canvas, format, quality);
    
    const compressionRatio = ((1 - optimizedBlob.size / file.size) * 100).toFixed(1);
    
    result.optimization = {
      format,
      quality,
      dimensions: { width: canvas.width, height: canvas.height },
      size: optimizedBlob.size,
      sizeReduction: file.size - optimizedBlob.size,
      compressionRatio: parseFloat(compressionRatio),
      blob: optimizedBlob,
    };
    
    // Generate recommendations
    result.recommendations = generateOptimizationRecommendations(result, presetConfig);
    
    result.processingTime = Date.now() - startTime;
    
  } catch (error) {
    result.error = error.message;
    console.error('Image optimization error:', error);
  }
  
  return result;
}

/**
 * Generate optimization recommendations
 */
function generateOptimizationRecommendations(result, presetConfig) {
  const recommendations = [];
  const { original, analysis, optimization } = result;
  
  // Format recommendation
  if (original.type.includes('png') && analysis.characteristics.isSimpleGraphic) {
    recommendations.push({
      type: 'format',
      message: 'PNG is optimal for this simple graphic',
      priority: 'high',
    });
  } else if (!optimization.format.includes('webp')) {
    recommendations.push({
      type: 'format',
      message: `Consider using WEBP format for better compression (saves ~30%)`,
      priority: 'medium',
    });
  }
  
  // Size recommendation
  if (original.size > 5 * 1024 * 1024) {
    recommendations.push({
      type: 'size',
      message: 'Large file - consider reducing dimensions for web use',
      priority: 'high',
    });
  }
  
  // Quality recommendation
  if (analysis.characteristics.isHighDetail && optimization.quality < 0.85) {
    recommendations.push({
      type: 'quality',
      message: 'High detail detected - consider higher quality for better results',
      priority: 'medium',
    });
  }
  
  return recommendations;
}

/**
 * Batch optimize multiple images
 * @param {Array<File>} files - Array of image files
 * @param {Object} options - Optimization options
 * @returns {Promise<Array>} - Array of optimization results
 */
export async function batchOptimizeImages(files, options = {}) {
  const results = await Promise.all(
    files.map(file => optimizeImageAI(file, options))
  );
  
  return results;
}

/**
 * Get recommended preset for use case
 */
export function getRecommendedPreset(useCase) {
  return IMAGE_PRESETS[useCase] || IMAGE_PRESETS.web;
}

/**
 * Estimate optimal quality for target size
 */
export function estimateOptimalQuality(originalSize, targetSizeKB) {
  const targetSize = targetSizeKB * 1024;
  const ratio = targetSize / originalSize;
  
  // Linear estimation with bounds
  let quality = Math.min(1, Math.max(0.1, ratio * 0.9));
  
  // Adjust based on typical compression ratios
  if (ratio > 0.5) {
    quality = 0.9;
  } else if (ratio > 0.25) {
    quality = 0.75;
  } else if (ratio > 0.1) {
    quality = 0.6;
  } else {
    quality = 0.4;
  }
  
  return quality;
}

export default {
  IMAGE_PRESETS,
  getImageDimensions,
  analyzeImageContent,
  smartResize,
  compressToTargetSize,
  optimizeImageAI,
  batchOptimizeImages,
  getRecommendedPreset,
  estimateOptimalQuality,
};

