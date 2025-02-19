import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { storyGenreSchema, storyLengthSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCallback, useRef } from "react";

const COOLDOWN_PERIOD = 10000; // 10 seconds cooldown between requests

const formSchema = z.object({
  genre: storyGenreSchema,
  gameTitle: z.string().min(1, "Title is required"),
  mainCharacter: z.string().min(1, "Main character description is required"),
  storyLength: storyLengthSchema
});

export default function StoryGeneratorForm() {
  const { toast } = useToast();
  const lastRequestTime = useRef<number>(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      genre: "Fantasy",
      gameTitle: "",
      mainCharacter: "",
      storyLength: "Medium"
    }
  });

  const checkCooldown = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;

    if (timeSinceLastRequest < COOLDOWN_PERIOD) {
      const remainingSeconds = Math.ceil((COOLDOWN_PERIOD - timeSinceLastRequest) / 1000);
      throw new Error(`Please wait ${remainingSeconds} seconds before generating another story.`);
    }
  }, []);

  const generateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      checkCooldown();
      lastRequestTime.current = Date.now();
      const res = await apiRequest("POST", "/api/stories", values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      toast({
        title: "Story generated!",
        description: "Your new story has been created successfully."
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate story",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => generateMutation.mutate(data))} className="space-y-4">
        {generateMutation.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              {generateMutation.error.message}
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="genre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genre</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={generateMutation.isPending}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Fantasy">Fantasy</SelectItem>
                  <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                  <SelectItem value="Horror">Horror</SelectItem>
                  <SelectItem value="Mystery">Mystery</SelectItem>
                  <SelectItem value="RPG">RPG</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gameTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter game title" 
                  {...field} 
                  disabled={generateMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mainCharacter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Main Character</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Describe the main character" 
                  {...field} 
                  disabled={generateMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="storyLength"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Story Length</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={generateMutation.isPending}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Short">Short</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Long">Long</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Story...
            </>
          ) : (
            'Generate Story'
          )}
        </Button>
      </form>
    </Form>
  );
}