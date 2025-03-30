"use client";

import { useState } from "react";
import { Copy, Check, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import RichTextEditor from "./RichTextEditor";

interface WriterResultProps {
  generatedContent: string;
  isStreaming: boolean;
}

export default function WriterResult({ 
  generatedContent, 
  isStreaming 
}: WriterResultProps) {
  const [copied, setCopied] = useState(false);

  if (!generatedContent) return null;
  
  const handleCopy = () => {
    const parser = new DOMParser();
    // If content has HTML tags, parse them
    let plainText = generatedContent;
    
    if (generatedContent.includes('<')) {
      const doc = parser.parseFromString(generatedContent, 'text/html');
      plainText = doc.body.textContent || '';
    }
    
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <h3 className="text-lg font-medium">Generated Content</h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopy}
            className="h-9 rounded-lg gap-1.5 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 rounded-lg gap-1.5 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          >
            <Share className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
        <RichTextEditor 
          content={generatedContent} 
          isStreaming={isStreaming}
          onCopy={handleCopy}
        />
      </div>
    </div>
  );
} 