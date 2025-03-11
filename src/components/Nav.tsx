
import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkles, Github } from "lucide-react";

interface NavProps {
  className?: string;
}

const Nav: React.FC<NavProps> = ({ className }) => {
  return (
    <header className={cn("py-4 px-4 sm:px-6 w-full", className)}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2 animate-slide-down">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-medium tracking-tighter">StoryForge AI</h1>
        </div>
        
        <div className="flex items-center space-x-3 animate-slide-down">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </a>
          <Button size="sm" variant="outline">
            About
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Nav;
