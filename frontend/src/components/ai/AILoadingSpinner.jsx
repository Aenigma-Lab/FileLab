/**
 * 🤖 AI Loading Spinner Component
 * 
 * Animated brain/neural network loading indicator
 * for AI-powered operations.
 */

import React from 'react';
import { Sparkles, Brain, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AILoadingSpinner({ 
  size = 'md', 
  variant = 'brain', 
  text = 'AI is thinking...', 
  showText = true,
  className 
}) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        {/* Brain/CPU Icon */}
        {variant === 'brain' && (
          <Brain className={cn("w-full h-full text-purple-600 animate-pulse", sizeClasses[size])} />
        )}
        {variant === 'cpu' && (
          <Cpu className={cn("w-full h-full text-blue-600 animate-pulse", sizeClasses[size])} />
        )}
        {variant === 'sparkles' && (
          <Sparkles className={cn("w-full h-full text-yellow-500 animate-spin", sizeClasses[size])} />
        )}
        
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 bg-purple-500 rounded-full" />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2 h-2 bg-blue-500 rounded-full" />
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-xl rounded-full animate-pulse" />
      </div>
      
      {showText && (
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
          <span className={cn("text-gray-600 font-medium", textSizes[size])}>
            {text}
          </span>
          <span className="flex gap-1">
            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        </div>
      )}
    </div>
  );
}

export function AILoadingOverlay({ loading, text = 'AI is analyzing...', children }) {
  if (!loading) return children;

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
        <AILoadingSpinner text={text} size="lg" />
      </div>
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
    </div>
  );
}

export function AIProgressBar({ progress, label, showPercentage = true }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {label && (
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-500" />
            {label}
          </span>
        )}
        {showPercentage && (
          <span className="text-sm font-medium text-purple-600">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* Animated particles */}
      <div 
        className="h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse"
        style={{ width: `${progress}%`, marginTop: '-8px' }}
      />
    </div>
  );
}

export default AILoadingSpinner;

