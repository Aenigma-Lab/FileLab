/**
 * AI-Powered Fuzzy Search Utility for FileLab Operations
 * 
 * Features:
 * - Fuzzy matching using Levenshtein distance
 * - Natural language query understanding
 * - Operation keyword mapping
 * - Relevance scoring with percentage (0-100)
 * - Confidence levels (high/medium/low)
 * - Match type detection (EXACT, PARTIAL, FUZZY, KEYWORD, CATEGORY)
 * - Query expansion with synonyms
 * - Spelling suggestions
 * - Score breakdown analysis
 */

import Fuse from 'fuse.js';

/**
 * Match Type Constants
 */
export const MATCH_TYPE = {
  EXACT: 'EXACT',
  PARTIAL: 'PARTIAL',
  FUZZY: 'FUZZY',
  KEYWORD: 'KEYWORD',
  CATEGORY: 'CATEGORY',
};

/**
 * Confidence Level Thresholds
 */
export const CONFIDENCE_LEVEL = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

/**
 * Extended Synonyms for query expansion
 * Covers all operations and file format variations
 */
export const SYNONYMS = {
  // Core operation verbs
  'convert': ['change', 'transform', 'turn', 'make', 'export', 'switch', 'rewrite', 'reformat'],
  'extract': ['pull', 'get', 'grab', 'remove', 'take', 'copy', 'rip', 'mine', 'liberate'],
  'merge': ['combine', 'join', 'unite', 'concatenate', 'bind', 'link', 'fuse', 'assemble', 'amalgamate'],
  'split': ['separate', 'cut', 'divide', 'break', 'partition', 'slice', 'carve', 'dissect'],
  'add': ['insert', 'put', 'include', 'attach', 'overlay', 'imprint', 'stamp', 'superimpose'],
  'remove': ['delete', 'strip', 'clear', 'eliminate', 'erase', 'take out', 'delete', 'purge'],
  'lock': ['encrypt', 'protect', 'secure', 'password', 'seal', 'restrict', 'block', 'safeguard'],
  'unlock': ['decrypt', 'remove password', 'open', 'unseal', 'unrestrict', 'unblock', 'unprotect'],
  'compress': ['zip', 'archive', 'bundle', 'pack', 'reduce', 'shrink', 'compact', 'condense'],
  'extract': ['unzip', 'unarchive', 'unpack', 'decompress', 'expand', 'unbundle', 'extract', 'uncompress'],
  'search': ['find', 'lookup', 'query', 'grep', 'locate', 'scan', 'hunt', 'seek'],
  'resize': ['scale', 'adjust', 'change size', 'resize dimensions', 'reshape', 'modify size'],
  'detect': ['identify', 'recognize', 'determine', 'figure out', 'analyze', 'recognize'],
  
  // File format synonyms
  'pdf': ['pdf file', 'document', 'adobe', 'portable document', 'pdf doc', 'acrobat'],
  'word': ['docx', 'doc', 'word document', 'microsoft word', 'word file', 'ms word'],
  'excel': ['xlsx', 'xls', 'spreadsheet', 'worksheet', 'excel file', 'workbook', 'xls file'],
  'powerpoint': ['ppt', 'pptx', 'presentation', 'slides', 'slide deck', 'powerpoint file', 'slideshow'],
  'text': ['txt', 'plain text', 'notepad', 'text file', 'ascii', 'plaintext'],
  'image': ['picture', 'photo', 'jpg', 'png', 'webp', 'image file', 'graphic', 'photograph', 
            'screenshot', 'snapshot', 'capture', 'scan', 'pic', 'img', 'image to pdf',
            'convert image', 'photo to pdf', 'picture to pdf', 'screenshot to pdf'],
  'jpeg': ['jpg', 'jpeg file', 'jpg image', 'jpeg image', 'joint photographic experts group', 'jpe'],
  'png': ['png file', 'png image', 'portable network graphics', 'ping'],
  'webp': ['webp file', 'webp image', 'web picture', 'web image', 'wep'],
  'bmp': ['bmp file', 'bmp image', 'bitmap', 'bitmap image', 'dib', 'device independent bitmap'],
  'archive': ['zip', 'compressed', 'archive file', 'zip file', 'rar', '7z', 'tar'],
  
  // Image to PDF specific
  'image to pdf': ['convert image to pdf', 'picture to pdf', 'photo to pdf', 'screenshot to pdf',
                   'images to pdf', 'combine images to pdf', 'merge images to pdf', 'make pdf from image',
                   'create pdf from images', 'jpg to pdf', 'png to pdf', 'jpeg to pdf', 'webp to pdf',
                   'batch image to pdf', 'multiple images to pdf', 'bulk image to pdf'],
  'photo': ['photo', 'photograph', 'pic', 'pix', 'image', 'picture', 'snapshot', 'capture'],
  'picture': ['picture', 'pic', 'image', 'photo', 'photograph', 'snapshot', 'capture'],
  'screenshot': ['screenshot', 'screen shot', 'screen capture', 'print screen', 'printscreen', 'capture'],
  'scan': ['scan', 'scanned', 'scan to pdf', 'scanned document', 'scanned image', 'digitized'],
  'convert': ['convert', 'transform', 'turn', 'make', 'export', 'switch', 'rewrite', 'reformat',
              'create', 'generate', 'produce', 'build', 'form', 'make new'],
  
  // Document-related
  'document': ['doc', 'file', 'paper', 'text', 'content', 'file'],
  'spreadsheet': ['sheet', 'workbook', 'excel file', 'data sheet', 'grid'],
  'presentation': ['slides', 'deck', 'powerpoint', 'slideshow', 'slide show'],
  'watermark': ['stamp', 'overlay', 'brand', 'copyright', 'mark', 'label', 'sign', 'seal'],
  
  // Actions
  'create': ['make', 'generate', 'produce', 'build', 'form', 'make new', 'produce'],
  'edit': ['modify', 'change', 'alter', 'revise', 'update', 'amend'],
  'protect': ['secure', 'guard', 'shield', 'safeguard', 'defend', 'preserve'],
  'share': ['send', 'upload', 'distribute', 'transfer', 'email', 'publish'],
  'download': ['save', 'export', 'get', 'grab', 'pull', 'obtain'],
  
  // OCR-related
  'ocr': ['optical character recognition', 'text recognition', 'scan text', 'image to text', 'character recognition'],
  'scan': ['photograph', 'capture', 'digitize', 'image capture', 'photo'],
  
  // Quality
  'high quality': ['high', 'best', 'maximum', 'premium', 'hd', 'ultra', 'premium quality'],
  'low quality': ['low', 'small', 'compressed', 'draft', 'preview', 'thumbnail'],
  'medium quality': ['medium', 'balanced', 'standard', 'normal', 'regular'],
};

/**
 * Extended Common typos for spelling suggestions - Comprehensive coverage
 */
