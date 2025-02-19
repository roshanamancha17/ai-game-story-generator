import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import StoryGeneratorForm from "@/components/story-generator-form";
import IdeaGeneratorForm from "@/components/idea-generator-form";
import StoryDisplay from "@/components/story-display";
import { useQuery } from "@tanstack/react-query";
import { Story } from "@shared/schema";
import { LogOut, GamepadIcon, Sparkles, BookText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [generatedIdea, setGeneratedIdea] = useState<any>(null);

  const { data: stories } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  const handleIdeaGenerated = (idea: any) => {
    setGeneratedIdea(idea);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GamepadIcon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Game Story Generator
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.username}</span>
            <Button variant="ghost" size="sm" onClick={() => logoutMutation.mutate()}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="story" className="space-y-8">
          <TabsList className="grid w-[400px] grid-cols-2 mx-auto bg-white shadow-sm">
            <TabsTrigger value="story" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookText className="h-4 w-4 mr-2" />
              Generate Story
            </TabsTrigger>
            <TabsTrigger value="idea" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate from Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="story" className="space-y-6">
            <div className="grid gap-8 lg:grid-cols-[1fr,1fr]">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">Generate New Story</h2>
                  <p className="text-muted-foreground">
                    Create a unique game story by filling out the form below.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <StoryGeneratorForm />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">Your Stories</h2>
                  <p className="text-muted-foreground">
                    Browse through your previously generated game stories.
                  </p>
                </div>
                <div className="space-y-4">
                  {stories?.map((story) => (
                    <StoryDisplay key={story.id} story={story} />
                  ))}
                  {stories?.length === 0 && (
                    <div className="text-center p-8 rounded-lg bg-white shadow-sm border">
                      <BookText className="h-12 w-12 mx-auto mb-4 text-primary/20" />
                      <p className="text-muted-foreground">No stories generated yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="idea" className="space-y-6">
            <div className="grid gap-8 lg:grid-cols-[1fr,1fr]">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">Generate from Description</h2>
                  <p className="text-muted-foreground">
                    Describe your game idea and we'll help structure it into a proper game concept.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <IdeaGeneratorForm onIdeaGenerated={handleIdeaGenerated} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">Generated Concept</h2>
                  <p className="text-muted-foreground">
                    Your generated game concept will appear here.
                  </p>
                </div>
                {generatedIdea ? (
                  <div className="space-y-6 p-6 rounded-lg bg-white shadow-sm border">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{generatedIdea.gameTitle}</h3>
                      <div className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold">
                        {generatedIdea.genre}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground">Main Character</h4>
                        <p className="text-sm">{generatedIdea.mainCharacter}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground">Concept</h4>
                        <p className="text-sm">{generatedIdea.conceptDescription}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        setGeneratedIdea(null);
                        const tab = document.querySelector('[data-value="story"]') as HTMLElement;
                        if (tab) tab.click();
                      }}
                      className="w-full"
                      variant="secondary"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Use This Concept
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-8 rounded-lg bg-white shadow-sm border">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary/20" />
                    <p className="text-muted-foreground">
                      Enter a description to generate a game concept.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}