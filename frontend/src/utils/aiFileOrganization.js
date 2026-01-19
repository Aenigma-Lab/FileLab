/**
 * 🤖 AI File Organization
 * 
 * AI-powered file categorization and organization
 * based on content analysis.
 */

import { generateAIId } from './aiIndex';

/**
 * File category definitions
 */
export const FILE_CATEGORIES = {
  document: {
    name: 'Documents',
    icon: '📄',
    keywords: ['report', 'document', 'contract', 'agreement', 'letter', 'memo', 'resume', 'cv', 'essay'],
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats'],
    extensions: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'],
  },
  spreadsheet: {
    name: 'Spreadsheets',
    icon: '📊',
    keywords: ['data', 'spreadsheet', 'excel', 'numbers', 'table', 'chart', 'financial'],
    mimeTypes: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml'],
    extensions: ['.xls', '.xlsx', '.numbers', '.csv'],
  },
  presentation: {
    name: 'Presentations',
    icon: '📽️',
    keywords: ['presentation', 'slides', 'deck', 'powerpoint', 'keynote'],
    mimeTypes: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml'],
    extensions: ['.ppt', '.pptx', '.key'],
  },
  image: {
    name: 'Images',
    icon: '🖼️',
    keywords: ['photo', 'image', 'picture', 'graphic', 'illustration', 'design'],
    mimeTypes: ['image/'],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.tiff', '.psd', '.ai'],
  },
  video: {
    name: 'Videos',
    icon: '🎬',
    keywords: ['video', 'movie', 'clip', 'recording', 'footage'],
    mimeTypes: ['video/'],
    extensions: ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm'],
  },
  audio: {
    name: 'Audio',
    icon: '🎵',
    keywords: ['audio', 'music', 'song', 'podcast', 'recording', 'sound'],
    mimeTypes: ['audio/'],
    extensions: ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'],
  },
  archive: {
    name: 'Archives',
    icon: '📦',
    keywords: ['archive', 'backup', 'compressed', 'zip', 'extract'],
    mimeTypes: ['application/zip', 'application/x-tar', 'application/x-rar-compressed'],
    extensions: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
  },
  code: {
    name: 'Code',
    icon: '💻',
    keywords: ['source', 'code', 'script', 'program', 'development'],
    mimeTypes: ['text/', 'application/javascript', 'application/json', 'application/xml'],
    extensions: ['.js', '.ts', '.py', '.java', '.c', '.cpp', '.html', '.css', '.json', '.xml', '.php', '.rb'],
  },
  pdf: {
    name: 'PDFs',
    icon: '📑',
    keywords: ['pdf', 'document'],
    mimeTypes: ['application/pdf'],
    extensions: ['.pdf'],
  },
};

/**
 * Content type patterns
 */
const CONTENT_PATTERNS = {
  personal: {
    patterns: [/resume|cv|personal|profile|biography|contact/i, /family|vacation|photos|personal/i],
    categories: ['document', 'image'],
  },
  work: {
    patterns: [/work|business|office|meeting|project|client|proposal/i, /invoice|contract|report/i],
    categories: ['document', 'spreadsheet', 'presentation'],
  },
  financial: {
    patterns: [/bank|statement|tax|income|expense|budget|financial/i, /invoice|receipt|bill/i],
    categories: ['document', 'spreadsheet'],
  },
  creative: {
    patterns: [/design|art|creative|illustration|photo/i, /video|audio|music|creative/i],
    categories: ['image', 'video', 'audio'],
  },
  technical: {
    patterns: [/code|source|program|software|api|technical/i, /data|database|server/i],
    categories: ['code', 'document'],
  },
  educational: {
    patterns: [/course|study|learning|education|tutorial/i, /homework|assignment|exam/i],
    categories: ['document', 'presentation'],
  },
};

/**
 * Detect file category from filename
 */
export function detectCategoryFromFilename(filename) {
  const nameLower = filename.toLowerCase();
  const ext = '.' + filename.split('.').pop().toLowerCase();
  
  // Check extension first
  for (const [category, info] of Object.entries(FILE_CATEGORIES)) {
    if (info.extensions.some(e => e.toLowerCase() === ext)) {
      // Check if filename contains category keywords
      if (info.keywords.some(keyword => nameLower.includes(keyword))) {
        return {
          category,
          confidence: 0.9,
          reason: 'Extension and keyword match',
        };
      }
      return {
        category,
        confidence: 0.8,
        reason: 'Extension match',
      };
    }
  }
  
  return {
    category: 'document',
    confidence: 0.5,
    reason: 'Default category',
  };
}

/**
 * Detect content type from text content
 */
export function detectContentType(text) {
  const scores = {};
  
  for (const [type, { patterns, categories }] of Object.entries(CONTENT_PATTERNS)) {
    let score = 0;
    
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        score += matches.length * 0.3;
      }
    }
    
    if (score > 0) {
      scores[type] = {
        score: Math.min(score, 1),
        categories,
      };
    }
  }
  
  // Sort by score
  const sorted = Object.entries(scores).sort((a, b) => b[1].score - a[1].score);
  
  if (sorted.length > 0) {
    return {
      type: sorted[0][0],
      confidence: sorted[0][1].score,
      suggestedCategories: sorted[0][1].categories,
    };
  }
  
  return {
    type: 'general',
    confidence: 0.3,
    suggestedCategories: ['document'],
  };
}