export const COMMON_TYPOS = {
  // File formats
  'pdf': ['pfd', 'dff', 'fdp', 'pdf', 'pof', 'pfg', 'ptf'],
  'docx': ['doc', 'docx', 'dox', 'dcx', 'dcox', 'doxc', 'ddocx'],
  'excel': ['exel', 'excell', 'exel', 'xls', 'xslx', 'exel', 'ecksel'],
  'powerpoint': ['ppt', 'pptx', 'pp', 'pttx', 'pont', 'pppt', 'ppttx'],
  'jpeg': ['jpg', 'jpef', 'jpge', 'peg', 'jepeg', 'jepg', 'jppeg'],
  'png': ['pgn', 'png', 'pnn', 'pnig', 'pmg', 'pimg', 'pnog'],
  'webp': ['web', 'wpb', 'wep', 'werp', 'wrbp', 'webr', 'wepb'],
  'bmp': ['bmp', 'bm', 'bnp', 'bmp', 'mbp', 'bmp', 'bmnp'],
  'xlsx': ['xls', 'xlsx', 'exel', 'exls', 'xslx', 'xlsz'],
  'txt': ['text', 'tx', 'tst', 'txt', 'tzt'],
  
  // Operations
  'convert': ['convet', 'convrt', 'conver', 'convrt', 'cnovert', 'convret', 'convetr'],
  'merge': ['mergr', 'merg', 'mege', 'mrege', 'mereg', 'mereg', 'marge'],
  'split': ['spli', 'spllt', 'spli', 'spilt', 'splut', 'slipt', 'spllt'],
  'extract': ['extrat', 'extrct', 'exract', 'extract', 'extact', 'exract', 'extrat'],
  'compress': ['compres', 'compres', 'comprss', 'cmpress', 'compres', 'compress', 'compres'],
  'unlock': ['unlok', 'unlcok', 'unlok', 'unlck', 'ulock', 'unlk', 'unlok'],
  'encrypt': ['encryp', 'encryt', 'encrpt', 'encrypt', 'encrupt', 'encryt', 'encryp'],
  'watermark': ['wateramrk', 'watrmark', 'wtrmark', 'watermark', 'watrmak', 'watermark', 'wtermark'],
  'password': ['pasword', 'paswrd', 'pasword', 'pwd', 'passwrd', 'pasword', 'passwod'],
  'document': ['documen', 'documnt', 'documet', 'docment', 'dociument', 'documnt', 'documemt'],
  'spreadsheet': ['spreadhseet', 'spradsheet', 'spredsheet', 'spresheet', 'spradsheet', 'spreadheet', 'spresheet'],
  'presentation': ['presentaion', 'presntation', 'presentaton', 'presentaion', 'presntation', 'presentaion', 'presntation'],
  'resize': ['reszie', 'reesize', 'reszie', 'rszie', 'resiez', 'reszie', 'reszie'],
  'rotation': ['roation', 'rotaion', 'rotaton', 'rotaion', 'rotatoin', 'roatino', 'rotaton'],
  'language': ['lnguage', 'langauge', 'languge', 'langage', 'lnaguage', 'langauge', 'lnguage'],
  'detection': ['detectin', 'detecion', 'dection', 'detectin', 'detecction', 'detecion', 'detectin'],
  
  // Common words
  'image': ['imgae', 'imge', 'imgae', 'img', 'igmage', 'imgae', 'imge', 'image pdf', 'imagepdf', 'imgpdf'],
  'picture': ['picure', 'pictur', 'pictue', 'picure', 'pictur', 'pictue', 'pcture', 'picture pdf'],
  'photo': ['poto', 'phoo', 'phoot', 'poto', 'phoo', 'phoot', 'phoro', 'photo pdf', 'photopdf'],
  'screenshot': ['screenshot', 'screen shot', 'screen capture', 'print screen', 'printscreen', 'capture', 
                 'screenshot pdf', 'screen capture pdf', 'screen shot pdf'],
  'combine': ['combne', 'combie', 'combin', 'combie', 'combine pictures', 'combine images', 'combine photos'],
  'merge': ['mergr', 'merg', 'mege', 'mrege', 'mereg', 'mereg', 'marge', 'merge images', 'merge photos'],
  'pdf': ['pfd', 'dff', 'fdp', 'pdf', 'pof', 'pfg', 'ptf', 'pdf file', 'pdf document'],
  
  // OCR-related
  'ocr': ['orc', 'ocr', 'orc', 'ocr', 'ocr', 'ocr', 'orc'],
  'optical': ['optial', 'opticl', 'optcal', 'optial', 'opticl', 'optcal', 'optial'],
  'character': ['caracter', 'charater', 'charcter', 'caracter', 'charater', 'charcter', 'caractr'],
  'recognition': ['recognition', 'recodnition', 'recogition', 'recogniton', 'recodnition', 'recogition', 'recogniton'],
  
  // File-related
  'folder': ['folder', 'foldr', 'foler', 'flder', 'folde', 'foldr', 'foler'],
  'files': ['file', 'fil', 'fiels', 'fiels', 'filez', 'filz', 'fiels'],
  'upload': ['uploa', 'uplod', 'uplaod', 'uploa', 'uplod', 'uplaod', 'uplad'],
  'download': ['downlod', 'downlaod', 'downloa', 'downlod', 'downlaod', 'downloa', 'download'],
  'select': ['selct', 'selcet', 'slct', 'selct', 'slcet', 'selcet', 'slct'],
  
  // Quality
  'quality': ['qulity', 'qualty', 'qualiti', 'qulity', 'qualty', 'qualiti', 'qualt'],
  'resolution': ['resulution', 'resoltion', 'reslution', 'resulution', 'resoltion', 'reslution', 'resulotion'],
  'transparent': ['transparrent', 'transparant', 'transperent', 'transparrent', 'transparant', 'transperent', 'transparnt'],
  
  // Security
  'encrypt': ['encryp', 'encryt', 'encrpt', 'encrypt', 'encrupt', 'encryt', 'encryp'],
  'decrypt': ['decryp', 'decryt', 'decrpt', 'decrypt', 'decrpyt', 'decryt', 'decryp'],
  'security': ['secuirty', 'secuity', 'securty', 'secuirty', 'secuity', 'securty', 'secirity'],
  'password': ['pasword', 'paswrd', 'password', 'pwd', 'passwrd', 'pasword', 'passwod'],
  
  // Image formats
  'bitmap': ['bitmat', 'bitmpa', 'bitmp', 'bitmat', 'bitmpa', 'bitmp', 'bitm'],
  'picture': ['picure', 'pictur', 'pictue', 'picure', 'pictur', 'pictue', 'pcture'],
  'photo': ['poto', 'phoo', 'phoot', 'poto', 'phoo', 'phoot', 'phoro'],
  'format': ['fomrat', 'fromat', 'frormat', 'fomrat', 'fromat', 'frormat', 'frmat'],
};

/**
 * Operation keywords mapping for enhanced search
 * Maps common search terms to their corresponding operations
 * Keys match the operation IDs used in HomePage.js operationNames
 */
