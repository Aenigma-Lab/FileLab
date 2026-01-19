/**
 * AI Smart Watermark - Enhanced Version
 * AI-generated watermark recommendations with smart document analysis
 */
import { generateAIId } from './aiIndex';

export const WATERMARK_TEMPLATES = {
  confidential: { name: 'Confidential', text: 'CONFIDENTIAL', font: 'Helvetica-Bold', size: 60, color: '#DC2626', opacity: 0.3, rotation: 45, position: 'center', category: 'security', outline: true, outlineColor: '#FFFFFF' },
  topSecret: { name: 'Top Secret', text: 'TOP SECRET', font: 'Courier-Bold', size: 72, color: '#DC2626', opacity: 0.4, rotation: 45, position: 'center', category: 'security', outline: true, outlineColor: '#FFFFFF' },
  restricted: { name: 'Restricted', text: 'RESTRICTED', font: 'Helvetica-Bold', size: 54, color: '#F59E0B', opacity: 0.35, rotation: 45, position: 'center', category: 'security', outline: true, outlineColor: '#FFFFFF' },
  draft: { name: 'Draft', text: 'DRAFT', font: 'Helvetica-Bold', size: 72, color: '#F59E0B', opacity: 0.4, rotation: 45, position: 'center', category: 'status', outline: false },
  preliminary: { name: 'Preliminary', text: 'PRELIMINARY', font: 'Helvetica', size: 48, color: '#8B5CF6', opacity: 0.3, rotation: 30, position: 'center', category: 'status', outline: false },
  reviewOnly: { name: 'Review Only', text: 'FOR REVIEW ONLY', font: 'Helvetica', size: 36, color: '#3B82F6', opacity: 0.35, rotation: 0, position: 'bottom-center', category: 'status', outline: false },
  sample: { name: 'Sample', text: 'SAMPLE', font: 'Helvetica-Bold', size: 48, color: '#3B82F6', opacity: 0.25, rotation: 45, position: 'center', category: 'demo', outline: false },
  demo: { name: 'Demo', text: 'DEMO VERSION', font: 'Helvetica-Bold', size: 42, color: '#10B981', opacity: 0.3, rotation: 45, position: 'center', category: 'demo', outline: true, outlineColor: '#FFFFFF' },
  urgent: { name: 'Urgent', text: 'URGENT', font: 'Helvetica-Bold', size: 54, color: '#DC2626', opacity: 0.35, rotation: 45, position: 'center', category: 'importance', outline: true, outlineColor: '#FFFFFF' },
  important: { name: 'Important', text: 'IMPORTANT', font: 'Helvetica-Bold', size: 48, color: '#F59E0B', opacity: 0.3, rotation: 30, position: 'center', category: 'importance', outline: true, outlineColor: '#FFFFFF' },
  copyright: { name: 'Copyright', text: `© ${new Date().getFullYear()} All Rights Reserved`, font: 'Helvetica', size: 24, color: '#374151', opacity: 0.5, rotation: 0, position: 'bottom-center', category: 'legal', outline: false },
  proprietary: { name: 'Proprietary', text: 'PROPRIETARY', font: 'Helvetica-Bold', size: 48, color: '#7C3AED', opacity: 0.3, rotation: 45, position: 'center', category: 'legal', outline: false },
  doNotCopy: { name: 'Do Not Copy', text: 'DO NOT COPY', font: 'Helvetica-Bold', size: 42, color: '#EF4444', opacity: 0.25, rotation: 45, position: 'center', category: 'legal', outline: true, outlineColor: '#FFFFFF' },
  internalOnly: { name: 'Internal Only', text: 'INTERNAL USE ONLY', font: 'Helvetica', size: 32, color: '#3B82F6', opacity: 0.4, rotation: 0, position: 'bottom-center', category: 'legal', outline: false },
};

