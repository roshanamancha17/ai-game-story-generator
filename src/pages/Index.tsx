import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { GENRES, generateStory } from "@/lib/story-data";
import GenreSelector from "@/components/GenreSelector";
import StoryPrompt from "@/components/StoryPrompt";
import StoryOutput from "@/components/StoryOutput";
import Nav from "@/components/Nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Info } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("setup");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string>("");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedStory, setGeneratedStory] = useState<{
    title: string;
    content: string;
  } | null>(null);

  const handleGenreSelect = (genreId: string) => {
    setSelectedGenres(prevGenres => {
      if (prevGenres.includes(genreId)) {
        return prevGenres.filter(id => id !== genreId);
      } else {
        if (prevGenres.length >= 3) {
          toast({
            title: "Maximum genres selected",
            description: "You can select up to 3 genres for your story.",
            variant: "destructive",
          });
          return prevGenres;
        }
        return [...prevGenres, genreId];
      }
    });
  };

  const handleGenerateStory = async () => {
    if (selectedGenres.length === 0) {
      toast({
        title: "No genres selected",
        description: "Please select at least one genre for your story.",
        variant: "destructive",
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt for your story.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const story = await generateStory(selectedGenres, prompt, additionalNotes);
      setGeneratedStory(story);
      setActiveTab("result");
      toast({
        title: "Story generated!",
        description: "Your unique game story has been created.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "There was a problem generating your story. Please try again.",
        variant: "destructive",
      });
      console.error("Story generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateStory = () => {
    handleGenerateStory();
  };

  const getGenreNames = () => {
    return selectedGenres.map(id => {
      const genre = GENRES.find(g => g.id === id);
      return genre ? genre.name : "";
    }).filter(Boolean);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Nav />
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col items-center text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Game Story Generator</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Create unique and immersive game narratives with AI assistance. 
            Select genres, provide a concept, and watch your story unfold.
          </p>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full max-w-4xl mx-auto"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="setup" disabled={isGenerating}>Setup Story</TabsTrigger>
            <TabsTrigger 
              value="result" 
              disabled={!generatedStory || isGenerating}
            >
              View Result
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="setup" className="animate-fade-in">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">1. Select Genres (up to 3)</h2>
                <GenreSelector 
                  genres={GENRES}
                  selectedGenres={selectedGenres}
                  onGenreSelect={handleGenreSelect}
                />
                
                <Separator className="my-6" />
                
                <h2 className="text-xl font-semibold mb-4">2. Describe Your Story Concept</h2>
                <StoryPrompt 
                  prompt={prompt}
                  setPrompt={setPrompt}
                  additionalNotes={additionalNotes}
                  setAdditionalNotes={setAdditionalNotes}
                  onGenerate={handleGenerateStory}
                  isGenerating={isGenerating}
                />
                
                <div className="mt-6 rounded-lg bg-muted/50 p-4 flex items-start gap-3">
                  <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    For best results, be specific with your concept. Include details about the setting, main character archetype, or key conflict.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="result" className="animate-fade-in">
            {generatedStory ? (
              <StoryOutput 
                title={generatedStory.title}
                content={generatedStory.content}
                genres={getGenreNames()}
                onRegenerateClick={handleRegenerateStory}
                isLoading={isGenerating}
              />
            ) : (
              <div className="text-center py-12">
                <p>Generate a story first to see results</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="py-6 border-t">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground">
          <p>StoryForge AI - Create immersive game narratives with ease.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
