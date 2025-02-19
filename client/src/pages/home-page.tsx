import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import StoryGeneratorForm from "@/components/story-generator-form";
import StoryDisplay from "@/components/story-display";
import { useQuery } from "@tanstack/react-query";
import { Story } from "@shared/schema";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { data: stories } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Game Story Generator
          </h1>
          <div className="flex items-center gap-4">
            <span>Credits: {user?.storyCredits}</span>
            <Button
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