/**
 * Suggest folder structure based on content
 */
export function suggestFolderStructure(files) {
  const structure = {
    root: [],
    subfolders: {},
  };
  
  // Group files by category
  const grouped = {};
  
  for (const file of files) {
    const category = detectCategoryFromFilename(file.name).category;
    
    if (!grouped[category]) {
      grouped[category] = [];
    }
    
    grouped[category].push(file);
  }
  
  // Build structure
  for (const [category, categoryFiles] of Object.entries(grouped)) {
    const categoryInfo = FILE_CATEGORIES[category];
    
    if (categoryFiles.length > 1) {
      // Create subfolder for multiple files
      structure.subfolders[categoryInfo.name] = categoryFiles;
    } else {
      structure.root.push({
        ...categoryFiles[0],
        suggestedCategory: category,
        icon: categoryInfo.icon,
      });
    }
  }
  
  return structure;
}

/**
 * Generate tags for a file
 */
export function generateTags(filename, content = '') {
  const tags = new Set();
  
  // Add category tag
  const category = detectCategoryFromFilename(filename);
  tags.add(category.category);
  
  // Add date-related tags if filename contains date
  const datePattern = /\d{4}[-_]?\d{2}[-_]?\d{2}/;
  if (datePattern.test(filename)) {
    tags.add('dated');
  }
  
  // Add size-related tags
  tags.add('file');
  
  // Add content-based tags if available
  if (content) {
    const contentType = detectContentType(content);
    tags.add(contentType.type);
  }
  
  // Add extension tag
  const ext = filename.split('.').pop().toLowerCase();
  tags.add(ext);
  
  return Array.from(tags);
}

/**
 * Smart file organization - main function
 */
export function organizeFile(file, options = {}) {
  const result = {
    id: generateAIId(),
    timestamp: new Date().toISOString(),
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
    },
    categorization: null,
    tags: [],
    suggestedPath: null,
    suggestedFolder: null,
    suggestions: [],
    error: null,
  };
  
  try {
    // Categorize file
    result.categorization = detectCategoryFromFilename(file.name);
    
    // Generate tags
    result.tags = generateTags(file.name);
    
    // Get category info
    const categoryInfo = FILE_CATEGORIES[result.categorization.category];
    
    // Suggest folder
    result.suggestedFolder = categoryInfo.name;
    result.suggestedPath = `${categoryInfo.name}/${file.name}`;
    
    // Add additional suggestions
    if (result.categorization.confidence < 0.8) {
      result.suggestions.push({
        type: 'low_confidence',
        message: 'Low confidence in categorization - consider manual review',
        priority: 'low',
      });
    }
    
    // Check for potential duplicates
    result.suggestions.push({
      type: 'organization',
      message: `Move to "${categoryInfo.name}" folder`,
      priority: 'medium',
    });
    
  } catch (error) {
    result.error = error.message;
    console.error('File organization error:', error);
  }
  
  return result;
}

/**
 * Batch organize multiple files
 */
export function batchOrganizeFiles(files, options = {}) {
  const results = files.map(file => organizeFile(file, options));
  
  // Generate overall structure
  const structure = suggestFolderStructure(files);
  
  return {
    files: results,
    structure,
    summary: {
      totalFiles: files.length,
      categories: Object.keys(structure.subfolders).length,
      uncategorizedCount: structure.root.length,
    },
  };
}

/**
 * Get all categories with their info
 */
export function getAllCategories() {
  return Object.entries(FILE_CATEGORIES).map(([key, info]) => ({
    id: key,
    ...info,
  }));
}

/**
 * Search files by content type
 */
export function searchByContentType(files, contentType) {
  const targetCategories = CONTENT_PATTERNS[contentType]?.categories || [];
  
  return files.filter(file => {
    const categorization = detectCategoryFromFilename(file.name);
    return targetCategories.includes(categorization.category);
  });
}

/**
 * Sort files by date
 */
export function sortFilesByDate(files) {
  const datePattern = /\d{4}[-_]?\d{2}[-_]?\d{2}/;
  
  return [...files].sort((a, b) => {
    const dateA = a.name.match(datePattern);
    const dateB = b.name.match(datePattern);
    
    if (dateA && dateB) {
      return dateB[0].localeCompare(dateA[0]);
    }
    
    return b.name.localeCompare(a.name);
  });
}

export default {
  FILE_CATEGORIES,
  CONTENT_PATTERNS,
  detectCategoryFromFilename,
  detectContentType,
  suggestFolderStructure,
  generateTags,
  organizeFile,
  batchOrganizeFiles,
  getAllCategories,
  searchByContentType,
  sortFilesByDate,
};

