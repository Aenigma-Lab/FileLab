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
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// AI Search utilities
import { 
  aiSearchOperations, 
  buildSearchIndex, 
  OPERATION_KEYWORDS,
} from "@/utils/aiSearch";

// Define all operations with their data
const ALL_OPERATIONS = [
  // DOCUMENT OPERATIONS
  { id: "pdfToDocx", label: "PDF TO DOCX", icon: FileText, category: "DOCUMENT OPERATIONS" },
  { id: "docxToPdf", label: "DOCX TO PDF", icon: FileCode, category: "DOCUMENT OPERATIONS" },
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

// Build search index on module load for better performance
const SEARCH_INDEX = buildSearchIndex(ALL_OPERATIONS);

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
  const [isHovering, setIsHovering] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isHeaderHovering, setIsHeaderHovering] = useState(false);
  const searchInputRef = useRef(null);
  const menuRef = useRef(null);
  const searchContainerRef = useRef(null);
  const headerRef = useRef(null);
  const menuActionInProgress = useRef(false);

  // Map operation IDs to their handler functions
  const operationHandlers = useMemo(() => ({
    pdfToDocx: pdfToDocx,
    docxToPdf: docxToPdf,
    pdfToText: pdfToText,
    textToPdf: textToPdf,
    textToDocx: textToDocx,
    pdfToExcel: pdfToDocx,
    excelToPdf: excelToPdf,
    pdfToPpt: pdfToPptx,  // Fixed: map to correct handler prop (pdfToPptx)
    pptxToPdf: pptxToPdf,
    imageToPdf: imageToPdf,
    lockPdf: lockPdf,
    unlockPdf: unlockPdf,
    mergePdf: mergePdf,
    splitPdf: splitPdf,
    convertImages: convertImage,
    resizeImage: resizeImage,
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
  }), [pdfToDocx, pdfToText, textToPdf, textToDocx, pdfToExcel, excelToPdf, pdfToPptx, pptxToPdf, imageToPdf, lockPdf, unlockPdf, mergePdf, splitPdf, convertImage, resizeImage, ocrImage, detectLanguage, zip, unZip, searchPdf, watermarkPdf, jpgToPng, jpgToWebp, jpgToBmp, pngToJpg, pngToWebp, pngToBmp, webpToJpg, webpToPng, webpToBmp, bmpToJpg, bmpToPng, bmpToWebp]);

  // AI-powered search with fuzzy matching (same as mobile - 8 results)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const searchResult = aiSearchOperations(searchQuery, ALL_OPERATIONS, 8);
      // Extract results array from the returned object (same as mobile)
      setSearchResults(searchResult.results || []);
      setIsSearching(false);
    }, 150); // Small debounce for better performance (same as mobile)

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        // Only close if search is empty and not focused
        if (!searchQuery && !isSearchFocused) {
          setOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery, isSearchFocused]);

  /* ---------------------------------------
     SEARCH INPUT HANDLERS
  --------------------------------------- */
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setOpen(true); // Auto-open mega menu on search focus
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    // Close menu if no search query and not hovering on menu items
    // Use a longer delay to allow click events on menu items to complete
    setTimeout(() => {
      // Only close if search is empty and we're not hovering on the menu
      if (!searchQuery.trim() && !isHovering) {
        setOpen(false);
      }
    }, 500);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setOpen(true); // Auto-open on typing
  };

  /* ---------------------------------------
     HOVER HANDLERS - With Hover-to-Show Search Popup
  --------------------------------------- */
  const handleMenuToggle = () => {
    if (!open) {
      setOpen(true);
      setIsHovering(true);
      // Auto-focus search input when menu opens
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setOpen(false);
      setIsHovering(false);
    }
  };

  // Hover handlers for mega menu header area - Auto-activate searchbox
  const handleHeaderMouseEnter = () => {
    // Clear any pending timeout to close the menu
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHeaderHovering(true);
    setIsHovering(true);
    // Auto-open menu and focus searchbox on hover
    if (!open) {
      setOpen(true);
    }
    // Auto-focus searchbox when hovering header
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const handleHeaderMouseLeave = () => {
    // Don't close menu if a menu action is being clicked
    if (menuActionInProgress.current) {
      return;
    }
    
    // Clear any pending timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHeaderHovering(false);
    setIsHovering(false);
    // Close menu with a small delay to allow click events to register
    const timeout = setTimeout(() => {
      setOpen(false);
    }, 200);
    setHoverTimeout(timeout);
  };

  // Hover handlers for mouse enter/leave on menu panel
  const handleMouseEnter = () => {
    // Clear any pending timeout to close the menu
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHovering(true);
    // Auto-open menu on hover if not already open
    if (!open) {
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    // Don't close menu if a menu action is being clicked
    if (menuActionInProgress.current) {
      return;
    }
    
    // Clear any pending timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHovering(false);
    // Close menu with a small delay to allow click events to register
    const timeout = setTimeout(() => {
      setOpen(false);
    }, 200);
    setHoverTimeout(timeout);
  };

  /* ---------------------------------------
     CLOSE MENU ON ACTION CLICK - Immediate close
  --------------------------------------- */
  const handleMenuAction = (action) => {
    // Set action in progress flag to prevent menu close
    menuActionInProgress.current = true;
    // Cancel any pending blur timeout
    // Trigger operation (tab change, etc.)
    action();
    // Close mega menu immediately
    setOpen(false);
    setIsHovering(false);    // Reset the flag after a short delay to allow mouse events to complete
    setTimeout(() => {
      menuActionInProgress.current = false;
    }, 100);
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

      {/* CENTER : SEARCH BOX AND MEGA MENU HEADER - Hover to activate searchbox */}
      <div 
        ref={headerRef}
        className="flex justify-center items-center gap-4"
        onMouseEnter={handleHeaderMouseEnter}
        onMouseLeave={handleHeaderMouseLeave}
      >
        
        {/* Dedicated Search Box - Opens Mega Menu on Focus/Type */}
        <div ref={searchContainerRef} className="relative">
          <div className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl
            bg-white border-2 transition-all duration-300 cursor-pointer
            ${isSearchFocused || isHeaderHovering
              ? "border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.15)]" 
              : "border-gray-200 hover:border-gray-300 hover:shadow-md"}
            ${isHeaderHovering ? "shadow-[0_0_20px_rgba(59,130,246,0.25)] scale-[1.02]" : ""}
          `}
          onClick={handleSearchFocus}
          >
            <Search className={`w-4 h-4 transition-colors duration-300 ${isSearchFocused || isHeaderHovering ? "text-blue-500" : "text-gray-400"}`} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className={`w-48 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
            />
            {searchQuery && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mega Menu Container */}
        <div
          ref={menuRef}
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Toggle Button */}
          <div 
            className={`flex items-center gap-2 cursor-pointer transition-all duration-300 ${isHovering || isHeaderHovering ? 'text-blue-600 scale-[1.02]' : ''}`}
            onClick={handleMenuToggle}
          >
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
                ${isHeaderHovering ? "shadow-[0_0_15px_rgba(59,130,246,0.4)]" : ""}
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
          {/* Now INSIDE the hoverable container so mouse movement between toggle and menu works */}
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
            onMouseEnter={handleMouseEnter}
          >
            {/* Animated entrance overlay */}
            <div className={`
              absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 rounded-2xl
              pointer-events-none transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}
            `} />
            
              {/* AI SEARCH RESULTS MODE - Multi-Column Grid */}
              {searchQuery.trim() ? (
                <div className="col-span-5 relative z-10">
                  {isSearching ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500 animate-fade-in-up">
                      <div className="w-20 h-20 relative mb-4">
                        <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                      </div>
                      <p className="text-lg font-medium">AI is thinking...</p>
                      <p className="text-sm text-gray-400 mt-1">Finding the best matches for you</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {/* Results Header */}
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-sm font-medium text-gray-700">
                          {searchResults.length} results
                        </span>
                      </div>
                      
                      {/* 4 Column Grid Results - Compact */}
                      <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
                        {searchResults.map((result, index) => (
                          <div 
                            key={result.operation.id} 
                            className="animate-fade-in-up"
                            style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'backwards' }}
                          >
                            <SearchResultButton
                              operation={result.operation}
                              score={result.percentage / 100}
                              percentage={result.percentage}
                              description={OPERATION_KEYWORDS[result.operation.id]?.description}
                              confidence={result.confidence}
                              matchType={result.matchType}
                              isBestMatch={index === 0}
                              onClick={() => {
                                const handler = operationHandlers[result.operation.id];
                                if (handler) handleMenuAction(handler);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500 animate-fade-in-up">
                      <div className="w-20 h-20 mb-4 relative">
                        <Search className="w-16 h-16 mx-auto opacity-30 animate-float" />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-xl"></div>
                      </div>
                      <p className="text-lg font-medium text-gray-700 mb-2">No operations found</p>
                      <p className="text-sm text-gray-400 text-center max-w-sm">
                        Try different keywords like "pdf", "excel", "merge", "convert", "compress"
                      </p>
                      <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-gray-100 rounded-lg">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span className="text-xs text-gray-600">Tip: Use natural language like "convert pdf to word"</span>
                      </div>
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
                  <SmartMenuButton onClick={() => handleMenuAction(ocrImage)}>
                    <Sparkles size={16} /> OCR IMAGE <span className="ml-1 px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[8px] font-bold rounded-full">SMART</span>
                  </SmartMenuButton>
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
   SMART MENU BUTTON - Enhanced for OCR
--------------------------------------- */
function SmartMenuButton({ children, onClick }) {
  const childrenArray = React.Children.toArray(children);
  const icon = childrenArray[0];
  const text = childrenArray.slice(1).reduce((acc, curr) => {
    if (typeof curr === 'string') acc += curr;
    return acc;
  }, '');

  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 text-sm px-3 py-2 rounded-lg
        transition-all duration-300 ease-out
        hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-600
        hover:shadow-lg hover:scale-105 hover:shadow-purple-500/25
        relative overflow-hidden border border-transparent
        hover:border-purple-300/50"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 
        rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-20 group-hover:animate-shimmer" />
      </div>
      
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-0 group-hover:opacity-40 transition-opacity duration-300 -z-10" />
      
      {/* Icon with enhanced glow */}
      <div className="relative">
        <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-md 
          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {React.cloneElement(icon, { 
          className: `${icon.props.className || ''} text-purple-500 group-hover:text-white transition-all duration-300 relative z-10 scale-110`.trim()
        })}
      </div>
      
      {/* Text with gradient */}
      <span className="bg-gradient-to-br from-purple-500 to-pink-600 bg-clip-text text-transparent 
        group-hover:text-white transition-all duration-300 font-medium">
        {text}
      </span>
      
      {/* SMART Badge */}
      {childrenArray.slice(2).map((child, idx) => (
        <React.Fragment key={idx}>{child}</React.Fragment>
      ))}
    </button>
  );
}

/* ------------------------------------===
   SEARCH RESULT BUTTON - Compact with Color Percentage
--------------------------------------- */
function SearchResultButton({ 
  operation, 
  onClick, 
  score, 
  percentage, 
  description, 
  confidence,
  matchType,
  isBestMatch = false 
}) {
  const Icon = operation.icon;
  
  // Calculate relevance indicator color based on percentage
  const getRelevanceColor = (pct) => {
    if (pct >= 80) return "bg-green-500";
    if (pct >= 60) return "bg-blue-500";
    if (pct >= 40) return "bg-amber-500";
    return "bg-gray-300";
  };
  
  // Get percentage badge color based on confidence
  const getPercentageBadgeColor = (pct) => {
    if (pct >= 80) return "bg-green-100 text-green-700 border-green-200";
    if (pct >= 60) return "bg-blue-100 text-blue-700 border-blue-200";
    if (pct >= 40) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };
  
  // Get confidence label
  const getConfidenceLabel = (pct) => {
    if (pct >= 80) return "High";
    if (pct >= 60) return "Good";
    if (pct >= 40) return "Fair";
    return "Low";
  };
  
  return (
    <button
      onClick={onClick}
      className={`
        group flex items-center gap-2 text-xs px-2.5 py-2 rounded-xl
        transition-all duration-150 ease-out
        hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600
        hover:shadow-lg hover:scale-[1.02]
        w-full text-left relative
        ${isBestMatch ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
      `}
    >
      {/* Hover background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-600/5 
        rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Relevance indicator */}
      <div 
        className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full transition-all duration-300 ${getRelevanceColor(percentage)}`}
      />
      
      {/* Icon */}
      <div className="relative p-1 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-600/10
        group-hover:from-blue-500 group-hover:to-purple-600 transition-all duration-300 flex-shrink-0">
        <Icon size={16} className="text-blue-500 group-hover:text-white transition-colors duration-300" />
      </div>
      
      {/* Text content */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Best Match Badge */}
          {isBestMatch && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 
              text-white text-[8px] font-bold uppercase tracking-wider rounded-full flex-shrink-0">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              BEST
            </span>
          )}
          <span className="font-semibold text-gray-900 group-hover:text-white 
            transition-all duration-300 flex-shrink-0 truncate">
            {operation.label}
          </span>
        </div>
        {description && (
          <span className="text-[10px] text-gray-500 group-hover:text-white/80 
            transition-all duration-300 truncate">
            {description}
          </span>
        )}
      </div>
      
      {/* Percentage Badge */}
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        <div className={`flex items-center px-1.5 py-0.5 rounded border text-[10px] font-bold ${getPercentageBadgeColor(percentage)}`}>
          {percentage}%
        </div>
        <span className={`text-[8px] font-medium ${getPercentageBadgeColor(percentage)}`}>
          {getConfidenceLabel(percentage)}
        </span>
      </div>
      
      {/* Arrow indicator */}
      <div className="opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0
        transition-all duration-300 text-white/70 flex-shrink-0">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
      
      {/* Border glow on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
        bg-gradient-to-r from-blue-500 to-purple-600 blur-sm -z-10
        transition-opacity duration-300" />
    </button>
  );
}

