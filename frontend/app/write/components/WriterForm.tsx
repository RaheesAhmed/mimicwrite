"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WriterFormProps {
  formData: {
    job: string;
    writingSample: string;
    prompt: string;
    contentType: string;
    contentLength: string;
    tone: string;
  };
  onChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
}

export default function WriterForm({
  formData,
  onChange,
  onSubmit,
  isLoading,
  isStreaming,
  error
}: WriterFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      <div className="space-y-3">
        <label htmlFor="job" className="text-sm font-medium">
          What's your profession?
        </label>
        <Input
          id="job"
          name="job"
          value={formData.job}
          onChange={handleInputChange}
          placeholder="e.g., Software Engineer, Marketer, Writer"
          className="h-12 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none bg-white dark:bg-slate-900"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <label htmlFor="contentType" className="text-sm font-medium">
            Content Type
          </label>
          <Select
            value={formData.contentType}
            onValueChange={(value) => onChange('contentType', value)}
          >
            <SelectTrigger 
              id="contentType" 
              className="h-12 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none bg-white dark:bg-slate-900"
            >
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="article">Article</SelectItem>
              <SelectItem value="blogPost">Blog Post</SelectItem>
              <SelectItem value="socialPost">Social Media Post</SelectItem>
              <SelectItem value="linkedinPost">LinkedIn Post</SelectItem>
              <SelectItem value="emailNewsletter">Email Newsletter</SelectItem>
              <SelectItem value="productDescription">Product Description</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-3">
          <label htmlFor="contentLength" className="text-sm font-medium">
            Length
          </label>
          <Select
            value={formData.contentLength}
            onValueChange={(value) => onChange('contentLength', value)}
          >
            <SelectTrigger 
              id="contentLength" 
              className="h-12 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none bg-white dark:bg-slate-900"
            >
              <SelectValue placeholder="Select length" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="very_short">Very Short (~100 words)</SelectItem>
              <SelectItem value="short">Short (~200 words)</SelectItem>
              <SelectItem value="medium">Medium (~500 words)</SelectItem>
              <SelectItem value="long">Long (~1000 words)</SelectItem>
              <SelectItem value="very_long">Very Long (1500+ words)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-3">
        <label htmlFor="tone" className="text-sm font-medium flex justify-between">
          <span>Preferred Tone</span>
          <span className="text-xs text-muted-foreground font-normal">Optional</span>
        </label>
        <Select
          value={formData.tone}
          onValueChange={(value) => onChange('tone', value)}
        >
          <SelectTrigger 
            id="tone" 
            className="h-12 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none bg-white dark:bg-slate-900"
          >
            <SelectValue placeholder="Auto-detect from sample" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto-detect from sample</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="casual">Casual & Conversational</SelectItem>
            <SelectItem value="authoritative">Authoritative</SelectItem>
            <SelectItem value="friendly">Friendly & Approachable</SelectItem>
            <SelectItem value="formal">Formal & Academic</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-3">
        <label htmlFor="writingSample" className="text-sm font-medium">
          Your Writing Sample
        </label>
        <Textarea
          id="writingSample"
          name="writingSample"
          value={formData.writingSample}
          onChange={handleInputChange}
          placeholder="Paste a paragraph of your writing to analyze your style"
          className="min-h-28 resize-none rounded-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none bg-white dark:bg-slate-900"
          required
        />
        <p className="text-xs text-muted-foreground">
          This helps us match your tone, vocabulary, and sentence structure
        </p>
      </div>
      
      <div className="space-y-3">
        <label htmlFor="prompt" className="text-sm font-medium">
          What would you like to write about?
        </label>
        <Textarea
          id="prompt"
          name="prompt"
          value={formData.prompt}
          onChange={handleInputChange}
          placeholder="e.g., Write a blog post about artificial intelligence in healthcare"
          className="min-h-20 resize-none rounded-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none bg-white dark:bg-slate-900"
          required
        />
      </div>
      
      <Button 
        type="submit"
        className="w-full h-14 rounded-xl gap-2 text-base font-medium transition-all bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
        disabled={isLoading || isStreaming}
      >
        {isLoading || isStreaming ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{isStreaming ? "Generating..." : "Processing..."}</span>
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            <span>Generate Content</span>
          </>
        )}
      </Button>
      
      {error && (
        <div className="p-4 text-sm rounded-xl bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30">
          {error}
        </div>
      )}
    </form>
  );
} 