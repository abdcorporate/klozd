import { Header } from "@/components/marketing/header";
import { HeroNew } from "@/components/marketing/hero-new";
import { ReplaceTools } from "@/components/marketing/replace-tools";
import { HowItWorksNew } from "@/components/marketing/how-it-works-new";
import { FeaturesNew } from "@/components/marketing/features-new";
import { ForWho } from "@/components/marketing/for-who";
import { Pricing } from "@/components/marketing/pricing";
import { FAQNew } from "@/components/marketing/faq-new";
import { FinalCTANew } from "@/components/marketing/final-cta-new";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroNew />
        <ReplaceTools />
        <HowItWorksNew />
        <FeaturesNew />
        <ForWho />
        <Pricing />
        <FAQNew />
        <FinalCTANew />
      </main>
    </div>
  );
}
