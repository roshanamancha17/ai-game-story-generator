
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type Genre = {
  id: string;
  name: string;
  description: string;
};

interface GenreSelectorProps {
  genres: Genre[];
  selectedGenres: string[];
  onGenreSelect: (genreId: string) => void;
}

const GenreSelector: React.FC<GenreSelectorProps> = ({
  genres,
  selectedGenres,
  onGenreSelect,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full animate-fade-in">
      {genres.map((genre) => {
        const isSelected = selectedGenres.includes(genre.id);
        return (
          <Card
            key={genre.id}
            className={cn(
              "cursor-pointer transition-all duration-200 ease-in-out border-2 overflow-hidden",
              isSelected 
                ? "border-primary shadow-md" 
                : "border-transparent hover:border-primary/20"
            )}
            onClick={() => onGenreSelect(genre.id)}
          >
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-lg">{genre.name}</h3>
                {isSelected && (
                  <div className="bg-primary rounded-full p-1 text-primary-foreground animate-fade-in">
                    <Check size={14} />
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{genre.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default GenreSelector;
