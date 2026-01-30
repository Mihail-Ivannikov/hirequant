import { Header } from "@/components/layout/Header";
import { FilterSidebar } from "@/components/jobs/FilterSidebar";
import { JobCard, Job } from "@/components/jobs/JobCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// MOCK DATA (To simulate Backend response)
const MOCK_JOBS: Job[] = [
  {
    id: "1",
    title: "Senior React Developer",
    company: "TechFlow Solutions",
    location: "Remote",
    salary: "$5k - $7k",
    type: "Full-time",
    postedAt: "2 days ago",
    skills: ["React", "TypeScript", "Tailwind", "Redux"],
    matchScore: 92, // High match (Green)
  },
  {
    id: "2",
    title: "Backend Engineer (Node.js)",
    company: "Innovate AI",
    location: "New York, NY",
    salary: "$6k - $8k",
    type: "Hybrid",
    postedAt: "5 hours ago",
    skills: ["Node.js", "NestJS", "PostgreSQL", "Docker"],
    matchScore: 78, // Medium match (Yellow)
  },
  {
    id: "3",
    title: "Frontend Developer",
    company: "Creative Studio",
    location: "London, UK",
    salary: "$3k - $4.5k",
    type: "On-site",
    postedAt: "1 day ago",
    skills: ["Vue.js", "JavaScript", "CSS"],
    matchScore: 45, // Low match (Gray/Red)
  },
  {
    id: "4",
    title: "Full Stack Developer",
    company: "Startup Inc",
    location: "Remote",
    salary: "$4k - $6k",
    type: "Full-time",
    postedAt: "3 days ago",
    skills: ["React", "Node.js", "MongoDB"],
    matchScore: 85,
  },
];

export default function VacancyMarketPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header (Reused) */}
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          
          {/* LEFT: Filters (Hidden on mobile, can be improved later with a sheet) */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </aside>

          {/* RIGHT: Main Feed */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search by title, skill, or company..." 
                  className="pl-10 h-12 bg-white" 
                />
              </div>
              <Button className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700">
                Search
              </Button>
            </div>

            {/* Result Counter */}
            <div className="text-sm text-slate-500">
              Showing <strong>{MOCK_JOBS.length}</strong> available jobs based on your preferences.
            </div>

            {/* Job List */}
            <div className="grid gap-4">
              {MOCK_JOBS.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}