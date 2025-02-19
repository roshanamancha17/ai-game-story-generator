import { Crown, Star, Sparkles, Gauge, Infinity, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface PremiumFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const premiumFeatures: PremiumFeature[] = [
  {
    icon: <Infinity className="h-5 w-5" />,
    title: "Unlimited Generations",
    description: "Generate as many stories as you want without daily limits"
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Advanced World Building",
    description: "Create rich, detailed worlds with deep lore, cultures, and histories"
  },
  {
    icon: <Gauge className="h-5 w-5" />,
    title: "Detailed Gameplay Mechanics",
    description: "Access comprehensive gameplay systems and mechanics generation"
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Enhanced Story Length",
    description: "Create longer, more detailed stories with advanced plot development"
  },
];

export default function PremiumFeaturesSection() {
  return (
    <section className="py-8 space-y-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary">
          <Crown className="h-4 w-4" />
          <span className="text-sm font-medium">Premium Features</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight">
          Unlock the Full Creative Power
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upgrade to Premium to access advanced features and create richer, more detailed game stories with unlimited generation capabilities.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {premiumFeatures.map((feature, index) => (
          <Card key={index} className="relative overflow-hidden border-primary/20 bg-primary/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
            <CardHeader className="relative">
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {feature.icon}
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button size="lg" className="px-8">
          <Star className="mr-2 h-4 w-4" />
          Upgrade to Premium
        </Button>
        <p className="mt-2 text-sm text-muted-foreground">
          Unlock all premium features and elevate your game story creation
        </p>
      </div>
    </section>
  );
}
