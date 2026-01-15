
import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  FileText,
  History,
  Scan,
  Merge,
  Unlock,
  Split,
  Lock,
  Images,
  Image,
  FileSearch,
  FileSpreadsheet,
  Presentation,
  FileCode,
  Package,
  FolderInput,
  Search,
  X,
  SearchCode,
  FileImage,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Define all operations with their data
const ALL_OPERATIONS = [
  // DOCUMENT OPERATIONS
  { id: "pdfToDocx", label: "PDF TO DOCX", icon: FileText, category: "DOCUMENT OPERATIONS" },
  { id: "docxToPdf", label: "DOCX TO PDF", icon: FileCode, category: "DOCUMENT OPERATIONS" },
  { id: "docToDocx", label: "DOC TO DOCX", icon: FileCode, category: "DOCUMENT OPERATIONS" },
  { id: "docxToDoc", label: "DOCX TO DOC", icon: FileText, category: "DOCUMENT OPERATIONS" },
  { id: "pdfToText", label: "PDF TO TEXT", icon: FileSearch, category: "DOCUMENT OPERATIONS" },
  { id: "textToPdf", label: "TEXT TO PDF", icon: FileText, category: "DOCUMENT OPERATIONS" },
  { id: "textToDocx", label: "TEXT TO DOCX", icon: FileCode, category: "DOCUMENT OPERATIONS" },
  { id: "pdfToExcel", label: "PDF TO EXCEL", icon: FileSpreadsheet, category: "DOCUMENT OPERATIONS" },
  { id: "excelToPdf", label: "EXCEL TO PDF", icon: FileSpreadsheet, category: "DOCUMENT OPERATIONS" },
  { id: "pdfToPpt", label: "PDF TO POWERPOINT", icon: Presentation, category: "DOCUMENT OPERATIONS" },
  { id: "pptxToPdf", label: "POWERPOINT TO PDF", icon: Presentation, category: "DOCUMENT OPERATIONS" },
  { id: "imageToPdf", label: "IMAGE TO PDF", icon: Image, category: "DOCUMENT OPERATIONS" },
  // PDF OPERATIONS
  { id: "lockPdf", label: "LOCK PDF", icon: Lock, category: "PDF OPERATIONS" },
  { id: "unlockPdf", label: "UNLOCK PDF", icon: Unlock, category: "PDF OPERATIONS" },
  { id: "mergePdf", label: "MERGE PDF", icon: Merge, category: "PDF OPERATIONS" },
  { id: "splitPdf", label: "SPLIT PDF", icon: Split, category: "PDF OPERATIONS" },
  // IMAGE OPERATIONS - Generic
  { id: "convertImages", label: "CONVERT IMAGES", icon: Images, category: "IMAGE OPERATIONS" },
  // IMAGE OPERATIONS - Individual JPG Conversions
  { id: "jpgToPng", label: "JPG TO PNG", icon: FileImage, category: "IMAGE OPERATIONS" },
  { id: "jpgToWebp", label: "JPG TO WEBP", icon: FileImage, category: "IMAGE OPERATIONS" },
  { id: "jpgToBmp", label: "JPG TO BMP", icon: FileImage, category: "IMAGE OPERATIONS" },
  // IMAGE OPERATIONS - Individual PNG Conversions
  { id: "pngToJpg", label: "PNG TO JPG", icon: FileImage, category: "IMAGE OPERATIONS" },
  { id: "pngToWebp", label: "PNG TO WEBP", icon: FileImage, category: "IMAGE OPERATIONS" },
  { id: "pngToBmp", label: "PNG TO BMP", icon: FileImage, category: "IMAGE OPERATIONS" },
  // IMAGE OPERATIONS - Individual WEBP Conversions
  { id: "webpToJpg", label: "WEBP TO JPG", icon: FileImage, category: "IMAGE OPERATIONS" },
  { id: "webpToPng", label: "WEBP TO PNG", icon: FileImage, category: "IMAGE OPERATIONS" },
  { id: "webpToBmp", label: "WEBP TO BMP", icon: FileImage, category: "IMAGE OPERATIONS" },
  // IMAGE OPERATIONS - Individual BMP Conversions
  { id: "bmpToJpg", label: "BMP TO JPG", icon: FileImage, category: "IMAGE OPERATIONS" },
  { id: "bmpToPng", label: "BMP TO PNG", icon: FileImage, category: "IMAGE OPERATIONS" },
  { id: "bmpToWebp", label: "BMP TO WEBP", icon: FileImage, category: "IMAGE OPERATIONS" },
  // OCR OPERATIONS
  { id: "ocrImage", label: "OCR IMAGE", icon: Scan, category: "OCR OPERATIONS" },
  { id: "detectLanguage", label: "DETECT LANGUAGE", icon: FileSearch, category: "OCR OPERATIONS" },
  // ARCHIVE OPERATIONS
  { id: "zip", label: "ZIP FOLDER", icon: Package, category: "ARCHIVE OPERATIONS" },
  { id: "unZip", label: "UNZIP FOLDER", icon: FolderInput, category: "ARCHIVE OPERATIONS" },
  // SEARCH
  { id: "searchPdf", label: "SEARCH IN PDF", icon: SearchCode, category: "SEARCH OPERATIONS" },
  // WATERMARK
  { id: "watermark", label: "WATERMARK PDF", icon: FileText, category: "WATERMARK OPERATIONS" },
];

