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
  QrCode,
  LayoutGrid,
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
// QR CODE
  { id: "qrcode", label: "QR CODE GENERATOR", icon: QrCode, category: "QR CODE OPERATIONS" },
];

// Build search index on module load for better performance
const SEARCH_INDEX = buildSearchIndex(ALL_OPERATIONS);

export function DesktopNavbar({
  fetchHistory,
  openDashboard,
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
  qrCode,
  activeTab,
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
  const [isHovering, setIsHovering] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);
  const menuActionInProgress = useRef(false);
  
  // Typewriter effect for logo
  const [displayedText, setDisplayedText] = useState("");
  const fullText = "FileLab";
  
  // Typewriter effect - types once on load
  useEffect(() => {
    let index = 0;
    setDisplayedText("");
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    
    return () => clearInterval(timer);
  }, []);

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
    qrcode: qrCode,
  }), [pdfToDocx, pdfToText, textToPdf, textToDocx, pdfToExcel, excelToPdf, pdfToPptx, pptxToPdf, imageToPdf, lockPdf, unlockPdf, mergePdf, splitPdf, convertImage, resizeImage, ocrImage, detectLanguage, zip, unZip, searchPdf, watermarkPdf, qrCode, jpgToPng, jpgToWebp, jpgToBmp, pngToJpg, pngToWebp, pngToBmp, webpToJpg, webpToPng, webpToBmp, bmpToJpg, bmpToPng, bmpToWebp]);

  // AI-powered search with fuzzy matching (same as mobile - 8 results)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const searchResult = aiSearchOperations(searchQuery, ALL_OPERATIONS, 12);
      // Extract results array from the returned object (same as mobile)
      setSearchResults(searchResult.results || []);
      setIsSearching(false);
    }, 150); // Small debounce for better performance (same as mobile)

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Container ref for click outside detection
  const menuContainerRef = useRef(null);

  // Click outside to close menu - Fixed to properly detect clicks within menu container
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if clicking outside the menu container AND search is empty/not focused
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target)) {
        if (!searchQuery.trim() && !isSearchFocused) {
          setIsHovering(false);
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
    setIsHovering(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    // Close menu if no search query and not hovering on menu items
    // Use a longer delay to allow click events on menu items to complete
    // Only close if menu action is not in progress
    setTimeout(() => {
      // Only close if search is empty, menu action not in progress, and we're not hovering on the menu
      if (!searchQuery.trim() && !menuActionInProgress.current && !isHovering) {
        setIsHovering(false);
      }
    }, 300);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setIsHovering(true); // Auto-open on typing
  };

  /* ---------------------------------------
     HOVER HANDLERS - With Hover-to-Show Mega Menu
  --------------------------------------- */
  const leaveTimeoutRef = useRef(null);

  // Hover handlers for mega menu container
  const handleMenuMouseEnter = () => {
    // Clear any pending close timeout
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setIsHovering(true);
  };

  const handleMenuMouseLeave = () => {
    // Don't close menu if a menu action is being clicked
    if (menuActionInProgress.current) {
      return;
    }
    // Use a delay to allow smooth transition and clicking on menu items
    leaveTimeoutRef.current = setTimeout(() => {
      setIsHovering(false);
    }, 150);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

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
    setIsHovering(false);    
    // Reset the flag after a short delay to allow mouse events to complete
    setTimeout(() => {
      menuActionInProgress.current = false;
    }, 100);
  };

  return (
    <div ref={menuContainerRef} className="hidden md:block relative">

      {/* LEFT : LOGO */}
      <div 
        className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3 cursor-pointer select-text"
        onClick={openDashboard}
      >
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          {displayedText}
        </h1>
      </div>

      {/* CENTER : TOOLS BUTTON AND MEGA MENU */}
      <div className="flex justify-center items-center gap-4">
        
        {/* Toggle Button and Menu Container */}
        <div 
          className="relative flex flex-col items-center"
          onMouseEnter={handleMenuMouseEnter}
          onMouseLeave={handleMenuMouseLeave}
        >
          <div 
            className={`flex items-center gap-2 cursor-pointer transition-all duration-300 ${isHovering ? 'text-blue-600 scale-[1.02]' : ''}`}
          >
            <button
              className={`
                w-[35px] h-[35px] rounded-xl
                flex items-center justify-center
                bg-white
                border border-transparent
                shadow-[0_0_0_3px_rgba(59,130,246,0.8)]
                transition-all duration-200
                ${isHovering
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
                  : "hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 hover:shadow-lg"}
                ${isHovering ? "shadow-[0_0_15px_rgba(59,130,246,0.4)]" : ""}
              `}
              aria-label="Open main menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
              >
                {/* Outer Arc */}
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke={isHovering ? "white" : "#3b82f6"}
                  strokeWidth="1.5"
                  strokeDasharray="10 4"
                  fill="none"
                  className="transition-colors duration-300"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 12 12"
                    to="-360 12 12"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </circle>
                {/* Middle Arc */}
                <circle
                  cx="12"
                  cy="12"
                  r="5"
                  stroke={isHovering ? "white" : "#a855f7"}
                  strokeWidth="1.5"
                  strokeDasharray="6 3"
                  fill="none"
                  className="transition-colors duration-300"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 12 12"
                    to="360 12 12"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                {/* Center Dot */}
                <circle
                  cx="12"
                  cy="12"
                  r="2"
                  fill={isHovering ? "white" : "currentColor"}
                  className="transition-colors duration-300"
                />
              </svg>
            </button>
          </div>

          {/* "Tools" Label underneath the menu */}
          <span className="text-xs font-bold mt-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
            Tools
          </span>

          {/* Inject mega menu animations */}
          <style>
            {`
              @keyframes megaMenuSlideIn {
                0% {
                  opacity: 0;
                  transform: translateY(-10px) scale(0.98);
                }
                100% {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
              @keyframes megaMenuSlideOut {
                0% {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
                100% {
                  opacity: 0;
                  transform: translateY(-10px) scale(0.98);
                }
              }
              @keyframes floatUp {
                0%, 100% {
                  transform: translateY(0);
                }
                50% {
                  transform: translateY(-8px);
                }
              }
              .animate-float {
                animation: floatUp 3s ease-in-out infinite;
              }
              .mega-menu-enter {
                animation: megaMenuSlideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
              }
              .mega-menu-exit {
                animation: megaMenuSlideOut 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
              }
            `}
          </style>

          {/* MEGA MENU PANEL - Smaller size */}
          <div 
            className={`
              absolute left-1/2 top-full mt-2 -translate-x-1/2
              w-[900px] max-w-[calc(100vw-2rem)]
            bg-white
              rounded-xl p-3
              grid grid-cols-6 gap-0
              shadow-[0_15px_35px_rgba(0,0,0,0.15)]
              z-50
              border border-gray-200
              transition-all duration-200
              ${isHovering 
                ? "opacity-100 visible translate-y-0" 
                : "opacity-0 invisible -translate-y-2"}
            `}
          >
            {/* Animated entrance overlay with gradient shimmer */}
            <div className={`
              absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 rounded-2xl
              pointer-events-none transition-opacity duration-300
              ${isHovering ? "opacity-100" : "opacity-0"}
            `}
            />
            {/* Shimmer effect on open */}
            <div className={`
              absolute inset-0 overflow-hidden rounded-2xl pointer-events-none
              transition-opacity duration-300
              ${isHovering ? "opacity-100" : "opacity-0"}
            `}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
            
            {/* SEARCH BOX HEADER - Inside Mega Menu */}
            <div className="col-span-6 relative z-10 mb-3">
              <div className="relative">
                <div className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg
                  bg-white border-2 transition-all duration-300
                  ${isSearchFocused
                    ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]" 
                    : "border-gray-200 hover:border-gray-300"}
                `}
                >
                  <Search className={`w-4 h-4 transition-colors duration-300 ${isSearchFocused ? "text-blue-500" : "text-gray-400"}`} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search tools..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery("");
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {/* AI Search indicator */}
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-purple-500" />
                  <span className="text-[9px] text-gray-400 font-medium">AI</span>
                </div>
              </div>
            </div>
            
              {/* AI SEARCH RESULTS MODE - Multi-Column Grid */}
              {searchQuery.trim() ? (
                <div className="col-span-6 relative z-10">
                  {isSearching ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500 animate-fade-in-up">
                      <div className="w-12 h-12 relative mb-2">
                        <div className="absolute inset-0 border-3 border-blue-200 rounded-full"></div>
                        <div className="absolute inset-0 border-3 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                      </div>
                      <p className="text-sm font-medium">AI thinking...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {/* Results Header */}
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-xs font-medium text-gray-700">
                          {searchResults.length} results
                        </span>
                      </div>
                      
                      {/* 4 Column Grid Results - Compact */}
                      <div className="grid grid-cols-4 gap-1.5 max-h-64 overflow-y-auto pr-1">
                        {searchResults.map((result, index) => (
                          <div 
                            key={result.operation.id} 
                            className="animate-fade-in-up"
                            style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'backwards' }}
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
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500 animate-fade-in-up">
                      <Search className="w-10 h-10 mx-auto opacity-25 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">No operations found</p>
                      <p className="text-xs text-gray-400 text-center">
                        Try "pdf", "excel", "merge", "convert"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* DOCUMENT OPERATIONS */}
                  <MenuSection title="DOCUMENT" delay={50}>
                    <MenuButton onClick={() => handleMenuAction(pdfToDocx)}>
                      <FileText size={14} /> PDF TO DOCX
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(docxToPdf)}>
                      <FileCode size={14} /> DOCX TO PDF
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(pdfToText)}>
                      <FileSearch size={14} /> PDF TO TEXT
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(textToPdf)}>
                      <FileText size={14} /> TEXT TO PDF
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(pdfToExcel)}>
                      <FileSpreadsheet size={14} /> PDF TO EXCEL
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(excelToPdf)}>
                      <FileSpreadsheet size={14} /> EXCEL TO PDF
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(pdfToPptx)}>
                      <Presentation size={14} /> PDF TO PPT
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(pptxToPdf)}>
                      <Presentation size={14} /> PPT TO PDF
                    </MenuButton>
                  </MenuSection>

                  {/* PDF OPERATIONS */}
                  <MenuSection title="PDF" delay={100}>
                    <MenuButton onClick={() => handleMenuAction(searchPdf)}>
                      <SearchCode size={14} /> SEARCH PDF
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(lockPdf)}>
                      <Lock size={14} /> LOCK PDF
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(unlockPdf)}>
                      <Unlock size={14} /> UNLOCK PDF
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(mergePdf)}>
                      <Merge size={14} /> MERGE PDF
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(splitPdf)}>
                      <Split size={14} /> SPLIT PDF
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(watermarkPdf)}>
                      <FileText size={14} /> WATERMARK
                    </MenuButton>
                  </MenuSection>

                  {/* IMAGE OPERATIONS */}
                  <MenuSection title="IMAGE" delay={150}>
                    <MenuButton onClick={() => handleMenuAction(convertImage)}>
                      <Images size={14} /> CONVERT
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(resizeImage)}>
                      <Image size={14} /> RESIZE
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(jpgToPng)}>
                      <Image size={14} /> JPG TO PNG
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(jpgToWebp)}>
                      <Image size={14} /> JPG TO WEBP
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(jpgToBmp)}>
                      <Image size={14} /> JPG TO BMP
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(pngToJpg)}>
                      <Image size={14} /> PNG TO JPG
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(pngToWebp)}>
                      <Image size={14} /> PNG TO WEBP
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(pngToBmp)}>
                      <Image size={14} /> PNG TO BMP
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(webpToJpg)}>
                      <Image size={14} /> WEBP TO JPG
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(webpToPng)}>
                      <Image size={14} /> WEBP TO PNG
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(webpToBmp)}>
                      <Image size={14} /> WEBP TO BMP
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(bmpToJpg)}>
                      <Image size={14} /> BMP TO JPG
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(bmpToPng)}>
                      <Image size={14} /> BMP TO PNG
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(bmpToWebp)}>
                      <Image size={14} /> BMP TO WEBP
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(imageToPdf)}>
                      <Image size={14} /> TO PDF
                    </MenuButton>
                  </MenuSection>

                {/* OCR */}
                <MenuSection title="OCR" delay={200}>
                  <SmartMenuButton onClick={() => handleMenuAction(ocrImage)}>
                    <Sparkles size={14} /> OCR <span className="ml-1 px-1 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[8px] font-bold rounded-full">AI</span>
                  </SmartMenuButton>
                  <MenuButton onClick={() => handleMenuAction(detectLanguage)}>
                    <FileSearch size={14} /> DETECT
                  </MenuButton>
                </MenuSection>

                  {/* ARCHIVE OPERATIONS */}
                  <MenuSection title="ARCHIVE" delay={250}>
                    <MenuButton onClick={() => handleMenuAction(zip)}>
                      <Package size={14} /> ZIP
                    </MenuButton>
                    <MenuButton onClick={() => handleMenuAction(unZip)}>
                      <FolderInput size={14} /> UNZIP
                    </MenuButton>
                  </MenuSection>

                  {/* QR CODE OPERATIONS */}
                  <MenuSection title="QR CODE" delay={300}>
                    <MenuButton onClick={() => handleMenuAction(qrCode)}>
                      <QrCode size={14} /> GENERATOR
                    </MenuButton>
                  </MenuSection>
                </>
              )}
            </div>
          </div>
      </div>

      {/* RIGHT : DASHBOARD AND HISTORY */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <Button 
          variant="outline" 
          className={`gap-2 bg-gradient-to-r from-blue-500/5 to-purple-600/5 border-blue-200/50 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-300 group ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-blue-500 to-purple-600 !text-white' : ''}`}
          onClick={openDashboard}
        >
          <LayoutGrid className={`w-4 h-4 text-blue-500 transition-colors group-hover:text-white ${activeTab === 'dashboard' ? '!text-white' : ''}`} /> 
          <span className={`bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-medium group-hover:text-white ${activeTab === 'dashboard' ? '!text-white' : ''}`}>
            Dashboard
          </span>
        </Button>
        <Button variant="outline" className="gap-2" onClick={fetchHistory}>
          <History className="w-4 h-4" /> History
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------===
   MENU SECTION - Compact
--------------------------------------- */
function MenuSection({ title, children, delay = 0 }) {
  return (
    <div 
      className="flex flex-col animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      <h4 className="text-[10px] font-bold mb-2 text-gray-900 relative inline-block uppercase tracking-wide">
        {title}
        <span className="absolute -bottom-0.5 left-0 w-5 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
      </h4>
      {children}
    </div>
  );
}

/* ------------------------------------===
   MENU BUTTON - Compact
--------------------------------------- */
function MenuButton({ children, onClick }) {
  const childrenArray = React.Children.toArray(children);
  const icon = childrenArray[0];
  const text = childrenArray[1];

  return (
    <button
      onMouseDown={(e) => {
        // Prevent blur event from firing before click
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className="group flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg
        transition-all duration-200 ease-out
        hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600
        hover:shadow-md hover:scale-[1.02]
        relative overflow-hidden"
    >
      {/* Hover background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 
        rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      
      {/* Icon with glow effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-[2px] 
          opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        {React.cloneElement(icon, { 
          className: `${icon.props.className || ''} text-blue-500 group-hover:text-white transition-all duration-200 relative z-10`.trim()
        })}
      </div>
      
      {/* Text with gradient */}
      <span className="bg-gradient-to-br from-blue-500 to-purple-600 bg-clip-text text-transparent 
        group-hover:text-white transition-all duration-200 font-medium text-xs">
        {text}
      </span>
      
      {/* Border glow on hover */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
        bg-gradient-to-r from-blue-500 to-purple-600 blur-sm -z-10
        transition-opacity duration-200" />
    </button>
  );
}

/* ------------------------------------===
   SMART MENU BUTTON - Compact
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
      onMouseDown={(e) => {
        // Prevent blur event from firing before click
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className="group flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg
        transition-all duration-200 ease-out
        hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-600
        hover:shadow-md hover:scale-[1.02]
        relative overflow-hidden border border-transparent
        hover:border-purple-300/50"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 
        rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-0 group-hover:opacity-40 transition-opacity duration-200 -z-10" />
      
      {/* Icon with enhanced glow */}
      <div className="relative">
        <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-[2px] 
          opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        {React.cloneElement(icon, { 
          className: `${icon.props.className || ''} text-purple-500 group-hover:text-white transition-all duration-200 relative z-10 scale-105`.trim()
        })}
      </div>
      
      {/* Text with gradient */}
      <span className="bg-gradient-to-br from-purple-500 to-pink-600 bg-clip-text text-transparent 
        group-hover:text-white transition-all duration-200 font-medium text-xs">
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
   SEARCH RESULT BUTTON - Compact
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
    return "bg-gray-400";
  };
  
  // Get percentage badge color based on confidence
  const getPercentageBadgeColor = (pct) => {
    if (pct >= 80) return "bg-transparent text-green-600 border-green-300";
    if (pct >= 60) return "bg-transparent text-blue-600 border-blue-300";
    if (pct >= 40) return "bg-transparent text-amber-600 border-amber-300";
    return "bg-transparent text-gray-500 border-gray-400";
  };
  
  // Get confidence label
  const getConfidenceLabel = (pct) => {
    if (pct >= 70) return "High";
    if (pct >= 40) return "Good";
    return "Fair";
  };
  
  return (
    <button
      onMouseDown={(e) => {
        // Prevent blur event from firing before click
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`
        group flex items-center gap-1.5 text-[10px] px-2 py-1.5 rounded-lg
        transition-all duration-100 ease-out
        hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600
        hover:shadow-md hover:scale-[1.01]
        w-full text-left relative
        ${isBestMatch ? 'ring-1 ring-blue-400 ring-offset-1' : ''}
      `}
    >
      {/* Hover background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-600/5 
        rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      
      {/* Relevance indicator */}
      <div 
        className={`absolute left-0 top-1 bottom-1 w-0.5 rounded-r-full transition-all duration-200 ${getRelevanceColor(percentage)}`}
      />
      
      {/* Icon */}
      <div className="relative p-0.5 rounded bg-gradient-to-br from-blue-500/10 to-purple-600/10
        group-hover:from-blue-500 group-hover:to-purple-600 transition-all duration-200 flex-shrink-0">
        <Icon size={12} className="text-blue-500 group-hover:text-white transition-colors duration-200" />
      </div>
      
      {/* Text content */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Best Match Badge */}
          {isBestMatch && (
            <span className="flex items-center gap-0.5 px-1 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 
              text-white text-[8px] font-bold uppercase tracking-wider rounded-full flex-shrink-0">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              BEST
            </span>
          )}
          <span className="font-medium text-gray-900 group-hover:text-white 
            transition-all duration-200 flex-shrink-0 truncate text-[10px]">
            {operation.label}
          </span>
        </div>
        {description && (
          <span className="text-[9px] text-gray-500 group-hover:text-white/70 
            transition-all duration-200 truncate">
            {description}
          </span>
        )}
      </div>
      
      {/* Percentage Badge */}
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        <div className={`flex items-center px-1 py-0.5 rounded border text-[9px] font-bold ${getPercentageBadgeColor(percentage)}`}>
          {percentage}%
        </div>
        <span className={`text-[7px] font-medium ${getPercentageBadgeColor(percentage)}`}>
          {getConfidenceLabel(percentage)}
        </span>
      </div>
      
      {/* Border glow on hover */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
        bg-gradient-to-r from-blue-500 to-purple-600 blur-sm -z-10
        transition-opacity duration-200" />
    </button>
  );
}

