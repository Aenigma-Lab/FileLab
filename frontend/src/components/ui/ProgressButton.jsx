import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Download, Loader2, Check, Sparkles } from 'lucide-react';
import { Button } from './button';

// Add styles to document head
const styleElement = document.createElement('style');
styleElement.textContent = `
  @keyframes ripple {
    0% {
      transform: scale(0);
      opacity: 0.5;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  @keyframes shine {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .progress-button-ripple {
    animation: ripple 0.6s ease-out forwards;
  }

  .progress-button-shine {
    animation: shine 1.5s ease-in-out infinite;
  }

  .progress-button-stripe {
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: 20px 20px;
  }
`;
document.head.appendChild(styleElement);

const ProgressButton = ({
  children,
  onClick,
  loading = false,
  progress = 0,
  success = false,
  disabled = false,
  variant = 'default',
  size = 'default',
  className = '',
  downloadUrl = null,
  downloadFilename = '',
  showDownloadOnSuccess = true,
  stripeEffect = true,
  rippleEffect = true,
  showPercentage = true,
  showSuccessIcon = true,
  successMessage = 'Complete!',
  loadingText = 'Processing...',
  onDownloadComplete = null,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

  // Determine button color based on variant
  const getVariantClasses = () => {
    const variants = {
      default: 'from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
      success: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
      orange: 'from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700',
      purple: 'from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700',
      teal: 'from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700',
      violet: 'from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700',
      rose: 'from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700',
      amber: 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
      indigo: 'from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700',
    };
    return variants[variant] || variants.default;
  };

  // Handle download functionality
  const handleDownload = () => {
    if (downloadUrl && downloadFilename) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Call the download complete callback if provided
      if (onDownloadComplete && typeof onDownloadComplete === 'function') {
        setTimeout(onDownloadComplete, 100);
      }
    }
  };

  // Create ripple effect
  const createRipple = (e) => {
    if (!rippleEffect || disabled || loading || (success && showDownloadOnSuccess && downloadUrl)) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size: Math.max(rect.width, rect.height) * 2,
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  // Determine button content based on state
  const getButtonContent = () => {
    if (success && showDownloadOnSuccess) {
      return (
        <>
          <Download className="w-4 h-4 mr-2" />
          <span>Download</span>
        </>
      );
    }

    if (success) {
      return (
        <>
          {showSuccessIcon && <Check className="w-4 h-4 mr-2" />}
          <span>{successMessage}</span>
        </>
      );
    }

    if (loading) {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>{loadingText}</span>
          {showPercentage && progress >= 0 && progress <= 100 && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-sm font-medium">
              {progress}%
            </span>
          )}
        </>
      );
    }

    if (success) {
      return (
        <>
          {showSuccessIcon && <Check className="w-4 h-4 mr-2" />}
          <span>{successMessage}</span>
          {showPercentage && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-sm font-medium">
              100%
            </span>
          )}
        </>
      );
    }

    return children;
  };

  // Get progress bar width
  const getProgressWidth = () => {
    if (success) return '100%';
    return `${progress}%`;
  };

  // Get progress bar color
  const getProgressColor = () => {
    if (success) return 'bg-green-500';
    return 'bg-white/40';
  };

  return (
    <div className="relative w-full">
      <Button
        ref={buttonRef}
        onClick={(e) => {
          createRipple(e);
          
          // If success with download available, handle download instead of onClick
          if (success && showDownloadOnSuccess && downloadUrl) {
            handleDownload();
            return;
          }
          
          if (!loading && onClick) {
            // If success but no download available, don't trigger onClick
            if (success && !showDownloadOnSuccess && !downloadUrl) {
              return;
            }
            onClick(e);
          }
        }}
        disabled={disabled || (success && !showDownloadOnSuccess && !downloadUrl)}
        size={size}
        className={cn(
          'relative overflow-hidden w-full',
          'bg-gradient-to-r transition-all duration-300',
          getVariantClasses(),
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transform active:scale-[0.98]',
          className
        )}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute pointer-events-none progress-button-ripple rounded-full bg-white/30"
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        ))}

        {/* Progress bar overlay */}
        {(loading || success) && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-start">
            <div
              className={cn(
                'h-full transition-all duration-300 ease-out',
                getProgressColor(),
                stripeEffect && !success && 'progress-button-stripe'
              )}
              style={{ width: getProgressWidth() }}
            />
          </div>
        )}

        {/* Animated shine effect */}
        {isHovered && !loading && !success && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent progress-button-shine" />
          </div>
        )}

        {/* Button content */}
        <span className={cn(
          'relative z-10 flex items-center justify-center w-full',
          'transition-all duration-200'
        )}>
          {getButtonContent()}
        </span>

        {/* Sparkle effect on success */}
        {success && showSuccessIcon && (
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Sparkles className="w-full h-full text-white/20 animate-pulse" />
          </span>
        )}
      </Button>

      {/* Download progress indicator */}
      {success && showDownloadOnSuccess && (
        <div className="mt-2 flex items-center justify-center text-sm text-green-600 animate-bounce">
          <Check className="w-4 h-4 mr-1" />
          <span>Ready to download!</span>
        </div>
      )}
    </div>
  );
};

export default ProgressButton;

