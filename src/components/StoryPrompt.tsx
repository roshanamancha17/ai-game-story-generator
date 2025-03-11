
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoryPromptProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  additionalNotes: string;
  setAdditionalNotes: (notes: string) => void;
  className?: string;
}

const StoryPrompt: React.FC<StoryPromptProps> = ({
  prompt,
  setPrompt,
  onGenerate,
  isGenerating,
  additionalNotes,
  setAdditionalNotes,
  className,
}) => {
  return (
    <div className={cn("space-y-4 animate-fade-in", className)}>
      <div className="space-y-2">
        <Label htmlFor="prompt">Main Concept</Label>
        <Input
          id="prompt"
          placeholder="A hero's journey in a cyberpunk world..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="transition-all duration-200"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Include unique characters, specific themes, or plot elements..."
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          className="min-h-24 transition-all duration-200"
        />
      </div>
      
      <Button 
        onClick={onGenerate} 
        disabled={isGenerating || !prompt.trim()} 
        className="w-full"
      >
        {isGenerating ? (
          <>
            <span className="animate-pulse">Generating</span>
            <Wand2 className="ml-2 h-4 w-4 animate-pulse" />
          </>
        ) : (
          <>
            Generate Story
            <Wand2 className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};

export default StoryPrompt;