export function DesktopNavbar({
  fetchHistory,
  lockPdf,
  unlockPdf,
  mergePdf,
  splitPdf,
  ocrImage,
  convertImage,
  resizeImage,
  pdfToDocx,
  docxToPdf,
  imageToPdf,
  pdfToText,
  zip,
  unZip,
  searchPdf,
  textToPdf,
  textToDocx,
  pdfToExcel,
  excelToPdf,
  pdfToPptx,
  pptxToPdf,
  docToDocx,
  docxToDoc,
  detectLanguage,
  watermarkPdf,
  // Individual image conversion handlers
  jpgToPng,
  jpgToWebp,
  jpgToBmp,
  pngToJpg,
  pngToWebp,
  pngToBmp,
  webpToJpg,
  webpToPng,
  webpToBmp,
  bmpToJpg,
  bmpToPng,
  bmpToWebp,
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const closeTimer = useRef(null);
  const searchInputRef = useRef(null);

  // Map operation IDs to their handler functions
  const operationHandlers = useMemo(() => ({
    pdfToDocx: pdfToDocx,
    docxToPdf: docxToPdf,
    docToDocx: docToDocx,
    docxToDoc: docxToDoc,
    pdfToText: pdfToText,
    textToPdf: textToPdf,
    textToDocx: textToDocx,
    pdfToExcel: pdfToDocx,
    excelToPdf: excelToPdf,
    pdfToPpt: pdfToDocx,
    pptxToPdf: pptxToPdf,
    imageToPdf: imageToPdf,
    lockPdf: lockPdf,
    unlockPdf: unlockPdf,
    mergePdf: mergePdf,
    splitPdf: splitPdf,
    convertImages: convertImage,
    resizeImage: resizeImage,
    imageToPdfImg: imageToPdf,
    // Individual image conversions
    jpgToPng: jpgToPng,
    jpgToWebp: jpgToWebp,
    jpgToBmp: jpgToBmp,
    pngToJpg: pngToJpg,
    pngToWebp: pngToWebp,
    pngToBmp: pngToBmp,
    webpToJpg: webpToJpg,
    webpToPng: webpToPng,
    webpToBmp: webpToBmp,
    bmpToJpg: bmpToJpg,
    bmpToPng: bmpToPng,
    bmpToWebp: bmpToWebp,
    ocrImage: ocrImage,
    detectLanguage: detectLanguage,
    zip: zip,
    unZip: unZip,
    searchPdf: searchPdf,
    watermark: watermarkPdf,
  }), [pdfToDocx, docToDocx, docxToDoc, pdfToText, textToPdf, textToDocx, pdfToExcel, excelToPdf, pptxToPdf, imageToPdf, lockPdf, unlockPdf, mergePdf, splitPdf, convertImage, resizeImage, ocrImage, detectLanguage, zip, unZip, searchPdf, watermarkPdf, jpgToPng, jpgToWebp, jpgToBmp, pngToJpg, pngToWebp, pngToBmp, webpToJpg, webpToPng, webpToBmp, bmpToJpg, bmpToPng, bmpToWebp]);

  // Filter operations based on search query
  const filteredOperations = useMemo(() => {
    if (!searchQuery.trim()) return null;
    
    const query = searchQuery.toLowerCase().trim();
    return ALL_OPERATIONS.filter(op => 
      op.label.toLowerCase().includes(query) ||
      op.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  /* ---------------------------------------
     HOVER HANDLERS
  --------------------------------------- */
  const handleMouseEnter = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
    // Auto-focus search input when menu opens
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => {
      setOpen(false);
    }, 100);
  };

  /* ---------------------------------------
     CLOSE MENU ON ACTION CLICK
  --------------------------------------- */
  const handleMenuAction = (action) => {
    action();       // trigger operation (tab change, etc.)
    setOpen(false); // close mega menu
  };

  return (
    <div className="hidden md:block relative">

      {/* LEFT : LOGO */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          FileLab
        </h1>
      </div>

      {/* CENTER : MEGA MENU */}
      <div className="flex justify-center">
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
        {/* DOT BUTTON CONTAINER */}
        <div className="flex items-center gap-2">
          <button
            className={`
              w-[35px] h-[35px] rounded-xl
              flex items-center justify-center
              bg-white
              border border-transparent
              shadow-[0_0_0_3px_rgba(59,130,246,0.8)]
              transition-all duration-200
              ${open
                ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
                : "hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 hover:shadow-lg"}
            `}
            aria-label="Open main menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke={open ? "white" : "url(#grad)"}
                strokeWidth="1.6"
                strokeDasharray="10 4"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="-360 12 12"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx="12"
                cy="12"
                r="5"
                stroke={open ? "white" : "url(#grad)"}
                strokeWidth="1.4"
                strokeDasharray="6 3"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx="12"
                cy="12"
                r="2"
                fill={open ? "white" : "currentColor"}
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </button>
          {/* Main Menu Indicator */}
          <span className="text-2xl font-bold font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
            Tools
          </span>
        </div>

        {/* MEGA MENU PANEL */}
        <div 
          className={`
            absolute left-1/2 top-full mt-4 -translate-x-1/2
            w-[1200px] max-w-[calc(100vw-2rem)]
            bg-white
            rounded-2xl p-7
            grid grid-cols-5 gap-7
            shadow-[0_20px_45px_rgba(0,0,0,0.18)]
            transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
            z-50
            border border-gray-200
            ${open
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-95 translate-y-4 pointer-events-none"}
          `}
        >
        {/* TOOLTIP ARROW - Realistic */}
            {/* <div
              className="
                 absolute -top-2 left-1/2 -translate-x-1/2 -translate-x-10
                  w-4 h-4
                  bg-gradient-to-br from-blue-500 to-purple-600
                  shadow-[0_-2px_4px_rgba(0,0,0,0.08)]
                  rotate-45
                  z-40
                  animate-pulse
                  
              "
            /> */}

          {/* Animated entrance overlay */}
          <div className={`
            absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 rounded-2xl
            pointer-events-none transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}
          `} />
          
            {/* SEARCH INPUT */}
            <div className="col-span-5 mb-2 relative z-10 animate-fade-in-up stagger-1">
              <div className="relative max-w-md mx-auto group">
                {/* Search icon with glow */}
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl 
                  opacity-0 group-focus-within:opacity-50 transition-opacity duration-300" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 
                  group-focus-within:text-blue-500 transition-colors duration-300 z-10" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search operations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 relative z-10 transition-all duration-300
                    border-gray-200 group-focus-within:border-blue-500 group-focus-within:ring-2
                    group-focus-within:ring-blue-500/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10
                      text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* SEARCH RESULTS MODE */}
            {searchQuery.trim() ? (
              <div className="col-span-5 relative z-10">
                {filteredOperations && filteredOperations.length > 0 ? (
                  <div className="grid grid-cols-4 gap-4">
                    {filteredOperations.map((op, index) => (
                      <div 
                        key={op.id} 
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'backwards' }}
                      >
                        <SearchResultButton
                          operation={op}
                          onClick={() => {
                            const handler = operationHandlers[op.id];
                            if (handler) handleMenuAction(handler);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 animate-fade-in-up">
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-30 animate-float" />
                    <p className="text-lg">No operations found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* DOCUMENT OPERATIONS */}
                <MenuSection title="DOCUMENT OPERATIONS" delay={50}>
                  <MenuButton onClick={() => handleMenuAction(pdfToDocx)} description="Convert PDF documents to editable Word format">
                    <FileText size={16} /> PDF TO DOCX
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(docxToPdf)} description="Convert Word documents to PDF format">
                    <FileCode size={16} /> DOCX TO PDF
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(pdfToText)} description="Extract text content from PDF files">
                    <FileSearch size={16} /> PDF TO TEXT
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(textToPdf)} description="Create PDF from plain text">
                    <FileText size={16} /> TEXT TO PDF
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(pdfToExcel)} description="Extract表格 data from PDFs">
                    <FileSpreadsheet size={16} /> PDF TO EXCEL
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(excelToPdf)} description="Convert spreadsheets to PDF">
                    <FileSpreadsheet size={16} /> EXCEL TO PDF
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(pdfToPptx)} description="Create presentations from PDF slides">
                    <Presentation size={16} /> PDF TO POWERPOINT
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(pptxToPdf)} description="Convert presentations to PDF format">
                    <Presentation size={16} /> POWERPOINT TO PDF
                  </MenuButton>
                </MenuSection>

                {/* PDF OPERATIONS */}
                <MenuSection title="PDF OPERATIONS" delay={100}>
                  <MenuButton onClick={() => handleMenuAction(searchPdf)} description="Find text within PDF documents">
                    <SearchCode size={16} /> SEARCH IN PDF
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(lockPdf)} description="Add password protection to PDF">
                    <Lock size={16} /> LOCK PDF
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(unlockPdf)} description="Remove password from PDF">
                    <Unlock size={16} /> UNLOCK PDF
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(mergePdf)} description="Combine multiple PDFs into one">
                    <Merge size={16} /> MERGE PDF
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(splitPdf)} description="Extract pages or split PDF files">
                    <Split size={16} /> SPLIT PDF
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(watermarkPdf)} description="Add text watermark to PDF">
                    <FileText size={16} /> WATERMARK PDF
                  </MenuButton>
                </MenuSection>

                {/* IMAGE OPERATIONS */}
                <MenuSection title="IMAGE OPERATIONS" delay={150}>
                  <MenuButton onClick={() => handleMenuAction(convertImage)} description="Batch convert between image formats">
                    <Images size={16} /> CONVERT IMAGES
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(resizeImage)} description="Resize and scale images">
                    <Image size={16} /> RESIZE IMAGE
                  </MenuButton>
                  {/* Individual JPG Conversions */}
                  <MenuButton onClick={() => handleMenuAction(jpgToPng)} description="Convert JPEG to PNG format">
                    <Image size={16} /> JPG TO PNG
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(jpgToWebp)} description="Optimize JPEGs for web">
                    <Image size={16} /> JPG TO WEBP
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(jpgToBmp)} description="Convert JPEG to BMP format">
                    <Image size={16} /> JPG TO BMP
                  </MenuButton>
                  {/* Individual PNG Conversions */}
                  <MenuButton onClick={() => handleMenuAction(pngToJpg)} description="Convert PNG to JPEG format">
                    <Image size={16} /> PNG TO JPG
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(pngToWebp)} description="Optimize PNGs for web">
                    <Image size={16} /> PNG TO WEBP
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(pngToBmp)} description="Convert PNG to BMP format">
                    <Image size={16} /> PNG TO BMP
                  </MenuButton>
                  {/* Individual WEBP Conversions */}
                  <MenuButton onClick={() => handleMenuAction(webpToJpg)} description="Convert WebP to JPEG">
                    <Image size={16} /> WEBP TO JPG
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(webpToPng)} description="Convert WebP to PNG">
                    <Image size={16} /> WEBP TO PNG
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(webpToBmp)} description="Convert WebP to BMP format">
                    <Image size={16} /> WEBP TO BMP
                  </MenuButton>
                  {/* Individual BMP Conversions */}
                  <MenuButton onClick={() => handleMenuAction(bmpToJpg)} description="Convert BMP to JPEG format">
                    <Image size={16} /> BMP TO JPG
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(bmpToPng)} description="Convert BMP to PNG format">
                    <Image size={16} /> BMP TO PNG
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(bmpToWebp)} description="Optimize BMPs for web">
                    <Image size={16} /> BMP TO WEBP
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(imageToPdf)} description="Combine images into single PDF">
                    <Image size={16} /> IMAGE TO PDF
                  </MenuButton>
                </MenuSection>

                {/* OCR */}
                <MenuSection title="OCR OPERATIONS" delay={200}>
                  <MenuButton onClick={() => handleMenuAction(ocrImage)} description="Extract text from images">
                    <Scan size={16} /> OCR IMAGE
                  </MenuButton>
                </MenuSection>

                {/* ARCHIVE OPERATIONS */}
                <MenuSection title="ARCHIVE OPERATIONS" delay={250}>
                  <MenuButton onClick={() => handleMenuAction(zip)} description="Create compressed ZIP archive">
                    <Package size={16} /> ZIP FOLDER
                  </MenuButton>
                  <MenuButton onClick={() => handleMenuAction(unZip)} description="Extract ZIP archive contents">
                    <FolderInput size={16} /> UNZIP FOLDER
                  </MenuButton>
                </MenuSection>
              </>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT : HISTORY */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <Button variant="outline" className="gap-2" onClick={fetchHistory}>
          <History className="w-4 h-4" /> History
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------===
   ENHANCED MENU SECTION
   With staggered animation
