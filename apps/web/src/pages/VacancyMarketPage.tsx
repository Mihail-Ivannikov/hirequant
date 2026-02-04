import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { FilterSidebar } from "@/components/jobs/FilterSidebar";
import { JobCard, Job } from "@/components/jobs/JobCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function VacancyMarketPage() {
  const { isAuthenticated, getAccessTokenSilently, isLoading: isAuthLoading } = useAuth0();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      if (isAuthLoading) return;

      try {
        let headers = {};

        if (isAuthenticated) {
          const token = await getAccessTokenSilently();
          headers = { Authorization: `Bearer ${token}` };
        }

        const response = await api.get('/vacancies', { headers });
        
        setJobs(response.data); 
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchJobs();
  }, [isAuthenticated, isAuthLoading, getAccessTokenSilently]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-6">
            
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

            {isLoadingData ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
              </div>
            ) : (
              <>
                <div className="text-sm text-slate-500">
                  Showing <strong>{jobs.length}</strong> available jobs.
                </div>

                <div className="grid gap-4">
                  {jobs.length > 0 ? (
                    jobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                      <p className="text-slate-500">No jobs found.</p>
                      {!isAuthenticated && (
                        <p className="text-sm text-slate-400 mt-2">
                          (Tip: Log in to see matched jobs)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                  <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
                  <PaginationItem><PaginationNext href="#" /></PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}