export function analyzeDocumentForWatermark(content, metadata = {}) {
  const analysis = { documentType: null, suggestedTemplates: [], customSuggestions: [], riskLevel: 'low', recommendations: [], confidence: 0, industry: null, hasSignature: false, hasDates: false, hasNumbers: false, wordCount: 0 };
  const contentLower = content.toLowerCase();
  analysis.wordCount = content.split(/\s+/).length;
  
  const documentPatterns = [
    { type: 'legal', patterns: [/contract|agreement|terms|conditions|terms of/i, /client|patient|customer/i], templates: ['confidential', 'proprietary', 'doNotCopy'] },
    { type: 'financial', patterns: [/invoice|bill|payment|receipt|quote/i, /amount|total|due|balance/i], templates: ['confidential', 'draft', 'internalOnly'] },
    { type: 'report', patterns: [/report|analysis|study|survey/i, /findings|conclusion|recommendations/i], templates: ['draft', 'sample', 'preliminary'] },
    { type: 'presentation', patterns: [/presentation|slides|deck/i, /agenda|summary|overview/i], templates: ['draft', 'sample', 'demo'] },
    { type: 'official', patterns: [/official|government|authority|certificate/i], templates: ['confidential', 'internalOnly'] },
    { type: 'medical', patterns: [/medical|health|patient|diagnosis|treatment/i, /prescription|medication/i], templates: ['confidential', 'restricted', 'topSecret'] },
    { type: 'hr', patterns: [/employment|hiring|resume|cv|performance/i, /salary|bonus|review/i], templates: ['confidential', 'internalOnly'] },
    { type: 'technical', patterns: [/technical|specification|api|code|architecture/i, /implementation|deployment/i], templates: ['draft', 'proprietary', 'internalOnly'] },
    { type: 'marketing', patterns: [/marketing|campaign|proposal|client/i], templates: ['sample', 'demo', 'confidential'] },
    { type: 'academic', patterns: [/thesis|dissertation|research|paper|academic/i], templates: ['draft', 'sample', 'preliminary'] },
  ];
  
  for (const doc of documentPatterns) {
    let matchCount = 0;
    for (const pattern of doc.patterns) {
      if (pattern.test(content)) matchCount++;
    }
    if (matchCount >= doc.patterns.length * 0.5) {
      analysis.documentType = doc.type;
      analysis.suggestedTemplates = doc.templates;
      analysis.confidence = 0.7 + (matchCount / doc.patterns.length) * 0.2;
      break;
    }
  }
  
  const industryPatterns = [{ industry: 'healthcare', patterns: [/hospital|clinic|pharmacy|medical/i] }, { industry: 'finance', patterns: [/bank|investment|insurance|stock/i] }, { industry: 'technology', patterns: [/software|app|platform|cloud|ai/i] }, { industry: 'legal', patterns: [/law|attorney|court|legal/i] }, { industry: 'education', patterns: [/school|university|college|education/i] }, { industry: 'government', patterns: [/government|agency|federal|state/i] }];
  for (const ind of industryPatterns) {
    for (const pattern of ind.patterns) {
      if (pattern.test(content)) { analysis.industry = ind.industry; break; }
    }
    if (analysis.industry) break;
  }
  
  const sensitivePatterns = [{ pattern: /ssn|social security|credit card|password|secret|private/i, level: 'high' }, { pattern: /confidential|classified|restricted|secret/i, level: 'medium' }, { pattern: /internal|private|personal/i, level: 'low' }];
  for (const sp of sensitivePatterns) {
    if (sp.pattern.test(content)) { analysis.riskLevel = sp.level; break; }
  }
  
  if (/signature|signed|electronically/i.test(content)) analysis.hasSignature = true;
  if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g.test(content)) analysis.hasDates = true;
  if (/\$\d+|USD|EUR|GBP\s*\d+/i.test(content)) { analysis.hasNumbers = true; analysis.riskLevel = 'high'; }
  
  if (analysis.riskLevel === 'high') analysis.recommendations.push({ type: 'security', message: 'Document contains sensitive information - confidential watermark recommended', priority: 'high', action: 'Apply confidential watermark' });
  if (analysis.hasSignature) analysis.recommendations.push({ type: 'legal', message: 'Document contains signatures - consider legal protection watermark', priority: 'medium', action: 'Apply proprietary or do-not-copy watermark' });
  if (/draft|preliminary|pending review|not final|work in progress/i.test(content)) {
    if (!analysis.suggestedTemplates.includes('draft')) analysis.suggestedTemplates.push('draft');
    analysis.recommendations.push({ type: 'status', message: 'Document appears to be a draft - draft watermark recommended', priority: 'medium', action: 'Apply draft watermark' });
  }
  if (/urgent|asap|immediately|priority|emergency/i.test(content)) {
    analysis.suggestedTemplates.push('urgent', 'important');
    analysis.recommendations.push({ type: 'urgency', message: 'Document has urgent markers - urgent watermark recommended', priority: 'high', action: 'Apply urgent watermark' });
  }
  
  return analysis;
}