export const OPERATION_KEYWORDS = {
  // Document Conversions
  pdfToDocx: {
    keywords: [
      'pdf to word', 'pdf to docx', 'pdf to doc', 'convert pdf to word', 'pdf word converter',
      'pdf document to word', 'pdf edit', 'pdf conversion', 'pdf to microsoft word',
      'adobe pdf to word', 'export pdf to word', 'pdf converter', 'change pdf to word',
      'how to convert pdf to word', 'turn pdf into word', 'pdf to editable word', 
      'pdf to doc online', 'pdf to word free', 'convert pdf document to word',
      'pdf file to word', 'pdf file to docx', 'pdf file to doc', 'pdf text to word', 
      'open pdf in word', 'edit pdf in word', 'pdf content to word', 'pdf reader to word',
      'pdf to word software', 'pdf to word tool', 'convert pdf text to word'
    ],
    description: 'Convert PDF to DOCX',
    tip: 'Best for text-based PDFs. Scanned documents may need OCR processing first for best results.'
  },
  docxToPdf: {
    keywords: [
      'word to pdf', 'docx to pdf', 'doc to pdf', 'convert word to pdf', 'word pdf converter',
      'document to pdf', 'word document pdf', 'microsoft word to pdf', 'export word to pdf',
      'how to convert word to pdf', 'save word as pdf', 'turn word into pdf',
      'word file to pdf', 'docx file to pdf', 'doc file to pdf', 'convert doc to pdf',
      'convert docx to pdf online', 'word export pdf', 'word document export pdf'
    ],
    description: 'Convert DOCX to PDF',
    tip: 'Preserves formatting. Large documents with images may take longer to convert.'
  },
  docToDocx: {
    keywords: [
      'doc to docx', 'doc to word', 'convert doc to docx', 'convert doc to word',
      'legacy word to new word', 'doc file converter', 'word doc to docx',
      'microsoft doc to docx', 'convert legacy word to new format', 'docx converter',
      'upgrade word', 'old word format'
    ],
    description: 'DOC to DOCX',
    tip: 'Converts old DOC format to modern DOCX for better compatibility with Word 2007+.'
  },
  docxToDoc: {
    keywords: [
      'docx to doc', 'docx to word', 'convert docx to doc', 'convert docx to word',
      'word docx to legacy', 'docx file to doc', 'microsoft docx to doc',
      'new word to legacy word', 'word document to old format', 'doc converter',
      'downgrade word', 'old word format'
    ],
    description: 'DOCX to DOC',
    tip: 'Useful when sharing with users using older versions of Word (97-2003).'
  },
  pdfToText: {
    keywords: [
      'pdf to text', 'pdf extract text', 'pdf to txt', 'extract text from pdf', 'pdf text extractor',
      'pdf to plain text', 'pdf content extraction', 'pdf reader text', 'pdf to notepad',
      'convert pdf to text', 'turn pdf into txt', 'get text from pdf', 'pdf text converter',
      'extract pdf content', 'pdf text file', 'pdf document to text', 'pdf text copy', 
      'pdf text online', 'copy pdf text', 'convert pdf pages to text'
    ],
    description: 'Extract text from PDF',
    tip: 'Quickly extract all text content. Perfect for copying to other documents or analysis.'
  },
  textToPdf: {
    keywords: [
      'text to pdf', 'txt to pdf', 'convert text to pdf', 'text file to pdf',
      'plain text to pdf', 'notepad to pdf', 'create pdf from text', 'convert txt to pdf',
      'turn text into pdf', 'save text as pdf', 'txt file pdf converter',
      'text document to pdf', 'generate pdf from text', 'make pdf from txt', 'export text to pdf'
    ],
    description: 'Convert Text to PDF',
    tip: 'Upload a .txt file to create a formatted PDF document.'
  },
  textToDocx: {
    keywords: [
      'text to docx', 'txt to docx', 'convert text to word', 'plain text to word',
      'text file to word', 'create word document from text', 'txt to word', 'convert txt to docx',
      'generate word document', 'make word file from text', 'export text to word',
      'turn txt into docx', 'convert text document to word'
    ],
    description: 'Convert Text to DOCX',
    tip: 'Convert plain text files to editable Word documents with basic formatting.'
  },
  imageToPdf: {
    keywords: [
      // Exact match variations
      'image to pdf', 'images to pdf', 'convert image to pdf', 'convert images to pdf',
      'image pdf', 'images pdf', 'imagepdf', 'imagespdf',
      // Fuzzy/partial variations
      'img to pdf', 'imge to pdf', 'imgae to pdf', 'img to pd', 'image to pf',
      'image to pfd', 'images to pd', 'images to pfd', 'image to df',
      'img2pdf', 'images2pdf', 'image2pdf', 'imagetopdf', 'imagestopdf',
      // Format variations
      'jpg to pdf', 'png to pdf', 'jpeg to pdf', 'bmp to pdf', 'webp to pdf',
      'tiff to pdf', 'gif to pdf', 'heic to pdf', 'raw to pdf', 'cr2 to pdf', 'nef to pdf',
      'jpge to pdf', 'jpe to pdf', 'jpng to pdf', 'pgn to pdf', 'pnig to pdf',
      // Photo variations
      'photo to pdf', 'photos to pdf', 'photo pdf', 'photos pdf',
      'foto to pdf', 'fotograph to pdf', 'photograph to pdf',
      'pic to pdf', 'pics to pdf', 'pix to pdf', 'picture to pdf', 'pictures to pdf',
      'pic to pd', 'photo to pf', 'picture to pfd',
      // Screenshot variations
      'screenshot to pdf', 'screen shot to pdf', 'screen capture to pdf',
      'print screen to pdf', 'printscreen to pdf', 'screengrab to pdf',
      'snap to pdf', 'snip to pdf', 'capture to pdf', 'scrot to pdf',
      'screenshot pdf', 'screen capture pdf', 'screen shot pdf',
      // Scan variations
      'scan to pdf', 'scanned to pdf', 'scanner to pdf', 'scanning to pdf',
      'scaned to pdf', 'scann to pdf', 'scan pdf', 'scanned pdf',
      'digitize to pdf', 'digitised to pdf', 'digitized to pdf',
      // Action variations
      'convert picture to pdf', 'convert photo to pdf', 'convert screenshot to pdf',
      'make pdf from image', 'make pdf from images', 'create pdf from image',
      'create pdf from images', 'generate pdf from image', 'generate pdf from images',
      'turn image into pdf', 'turn images into pdf', 'transform image to pdf',
      'change image to pdf', 'switch image to pdf', 'save image as pdf',
      // Batch variations
      'combine images to pdf', 'combine pictures to pdf', 'multiple images to pdf',
      'batch images to pdf', 'bulk image to pdf', 'merge images into pdf',
      'merge pictures into pdf', 'join images to pdf', 'merge photos to pdf',
      'add images to pdf', 'append images to pdf', 'attach images to pdf',
      // Document variations
      'photo to document', 'picture to document', 'image to document',
      'make document from image', 'create document from image',
      'image to adobe pdf', 'photo to adobe pdf', 'picture to adobe pdf',
      // Common user queries
      'how to convert image to pdf', 'how to make pdf from image',
      'free image to pdf', 'online image to pdf', 'image to pdf converter',
      'photo to pdf converter', 'picture to pdf converter', 'jpg png to pdf',
      'all images to pdf', 'every image to pdf', 'gallery to pdf',
      // UI/Usage variations
      'upload image to pdf', 'select image to pdf', 'drop image to pdf',
      'drag image to pdf', 'image upload to pdf', 'convert my image to pdf',
      'send image to pdf', 'share image as pdf', 'export image to pdf',
      // Additional format variations
      'image conversion pdf', 'photo conversion pdf', 'picture conversion pdf',
      'convert image file to pdf', 'convert photo file to pdf', 'convert picture file to pdf',
      'imge pdf', 'imgae pdf', 'img pdf', 'imge to pf', 'imgae to pf',
    ],
    description: 'Convert Images to PDF',
    tip: 'Select multiple images and they will be combined into a single PDF in the order shown. Supports JPG, PNG, WEBP, BMP, TIFF, GIF, HEIC and more. Drag and drop to reorder images.'
  },
  watermark: {
    keywords: [
      'watermark pdf', 'pdf watermark', 'add watermark to pdf', 'pdf stamp', 'watermark text pdf',
      'image watermark pdf', 'logo watermark pdf', 'pdf branding', 'add stamp to pdf',
      'pdf annotation', 'watermark remover', 'insert watermark', 'pdf signature',
      'text or image watermark', 'brand pdf', 'pdf copyright mark', 'stamp', 'brand'
    ],
    description: 'Add watermark to PDF',
    tip: 'Add text or image watermarks to brand your PDFs or mark them as confidential.'
  },
  pdfToExcel: {
    keywords: [
      'pdf to excel', 'pdf to xlsx', 'pdf to spreadsheet', 'pdf table extraction', 'pdf to csv',
      'extract tables from pdf', 'pdf excel converter', 'pdf data extraction', 'convert pdf table to excel',
      'pdf to worksheet', 'scan pdf to excel', 'image pdf to excel', 'pdf spreadsheet conversion',
      'convert pdf to xls', 'pdf sheet extractor', 'turn pdf tables into excel', 'pdf data to excel',
      'extract table', 'table data'
    ],
    description: 'Convert PDF to Excel',
    tip: 'Best for PDFs with tables. Scanned PDFs will need OCR processing first.'
  },
  excelToPdf: {
    keywords: [
      'excel to pdf', 'xlsx to pdf', 'spreadsheet to pdf', 'excel pdf converter',
      'convert excel to pdf', 'worksheet to pdf', 'table to pdf', 'convert xls to pdf',
      'save excel as pdf', 'export spreadsheet to pdf', 'turn excel file into pdf',
      'excel file pdf conversion', 'excel sheet to pdf', 'generate pdf from excel'
    ],
    description: 'Convert Excel to PDF',
    tip: 'Converts all worksheets. Use page settings to control how data is spread across pages.'
  },
  pdfToPpt: {
    keywords: [
      'pdf to powerpoint', 'pdf to ppt', 'pdf to presentation', 'pdf slides to powerpoint',
      'convert pdf to ppt', 'pdf to slideshow', 'pdf presentation converter', 'turn pdf into ppt',
      'pdf file to powerpoint', 'pdf export ppt', 'make powerpoint from pdf', 'pdf pages to slides',
      'slides', 'presentation'
    ],
    description: 'Convert PDF to PowerPoint',
    tip: 'Each PDF page becomes a slide. Text is editable but complex layouts may need adjustments.'
  },
  pptxToPdf: {
    keywords: [
      'powerpoint to pdf', 'ppt to pdf', 'presentation to pdf', 'convert powerpoint to pdf',
      'slides to pdf', 'pptx pdf converter', 'export presentation to pdf', 'turn ppt into pdf',
      'save powerpoint as pdf', 'convert pptx to pdf online', 'ppt file pdf conversion'
    ],
    description: 'Convert PowerPoint to PDF',
    tip: 'Choose whether to include hidden slides and what layout to use for handouts.'
  },

  // PDF Operations - IDs match HomePage.js operationNames
  lock: {
    keywords: [
      'lock pdf', 'pdf lock', 'password protect pdf', 'encrypt pdf', 'secure pdf',
      'pdf encryption', 'protect pdf', 'pdf security', 'add password to pdf',
      'pdf protection', 'make pdf read only', 'pdf locker', 'set pdf password',
      'pdf password protection', 'secure document', 'encrypt pdf file', 'pdf restricted',
      'pdf access control', 'password', 'protect', 'pdf encryption password',
      'restrict pdf access', 'pdf cannot copy', 'pdf cannot edit', 'pdf read only',
      'pdf security settings', 'pdf permissions', 'owner password pdf', 'user password pdf',
      'secure pdf with password', 'lock pdf document', 'lock pdf file', 'pdf encryption tool',
      'protect pdf document', 'protect pdf file', 'pdf security software', 'pdf lock tool',
      'encrypt pdf document', 'encrypt pdf file', 'make pdf private', 'password protect document',
      'pdf restricted access', 'pdf prevent editing', 'pdf prevent printing', 'pdf prevent copying',
      'confidential pdf', 'private pdf', 'sensitive pdf protection', 'secure pdf sharing',
      'pdf encryption level', 'pdf 128 bit encryption', 'pdf 256 bit encryption',
    ],
    description: 'Lock PDF with password',
    tip: 'Use a strong password you will remember. The encrypted PDF cannot be opened without it. Choose between user password (open) and owner password (permissions).'
  },
  unlock: {
    keywords: [
      'unlock pdf', 'pdf unlock', 'remove password from pdf', 'pdf decryption', 'decrypt pdf',
      'open locked pdf', 'pdf password remover', 'break pdf password', 'pdf crack',
      'remove pdf protection', 'pdf to unlocked', 'unprotect pdf', 'remove pdf security',
      'bypass pdf password', 'pdf unlocker', 'decrypt pdf file', 'remove protection', 'forgot password',
      'remove password protection', 'remove encryption from pdf', 'pdf password recovery',
      'pdf password bypass', 'forgotten pdf password', 'locked pdf opener', 'open encrypted pdf',
      'pdf decryption tool', 'remove pdf restrictions', 'pdf owner password removal',
      'pdf user password removal', 'pdf permission removal', 'unlock secured pdf',
      'unlock protected pdf', 'decrypt protected pdf', 'pdf restriction remover',
      'remove pdf editing restrictions', 'remove pdf copy restrictions', 'remove pdf print restrictions',
    ],
    description: 'Unlock PDF password',
    tip: 'You need the original password to unlock the PDF. This tool cannot crack encrypted PDFs without the password. Some restrictions can be removed if you know the owner password.'
  },
  merge: {
    keywords: [
      'merge pdf', 'pdf merge', 'combine pdf', 'join pdf', 'pdf combiner', 'merge pdf files',
      'concatenate pdf', 'pdf join', 'pdf merge online', 'merge multiple pdf',
      'combine pdf files', 'pdf merger', 'unite pdf', 'pdf aggregator', 'join multiple pdfs',
      'pdf file merger', 'merge documents into pdf', 'combine pdf documents', 'combine', 'join',
      'pdf joiner', 'pdf combine', 'pdf combine files', 'combine multiple pdfs',
      'merge two pdfs', 'merge pdf documents', 'join pdf files', 'pdf concatenation',
      'pdf merger tool', 'pdf combine tool', 'batch pdf merge', 'multiple pdf merger',
      'unite pdf files', 'connect pdf files', 'link pdf files', 'attach pdf files',
      'add pdf to pdf', 'insert pdf into pdf', 'append pdf to pdf', 'prepend pdf to pdf',
      'combine pdf in order', 'reorder pdf merge', 'pdf merge with reorder',
      'free pdf merge', 'online pdf merge', 'pdf merge without watermark',
      'secure pdf merge', 'encrypted pdf merge', 'merge locked pdfs',
    ],
    description: 'Merge PDF files',
    tip: 'Upload multiple PDF files and they will be combined in the order you select them. Maximum 20 files per merge operation. Files are processed locally.'
  },
  split: {
    keywords: [
      'split pdf', 'pdf split', 'extract pdf pages', 'pdf page extraction', 'separate pdf',
      'pdf divide', 'pdf splitter', 'pdf extract', 'split pdf into pages',
      'break pdf', 'cut pdf', 'pdf division', 'separate pages from pdf', 'extract pages from pdf',
      'split document into pdf pages', 'divide pdf into multiple files', 'extract', 'separate',
      'pdf page splitter', 'extract page from pdf', 'get pages from pdf', 'pull pages from pdf',
      'remove pages from pdf', 'delete pages from pdf', 'pdf page extraction tool',
      'pdf page range extractor', 'extract specific pages', 'pdf single page extraction',
      'pdf every page to separate', 'pdf to multiple files', 'pdf divide into parts',
      'pdf partition', 'pdf segment', 'pdf section', 'split pdf by bookmark',
      'split pdf by size', 'split pdf by text', 'split pdf automatically',
      'pdf split tool', 'pdf extract tool', 'pdf page remover', 'pdf page deleter',
      'free pdf split', 'online pdf split', 'pdf split without loss',
    ],
    description: 'Split PDF pages',
    tip: 'Enter page ranges like "1-3,4,5-7" to extract specific pages from your PDF. Supports single pages, ranges, and combinations. Downloaded as ZIP for multiple pages.'
  },
  search: {
    keywords: [
      'search in pdf', 'pdf search', 'find in pdf', 'pdf text search', 'search pdf content',
      'pdf finder', 'pdf text finder', 'search within pdf', 'pdf grep',
      'find words in pdf', 'search document', 'lookup pdf text', 'pdf content lookup',
      'search inside pdf', 'pdf keyword search', 'pdf full text search', 'find', 'lookup',
      'pdf text extraction search', 'pdf content search', 'pdf document search',
      'search all pdfs', 'pdf batch search', 'pdf multi file search',
      'pdf find and highlight', 'pdf text highlighting', 'pdf search results',
      'pdf search tool', 'pdf search software', 'pdf search engine',
      'pdf index search', 'pdf catalog search', 'pdf database search',
      'find text in scanned pdf', 'search image based pdf', 'pdf ocr search',
      'search within document', 'find word occurrence', 'pdf replace text',
      'pdf count occurrences', 'pdf search case sensitive', 'pdf search regex',
      'pdf advanced search', 'pdf wildcard search', 'pdf pattern search',
    ],
    description: 'Search text in PDF',
    tip: 'Search for specific words or phrases within your PDF document. Highlights all occurrences and shows context around matches. Supports case-insensitive search.'
  },

  // Image Operations
  convertImages: {
    keywords: [
      'convert image', 'image converter', 'image format conversion', 'batch image converter',
      'convert between formats', 'image to image', 'change image format', 'image file converter',
      'jpg to png', 'png to jpg', 'webp converter', 'image type conversion', 'photo format change',
      'convert format', 'change format', 'batch convert'
    ],
    description: 'Convert image formats',
    tip: 'Convert images between formats. Supports JPG, PNG, WEBP, and BMP formats.'
  },
  resizeImage: {
    keywords: [
      'resize image', 'image resize', 'resize pictures', 'image resizer', 'resize photos',
      'scale image', 'image scaling', 'change image size', 'reduce image size',
      'increase image size', 'image dimensions', 'compress image size', 'shrink image',
      'enlarge image', 'adjust image resolution', 'image resizer tool', 'image editing size',
      'resize', 'scale', 'dimensions', 'size'
    ],
    description: 'Resize images',
    tip: 'Reduce file size by resizing. Optionally maintain aspect ratio to prevent distortion.'
  },

  // Individual Image Conversions
  jpgToPng: {
    keywords: [
      'jpg to png', 'jpeg to png', 'convert jpg to png', 'jpg png converter',
      'change jpg to png', 'jpg file to png', 'jpeg converter png', 'convert jpeg to png',
      'jpg to png online', 'jpg to png free', 'jpg image to png'
    ],
    description: 'Convert JPG to PNG',
    tip: 'Removes JPEG compression artifacts. Good for images that need transparency.'
  },
  jpgToWebp: {
    keywords: [
      'jpg to webp', 'jpeg to webp', 'convert jpg to webp', 'jpg webp converter',
      'optimize jpg for web', 'jpg to webp online', 'compress jpg to webp',
      'jpeg to webp', 'convert jpeg to webp', 'jpg image to webp', 'jpg to webp free'
    ],
    description: 'Convert JPG to WEBP',
    tip: 'Creates smaller files with similar quality. Great for web use and faster loading.'
  },
  jpgToBmp: {
    keywords: [
      'jpg to bmp', 'jpeg to bmp', 'convert jpg to bmp', 'jpg bmp converter',
      'jpg to bitmap', 'jpeg to bitmap', 'jpg bmp', 'jpg to bmp online', 'jpeg to bmp converter'
    ],
    description: 'Convert JPG to BMP',
    tip: 'Creates uncompressed bitmap files. Larger file size but no compression loss.'
  },
  pngToJpg: {
    keywords: [
      'png to jpg', 'png to jpeg', 'convert png to jpg', 'png jpg converter',
      'png to jpeg converter', 'change png to jpg', 'png file to jpg', 'png to jpg online',
      'convert png image to jpg'
    ],
    description: 'Convert PNG to JPG',
    tip: 'Creates smaller files. Note: Transparency will become white background.'
  },
  pngToWebp: {
    keywords: [
      'png to webp', 'convert png to webp', 'png webp converter', 'optimize png for web',
      'png to webp online', 'compress png to webp', 'png image to webp'
    ],
    description: 'Convert PNG to WEBP',
    tip: 'Smaller file sizes with full transparency support. Ideal for modern web development.'
  },
  pngToBmp: {
    keywords: ['png to bmp', 'convert png to bmp', 'png bmp converter', 'png to bitmap', 'change png to bmp'],
    description: 'Convert PNG to BMP',
    tip: 'Creates uncompressed bitmap files for maximum compatibility.'
  },
  webpToJpg: {
    keywords: ['webp to jpg', 'webp to jpeg', 'convert webp to jpg', 'webp jpg converter', 'webp to jpeg', 'webp converter', 'change webp to jpg'],
    description: 'Convert WEBP to JPG',
    tip: 'Convert modern WEBP images to standard JPEG format for wider compatibility.'
  },
  webpToPng: {
    keywords: ['webp to png', 'convert webp to png', 'webp png converter', 'webp to png converter', 'change webp to png', 'webp image to png'],
    description: 'Convert WEBP to PNG',
    tip: 'Preserves transparency. Good when you need PNG format from a WEBP source.'
  },
  webpToBmp: {
    keywords: ['webp to bmp', 'convert webp to bmp', 'webp bmp converter', 'webp to bitmap', 'change webp to bmp'],
    description: 'Convert WEBP to BMP',
    tip: 'Creates uncompressed bitmap files from WEBP images.'
  },
  bmpToJpg: {
    keywords: ['bmp to jpg', 'bmp to jpeg', 'convert bmp to jpg', 'bmp jpg converter', 'bitmap to jpg', 'bmp to jpeg', 'convert bitmap to jpeg'],
    description: 'Convert BMP to JPG',
    tip: 'Significantly reduces file size. Perfect for sharing photos while maintaining quality.'
  },
  bmpToPng: {
    keywords: ['bmp to png', 'convert bmp to png', 'bmp png converter', 'bitmap to png', 'bmp to png converter'],
    description: 'Convert BMP to PNG',
    tip: 'Creates compressed files with lossless quality. Good for archiving images.'
  },
  bmpToWebp: {
    keywords: ['bmp to webp', 'convert bmp to webp', 'bmp webp converter', 'bitmap to webp', 'optimize bmp for web'],
    description: 'Convert BMP to WEBP',
    tip: 'Creates smaller files for web use while maintaining good quality.'
  },

  // OCR Operations
  ocrImage: {
    keywords: [
      'ocr', 'optical character recognition', 'extract text from image', 'image to text',
      'scanned document to text', 'scan to text', 'image text extraction',
      'photo to text', 'screenshot text extraction', 'handwriting to text',
      'extract words from image', 'read text from picture', 'image to editable text',
      'convert image to text', 'ocr scan', 'ocr photo', 'ocr handwriting',
      'text recognition', 'document scanner', 'pdf ocr', 'scan', 'extract text'
    ],
    description: 'OCR - Extract text from images',
    tip: 'Works best with clear, high-contrast images. Select the correct language for better accuracy.'
  },
  detectLanguage: {
    keywords: [
      'detect language', 'language detection', 'identify language', 'language recognizer',
      'what language is this', 'detect text language', 'language identifier',
      'recognize text language', 'language detection tool', 'language analyzer',
      'auto detect language', 'language identification', 'identify'
    ],
    description: 'Detect language in image',
    tip: 'Automatically identifies the language of text in your image for OCR processing.'
  },

  // Search
  searchPdf: {
    keywords: [
      'search in pdf', 'pdf search', 'find in pdf', 'pdf text search', 'search pdf content',
      'pdf finder', 'pdf text finder', 'search within pdf', 'pdf grep',
      'find words in pdf', 'search document', 'lookup pdf text', 'pdf content lookup',
      'search inside pdf', 'pdf keyword search', 'pdf full text search', 'find', 'lookup'
    ],
    description: 'Search text in PDF',
    tip: 'Search for specific words or phrases within your PDF document. Highlights all occurrences.'
  },

  // Archive Operations - IDs match DesktopNavbar.jsx
  zip: {
    keywords: [
      'zip', 'compress', 'zip folder', 'create zip', 'zip files', 'archive',
      'compress files', 'zip archive', 'make zip', 'zip compression',
      'zip files together', 'bundle files', 'zip folder online', 'compress folder',
      'create archive', 'make archive', 'pack files', 'archive files', 'compress folder files',
      'compress', 'bundle', 'archive'
    ],
    description: 'Create ZIP archive',
    tip: 'Select multiple files to compress into a single ZIP archive for easy sharing.'
  },
  unZip: {
    keywords: [
      'unzip', 'extract', 'unzip folder', 'extract zip', 'open zip', 'unarchive',
      'extract zip files', 'unzip archive', 'decompress', 'uncompress',
      'extract files from zip', 'extract compressed files', 'open compressed folder', 'unpack zip',
      'extract', 'decompress', 'open archive'
    ],
    description: 'Extract ZIP archive',
    tip: 'Upload a ZIP file to extract all its contents. Download individual files or the whole archive.'
  },
};

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Edit distance
 */
