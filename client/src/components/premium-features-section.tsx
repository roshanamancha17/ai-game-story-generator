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
    <section className="py-12 px-4 relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary border border-primary/30 shadow-sm">
            <Crown className="h-5 w-5" />
            <span className="text-sm font-semibold">Premium Features</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Unlock the Full Creative Power
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upgrade to Premium to access advanced features and create richer, more detailed game stories with unlimited generation capabilities.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {premiumFeatures.map((feature, index) => (
            <Card key={index} className="relative group hover:shadow-lg transition-all duration-300 border-primary/20 bg-gradient-to-br from-white to-primary/5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 text-primary group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" className="px-8 py-6 text-lg shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary">
            <Star className="mr-2 h-5 w-5" />
            Upgrade to Premium
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Join premium users and elevate your game story creation experience
          </p>
        </div>
      </div>
    </section>
  );
}