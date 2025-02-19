import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStorySchema, InsertStory } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const genres = [
  "Fantasy",
  "Sci-Fi",
  "Horror",
  "Mystery",
  "RPG/Open-World"
] as const;

const storyLengths = [
  "Short",
  "Medium",
  "Long"
] as const;

export default function StoryGeneratorForm() {
  const { toast } = useToast();
  const form = useForm<InsertStory>({
    resolver: zodResolver(insertStorySchema),
    defaultValues: {
      title: "",
      genre: "Fantasy",
      mainCharacter: "",
      storyLength: "Medium",
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: InsertStory) => {
      const res = await apiRequest("POST", "/api/generate-story", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      form.reset();
      toast({
        title: "Story generated successfully",
        description: "Check your stories list to view it",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate story",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => generateMutation.mutate(data))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Story Title</FormLabel>
              <FormControl>
                <Input {...field} disabled={generateMutation.isPending} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="genre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genre</FormLabel>
              <Select
                disabled={generateMutation.isPending}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mainCharacter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Main Character Description</FormLabel>
              <FormControl>
                <Input {...field} disabled={generateMutation.isPending} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="storyLength"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Story Length</FormLabel>
              <Select
                disabled={generateMutation.isPending}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {storyLengths.map((length) => (
                    <SelectItem key={length} value={length}>
                      {length}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Generate Story
        </Button>
      </form>
    </Form>
  );
}