export function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  
  // Create matrix
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  // Initialize first column and row
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion
          dp[i][j - 1],     // insertion
          dp[i - 1][j - 1]  // substitution
        );
      }
    }
  }
  
  return dp[m][n];
}

/**
 * Get confidence level based on score percentage
 * @param {number} score - Score percentage (0-100)
 * @returns {string} - Confidence level (high/medium/low)
 */
export function getConfidenceLevel(score) {
  if (score >= 70) return CONFIDENCE_LEVEL.HIGH;
  if (score >= 40) return CONFIDENCE_LEVEL.MEDIUM;
  return CONFIDENCE_LEVEL.LOW;
}

/**
 * Detect match type based on score and query characteristics
 * @param {number} score - Score percentage (0-100)
 * @param {string} query - Original search query
 * @param {Object} result - Search result item
 * @param {Object} breakdown - Score breakdown
 * @returns {string} - Match type
 */
export function detectMatchType(score, query, result, breakdown) {
  const normalizedQuery = query.toLowerCase().trim();
  const label = result.label.toLowerCase();
  const keywords = result.keywords || [];
  
  // Check for exact match
  if (label === normalizedQuery || 
      keywords.some(kw => kw.toLowerCase() === normalizedQuery)) {
    return MATCH_TYPE.EXACT;
  }
  
  // Check for exact match in label (high score)
  if (score >= 85 && breakdown.exactMatch) {
    return MATCH_TYPE.EXACT;
  }
  
  // Check for keyword match
  if (breakdown.keywordDensity > 0.4) {
    return MATCH_TYPE.KEYWORD;
  }
  
  // Check for category match
  if (result.searchCategory && 
      (normalizedQuery.includes(result.searchCategory) || 
       result.searchCategory.includes(normalizedQuery))) {
    return MATCH_TYPE.CATEGORY;
  }
  
  // Check for partial match (significant matching)
  if (score >= 60 && breakdown.termCoverage >= 0.5) {
    return MATCH_TYPE.PARTIAL;
  }
  
  // Check for fuzzy match (lower score but still a match)
  if (score >= 40 && breakdown.termCoverage >= 0.3) {
    return MATCH_TYPE.PARTIAL;
  }
  
  // Default to fuzzy for any match above minimum threshold
  if (score >= 25) {
    return MATCH_TYPE.FUZZY;
  }
  
  return MATCH_TYPE.FUZZY;
}

