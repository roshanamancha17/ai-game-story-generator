import { Story } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

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
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{content.title}</span>
          <span className="text-sm text-muted-foreground">
            {format(new Date(story.createdAt), "MMM d, yyyy")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Introduction</h3>
              <p className="text-sm text-muted-foreground">{content.introduction}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Main Quest</h3>
              <p className="text-sm text-muted-foreground">{content.mainQuest}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Side Quests</h3>
              <ul className="list-disc pl-4 text-sm text-muted-foreground">
                {content.sideQuests.map((quest, index) => (
                  <li key={index}>{quest}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Characters</h3>
              <div className="space-y-2">
                {content.characters.map((character, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{character.name}</span>
                    <span className="text-muted-foreground"> - {character.role}</span>
                    <p className="text-muted-foreground">{character.description}</p>
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
