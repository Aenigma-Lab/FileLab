import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFoundPage = () => {
  useEffect(() => {
    // Log 404 for analytics (optional)
    console.warn("404 - Page not found:", window.location.pathname);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/70 md:backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 relative">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              FileLab
            </h1>
          </div>
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          
          {/* 404 Text - On Top */}
          <h1 style={{
            fontSize: "80px",
            fontWeight: "bold",
            background: "#D3D3D3",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1,
            marginBottom: "-20px"
          }}>404</h1>

          {/* 404 Background Image */}
          <div style={{
            backgroundImage: "url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)",
            height: "400px",
            backgroundPosition: "center",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat"
          }}>
          </div>
          
          {/* Content Box */}
          <div style={{ marginTop: "0px" }}>
            <h3 style={{
              fontSize: "36px",
              fontWeight: "bold",
              marginBottom: "16px",
              background: "linear-gradient(to right, #2563eb, #9333ea)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
              Look like you're lost
            </h3>
            
            <p style={{
              color: "#666",
              marginBottom: "24px",
              fontSize: "18px"
            }}>
              the page you are looking for not avaible!
            </p>
            
            <Link 
              to="/" 
              style={{
                color: "#fff",
                padding: "14px 28px",
                background: "linear-gradient(to right, #2563eb, #9333ea)",
                margin: "20px 0",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "16px",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 14px 0 rgba(37, 99, 235, 0.39)"
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px 0 rgba(37, 99, 235, 0.5)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 14px 0 rgba(37, 99, 235, 0.39)";
              }}
            >
              <Home style={{ width: "20px", height: "20px" }} />
              Go to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFoundPage;

