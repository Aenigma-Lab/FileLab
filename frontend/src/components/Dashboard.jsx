import React, { useState, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileText,
  Image as ImageIcon,
  Lock,
  Archive,
  Scan,
  QrCode,
  FileCheck,
  FileSpreadsheet,
  Presentation,
  Merge,
  Split,
  Unlock,
  Search,
  RotateCw,
  PenTool,
  FileCode,
  X,
  ArrowLeft,
  Move,
} from "lucide-react";

// Category definitions with sub-operations
const CATEGORIES = [
  {
    id: "document",
    name: "Document",
    icon: FileText,
    color: "blue",
    description: "Convert documents",
    subOperations: [
      { id: "pdfToDocx", name: "PDF to DOCX", icon: FileCode, color: "red", description: "Convert PDF to Word" },
      { id: "docxToPdf", name: "DOCX to PDF", icon: FileText, color: "blue", description: "Convert Word to PDF" },
      { id: "pdfToText", name: "PDF to Text", icon: FileText, color: "gray", description: "Extract text from PDF" },
      { id: "textToPdf", name: "Text to PDF", icon: FileText, color: "gray", description: "Convert text to PDF" },
      { id: "pdfToExcel", name: "PDF to Excel", icon: FileSpreadsheet, color: "green", description: "Extract tables to Excel" },
      { id: "excelToPdf", name: "Excel to PDF", icon: FileSpreadsheet, color: "green", description: "Convert Excel to PDF" },
      { id: "pdfToPpt", name: "PDF to PowerPoint", icon: Presentation, color: "orange", description: "Convert PDF to PPT" },
      { id: "pptxToPdf", name: "PowerPoint to PDF", icon: Presentation, color: "orange", description: "Convert PPT to PDF" },
      { id: "textToDocx", name: "Text to DOCX", icon: FileCode, color: "blue", description: "Convert text to Word" },
    ],
  },
  {
    id: "pdf",
    name: "PDF",
    icon: FileCheck,
    color: "red",
    description: "PDF tools",
    subOperations: [
      { id: "merge", name: "Merge PDF", icon: Merge, color: "indigo", description: "Combine multiple PDFs" },
      { id: "split", name: "Split PDF", icon: Split, color: "rose", description: "Separate PDF pages" },
      { id: "lock", name: "Lock PDF", icon: Lock, color: "green", description: "Protect with password" },
      { id: "unlock", name: "Unlock PDF", icon: Unlock, color: "amber", description: "Remove password" },
      { id: "watermark", name: "Watermark", icon: PenTool, color: "purple", description: "Add watermark to PDF" },
      { id: "imageToPdf", name: "Image to PDF", icon: ImageIcon, color: "violet", description: "Convert images to PDF" },
    ],
  },
  {
    id: "image",
    name: "Image",
    icon: ImageIcon,
    color: "purple",
    description: "Image tools",
    subOperations: [
      { id: "convertImages", name: "Convert Image", icon: RotateCw, color: "violet", description: "Convert between formats" },
      { id: "jpgToPng", name: "JPG to PNG", icon: ImageIcon, color: "blue", description: "Convert JPG to PNG" },
      { id: "pngToJpg", name: "PNG to JPG", icon: ImageIcon, color: "orange", description: "Convert PNG to JPG" },
      { id: "jpgToWebp", name: "JPG to WEBP", icon: ImageIcon, color: "purple", description: "Convert to WEBP" },
      { id: "webpToJpg", name: "WEBP to JPG", icon: ImageIcon, color: "orange", description: "Convert WEBP to JPG" },
      { id: "pngToWebp", name: "PNG to WEBP", icon: ImageIcon, color: "purple", description: "Convert to WEBP" },
      { id: "resizeImage", name: "Resize Image", icon: Move, color: "cyan", description: "Change image size" },
      { id: "jpgToBmp", name: "JPG to BMP", icon: ImageIcon, color: "gray", description: "Convert to BMP" },
      { id: "pngToBmp", name: "PNG to BMP", icon: ImageIcon, color: "gray", description: "Convert to BMP" },
      { id: "webpToPng", name: "WEBP to PNG", icon: ImageIcon, color: "blue", description: "Convert to PNG" },
      { id: "bmpToJpg", name: "BMP to JPG", icon: ImageIcon, color: "orange", description: "Convert BMP to JPG" },
      { id: "bmpToPng", name: "BMP to PNG", icon: ImageIcon, color: "blue", description: "Convert BMP to PNG" },
    ],
  },
  {
    id: "ocr",
    name: "OCR",
    icon: Scan,
    color: "violet",
    description: "Text recognition",
    subOperations: [
      { id: "ocr", name: "OCR Image", icon: Scan, color: "violet", description: "Extract text from images" },
      { id: "search", name: "Search in PDF", icon: Search, color: "cyan", description: "Find text in PDF" },
      { id: "detectLanguage", name: "Detect Language", icon: Scan, color: "teal", description: "Detect text language" },
    ],
  },
  {
    id: "archive",
    name: "Archive",
    icon: Archive,
    color: "teal",
    description: "Compress & extract",
    subOperations: [
      { id: "zip", name: "ZIP", icon: Archive, color: "teal", description: "Compress files" },
      { id: "unzip", name: "UNZIP", icon: Archive, color: "cyan", description: "Extract archives" },
    ],
  },
  {
    id: "qrcode",
    name: "QR Code",
    icon: QrCode,
    color: "pink",
    description: "Generate QR codes",
    subOperations: [
      { id: "qrcode", name: "QR Code", icon: QrCode, color: "pink", description: "Generate QR codes" },
    ],
  },
];

