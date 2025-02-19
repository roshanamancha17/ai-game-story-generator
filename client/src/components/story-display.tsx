import { Story } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface StoryDisplayProps {
  story: Story;
}

export default function StoryDisplay({ story }: StoryDisplayProps) {
  const content = story.content as {
    introduction: string;
    mainQuest: string;
    sideQuests: string[];
    characters: { name: string; description: string }[];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{story.title}</CardTitle>
          <Badge>{story.genre}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          <AccordionItem value="intro">
            <AccordionTrigger>Introduction</AccordionTrigger>
            <AccordionContent>{content.introduction}</AccordionContent>
          </AccordionItem>

          <AccordionItem value="main-quest">
            <AccordionTrigger>Main Quest</AccordionTrigger>
            <AccordionContent>{content.mainQuest}</AccordionContent>
          </AccordionItem>

          <AccordionItem value="side-quests">
            <AccordionTrigger>Side Quests</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-4 space-y-2">
                {content.sideQuests.map((quest, index) => (
                  <li key={index}>{quest}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="characters">
            <AccordionTrigger>Characters</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {content.characters.map((character, index) => (
                  <div key={index}>
                    <h4 className="font-semibold">{character.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {character.description}
                    </p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
