import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  Sparkles,
  Building2,
  Share2,
  Bookmark,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

interface JobDetail {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  postedAt: string;
  description: string;
  skills: string[];
  matchScore?: number;
  missingSkills?: string[];
}

export default function VacancyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    isAuthenticated,
    loginWithRedirect,
    getAccessTokenSilently,
    isLoading: isAuthLoading,
  } = useAuth0();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (isAuthLoading) return;

      try {
        let headers = {};
        if (isAuthenticated) {
          const token = await getAccessTokenSilently();
          headers = { Authorization: `Bearer ${token}` };
        }

        const response = await api.get(`/vacancies/${id}`, { headers });
        const data = response.data;

        setJob({
          id: data.id,
          title: data.title,
          company: data.company,
          location: data.location,
          salary: `$${data.salary}`,
          type: data.type,
          postedAt: new Date(data.createdAt).toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
          }),
          description: data.description,
          skills: data.skills,
          matchScore: 85,
          missingSkills: ["Docker", "Kubernetes"],
        });
      } catch (error) {
        console.error("Failed to fetch job details", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, isAuthenticated, isAuthLoading, getAccessTokenSilently]);

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: `/jobs/${id}/apply` },
      });
    } else {
      navigate(`/jobs/${id}/apply`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!job) return <div>Job not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to="/jobs"
            className="flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {job.title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-indigo-600" />
                  <span className="font-medium text-slate-900">
                    {job.company}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4" />
                  {job.salary}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Posted {job.postedAt}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="bg-slate-200 text-slate-700 hover:bg-slate-300"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {job.matchScore && (
              <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-slate-900">
                    Your Compatibility Profile
                  </h2>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="relative h-32 w-32 flex-shrink-0">
                    <svg
                      className="h-full w-full -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      <path
                        className="text-slate-200"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="text-indigo-600"
                        strokeDasharray={`${job.matchScore}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-indigo-700">
                        {job.matchScore}%
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                        Match
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-slate-900">
                        Matched Skills
                      </h3>
                      <div className="space-y-1">
                        {job.skills.slice(0, 3).map((skill) => (
                          <div
                            key={skill}
                            className="flex items-center gap-2 text-sm text-slate-600"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-500" />{" "}
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                    {job.missingSkills && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-slate-900">
                          Missing Skills
                        </h3>
                        <div className="space-y-1">
                          {job.missingSkills.map((skill) => (
                            <div
                              key={skill}
                              className="flex items-center gap-2 text-sm text-slate-600"
                            >
                              <XCircle className="h-4 w-4 text-red-400" />{" "}
                              {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <div className="prose prose-slate max-w-none text-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                About the Role
              </h3>
              <p className="mb-6 leading-relaxed">{job.description}</p>

              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Responsibilities
              </h3>
              <ul className="list-disc pl-5 mb-6 space-y-1">
                <li>Design and implement scalable frontend architectures.</li>
                <li>
                  Collaborate with cross-functional teams to define, design, and
                  ship new features.
                </li>
                <li>
                  Ensure high performance and responsiveness of applications.
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Requirements
              </h3>
              <ul className="list-disc pl-5 mb-6 space-y-1">
                <li>5+ years of experience with React and TypeScript.</li>
                <li>
                  Strong understanding of modern CSS and UI/UX principles.
                </li>
                <li>
                  Experience with server-side rendering (Next.js) is a plus.
                </li>
              </ul>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <Button
                  size="lg"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg h-12 mb-3"
                  onClick={handleApplyClick}
                >
                  Apply Now
                </Button>
                <Button variant="outline" className="w-full text-slate-600">
                  <Bookmark className="mr-2 h-4 w-4" />
                  Save for Later
                </Button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                  25 people have applied today
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {job.company}
                    </h3>
                    <Link
                      to="#"
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      View company profile
                    </Link>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                  A leading innovator in the fintech space, focused on
                  revolutionizing global payments through blockchain technology.
                </p>
                <Button
                  variant="ghost"
                  className="w-full text-sm h-auto py-2 text-slate-600"
                >
                  <Share2 className="mr-2 h-4 w-4" /> Share this job
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