// Color mapping for category buttons
const CATEGORY_COLORS = {
  blue: {
    bg: "bg-blue-500",
    hover: "hover:bg-blue-600",
    light: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
  },
  purple: {
    bg: "bg-purple-500",
    hover: "hover:bg-purple-600",
    light: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
  },
  red: {
    bg: "bg-red-500",
    hover: "hover:bg-red-600",
    light: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
  },
  violet: {
    bg: "bg-violet-500",
    hover: "hover:bg-violet-600",
    light: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-200",
  },
  teal: {
    bg: "bg-teal-500",
    hover: "hover:bg-teal-600",
    light: "bg-teal-50",
    text: "text-teal-600",
    border: "border-teal-200",
  },
  pink: {
    bg: "bg-pink-500",
    hover: "hover:bg-pink-600",
    light: "bg-pink-50",
    text: "text-pink-600",
    border: "border-pink-200",
  },
};

// Color mapping for operation cards
const CARD_COLORS = {
  blue: { bg: "bg-blue-500", text: "text-blue-600", border: "border-blue-200" },
  purple: { bg: "bg-purple-500", text: "text-purple-600", border: "border-purple-200" },
  red: { bg: "bg-red-500", text: "text-red-600", border: "border-red-200" },
  green: { bg: "bg-green-500", text: "text-green-600", border: "border-green-200" },
  orange: { bg: "bg-orange-500", text: "text-orange-600", border: "border-orange-200" },
  indigo: { bg: "bg-indigo-500", text: "text-indigo-600", border: "border-indigo-200" },
  violet: { bg: "bg-violet-500", text: "text-violet-600", border: "border-violet-200" },
  cyan: { bg: "bg-cyan-500", text: "text-cyan-600", border: "border-cyan-200" },
  teal: { bg: "bg-teal-500", text: "text-teal-600", border: "border-teal-200" },
  amber: { bg: "bg-amber-500", text: "text-amber-600", border: "border-amber-200" },
  rose: { bg: "bg-rose-500", text: "text-rose-600", border: "border-rose-200" },
  gray: { bg: "bg-gray-500", text: "text-gray-600", border: "border-gray-200" },
  pink: { bg: "bg-pink-500", text: "text-pink-600", border: "border-pink-200" },
};

