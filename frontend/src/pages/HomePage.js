import { useState,useEffect, useRef } from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

import axios from "axios";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Lock,
  Unlock,
  Merge,
  Split,
  Archive,
  FileSearch,
  History,
  Download,
  Trash2,
  LayoutGrid,
  Wrench,
  Scan,
  FileSpreadsheet,
  Zap,
  PenTool,
  Search,

  /* ===== Added (Missing) ===== */
  RotateCw,
  FileCheck,
  FileCode,
  Presentation,
  EyeOff,
  ShieldCheck,
  Languages,
  Sparkles,
  Table,
  MoreVertical,
  Grid3x3,
  X,
  AlertCircle,
  Loader2
} from "lucide-react";
import { 
  IconFileMerge,
  IconFileZip,
  IconFileSplit,
  IconDownload,
  IconTrash,
  IconLayoutGrid,
  IconWrench,
  IconScan,
  IconFileSpreadsheet,
  IconLock,
  IconUnlock,
  IconPenTool,
  IconGridDots
} from '@tabler/icons-react';

import { Button } from "@/components/ui/button";
import ProgressButton from "@/components/ui/ProgressButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
// import MobileNavbar from "@/components/ui/mobilenav"; 
// import CollapsibleSection from "../components/ui/CollapsibleSection/CollapsibleSection";
import { DesktopNavbar } from "@/components/layout/DesktopNavbar";
import { MobileNavbar } from "@/components/layout/MobileNavbar";
import WatermarkPDF from "@/components/WatermarkPDF";
import { set } from "date-fns";
// import styles from "./HeaderMenu.module.css";



// Use relative API path for network compatibility
// When REACT_APP_BACKEND_URL is empty, use relative path
const getBackendUrl = () => {
  const url = process.env.REACT_APP_BACKEND_URL;
  // If URL is empty or not set, use relative path
  if (!url || url.trim() === '') {
    return '';
  }
  return url;
};

const BACKEND_URL = getBackendUrl();
// Use relative path for API - works with nginx proxy from any network location
const API = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";

// Merge PDF limits
const MAX_MERGE_FILES = 20;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