export function generateWatermarkText(context) {
  const { documentType, date, company, status = 'draft', confidentiality = 'confidential' } = context;
  const year = new Date().getFullYear();
  const templates = {
    legal: [`${company || 'Company'} - ${confidentiality.toUpperCase()}`, `${company || 'Company'} - DO NOT DISTRIBUTE`, `${confidentiality.toUpperCase()} - ${company || 'Company'}`],
    financial: [`${company || 'Company'} - ${confidentiality.toUpperCase()}`, `${date ? `Dated: ${date}` : 'CONFIDENTIAL'}`, `${confidentiality.toUpperCase()} - INTERNAL USE ONLY`],
    report: [`${status.toUpperCase()} - FOR REVIEW ONLY`, `${status.toUpperCase()} - ${company || 'Company'}`, `${status.toUpperCase()} - ${date || year}`],
    presentation: [`${status.toUpperCase()} - ${company || 'Company'}`, `${status.toUpperCase()} - NOT FINAL`, `${company || 'Company'} ${status.toUpperCase()}`],
    default: [`${confidentiality.toUpperCase()}`, `${company || 'Company'} - ${confidentiality.toUpperCase()}`, `${confidentiality.toUpperCase()} - ${date || year}`],
  };
  const typeTemplates = templates[documentType] || templates.default;
  return typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
}

export function getOptimalWatermarkSettings(documentSize, contentType, options = {}) {
  const { isLegal = false, isFinancial = false, hasImages = false } = options;
  const baseSize = Math.min(Math.max(documentSize / 5000, 24), 120);
  let fontSize = Math.round(baseSize), opacity = 0.25, rotation = 45, outline = false, outlineColor = '#FFFFFF';
  
  if (isLegal) { fontSize = Math.round(baseSize * 1.2); opacity = 0.35; rotation = 45; outline = true; }
  else if (isFinancial) { fontSize = Math.round(baseSize * 1.1); opacity = 0.3; rotation = 45; outline = false; }
  else if (hasImages) { fontSize = Math.round(baseSize * 0.9); opacity = 0.2; rotation = 30; outline = false; }
  
  switch (contentType) {
    case 'legal': opacity = Math.max(opacity, 0.3); rotation = 45; outline = true; break;
    case 'presentation': opacity = Math.min(opacity, 0.2); rotation = 30; outline = false; break;
    case 'financial': opacity = Math.max(opacity, 0.3); rotation = 45; outline = false; break;
    case 'official': opacity = 0.4; rotation = 0; outline = false; break;
    case 'medical': opacity = 0.35; rotation = 45; outline = true; break;
  }
  
  return { fontSize, opacity: Math.round(opacity * 100) / 100, rotation, outline, outlineColor, autoPosition: true, smartContrast: true, adaptiveOpacity: true };
}

