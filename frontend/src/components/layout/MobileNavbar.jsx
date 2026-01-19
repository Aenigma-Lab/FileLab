import React, { useState, useRef, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { IconGridDots } from "@tabler/icons-react";
import {
  FileText,
  History,
  Scan,
  Merge,
  Unlock,
  Split,
  Lock,
  Images,
  X,
  Image,
  FileSearch,
  Archive,
  ArchiveRestore,
  FileSpreadsheet,
  Presentation,
  FileCode,
  Package,
  FolderInput,
  SearchCode,
  Search,
  FileImage,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// AI Search utilities
import { 
  aiSearchOperations, 
  OPERATION_KEYWORDS,
} from "@/utils/aiSearch";

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

export function MobileNavbar({
  mobileMenuOpen,
  setMobileMenuOpen,
  mobileRightOpen,
  setMobileRightOpen,
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
  pdfToPpt,
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
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Map operation IDs to their handler functions
  const operationHandlers = useMemo(() => ({
    pdfToDocx: pdfToDocx,
    docxToPdf: docxToPdf,
    docToDocx: docToDocx,
    docxToDoc: docxToDoc,
    pdfToText: pdfToText,
    textToPdf: textToPdf,
    textToDocx: textToDocx,
    pdfToExcel: pdfToExcel,
    excelToPdf: excelToPdf,
    pdfToPpt: pdfToPpt,
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
  }), [pdfToDocx, docxToPdf, docToDocx, docxToDoc, pdfToText, textToPdf, textToDocx, pdfToExcel, excelToPdf, pdfToPpt, pptxToPdf, imageToPdf, lockPdf, unlockPdf, mergePdf, splitPdf, convertImage, resizeImage, ocrImage, detectLanguage, zip, unZip, searchPdf, watermarkPdf, jpgToPng, jpgToWebp, jpgToBmp, pngToJpg, pngToWebp, pngToBmp, webpToJpg, webpToPng, webpToBmp, bmpToJpg, bmpToPng, bmpToWebp]);

  // AI-powered search with fuzzy matching
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const searchResult = aiSearchOperations(searchQuery, ALL_OPERATIONS, 8);
      // Extract results array from the returned object
      setSearchResults(searchResult.results || []);
      setIsSearching(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  /* ---------------------------------------
     CLOSE MENUS ON ROUTE CHANGE
  --------------------------------------- */
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileRightOpen(false);
  }, [location.pathname]);

  /* ---------------------------------------
     HELPER FOR LEFT MENU ACTIONS
  --------------------------------------- */
  const handleMenuAction = (action) => {
    action();
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex md:hidden items-center justify-between relative">

      {/* LEFT HAMBURGER */}
      <button
        className="p-2 rounded-md hover:bg-gray-100"
        aria-label="Open menu"
        onClick={() => setMobileMenuOpen(true)}
      >
        ☰
      </button>

      {/* LOGO */}
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          FileLab
        </span>
      </div>

      {/* RIGHT MENU TOGGLE (9 DOTS ⇄ X) */}
      <button
        className="p-2 rounded-md hover:bg-gray-100 transition-transform duration-300"
        aria-label="Toggle right menu"
        onClick={() => setMobileRightOpen(prev => !prev)}
      >
        <span
          className={`inline-block transition-transform duration-300 ${
            mobileRightOpen ? "rotate-90 scale-110" : "rotate-0 scale-100"
          }`}
        >
          {mobileRightOpen ? <X size={24} /> : <IconGridDots size={24} />}
        </span>
      </button>

      {/* =====================================================
          LEFT SLIDE-IN MENU (FAST OPEN/CLOSE WITH SCALE EFFECT)
      ====================================================== */}
      <div
        className={`fixed inset-0 z-[9999] bg-black/30 transition-opacity duration-100
          ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={`absolute left-0 top-0 h-full w-72 bg-white shadow-xl p-4 overflow-y-auto
            transform transition-all duration-150 cubic-bezier(0.34, 1.56, 0.64, 1)
            ${mobileMenuOpen 
              ? "opacity-100 scale-100 translate-x-0 shadow-[0_0_30px_rgba(0,0,0,0.15)]" 
              : "opacity-90 scale-95 -translate-x-full shadow-none"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* LEFT MENU HEADER */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-gray-900">Menu</span>
            <button
              className="p-1 rounded hover:bg-gray-100"
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchQuery("");
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* AI SEARCH INPUT */}
          <div className="mb-4">
            <div className="relative group">
              {/* AI Badge */}
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 
                bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-200/50 
                rounded-full text-[10px] font-medium text-blue-600 absolute -top-5 left-0 z-10">
                <Sparkles className="w-3.5 h-3" />
                AI
              </div>
              
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                type="text"
                placeholder="Search here.."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 bg-gray-50/50 group-focus-within:bg-white transition-all duration-300
                  group-focus-within:ring-2 group-focus-within:ring-blue-500/20 group-focus-within:border-blue-500/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            {/* Quick hint - Made more visible */}
            {searchQuery ? (
              <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 animate-fade-in">
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <p className="text-xs font-medium text-amber-700">
                    💡 Try: "merge pdf", "extract text", "lock pdf"
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-1 text-center">
                💡 Natural language search enabled
              </p>
            )}
          </div>

          {/* AI SEARCH RESULTS MODE */}
          {searchQuery.trim() ? (
            <div className="mb-4">
              {isSearching ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 mx-auto mb-2 relative">
                    <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-sm">AI is thinking...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {/* Results header */}
                  <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-xs text-gray-500">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-500/10 to-purple-600/10 
                      rounded-full text-xs font-medium text-blue-600">
                      <Sparkles className="w-3 h-3" />
                      AI
                    </div>
                  </div>
                  
                  {searchResults.map((result, index) => (
                    <MobileSearchResultButton
                      key={result.operation.id}
                      operation={result.operation}
                      // Convert percentage (0-100) to score (0-1) for UI
                      score={result.percentage / 100}
                      percentage={result.percentage}
                      description={OPERATION_KEYWORDS[result.operation.id]?.description}
                      confidence={result.confidence}
                      matchType={result.matchType}
                      // First result (highest percentage) is the best match
                      isBestMatch={index === 0}
                      onClick={() => {
                        const handler = operationHandlers[result.operation.id];
                        if (handler) handleMenuAction(handler);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm mb-1">No operations found</p>
                  <p className="text-xs text-gray-400">Try different keywords</p>
                </div>
              )}
            </div>
          ) : (
            // NORMAL CATEGORIES MODE
            <>
            <MenuSection title="DOCUMENT OPERATIONS">
            <MenuButton onClick={() => handleMenuAction(pdfToDocx)}>
              <FileText size={16} /> PDF TO DOCX
            </MenuButton>
            <MenuButton onClick={() => handleMenuAction(docxToPdf)}>
              <FileCode size={16} /> DOCX TO PDF
            </MenuButton>
            <MenuButton onClick={() => handleMenuAction(pdfToText)}>
              <FileSearch size={16} /> PDF TO TEXT
            </MenuButton>
            <MenuButton onClick={() => handleMenuAction(textToPdf)}>
              <FileText size={16} /> TEXT TO PDF
            </MenuButton>
            <MenuButton onClick={() => handleMenuAction(pdfToExcel)}>
              <FileSpreadsheet size={16} /> PDF TO EXCEL
            </MenuButton>
            <MenuButton onClick={() => handleMenuAction(excelToPdf)}>
              <FileSpreadsheet size={16} /> EXCEL TO PDF
            </MenuButton>
            <MenuButton onClick={() => handleMenuAction(pdfToPpt)}>
              <Presentation size={16} /> PDF TO POWERPOINT
            </MenuButton>
            <MenuButton onClick={() => handleMenuAction(pptxToPdf)}>
              <Presentation size={16} /> POWERPOINT TO PDF
            </MenuButton>
          </MenuSection>

              {/* PDF OPERATIONS */}
              <MenuSection title="PDF OPERATIONS">
                <MenuButton onClick={() => handleMenuAction(searchPdf)}>
                  <SearchCode  size={16} /> SEARCH IN PDF
                </MenuButton>
                <MenuButton onClick={() => handleMenuAction(lockPdf)}>
                  <Lock size={16} /> LOCK PDF
                </MenuButton>
                <MenuButton onClick={() => handleMenuAction(unlockPdf)}>
                  <Unlock size={16} /> UNLOCK PDF
                </MenuButton>
                <MenuButton onClick={() => handleMenuAction(mergePdf)}>
                  <Merge size={16} /> MERGE PDF
                </MenuButton>
                <MenuButton onClick={() => handleMenuAction(splitPdf)}>
                  <Split size={16} /> SPLIT PDF
                </MenuButton>
                <MenuButton onClick={() => handleMenuAction(watermarkPdf)}>
                  <FileText size={16} /> WATERMARK PDF
                </MenuButton>
              </MenuSection>

              {/* IMAGE OPERATIONS */}
              <MenuSection title="IMAGE OPERATIONS">
                <MenuButton onClick={() => handleMenuAction(convertImage)}>
                  <Images size={16} /> CONVERT IMAGES
                </MenuButton>
                <MenuButton onClick={() => handleMenuAction(resizeImage)}>
                  <Image size={16} /> RESIZE IMAGE
                </MenuButton>
                {/* Individual JPG Conversions */}
                <MenuButton onClick={() => handleMenuAction(jpgToPng)}>
                  <FileImage size={16} /> JPG TO PNG
                </MenuButton>
                <MenuButton onClick={() => handleMenuAction(jpgToWebp)}>
                  <FileImage size={16} /> JPG TO WEBP
                </MenuButton>
                <MenuButton onClick={() => handleMenuAction(jpgToBmp)}>
                  <FileImage size={16} /> JPG TO BMP
                </MenuButton>
                {/* Individual PNG Conversions */}
                <MenuButton onClick={() => handleMenuAction(pngToJpg)}>
                  <FileImage size={16} /> PNG TO JPG
                </MenuButton>
                <MenuButton onClick={() => handleMenuAction(pngToWebp)}>
                  <FileImage size={16} /> PNG TO WEBP
                </MenuButton>
                <MenuButton onClick={() => handleMenuAction(pngToBmp)}>
                  <FileImage size={16} /> PNG TO BMP
                </MenuButton>
                {/* Individual WEBP Conversions */}
                <MenuButton onClick={() => handleMenuAction(webpToJpg)}>
                  <FileImage size={16} /> WEBP TO JPG
                </MenuButton>
                <MenuButton onClick={() => handleMenuAction(webpToPng)}>
                  <FileImage size={16} /> WEBP TO PNG
                </MenuButton>
                <MenuButton onClick={() => handleMenuAction(webpToBmp)}>
                  <FileImage size={16} /> WEBP TO BMP
                </MenuButton>
                {/* Individual BMP Conversions */}
                <MenuButton onClick={() => handleMenuAction(bmpToJpg)}>
                  <FileImage size={16} /> BMP TO JPG
                </MenuButton>
                <MenuButton onClick={() => handleMenuAction(bmpToPng)}>
                  <FileImage size={16} /> BMP TO PNG
                </MenuButton>
                <MenuButton onClick={() => handleMenuAction(bmpToWebp)}>
                  <FileImage size={16} /> BMP TO WEBP
                </MenuButton>
                <MenuButton onClick={() => handleMenuAction(imageToPdf)}>
                  <Image size={16} /> IMAGE TO PDF
                </MenuButton>
              </MenuSection>

              {/* OCR */}
              <MenuSection title="OCR OPERATIONS">
                <SmartMenuButton onClick={() => handleMenuAction(ocrImage)}>
                  <Sparkles size={16} /> OCR IMAGE <span className="ml-1 px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[8px] font-bold rounded-full">SMART</span>
                </SmartMenuButton>
                <MenuButton onClick={() => handleMenuAction(detectLanguage)}>
                  <FileSearch size={16} /> DETECT LANGUAGE
                </MenuButton>
              </MenuSection>

              {/* ARCHIVE OPERATIONS */}
              <MenuSection title="ARCHIVE OPERATIONS">
                <MenuButton onClick={() => handleMenuAction(zip)}>
                  <Package size={16} /> ZIP FOLDER
                </MenuButton>
                <MenuButton onClick={() => handleMenuAction(unZip)}>
                  <FolderInput size={16} /> UNZIP FOLDER
                </MenuButton>
              </MenuSection>
            </>
          )}
        </div>
      </div>

      {/* =====================================================
          RIGHT DROPDOWN MENU
      ====================================================== */}
      <div
        className={`absolute right-0 top-full mt-2 w-48 bg-white border rounded-md shadow-lg
          flex flex-col gap-2 p-2 z-50
          transform transition-all duration-300 ease-out
          ${mobileRightOpen
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
          }
        `}
      >
        <Button
          variant="outline"
          className="w-full flex gap-2"
          onClick={() => {
            fetchHistory();
            setMobileRightOpen(false);
          }}
        >
          <History className="w-4 h-4" /> History
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => setMobileRightOpen(false)}
        >
          Close
        </Button>
      </div>
    </div>
  );
}

/* =====================================================
   REUSABLE COMPONENTS
===================================================== */

function MenuSection({ title, children }) {
  return (
    <div className="flex flex-col mb-6">
      <h4 className="text-xs font-bold mb-3 text-gray-900">{title}</h4>
      {children}
    </div>
  );
}

function MenuButton({ children, onClick }) {
  // Extract icon and text from children
  const childrenArray = React.Children.toArray(children);
  const icon = childrenArray[0];
  const text = childrenArray[1];

  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 text-sm px-2 py-2.5 rounded-lg
        transition-all duration-150 ease-out
        hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600
        hover:shadow-md hover:scale-[1.02]"
    >
      {React.cloneElement(icon, {
        className: `${icon.props.className || ''} text-blue-500 group-hover:text-white transition-all duration-150 ease-out transform group-hover:scale-110`.trim()
      })}
      <span className="bg-gradient-to-br from-blue-500 to-purple-600 bg-clip-text text-transparent group-hover:text-white transition-all duration-150 ease-out">
        {text}
      </span>
    </button>
  );
}

/* =====================================================
   SMART MENU BUTTON - Enhanced for OCR
===================================================== */
function SmartMenuButton({ children, onClick }) {
  const childrenArray = React.Children.toArray(children);
  const icon = childrenArray[0];

  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 text-sm px-2 py-2.5 rounded-lg
        transition-all duration-150 ease-out
        hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-600
        hover:shadow-md hover:scale-[1.02]
        relative overflow-hidden border border-purple-200/50"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 
        rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
      
      {React.cloneElement(icon, {
        className: `${icon.props.className || ''} text-purple-500 group-hover:text-white transition-all duration-150 ease-out transform group-hover:scale-110`.trim()
      })}
      <span className="bg-gradient-to-br from-purple-500 to-pink-600 bg-clip-text text-transparent group-hover:text-white transition-all duration-150 ease-out">
        {childrenArray.slice(1).reduce((acc, curr) => {
          if (typeof curr === 'string') acc += curr;
          return acc;
        }, '')}
      </span>
      {childrenArray.slice(2).map((child, idx) => (
        <React.Fragment key={idx}>{child}</React.Fragment>
      ))}
    </button>
  );
}

/* =====================================================
   SEARCH RESULT BUTTON (MOBILE)
   With percentage match and best match highlighting
===================================================== */
function MobileSearchResultButton({ 
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
          {/* Best Match Badge - Smaller */}
          {isBestMatch && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-blue-500 to-purple-600 
              text-white text-[8px] font-bold uppercase tracking-wider rounded-full flex-shrink-0">
              ★ Best
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

