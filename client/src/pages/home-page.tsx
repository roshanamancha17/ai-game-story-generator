import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import StoryGeneratorForm from "@/components/story-generator-form";
import StoryDisplay from "@/components/story-display";
import { useQuery } from "@tanstack/react-query";
import { Story } from "@shared/schema";
import { LogOut } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  const { data: stories } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

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
      </main>
    </div>
  );
}
