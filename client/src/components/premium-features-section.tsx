import { Crown, Star, Sparkles, Gauge, Infinity, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
    <section className="py-16 px-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header with improved visibility */}
        <div className="text-center space-y-8 mb-16 bg-white/95 py-8 rounded-2xl shadow-sm">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary text-white shadow-lg">
            <Crown className="h-6 w-6" />
            <span className="text-lg font-bold">Premium Features</span>
          </div>

          <div className="space-y-4">
            <h2 className="text-5xl font-extrabold tracking-tight text-gray-900">
              Unlock the Full Creative Power
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Upgrade to Premium to access advanced features and create richer, more detailed game stories with unlimited generation capabilities.
            </p>
          </div>
        </div>

        {/* Feature cards with improved contrast */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {premiumFeatures.map((feature, index) => (
            <Card key={index} className="relative group hover:shadow-xl transition-all duration-300 bg-white border-2 border-primary/20">
              <CardHeader className="relative">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-white group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <CardTitle className="text-2xl mb-3 text-gray-900">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* CTA section with improved visibility */}
        <div className="mt-16 text-center">
          <Button 
            size="lg" 
            className="px-10 py-7 text-xl font-semibold text-white shadow-2xl bg-primary hover:bg-primary/90 transition-all duration-300"
          >
            <Star className="mr-2 h-6 w-6" />
            Upgrade to Premium
          </Button>
          <p className="mt-6 text-base text-gray-600">
            Join premium users and elevate your game story creation experience
          </p>
        </div>
      </div>
    </section>
  );
}