import { Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold text-slate-900">SmartRecruit AI</p>
            <p className="text-xs text-slate-500">© 2026 Student Diploma Project</p>
          </div>

          <div className="flex gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-400 hover:text-slate-900"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-400 hover:text-slate-900"
            >
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </a>
          </div>

          <div className="text-center text-xs text-slate-400 md:text-right">
            <p>Powered by React 18, NestJS & Python</p>
          </div>
        </div>
      </div>
    </footer>
  );
}