import { Story } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { BookOpen, Users, Crosshair, Map } from "lucide-react";

interface StoryDisplayProps {
  story: Story;
}

export default function StoryDisplay({ story }: StoryDisplayProps) {
  const content = story.content as {
    title: string;
    introduction: string;
    mainQuest: string;
    sideQuests: string[];
    characters: Array<{
      name: string;
      role: string;
      description: string;
    }>;
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md bg-white">
      <CardHeader className="bg-primary/5 border-b">
        <CardTitle className="flex justify-between items-center">
          <span className="text-lg font-semibold">{content.title}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(story.createdAt), "MMM d, yyyy")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <BookOpen className="h-4 w-4" />
                <h3 className="font-semibold">Introduction</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {content.introduction}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Crosshair className="h-4 w-4" />
                <h3 className="font-semibold">Main Quest</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {content.mainQuest}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Map className="h-4 w-4" />
                <h3 className="font-semibold">Side Quests</h3>
              </div>
              <ul className="list-disc pl-5 space-y-2">
                {content.sideQuests.map((quest, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {quest}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Users className="h-4 w-4" />
                <h3 className="font-semibold">Characters</h3>
              </div>
              <div className="grid gap-4">
                {content.characters.map((character, index) => (
                  <div key={index} className="space-y-1 p-3 rounded-lg bg-primary/5">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm">{character.name}</span>
                      <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {character.role}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {character.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}