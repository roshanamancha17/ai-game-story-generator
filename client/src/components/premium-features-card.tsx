import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { FREE_TIER_LIMITS, PREMIUM_TIER_LIMITS } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const PREMIUM_PRICE = 9.99; // Monthly subscription price in USD

export default function PremiumFeaturesCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isPremium = user?.isPremium;

  const createCheckoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/create-checkout");
      return res.json();
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating checkout session",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const features = [
    {
      name: "Story Generations",
      free: `${FREE_TIER_LIMITS.GENERATIONS_PER_DAY} per day`,
      premium: `${PREMIUM_TIER_LIMITS.GENERATIONS_PER_DAY} per day`
    },
    {
      name: "Story Length",
      free: "Short and Medium",
      premium: "All lengths including Long stories"
    },
    {
      name: "Gameplay Details",
      free: "Basic mechanics",
      premium: "Detailed mechanics & systems"
    },
    {
      name: "World Building",
      free: "Basic world information",
      premium: "Advanced lore & world details"
    },
    {
      name: "Prompt Improvement",
      free: "Basic refinement",
      premium: "AI-powered refinement"
    }
  ];

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Premium Features
        </CardTitle>
        <CardDescription>
          {isPremium ? "You have access to all premium features" : "Upgrade to unlock premium features"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="font-medium">Feature</div>
            <div className="font-medium">Free Tier</div>
            <div className="font-medium text-primary">Premium Tier</div>
          </div>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 text-sm">
                <div>{feature.name}</div>
                <div className="text-muted-foreground">{feature.free}</div>
                <div className="flex items-center gap-2 text-primary">
                  {feature.premium}
                  {isPremium && <Check className="h-4 w-4" />}
                </div>
              </div>
            ))}
          </div>
          {!isPremium && (
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">${PREMIUM_PRICE}</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
              <Button 
                className="w-full" 
                onClick={() => createCheckoutMutation.mutate()}
                disabled={createCheckoutMutation.isPending}
              >
                {createCheckoutMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}