/**
 * Expand query with synonyms and fuzzy variations
 * @param {string} query - Original query
 * @returns {Array} - Array of expanded query terms
 */
export function expandQuery(query) {
  const normalizedQuery = query.toLowerCase().trim();
  const terms = normalizedQuery.split(/\s+/);
  const expandedTerms = new Set([...terms]);
  
  // Add each term and its variations
  terms.forEach(term => {
    // Add direct synonyms
    if (SYNONYMS[term]) {
      SYNONYMS[term].forEach(synonym => expandedTerms.add(synonym));
    }
    
    // Add partial matches in synonyms (fuzzy matching)
    Object.keys(SYNONYMS).forEach(key => {
      // Check if key contains term or term contains key
      if (key.includes(term) || term.includes(key)) {
        SYNONYMS[key].forEach(synonym => expandedTerms.add(synonym));
      }
      
      // Check for fuzzy matches (3+ consecutive characters match)
      for (let i = 0; i <= Math.min(key.length, term.length) - 3; i++) {
        const keySubstr = key.substring(i, i + 3);
        if (term.includes(keySubstr)) {
          SYNONYMS[key].forEach(synonym => expandedTerms.add(synonym));
          break;
        }
      }
    });
    
    // Add common fuzzy variations
    // Remove common suffixes
    const baseTerm = term.replace(/(ing|ation|ment|ness|ed|en|s|es)$/, '');
    if (baseTerm !== term) {
      expandedTerms.add(baseTerm);
      // Try to find synonyms for base term
      if (SYNONYMS[baseTerm]) {
        SYNONYMS[baseTerm].forEach(synonym => expandedTerms.add(synonym));
      }
    }
    
    // Add variations with common prefixes/suffixes
    const prefixes = ['re', 'un', 'dis', 'over', 'under', 'mis', 'pre', 'post', 'anti', 'de'];
    const suffixes = ['able', 'ible', 'al', 'ful', 'less', 'ous', 'ive', 'ic', 'y', 'er', 'or', 'ist', 'ism'];
    
    prefixes.forEach(prefix => {
      if (term.startsWith(prefix)) {
        const withoutPrefix = term.slice(prefix.length);
        expandedTerms.add(withoutPrefix);
      }
    });
    
    suffixes.forEach(suffix => {
      if (term.endsWith(suffix)) {
        const withoutSuffix = term.slice(0, -suffix.length);
        expandedTerms.add(withoutSuffix);
      }
    });
  });
  
  // Add compound variations
  if (terms.length >= 2) {
    // Add joined version (e.g., "image" + "to" + "pdf" -> "imagetopdf")
    expandedTerms.add(terms.join(''));
    expandedTerms.add(terms.join('_'));
    expandedTerms.add(terms.join('-'));
    
    // Add "2" as "to" substitution (e.g., "jpg2pdf")
    if (terms.includes('to')) {
      const toIndex = terms.indexOf('to');
      const with2 = [...terms];
      with2[toIndex] = '2';
      expandedTerms.add(with2.join(''));
      expandedTerms.add(with2.join('_'));
    }
  }
  
  return Array.from(expandedTerms);
}

/**
 * Get spelling suggestions for common typos
 * @param {string} query - Original query
 * @returns {Array} - Array of suggested corrections
 */
export function getSpellingSuggestions(query) {
  const normalizedQuery = query.toLowerCase().trim();
  const terms = normalizedQuery.split(/\s+/);
  const suggestions = [];
  
  terms.forEach(term => {
    if (COMMON_TYPOS[term]) {
      suggestions.push(...COMMON_TYPOS[term]);
    }
    
    // Check for similar terms (1-2 character difference)
    Object.keys(COMMON_TYPOS).forEach(key => {
      if (key !== term && levenshteinDistance(key, term) <= 2) {
        suggestions.push(...COMMON_TYPOS[key]);
        suggestions.push(key);
      }
    });
  });
  
  return [...new Set(suggestions)];
}

