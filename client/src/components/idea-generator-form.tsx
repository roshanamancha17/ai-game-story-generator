import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  description: z.string().min(1, "Description is required").max(500, "Description too long")
});

interface IdeaGeneratorFormProps {
  onIdeaGenerated: (idea: any) => void;
}

export default function IdeaGeneratorForm({ onIdeaGenerated }: IdeaGeneratorFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: ""
    }
  });

  const generateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/generate-idea", values);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Idea generated!",
        description: "Your game concept has been created successfully."
      });
      onIdeaGenerated(data);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate idea",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => generateMutation.mutate(data))} className="space-y-4">
        {generateMutation.error && (
          <Alert variant="destructive">
            <AlertDescription>
              {generateMutation.error.message}
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Describe Your Game Idea</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your game concept in a few sentences..." 
                  className="h-32"
                  {...field} 
                  disabled={generateMutation.isPending}
                />
              </FormControl>
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
              Generating Idea...
            </>
          ) : (
            'Generate Game Concept'
          )}
        </Button>
      </form>
    </Form>
  );
}
