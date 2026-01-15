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
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
      {/* Sonner Toaster */}
      <Toaster position="top-right" expand={false} />
    </div>
  );
}

export default App;