--------------------------------------- */
function MenuSection({ title, children, delay = 0 }) {
  return (
    <div 
      className="flex flex-col animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      <h4 className="text-xs font-bold mb-4 text-gray-900 relative inline-block">
        {title}
        <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
      </h4>
      {children}
    </div>
  );
}

/* ------------------------------------===
   ENHANCED MENU BUTTON
   Without tooltip
--------------------------------------- */
function MenuButton({ children, onClick }) {
  const childrenArray = React.Children.toArray(children);
  const icon = childrenArray[0];
  const text = childrenArray[1];

  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 text-sm px-3 py-2 rounded-lg
        transition-all duration-300 ease-out
        hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600
        hover:shadow-lg hover:scale-105 hover:shadow-blue-500/25
        relative overflow-hidden"
    >
      {/* Hover background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 
        rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon with glow effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-sm 
          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {React.cloneElement(icon, { 
          className: `${icon.props.className || ''} text-blue-500 group-hover:text-white transition-all duration-300 relative z-10`.trim()
        })}
      </div>
      
      {/* Text with gradient */}
      <span className="bg-gradient-to-br from-blue-500 to-purple-600 bg-clip-text text-transparent 
        group-hover:text-white transition-all duration-300 font-medium">
        {text}
      </span>
      
      {/* Subtle border glow on hover */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
        bg-gradient-to-r from-blue-500 to-purple-600 blur-sm -z-10
        transition-opacity duration-300" />
    </button>
  );
}