export function previewWatermark(canvas, watermark) {
  const ctx = canvas.getContext('2d');
  const { text, font = 'Helvetica-Bold', size = 48, color = '#808080', opacity = 0.3, rotation = 45, position = 'center', outline = false, outlineColor = '#FFFFFF' } = watermark;
  ctx.save();
  ctx.font = `${size}px ${font}`;
  if (outline) { ctx.strokeStyle = outlineColor; ctx.lineWidth = Math.max(1, size / 24); }
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  let x, y;
  const padding = 50;
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const textHeight = size;
  
  switch (position) {
    case 'center': x = canvas.width / 2; y = canvas.height / 2; break;
    case 'top-left': x = padding + textWidth / 2; y = padding + textHeight / 2; break;
    case 'top-right': x = canvas.width - padding - textWidth / 2; y = padding + textHeight / 2; break;
    case 'bottom-left': x = padding + textWidth / 2; y = canvas.height - padding - textHeight / 2; break;
    case 'bottom-right': x = canvas.width - padding - textWidth / 2; y = canvas.height - padding - textHeight / 2; break;
    case 'bottom-center': x = canvas.width / 2; y = canvas.height - padding - textHeight / 2; break;
    case 'tiled': ctx.restore(); return previewTiledWatermark(canvas, watermark);
    default: x = canvas.width / 2; y = canvas.height / 2;
  }
  
  ctx.translate(x, y);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-x, -y);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (outline) ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
  ctx.restore();
  return canvas;
}

export function previewTiledWatermark(canvas, watermark) {
  const ctx = canvas.getContext('2d');
  const { text, font = 'Helvetica-Bold', size = 24, color = '#808080', opacity = 0.15, rotation = 45 } = watermark;
  ctx.save();
  ctx.font = `${size}px ${font}`;
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  const spacing = size * 6;
  const diag = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
  const count = Math.ceil(diag / spacing) + 2;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  for (let i = -count; i <= count; i++) {
    for (let j = -count; j <= count; j++) {
      ctx.fillText(text, i * spacing, j * spacing);
    }
  }
  ctx.restore();
  return canvas;
}

export function getAIWatermarkRecommendation(fileAnalysis) {
  const { content, fileType, fileName, fileSize, metadata = {} } = fileAnalysis;
  const result = { id: generateAIId(), timestamp: new Date().toISOString(), template: null, customText: null, settings: null, confidence: 0, reasoning: [], alternativeTemplates: [], estimatedEffectiveness: 0 };
  const analysis = analyzeDocumentForWatermark(content || '', metadata);
  
  if (analysis.suggestedTemplates.length > 0) {
    const primaryTemplate = analysis.suggestedTemplates[0];
    result.template = WATERMARK_TEMPLATES[primaryTemplate];
    result.confidence = Math.min(analysis.confidence + 0.1, 0.95);
    result.reasoning.push(`Detected ${analysis.documentType || 'document'} type (${Math.round(result.confidence * 100)}% confidence)`, `Industry: ${analysis.industry || 'General'}`);
    result.alternativeTemplates = analysis.suggestedTemplates.slice(1, 4).map(name => WATERMARK_TEMPLATES[name]).filter(Boolean);
  }
  
  result.customText = generateWatermarkText({ documentType: analysis.documentType, company: extractCompanyName(fileName), date: new Date().toLocaleDateString(), status: analysis.suggestedTemplates.includes('draft') ? 'draft' : 'confidential', confidentiality: analysis.riskLevel === 'high' ? 'confidential' : 'internal' });
  result.settings = getOptimalWatermarkSettings(fileSize, analysis.documentType, { isLegal: analysis.documentType === 'legal', isFinancial: analysis.documentType === 'financial', hasImages: fileType === 'image' });
  
  let effectiveness = 50;
  if (analysis.riskLevel === 'high') effectiveness += 30;
  else if (analysis.riskLevel === 'medium') effectiveness += 15;
  if (result.template?.outline) effectiveness += 10;
  if (analysis.recommendations.length > 0) effectiveness += 10;
  result.estimatedEffectiveness = Math.min(effectiveness, 95);
  
  if (analysis.recommendations.length > 0) result.reasoning.push(...analysis.recommendations.map(r => r.message));
  if (analysis.riskLevel === 'high') result.reasoning.push('High-risk document - consider additional security measures');
  
  return result;
}

