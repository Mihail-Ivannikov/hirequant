import { Card, CardContent } from "@/components/ui/card";
import { FileText, Cpu, ListOrdered, ArrowRight } from "lucide-react";

export function AIProcessSection() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            From PDF to Ranked Candidate
          </h2>
          <p className="mt-4 text-slate-600">
            Our Python microservice handles the heavy lifting using NLP and Vector Mathematics.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Step 1 */}
          <div className="relative flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
              <FileText className="h-10 w-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">1. Upload & Parse</h3>
            <p className="mt-2 text-sm text-slate-500">
              System extracts raw text from PDF/DOCX resumes using OCR and specialized parsers.
            </p>
            {/* Arrow for Desktop */}
            <ArrowRight className="absolute right-[-20%] top-8 hidden h-8 w-8 text-slate-300 md:block" />
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
              <Cpu className="h-10 w-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">2. Vector Analysis</h3>
            <p className="mt-2 text-sm text-slate-500">
              BERT models convert text to 384-dimensional vectors. Cosine similarity calculates the match.
            </p>
             {/* Arrow for Desktop */}
             <ArrowRight className="absolute right-[-20%] top-8 hidden h-8 w-8 text-slate-300 md:block" />
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
              <ListOrdered className="h-10 w-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">3. Instant Ranking</h3>
            <p className="mt-2 text-sm text-slate-500">
              Candidates are ranked 0-100% against the specific job requirements.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}