import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { AIProcessSection } from "@/components/landing/AIProcessSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Header />
      <main>
        <HeroSection />
        <AIProcessSection />
      </main>
      <Footer />
    </div>
  );
}