/**
 * Calculate score breakdown for transparency
 * @param {Object} result - Fuse.js search result
 * @param {string} query - Original search query
 * @param {number} finalScore - Final calculated score
 * @returns {Object} - Score breakdown object
 */
export function calculateScoreBreakdown(result, query, finalScore) {
  const normalizedQuery = query.toLowerCase().trim();
  const queryTerms = normalizedQuery.split(/\s+/);
  const searchTerms = result.item.combinedSearchTerms || '';
  const label = result.item.label.toLowerCase();
  
  const breakdown = {
    baseScore: 0,
    exactMatchBonus: 0,
    keywordDensity: 0,
    categoryBoost: 0,
    lengthNormalization: 0,
    finalScore: finalScore,
    termCoverage: 0,
    matchedTerms: [],
  };
  
  // Check exact match in label
  breakdown.exactMatch = label.includes(normalizedQuery);
  if (breakdown.exactMatch) {
    breakdown.exactMatchBonus = 20;
  }
  
  // Calculate term coverage
  let matchedTerms = [];
  queryTerms.forEach(term => {
    if (term.length > 2 && searchTerms.includes(term)) {
      matchedTerms.push(term);
    }
  });
  breakdown.matchedTerms = matchedTerms;
  breakdown.termCoverage = matchedTerms.length / Math.max(queryTerms.length, 1);
  
  // Keyword density
  breakdown.keywordDensity = Math.min(breakdown.termCoverage * 1.5, 1);
  
  // Category boost
  const category = result.item.searchCategory || '';
  if (category && normalizedQuery.includes(category)) {
    breakdown.categoryBoost = 10;
  }
  
  // Query length normalization (shorter queries are harder to match)
  const lengthFactor = Math.max(0.8, 1 - (normalizedQuery.length / 50));
  breakdown.lengthNormalization = Math.round(lengthFactor * 10);
  
  // Base score from Fuse
  if (result.score !== undefined) {
    breakdown.baseScore = Math.round((1 - result.score) * 100);
  }
  
  return breakdown;
}

/**
 * Build enhanced search index with keywords
 * @param {Array} operations - Array of operation objects
 * @returns {Array} - Enhanced operations with keywords
 */
export function buildSearchIndex(operations) {
  return operations.map(op => {
    const keywords = OPERATION_KEYWORDS[op.id];
    return {
      ...op,
      searchLabel: op.label.toLowerCase(),
      searchCategory: op.category.toLowerCase(),
      // Add operation id as searchable term
      searchId: op.id.toLowerCase().replace(/([A-Z])/g, ' $1').trim(),
      keywords: keywords ? keywords.keywords : [],
      description: keywords ? keywords.description : '',
      combinedSearchTerms: [
        op.label.toLowerCase(),
        op.category.toLowerCase(),
        op.id.toLowerCase(),
        // Add spaced version of camelCase id (e.g., "pdfToDocx" -> "pdf to docx")
        op.id.replace(/([A-Z])/g, ' $1').toLowerCase(),
        ...(keywords ? keywords.keywords : []),
      ].join(' '),
    };
  });
}

/**
 * Create Fuse.js instance for fuzzy search
 * @param {Array} searchIndex - Enhanced search index
 * @returns {Fuse} - Configured Fuse instance
 */
export function createFuseSearch(searchIndex) {
  const options = {
    includeScore: true,
    includeMatches: true,
    threshold: 0.5, // Higher threshold for more fuzzy matching (0.0 = exact, 1.0 = match anything)
    distance: 200, // Increased distance for better partial matching
    ignoreLocation: true, // Search anywhere in the string
    minMatchCharLength: 2, // Allow matching with 2+ characters
    keys: [
      { name: 'label', weight: 2.5 }, // Highest weight for exact label matches
      { name: 'searchId', weight: 2.0 }, // Operation ID (e.g., "pdf to docx")
      { name: 'combinedSearchTerms', weight: 1.5 }, // All keywords and variations
      { name: 'category', weight: 1.2 }, // Category name
      { name: 'description', weight: 1.0 }, // Operation description
      { name: 'keywords', weight: 0.8 }, // Individual keywords (already in combinedSearchTerms)
    ],
  };

  return new Fuse(searchIndex, options);
}

/**
 * Natural language query parser
 * Extracts intent and entities from search query
 * @param {string} query - User search query
 * @returns {Object} - Parsed query components
 */
export function parseNaturalLanguageQuery(query) {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Common operation patterns
  const patterns = {
    convert: /(?:convert|change|transform|turn)\s+(\w+)\s+(?:to|in(?:to)?)\s+(\w+)/i,
    extract: /(?:extract|pull|get|grab)\s+(\w+)\s+(?:from|out\s+of)/i,
    add: /(?:add|insert|put|include)\s+(\w+)\s+(?:to|into)/i,
    remove: /(?:remove|delete|take\s+out|strip)\s+(\w+)\s+(?:from)/i,
    merge: /(?:merge|combine|join|unite)\s+(\w+)/i,
    split: /(?:split|separate|cut|divide)\s+(\w+)/i,
    convertTo: /(\w+)\s+(?:to|in(?:to)?)\s+(\w+)/i,
  };

  // File format mappings
  const formatMappings = {
    'pdf': ['pdf', 'pdf file', 'adobe'],
    'docx': ['docx', 'word', 'word document', 'microsoft word', 'doc'],
    'excel': ['excel', 'xlsx', 'spreadsheet', 'excel file', 'worksheet'],
    'powerpoint': ['powerpoint', 'ppt', 'pptx', 'presentation', 'slides'],
    'text': ['text', 'txt', 'plain text', 'notepad'],
    'image': ['image', 'picture', 'photo', 'photo'],
    'png': ['png', 'png image', 'png file'],
    'jpg': ['jpg', 'jpeg', 'jpg image', 'jpeg image', 'jpg file'],
    'webp': ['webp', 'webp image', 'web picture'],
    'bmp': ['bmp', 'bitmap', 'bmp image'],
    'zip': ['zip', 'zip file', 'archive', 'compressed'],
  };

  return {
    original: query,
    normalized: normalizedQuery,
    patterns,
    formatMappings,
  };
}

/**
 * Calculate relevance score for search results (returns 0-100)
 * @param {Object} result - Fuse.js search result
 * @param {string} query - Original search query
 * @returns {Object} - Score object with percentage and breakdown
 */
export function calculateRelevanceScore(result, query) {
  const normalizedQuery = query.toLowerCase().trim();
  const queryTerms = normalizedQuery.split(/\s+/);
  
  let score = 30; // Start with lower base score for more fuzzy matches
  
  // Apply Fuse score (inverted, higher is better)
  if (result.score !== undefined) {
    const fuseScore = Math.max(0, 1 - result.score);
    score = Math.round(fuseScore * 50); // Base weight from Fuse
  }
  
  // Boost exact matches in label (+15%)
  const labelMatch = result.item.label.toLowerCase();
  if (labelMatch.includes(normalizedQuery)) {
    score += 15;
  }
  
  // Boost matches in search terms
  const searchTerms = result.item.combinedSearchTerms || '';
  let matchedTerms = [];
  queryTerms.forEach(term => {
    if (searchTerms.includes(term) && term.length > 2) {
      matchedTerms.push(term);
    }
  });
  
  const termBoost = matchedTerms.length / Math.max(queryTerms.length, 1);
  score += Math.round(termBoost * 35);
  
  // Fuzzy match bonus for partial matches
  if (result.score !== undefined && result.score < 0.5) {
    score += 10; // Bonus for reasonably close fuzzy matches
  }
  
  // Normalize to 0-100 range (allow lower scores to show)
  score = Math.max(20, Math.min(100, score));
  
  // Calculate breakdown
  const breakdown = {
    baseScore: score >= 50 ? Math.round(score * 0.7) : score,
    exactMatchBonus: labelMatch.includes(normalizedQuery) ? 15 : 0,
    keywordDensity: Math.round(termBoost * 100) / 100,
    categoryBoost: 0,
    lengthNormalization: Math.max(0.8, 1 - (normalizedQuery.length / 50)) * 10,
    termCoverage: Math.round(termBoost * 100) / 100,
    matchedTerms: matchedTerms,
  };
  
  // Check for category match
  const category = result.item.searchCategory || '';
  if (category && normalizedQuery.includes(category)) {
    breakdown.categoryBoost = 10;
    score += 10;
  }
  
  breakdown.finalScore = score;
  
  return {
    percentage: score,
    breakdown: breakdown,
  };
}

/**
 * Main search function with AI-powered fuzzy matching
 * @param {string} query - Search query
 * @param {Array} operations - Array of operations to search
 * @param {number} maxResults - Maximum results to return
 * @returns {Array} - Sorted search results with enhanced metadata
 */
