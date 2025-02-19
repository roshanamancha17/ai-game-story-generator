import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import StoryGeneratorForm from "@/components/story-generator-form";
import IdeaGeneratorForm from "@/components/idea-generator-form";
import StoryDisplay from "@/components/story-display";
import { useQuery } from "@tanstack/react-query";
import { Story } from "@shared/schema";
import { LogOut } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Game Story Generator</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.username}</span>
            <Button variant="ghost" size="sm" onClick={() => logoutMutation.mutate()}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="story" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="story">Generate Story</TabsTrigger>
            <TabsTrigger value="idea">Generate from Text</TabsTrigger>
          </TabsList>

          <TabsContent value="story" className="space-y-6">
            <div className="grid gap-8 md:grid-cols-[1fr,1fr]">
              <div>
                <h2 className="text-xl font-semibold mb-4">Generate New Story</h2>
                <StoryGeneratorForm />
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Your Stories</h2>
                <div className="space-y-4">
                  {stories?.map((story) => (
                    <StoryDisplay key={story.id} story={story} />
                  ))}
                  {stories?.length === 0 && (
                    <p className="text-muted-foreground">No stories generated yet.</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="idea" className="space-y-6">
            <div className="grid gap-8 md:grid-cols-[1fr,1fr]">
              <div>
                <h2 className="text-xl font-semibold mb-4">Generate from Description</h2>
                <IdeaGeneratorForm onIdeaGenerated={handleIdeaGenerated} />
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Generated Concept</h2>
                {generatedIdea ? (
                  <div className="space-y-4 p-6 rounded-lg border bg-card">
                    <div>
                      <h3 className="font-semibold text-lg">{generatedIdea.gameTitle}</h3>
                      <p className="text-sm text-muted-foreground">Genre: {generatedIdea.genre}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Main Character</h4>
                      <p className="text-sm text-muted-foreground">{generatedIdea.mainCharacter}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Concept</h4>
                      <p className="text-sm text-muted-foreground">{generatedIdea.conceptDescription}</p>
                    </div>
                    <Button 
                      onClick={() => {
                        setGeneratedIdea(null);
                        const tab = document.querySelector('[data-value="story"]') as HTMLElement;
                        if (tab) tab.click();
                      }}
                      className="w-full"
                    >
                      Use This Concept
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Enter a description of your game idea and we'll help structure it into a proper game concept.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}