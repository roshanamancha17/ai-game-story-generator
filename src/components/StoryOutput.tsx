
import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface StoryOutputProps {
  title: string;
  content: string;
  genres: string[];
  onRegenerateClick: () => void;
  isLoading: boolean;
  className?: string;
}

const StoryOutput: React.FC<StoryOutputProps> = ({
  title,
  content,
  genres,
  onRegenerateClick,
  isLoading,
  className
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopyClick = () => {
    if (content) {
      navigator.clipboard.writeText(`${title}\n\n${content}`);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "The story has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadClick = () => {
    if (content) {
      const element = document.createElement("a");
      const file = new Blob([`${title}\n\n${content}`], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast({
        title: "Story downloaded",
        description: "Your story has been downloaded as a text file.",
      });
    }
  };

  // Parse the structured content
  const renderStructuredContent = () => {
    if (!content) return null;
    
    // Split content by section headers (lines starting with #)
    const sections = content.split(/^#\s+/m).filter(Boolean);
    
    return sections.map((section, index) => {
      const [sectionTitle, ...sectionContent] = section.trim().split('\n');
      
      return (
        <div key={index} className="mb-8 last:mb-0">
          <h3 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/20">
            {sectionTitle}
          </h3>
          <ul className="space-y-3 list-none">
            {sectionContent.map((point, pointIndex) => (
              <li key={pointIndex} className="ml-0">
                {point.startsWith('• ') ? (
                  <div className="flex group hover:bg-muted/50 p-2 rounded-md transition-colors">
                    <span className="text-primary mr-2 font-bold">•</span>
                    <span className="text-foreground/90">{point.substring(2)}</span>
                  </div>
                ) : (
                  <div className="hover:bg-muted/50 p-2 rounded-md transition-colors">
                    {point}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      );
    });
  };

  return (
    <Card className={cn(
      "w-full overflow-hidden transition-all animate-fade-in border-2", 
      "shadow-lg hover:shadow-xl transition-shadow duration-300",
      isLoading ? "border-muted" : "border-primary/20",
      className
    )}>
      <CardHeader className="pb-3 bg-muted/30">
        <CardTitle className="text-2xl font-semibold tracking-tight leading-tight">
          {isLoading ? (
            <div className="h-8 w-3/4 bg-muted animate-pulse rounded"></div>
          ) : (
            <span className="text-gradient-primary">{title}</span>
          )}
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {isLoading ? (
            <>
              <div className="h-6 w-16 bg-muted animate-pulse rounded-full"></div>
              <div className="h-6 w-20 bg-muted animate-pulse rounded-full"></div>
            </>
          ) : (
            genres.map(genre => (
              <Badge 
                key={genre} 
                variant="secondary" 
                className="transition-all hover:bg-primary hover:text-primary-foreground"
              >
                {genre}
              </Badge>
            ))
          )}
        </div>
      </CardHeader>
      <Separator />
      <CardContent 
        ref={contentRef}
        className="pt-6 pb-4 max-h-[60vh] overflow-y-auto pr-6 pl-6"
      >
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-5 bg-muted animate-pulse rounded w-full"></div>
            <div className="h-5 bg-muted animate-pulse rounded w-5/6"></div>
            <div className="h-5 bg-muted animate-pulse rounded w-full"></div>
            <div className="h-5 bg-muted animate-pulse rounded w-4/5"></div>
          </div>
        ) : (
          <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none">
            {renderStructuredContent()}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2 pb-4 bg-muted/30 border-t border-border">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRegenerateClick}
          disabled={isLoading}
          className="hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerate
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopyClick}
            disabled={isLoading || !content}
            className="hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadClick}
            disabled={isLoading || !content}
            className="hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default StoryOutput;