const Dashboard = ({ onSelectOperation }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  // Flatten all operations for search
  const allOperations = useMemo(() => {
    return CATEGORIES.flatMap((category) =>
      category.subOperations.map((op) => ({
        ...op,
        categoryName: category.name,
        categoryId: category.id,
      }))
    );
  }, []);

  // Filter operations based on search query
  const filteredOperations = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return allOperations.filter(
      (op) =>
        op.name.toLowerCase().includes(query) ||
        op.description.toLowerCase().includes(query) ||
        op.categoryName.toLowerCase().includes(query)
    );
  }, [searchQuery, allOperations]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  };

  const handleSearchChange = () => {
    if (searchInputRef.current) {
      setSearchQuery(searchInputRef.current.value);
    }
  };

  const handleOperationClick = (operationId) => {
    if (onSelectOperation) {
      onSelectOperation(operationId);
    }
  };

  // Show search results when searching (below the search box)
  const isSearching = searchQuery.trim() !== "";

  // If a category is selected, show sub-operations (but keep search box)
  if (selectedCategory) {
    return (
      <div className="w-full">
        {/* Search box - always visible */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search operations... eg. pdf to word"
              onInput={handleSearchChange}
              className={cn(
                "flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 pr-10",
                "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              )}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Back button and header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCategory.name} Tools
          </h2>
        </div>

        {/* Sub-operations grid - iLovePDF style cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {selectedCategory.subOperations.map((operation) => {
            const colors = CARD_COLORS[operation.color] || CARD_COLORS.blue;
            return (
              <Card
                key={operation.id}
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  "hover:shadow-lg hover:-translate-y-1",
                  "border-2 border-transparent hover:border-gray-200",
                  "bg-white"
                )}
                onClick={() => handleOperationClick(operation.id)}
              >
                <CardContent className="p-5 flex flex-col items-center text-center h-full">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                      colors.bg,
                      "text-white shadow-md"
                    )}
                  >
                    <operation.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {operation.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {operation.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Show main categories grid (with search box)
  return (
    <div className="w-full">
      {/* Search box - always visible */}
      <div className="mb-8">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search operations... {eg. pdf to word}"
            onInput={handleSearchChange}
            className={cn(
              "flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 pr-10",
              "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            )}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search results - show when searching */}
        {isSearching && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-4">
              {filteredOperations.length} operation{filteredOperations.length !== 1 ? "s" : ""} found for "{searchQuery}"
            </p>

            {filteredOperations.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredOperations.map((operation) => {
                  const colors = CARD_COLORS[operation.color] || CARD_COLORS.blue;
                  return (
                    <Card
                      key={operation.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200",
                        "hover:shadow-lg hover:-translate-y-1",
                        "border-2 border-transparent hover:border-gray-200",
                        "bg-white"
                      )}
                      onClick={() => handleOperationClick(operation.id)}
                    >
                      <CardContent className="p-5 flex flex-col items-center text-center h-full">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                            colors.bg,
                            "text-white shadow-md"
                          )}
                        >
                          <operation.icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                          {operation.name}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {operation.description}
                        </p>
                        <span className="text-xs text-gray-400 mt-2">
                          in {operation.categoryName}
                        </span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No operations found</p>
                <p className="text-gray-400 text-sm mt-1">
                  Try searching for something else
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category buttons - 6 buttons grid - hide when searching */}
      {!isSearching && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {CATEGORIES.map((category) => {
            const colors = CATEGORY_COLORS[category.color] || CATEGORY_COLORS.blue;
            return (
              <Card
                key={category.id}
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  "hover:shadow-lg hover:-translate-y-1",
                  "border-0 bg-white",
                  "h-32 md:h-36 lg:h-40"
                )}
                onClick={() => handleCategoryClick(category)}
              >
                <CardContent className="p-4 md:p-5 flex flex-col items-center justify-center h-full">
                  <div
                    className={cn(
                      "w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mb-3",
                      colors.bg,
                      "text-white shadow-md"
                    )}
                  >
                    <category.icon className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {category.subOperations.length} tools
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick access section - hide when searching */}
      {!isSearching && (
        <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Popular Operations
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {CATEGORIES.flatMap((cat) =>
              cat.subOperations.slice(0, 2).map((op) => {
                const colors = CARD_COLORS[op.color] || CARD_COLORS.blue;
                return (
                  <Button
                    key={op.id}
                    variant="outline"
                    className={cn(
                      "h-auto py-3 px-4 flex flex-col items-center gap-2",
                      "border-2 hover:border-gray-300",
                      "transition-all duration-200"
                    )}
                    onClick={() => handleOperationClick(op.id)}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        colors.bg,
                        "text-white"
                      )}
                    >
                      <op.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {op.name}
                    </span>
                  </Button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

