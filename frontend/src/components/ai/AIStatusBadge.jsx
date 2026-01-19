/**
 * 🤖 AI Status Badge Component
 * 
 * Badge indicating AI-powered features with
 * confidence scores and status.
 */

import React from 'react';
import { Sparkles, Zap, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function AIStatusBadge({ 
  status = 'active', 
  confidence, 
  size = 'sm',
  showText = true,
  className 
}) {
  const statusConfig = {
    active: {
      icon: Sparkles,
      color: 'bg-purple-100 text-purple-700 border-purple-300',
      label: 'AI Powered',
    },
    processing: {
      icon: Zap,
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      label: 'AI Processing',
    },
    success: {
      icon: CheckCircle,
      color: 'bg-green-100 text-green-700 border-green-300',
      label: 'AI Complete',
    },
    warning: {
      icon: AlertTriangle,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      label: 'AI Low Confidence',
    },
    info: {
      icon: Info,
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      label: 'AI Assisted',
    },
  };

  const config = statusConfig[status] || statusConfig.info;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "inline-flex items-center gap-1.5 border font-medium",
        config.color,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={cn("w-3 h-3", size === 'lg' && "w-4 h-4")} />
      {showText && <span>{config.label}</span>}
      {confidence !== undefined && (
        <span className="ml-1 opacity-75">
          {Math.round(confidence * 100)}%
        </span>
      )}
    </Badge>
  );
}

export function AIConfidenceIndicator({ confidence, showLabel = true, className }) {
  const getColor = () => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBgColor = () => {
    if (confidence >= 0.9) return 'bg-green-500';
    if (confidence >= 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-500", getBgColor())}
          style={{ width: `${confidence * 100}%` }}
        />
      </div>
      <span className={cn("text-sm font-medium", getColor())}>
        {showLabel && <span className="text-gray-500 mr-1">Confidence:</span>}
        {Math.round(confidence * 100)}%
      </span>
    </div>
  );
}

export function AIFeatureTag({ feature, active = false, onClick }) {
  const icons = {
    smart_detection: Sparkles,
    auto_format: Sparkles,
    image_optimization: Sparkles,
    document_ai: Sparkles,
    smart_watermark: Sparkles,
    ocr_enhancement: Sparkles,
    semantic_search: Sparkles,
    file_organization: Sparkles,
    compression: Sparkles,
    language_detection: Sparkles,
  };

  const Icon = icons[feature] || Sparkles;

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all",
        active 
          ? "bg-purple-100 text-purple-700 border border-purple-300"
          : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-purple-50 hover:border-purple-200"
      )}
    >
      <Icon className="w-3 h-3" />
      <span>{feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
    </button>
  );
}

export default AIStatusBadge;