export function aiSearchOperations(query, operations, maxResults = 10) {
  if (!query || !query.trim()) {
    return [];
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Get spelling suggestions
  const suggestions = getSpellingSuggestions(normalizedQuery);
  
  // Expand query with synonyms
  const expandedTerms = expandQuery(normalizedQuery);
  
  // Build search index
  const searchIndex = buildSearchIndex(operations);
  
  // Create Fuse instance
  const fuse = createFuseSearch(searchIndex);
  
  // Perform fuzzy search with expanded query
  const searchQuery = expandedTerms.join(' ');
  const results = fuse.search(searchQuery);
  
  // Map and sort results with enhanced metadata
  const mappedResults = results.map(result => {
    const scoreData = calculateRelevanceScore(result, normalizedQuery);
    const matchType = detectMatchType(
      scoreData.percentage,
      normalizedQuery,
      result.item,
      scoreData.breakdown
    );
    const confidenceLevel = getConfidenceLevel(scoreData.percentage);
    
    return {
      operation: result.item,
      percentage: scoreData.percentage,
      confidence: confidenceLevel,
      matchType: matchType,
      matches: result.matches || [],
      matchedTerms: scoreData.breakdown.matchedTerms,
      scoreBreakdown: scoreData.breakdown,
    };
  });
  
  // Sort by relevance score
  mappedResults.sort((a, b) => b.percentage - a.percentage);
  
  // Get top results
  const topResults = mappedResults.slice(0, maxResults);
  
  // Add suggestions if available and no high-confidence results
  const hasHighConfidence = topResults.some(r => r.confidence === CONFIDENCE_LEVEL.HIGH);
  
  return {
    results: topResults,
    suggestions: hasHighConfidence ? [] : suggestions.slice(0, 3),
    expandedQuery: expandedTerms,
    query: query,
  };
}

/**
 * Direct operation lookup - provides exact/fuzzy matching for operation IDs and labels
 * This is used when Fuse.js doesn't find a good match
 * @param {string} query - Search query
 * @param {Array} operations - Array of operations
 * @returns {Object|null} - Best matching operation or null
 */
export function directOperationLookup(query, operations) {
  if (!query || !query.trim()) return null;
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // First, try exact match on ID (case-insensitive)
  for (const op of operations) {
    if (op.id.toLowerCase() === normalizedQuery) {
      return { operation: op, confidence: 1.0, matchType: 'EXACT_ID' };
    }
  }
  
  // Try exact match on label
  for (const op of operations) {
    if (op.label.toLowerCase() === normalizedQuery) {
      return { operation: op, confidence: 0.95, matchType: 'EXACT_LABEL' };
    }
  }
  
  // Try fuzzy match on ID (handle camelCase like "pdfToDocx")
  for (const op of operations) {
    const spacedId = op.id.replace(/([A-Z])/g, ' $1').toLowerCase();
    if (spacedId === normalizedQuery || op.id.toLowerCase().includes(normalizedQuery)) {
      return { operation: op, confidence: 0.9, matchType: 'FUZZY_ID' };
    }
  }
  
  // Try partial label match
  for (const op of operations) {
    if (op.label.toLowerCase().includes(normalizedQuery)) {
      return { operation: op, confidence: 0.85, matchType: 'PARTIAL_LABEL' };
    }
  }
  
  // Try matching individual words from query to operation labels
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
  let bestMatch = null;
  let bestScore = 0;
  
  for (const op of operations) {
    const labelLower = op.label.toLowerCase();
    let score = 0;
    
    for (const word of queryWords) {
      if (labelLower.includes(word)) {
        score += 1;
      }
      // Check if word matches part of camelCase ID
      const spacedId = op.id.replace(/([A-Z])/g, ' $1').toLowerCase();
      if (spacedId.includes(word)) {
        score += 1.5; // Extra points for ID match
      }
    }
    
    // Normalize score by query length
    const normalizedScore = score / Math.max(queryWords.length, 1);
    
    if (normalizedScore > bestScore && score > 0) {
      bestScore = normalizedScore;
      bestMatch = { operation: op, confidence: normalizedScore * 0.8, matchType: 'WORD_MATCH' };
    }
  }
  
  return bestMatch;
}

/**
 * Quick search for single operation lookup
 * @param {string} query - Search query
 * @param {Array} operations - Array of operations
 * @returns {Object|null} - Best matching operation or null
 */
export function quickSearchOperation(query, operations) {
  // First try direct lookup for exact matches
  const directResult = directOperationLookup(query, operations);
  if (directResult && directResult.confidence >= 0.85) {
    return directResult.operation;
  }
  
  // Fall back to Fuse.js search
  const searchResult = aiSearchOperations(query, operations, 1);
  return searchResult.results.length > 0 ? searchResult.results[0].operation : null;
}

/**
 * Search Intent Types
 */
export const SEARCH_INTENT = {
  CONVERSION: 'conversion',
  EXTRACTION: 'extraction',
  PROTECTION: 'protection',
  MANIPULATION: 'manipulation',
  CONVERSION_FROM: 'conversion_from',
  CONVERSION_TO: 'conversion_to',
  COMPRESSION: 'compression',
  OCR: 'ocr',
  ARCHIVE: 'archive',
  SEARCH: 'search',
  UNKNOWN: 'unknown',
};

/**
 * Detect search intent from natural language query
 * @param {string} query - User search query
 * @returns {Object} - Detected intent with type and confidence
 */
export function detectSearchIntent(query) {
  const normalizedQuery = query.toLowerCase().trim();
  
  const intentPatterns = {
    [SEARCH_INTENT.CONVERSION]: [
      /(?:convert|change|transform|turn|make)\s+(.+?)\s+(?:to|in(?:to)?)\s+(.+)/i,
      /(.+?)\s+(?:to|in(?:to)?)\s+(.+)/i,
    ],
    [SEARCH_INTENT.EXTRACTION]: [
      /(?:extract|pull|get|grab|remove|take)\s+(.+?)\s+(?:from|out\s+of)/i,
      /(?:extract|pull|get)\s+(.+)/i,
    ],
    [SEARCH_INTENT.PROTECTION]: [
      /(?:lock|protect|encrypt|secure|password)/i,
      /(?:unlock|decrypt|remove\s+password)/i,
    ],
    [SEARCH_INTENT.MANIPULATION]: [
      /(?:merge|combine|join|unite|concatenate)/i,
      /(?:split|separate|cut|divide|break)/i,
      /(?:resize|scale|adjust|change\s+size)/i,
    ],
    [SEARCH_INTENT.COMPRESSION]: [
      /(?:compress|zip|archive|bundle|pack)/i,
      /(?:uncompress|unzip|extract|unarchive|unpack)/i,
    ],
    [SEARCH_INTENT.OCR]: [
      /(?:ocr|optical|character|recognition|text\s+from|image\s+to\s+text)/i,
    ],
    [SEARCH_INTENT.ARCHIVE]: [
      /(?:zip|archive|compress)/i,
      /(?:unzip|extract|unarchive|decompress)/i,
    ],
    [SEARCH_INTENT.SEARCH]: [
      /(?:search|find|lookup|query|grep)/i,
    ],
  };
  
  let detectedIntent = SEARCH_INTENT.UNKNOWN;
  let confidence = 0;
  let matchedTerms = [];
  let entities = { from: null, to: null, target: null };
  
  // Check each intent pattern
  for (const [intentType, patterns] of Object.entries(intentPatterns)) {
    for (const pattern of patterns) {
      const match = normalizedQuery.match(pattern);
      if (match) {
        if (detectedIntent === SEARCH_INTENT.UNKNOWN || confidence < 0.8) {
          detectedIntent = intentType;
          confidence = 0.8;
          matchedTerms.push(intentType);
          
          // Extract entities for conversion intents
          if (intentType === SEARCH_INTENT.CONVERSION && match.length >= 3) {
            entities.from = match[1];
            entities.to = match[2];
          } else if (intentType === SEARCH_INTENT.EXTRACTION && match.length >= 2) {
            entities.target = match[1];
          }
        }
        break;
      }
    }
  }
  
  // Check for file format mentions
  const fileFormats = ['pdf', 'docx', 'doc', 'excel', 'xlsx', 'ppt', 'pptx', 'text', 'txt', 
                        'image', 'png', 'jpg', 'jpeg', 'webp', 'bmp', 'zip'];
  for (const format of fileFormats) {
    if (normalizedQuery.includes(format)) {
      matchedTerms.push(format);
    }
  }
  
  return {
    type: detectedIntent,
    confidence: confidence,
    matchedTerms: matchedTerms,
    entities: entities,
    originalQuery: query,
  };
}

/**
 * Get smart real-time suggestions as user types
 * @param {string} partialQuery - Current partial search query
 * @param {Array} operations - Available operations
 * @param {number} maxSuggestions - Maximum suggestions to return
 * @returns {Array} - Smart suggestions array
 */
export function getSmartSuggestions(partialQuery, operations, maxSuggestions = 5) {
  if (!partialQuery || partialQuery.length < 2) {
    return [];
  }
  
  const normalizedQuery = partialQuery.toLowerCase().trim();
  const suggestions = new Set();
  
  // Add keyword-based suggestions
  Object.keys(OPERATION_KEYWORDS).forEach(opId => {
    const keywords = OPERATION_KEYWORDS[opId].keywords || [];
    keywords.forEach(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      
      // Check if partial query is a prefix of keyword
      if (lowerKeyword.startsWith(normalizedQuery) && normalizedQuery.length > 2) {
        suggestions.add(keyword);
      }
      
      // Check if keyword starts with partial query
      if (normalizedQuery.length > 2 && lowerKeyword.includes(normalizedQuery)) {
        suggestions.add(keyword);
      }
    });
  });
  
  // Add operation label suggestions
  operations.forEach(op => {
    const label = op.label.toLowerCase();
    if (label.includes(normalizedQuery) || normalizedQuery.includes(label.split(' ')[0])) {
      suggestions.add(op.label);
    }
  });
  
  // Add synonym-based suggestions
  Object.keys(SYNONYMS).forEach(term => {
    const synonyms = SYNONYMS[term];
    synonyms.forEach(synonym => {
      const lowerSynonym = synonym.toLowerCase();
      if (lowerSynonym.startsWith(normalizedQuery) && normalizedQuery.length > 2) {
        suggestions.add(synonym);
      }
    });
  });
  
  // Return top suggestions
  return Array.from(suggestions).slice(0, maxSuggestions);
}