export function extractCompanyName(filename) {
  if (!filename) return 'Company';
  const name = filename.replace(/\.[^/.]+$/, '');
  const patterns = [/([A-Z][a-z]+(?:[A-Z][a-z]+)+)/, /(\w+)\s+(?:Inc|LLC|Corp|Ltd|Group|Solutions|Systems)/i, /^(?:The\s+)?(\w+)(?:\s+(?:Company|Corp|LLC))?/i, /(\w+)(?:\s*[-–]\s*\w+)*(?:\s+(?:Document|File|Report))?$/i];
  for (const pattern of patterns) {
    const match = name.match(pattern);
    if (match && match[1] && match[1].length > 2) return match[1];
  }
  return name.split(/[-_\s.]+/).filter(part => part.length > 2).slice(0, 2).join(' ') || 'Company';
}

export function getWatermarkTemplates() {
  return Object.entries(WATERMARK_TEMPLATES).map(([key, template]) => ({ id: key, ...template, usage: template.category }));
}

export function getTemplatesByCategory(category) {
  return Object.entries(WATERMARK_TEMPLATES).filter(([_, template]) => template.category === category).map(([key, template]) => ({ id: key, ...template }));
}

export function createCustomWatermark(params) {
  const { text = 'CUSTOM', font = 'Helvetica-Bold', size = 48, color = '#808080', opacity = 0.3, rotation = 45, position = 'center', outline = false, outlineColor = '#FFFFFF' } = params;
  return { text, font, size, color, opacity, rotation, position, outline, outlineColor, isCustom: true, createdAt: new Date().toISOString() };
}

export function getSmartDefaultWatermark(scenario) {
  const defaults = { contract: WATERMARK_TEMPLATES.confidential, invoice: WATERMARK_TEMPLATES.confidential, report: WATERMARK_TEMPLATES.draft, presentation: WATERMARK_TEMPLATES.draft, memo: WATERMARK_TEMPLATES.internalOnly, proposal: WATERMARK_TEMPLATES.sample, default: WATERMARK_TEMPLATES.confidential };
  return defaults[scenario] || defaults.default;
}

export function validateWatermarkSettings(settings) {
  const errors = [];
  if (!settings.text || settings.text.trim().length === 0) errors.push({ field: 'text', message: 'Watermark text is required' });
  if (settings.text && settings.text.length > 100) errors.push({ field: 'text', message: 'Watermark text too long (max 100 characters)' });
  if (settings.size && (settings.size < 8 || settings.size > 200)) errors.push({ field: 'size', message: 'Font size must be between 8 and 200' });
  if (settings.opacity && (settings.opacity < 0 || settings.opacity > 1)) errors.push({ field: 'opacity', message: 'Opacity must be between 0 and 1' });
  if (settings.rotation && (settings.rotation < -360 || settings.rotation > 360)) errors.push({ field: 'rotation', message: 'Rotation must be between -360 and 360 degrees' });
  return { isValid: errors.length === 0, errors };
}

export default { WATERMARK_TEMPLATES, analyzeDocumentForWatermark, generateWatermarkText, getOptimalWatermarkSettings, previewWatermark, previewTiledWatermark, getAIWatermarkRecommendation, getWatermarkTemplates, getTemplatesByCategory, createCustomWatermark, getSmartDefaultWatermark, validateWatermarkSettings, extractCompanyName };

