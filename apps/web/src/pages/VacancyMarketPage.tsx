import { useEffect, useState, useRef } from "react";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState({
    levels: [] as string[],
    types: [] as string[],
    minSalary: "",
    maxSalary: "",
  });

  const fetchJobs = async () => {
    if (isAuthLoading) return;
    setIsLoadingData(true);

    try {
      let headers = {};
      if (isAuthenticated) {
        const token = await getAccessTokenSilently();
        headers = { Authorization: `Bearer ${token}` };
      }

      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filters.types.length) params.append("type", filters.types.join(","));
      if (filters.levels.length) params.append("level", filters.levels.join(","));
      if (filters.minSalary) params.append("minSalary", filters.minSalary);
      if (filters.maxSalary) params.append("maxSalary", filters.maxSalary);

      const response = await api.get(`/vacancies?${params.toString()}`, { headers });
      
      const mappedJobs = response.data.map((job: any) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: `$${job.salary}`,
        type: job.type,
        postedAt: new Date(job.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        }),
        skills: job.skills,
        matchScore: undefined 
      }));

      setJobs(mappedJobs); 
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [isAuthenticated, isAuthLoading]); 

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const { data } = await api.get(`/vacancies/autocomplete?query=${searchQuery}`);
        setSuggestions(data);
      } catch (e) {
        console.error(e);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <FilterSidebar 
                filters={filters} 
                setFilters={setFilters} 
                onApply={fetchJobs} 
              />
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-6">
            
            <div className="flex gap-4 relative z-20">
              <div className="relative flex-1" ref={suggestionRef}>
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search by title, skill, or company..." 
                  className="pl-10 h-12 bg-white" 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full mt-1 w-full bg-white rounded-md border border-slate-200 shadow-lg overflow-hidden">
                    {suggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700"
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setShowSuggestions(false);
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button 
                className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700"
                onClick={fetchJobs}
              >
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
                      <p className="text-slate-500">No jobs found matching your criteria.</p>
                      <Button variant="link" onClick={() => {
                        setSearchQuery("");
                        setFilters({ levels: [], types: [], minSalary: "", maxSalary: "" });
                      }}>
                        Clear all filters
                      </Button>
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