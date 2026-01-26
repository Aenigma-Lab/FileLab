import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProgressButton from "@/components/ui/ProgressButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Link,
  FileText,
  Users,
  MessageSquare,
  Smartphone,
  Mail,
  Phone,
  Globe,
  QrCode,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Use relative API path for network compatibility
const getBackendUrl = () => {
  const url = process.env.REACT_APP_BACKEND_URL;
  if (!url || url.trim() === "") {
    return "";
  }
  return url;
};

const BACKEND_URL = getBackendUrl();
const API = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";

// Color themes
const COLOR_THEMES = [
  { id: "classic", name: "Classic", fg: "#000000", bg: "#FFFFFF" },
  { id: "blue", name: "Blue", fg: "#1E40AF", bg: "#EFF6FF" },
  { id: "green", name: "Green", fg: "#059669", bg: "#ECFDF5" },
  { id: "red", name: "Red", fg: "#DC2626", bg: "#FEF2F2" },
  { id: "purple", name: "Purple", fg: "#7C3AED", bg: "#F5F3FF" },
  { id: "orange", name: "Orange", fg: "#EA580C", bg: "#FFF7ED" },
  { id: "pink", name: "Pink", fg: "#DB2777", bg: "#FDF2F8" },
  { id: "teal", name: "Teal", fg: "#0D9488", bg: "#F0FDFA" },
  { id: "black", name: "Black", fg: "#000000", bg: "#FFFFFF" },
];

