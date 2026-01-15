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
          <div className="flex items-center justify-between mb-6">
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

          {/* SEARCH INPUT */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search operations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
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
          </div>

          {/* SEARCH RESULTS MODE */}
          {searchQuery.trim() ? (
            <div className="mb-6">
              {filteredOperations && filteredOperations.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {filteredOperations.map((op) => (
                    <MobileSearchResultButton
                      key={op.id}
                      operation={op}
                      onClick={() => {
                        const handler = operationHandlers[op.id];
                        if (handler) handleMenuAction(handler);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No operations found for "{searchQuery}"</p>
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
            <MenuButton onClick={() => handleMenuAction(pdfToPptx)}>
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
                <MenuButton onClick={() => handleMenuAction(ocrImage)}>
                  <Scan size={16} /> OCR IMAGE
                </MenuButton>
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

function MobileSearchResultButton({ operation, onClick }) {
  const Icon = operation.icon;
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 text-sm px-3 py-3 rounded-xl
        transition-all duration-150 ease-out
        hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600
        hover:shadow-lg hover:scale-[1.02]
        w-full text-left"
    >
      <Icon size={20} className="text-blue-500 group-hover:text-white transition-all duration-150 ease-out transform group-hover:scale-110" />
      <div className="flex-1">
        <span className="block font-medium bg-gradient-to-br from-blue-500 to-purple-600 bg-clip-text text-transparent group-hover:text-white transition-all duration-150 ease-out">
          {operation.label}
        </span>
        <span className="text-xs text-gray-400 group-hover:text-white/80 transition-all duration-150 ease-out">
          {operation.category}
        </span>
      </div>
    </button>
  );
}

