import { useState } from "react";
import {
  FileText,
  Merge,
  Split,
  Trash2,
  LayoutGrid,
  Download,
  Wrench,
  Scan,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MobileNavbar({ fetchHistory }) {
  const [leftOpen, setLeftOpen] = useState(false);   // mega menu
  const [rightOpen, setRightOpen] = useState(false); // 9-dot menu

  return (
    <>
      {/* ===== MOBILE HEADER ===== */}
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">

          {/* LEFT: Hamburger */}
          <button
            onClick={() => {
              setLeftOpen(true);
              setRightOpen(false);
            }}
            className="p-2 rounded-md active:bg-gray-200"
            aria-label="Open menu"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor">
              <path strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* CENTER: Logo */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FileLab
            </span>
          </div>

          {/* RIGHT: 9-dot menu */}
          <button
            onClick={() => {
              setRightOpen(v => !v);
              setLeftOpen(false);
            }}
            className="p-2 rounded-md active:bg-gray-200"
            aria-label="More options"
          >
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <span
                  key={i}
                  className="w-2 h-2 bg-gray-800 rounded-full"
                />
              ))}
            </div>
          </button>
        </div>
      </header>

      {/* ===== LEFT DRAWER (MEGA MENU) ===== */}
      {leftOpen && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setLeftOpen(false)}>
          <aside
            className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl p-4 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">All Tools</h2>

            {/* Section */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Organize PDF</h3>
              <button className="mobile-item"><Merge size={18} /> Merge PDF</button>
              <button className="mobile-item"><Split size={18} /> Split PDF</button>
              <button className="mobile-item"><Trash2 size={18} /> Remove Pages</button>
              <button className="mobile-item"><LayoutGrid size={18} /> Organize PDF</button>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Optimize PDF</h3>
              <button className="mobile-item"><Download size={18} /> Compress PDF</button>
              <button className="mobile-item"><Wrench size={18} /> Repair PDF</button>
              <button className="mobile-item"><Scan size={18} /> OCR PDF</button>
            </div>
          </aside>
        </div>
      )}

      {/* ===== RIGHT DRAWER (9-DOT MENU) ===== */}
      {rightOpen && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setRightOpen(false)}>
          <aside
            className="absolute right-2 top-16 w-56 bg-white rounded-xl shadow-xl p-3"
            onClick={e => e.stopPropagation()}
          >
            <Button variant="outline" className="w-full">Convert</Button>
            <Button variant="outline" className="w-full">OCR</Button>
            <Button variant="outline" className="w-full">API</Button>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={fetchHistory}
            >
              <History className="w-4 h-4" /> History
            </Button>

            <Button
              variant="outline"
              className="w-full text-white bg-gradient-to-r from-blue-500 to-purple-600 border-transparent"
            >
              Login
            </Button>

            <Button variant="default" className="w-full">
              Sign Up
            </Button>
          </aside>
        </div>
      )}
    </>
  );
}