/* ------------------------------------===
   ENHANCED SEARCH RESULT BUTTON
   Without tooltip
--------------------------------------- */
function SearchResultButton({ operation, onClick }) {
  const Icon = operation.icon;
  
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 text-sm px-4 py-3 rounded-xl
        transition-all duration-300 ease-out
        hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600
        hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02]
        relative overflow-hidden"
    >
      {/* Hover background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-600/5 
        rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon container with glow */}
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-md 
          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-600/10
          group-hover:from-blue-500 group-hover:to-purple-600 transition-all duration-300">
          <Icon size={20} className="text-blue-500 group-hover:text-white transition-colors duration-300" />
        </div>
      </div>
      
      {/* Text content */}
      <div className="flex-1 relative">
        <span className="block font-medium bg-gradient-to-br from-blue-500 to-purple-600 bg-clip-text text-transparent 
          group-hover:text-white transition-all duration-300">
          {operation.label}
        </span>
        <span className="text-xs text-gray-400 group-hover:text-white/70 transition-colors duration-300">
          {operation.category}
        </span>
      </div>
      
      {/* Arrow indicator */}
      <div className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0
        transition-all duration-300 text-white/70">
        →
      </div>
      
      {/* Border glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
        bg-gradient-to-r from-blue-500 to-purple-600 blur-sm -z-10
        transition-opacity duration-300" />
    </button>
  );
}

