/**
 * 🤖 AI Semantic Search
 * 
 * Semantic search for PDF documents using TF-IDF
 * and cosine similarity for intelligent matching.
 */

import { generateAIId } from './aiIndex';

/**
 * Text preprocessing for search
 */
export function preprocessText(text) {
  // Convert to lowercase
  let processed = text.toLowerCase();
  
  // Remove special characters but keep spaces
  processed = processed.replace(/[^\w\s]/g, ' ');
  
  // Remove extra whitespace
  processed = processed.split(/\s+/).join(' ');
  
  return processed;
}

/**
 * Extract terms from text
 */
export function extractTerms(text) {
  const processed = preprocessText(text);
  const terms = processed.split(' ').filter(term => term.length > 1);
  return [...new Set(terms)];
}

/**
 * Create n-grams from text
 */
export function createNGrams(text, n = 2) {
  const terms = text.split(' ').filter(t => t.length > 0);
  const ngrams = [];
  
  for (let i = 0; i <= terms.length - n; i++) {
    ngrams.push(terms.slice(i, i + n).join(' '));
  }
  
  return ngrams;
}

/**
 * Calculate TF-IDF vector for a document
 */
export function calculateTFIDF(documents, documentIndex) {
  const doc = documents[documentIndex];
  const terms = extractTerms(doc);
  const docTerms = new Set(terms);
  const docLength = terms.length;
  
  // Calculate term frequency
  const tf = {};
  for (const term of terms) {
    tf[term] = (tf[term] || 0) + 1;
  }
  
  // Calculate inverse document frequency
  const idf = {};
  for (const term of docTerms) {
    let docCount = 0;
    for (let i = 0; i < documents.length; i++) {
      if (i !== documentIndex) {
        const otherTerms = extractTerms(documents[i]);
        if (otherTerms.includes(term)) {
          docCount++;
        }
      }
    }
    idf[term] = Math.log(documents.length / (1 + docCount)) + 1;
  }
  
  // Calculate TF-IDF
  const tfidf = {};
  for (const term of docTerms) {
    tfidf[term] = (tf[term] / docLength) * idf[term];
  }
  
  return tfidf;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vec1, vec2) {
  const keys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (const key of keys) {
    const val1 = vec1[key] || 0;
    const val2 = vec2[key] || 0;
    
    dotProduct += val1 * val2;
    norm1 += val1 * val1;
    norm2 += val2 * val2;
  }
  
  if (norm1 === 0 || norm2 === 0) return 0;
  
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * Semantic search in document
 */
export function semanticSearchInDocument(document, query) {
  const processedDoc = preprocessText(document);
  const processedQuery = preprocessText(query);
  
  // Create n-grams for better matching
  const docNGrams = createNGrams(processedDoc, 2);
  const queryNGrams = createNGrams(processedQuery, 2);
  
  // Expand query with synonyms (simple implementation)
  const expandedQuery = expandQuery(processedQuery);
  
  // Calculate relevance scores
  let baseScore = 0;
  let expandedScore = 0;
  let ngramScore = 0;
  
  const queryTerms = extractTerms(processedQuery);
  const expandedTerms = extractTerms(expandedQuery);
  const queryNGramSet = new Set(queryNGrams);
  
  for (const term of queryTerms) {
    if (processedDoc.includes(term)) {
      // Exact term match
      baseScore += 1;
      
      // Boost for multiple occurrences
      const occurrences = (processedDoc.match(new RegExp(term, 'g')) || []).length;
      if (occurrences > 1) {
        baseScore += Math.log(occurrences);
      }
    }
  }
  
  for (const term of expandedTerms) {
    if (!queryTerms.includes(term) && processedDoc.includes(term)) {
      expandedScore += 0.5; // Lower weight for expanded terms
    }
  }
  
  for (const ngram of queryNGrams) {
    if (docNGrams.includes(ngram)) {
      ngramScore += 1;
    }
  }
  
  // Normalize scores
  const maxPossible = queryTerms.length + expandedTerms.length + queryNGrams.length;
  const finalScore = (baseScore + expandedScore + ngramScore) / maxPossible;
  
  // Find context around matches
  const matches = findMatchContexts(processedDoc, queryTerms);
  
  return {
    score: Math.min(finalScore, 1),
    matches: matches.slice(0, 5),
    expandedTerms: [...new Set(expandedTerms.filter(t => !queryTerms.includes(t)))],
  };
}

/**
 * Expand query with related terms
 */
function expandQuery(query) {
  const expansions = {
    // Financial terms
    'money': 'revenue income cost profit budget financial expense',
    'sales': 'revenue business transactions deals income revenue',
    'financial': 'money revenue income profit budget accounting',
    'report': 'summary analysis review statement document',
    
    // Document terms
    'document': 'file text content page section chapter',
    'data': 'information statistics numbers figures metrics',
    'analysis': 'study examination review evaluation assessment',
    'result': 'finding outcome conclusion summary',
    
    // Technical terms
    'error': 'bug issue problem failure fault defect',
    'system': 'software hardware platform infrastructure network',
    'user': 'customer client person individual account',
    
    // Common actions
    'find': 'search locate discover identify detect',
    'create': 'generate produce make build develop',
    'update': 'modify change revise edit alter',
  };
  
  const queryTerms = query.split(' ');
  let expanded = '';
  
  for (const term of queryTerms) {
    if (expansions[term]) {
      expanded += ' ' + expansions[term];
    }
  }
  
  return query + expanded;
}

/**
 * Find context around matches
 */
function findMatchContexts(text, queryTerms) {
  const matches = [];
  const seen = new Set();
  
  for (const term of queryTerms) {
    let pos = text.indexOf(term);
    
    while (pos !== -1 && matches.length < 10) {
      // Extract context (100 chars before and after)
      const contextStart = Math.max(0, pos - 80);
      const contextEnd = Math.min(text.length, pos + term.length + 80);
      let context = text.slice(contextStart, contextEnd);
      
      // Add ellipsis if truncated
      if (contextStart > 0) context = '...' + context;
      if (contextEnd < text.length) context = context + '...';
      
      // Create unique key for this context
      const key = `${Math.floor(pos / 200)}`;
      if (!seen.has(key)) {
        seen.add(key);
        matches.push({
          term,
          position: pos,
          context: highlightTerm(context, term),
        });
      }
      
      pos = text.indexOf(term, pos + 1);
    }
  }
  
  return matches;
}

/**
 * Highlight search term in context
 */
function highlightTerm(context, term) {
  const regex = new RegExp(`(${term})`, 'gi');
  return context.replace(regex, '**$1**');
}

/**
 * Semantic search across multiple documents
 */
export function semanticSearch(documents, query) {
  const results = documents.map((doc, index) => {
    const searchResult = semanticSearchInDocument(doc, query);
    return {
      documentIndex: index,
      score: searchResult.score,
      matches: searchResult.matches,
      expandedTerms: searchResult.expandedTerms,
    };
  });
  
  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  
  return {
    query,
    totalDocuments: documents.length,
    results: results.filter(r => r.score > 0.05).slice(0, 10),
    expandedTerms: results[0]?.expandedTerms || [],
  };
}

/**
 * Smart search suggestions based on partial query
 */
export function getSearchSuggestions(query, documents) {
  const suggestions = [];
  const processedQuery = preprocessText(query);
  const queryTerms = extractTerms(processedQuery);
  
  // Extract all unique terms from documents
  const allTerms = new Set();
  for (const doc of documents) {
    const terms = extractTerms(doc);
    terms.forEach(t => allTerms.add(t));
  }
  
  // Find matching terms
  for (const term of allTerms) {
    for (const queryTerm of queryTerms) {
      if (term.includes(queryTerm) || queryTerm.includes(term)) {
        if (suggestions.length < 5 && !suggestions.includes(term)) {
          suggestions.push(term);
        }
      }
    }
  }
  
  return suggestions.slice(0, 5);
}

/**
 * Generate search highlights for UI
 */
export function generateSearchHighlights(text, query, maxHighlights = 5) {
  const highlights = [];
  const processedText = preprocessText(text);
  const queryTerms = extractTerms(query);
  
  let pos = 0;
  while (pos < processedText.length && highlights.length < maxHighlights) {
    let bestMatch = null;
    let bestLength = 0;
    
    for (const term of queryTerms) {
      const termPos = processedText.indexOf(term, pos);
      if (termPos !== -1 && termPos - pos < 100) {
        if (term.length > bestLength) {
          bestMatch = term;
          bestLength = term.length;
        }
      }
    }
    
    if (bestMatch) {
      const contextStart = Math.max(0, processedText.indexOf(bestMatch, pos) - 50);
      const contextEnd = Math.min(
        processedText.length,
        processedText.indexOf(bestMatch, pos) + bestMatch.length + 50
      );
      
      highlights.push({
        text: processedText.slice(contextStart, contextEnd),
        term: bestMatch,
      });
      
      pos = contextEnd;
    } else {
      break;
    }
  }
  
  return highlights;
}

/**
 * Calculate document relevance score
 */
export function calculateRelevanceScore(query, document, weights = {}) {
  const {
    exactMatchWeight = 2,
    partialMatchWeight = 1,
    termFrequencyWeight = 0.5,
    positionWeight = 1,
  } = weights;
  
  const processedDoc = preprocessText(document);
  const processedQuery = preprocessText(query);
  const queryTerms = extractTerms(processedQuery);
  
  let score = 0;
  
  // Exact term matches
  for (const term of queryTerms) {
    if (processedDoc === term) {
      score += exactMatchWeight * 2;
    } else if (processedDoc.includes(term)) {
      score += exactMatchWeight;
      
      // Term frequency bonus
      const tf = (processedDoc.match(new RegExp(term, 'g')) || []).length;
      score += Math.log(tf + 1) * termFrequencyWeight;
      
      // Position bonus (earlier is better)
      const position = processedDoc.indexOf(term);
      if (position < 100) {
        score += positionWeight;
      }
    } else {
      // Partial match using substring
      for (const docTerm of extractTerms(processedDoc)) {
        if (docTerm.includes(term) || term.includes(docTerm)) {
          score += partialMatchWeight * 0.5;
        }
      }
    }
  }
  
  // Normalize score
  const maxScore = queryTerms.length * (exactMatchWeight + positionWeight + 1);
  return Math.min(score / maxScore, 1);
}

export default {
  preprocessText,
  extractTerms,
  createNGrams,
  calculateTFIDF,
  cosineSimilarity,
  semanticSearchInDocument,
  semanticSearch,
  getSearchSuggestions,
  generateSearchHighlights,
  calculateRelevanceScore,
};

