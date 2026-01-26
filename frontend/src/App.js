/** * STOP! This must be the very first piece of code in your file.
 * It redefines how the browser handles ResizeObservers.
 */
if (typeof window !== 'undefined') {
  const OriginalResizeObserver = window.ResizeObserver;

  window.ResizeObserver = class ResizeObserver extends OriginalResizeObserver {
    constructor(callback) {
      super((entries, observer) => {
        window.requestAnimationFrame(() => {
          if (!Array.isArray(entries) || !entries.length) return;
          callback(entries, observer);
        });
      });
    }
  };
}

import { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";
import { Toaster } from "@/components/ui/sonner";

// Operation routes mapping - each operation gets its own URL path
const OPERATION_ROUTES = [
  'pdf-to-docx', 'docx-to-pdf', 'pdf-to-text', 'text-to-pdf', 'text-to-docx',
  'pdf-to-excel', 'excel-to-pdf', 'pdf-to-ppt', 'pptx-to-pdf', 'image-to-pdf',
  'watermark', 'qrcode', 'convert-images', 'resize-image',
  'jpg-to-png', 'jpg-to-webp', 'jpg-to-bmp', 'png-to-jpg', 'png-to-webp', 'png-to-bmp',
  'webp-to-jpg', 'webp-to-png', 'webp-to-bmp', 'bmp-to-jpg', 'bmp-to-png', 'bmp-to-webp',
  'lock', 'unlock', 'merge', 'split', 'zip', 'unzip', 'ocr', 'search', 'dashboard'
];

// Component to handle operation route and redirect to home with query param
function OperationRoute() {
  const location = useLocation();
  const operation = location.pathname.slice(1); // Remove leading slash
  return <Navigate to={`/?op=${operation}`} replace />;
}

// Component to handle root path with operation query param
function HomePageWrapper() {
  return <HomePage />;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Home page with optional operation query param */}
          <Route path="/" element={<HomePageWrapper />} />
          
          {/* Catch-all operation routes - redirect to home with query param */}
          {OPERATION_ROUTES.map(route => (
            <Route key={route} path={`/${route}`} element={<OperationRoute />} />
          ))}
          
          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      {/* Sonner Toaster */}
      <Toaster position="top-right" expand={false} />
    </div>
  );
}

export default App;
