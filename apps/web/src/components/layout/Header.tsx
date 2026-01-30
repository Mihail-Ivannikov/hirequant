import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Branding */}
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-indigo-600" />
          <span className="text-xl font-bold tracking-tight text-slate-900">
            SmartRecruit<span className="text-indigo-600">AI</span>
          </span>
        </div>

        {/* Auth Controls */}
        <div className="flex items-center gap-4">
          <Link to="/auth?mode=login">
            <Button variant="ghost" className="text-slate-600">
              Sign In
            </Button>
          </Link>
          <Link to="/auth?mode=register">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}