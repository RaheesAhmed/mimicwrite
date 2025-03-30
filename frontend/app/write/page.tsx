"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import WriterForm from "./components/WriterForm";
import StyleAnalysis from "./components/StyleAnalysis";
import WriterResult from "./components/WriterResult";
import { Sparkles, PenLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WritingAnalysis {
  tone?: string;
  formality?: string;
  confidence?: number;
  vocab_level?: string;
  avg_sentence_length?: number;
  sample?: string;
}

interface GenerationResponse {
  content: string;
  analysis: WritingAnalysis;
}

export default function WritePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [analysis, setAnalysis] = useState<WritingAnalysis | null>(null);
  
  // For streaming
  const [isStreaming, setIsStreaming] = useState(false);
  const streamRef = useRef<EventSource | null>(null);
  
  const [formData, setFormData] = useState({
    job: "",
    writingSample: "",
    prompt: "",
    contentType: "article",
    contentLength: "medium",
    tone: "auto",
  });

  // Cleanup function for SSE
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.close();
      }
    };
  }, []);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStreamResponse = async () => {
    setIsStreaming(true);
    setGeneratedContent("");
    setError(null);
    
    if (streamRef.current) {
      streamRef.current.close();
    }
    
    try {
      // First get the analysis
      const analysisResponse = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_info: { job: formData.job },
          writing_sample: formData.writingSample,
          prompt: formData.prompt,
          content_type: formData.contentType,
          content_length: formData.contentLength,
          preferred_tone: formData.tone && formData.tone !== 'auto' ? formData.tone : undefined,
        }),
      });
      
      if (!analysisResponse.ok) {
        throw new Error("Failed to get writing analysis");
      }
      
      const analysisData: GenerationResponse = await analysisResponse.json();
      setAnalysis(analysisData.analysis);
      
      // Set up SSE for streaming content with all parameters
      const params = new URLSearchParams({
        user_info__job: formData.job,
        writing_sample: formData.writingSample,
        prompt: formData.prompt,
        content_type: formData.contentType,
        content_length: formData.contentLength,
      });
      
      // Only add tone if specified and not 'auto'
      if (formData.tone && formData.tone !== 'auto') {
        params.append("preferred_tone", formData.tone);
      }
      
      const eventSource = new EventSource(`http://localhost:8000/generate/stream?${params.toString()}`);
      
      streamRef.current = eventSource;
      
      eventSource.onmessage = (event) => {
        if (event.data === "[DONE]") {
          eventSource.close();
          setIsStreaming(false);
          return;
        }
        
        if (event.data.startsWith("error:")) {
          setError(event.data.substring(7));
          eventSource.close();
          setIsStreaming(false);
          return;
        }
        
        setGeneratedContent(prev => prev + event.data);
      };
      
      eventSource.onerror = () => {
        setError("Connection error. Please try again.");
        eventSource.close();
        setIsStreaming(false);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setIsStreaming(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use streaming approach if the browser supports it
    if (typeof EventSource !== "undefined") {
      handleStreamResponse();
      return;
    }
    
    // Fallback to non-streaming approach
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_info: {
            job: formData.job,
          },
          writing_sample: formData.writingSample,
          prompt: formData.prompt,
          content_type: formData.contentType,
          content_length: formData.contentLength,
          preferred_tone: formData.tone && formData.tone !== 'auto' ? formData.tone : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to generate content");
      }

      const data: GenerationResponse = await response.json();
      setGeneratedContent(data.content);
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Empty state component for the output panel
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-5 py-20">
      <div className="rounded-full bg-blue-50 p-5 dark:bg-blue-950/30">
        <PenLine className="h-10 w-10 text-blue-500" />
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-medium">Your content will appear here</h3>
        <p className="text-muted-foreground leading-relaxed">
          Fill out the form with your writing sample and prompt to generate content that matches your style.
        </p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8">
      {/* Header with subtle gradient background */}
      <div className="mb-10 relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-8">
        <div className="absolute top-0 right-0 opacity-30 rotate-12 translate-x-1/4 -translate-y-1/4">
          <Sparkles className="h-44 w-44 text-blue-500/30" strokeWidth={0.5} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Writing Tool</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Mimic Write</h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Generate human-like content matched perfectly to your writing style and voice
          </p>
        </div>
      </div>
      
      {/* Main content area with shadow effect */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left column: Form with glass-like effect */}
        <div>
          <Card className="overflow-hidden backdrop-blur bg-white/80 dark:bg-black/20 border-0 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
            <CardContent className="p-6">
              <WriterForm 
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                isStreaming={isStreaming}
                error={error}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Right column: Output with results or empty state */}
        <div className="space-y-6">
          {analysis && analysis.tone && (
            <div className="animate-fade-in">
              <StyleAnalysis toneAnalysis={analysis} />
            </div>
          )}
          
          <Card className="overflow-hidden backdrop-blur border-0 shadow-xl min-h-[500px] ring-1 ring-black/5 dark:ring-white/10 flex flex-col">
            <CardContent className="flex-grow p-0">
              {generatedContent ? (
                <div className="p-6">
                  <WriterResult 
                    generatedContent={generatedContent}
                    isStreaming={isStreaming}
                  />
                </div>
              ) : (
                <EmptyState />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
