/**
 * 🤖 AI Operation Panel Component
 * 
 * Smart operation detection and suggestions panel
 * that appears when files are dropped.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Zap, FileText, Image, Lock, Unlock, Merge, Split, Archive, Search, Scan, RefreshCw, ChevronDown, ChevronUp, Check, AlertCircle } from 'lucide-react';
import { detectSmartOperation, getOperationDisplayName, getOperationIcon } from '../utils/aiSmartDetection';
import { analyzeCompressionPotential, getCompressionRecommendation } from '../utils/aiCompression';
import { detectLanguage, getLanguageName } from '../utils/aiLanguageDetection';
import { getAIWatermarkRecommendation } from '../utils/aiSmartWatermark';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function AIOperationPanel({ file, onOperationSelect, className }) {
  const [detectionResult, setDetectionResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (file) {
      performDetection();
    }
  }, [file]);

  const performDetection = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await detectSmartOperation(file);
      setDetectionResult(result);
    } catch (err) {
      setError('Failed to analyze file');
      console.error('Detection error:', err);
    } finally {
      setLoading(false);
    }
  }, [file]);

  if (!file) return null;

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBg = (confidence) => {
    if (confidence >= 0.9) return 'bg-green-100';
    if (confidence >= 0.7) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <Card className={cn("w-full", className)}>
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <CardTitle className="text-lg">AI Smart Detection</CardTitle>
                <Badge variant="secondary" className="ml-2">
                  {file?.name?.split('.').pop()?.toUpperCase() || 'FILE'}
                </Badge>
              </div>
              {expanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-red-600 p-4 bg-red-50 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={performDetection}
                  className="ml-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Retry
                </Button>
              </div>
            ) : detectionResult ? (
              <>
                {/* File Info */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                    <span className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-600">Detected type:</span>
                    <Badge variant="outline">
                      {detectionResult.detection?.type?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                    <span className={cn("text-xs", getConfidenceColor(detectionResult.detection?.confidence))}>
                      {Math.round((detectionResult.detection?.confidence || 0) * 100)}% confidence
                    </span>
                  </div>
                </div>

                {/* Recommended Operation */}
                {detectionResult.recommendedOperation && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-purple-900">Recommended Operation</span>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{getOperationIcon(detectionResult.recommendedOperation.operation)}</span>
                      <div className="flex-1">
                        <div className="font-medium">
                          {getOperationDisplayName(detectionResult.recommendedOperation.operation)}
                        </div>
                        <div className="text-sm text-gray-600">{detectionResult.recommendedOperation.reason}</div>
                      </div>
                      <div className={cn("px-3 py-1 rounded-full text-sm font-medium", getConfidenceBg(detectionResult.recommendedOperation.confidence))}>
                        {Math.round(detectionResult.recommendedOperation.confidence * 100)}%
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => onOperationSelect?.(detectionResult.recommendedOperation.operation)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Apply Recommended Operation
                    </Button>
                  </div>
                )}

                {/* All Suggestions */}
                {detectionResult.suggestions?.length > 1 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Other Options</h4>
                    <div className="space-y-2">
                      {detectionResult.suggestions.slice(1, 4).map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => onOperationSelect?.(suggestion.operation)}
                          className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <span className="text-xl">{getOperationIcon(suggestion.operation)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {getOperationDisplayName(suggestion.operation)}
                            </div>
                            <div className="text-xs text-gray-500 truncate">{suggestion.reason}</div>
                          </div>
                          <Badge variant="secondary" className={getConfidenceBg(suggestion.confidence)}>
                            {Math.round(suggestion.confidence * 100)}%
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Processing Time */}
                {detectionResult.processingTime && (
                  <div className="text-xs text-gray-400 text-center">
                    Analysis completed in {detectionResult.processingTime}ms
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No suggestions available
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default AIOperationPanel;