/**
 * Contextual query expansion with domain knowledge
 * @param {string} query - Original search query
 * @param {Object} context - Additional context (optional)
 * @returns {Object} - Expanded query with details
 */
export function contextualQueryExpansion(query, context = {}) {
  const normalizedQuery = query.toLowerCase().trim();
  const terms = normalizedQuery.split(/\s+/);
  const expandedTerms = new Set(terms);
  
  // Add domain-specific expansions
  const domainExpansions = {
    // Document conversions
    'pdf': ['pdf', 'pdf file', 'document', 'adobe', 'portable document format'],
    'docx': ['docx', 'word', 'word document', 'microsoft word', 'doc', 'document'],
    'excel': ['excel', 'xlsx', 'spreadsheet', 'worksheet', 'table', 'data'],
    'powerpoint': ['powerpoint', 'ppt', 'pptx', 'presentation', 'slides', 'slideshow'],
    
    // Image formats
    'jpg': ['jpg', 'jpeg', 'jpg image', 'photo', 'picture'],
    'png': ['png', 'png image', 'transparent image'],
    'webp': ['webp', 'web picture', 'web image', 'optimized'],
    'bmp': ['bmp', 'bitmap', 'raster image'],
    
    // Operations
    'convert': ['convert', 'transform', 'change', 'export', 'save as'],
    'merge': ['merge', 'combine', 'join', 'unite', 'concatenate'],
    'split': ['split', 'separate', 'divide', 'extract'],
    'extract': ['extract', 'pull', 'get', 'grab', 'take out'],
    'compress': ['compress', 'zip', 'archive', 'bundle', 'reduce'],
    
    // Protection
    'lock': ['lock', 'encrypt', 'protect', 'secure', 'password'],
    'unlock': ['unlock', 'decrypt', 'remove password', 'open'],
  };
  
  // Expand each term with domain knowledge
  terms.forEach(term => {
    Object.keys(domainExpansions).forEach(key => {
      if (key.includes(term) || term.includes(key)) {
        domainExpansions[key].forEach(expansion => expandedTerms.add(expansion));
      }
    });
  });
  
  // Add context-based expansions if available
  if (context.recentSearches) {
    context.recentSearches.forEach(recentQuery => {
      const recentTerms = recentQuery.toLowerCase().split(/\s+/);
      recentTerms.forEach(term => {
        if (normalizedQuery.includes(term) || term.includes(normalizedQuery)) {
          expandedTerms.add(term);
        }
      });
    });
  }
  
  return {
    original: query,
    expandedTerms: Array.from(expandedTerms),
    expandedQuery: Array.from(expandedTerms).join(' '),
    isExpanded: expandedTerms.size > terms.length,
    expansionRatio: Math.round((expandedTerms.size / terms.length) * 100) / 100,
  };
}

/**
 * Get enhanced typo suggestions with smart ranking
 * @param {string} query - Original query
 * @param {number} maxSuggestions - Maximum suggestions
 * @returns {Object} - Suggestions with ranking info
 */
export function getTypoSuggestions(query, maxSuggestions = 5) {
  const normalizedQuery = query.toLowerCase().trim();
  const terms = normalizedQuery.split(/\s+/);
  const suggestions = [];
  
  // Common operations for typo checking
  const knownTerms = Object.keys(OPERATION_KEYWORDS);
  
  terms.forEach(term => {
    if (term.length < 3) return;
    
    // Find similar known terms
    knownTerms.forEach(knownTerm => {
      const keywords = OPERATION_KEYWORDS[knownTerm].keywords || [];
      keywords.forEach(keyword => {
        const lowerKeyword = keyword.toLowerCase();
        const distance = levenshteinDistance(term, lowerKeyword.split(' ')[0]);
        const similarity = 1 - (distance / Math.max(term.length, lowerKeyword.length));
        
        if (similarity > 0.5 && similarity < 1) {
          suggestions.push({
            original: term,
            suggestion: keyword,
            operation: knownTerm,
            similarity: Math.round(similarity * 100),
            distance: distance,
          });
        }
      });
    });
    
    // Check for format typos
    const formatTypos = {
      'pdf': ['pfd', 'dff', 'pdf', 'fdp'],
      'docx': ['doc', 'docx', 'dcx', 'dox'],
      'excel': ['exel', 'exel', 'xls'],
      'powerpoint': ['ppt', 'pptx', 'pp'],
    };
    
    Object.keys(formatTypos).forEach(format => {
      formatTypos[format].forEach(typo => {
        if (typo !== format) {
          const distance = levenshteinDistance(term, typo);
          const similarity = 1 - (distance / Math.max(term.length, typo.length));
          
          if (similarity > 0.6) {
            suggestions.push({
              original: term,
              suggestion: format,
              operation: null,
              similarity: Math.round(similarity * 100),
              distance: distance,
            });
          }
        }
      });
    });
  });
  
  // Sort by similarity (highest first) and remove duplicates
  const uniqueSuggestions = suggestions
    .sort((a, b) => b.similarity - a.similarity)
    .filter((item, index, self) => 
      index === self.findIndex((t) => t.suggestion === item.suggestion)
    )
    .slice(0, maxSuggestions);
  
  return {
    query: query,
    suggestions: uniqueSuggestions,
    hasSuggestions: uniqueSuggestions.length > 0,
  };
}

/**
 * Get confidence badge configuration
 * @param {string} confidence - Confidence level (high/medium/low)
 * @returns {Object} - Badge configuration with color and icon
 */
export function getConfidenceBadge(confidence) {
  const badges = {
    high: {
      level: 'HIGH',
      color: 'text-green-600',
      bgColor: 'bg-transparent',
      borderColor: 'border-green-300',
      icon: '✓',
      description: 'Strong match',
    },
    medium: {
      level: 'MEDIUM',
      color: 'text-blue-600',
      bgColor: 'bg-transparent',
      borderColor: 'border-blue-300',
      icon: '~',
      description: 'Good match',
    },
    low: {
      level: 'LOW',
      color: 'text-amber-600',
      bgColor: 'bg-transparent',
      borderColor: 'border-amber-300',
      icon: '?',
      description: 'Partial match',
    },
  };
  
  return badges[confidence] || badges.low;
}

/**
 * Get match type badge configuration
 * @param {string} matchType - Match type (EXACT, PARTIAL, FUZZY, KEYWORD, CATEGORY)
 * @returns {Object} - Badge configuration
 */
export function getMatchTypeBadge(matchType) {
  const badges = {
    EXACT: {
      type: 'EXACT',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: '◆',
      description: 'Exact match',
    },
    PARTIAL: {
      type: 'PARTIAL',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: '◇',
      description: 'Partial match',
    },
    KEYWORD: {
      type: 'KEYWORD',
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      icon: '●',
      description: 'Keyword match',
    },
    CATEGORY: {
      type: 'CATEGORY',
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      icon: '◉',
      description: 'Category match',
    },
    FUZZY: {
      type: 'FUZZY',
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: '○',
      description: 'Fuzzy match',
    },
  };
  
  return badges[matchType] || badges.FUZZY;
}

export default {
  MATCH_TYPE,
  CONFIDENCE_LEVEL,
  SEARCH_INTENT,
  SYNONYMS,
  COMMON_TYPOS,
  OPERATION_KEYWORDS,
  levenshteinDistance,
  getConfidenceLevel,
  detectMatchType,
  expandQuery,
  getSpellingSuggestions,
  calculateScoreBreakdown,
  buildSearchIndex,
  createFuseSearch,
  parseNaturalLanguageQuery,
  calculateRelevanceScore,
  aiSearchOperations,
  quickSearchOperation,
  directOperationLookup,
  detectSearchIntent,
  getSmartSuggestions,
  contextualQueryExpansion,
  getTypoSuggestions,
  getConfidenceBadge,
  getMatchTypeBadge,
};

