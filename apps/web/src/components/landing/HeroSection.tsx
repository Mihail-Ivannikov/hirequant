import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, UserSearch, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-16 pb-32 md:pt-24">
      <div className="container mx-auto px-4 text-center">
        {/* Trust Badge */}
        <Badge variant="secondary" className="mb-6 px-4 py-1 text-indigo-700 bg-indigo-50 border-indigo-100">
          <Sparkles className="mr-2 h-3 w-3 fill-indigo-500" />
          Powered by Custom Vector Analysis
        </Badge>

        {/* Headline */}
        <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          Stop Reading Resumes. <br />
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Let AI Do It.
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600">
          Automated competency analysis and candidate ranking based on mathematical vector similarity. 
          Fair, instant, and bias-free.
        </p>

        {/* The Split - Role Selection */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/auth?role=candidate">
            <Button variant="outline" size="lg" className="h-14 min-w-[200px] border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-all">
              <UserSearch className="mr-2 h-5 w-5" />
              I want a Job
            </Button>
          </Link>

          <Link to="/auth?role=employer">
            <Button size="lg" className="h-14 min-w-[200px] bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
              <Briefcase className="mr-2 h-5 w-5" />
              I am an Employer
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Background Decor */}
      <div className="absolute top-0 -z-10 h-full w-full bg-white bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)]"></div>
    </section>
  );
}