import { BrainCircuit, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      
      {/* LEFT PANEL: Branding & Visuals */}
      <div className="relative hidden h-full flex-col bg-slate-900 p-10 text-white dark:border-r lg:flex">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-zinc-900" />
        
        {/* TOP: Logo */}
        <div className="relative z-20 flex items-center text-lg font-medium">
          <BrainCircuit className="mr-2 h-6 w-6 text-indigo-500" />
          SmartRecruit AI
        </div>

        {/* MIDDLE: Value Proposition (Fills the empty space) */}
        <div className="relative z-20 flex flex-col justify-center flex-1 space-y-6 max-w-lg">
          <h1 className="text-4xl font-bold tracking-tight text-white lg:text-5xl">
            Hire smarter, <br/>
            <span className="text-indigo-500">not harder.</span>
          </h1>
          <p className="text-lg text-slate-400">
            Join the platform where AI analyzes resumes for competency, not just keywords.
          </p>
          
          {/* Feature List */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-indigo-500" />
              <span className="text-slate-300">Vector-based Matching</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-indigo-500" />
              <span className="text-slate-300">Automated Skill Extraction</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-indigo-500" />
              <span className="text-slate-300">Bias-Free Ranking</span>
            </div>
          </div>
        </div>

        {/* BOTTOM: Removed Testimonial as requested */}
        
      </div>

      {/* RIGHT PANEL: Interactive Form */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            {/* Back to Home Button */}
            <div className="absolute right-4 top-4 md:right-8 md:top-8">
                <Link to="/" className="text-sm font-medium text-slate-600 hover:text-indigo-600">
                    Back to Home
                </Link>
            </div>
            {children}
        </div>
      </div>
    </div>
  );
}