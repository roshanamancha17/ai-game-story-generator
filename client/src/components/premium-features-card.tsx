import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { FREE_TIER_LIMITS, PREMIUM_TIER_LIMITS } from "@shared/schema";

export default function PremiumFeaturesCard() {
  const { user } = useAuth();
  const isPremium = user?.isPremium;

  const features = [
    {
      name: "Story Generations",
      free: `${FREE_TIER_LIMITS.GENERATIONS_PER_DAY} per day`,
      premium: `${PREMIUM_TIER_LIMITS.GENERATIONS_PER_DAY} per day`
    },
    {
      name: "Story Length",
      free: FREE_TIER_LIMITS.STORY_LENGTH_LIMIT,
      premium: PREMIUM_TIER_LIMITS.STORY_LENGTH_LIMIT
    },
    {
      name: "Gameplay Details",
      free: "Basic",
      premium: "Detailed mechanics & systems"
    },
    {
      name: "Prompt Improvement",
      free: "Not available",
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
            <Button className="w-full mt-4">
              <Star className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