const QRCodeGenerator = () => {
  const [activeType, setActiveType] = useState("url");
  const [loading, setLoading] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [options, setOptions] = useState({
    size: 300,
    errorCorrection: "H",
    theme: "classic",
  });

  // Form states for different QR types
  const [urlData, setUrlData] = useState("");
  const [pdfUrlData, setPdfUrlData] = useState("");
  const [textData, setTextData] = useState("");
  const [multiUrls, setMultiUrls] = useState([{ url: "", label: "" }]);
  const [contactData, setContactData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    organization: "",
    title: "",
    website: "",
    address: "",
  });
  const [appData, setAppData] = useState({ appId: "", store: "google" });
  const [smsData, setSmsData] = useState({ phone: "", message: "" });
  const [emailData, setEmailData] = useState({
    email: "",
    subject: "",
    body: "",
  });
  const [phoneData, setPhoneData] = useState("");

  const canvasRef = useRef(null);
  const tabsContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Check scroll position to show/hide arrows
  const checkScroll = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  // Scroll tabs container
  const scrollTabs = (direction) => {
    if (tabsContainerRef.current) {
      const scrollAmount = 120;
      tabsContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Fetch options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get(`${API}/qrcode/options`);
        if (response.data.color_themes) {
          // Merge with existing themes
        }
      } catch (error) {
        console.error("Failed to fetch QR options:", error);
      }
    };
    fetchOptions();
  }, []);

  // Check scroll position on mount and when active type changes
  useEffect(() => {
    checkScroll();
    // Small delay to ensure tabs are rendered
    const timer = setTimeout(checkScroll, 100);
    return () => clearTimeout(timer);
  }, [activeType]);

  // Generate QR code
  const generateQRCode = async (format = "png") => {
    setLoading(true);
    setProgress(0);
    setSuccess(false);
    setQrImage(null);

    try {
      const endpoint = `${API}/qrcode/generate/${format}`;
      
      // Build form data based on QR type
      const formData = new FormData();
      formData.append("qr_type", activeType);
      formData.append("size", options.size.toString());
      formData.append("color_theme", options.theme);
      formData.append("error_correction", options.errorCorrection);

      // Build data based on type
      switch (activeType) {
        case "url":
          if (!urlData.trim()) {
            toast.error("Please enter a URL");
            setLoading(false);
            return;
          }
          formData.append("url", urlData);
          break;

        case "pdf_link":
          if (!pdfUrlData.trim()) {
            toast.error("Please enter a PDF URL");
            setLoading(false);
            return;
          }
          formData.append("pdf_url", pdfUrlData);
          break;

        case "text":
          if (!textData.trim()) {
            toast.error("Please enter text content");
            setLoading(false);
            return;
          }
          formData.append("text", textData);
          break;

        case "multi_url":
          const validUrls = multiUrls.filter((u) => u.url.trim() && u.label.trim());
          if (validUrls.length === 0) {
            toast.error("Please add at least one URL with label");
            setLoading(false);
            return;
          }
          formData.append("urls_json", JSON.stringify(validUrls));
          break;

        case "contact":
          if (!contactData.firstName && !contactData.lastName && !contactData.phone && !contactData.email) {
            toast.error("Please enter at least name, phone, or email");
            setLoading(false);
            return;
          }
          formData.append("first_name", contactData.firstName);
          formData.append("last_name", contactData.lastName);
          formData.append("phone", contactData.phone);
          formData.append("email", contactData.email);
          formData.append("organization", contactData.organization);
          formData.append("title", contactData.title);
          formData.append("website", contactData.website);
          formData.append("address", contactData.address);
          break;

        case "app":
          if (!appData.appId.trim()) {
            toast.error("Please enter app ID");
            setLoading(false);
            return;
          }
          formData.append("app_id", appData.appId);
          formData.append("store", appData.store);
          break;

        case "sms":
          if (!smsData.phone.trim()) {
            toast.error("Please enter phone number");
            setLoading(false);
            return;
          }
          formData.append("sms_phone", smsData.phone);
          formData.append("message", smsData.message);
          break;

        case "email":
          if (!emailData.email.trim()) {
            toast.error("Please enter email address");
            setLoading(false);
            return;
          }
          formData.append("email_address", emailData.email);
          formData.append("subject", emailData.subject);
          formData.append("body", emailData.body);
          break;

        case "phone":
          if (!phoneData.trim()) {
            toast.error("Please enter phone number");
            setLoading(false);
            return;
          }
          formData.append("phone_number", phoneData);
          break;

        default:
          toast.error("Unsupported QR type");
          setLoading(false);
          return;
      }

      // Simulate progress since the API doesn't support it
      setProgress(30);

      const response = await axios.post(endpoint, formData, {
        responseType: "blob",
      });

      setProgress(70);

      // For PNG format, show preview
      if (format === "png") {
        const imageUrl = URL.createObjectURL(response.data);
        setQrImage(imageUrl);
        setProgress(100);
        setSuccess(true);
        toast.success("QR Code generated successfully!");
      } else {
        // For download formats, trigger download
        const contentType = format === "pdf" ? "application/pdf" : "image/svg+xml";
        const blob = new Blob([response.data], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `qrcode.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setProgress(100);
        setSuccess(true);
        toast.success(`${format.toUpperCase()} downloaded successfully!`);
      }
    } catch (error) {
      console.error("QR generation error:", error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.detail || "Failed to generate QR code";
      toast.error(errorMsg);
      setProgress(0);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Download current image - always downloads as PNG
  const downloadImage = () => {
    if (!qrImage) return;

    const a = document.createElement("a");
    a.href = qrImage;
    a.download = "qrcode.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Show download success toast
    toast.success("Downloaded successfully!");
    
    // Reset states after download - ready for new operation
    setTimeout(() => {
      setQrImage(null);
      setProgress(0);
      setSuccess(false);
      // Reset form data based on active type
      setUrlData("");
      setPdfUrlData("");
      setTextData("");
      setMultiUrls([{ url: "", label: "" }]);
      setContactData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        organization: "",
        title: "",
        website: "",
        address: "",
      });
      setAppData({ appId: "", store: "google" });
      setSmsData({ phone: "", message: "" });
      setEmailData({ email: "", subject: "", body: "" });
      setPhoneData("");
    }, 500);
  };

  // Add multi-url entry
  const addMultiUrl = () => {
    setMultiUrls([...multiUrls, { url: "", label: "" }]);
  };

  // Update multi-url entry
  const updateMultiUrl = (index, field, value) => {
    const updated = [...multiUrls];
    updated[index][field] = value;
    setMultiUrls(updated);
  };

  // Remove multi-url entry
  const removeMultiUrl = (index) => {
    const updated = multiUrls.filter((_, i) => i !== index);
    setMultiUrls(updated);
  };

  const selectedTheme = COLOR_THEMES.find((t) => t.id === options.theme);

  return (
    <Card className="max-w-2xl mx-auto border-0 sm:border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
          QR Code Generator
        </CardTitle>
        <CardDescription className="text-sm">
          Generate QR codes for URLs, contacts, text, and more
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* QR Type Tabs */}
        <Tabs value={activeType} onValueChange={setActiveType}>
          {/* Mobile-friendly horizontal scroll tabs with arrow navigation */}
          <div className="relative">
            {/* Left Arrow Button - visible only on mobile when not at start */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollTabs('left')}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 sm:hidden rounded-full shadow-md bg-white ${
                showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Right Arrow Button - visible only on mobile when not at end */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollTabs('right')}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 sm:hidden rounded-full shadow-md bg-white ${
                showRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Scrollable Tabs Container */}
            <div 
              ref={tabsContainerRef}
              onScroll={checkScroll}
              className="w-full overflow-x-auto scrollbar-hide -mx-4 px-10 sm:mx-0 sm:px-0 touch-pan-x"
            >
              <TabsList className="flex flex-nowrap w-max sm:w-full gap-1.5 sm:grid sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
                <TabsTrigger 
                  value="url" 
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2 sm:px-2 sm:py-1.5 rounded-lg transition-all duration-200 text-xs sm:text-xs font-medium border-0 sm:border hover:bg-gray-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 min-w-[60px] sm:min-w-0"
                >
                  <Globe className="w-4 h-4 sm:w-4 sm:h-4" />
                  <span>URL</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="pdf_link" 
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2 sm:px-2 sm:py-1.5 rounded-lg transition-all duration-200 text-xs sm:text-xs font-medium border-0 sm:border hover:bg-gray-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 min-w-[60px] sm:min-w-0"
                >
                  <FileText className="w-4 h-4 sm:w-4 sm:h-4" />
                  <span>PDF</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="text" 
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2 sm:px-2 sm:py-1.5 rounded-lg transition-all duration-200 text-xs sm:text-xs font-medium border-0 sm:border hover:bg-gray-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 min-w-[60px] sm:min-w-0"
                >
                  <ImageIcon className="w-4 h-4 sm:w-4 sm:h-4" />
                  <span>Text</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="contact" 
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2 sm:px-2 sm:py-1.5 rounded-lg transition-all duration-200 text-xs sm:text-xs font-medium border-0 sm:border hover:bg-gray-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 min-w-[60px] sm:min-w-0"
                >
                  <Users className="w-4 h-4 sm:w-4 sm:h-4" />
                  <span>Contact</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="multi_url" 
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2 sm:px-2 sm:py-1.5 rounded-lg transition-all duration-200 text-xs sm:text-xs font-medium border-0 sm:border hover:bg-gray-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 min-w-[60px] sm:min-w-0"
                >
                  <Link className="w-4 h-4 sm:w-4 sm:h-4" />
                  <span>Multi</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="app" 
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2 sm:px-2 sm:py-1.5 rounded-lg transition-all duration-200 text-xs sm:text-xs font-medium border-0 sm:border hover:bg-gray-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 min-w-[60px] sm:min-w-0"
                >
                  <Smartphone className="w-4 h-4 sm:w-4 sm:h-4" />
                  <span>App</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="sms" 
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2 sm:px-2 sm:py-1.5 rounded-lg transition-all duration-200 text-xs sm:text-xs font-medium border-0 sm:border hover:bg-gray-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 min-w-[60px] sm:min-w-0"
                >
                  <MessageSquare className="w-4 h-4 sm:w-4 sm:h-4" />
                  <span>SMS</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="email" 
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2 sm:px-2 sm:py-1.5 rounded-lg transition-all duration-200 text-xs sm:text-xs font-medium border-0 sm:border hover:bg-gray-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 min-w-[60px] sm:min-w-0"
                >
                  <Mail className="w-4 h-4 sm:w-4 sm:h-4" />
                  <span>Email</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="phone" 
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2 sm:px-2 sm:py-1.5 rounded-lg transition-all duration-200 text-xs sm:text-xs font-medium border-0 sm:border hover:bg-gray-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 min-w-[60px] sm:min-w-0"
                >
                  <Phone className="w-4 h-4 sm:w-4 sm:h-4" />
                  <span>Phone</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* URL QR */}
          <TabsContent value="url" className="space-y-4 mt-4">
            <div>
              <Label>Website URL</Label>
              <Input
                placeholder="https://example.com"
                value={urlData}
                onChange={(e) => setUrlData(e.target.value)}
              />
            </div>
          </TabsContent>

          {/* PDF Link QR */}
          <TabsContent value="pdf_link" className="space-y-4 mt-4">
            <div>
              <Label>PDF File URL</Label>
              <Input
                placeholder="https://example.com/document.pdf"
                value={pdfUrlData}
                onChange={(e) => setPdfUrlData(e.target.value)}
              />
            </div>
          </TabsContent>

          {/* Text QR */}
          <TabsContent value="text" className="space-y-4 mt-4">
            <div>
              <Label>Text Content</Label>
              <textarea
                className="w-full min-h-[100px] p-3 border-0 sm:border rounded-lg resize-none"
                placeholder="Enter any text content..."
                value={textData}
                onChange={(e) => setTextData(e.target.value)}
              />
            </div>
          </TabsContent>

          {/* Multi-URL QR */}
          <TabsContent value="multi_url" className="space-y-4 mt-4">
            {multiUrls.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 min-w-0">
                  <Input
                    placeholder="Label"
                    value={item.label}
                    onChange={(e) => updateMultiUrl(index, "label", e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex-[2] min-w-0">
                  <Input
                    placeholder="URL"
                    value={item.url}
                    onChange={(e) => updateMultiUrl(index, "url", e.target.value)}
                    className="w-full"
                  />
                </div>
                {multiUrls.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeMultiUrl(index)}
                    className="sm:flex-shrink-0 h-10"
                  >
                    <span className="text-lg">×</span>
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={addMultiUrl} className="w-full h-10 sm:h-auto">
              + Add Another URL
            </Button>
          </TabsContent>

          {/* Contact QR */}
          <TabsContent value="contact" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={contactData.firstName}
                  onChange={(e) =>
                    setContactData({ ...contactData, firstName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={contactData.lastName}
                  onChange={(e) =>
                    setContactData({ ...contactData, lastName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={contactData.phone}
                  onChange={(e) =>
                    setContactData({ ...contactData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={contactData.email}
                  onChange={(e) =>
                    setContactData({ ...contactData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Organization</Label>
                <Input
                  value={contactData.organization}
                  onChange={(e) =>
                    setContactData({ ...contactData, organization: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={contactData.title}
                  onChange={(e) =>
                    setContactData({ ...contactData, title: e.target.value })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Website</Label>
                <Input
                  value={contactData.website}
                  onChange={(e) =>
                    setContactData({ ...contactData, website: e.target.value })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Address</Label>
                <Input
                  value={contactData.address}
                  onChange={(e) =>
                    setContactData({ ...contactData, address: e.target.value })
                  }
                />
              </div>
            </div>
          </TabsContent>

          {/* App QR */}
          <TabsContent value="app" className="space-y-4 mt-4">
            <div>
              <Label>App Store</Label>
              <Select
                value={appData.store}
                onValueChange={(value) =>
                  setAppData({ ...appData, store: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Play</SelectItem>
                  <SelectItem value="apple">Apple App Store</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>App ID / Package Name</Label>
              <Input
                placeholder={appData.store === "google" ? "com.example.app" : "1234567890"}
                value={appData.appId}
                onChange={(e) =>
                  setAppData({ ...appData, appId: e.target.value })
                }
              />
            </div>
          </TabsContent>

          {/* SMS QR */}
          <TabsContent value="sms" className="space-y-4 mt-4">
            <div>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                placeholder="+1234567890"
                value={smsData.phone}
                onChange={(e) =>
                  setSmsData({ ...smsData, phone: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Message (optional)</Label>
              <textarea
                className="w-full min-h-[80px] p-3 border-0 sm:border rounded-lg resize-none"
                placeholder="Pre-filled message..."
                value={smsData.message}
                onChange={(e) =>
                  setSmsData({ ...smsData, message: e.target.value })
                }
              />
            </div>
          </TabsContent>

          {/* Email QR */}
          <TabsContent value="email" className="space-y-4 mt-4">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="example@email.com"
                value={emailData.email}
                onChange={(e) =>
                  setEmailData({ ...emailData, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Subject (optional)</Label>
              <Input
                value={emailData.subject}
                onChange={(e) =>
                  setEmailData({ ...emailData, subject: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Body (optional)</Label>
              <textarea
                className="w-full min-h-[80px] p-3 border-0 sm:border rounded-lg resize-none"
                placeholder="Pre-filled email body..."
                value={emailData.body}
                onChange={(e) =>
                  setEmailData({ ...emailData, body: e.target.value })
                }
              />
            </div>
          </TabsContent>

          {/* Phone QR */}
          <TabsContent value="phone" className="space-y-4 mt-4">
            <div>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                placeholder="+1234567890"
                value={phoneData}
                onChange={(e) => setPhoneData(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Size</Label>
            <Select
              value={String(options.size)}
              onValueChange={(value) =>
                setOptions({ ...options, size: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="200">200px</SelectItem>
                <SelectItem value="300">300px</SelectItem>
                <SelectItem value="400">400px</SelectItem>
                <SelectItem value="500">500px</SelectItem>
                <SelectItem value="600">600px</SelectItem>
                <SelectItem value="800">800px</SelectItem>
                <SelectItem value="1000">1000px</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Error Correction</Label>
            <Select
              value={options.errorCorrection}
              onValueChange={(value) =>
                setOptions({ ...options, errorCorrection: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low (7%)</SelectItem>
                <SelectItem value="M">Medium (15%)</SelectItem>
                <SelectItem value="Q">Quartile (25%)</SelectItem>
                <SelectItem value="H">High (30%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Color Theme</Label>
            <Select
              value={options.theme}
              onValueChange={(value) =>
                setOptions({ ...options, theme: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLOR_THEMES.map((theme) => (
                  <SelectItem key={theme.id} value={theme.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{
                          background: `linear-gradient(135deg, ${theme.fg} 50%, ${theme.bg} 50%)`,
                        }}
                      />
                      {theme.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Generate Button - also serves as Download button after QR is generated */}
        <ProgressButton
          variant="default"
          loading={loading}
          progress={progress}
          success={success}
          onClick={qrImage ? downloadImage : () => generateQRCode("png")}
          disabled={loading}
          loadingText="Generating..."
          successMessage="Complete!"
          className="w-full"
        >
          <QrCode className="w-4 h-4 mr-2" />
          {qrImage ? "Download PNG" : "Generate QR Code"}
        </ProgressButton>

        {/* Preview */}
        {qrImage && (
          <div className="space-y-4">
            <div className="flex justify-center p-4 border-0 sm:border rounded-lg bg-white">
              <img
                src={qrImage}
                alt="QR Code Preview"
                className="w-full max-w-[250px] h-auto max-h-[250px] sm:max-w-[300px] sm:max-h-[300px]"
                style={{
                  imageRendering: "pixelated",
                }}
              />
            </div>
            {/* Download buttons - grid on mobile, flex on desktop */}
            <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-2">
              <Button
                variant="outline"
                className="w-full h-10 sm:flex-1"
                onClick={downloadImage}
              >
                <Download className="w-4 h-4 mr-1.5 sm:mr-2" />
                <span className="text-xs sm:text-sm">PNG</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-10 sm:flex-1"
                onClick={() => generateQRCode("svg")}
              >
                <Download className="w-4 h-4 mr-1.5 sm:mr-2" />
                <span className="text-xs sm:text-sm">SVG</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-10 sm:flex-1"
                onClick={() => generateQRCode("pdf")}
              >
                <Download className="w-4 h-4 mr-1.5 sm:mr-2" />
                <span className="text-xs sm:text-sm">PDF</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;