const HomePage = () => {
const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [extractSelectedFile, setExtractSelectedFile] = useState(null);
  
  // Merge PDF - SIMPLIFIED: No manual selection needed, all files auto-merged
  const [targetFormat, setTargetFormat] = useState("");
  const [password, setPassword] = useState("");
  const [pageRanges, setPageRanges] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [ocrLanguage, setOcrLanguage] = useState("eng");
  const [ocrLanguages, setOcrLanguages] = useState([]); // Available OCR languages
  const [ocrLanguagesLoading, setOcrLanguagesLoading] = useState(true);
  const [showOcrDialog, setShowOcrDialog] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [extractedFiles, setExtractedFiles] = useState([]);
  const [extractionId, setExtractionId] = useState(null);
  const [showExtractedFiles, setShowExtractedFiles] = useState(false);
  const [detectingLanguage, setDetectingLanguage] = useState(false); // Loading state for language detection
  const [conversionProgress, setConversionProgress] = useState(0); // Progress tracking for conversions
  const [showDownloadButton, setShowDownloadButton] = useState(false); // Show download after successful conversion
  const [convertedBlob, setConvertedBlob] = useState(null); // Store converted file blob
  const [convertedFilename, setConvertedFilename] = useState(""); // Store converted filename
  const [searchTerm, setSearchTerm] = useState(""); // Search term for PDF search
  const [searchResults, setSearchResults] = useState(null); // Search results
  const [success, setSuccess] = useState(false); // Success state for PDF operations
  const fileInputRef = useRef(null);
  const zipFileInputRef = useRef(null);
  const zipExtractInputRef = useRef(null);
  const imageFileInputRef = useRef(null); // New ref for image file input
  
  // Image to PDF specific state
  const [selectedImages, setSelectedImages] = useState([]);
  const [pdfPageSize, setPdfPageSize] = useState("auto");
  const [pdfQuality, setPdfQuality] = useState("high");
  const [pdfOutputMode, setPdfOutputMode] = useState("single");
  const [draggedImageIndex, setDraggedImageIndex] = useState(null);

  // Image resize specific state
  const [resizeImages, setResizeImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [resizePreset, setResizePreset] = useState("medium");
  const [resizeFormat, setResizeFormat] = useState("original");
  const [resizeQuality, setResizeQuality] = useState("high"); // Changed from number to string
  const [resizeError, setResizeError] = useState(null);
  const [resizeResults, setResizeResults] = useState([]);
  const [isResizing, setIsResizing] = useState(false);
  
  // Legacy single image resize state (kept for compatibility)
  const [resizeWidth, setResizeWidth] = useState(800);
  const [resizeHeight, setResizeHeight] = useState(600);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [resizeOutputFormat, setResizeOutputFormat] = useState("jpeg");
  const [resizeSelectedFile, setResizeSelectedFile] = useState(null);
  const [resizePreview, setResizePreview] = useState(null);
  const [originalImageDimensions, setOriginalImageDimensions] = useState(null);
  const resizeFileInputRef = useRef(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [open, setOpen] = useState(false); // desktop mega menu
  const [mobileRightOpen, setMobileRightOpen] = useState(false);
  const [openLanguageDropdown, setOpenLanguageDropdown] = useState(false);
  const [openDocumentDropdown, setOpenDocumentDropdown] = useState(false);
  const [openImageDropdown, setOpenImageDropdown] = useState(false);

  const [activeTab, setActiveTab] = useState("pdfToDocx"); // Default to first operation

  // Operation names mapping - ALL OPERATIONS
  const operationNames = {
    // Document Operations
    pdfToDocx: "PDF to DOCX",
    docxToPdf: "DOCX to PDF",
    docToDocx: "DOC to DOCX",
    docxToDoc: "DOCX to DOC",
    pdfToText: "PDF to Text",
    textToPdf: "Text to PDF",
    textToDocx: "Text to DOCX",
    pdfToExcel: "PDF to Excel",
    excelToPdf: "Excel to PDF",
    pdfToPpt: "PDF to PowerPoint",
    pptxToPdf: "PowerPoint to PDF",
    imageToPdf: "Image to PDF",
    // Watermark Operations
    watermark: "Watermark PDF",
    // Image Operations - Generic
    convertImages: "Convert Images",
    // Image Operations - Resize
    resizeImage: "Resize Image",
    // Image Operations - Individual
    jpgToPng: "JPG to PNG",
    jpgToWebp: "JPG to WEBP",
    jpgToBmp: "JPG to BMP",
    pngToJpg: "PNG to JPG",
    pngToWebp: "PNG to WEBP",
    pngToBmp: "PNG to BMP",
    webpToJpg: "WEBP to JPG",
    webpToPng: "WEBP to PNG",
    webpToBmp: "WEBP to BMP",
    bmpToJpg: "BMP to JPG",
    bmpToPng: "BMP to PNG",
    bmpToWebp: "BMP to WEBP",
    // PDF Operations
    lock: "Lock PDF",
    unlock: "Unlock PDF",
    merge: "Merge PDF",
    split: "Split PDF",
    // Archive Operations
    zip: "ZIP Folder",
    unzip: "UNZIP Folder",
    // OCR Operations
    search: "Search in PDF",
    ocr: "OCR Image",
    detectLanguage: "Detect Language",
  };

  // Helper function to get icon for image format
  const getImageFormatIcon = (format) => {
    switch (format) {
      case 'jpg':
        return <ImageIcon className="w-4 h-4 mr-2 text-orange-500" />;
      case 'jpeg':
        return <ImageIcon className="w-4 h-4 mr-2 text-orange-400" />;
      case 'png':
        return <ImageIcon className="w-4 h-4 mr-2 text-blue-500" />;
      case 'webp':
        return <ImageIcon className="w-4 h-4 mr-2 text-purple-500" />;
      case 'bmp':
        return <ImageIcon className="w-4 h-4 mr-2 text-gray-500" />;
      default:
        return <ImageIcon className="w-4 h-4 mr-2" />;
    }
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get all available image formats for dropdown
  const getAllImageFormats = () => [
    { value: 'jpg', label: 'JPG' },
    { value: 'jpeg', label: 'JPEG' },
    { value: 'png', label: 'PNG' },
    { value: 'webp', label: 'WEBP' },
    { value: 'bmp', label: 'BMP' },
  ];

  // // Helper function to get icon for document format
  // const getFormatIcon = (format) => {
  //   switch (format) {
  //     case 'pdf':
  //       return <FileText className="w-4 h-4 mr-2 text-red-500" />;
  //     case 'docx':
  //       return <FileText className="w-4 h-4 mr-2 text-blue-600" />;
  //     case 'doc':
  //       return <FileText className="w-4 h-4 mr-2 text-blue-400" />;
  //     case 'txt':
  //       return <FileText className="w-4 h-4 mr-2 text-gray-500" />;
  //     case 'xlsx':
  //       return <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />;
  //     case 'xls':
  //       return <FileSpreadsheet className="w-4 h-4 mr-2 text-green-400" />;
  //     case 'pptx':
  //       return <Presentation className="w-4 h-4 mr-2 text-orange-500" />;
  //     case 'ppt':
  //       return <Presentation className="w-4 h-4 mr-2 text-orange-400" />;
  //     default:
  //       return <FileText className="w-4 h-4 mr-2" />;
  //   }
  // };

  // // Get all available formats for dropdown
  // const getAllFormats = () => [
  //   { value: 'pdf', label: 'PDF' },
  //   { value: 'docx', label: 'DOCX (Word)' },
  //   { value: 'doc', label: 'DOC (Word Legacy)' },
  //   { value: 'txt', label: 'TXT (Text)' },
  //   { value: 'xlsx', label: 'XLSX (Excel)' },
  //   { value: 'xls', label: 'XLS (Excel Legacy)' },
  //   { value: 'pptx', label: 'PPTX (PowerPoint)' },
  //   { value: 'ppt', label: 'PPT (PowerPoint Legacy)' },
  // ];

  // Helper function to get available conversion formats based on source file type
  // const getAvailableFormats = (filename) => {
  //   const ext = filename.split('.').pop().toLowerCase();
    
  //   const allFormats = [
  //     { value: 'pdf', label: 'PDF' },
  //     { value: 'docx', label: 'DOCX (Word)' },
  //     { value: 'doc', label: 'DOC (Word Legacy)' },
  //     { value: 'txt', label: 'TXT (Text)' },
  //     { value: 'xlsx', label: 'XLSX (Excel)' },
  //     { value: 'xls', label: 'XLS (Excel Legacy)' },
  //     { value: 'pptx', label: 'PPTX (PowerPoint)' },
  //     { value: 'ppt', label: 'PPT (PowerPoint Legacy)' },
  //   ];

    // Define available conversions based on source format
  //   const formatMap = {
  //     // Word documents
  //     'docx': [
  //       { value: 'pdf', label: 'PDF' },
  //       { value: 'doc', label: 'DOC (Word Legacy)' },
  //       { value: 'txt', label: 'TXT (Text)' },
  //     ],
  //     'doc': [
  //       { value: 'docx', label: 'DOCX (Word)' },
  //       { value: 'pdf', label: 'PDF' },
  //     ],
  //     // PDF
  //     'pdf': [
  //       { value: 'docx', label: 'DOCX (Word)' },
  //       { value: 'doc', label: 'DOC (Word Legacy)' },
  //       { value: 'txt', label: 'TXT (Text)' },
  //       { value: 'xlsx', label: 'XLSX (Excel)' },
  //       { value: 'pptx', label: 'PPTX (PowerPoint)' },
  //     ],
  //     // Text
  //     'txt': [
  //       { value: 'docx', label: 'DOCX (Word)' },
  //       { value: 'pdf', label: 'PDF' },
  //     ],
  //     // Excel
  //     'xlsx': [
  //       { value: 'pdf', label: 'PDF' },
  //     ],
  //     'xls': [
  //       { value: 'pdf', label: 'PDF' },
  //     ],
  //     // PowerPoint
  //     'pptx': [
  //       { value: 'pdf', label: 'PDF' },
  //     ],
  //     'ppt': [
  //       { value: 'pdf', label: 'PDF' },
  //     ],
  //     // Images
  //     'jpg': [
  //       { value: 'pdf', label: 'PDF' },
  //     ],
  //     'jpeg': [
  //       { value: 'pdf', label: 'PDF' },
  //     ],
  //     'png': [
  //       { value: 'pdf', label: 'PDF' },
  //     ],
  //   };

  //   return formatMap[ext] || allFormats;
  // };

  // const openDocumentTab = () => {
  //   setActiveTab("pdfToDocx");
  // };

  const openLockPDF = () => {
    setActiveTab("lock");
  };

  const openUnlockPDF = () => {
    setActiveTab("unlock");
  };

  const openMergePdf = () => {
    setActiveTab("merge");
  };

  const openSplitPdf = () => {
    setActiveTab("split");
  };

  const openOcrImage = () => {  
    setActiveTab("ocr");
  };
  
  const openConvertImage = () => {        
    setActiveTab("convertImages");        
  };

  const openResizeImage = () => {
    setActiveTab("resizeImage");
  };

  // Individual image conversion navigation functions
  const openJpgToPng = () => setActiveTab("jpgToPng");
  const openJpgToWebp = () => setActiveTab("jpgToWebp");
  const openJpgToBmp = () => setActiveTab("jpgToBmp");
  const openPngToJpg = () => setActiveTab("pngToJpg");
  const openPngToWebp = () => setActiveTab("pngToWebp");
  const openPngToBmp = () => setActiveTab("pngToBmp");
  const openWebpToJpg = () => setActiveTab("webpToJpg");
  const openWebpToPng = () => setActiveTab("webpToPng");
  const openWebpToBmp = () => setActiveTab("webpToBmp");
  const openBmpToJpg = () => setActiveTab("bmpToJpg");
  const openBmpToPng = () => setActiveTab("bmpToPng");
  const openBmpToWebp = () => setActiveTab("bmpToWebp");

  const openZipTab = () => {
    setActiveTab("zip");
  };

  const openUnzipTab = () => {
    setActiveTab("unzip");
  };

  const openSearchPdf = () => {
    setActiveTab("search");
  };

  // Desktop Menu Handlers for Document Operations
  const openPdfToDocx = () => {
    setActiveTab("pdfToDocx");
  };
  // const openDocToDocx = () => {
  //   setActiveTab("docToDocx");
  // };
  const openPdfToText = () => {
    setActiveTab("pdfToText");
  };

  const openDocxToPdf = () => {
    setActiveTab("docxToPdf");
  };

  // const openDocxToDoc = () => {
  //   setActiveTab("docxToDoc");
  // };

  const openTextToPdf = () => {
    setActiveTab("textToPdf");
  };

  const openTextToDocx = () => {
    setActiveTab("textToDocx");
  };

  const openPdfToExcel = () => {
    setActiveTab("pdfToExcel");
  };

  const openExcelToPdf = () => {
    setActiveTab("excelToPdf");
  };
  
  const openPdfToPpt = () => {
    setActiveTab("pdfToPpt");
  };

  const openPptxToPdf = () => {
    setActiveTab("pptxToPdf");
  };

  const openImageToPdf = () => {
    setActiveTab("imageToPdf");
  };

  const openWatermarkPdf = () => {
    setActiveTab("watermark");
  };

  const openDetectLanguage = () => {
    setActiveTab("ocr");
  };

  
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Special validation for merge tab
    if (activeTab === 'merge') {
      // Filter only PDF files
      const pdfFiles = files.filter(file => file.type === 'application/pdf');
      const nonPdfFiles = files.filter(file => file.type !== 'application/pdf');
      
      // Show warning about non-PDF files but continue with valid PDFs
      if (nonPdfFiles.length > 0) {
        toast.warning(`Skipped ${nonPdfFiles.length} non-PDF file(s). Only PDF files are allowed for merge.`);
      }
      
      // If no PDF files, stop here
      if (pdfFiles.length === 0) {
        toast.error("No valid PDF files selected");
        return;
      }
      
      // Check file count limit (only for valid PDFs)
      const currentCount = selectedFiles.length;
      const newCount = pdfFiles.length;
      if (currentCount + newCount > MAX_MERGE_FILES) {
        toast.error(`Maximum ${MAX_MERGE_FILES} PDF files allowed for merge. You currently have ${currentCount} selected and trying to add ${newCount}.`);
        return;
      }
      
      // Check file size limit (only for valid PDFs)
      const oversizedFiles = pdfFiles.filter(file => file.size > MAX_FILE_SIZE);
      if (oversizedFiles.length > 0) {
        const oversizedNames = oversizedFiles.map(f => f.name).join(', ');
        toast.error(`Some files exceed the ${MAX_FILE_SIZE / (1024 * 1024)}MB size limit: ${oversizedNames}`);
        // Filter out oversized files
        const validSizedPdfs = pdfFiles.filter(f => f.size <= MAX_FILE_SIZE);
        if (validSizedPdfs.length > 0) {
          setSelectedFiles(prev => [...prev, ...validSizedPdfs]);
          toast.success(`Added ${validSizedPdfs.length} valid PDF file(s)`);
        }
        return;
      }
      
// Add valid PDF files with unique IDs
      const pdfFilesWithIds = pdfFiles.map(assignFileId);
      
      // SIMPLIFIED: Just add files to selectedFiles - all files auto-selected
      setSelectedFiles(prevFiles => {
        return prevFiles ? [...prevFiles, ...pdfFilesWithIds] : pdfFilesWithIds;
      });

      if (pdfFiles.length > 0) {
        toast.success(`Added ${pdfFiles.length} PDF file(s)`);
      }
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);
    // Auto-detect language for OCR when file is selected
    if (activeTab === 'ocr' && files.length > 0) {
      autoDetectLanguage(files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    // Special validation for merge tab
    if (activeTab === 'merge') {
      // Filter only PDF files
      const pdfFiles = files.filter(file => file.type === 'application/pdf');
      const nonPdfFiles = files.filter(file => file.type !== 'application/pdf');
      
      // Show warning about non-PDF files but continue with valid PDFs
      if (nonPdfFiles.length > 0) {
        toast.warning(`Skipped ${nonPdfFiles.length} non-PDF file(s). Only PDF files are allowed for merge.`);
      }
      
      // If no PDF files, stop here
      if (pdfFiles.length === 0) {
        toast.error("No valid PDF files selected");
        return;
      }
      
      // Check file count limit (only for valid PDFs)
      const currentCount = selectedFiles.length;
      const newCount = pdfFiles.length;
      if (currentCount + newCount > MAX_MERGE_FILES) {
        toast.error(`Maximum ${MAX_MERGE_FILES} PDF files allowed for merge. You currently have ${currentCount} selected and trying to add ${newCount}.`);
        return;
      }
      
      // Check file size limit (only for valid PDFs)
      const oversizedFiles = pdfFiles.filter(file => file.size > MAX_FILE_SIZE);
      if (oversizedFiles.length > 0) {
        const oversizedNames = oversizedFiles.map(f => f.name).join(', ');
        toast.error(`Some files exceed the ${MAX_FILE_SIZE / (1024 * 1024)}MB size limit: ${oversizedNames}`);
        // Filter out oversized files
        const validSizedPdfs = pdfFiles.filter(f => f.size <= MAX_FILE_SIZE);
        if (validSizedPdfs.length > 0) {
          setSelectedFiles(prev => [...prev, ...validSizedPdfs]);
          toast.success(`Added ${validSizedPdfs.length} valid PDF file(s)`);
        }
        return;
      }
      
// Add valid PDF files with unique IDs
      const pdfFilesWithIds = pdfFiles.map(assignFileId);
      
      // SIMPLIFIED: Just add files to selectedFiles - all files auto-selected
      setSelectedFiles(prevFiles => {
        return prevFiles ? [...prevFiles, ...pdfFilesWithIds] : pdfFilesWithIds;
      });

      if (pdfFiles.length > 0) {
        toast.success(`Added ${pdfFiles.length} PDF file(s)`);
      }
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);
    // Auto-detect language for OCR when image is dropped
    if (activeTab === 'ocr' && files.length > 0) {
      autoDetectLanguage(files[0]);
    }
  };

const handleDragOver = (e) => {
    e.preventDefault();
  };

  // ========== Merge PDF Multi-Select Functions ==========

  // Use a separate Map to track merge IDs for files (avoids spreading File objects which loses prototype)
  const mergeFileIdsRef = useRef(new Map());
  
  // Assign unique ID to a file object - uses Map to store ID without modifying the File object
  const assignFileId = (file) => {
    const mergeId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    mergeFileIdsRef.current.set(file, mergeId);
    return file;
  };

  // Get the merge ID for a file
  const getFileMergeId = (file) => {
    return mergeFileIdsRef.current.get(file);
  };

  // Remove file from selected list
  const removeMergeFile = (index, e) => {
    e.stopPropagation();
    const file = selectedFiles[index];
    // Remove from Map
    mergeFileIdsRef.current.delete(file);
    // Use filter to create new array
    setSelectedFiles(prevFiles => prevFiles.filter((f, i) => i !== index));
  };

  // Clear all files
  const clearAllMergeFiles = () => {
    mergeFileIdsRef.current.clear();
    setSelectedFiles([]);
  };

  // Get files to merge
  const getFilesToMerge = () => {
    // Return all selected files - they should all be valid File objects
    return selectedFiles.filter(f => f && f instanceof File);
  };

  // Reset merge selection when switching away from merge tab
  useEffect(() => {
    if (activeTab !== 'merge') {
      // Clear selection when leaving merge tab (SIMPLIFIED: no mergeFileIds to clear)
      setSelectedFiles([]);
    }
  }, [activeTab]);

  // Auto-detect language based on image analysis using backend API
  const autoDetectLanguage = async (file) => {
    if (!file) return;

    setDetectingLanguage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API}/ocr/detect-language`, formData);
      const result = response.data;

      if (result.primary_language) {
        setOcrLanguage(result.primary_language.code);
        toast.info(`Detected: ${result.primary_language.name}${result.confidence > 0 ? ` (${Math.round(result.confidence)}% confidence)` : ''}`);
      } else {
        // Fallback to English if available
        const hasEnglish = ocrLanguages.some(l => l.code === 'eng');
        if (hasEnglish) {
          setOcrLanguage('eng');
        } else if (ocrLanguages.length > 0) {
          setOcrLanguage(ocrLanguages[0].code);
        }
      }
    } catch (error) {
      console.error("Language detection failed:", error);
      // Fallback to English on error
      const hasEnglish = ocrLanguages.some(l => l.code === 'eng');
      if (hasEnglish) {
        setOcrLanguage('eng');
      } else if (ocrLanguages.length > 0) {
        setOcrLanguage(ocrLanguages[0].code);
      }
    } finally {
      setDetectingLanguage(false);
    }
  };

  const handleZipFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleExtractFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Validate that it's a ZIP file
      const file = files[0];
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.zip')) {
        setExtractSelectedFile(file);
      } else {
        toast.error("Please select a ZIP file");
      }
    }
  };

  // Reset extract selected file when switching tabs
  useEffect(() => {
    if (activeTab !== 'zip') {
      setExtractSelectedFile(null);
    }
  }, [activeTab]);

  // Fetch available OCR languages on component mount
  useEffect(() => {
    const fetchOcrLanguages = async () => {
      try {
        setOcrLanguagesLoading(true);
        const response = await axios.get(`${API}/ocr/languages`);
        setOcrLanguages(response.data.languages || []);
        // Set default to English if available, otherwise first available language
        if (response.data.languages && response.data.languages.length > 0) {
          const hasEnglish = response.data.languages.some(l => l.code === 'eng');
          if (hasEnglish) {
            setOcrLanguage('eng');
          } else {
            setOcrLanguage(response.data.languages[0].code);
          }
        }
      } catch (error) {
        console.error("Failed to fetch OCR languages:", error);
        // Fallback to default languages if API fails
        setOcrLanguages([
          { code: 'eng', name: 'English' },
          { code: 'hin', name: 'Hindi' },
          { code: 'spa', name: 'Spanish' },
          { code: 'fra', name: 'French' },
          { code: 'deu', name: 'German' },
          { code: 'ita', name: 'Italian' },
          { code: 'por', name: 'Portuguese' },
        ]);
      } finally {
        setOcrLanguagesLoading(false);
      }
    };

    fetchOcrLanguages();
  }, []);

  

  const downloadFile = (blob, filename, onComplete) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    // Call completion callback if provided
    if (onComplete) {
      setTimeout(onComplete, 100);
    }
  };

  // Reset all conversion state for new operation
  const resetConversionState = () => {
    setSelectedFiles([]);
    setConvertedBlob(null);
    setConvertedFilename("");
    setShowDownloadButton(false);
    setConversionProgress(0);
    setSuccess(false);
  };

  const downloadIndividualFile = async (filePath, filename) => {
    if (!extractionId) {
      toast.error("Extraction session expired. Please extract again.");
      return;
    }

    console.log("Downloading file:", { extractionId, filePath, filename });
    const downloadUrl = `${API}/zip/download-file/${extractionId}/${filePath}`;
    console.log("Download URL:", downloadUrl);

    try {
      const response = await axios.get(downloadUrl, {
        responseType: 'blob'
      });
      downloadFile(response.data, filename);
      toast.success(`Downloaded: ${filename}`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error(error.response?.data?.detail || "Failed to download file");
    }
  };

  const convertDocument = async (targetFormat = 'docx') => {
    if (!selectedFiles[0]) {
      toast.error("Please select a file");
      return;
    }

    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");

    const formData = new FormData();
    formData.append("file", selectedFiles[0]);
    formData.append("target_format", targetFormat);

    // Use XMLHttpRequest to track upload progress
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50); // Upload is 50% of progress
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50); // Download is remaining 50%
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        setConvertedBlob(blob);
        setConvertedFilename(`converted.${targetFormat}`);
        setShowDownloadButton(true);
        setSuccess(true);
        toast.success("Document converted successfully!");
        setLoading(false);
        setConversionProgress(100);
        // Don't reset state for next conversion - allow download first
        // setSelectedFiles([]);
      } else {
        const errorBlob = new Blob([xhr.response], { type: "application/json" });
        errorBlob.text()
          .then((errorText) => {
            try {
              const errorData = JSON.parse(errorText);
              toast.error(errorData.detail || "Conversion failed");
            } catch {
              toast.error("Conversion failed");
            }
          })
          .catch(() => {
            toast.error("Conversion failed");
          })
          .finally(() => {
            setLoading(false);
            setConversionProgress(0);
            setSuccess(false);
          });
      }
    });

    xhr.addEventListener("error", () => {
      toast.error("Conversion failed");
      setLoading(false);
      setConversionProgress(0);
      setSuccess(false);
    });

    xhr.addEventListener("abort", () => {
      toast.error("Conversion cancelled");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/convert/document`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  // Excel to PDF conversion function
  const convertExcelToPdf = async () => {
    if (!selectedFiles[0]) {
      toast.error("Please select an Excel file");
      return;
    }

    const file = selectedFiles[0];
    const fileName = file.name.toLowerCase();
    const isXlsx = fileName.endsWith('.xlsx');
    const isXls = fileName.endsWith('.xls');

    if (!isXlsx && !isXls) {
      toast.error("Please select an Excel file (.xlsx or .xls)");
      return;
    }

    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_format", "pdf");

    // Use XMLHttpRequest to track upload progress
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const originalFileName = file.name.replace(/\.(xlsx|xls)$/i, '');
        setConvertedBlob(blob);
        setConvertedFilename(`${originalFileName}.pdf`);
        setShowDownloadButton(true);
        toast.success("Excel converted to PDF successfully!");
        setLoading(false);
        setConversionProgress(100);
        setSelectedFiles([]);
      } else {
        const errorBlob = new Blob([xhr.response], { type: "application/json" });
        errorBlob.text()
          .then((errorText) => {
            try {
              const errorData = JSON.parse(errorText);
              toast.error(errorData.detail || "Conversion failed");
            } catch {
              toast.error("Excel to PDF conversion failed");
            }
          })
          .catch(() => {
            toast.error("Excel to PDF conversion failed");
          })
          .finally(() => {
            setLoading(false);
            setConversionProgress(0);
          });
      }
    });

    xhr.addEventListener("error", () => {
      toast.error("Conversion failed - please check your connection");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.addEventListener("abort", () => {
      toast.error("Conversion cancelled");
      setLoading(false);
      setConversionProgress(0);
    });

    // Select endpoint based on file type
    const endpoint = isXlsx ? '/xlsx-to-pdf' : '/xls-to-pdf';
    xhr.open("POST", `${API}${endpoint}`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  // PPTX to PDF conversion function
  const convertPptxToPdf = async () => {
    if (!selectedFiles[0]) {
      toast.error("Please select a PowerPoint file");
      return;
    }

    const file = selectedFiles[0];
    const fileName = file.name.toLowerCase();
    
    if (!fileName.endsWith('.pptx') && !fileName.endsWith('.ppt')) {
      toast.error("Please select a PowerPoint file (.pptx or .ppt)");
      return;
    }

    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_format", "pdf");

    // Use XMLHttpRequest to track upload progress
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const originalFileName = file.name.replace(/\.(pptx|ppt)$/i, '');
        setConvertedBlob(blob);
        setConvertedFilename(`${originalFileName}.pdf`);
        setShowDownloadButton(true);
        toast.success("PowerPoint converted to PDF successfully!");
        setLoading(false);
        setConversionProgress(100);
        setSelectedFiles([]);
      } else {
        const errorBlob = new Blob([xhr.response], { type: "application/json" });
        errorBlob.text()
          .then((errorText) => {
            try {
              const errorData = JSON.parse(errorText);
              toast.error(errorData.detail || "Conversion failed");
            } catch {
              toast.error("PowerPoint to PDF conversion failed");
            }
          })
          .catch(() => {
            toast.error("PowerPoint to PDF conversion failed");
          })
          .finally(() => {
            setLoading(false);
            setConversionProgress(0);
          });
      }
    });

    xhr.addEventListener("error", () => {
      toast.error("Conversion failed - please check your connection");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.addEventListener("abort", () => {
      toast.error("Conversion cancelled");
      setLoading(false);
      setConversionProgress(0);
    });

    // Select endpoint based on file type
    const endpoint = fileName.endsWith('.pptx') ? '/pptx-to-pdf' : '/ppt-to-pdf';
    xhr.open("POST", `${API}${endpoint}`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  const convertImage = async () => {
    if (!selectedFiles[0] || !targetFormat) {
      toast.error("Please select an image and target format");
      return;
    }

    const file = selectedFiles[0];
    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_format", targetFormat);

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const originalFileName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setConvertedBlob(blob);
        setConvertedFilename(`${originalFileName}_converted.${targetFormat}`);
        setShowDownloadButton(true);
        setSuccess(true);
        toast.success("Image converted successfully!");
        setLoading(false);
        setConversionProgress(100);
        setSelectedFiles([]);
        setTargetFormat("");
      } else {
        setSuccess(false);
        toast.error("Conversion failed");
        setLoading(false);
        setConversionProgress(0);
      }
    });

    xhr.addEventListener("error", () => {
      setSuccess(false);
      toast.error("Conversion failed");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/convert/image`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  // Individual image conversion handlers
  // Individual image conversion handlers with progress tracking
  const convertJpgToPng = async () => {
    if (!selectedFiles[0]) {
      toast.error("Please select a JPG image");
      return;
    }
    
    const file = selectedFiles[0];
    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_format", "png");

    // Use XHR for progress tracking
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const originalFileName = file.name.replace(/\.(jpg|jpeg)$/i, '');
        setConvertedBlob(blob);
        setConvertedFilename(`${originalFileName}.png`);
        setShowDownloadButton(true);
        setSuccess(true);
        toast.success("JPG to PNG converted successfully!");
        setLoading(false);
        setConversionProgress(100);
      } else {
        setSuccess(false);
        toast.error("Conversion failed");
        setLoading(false);
        setConversionProgress(0);
      }
    });

    xhr.addEventListener("error", () => {
      setSuccess(false);
      toast.error("Conversion failed");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/convert/image`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  const convertJpgToWebp = async () => {
    if (!selectedFiles[0]) {
      toast.error("Please select a JPG image");
      return;
    }
    
    const file = selectedFiles[0];
    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_format", "webp");

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const originalFileName = file.name.replace(/\.(jpg|jpeg)$/i, '');
        setConvertedBlob(blob);
        setConvertedFilename(`${originalFileName}.webp`);
        setShowDownloadButton(true);
        setSuccess(true);
        toast.success("JPG to WEBP converted successfully!");
        setLoading(false);
        setConversionProgress(100);
      } else {
        setSuccess(false);
        toast.error("Conversion failed");
        setLoading(false);
        setConversionProgress(0);
      }
    });

    xhr.addEventListener("error", () => {
      setSuccess(false);
      toast.error("Conversion failed");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/convert/image`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  const convertJpgToBmp = async () => {
    if (!selectedFiles[0]) {
      toast.error("Please select a JPG image");
      return;
    }
    
    const file = selectedFiles[0];
    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_format", "bmp");

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const originalFileName = file.name.replace(/\.(jpg|jpeg)$/i, '');
        setConvertedBlob(blob);
        setConvertedFilename(`${originalFileName}.bmp`);
        setShowDownloadButton(true);
        setSuccess(true);
        toast.success("JPG to BMP converted successfully!");
        setLoading(false);
        setConversionProgress(100);
      } else {
        setSuccess(false);
        toast.error("Conversion failed");
        setLoading(false);
        setConversionProgress(0);
      }
    });

    xhr.addEventListener("error", () => {
      setSuccess(false);
      toast.error("Conversion failed");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/convert/image`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  const convertPngToJpg = async () => {
    if (!selectedFiles[0]) {
      toast.error("Please select a PNG image");
      return;
    }
    
    const file = selectedFiles[0];
    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_format", "jpeg");

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const originalFileName = file.name.replace(/\.png$/i, '');
        setConvertedBlob(blob);
        setConvertedFilename(`${originalFileName}.jpg`);
        setShowDownloadButton(true);
        setSuccess(true);
        toast.success("PNG to JPG converted successfully!");
        setLoading(false);
        setConversionProgress(100);
      } else {
        setSuccess(false);
        toast.error("Conversion failed");
        setLoading(false);
        setConversionProgress(0);
      }
    });

    xhr.addEventListener("error", () => {
      setSuccess(false);
      toast.error("Conversion failed");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/convert/image`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  const convertPngToWebp = async () => {
    if (!selectedFiles[0]) {
      toast.error("Please select a PNG image");
      return;
    }
    
    const file = selectedFiles[0];
    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_format", "webp");

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const originalFileName = file.name.replace(/\.png$/i, '');
        setConvertedBlob(blob);
        setConvertedFilename(`${originalFileName}.webp`);
        setShowDownloadButton(true);
        setSuccess(true);
        toast.success("PNG to WEBP converted successfully!");
        setLoading(false);
        setConversionProgress(100);
      } else {
        setSuccess(false);
        toast.error("Conversion failed");
        setLoading(false);
        setConversionProgress(0);
      }
    });

    xhr.addEventListener("error", () => {
      setSuccess(false);
      toast.error("Conversion failed");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/convert/image`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  const convertPngToBmp = async () => {
    if (!selectedFiles[0]) {
      toast.error("Please select a PNG image");
      return;
    }
    
    const file = selectedFiles[0];
    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_format", "bmp");

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const originalFileName = file.name.replace(/\.png$/i, '');
        setConvertedBlob(blob);
        setConvertedFilename(`${originalFileName}.bmp`);
        setShowDownloadButton(true);
        setSuccess(true);
        toast.success("PNG to BMP converted successfully!");
        setLoading(false);
        setConversionProgress(100);
      } else {
        setSuccess(false);
        toast.error("Conversion failed");
        setLoading(false);
        setConversionProgress(0);
      }
    });

    xhr.addEventListener("error", () => {
      setSuccess(false);
      toast.error("Conversion failed");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/convert/image`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  const convertWebpToJpg = async () => {
    if (!selectedFiles[0]) {
      toast.error("Please select a WEBP image");
      return;
    }
    
    const file = selectedFiles[0];
    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_format", "jpeg");

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const originalFileName = file.name.replace(/\.webp$/i, '');
        setConvertedBlob(blob);
        setConvertedFilename(`${originalFileName}.jpg`);
        setShowDownloadButton(true);
        setSuccess(true);
        toast.success("WEBP to JPG converted successfully!");
        setLoading(false);
        setConversionProgress(100);
      } else {
        setSuccess(false);
        toast.error("Conversion failed");
        setLoading(false);
        setConversionProgress(0);
      }
    });

    xhr.addEventListener("error", () => {
      setSuccess(false);
      toast.error("Conversion failed");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/convert/image`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  const convertWebpToPng = async () => {
    if (!selectedFiles[0]) {
      toast.error("Please select a WEBP image");
      return;
    }
    
    const file = selectedFiles[0];
    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_format", "png");

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const originalFileName = file.name.replace(/\.webp$/i, '');
        setConvertedBlob(blob);
        setConvertedFilename(`${originalFileName}.png`);
        setShowDownloadButton(true);
        setSuccess(true);
        toast.success("WEBP to PNG converted successfully!");
        setLoading(false);
        setConversionProgress(100);
      } else {
        setSuccess(false);
        toast.error("Conversion failed");
        setLoading(false);
        setConversionProgress(0);
      }
    });

    xhr.addEventListener("error", () => {
      setSuccess(false);
      toast.error("Conversion failed");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/convert/image`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  const convertWebpToBmp = async () => {
    if (!selectedFiles[0]) {
      toast.error("Please select a WEBP image");
      return;
    }
    
    const file = selectedFiles[0];
    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_format", "bmp");

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const originalFileName = file.name.replace(/\.webp$/i, '');
        setConvertedBlob(blob);
        setConvertedFilename(`${originalFileName}.bmp`);
        setShowDownloadButton(true);
        setSuccess(true);
        toast.success("WEBP to BMP converted successfully!");
        setLoading(false);
        setConversionProgress(100);
      } else {
        setSuccess(false);
        toast.error("Conversion failed");
        setLoading(false);
        setConversionProgress(0);
      }
    });

    xhr.addEventListener("error", () => {
      setSuccess(false);
      toast.error("Conversion failed");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/convert/image`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  const convertBmpToJpg = async () => {
    if (!selectedFiles[0]) {
      toast.error("Please select a BMP image");
      return;
    }
    
    const file = selectedFiles[0];
    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_format", "jpeg");

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const originalFileName = file.name.replace(/\.bmp$/i, '');
        setConvertedBlob(blob);
        setConvertedFilename(`${originalFileName}.jpg`);
        setShowDownloadButton(true);
        setSuccess(true);
        toast.success("BMP to JPG converted successfully!");
        setLoading(false);
        setConversionProgress(100);
      } else {
        setSuccess(false);
        toast.error("Conversion failed");
        setLoading(false);
        setConversionProgress(0);
      }
    });

    xhr.addEventListener("error", () => {
      setSuccess(false);
      toast.error("Conversion failed");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/convert/image`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  const convertBmpToPng = async () => {
    if (!selectedFiles[0]) {
      toast.error("Please select a BMP image");
      return;
    }
    
    const file = selectedFiles[0];
    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_format", "png");

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const originalFileName = file.name.replace(/\.bmp$/i, '');
        setConvertedBlob(blob);
        setConvertedFilename(`${originalFileName}.png`);
        setShowDownloadButton(true);
        setSuccess(true);
        toast.success("BMP to PNG converted successfully!");
        setLoading(false);
        setConversionProgress(100);
      } else {
        setSuccess(false);
        toast.error("Conversion failed");
        setLoading(false);
        setConversionProgress(0);
      }
    });

    xhr.addEventListener("error", () => {
      setSuccess(false);
      toast.error("Conversion failed");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/convert/image`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  const convertBmpToWebp = async () => {
    if (!selectedFiles[0]) {
      toast.error("Please select a BMP image");
      return;
    }
    
    const file = selectedFiles[0];
    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_format", "webp");

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const originalFileName = file.name.replace(/\.bmp$/i, '');
        setConvertedBlob(blob);
        setConvertedFilename(`${originalFileName}.webp`);
        setShowDownloadButton(true);
        setSuccess(true);
        toast.success("BMP to WEBP converted successfully!");
        setLoading(false);
        setConversionProgress(100);
      } else {
        setSuccess(false);
        toast.error("Conversion failed");
        setLoading(false);
        setConversionProgress(0);
      }
    });

    xhr.addEventListener("error", () => {
      setSuccess(false);
      toast.error("Conversion failed");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/convert/image`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  const lockPdf = async () => {
    if (!selectedFiles[0] || !password) {
      toast.error("Please select a PDF and enter a password");
      return;
    }

    const file = selectedFiles[0];
    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const originalFileName = file.name.replace(/\.pdf$/i, '');
        setConvertedBlob(blob);
        setConvertedFilename(`${originalFileName}_locked.pdf`);
        setShowDownloadButton(true);
        setSuccess(true);
        toast.success("PDF locked successfully!");
        setLoading(false);
        setConversionProgress(100);
        setSelectedFiles([]);
        setPassword("");
      } else {
        setSuccess(false);
        // Parse error response from server
        try {
          const errorBlob = new Blob([xhr.response], { type: "application/json" });
          errorBlob.text().then((errorText) => {
            try {
              const errorData = JSON.parse(errorText);
              toast.error(errorData.detail || "Locking failed");
            } catch {
              toast.error("Locking failed");
            }
          });
        } catch {
          toast.error("Locking failed");
        }
        setLoading(false);
        setConversionProgress(0);
      }
    });

    xhr.addEventListener("error", () => {
      toast.error("Locking failed");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/pdf/lock`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  const unlockPdf = async () => {
    if (!selectedFiles[0] || !password) {
      toast.error("Please select a locked PDF and enter the password");
      return;
    }

    const file = selectedFiles[0];
    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const originalFileName = file.name.replace(/\.pdf$/i, '');
        setConvertedBlob(blob);
        setConvertedFilename(`${originalFileName}_unlocked.pdf`);
        setShowDownloadButton(true);
        setSuccess(true);
        toast.success("PDF unlocked successfully!");
        setLoading(false);
        setConversionProgress(100);
        setSelectedFiles([]);
        setPassword("");
      } else {
        setSuccess(false);
        // Parse error response from server
        try {
          const errorBlob = new Blob([xhr.response], { type: "application/json" });
          errorBlob.text().then((errorText) => {
            try {
              const errorData = JSON.parse(errorText);
              toast.error(errorData.detail || "Unlocking failed");
            } catch {
              toast.error("Unlocking failed");
            }
          });
        } catch {
          toast.error("Unlocking failed");
        }
        setLoading(false);
        setConversionProgress(0);
      }
    });

    xhr.addEventListener("error", () => {
      toast.error("Unlocking failed");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/pdf/unlock`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

const mergePdfs = async () => {
    const filesToMerge = getFilesToMerge();
    
    // Debug logging
    console.log('[MERGE DEBUG] selectedFiles count:', selectedFiles.length);
    console.log('[MERGE DEBUG] filesToMerge count:', filesToMerge.length);
    console.log('[MERGE DEBUG] filesToMerge:', filesToMerge.map(f => ({ name: f.name, size: f.size, _mergeId: f._mergeId })));
    
    if (filesToMerge.length < 2) {
      toast.error("Please select at least 2 PDF files to merge");
      return;
    }

    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");
    
    const formData = new FormData();
    filesToMerge.forEach(file => {
      formData.append("files", file);
    });

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        setConvertedBlob(blob);
        setConvertedFilename("merged.pdf");
        setShowDownloadButton(true);
        setSuccess(true);
        toast.success("PDFs merged successfully!");
        setLoading(false);
        setConversionProgress(100);
        // Don't clear selected files immediately - allow download first
        // setSelectedFiles([]);
} else {
        setSuccess(false);
        // Properly parse error from xhr response
        try {
          const errorBlob = new Blob([xhr.response], { type: "application/json" });
          errorBlob.text().then((errorText) => {
            try {
              const errorData = JSON.parse(errorText);
              // Handle different error response formats
              let errorMessage = "Merging failed";
              if (typeof errorData.detail === 'string') {
                errorMessage = String(errorData.detail);
              } else if (Array.isArray(errorData.detail)) {
                // Pydantic validation error array - join all error messages
                errorMessage = errorData.detail.map(e => {
                  if (typeof e.msg === 'string') return e.msg;
                  if (typeof e.msg === 'object') return JSON.stringify(e.msg);
                  if (typeof e === 'string') return e;
                  return JSON.stringify(e);
                }).filter(Boolean).join(', ');
              } else if (typeof errorData.detail === 'object' && errorData.detail !== null) {
                // Handle object with msg and loc properties
                if (errorData.detail.msg) {
                  errorMessage = typeof errorData.detail.msg === 'string' 
                    ? errorData.detail.msg 
                    : JSON.stringify(errorData.detail.msg);
                } else if (errorData.detail.loc) {
                  errorMessage = Array.isArray(errorData.detail.loc) 
                    ? errorData.detail.loc.join('.') 
                    : String(errorData.detail.loc);
                } else {
                  // Last resort: stringify the whole object
                  errorMessage = JSON.stringify(errorData.detail);
                }
              } else if (errorData.detail) {
                errorMessage = String(errorData.detail);
              }
              toast.error(errorMessage);
            } catch {
              toast.error("Merging failed - unexpected error format");
            }
          });
        } catch {
          toast.error("Merging failed - connection error");
        }
        setLoading(false);
        setConversionProgress(0);
      }
    });

    xhr.addEventListener("error", () => {
      toast.error("Merging failed - please check your connection");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/pdf/merge`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  const splitPdf = async () => {
    if (!selectedFiles[0] || !pageRanges) {
      toast.error("Please select a PDF and enter page ranges (e.g., 1-3,4-6)");
      return;
    }

    const file = selectedFiles[0];
    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("page_ranges", pageRanges);

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        setConvertedBlob(blob);
        setConvertedFilename("split_pdfs.zip");
        setShowDownloadButton(true);
        setSuccess(true);
        toast.success("PDF split successfully!");
        setLoading(false);
        setConversionProgress(100);
        setSelectedFiles([]);
        setPageRanges("");
      } else {
        setSuccess(false);
        toast.error(error.response?.data?.detail || "Splitting failed");
        setLoading(false);
        setConversionProgress(0);
      }
    });

    xhr.addEventListener("error", () => {
      toast.error("Splitting failed");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/pdf/split`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  const compressFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to compress");
      return;
    }

    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");
    
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append("files", file);
    });

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        setConvertedBlob(blob);
        setConvertedFilename("compressed.zip");
        setShowDownloadButton(true);
        setSuccess(true);
        toast.success("Files compressed successfully!");
        setLoading(false);
        setConversionProgress(100);
        setSelectedFiles([]);
      } else {
        setSuccess(false);
        // Properly parse error from xhr response
        try {
          const errorBlob = new Blob([xhr.response], { type: "application/json" });
          errorBlob.text().then((errorText) => {
            try {
              const errorData = JSON.parse(errorText);
              toast.error(errorData.detail || "Compression failed");
            } catch {
              toast.error("Compression failed");
            }
          });
        } catch {
          toast.error("Compression failed");
        }
        setLoading(false);
        setConversionProgress(0);
      }
    });

    xhr.addEventListener("error", () => {
      setSuccess(false);
      toast.error("Compression failed");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/zip/compress`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  const extractZip = async () => {
    if (!extractSelectedFile) {
      toast.error("Please select a ZIP file");
      return;
    }

    setLoading(true);
    setConversionProgress(0);
    
    const formData = new FormData();
    formData.append("file", extractSelectedFile);

    // Use XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          setExtractedFiles(response.files);
          setExtractionId(response.extraction_id);
          setShowExtractedFiles(true);
          toast.success(`ZIP extracted successfully! Found ${response.total_files} files.`);
          setLoading(false);
          setConversionProgress(100);
          setExtractSelectedFile(null);
        } catch (e) {
          toast.error("Extraction failed");
          setLoading(false);
          setConversionProgress(0);
        }
      } else {
        toast.error("Extraction failed");
        setLoading(false);
        setConversionProgress(0);
      }
    });

    xhr.addEventListener("error", () => {
      toast.error("Extraction failed");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/zip/extract`);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send(formData);
  };

  const extractTextOcr = async () => {
    if (!selectedFiles[0]) {
      toast.error("Please select an image file");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFiles[0]);
    formData.append("language", ocrLanguage);

    try {
      const response = await axios.post(`${API}/ocr/extract`, formData);
      setOcrText(response.data.text);
      setShowOcrDialog(true);
      // Get full language name from the available languages list
      const selectedLang = ocrLanguages.find(l => l.code === ocrLanguage);
      const langName = selectedLang?.name || ocrLanguage.toUpperCase();
      toast.success(`Text extracted successfully! (Language: ${langName})`);
      setSelectedFiles([]);
    } catch (error) {
      toast.error(error.response?.data?.detail || "OCR extraction failed");
    } finally {
      setLoading(false);
    }
  };

  const searchInPdf = async () => {
    if (!selectedFiles[0] || !searchTerm.trim()) {
      toast.error("Please select a PDF file and enter search term");
      return;
    }

    setLoading(true);
    setConversionProgress(0);
    setSearchResults(null);

    const formData = new FormData();
    formData.append("file", selectedFiles[0]);
    formData.append("search_term", searchTerm.trim());

    // Use XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          setSearchResults(response);
          toast.success(`Found ${response.total_matches} matches for "${searchTerm}"`);
          setLoading(false);
          setConversionProgress(100);
        } catch (error) {
          toast.error("Failed to parse search results");
          setLoading(false);
          setConversionProgress(0);
        }
      } else {
        const errorBlob = new Blob([xhr.response], { type: "application/json" });
        errorBlob.text()
          .then((errorText) => {
            try {
              const errorData = JSON.parse(errorText);
              toast.error(errorData.detail || "Search failed");
            } catch {
              toast.error("Search failed");
            }
          })
          .catch(() => {
            toast.error("Search failed");
          })
          .finally(() => {
            setLoading(false);
            setConversionProgress(0);
          });
      }
    });

    xhr.addEventListener("error", () => {
      toast.error("Search failed - please check your connection");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.addEventListener("abort", () => {
      toast.error("Search cancelled");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/search/pdf`);
    xhr.send(formData);
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/history`);
      setHistory(response.data);
      setShowHistory(true);
    } catch (error) {
      toast.error("Failed to fetch history");
    }
  };

  const copyToClipboard = async () => {
      if (!ocrText) return;

      // Secure context ONLY (HTTPS or localhost)
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(ocrText);
          toast.success("Text copied to clipboard!");
          return;
        } catch (err) {
          console.warn("Secure clipboard failed", err);
        }
      }

      // ❌ Insecure context (HTTP + IP)
      toast.error(
        "Auto copy is blocked by browser security. Please select and copy manually."
      );
    };

  // ============== Image to PDF Handler Functions ==============

  // Handle image file selection
  const handleImageFileSelect = (e) => {
    const files = Array.from(e.target.files);
    addImages(files);
    // Reset file input
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = '';
    }
  };

  // Handle image drop
  const handleImageDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      addImages(imageFiles);
    } else {
      toast.error("Please drop image files");
    }
  };

  // Handle drag over
  const handleImageDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drag start for reordering
  const handleImageDragStart = (e, index) => {
    setDraggedImageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle image reorder
  const handleImageReorder = (e, targetIndex) => {
    e.preventDefault();
    if (draggedImageIndex === null || draggedImageIndex === targetIndex) return;

    const newImages = [...selectedImages];
    const draggedImage = newImages[draggedImageIndex];
    newImages.splice(draggedImageIndex, 1);
    newImages.splice(targetIndex, 0, draggedImage);
    setSelectedImages(newImages);
    setDraggedImageIndex(null);
  };

  // Add images to selected list
  const addImages = (files) => {
    const newImages = [];
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newImages.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          name: file.name,
          preview,
          size: file.size,
          type: file.type
        });
      }
    });

    if (selectedImages.length + newImages.length > 50) {
      toast.error("Maximum 50 images allowed");
      return;
    }

    setSelectedImages(prev => [...prev, ...newImages]);
    toast.success(`${newImages.length} image(s) added`);
  };

  // Remove single image
  const removeImage = (index) => {
    const image = selectedImages[index];
    if (image.preview) {
      URL.revokeObjectURL(image.preview);
    }
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
  };

  // Clear all images
  const clearAllImages = () => {
    selectedImages.forEach(img => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setSelectedImages([]);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");
  };

  // Convert images to PDF
  const convertImagesToPdf = async () => {
    if (selectedImages.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");

    const formData = new FormData();
    selectedImages.forEach(img => {
      formData.append('files', img.file);
    });
    formData.append('page_size', pdfPageSize);
    formData.append('quality', pdfQuality);

    // Use XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const firstImageName = selectedImages[0].name.split('.')[0];
        
        if (pdfOutputMode === 'individual') {
          setConvertedBlob(blob);
          setConvertedFilename("individual_pdfs.zip");
          setShowDownloadButton(true);
          toast.success(`Created ${selectedImages.length} individual PDF files!`);
        } else {
          setConvertedBlob(blob);
          setConvertedFilename(`${firstImageName}_and_others.pdf`);
          setShowDownloadButton(true);
          toast.success("PDF created successfully!");
        }
        
        setLoading(false);
        setConversionProgress(100);
      } else {
        const errorBlob = new Blob([xhr.response], { type: "application/json" });
        errorBlob.text()
          .then((errorText) => {
            try {
              const errorData = JSON.parse(errorText);
              toast.error(errorData.detail || "Conversion failed");
            } catch {
              toast.error("Image to PDF conversion failed");
            }
          })
          .catch(() => {
            toast.error("Image to PDF conversion failed");
          })
          .finally(() => {
            setLoading(false);
            setConversionProgress(0);
          });
      }
    });

    xhr.addEventListener("error", () => {
      toast.error("Conversion failed - please check your connection");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.addEventListener("abort", () => {
      toast.error("Conversion cancelled");
      setLoading(false);
      setConversionProgress(0);
    });

    // Choose endpoint based on output mode
    const endpoint = pdfOutputMode === 'individual' 
      ? `${API}/images-to-pdf-individual`
      : `${API}/images-to-pdf`;
    
    xhr.open("POST", endpoint);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  // ============== Image Resize Handler Functions ==============

  // Handle resize image file selection
  const handleResizeFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setResizeSelectedFile(file);
      
      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalImageDimensions({ width: img.width, height: img.height });
        // Set default resize dimensions to original
        setResizeWidth(img.width);
        setResizeHeight(img.height);
        // Create preview
        setResizePreview(img.src);
      };
      img.src = URL.createObjectURL(file);
    } else {
      toast.error("Please select a valid image file");
    }
    // Reset file input
    e.target.value = '';
  };

  // Handle resize image drop
  const handleResizeDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setResizeSelectedFile(file);
      
      const img = new Image();
      img.onload = () => {
        setOriginalImageDimensions({ width: img.width, height: img.height });
        setResizeWidth(img.width);
        setResizeHeight(img.height);
        setResizePreview(img.src);
      };
      img.src = URL.createObjectURL(file);
    } else {
      toast.error("Please drop a valid image file");
    }
  };

  // Handle drag over for resize dropzone
  const handleResizeDragOver = (e) => {
    e.preventDefault();
  };

  // Handle width change with aspect ratio calculation
  const handleResizeWidthChange = (e) => {
    const newWidth = parseInt(e.target.value) || 0;
    setResizeWidth(newWidth);
    
    if (maintainAspectRatio && originalImageDimensions) {
      const aspectRatio = originalImageDimensions.height / originalImageDimensions.width;
      setResizeHeight(Math.round(newWidth * aspectRatio));
    }
  };

  // Handle height change with aspect ratio calculation
  const handleResizeHeightChange = (e) => {
    const newHeight = parseInt(e.target.value) || 0;
    setResizeHeight(newHeight);
    
    if (maintainAspectRatio && originalImageDimensions) {
      const aspectRatio = originalImageDimensions.width / originalImageDimensions.height;
      setResizeWidth(Math.round(newHeight * aspectRatio));
    }
  };

  // Toggle aspect ratio maintenance
  const handleAspectRatioToggle = () => {
    const newValue = !maintainAspectRatio;
    setMaintainAspectRatio(newValue);
    
    // Recalculate dimensions if enabling aspect ratio
    if (newValue && originalImageDimensions) {
      const aspectRatio = originalImageDimensions.height / originalImageDimensions.width;
      setResizeHeight(Math.round(resizeWidth * aspectRatio));
    }
  };

  // Clear resize image selection
  const clearResizeImage = () => {
    if (resizePreview) {
      URL.revokeObjectURL(resizePreview);
    }
    setResizeSelectedFile(null);
    setResizePreview(null);
    setOriginalImageDimensions(null);
    setResizeWidth(800);
    setResizeHeight(600);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");
  };

  // Resize image handler
  const resizeImage = async () => {
    if (!resizeSelectedFile) {
      toast.error("Please select an image to resize");
      return;
    }

    if (resizeWidth <= 0 || resizeHeight <= 0) {
      toast.error("Please enter valid dimensions");
      return;
    }

    setLoading(true);
    setConversionProgress(0);
    setShowDownloadButton(false);
    setConvertedBlob(null);
    setConvertedFilename("");

    const formData = new FormData();
    formData.append("file", resizeSelectedFile);
    formData.append("target_width", resizeWidth);
    formData.append("target_height", resizeHeight);
    formData.append("maintain_aspect_ratio", maintainAspectRatio);
    formData.append("quality", resizeQuality); // Now using string value
    formData.append("output_format", resizeOutputFormat);

    // Use XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = 50 + Math.round((event.loaded / event.total) * 50);
        setConversionProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const originalFileName = resizeSelectedFile.name.split('.')[0];
        const ext = resizeOutputFormat === 'jpeg' ? 'jpg' : resizeOutputFormat;
        
        setConvertedBlob(blob);
        setConvertedFilename(`${originalFileName}_${resizeWidth}x${resizeHeight}.${ext}`);
        setShowDownloadButton(true);
        setSuccess(true);
        toast.success("Image resized successfully!");
        setLoading(false);
        setConversionProgress(100);
      } else {
        const errorBlob = new Blob([xhr.response], { type: "application/json" });
        errorBlob.text()
          .then((errorText) => {
            try {
              const errorData = JSON.parse(errorText);
              toast.error(errorData.detail || "Resize failed");
            } catch {
              toast.error("Image resize failed");
            }
          })
          .catch(() => {
            toast.error("Image resize failed");
          })
          .finally(() => {
            setLoading(false);
            setConversionProgress(0);
          });
      }
    });

    xhr.addEventListener("error", () => {
      toast.error("Resize failed - please check your connection");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.addEventListener("abort", () => {
      toast.error("Resize cancelled");
      setLoading(false);
      setConversionProgress(0);
    });

    xhr.open("POST", `${API}/image/resize`);
    xhr.responseType = "blob";
    xhr.send(formData);
  };

  // Reset image-specific state when switching away from imageToPdf tab
  useEffect(() => {
    if (activeTab !== 'imageToPdf') {
      // Keep the images in state so they're available if user returns
    }
  }, [activeTab]);



    // const copyToClipboard = async () => {
    //   try {
    //     if (navigator.clipboard && navigator.clipboard.writeText) {
    //       await navigator.clipboard.writeText(ocrText);
    //     } else {
    //       // Fallback for insecure context
    //       const textarea = document.createElement("textarea");
    //       textarea.value = ocrText;
    //       textarea.style.position = "fixed";
    //       textarea.style.left = "-9999px";
    //       document.body.appendChild(textarea);
    //       textarea.focus();
    //       textarea.select();
    //       document.execCommand("copy");
    //       document.body.removeChild(textarea);
    //     }

    //     toast.success("Text copied to clipboard!");
    //   } catch (err) {
    //     console.error(err);
    //     toast.error("Failed to copy text");
    //   }
    // };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
{/*---------------------------------START OF NAVBAR------------------------------------------------------------------- */}
   <header className="sticky top-0 z-50 border-b bg-white/70 md:backdrop-blur-md">
      <div className="container mx-auto px-4 py-4 relative">

        <MobileNavbar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          mobileRightOpen={mobileRightOpen}
          setMobileRightOpen={setMobileRightOpen}
          fetchHistory={fetchHistory}
          pdfToDocx={convertDocument}
          docxToPdf={openDocxToPdf}
          pdfToText={openPdfToText}
          imageToPdf={openImageToPdf}
          lockPdf={openLockPDF}
          unlockPdf={openUnlockPDF}
          mergePdf={openMergePdf}
          splitPdf={openSplitPdf}
          ocrImage={openOcrImage}
          convertImage={openConvertImage}
          resizeImage={openResizeImage}
          zip={openZipTab}
          unZip={openUnzipTab}
          searchPdf={openSearchPdf}
          textToPdf={openTextToPdf}
          textToDocx={openTextToDocx}
          pdfToExcel={openPdfToExcel}
          excelToPdf={openExcelToPdf}
          pdfToPpt={openPdfToPpt}
          pptxToPdf={openPptxToPdf}
          docToDocx={openPdfToDocx}
          docxToDoc={openPdfToDocx}
          detectLanguage={openDetectLanguage}
          watermarkPdf={openWatermarkPdf}
          jpgToPng={openJpgToPng}
          jpgToWebp={openJpgToWebp}
          jpgToBmp={openJpgToBmp}
          pngToJpg={openPngToJpg}
          pngToWebp={openPngToWebp}
          pngToBmp={openPngToBmp}
          webpToJpg={openWebpToJpg}
          webpToPng={openWebpToPng}
          webpToBmp={openWebpToBmp}
          bmpToJpg={openBmpToJpg}
          bmpToPng={openBmpToPng}
          bmpToWebp={openBmpToWebp}
        />

        <DesktopNavbar
          open={open}
          setOpen={setOpen}
          searchPdf={openSearchPdf}
          pdfToDocx={convertDocument}
          docxToPdf={openDocxToPdf}
          pdfToText={openPdfToText}
          textToPdf={openTextToPdf}
          textToDocx={openTextToDocx}
          pdfToExcel={openPdfToExcel}
          excelToPdf={openExcelToPdf}
          pdfToPptx={openPdfToPpt}
          pptxToPdf={openPptxToPdf}
          imageToPdf={openImageToPdf}
          watermarkPdf={openWatermarkPdf}
          fetchHistory={fetchHistory}
          lockPdf={openLockPDF}
          unlockPdf={openUnlockPDF}
          mergePdf={openMergePdf}
          splitPdf={openSplitPdf}
          ocrImage={openOcrImage}
          convertImage={openConvertImage}
          resizeImage={openResizeImage}
          detectLanguage={openDetectLanguage}
          zip={openZipTab}
          unZip={openUnzipTab}
          // Individual image conversions
          jpgToPng={openJpgToPng}
          jpgToWebp={openJpgToWebp}
          jpgToBmp={openJpgToBmp}
          pngToJpg={openPngToJpg}
          pngToWebp={openPngToWebp}
          pngToBmp={openPngToBmp}
          webpToJpg={openWebpToJpg}
          webpToPng={openWebpToPng}
          webpToBmp={openWebpToBmp}
          bmpToJpg={openBmpToJpg}
          bmpToPng={openBmpToPng}
          bmpToWebp={openBmpToWebp}
        />

      </div>
    </header>
{/* -------------------------------NAVBAR END------------------------------------------------------------------------- */}
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            All-in-One File Converter
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert documents, images, PDFs, compress files, and extract text with OCR - all in one place
          </p>
        </div>

        <Card className="max-w-4xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Operation Header - Only show when a tab is selected */}
              {activeTab && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {operationNames[activeTab] || activeTab}
                  </h3>
                </div>
              )}

              {/* TabsList - Hidden, but keeps the Tabs component functional */}
              <TabsList className="hidden"></TabsList>

              {/* TabsContent sections */}
              {/* Document Conversion - PDF to DOCX */}
              <TabsContent value="pdfToDocx" className="mt-6 space-y-6">
                <div
                  data-testid="pdfToDocx-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your PDF here or click to browse</p>
                  <p className="text-sm text-gray-500">Supports: PDF</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-file-info" className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                    <p className="text-xs text-gray-500">Type: PDF</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Single Button with Progress and Download */}
                  <ProgressButton
                    variant="default"
                    loading={loading}
                    success={success && showDownloadButton && convertedBlob}
                    progress={conversionProgress}
                    onClick={() => convertDocument()}
                    disabled={loading || (!success && selectedFiles.length === 0)}
                    loadingText="Converting..."
                    successMessage="Complete!"
                    downloadUrl={success && convertedBlob ? window.URL.createObjectURL(convertedBlob) : null}
                    downloadFilename={convertedFilename}
                    onDownloadComplete={resetConversionState}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {success && showDownloadButton && convertedBlob ? 'Download DOCX' : 'PDF to DOCX'}
                  </ProgressButton>
                </div>
              </TabsContent>

              {/* DOCX to PDF */}
              <TabsContent value="docxToPdf" className="mt-6 space-y-6">
                <div
                  data-testid="docxToPdf-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your DOCX here or click to browse</p>
                  <p className="text-sm text-gray-500">Supports: DOCX</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".docx"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-docx-file" className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Show Download Button after successful conversion */}
                  {showDownloadButton && convertedBlob && (
                    <ProgressButton
                      variant="success"
                      loading={false}
                      success={true}
                      downloadUrl={window.URL.createObjectURL(convertedBlob)}
                      downloadFilename={convertedFilename}
                      onDownloadComplete={resetConversionState}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </ProgressButton>
                  )}

                  {/* Convert Button with Progress */}
                  {!showDownloadButton && (
                    <ProgressButton
                      variant="default"
                      loading={loading}
                      progress={conversionProgress}
                      onClick={() => convertDocument('pdf')}
                      disabled={loading || selectedFiles.length === 0}
                      loadingText="Converting..."
                      successMessage="Complete!"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Convert to PDF
                    </ProgressButton>
                  )}
                </div>
              </TabsContent>

              {/* PDF to Text */}
              <TabsContent value="pdfToText" className="mt-6 space-y-6">
                <div
                  data-testid="pdfToText-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your PDF here to extract text</p>
                  <p className="text-sm text-gray-500">Supports: PDF</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-pdf-file" className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Show Download Button after successful conversion */}
                  {showDownloadButton && convertedBlob && (
                    <ProgressButton
                      variant="success"
                      loading={false}
                      success={true}
                      downloadUrl={window.URL.createObjectURL(convertedBlob)}
                      downloadFilename={convertedFilename}
                      onDownloadComplete={resetConversionState}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Text
                    </ProgressButton>
                  )}

                  {/* Convert Button with Progress */}
                  {!showDownloadButton && (
                    <ProgressButton
                      variant="default"
                      loading={loading}
                      progress={conversionProgress}
                      onClick={() => convertDocument('txt')}
                      disabled={loading || selectedFiles.length === 0}
                      loadingText="Extracting..."
                      successMessage="Complete!"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Extract Text
                    </ProgressButton>
                  )}
                </div>
              </TabsContent>

              {/*Text To Pdf*/}
              <TabsContent value="textToPdf" className="mt-6 space-y-6">
                <div
                  data-testid="TextToPdf-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your text  here to extract text PDF</p>
                  <p className="text-sm text-gray-500">Supports: text</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".txt"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-pdf-file" className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Show Download Button after successful conversion */}
                  {showDownloadButton && convertedBlob && (
                    <ProgressButton
                      variant="success"
                      loading={false}
                      success={true}
                      downloadUrl={window.URL.createObjectURL(convertedBlob)}
                      downloadFilename={convertedFilename}
                      onDownloadComplete={resetConversionState}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </ProgressButton>
                  )}

                  {/* Convert Button with Progress */}
                  {!showDownloadButton && (
                    <ProgressButton
                      variant="default"
                      loading={loading}
                      progress={conversionProgress}
                      onClick={() => convertDocument('pdf')}
                      disabled={loading || selectedFiles.length === 0}
                      loadingText="Converting..."
                      successMessage="Complete!"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Convert to PDF
                    </ProgressButton>
                  )}
                </div>
              </TabsContent>


              {/* PDF to Excel */}
              <TabsContent value="pdfToExcel" className="mt-6 space-y-6">
                <div
                  data-testid="pdfToExcel-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-green-500 transition-colors cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your PDF here to convert to Excel</p>
                  <p className="text-sm text-gray-500">Supports: PDF</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-pdf-excel-file" className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Show Download Button after successful conversion */}
                  {showDownloadButton && convertedBlob && (
                    <ProgressButton
                      variant="success"
                      loading={false}
                      success={true}
                      downloadUrl={window.URL.createObjectURL(convertedBlob)}
                      downloadFilename={convertedFilename}
                      onDownloadComplete={resetConversionState}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Excel
                    </ProgressButton>
                  )}

                  {/* Convert Button with Progress */}
                  {!showDownloadButton && (
                    <ProgressButton
                      variant="teal"
                      loading={loading}
                      progress={conversionProgress}
                      onClick={() => convertDocument('xlsx')}
                      disabled={loading || selectedFiles.length === 0}
                      loadingText="Converting..."
                      successMessage="Complete!"
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Convert to Excel
                    </ProgressButton>
                  )}
                </div>
              </TabsContent>

              {/* PDF to PowerPoint */}
              <TabsContent value="pdfToPpt" className="mt-6 space-y-6">
                <div
                  data-testid="pdfToPpt-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-orange-500 transition-colors cursor-pointer bg-gradient-to-br from-orange-50 to-amber-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your PDF here to convert to PowerPoint</p>
                  <p className="text-sm text-gray-500">Supports: PDF</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-pdf-ppt-file" className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Show Download Button after successful conversion */}
                  {showDownloadButton && convertedBlob && (
                    <ProgressButton
                      variant="success"
                      loading={false}
                      success={true}
                      downloadUrl={window.URL.createObjectURL(convertedBlob)}
                      downloadFilename={convertedFilename}
                      onDownloadComplete={resetConversionState}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PowerPoint
                    </ProgressButton>
                  )}

                  {/* Convert Button with Progress */}
                  {!showDownloadButton && (
                    <ProgressButton
                      variant="amber"
                      loading={loading}
                      progress={conversionProgress}
                      onClick={() => convertDocument('pptx')}
                      disabled={loading || selectedFiles.length === 0}
                      loadingText="Converting..."
                      successMessage="Complete!"
                    >
                      <Presentation className="w-4 h-4 mr-2" />
                      Convert to PowerPoint
                    </ProgressButton>
                  )}
                </div>
              </TabsContent>

              {/* Excel to PDF */}
              <TabsContent value="excelToPdf" className="mt-6 space-y-6">
                <div
                  data-testid="excelToPdf-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-green-500 transition-colors cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium mb-2">Drop your Excel file here to convert to PDF</p>
                  <p className="text-sm text-gray-500">Supports: .xlsx, .xls</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".xlsx,.xls"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-excel-file" className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                    <p className="text-xs text-gray-500">
                      Size: {(selectedFiles[0].size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Show Download Button after successful conversion */}
                  {showDownloadButton && convertedBlob && (
                    <ProgressButton
                      variant="success"
                      loading={false}
                      success={true}
                      downloadUrl={window.URL.createObjectURL(convertedBlob)}
                      downloadFilename={convertedFilename}
                      onDownloadComplete={resetConversionState}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </ProgressButton>
                  )}

                  {/* Convert Button with Progress */}
                  {!showDownloadButton && (
                    <ProgressButton
                      variant="teal"
                      loading={loading}
                      progress={conversionProgress}
                      onClick={convertExcelToPdf}
                      disabled={loading || selectedFiles.length === 0}
                      loadingText="Converting..."
                      successMessage="Complete!"
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Convert Excel to PDF
                    </ProgressButton>
                  )}
                </div>
              </TabsContent>

              {/* PowerPoint to PDF */}
              <TabsContent value="pptxToPdf" className="mt-6 space-y-6">
                <div
                  data-testid="pptxToPdf-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-orange-500 transition-colors cursor-pointer bg-gradient-to-br from-orange-50 to-amber-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Presentation className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                  <p className="text-lg font-medium mb-2">Drop your PowerPoint here to convert to PDF</p>
                  <p className="text-sm text-gray-500">Supports: .pptx, .ppt</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pptx,.ppt"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-pptx-file" className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                    <p className="text-xs text-gray-500">
                      Size: {(selectedFiles[0].size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Show Download Button after successful conversion */}
                  {showDownloadButton && convertedBlob && (
                    <ProgressButton
                      variant="success"
                      loading={false}
                      success={true}
                      downloadUrl={window.URL.createObjectURL(convertedBlob)}
                      downloadFilename={convertedFilename}
                      onDownloadComplete={resetConversionState}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </ProgressButton>
                  )}

                  {/* Convert Button with Progress */}
                  {!showDownloadButton && (
                    <ProgressButton
                      variant="amber"
                      loading={loading}
                      progress={conversionProgress}
                      onClick={convertPptxToPdf}
                      disabled={loading || selectedFiles.length === 0}
                      loadingText="Converting..."
                      successMessage="Complete!"
                    >
                      <Presentation className="w-4 h-4 mr-2" />
                      Convert PowerPoint to PDF
                    </ProgressButton>
                  )}
                </div>
              </TabsContent>

              {/* Image to PDF */}
              <TabsContent value="imageToPdf" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Image to PDF Converter
                    </CardTitle>
                    <CardDescription>
                      Convert single or multiple images to PDF. Supports JPG, PNG, WEBP, BMP, TIFF, GIF, and more.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Dropzone */}
                    <div
                      data-testid="imageToPdf-dropzone"
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50"
                      onDrop={handleImageDrop}
                      onDragOver={handleImageDragOver}
                      onClick={() => imageFileInputRef.current?.click()}
                    >
                      <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm font-medium mb-1">Drop images here or click to browse</p>
                      <p className="text-xs text-gray-500">Select one or multiple images</p>
                      <input
                        ref={imageFileInputRef}
                        type="file"
                        onChange={handleImageFileSelect}
                        className="hidden"
                        accept="image/*"
                        multiple
                      />
                    </div>

                    {/* Image Preview Grid */}
                    {selectedImages.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">
                            Selected Images ({selectedImages.length})
                          </Label>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearAllImages}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Clear All
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                          {selectedImages.map((img, index) => (
                            <div
                              key={img.id || index}
                              className="relative group aspect-square bg-white rounded-lg overflow-hidden border shadow-sm"
                              draggable
                              onDragStart={(e) => handleImageDragStart(e, index)}
                              onDragOver={handleImageDragOver}
                              onDrop={(e) => handleImageReorder(e, index)}
                            >
                              <img
                                src={img.preview}
                                alt={img.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  className="w-8 h-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(index);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                                {img.name}
                              </div>
                              <div className="absolute top-1 left-1 bg-purple-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PDF Settings */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Page Size */}
                      <div>
                        <Label className="text-sm font-medium">Page Size</Label>
                        <Select value={pdfPageSize} onValueChange={setPdfPageSize}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Auto" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto (Image Size)</SelectItem>
                            <SelectItem value="letter">Letter (8.5" x 11")</SelectItem>
                            <SelectItem value="a4">A4</SelectItem>
                            <SelectItem value="legal">Legal (8.5" x 14")</SelectItem>
                            <SelectItem value="tabloid">Tabloid (11" x 17")</SelectItem>
                            <SelectItem value="a3">A3</SelectItem>
                            <SelectItem value="a5">A5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quality */}
                      <div>
                        <Label className="text-sm font-medium">Quality</Label>
                        <Select value={pdfQuality} onValueChange={setPdfQuality}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="High" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low (72 DPI)</SelectItem>
                            <SelectItem value="medium">Medium (150 DPI)</SelectItem>
                            <SelectItem value="high">High (300 DPI)</SelectItem>
                            <SelectItem value="maximum">Maximum (600 DPI)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Output Mode */}
                      <div>
                        <Label className="text-sm font-medium">Output Mode</Label>
                        <Select value={pdfOutputMode} onValueChange={setPdfOutputMode}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Single PDF" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single PDF (All in one)</SelectItem>
                            <SelectItem value="individual">Individual PDFs (ZIP)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Convert Button */}
                    <ProgressButton
                      variant="purple"
                      loading={loading}
                      progress={conversionProgress}
                      onClick={convertImagesToPdf}
                      disabled={loading || selectedImages.length === 0}
                      loadingText="Converting..."
                      successMessage="Complete!"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {pdfOutputMode === 'single' 
                        ? `Convert ${selectedImages.length} Image${selectedImages.length !== 1 ? 's' : ''} to PDF`
                        : `Convert ${selectedImages.length} Image${selectedImages.length !== 1 ? 's' : ''} to Individual PDFs`
                      }
                    </ProgressButton>

                    {/* Download Button */}
                    {showDownloadButton && convertedBlob && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700 mb-2">
                          {pdfOutputMode === 'individual' 
                            ? `Created ${selectedImages.length} PDF files!`
                            : "PDF created successfully!"
                          }
                        </p>
                        <ProgressButton
                          variant="success"
                          loading={false}
                          success={true}
                          downloadUrl={window.URL.createObjectURL(convertedBlob)}
                          downloadFilename={convertedFilename}
                          onDownloadComplete={resetConversionState}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {pdfOutputMode === 'individual' ? "Download ZIP" : "Download PDF"}
                        </ProgressButton>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Watermark PDF */}
              <TabsContent value="watermark" className="mt-6 space-y-6">
                <WatermarkPDF />
              </TabsContent>

              {/* Convert Images */}
              <TabsContent value="convertImages" className="mt-6 space-y-6">
                <div
                  data-testid="convertImages-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-purple-500 transition-colors cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your image here or click to browse</p>
                  <p className="text-sm text-gray-500">Supports: JPG, PNG, WEBP, BMP</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-image-info" className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label>Convert to</Label>
                    <Popover open={openImageDropdown} onOpenChange={setOpenImageDropdown}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openImageDropdown}
                        className="w-full justify-between"
                        data-testid="image-format-select"
                      >
                        <span className="truncate">
                          {targetFormat
                            ? getAllImageFormats().find(
                                (f) => f.value === targetFormat
                              )?.label
                            : "Select Image Format"}
                        </span>

                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>


                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search formats..." />
                          <CommandList>
                            <CommandEmpty>No format found.</CommandEmpty>
                            <CommandGroup>
                              {getAllImageFormats().map((format) => (
                                <CommandItem
                                  key={format.value}
                                  value={format.label}
                                  onSelect={() => {
                                    setTargetFormat(format.value === targetFormat ? "" : format.value);
                                    setOpenImageDropdown(false);
                                  }}
                                >
                                  {getImageFormatIcon(format.value)}
                                  <span className="flex-1">{format.label}</span>
                                  <Check
                                    className={cn(
                                      "ml-2 h-4 w-4",
                                      targetFormat === format.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <ProgressButton
                    variant="purple"
                    loading={loading}
                    success={success && showDownloadButton && convertedBlob}
                    progress={conversionProgress}
                    onClick={convertImage}
                    disabled={loading || (!success && (selectedFiles.length === 0 || !targetFormat))}
                    loadingText="Converting..."
                    successMessage="Complete!"
                    downloadUrl={success && convertedBlob ? window.URL.createObjectURL(convertedBlob) : null}
                    downloadFilename={convertedFilename}
                    onDownloadComplete={resetConversionState}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {success && showDownloadButton && convertedBlob ? 'Download Converted Image' : 'Convert Image'}
                  </ProgressButton>
                </div>
              </TabsContent>

              {/* Resize Image */}
              <TabsContent value="resizeImage" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-6 w-6" />
                      Resize Image
                    </CardTitle>
                    <CardDescription>
                      Upload an image and resize it to your desired dimensions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {/* File Upload */}
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                          isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleResizeDrop}
                        onClick={() => document.getElementById("resize-image-upload").click()}
                      >
                        <input
                          type="file"
                          id="resize-image-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={handleResizeFileSelect}
                        />
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium">Drop image here or click to upload</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Supports JPG, PNG, WEBP, BMP (Max 50MB)
                        </p>
                      </div>

                      {/* Selected Image Preview */}
                      {resizeSelectedFile && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                          {/* Original Image */}
                          <div>
                            <p className="text-sm font-medium mb-2">Original: {resizeSelectedFile.name}</p>
                            {originalImageDimensions && (
                              <p className="text-xs text-gray-500 mb-2">
                                {originalImageDimensions.width} x {originalImageDimensions.height} pixels
                              </p>
                            )}
                            {resizePreview && (
                              <img
                                src={resizePreview}
                                alt="Original"
                                className="w-full h-48 object-contain rounded-lg bg-white"
                              />
                            )}
                          </div>

                          {/* Resize Settings */}
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label>Width (px)</Label>
                                <Input
                                  type="number"
                                  value={resizeWidth}
                                  onChange={handleResizeWidthChange}
                                  min={1}
                                />
                              </div>
                              <div>
                                <Label>Height (px)</Label>
                                <Input
                                  type="number"
                                  value={resizeHeight}
                                  onChange={handleResizeHeightChange}
                                  min={1}
                                  disabled={maintainAspectRatio}
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="maintain-aspect-ratio"
                                checked={maintainAspectRatio}
                                onChange={handleAspectRatioToggle}
                                className="rounded"
                              />
                              <Label htmlFor="maintain-aspect-ratio" className="cursor-pointer">
                                Maintain aspect ratio
                              </Label>
                            </div>

                            <div>
                              <Label>Output Format</Label>
                              <Select value={resizeOutputFormat} onValueChange={setResizeOutputFormat}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="jpeg">JPEG</SelectItem>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="webp">WebP</SelectItem>
                                  <SelectItem value="bmp">BMP</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Quality Selector */}
                            <div>
                              <Label>Quality</Label>
                              <Select value={resizeQuality} onValueChange={setResizeQuality}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low (smaller file)</SelectItem>
                                  <SelectItem value="medium">Medium (balanced)</SelectItem>
                                  <SelectItem value="high">High (better quality)</SelectItem>
                                  <SelectItem value="maximum">Maximum (best quality)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <ProgressButton
                              variant="purple"
                              loading={loading}
                              success={success && showDownloadButton && convertedBlob}
                              progress={conversionProgress}
                              onClick={resizeImage}
                              disabled={loading || !resizeSelectedFile}
                              loadingText="Resizing..."
                              successMessage="Complete!"
                              downloadUrl={success && convertedBlob ? window.URL.createObjectURL(convertedBlob) : null}
                              downloadFilename={convertedFilename}
                              onDownloadComplete={resetConversionState}
                            >
                              <ImageIcon className="w-4 h-4 mr-2" />
                              {success && showDownloadButton && convertedBlob ? 'Download Resized Image' : 'Resize Image'}
                            </ProgressButton>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Individual Image Conversions */}
              {/* JPG Conversions */}
              <TabsContent value="jpgToPng" className="mt-6 space-y-6">
                <div
                  data-testid="jpgToPng-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-orange-500 transition-colors cursor-pointer bg-gradient-to-br from-orange-50 to-amber-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your JPG image here to convert to PNG</p>
                  <p className="text-sm text-gray-500">Supports: JPG, JPEG</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".jpg,.jpeg"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-jpg-png-file" className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <ProgressButton
                  variant="orange"
                  loading={loading}
                  success={success && showDownloadButton && convertedBlob}
                  progress={conversionProgress}
                  onClick={convertJpgToPng}
                  disabled={loading || selectedFiles.length === 0}
                  loadingText="Converting..."
                  successMessage="Complete!"
                  downloadUrl={success && convertedBlob ? window.URL.createObjectURL(convertedBlob) : null}
                  downloadFilename={convertedFilename}
                  onDownloadComplete={resetConversionState}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {success && showDownloadButton && convertedBlob ? 'Download PNG' : 'Convert JPG to PNG'}
                </ProgressButton>
              </TabsContent>

              <TabsContent value="jpgToWebp" className="mt-6 space-y-6">
                <div
                  data-testid="jpgToWebp-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-purple-500 transition-colors cursor-pointer bg-gradient-to-br from-orange-50 to-purple-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your JPG image here to convert to WEBP</p>
                  <p className="text-sm text-gray-500">Supports: JPG, JPEG</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".jpg,.jpeg"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-jpg-webp-file" className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <ProgressButton
                  variant="purple"
                  loading={loading}
                  success={success && showDownloadButton && convertedBlob}
                  progress={conversionProgress}
                  onClick={convertJpgToWebp}
                  disabled={loading || selectedFiles.length === 0}
                  loadingText="Converting..."
                  successMessage="Complete!"
                  downloadUrl={success && convertedBlob ? window.URL.createObjectURL(convertedBlob) : null}
                  downloadFilename={convertedFilename}
                  onDownloadComplete={resetConversionState}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {success && showDownloadButton && convertedBlob ? 'Download WEBP' : 'Convert JPG to WEBP'}
                </ProgressButton>
              </TabsContent>

              <TabsContent value="jpgToBmp" className="mt-6 space-y-6">
                <div
                  data-testid="jpgToBmp-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-gray-500 transition-colors cursor-pointer bg-gradient-to-br from-orange-50 to-gray-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your JPG image here to convert to BMP</p>
                  <p className="text-sm text-gray-500">Supports: JPG, JPEG</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".jpg,.jpeg"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-jpg-bmp-file" className="p-4 bg-gray-100 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <ProgressButton
                  variant="gray"
                  loading={loading}
                  success={success && showDownloadButton && convertedBlob}
                  progress={conversionProgress}
                  onClick={convertJpgToBmp}
                  disabled={loading || selectedFiles.length === 0}
                  loadingText="Converting..."
                  successMessage="Complete!"
                  downloadUrl={success && convertedBlob ? window.URL.createObjectURL(convertedBlob) : null}
                  downloadFilename={convertedFilename}
                  onDownloadComplete={resetConversionState}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {success && showDownloadButton && convertedBlob ? 'Download BMP' : 'Convert JPG to BMP'}
                </ProgressButton>
              </TabsContent>

              {/* PNG Conversions */}
              <TabsContent value="pngToJpg" className="mt-6 space-y-6">
                <div
                  data-testid="pngToJpg-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-orange-500 transition-colors cursor-pointer bg-gradient-to-br from-blue-50 to-orange-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your PNG image here to convert to JPG</p>
                  <p className="text-sm text-gray-500">Supports: PNG</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".png"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-png-jpg-file" className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <ProgressButton
                  variant="orange"
                  loading={loading}
                  success={success && showDownloadButton && convertedBlob}
                  progress={conversionProgress}
                  onClick={convertPngToJpg}
                  disabled={loading || selectedFiles.length === 0}
                  loadingText="Converting..."
                  successMessage="Complete!"
                  downloadUrl={success && convertedBlob ? window.URL.createObjectURL(convertedBlob) : null}
                  downloadFilename={convertedFilename}
                  onDownloadComplete={resetConversionState}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {success && showDownloadButton && convertedBlob ? 'Download JPG' : 'Convert PNG to JPG'}
                </ProgressButton>
              </TabsContent>

              <TabsContent value="pngToWebp" className="mt-6 space-y-6">
                <div
                  data-testid="pngToWebp-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-purple-500 transition-colors cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your PNG image here to convert to WEBP</p>
                  <p className="text-sm text-gray-500">Supports: PNG</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".png"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-png-webp-file" className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <ProgressButton
                  variant="purple"
                  loading={loading}
                  success={success && showDownloadButton && convertedBlob}
                  progress={conversionProgress}
                  onClick={convertPngToWebp}
                  disabled={loading || selectedFiles.length === 0}
                  loadingText="Converting..."
                  successMessage="Complete!"
                  downloadUrl={success && convertedBlob ? window.URL.createObjectURL(convertedBlob) : null}
                  downloadFilename={convertedFilename}
                  onDownloadComplete={resetConversionState}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {success && showDownloadButton && convertedBlob ? 'Download WEBP' : 'Convert PNG to WEBP'}
                </ProgressButton>
              </TabsContent>

              <TabsContent value="pngToBmp" className="mt-6 space-y-6">
                <div
                  data-testid="pngToBmp-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-gray-500 transition-colors cursor-pointer bg-gradient-to-br from-blue-50 to-gray-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your PNG image here to convert to BMP</p>
                  <p className="text-sm text-gray-500">Supports: PNG</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".png"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-png-bmp-file" className="p-4 bg-gray-100 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <ProgressButton
                  variant="gray"
                  loading={loading}
                  success={success && showDownloadButton && convertedBlob}
                  progress={conversionProgress}
                  onClick={convertPngToBmp}
                  disabled={loading || selectedFiles.length === 0}
                  loadingText="Converting..."
                  successMessage="Complete!"
                  downloadUrl={success && convertedBlob ? window.URL.createObjectURL(convertedBlob) : null}
                  downloadFilename={convertedFilename}
                  onDownloadComplete={resetConversionState}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {success && showDownloadButton && convertedBlob ? 'Download BMP' : 'Convert PNG to BMP'}
                </ProgressButton>
              </TabsContent>

              {/* WEBP Conversions */}
              <TabsContent value="webpToJpg" className="mt-6 space-y-6">
                <div
                  data-testid="webpToJpg-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-orange-500 transition-colors cursor-pointer bg-gradient-to-br from-purple-50 to-orange-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your WEBP image here to convert to JPG</p>
                  <p className="text-sm text-gray-500">Supports: WEBP</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".webp"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-webp-jpg-file" className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <ProgressButton
                  variant="orange"
                  loading={loading}
                  success={success && showDownloadButton && convertedBlob}
                  progress={conversionProgress}
                  onClick={convertWebpToJpg}
                  disabled={loading || selectedFiles.length === 0}
                  loadingText="Converting..."
                  successMessage="Complete!"
                  downloadUrl={success && convertedBlob ? window.URL.createObjectURL(convertedBlob) : null}
                  downloadFilename={convertedFilename}
                  onDownloadComplete={resetConversionState}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {success && showDownloadButton && convertedBlob ? 'Download JPG' : 'Convert WEBP to JPG'}
                </ProgressButton>
              </TabsContent>

              <TabsContent value="webpToPng" className="mt-6 space-y-6">
                <div
                  data-testid="webpToPng-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gradient-to-br from-purple-50 to-blue-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your WEBP image here to convert to PNG</p>
                  <p className="text-sm text-gray-500">Supports: WEBP</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".webp"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-webp-png-file" className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <ProgressButton
                  variant="blue"
                  loading={loading}
                  success={success && showDownloadButton && convertedBlob}
                  progress={conversionProgress}
                  onClick={convertWebpToPng}
                  disabled={loading || selectedFiles.length === 0}
                  loadingText="Converting..."
                  successMessage="Complete!"
                  downloadUrl={success && convertedBlob ? window.URL.createObjectURL(convertedBlob) : null}
                  downloadFilename={convertedFilename}
                  onDownloadComplete={resetConversionState}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {success && showDownloadButton && convertedBlob ? 'Download PNG' : 'Convert WEBP to PNG'}
                </ProgressButton>
              </TabsContent>

              <TabsContent value="webpToBmp" className="mt-6 space-y-6">
                <div
                  data-testid="webpToBmp-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-gray-500 transition-colors cursor-pointer bg-gradient-to-br from-purple-50 to-gray-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your WEBP image here to convert to BMP</p>
                  <p className="text-sm text-gray-500">Supports: WEBP</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".webp"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-webp-bmp-file" className="p-4 bg-gray-100 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <ProgressButton
                  variant="gray"
                  loading={loading}
                  success={success && showDownloadButton && convertedBlob}
                  progress={conversionProgress}
                  onClick={convertWebpToBmp}
                  disabled={loading || selectedFiles.length === 0}
                  loadingText="Converting..."
                  successMessage="Complete!"
                  downloadUrl={success && convertedBlob ? window.URL.createObjectURL(convertedBlob) : null}
                  downloadFilename={convertedFilename}
                  onDownloadComplete={resetConversionState}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {success && showDownloadButton && convertedBlob ? 'Download BMP' : 'Convert WEBP to BMP'}
                </ProgressButton>
              </TabsContent>

              {/* BMP Conversions */}
              <TabsContent value="bmpToJpg" className="mt-6 space-y-6">
                <div
                  data-testid="bmpToJpg-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-orange-500 transition-colors cursor-pointer bg-gradient-to-br from-gray-50 to-orange-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your BMP image here to convert to JPG</p>
                  <p className="text-sm text-gray-500">Supports: BMP</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".bmp"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-bmp-jpg-file" className="p-4 bg-gray-100 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <ProgressButton
                  variant="orange"
                  loading={loading}
                  success={success && showDownloadButton && convertedBlob}
                  progress={conversionProgress}
                  onClick={convertBmpToJpg}
                  disabled={loading || selectedFiles.length === 0}
                  loadingText="Converting..."
                  successMessage="Complete!"
                  downloadUrl={success && convertedBlob ? window.URL.createObjectURL(convertedBlob) : null}
                  downloadFilename={convertedFilename}
                  onDownloadComplete={resetConversionState}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {success && showDownloadButton && convertedBlob ? 'Download JPG' : 'Convert BMP to JPG'}
                </ProgressButton>
              </TabsContent>

              <TabsContent value="bmpToPng" className="mt-6 space-y-6">
                <div
                  data-testid="bmpToPng-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gradient-to-br from-gray-50 to-blue-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your BMP image here to convert to PNG</p>
                  <p className="text-sm text-gray-500">Supports: BMP</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".bmp"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-bmp-png-file" className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <ProgressButton
                  variant="blue"
                  loading={loading}
                  success={success && showDownloadButton && convertedBlob}
                  progress={conversionProgress}
                  onClick={convertBmpToPng}
                  disabled={loading || selectedFiles.length === 0}
                  loadingText="Converting..."
                  successMessage="Complete!"
                  downloadUrl={success && convertedBlob ? window.URL.createObjectURL(convertedBlob) : null}
                  downloadFilename={convertedFilename}
                  onDownloadComplete={resetConversionState}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {success && showDownloadButton && convertedBlob ? 'Download PNG' : 'Convert BMP to PNG'}
                </ProgressButton>
              </TabsContent>

              <TabsContent value="bmpToWebp" className="mt-6 space-y-6">
                <div
                  data-testid="bmpToWebp-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-purple-500 transition-colors cursor-pointer bg-gradient-to-br from-gray-50 to-purple-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your BMP image here to convert to WEBP</p>
                  <p className="text-sm text-gray-500">Supports: BMP</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".bmp"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-bmp-webp-file" className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <ProgressButton
                  variant="purple"
                  loading={loading}
                  success={success && showDownloadButton && convertedBlob}
                  progress={conversionProgress}
                  onClick={convertBmpToWebp}
                  disabled={loading || selectedFiles.length === 0}
                  loadingText="Converting..."
                  successMessage="Complete!"
                  downloadUrl={success && convertedBlob ? window.URL.createObjectURL(convertedBlob) : null}
                  downloadFilename={convertedFilename}
                  onDownloadComplete={resetConversionState}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {success && showDownloadButton && convertedBlob ? 'Download WEBP' : 'Convert BMP to WEBP'}
                </ProgressButton>
              </TabsContent>

              {/* Lock PDF */}
              <TabsContent value="lock" className="mt-6 space-y-6">
                <div
                  data-testid="lock-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-green-500 transition-colors cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your PDF here to lock it</p>
                  <p className="text-sm text-gray-500">Protect your PDF with a password</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-lock-file" className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label>Password</Label>
                    <Input
                      data-testid="lock-password-input"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                    />
                  </div>

                <ProgressButton
                    variant="green"
                    loading={loading}
                    success={success && showDownloadButton && convertedBlob}
                    progress={conversionProgress}
                    onClick={lockPdf}
                    disabled={loading || (!success && (!selectedFiles[0] || !password))}
                    loadingText="Locking..."
                    successMessage="Complete!"
                    downloadUrl={success && convertedBlob ? window.URL.createObjectURL(convertedBlob) : null}
                    downloadFilename={convertedFilename}
                    onDownloadComplete={resetConversionState}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {success && showDownloadButton && convertedBlob ? 'Download Locked PDF' : 'Lock PDF'}
                  </ProgressButton>
                </div>
              </TabsContent>

              {/* Unlock PDF */}
              <TabsContent value="unlock" className="mt-6 space-y-6">
                <div
                  data-testid="unlock-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-amber-500 transition-colors cursor-pointer bg-gradient-to-br from-amber-50 to-orange-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Unlock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your locked PDF here</p>
                  <p className="text-sm text-gray-500">Remove password protection</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-unlock-file" className="p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label>Password</Label>
                    <Input
                      data-testid="unlock-password-input"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                    />
                  </div>

                  <ProgressButton
                    variant="amber"
                    loading={loading}
                    success={success && showDownloadButton && convertedBlob}
                    progress={conversionProgress}
                    onClick={unlockPdf}
                    disabled={loading || (!success && (!selectedFiles[0] || !password))}
                    loadingText="Unlocking..."
                    successMessage="Complete!"
                    downloadUrl={success && convertedBlob ? window.URL.createObjectURL(convertedBlob) : null}
                    downloadFilename={convertedFilename}
                    onDownloadComplete={resetConversionState}
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    {success && showDownloadButton && convertedBlob ? 'Download Unlocked PDF' : 'Unlock PDF'}
                  </ProgressButton>
                </div>
              </TabsContent>

{/* Merge PDFs */}
              <TabsContent value="merge" className="mt-6 space-y-6">
                <div
                  data-testid="merge-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-indigo-500 transition-colors cursor-pointer bg-gradient-to-br from-indigo-50 to-blue-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Merge className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop multiple PDFs here to merge</p>
                  <p className="text-sm text-gray-500">Select 2-20 PDF files</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf"
                    multiple
                  />
                </div>

                {/* Simple file list - SIMPLIFIED: Just name and size */}
                {selectedFiles.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-500 flex-shrink-0"
                          onClick={(e) => removeMergeFile(idx, e)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* File count and action bar */}
                {selectedFiles.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {selectedFiles.length} PDF{selectedFiles.length !== 1 ? 's' : ''} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllMergeFiles}
                      disabled={loading}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      Clear All
                    </Button>
                  </div>
                )}

                {/* Simple instruction */}
                <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                  All uploaded PDF files will be merged. Click the button below when ready.
                </div>

                {/* ProgressButton for merge - FIXED: Properly show download button when success */}
                <div className="space-y-4">
                  {/* Show Download Button after successful merge */}
                  {showDownloadButton && convertedBlob && (
                    <ProgressButton
                      variant="success"
                      loading={false}
                      success={true}
                      downloadUrl={window.URL.createObjectURL(convertedBlob)}
                      downloadFilename={convertedFilename}
                      onDownloadComplete={() => {
                        // Reset state after successful download
                        clearAllMergeFiles();
                        setSuccess(false);
                        setShowDownloadButton(false);
                        setConvertedBlob(null);
                        setConvertedFilename("");
                        setConversionProgress(0);
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Merged PDF
                    </ProgressButton>
                  )}

                  {/* Merge Button with Progress - SIMPLIFIED: No selection needed */}
                  {!showDownloadButton && (
                    <ProgressButton
                      variant="indigo"
                      loading={loading}
                      progress={conversionProgress}
                      onClick={mergePdfs}
                      disabled={loading || selectedFiles.length < 2}
                      loadingText="Merging..."
                      successMessage="Complete!"
                    >
                      <Merge className="w-4 h-4 mr-2" />
                      Merge {selectedFiles.length} PDF{selectedFiles.length !== 1 ? 's' : ''}
                    </ProgressButton>
                  )}
                </div>
              </TabsContent>

              {/* Split PDF */}
              <TabsContent value="split" className="mt-6 space-y-6">
                <div
                  data-testid="split-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-rose-500 transition-colors cursor-pointer bg-gradient-to-br from-rose-50 to-pink-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Split className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your PDF here to split</p>
                  <p className="text-sm text-gray-500">Separate pages into multiple files</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-split-file" className="p-4 bg-rose-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label>Page Ranges</Label>
                    <Input
                      data-testid="page-ranges-input"
                      value={pageRanges}
                      onChange={(e) => setPageRanges(e.target.value)}
                      placeholder="e.g., 1-3,4-6 or 1,3,5"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter page ranges separated by commas</p>
                  </div>

                  <ProgressButton
                    variant="rose"
                    loading={loading}
                    success={success && showDownloadButton && convertedBlob}
                    progress={conversionProgress}
                    onClick={splitPdf}
                    disabled={loading || (selectedFiles.length === 0 && !success) || (!pageRanges && !success)}
                    loadingText="Splitting..."
                    successMessage="Complete!"
                    downloadUrl={success && convertedBlob ? window.URL.createObjectURL(convertedBlob) : null}
                    downloadFilename={convertedFilename}
                    onDownloadComplete={resetConversionState}
                  >
                    <Split className="w-4 h-4 mr-2" />
                    {success && showDownloadButton && convertedBlob ? 'Download Split PDFs (ZIP)' : 'Split PDF'}
                  </ProgressButton>
                </div>
              </TabsContent>

              {/* ZIP Folder */}
              <TabsContent value="zip" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compress Files</CardTitle>
                    <CardDescription>Create a ZIP archive from files or folders</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      data-testid="compress-dropzone"
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-teal-500 transition-colors cursor-pointer bg-gradient-to-br from-teal-50 to-cyan-50"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={() => zipFileInputRef.current?.click()}
                    >
                      <Archive className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm font-medium mb-1">Drop files or folders to compress</p>
                      <p className="text-xs text-gray-500">Select single/multiple files or folders</p>
                      <input
                        ref={zipFileInputRef}
                        type="file"
                        onChange={handleZipFileSelect}
                        className="hidden"
                        multiple
                        webkitdirectory=""
                        directory=""
                      />
                    </div>

                    {selectedFiles.length > 0 && (
                      <div data-testid="selected-compress-files" className="p-3 bg-teal-50 rounded-lg">
                        <p className="text-sm font-medium mb-2">Selected {selectedFiles.length} item(s):</p>
                        {selectedFiles.slice(0, 5).map((file, idx) => (
                          <p key={idx} className="text-xs text-gray-600 truncate">
                            {file.webkitRelativePath || file.name}
                          </p>
                        ))}
                        {selectedFiles.length > 5 && (
                          <p className="text-xs text-gray-500 mt-1">...and {selectedFiles.length - 5} more</p>
                        )}
                      </div>
                    )}

                    {/* Single ProgressButton with Progress and Download */}
                    <ProgressButton
                      variant="teal"
                      loading={loading}
                      success={success && showDownloadButton && convertedBlob}
                      progress={conversionProgress}
                      onClick={compressFiles}
                      disabled={loading && !success}
                      loadingText="Compressing..."
                      successMessage="Complete!"
                      downloadUrl={success && convertedBlob ? window.URL.createObjectURL(convertedBlob) : null}
                      downloadFilename={convertedFilename}
                      onDownloadComplete={resetConversionState}
                      showDownloadOnSuccess={true}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      {success && showDownloadButton && convertedBlob ? 'Download ZIP' : 'Compress to ZIP'}
                    </ProgressButton>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* UNZIP Folder */}
              <TabsContent value="unzip" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Extract ZIP</CardTitle>
                    <CardDescription>Unzip files from archive</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      data-testid="extract-dropzone"
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-cyan-500 transition-colors cursor-pointer bg-gradient-to-br from-cyan-50 to-blue-50"
                      onDrop={(e) => {
                        e.preventDefault();
                        const files = Array.from(e.dataTransfer.files);
                        if (files.length > 0) {
                          const file = files[0];
                          const fileName = file.name.toLowerCase();
                          if (fileName.endsWith('.zip')) {
                            setExtractSelectedFile(file);
                          } else {
                            toast.error("Please drop a ZIP file");
                          }
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => zipExtractInputRef.current?.click()}
                    >
                      <Archive className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm font-medium mb-1">Drop ZIP file to extract</p>
                      <input
                        ref={zipExtractInputRef}
                        type="file"
                        onChange={handleExtractFileSelect}
                        className="hidden"
                        accept=".zip"
                      />
                    </div>

                    {extractSelectedFile && (
                      <div data-testid="selected-extract-file" className="p-3 bg-cyan-50 rounded-lg">
                        <p className="text-sm font-medium">Selected: {extractSelectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(extractSelectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    )}

                    <ProgressButton
                      variant="cyan"
                      loading={loading}
                      progress={conversionProgress}
                      onClick={extractZip}
                      disabled={loading || !extractSelectedFile}
                      loadingText="Extracting..."
                      successMessage="Complete!"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Extract ZIP
                    </ProgressButton>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* OCR */}
              <TabsContent value="ocr" className="mt-6 space-y-6">
                <div
                  data-testid="ocr-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-violet-500 transition-colors cursor-pointer bg-gradient-to-br from-violet-50 to-purple-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileSearch className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your image here for OCR</p>
                  <p className="text-sm text-gray-500">Extract text from images</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-ocr-file" className="p-4 bg-violet-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label>Select Language</Label>
                    {ocrLanguagesLoading ? (
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        disabled
                      >
                        Loading languages...
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    ) : (
                      <Popover open={openLanguageDropdown} onOpenChange={setOpenLanguageDropdown}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openLanguageDropdown}
                            className="w-full justify-between"
                            data-testid="ocr-language-select"
                            disabled={detectingLanguage}
                          >
                            {detectingLanguage ? (
                              <>
                                <span className="flex items-center">
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Detecting...
                                </span>
                              </>
                            ) : (
                              <>
                                {ocrLanguage
                                  ? ocrLanguages.find((lang) => lang.code === ocrLanguage)?.name
                                  : "Select language..."}
                              </>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search languages..." />
                            <CommandList>
                              <CommandEmpty>No language found.</CommandEmpty>
                              <CommandGroup>
                                {ocrLanguages.map((lang) => (
                                  <CommandItem
                                    key={lang.code}
                                    value={lang.name}
                                    onSelect={() => {
                                      setOcrLanguage(lang.code === ocrLanguage ? "" : lang.code);
                                      setOpenLanguageDropdown(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        ocrLanguage === lang.code ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {lang.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                    {ocrLanguages.length === 0 && !ocrLanguagesLoading && (
                      <p className="text-xs text-red-500 mt-1">
                        No OCR languages available. Please install Tesseract with language packs.
                      </p>
                    )}
                    {detectingLanguage && (
                      <p className="text-xs text-blue-500 mt-1 flex items-center">
                        <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing image to detect language...
                      </p>
                    )}
                  </div>

                  <Button
                    data-testid="extract-text-btn"
                    onClick={extractTextOcr}
                    disabled={loading || ocrLanguages.length === 0}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                  >
                    {loading ? "Extracting..." : "Extract Text"}
                  </Button>
                </div>
              </TabsContent>

              {/* Search in PDF */}
              <TabsContent value="search" className="mt-6 space-y-6">
                <div
                  data-testid="search-dropzone"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-cyan-500 transition-colors cursor-pointer bg-gradient-to-br from-cyan-50 to-blue-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop your PDF here to search</p>
                  <p className="text-sm text-gray-500">Find text within PDF documents</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div data-testid="selected-search-file" className="p-4 bg-cyan-50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFiles[0].name}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label>Search Term</Label>
                    <Input
                      data-testid="search-term-input"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Enter text to search for"
                    />
                  </div>

                  <ProgressButton
                    variant="cyan"
                    loading={loading}
                    progress={conversionProgress}
                    onClick={searchInPdf}
                    disabled={loading || !selectedFiles[0] || !searchTerm.trim()}
                    loadingText="Searching..."
                    successMessage="Found!"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search in PDF
                  </ProgressButton>
                </div>

                {/* Search Results */}
                {searchResults && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-4">Search Results</h4>
                    {searchResults.total_matches === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p>No matches found for "{searchResults.search_term}"</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Found {searchResults.total_matches} match(es) for "{searchResults.search_term}"
                        </p>
                        {searchResults.results.map((result, index) => (
                          <Card key={index} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-blue-600 mb-2">
                                  Page {result.page}
                                </p>
                                <div
                                  className="text-sm text-gray-700 leading-relaxed"
                                  dangerouslySetInnerHTML={{ __html: result.context }}
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="mt-16 max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Powerful Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">Document Conversion</h4>
                <p className="text-sm text-gray-600">Convert between DOCX, DOC, PDF, TXT, Excel, and PowerPoint</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">Image Conversion</h4>
                <p className="text-sm text-gray-600">Convert images to JPG, PNG, WEBP, BMP</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">PDF Security</h4>
                <p className="text-sm text-gray-600">Lock and unlock PDFs with passwords</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileSearch className="w-6 h-6 text-violet-600" />
                </div>
                <h4 className="font-semibold mb-2">OCR Technology</h4>
                <p className="text-sm text-gray-600">Extract text from images instantly</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* OCR Result Dialog */}
      <Dialog open={showOcrDialog} onOpenChange={setShowOcrDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Extracted Text</DialogTitle>
            <DialogDescription>
              Text extracted from your image using OCR
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div data-testid="ocr-result-text" className="p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{ocrText}</pre>
            </div>
            <div className="flex gap-2">
              <Button data-testid="copy-text-btn" onClick={copyToClipboard} className="flex-1">
                Copy to Clipboard
              </Button>
              <Button data-testid="close-ocr-dialog-btn" variant="outline" onClick={() => setShowOcrDialog(false)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Extracted Files Dialog */}
      <Dialog open={showExtractedFiles} onOpenChange={setShowExtractedFiles}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Extracted Files</DialogTitle>
            <DialogDescription>
              Files extracted from ZIP archive. Click on any file to download it individually.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto">
              {extractedFiles.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No files found</p>
              ) : (
                <div className="space-y-2">
                  {extractedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" title={file.path}>
                          {file.path}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => downloadIndividualFile(file.path, file.path.split('/').pop())}
                        className="ml-4"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowExtractedFiles(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

     {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent
          className="
            w-[95vw] sm:max-w-xl lg:max-w-3xl
            max-h-[85vh]
            overflow-hidden
            p-3 sm:p-6
          "
        >
          {/* HEADER */}
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg sm:text-xl">
              Conversion History
            </DialogTitle>
            <DialogDescription className="text-sm">
              Your recent file conversions
            </DialogDescription>
          </DialogHeader>

          {/* SCROLLABLE LIST */}
          <div
            data-testid="history-list"
            className="mt-3 space-y-2 overflow-y-auto max-h-[65vh] pr-1"
          >
            {history.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">
                No conversion history yet
              </p>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                    {/* LEFT CONTENT */}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.filename}
                      </p>

                      <p className="text-xs text-gray-600">
                        {item.source_format.toUpperCase()} →{" "}
                        {item.target_format.toUpperCase()}
                      </p>

                      <p className="text-[11px] text-gray-500 mt-1">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>

                    {/* STATUS */}
                    <span
                      className="
                        self-start sm:self-center
                        px-2 py-1
                        bg-green-100 text-green-700
                        rounded-full
                        text-[11px] font-medium
                        whitespace-nowrap
                      "
                    >
                      {item.status}
                    </span>

                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>


      {/* Footer */}
      <footer className="mt-16 py-8 border-t bg-white/70 backdrop-blur-md">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="text-sm">FileLab</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
