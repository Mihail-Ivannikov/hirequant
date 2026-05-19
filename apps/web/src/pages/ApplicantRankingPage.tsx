import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft, Sparkles, Loader2, Users, CheckCircle2,
  XCircle, BrainCircuit, User, Calendar, ChevronRight
} from "lucide-react";

// Custom SVG Radial Progress Component for high visual impact
const CircularProgress = ({ value }: { value: number | null }) => {
  // EXACT FIX: Handled the "null" processing state visually
  if (value === null) {
    return (
      <div className="relative flex flex-col items-center justify-center w-24 h-24 bg-slate-50 rounded-full border border-slate-100 shadow-inner">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400 mb-1" />
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center leading-tight">AI<br/>Pending</span>
      </div>
    );
  }

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  let color = "text-red-500";
  if (value >= 90) color = "text-emerald-500";
  else if (value >= 70) color = "text-yellow-500";

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
        <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className={`${color} transition-all duration-1000 ease-out`} />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-black text-slate-800">{value}%</span>
      </div>
    </div>
  );
}

interface RankedApplicant {
  id: string;
  status: string;
  createdAt: string;
  testScore: number | null;
  aiScore: number | null;
  candidate: {
    id: string;
    fullName: string;
    headline: string;
    avatarUrl: string | null;
  };
  insights: {
    matchedSkills: string[];
    missingSkills: string[];
  };
}

interface VacancyData {
  id: string;
  title: string;
  createdAt: string;
  status: string;
  totalApplicants: number;
}

export default function ApplicantRankingPage() {
  const { id } = useParams();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const[data, setData] = useState<{ vacancy: VacancyData, applicants: RankedApplicant[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!isAuthenticated) return;
      try {
        const token = await getAccessTokenSilently();
        const res = await api.get(`/vacancies/employer/${id}/applicants`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (error) {
        console.error("Failed to load applicants", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplicants();
  },[id, isAuthenticated, getAccessTokenSilently]);

  const getAvatarUrl = (url: string | null) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/uploads/${url}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!data) return null;
  
  const topMatches = data.applicants.filter((app, idx) => (app.aiScore !== null && app.aiScore >= 70) || idx < 10);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32">
      <Header />

      {/* Job Context Header */}
      <header className="bg-white border-b border-slate-200 py-6 mb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Link to="/employer/dashboard" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to My Vacancies
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{data.vacancy.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm font-medium text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Posted: {new Date(data.vacancy.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Active Status</span>
              </div>
            </div>
            <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 text-center">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Total Applicants</span>
              <span className="block text-2xl font-black text-slate-800">{data.vacancy.totalApplicants}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4">
        <Tabs defaultValue="top-matches" className="w-full">
          <TabsList className="mb-6 h-14 bg-slate-200/50 p-1.5 w-full justify-start rounded-xl overflow-x-auto">
            <TabsTrigger value="top-matches" className="h-10 px-8 font-bold flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all">
              <Sparkles className="h-4 w-4" /> Top Matches (AI Ranked)
            </TabsTrigger>
            <TabsTrigger value="all-applicants" className="h-10 px-8 font-bold flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm transition-all">
              <Users className="h-4 w-4" /> All Applicants ({data.applicants.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="top-matches" className="space-y-6">

            <div className="flex items-start gap-4 p-5 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-900 shadow-sm">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-inner"><Sparkles className="h-6 w-6 text-white" /></div>
              <div>
                <h4 className="font-bold text-base mb-1">AI Intelligence Active</h4>
                <p className="text-sm font-medium opacity-90">These candidates are mathematically ranked by semantic similarity to your required skills and their pre-screening test performance.</p>
              </div>
            </div>

            {topMatches.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No applicants yet</h3>
              </div>
            ) : (
              topMatches.map((app, index) => (
                <Card key={app.id} className="overflow-hidden border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 relative group bg-white">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-purple-600 opacity-70 group-hover:opacity-100 transition-opacity" />

                  <CardContent className="p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-8">

                    {/* Rank & Profile Info */}
                    <div className="flex items-center gap-6 w-full lg:w-1/3">
                      <div className="flex-shrink-0 flex flex-col items-center justify-center w-12">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rank</span>
                        <span className="text-4xl font-black text-slate-800 tracking-tighter">#{index + 1}</span>
                      </div>
                      <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden border-2 border-white shadow-md">
                        {app.candidate.avatarUrl ? (
                           <img src={getAvatarUrl(app.candidate.avatarUrl)} className="h-full w-full object-cover" alt="Profile" />
                        ) : (
                           <User className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-black text-slate-900 leading-tight truncate">{app.candidate.fullName}</h3>
                        <p className="text-sm font-semibold text-slate-500 mt-1 truncate">{app.candidate.headline || "Candidate"}</p>
                      </div>
                    </div>

                    {/* AI Score Radial */}
                    <div className="flex flex-col items-center justify-center w-full lg:w-1/6 border-y lg:border-y-0 lg:border-x border-slate-100 py-4 lg:py-0">
                       <CircularProgress value={app.aiScore} />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-3">Overall Match</span>
                    </div>

                    {/* Semantic Insights */}
                    <div className="flex-1 w-full space-y-5">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 block">AI Skill Analysis</span>
                        <div className="flex flex-wrap gap-2">
                          {app.aiScore === null && <span className="text-sm text-slate-400 flex items-center"><Loader2 className="h-3 w-3 animate-spin mr-2" /> Extracting skills...</span>}
                          {app.aiScore !== null && app.insights.matchedSkills.length === 0 && app.insights.missingSkills.length === 0 && <span className="text-sm text-slate-400">No specific skills analyzed.</span>}
                          {app.aiScore !== null && app.insights.matchedSkills.map(s => <Badge key={s} variant="secondary" className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1"><CheckCircle2 className="h-3 w-3 mr-1.5" />{s}</Badge>)}
                          {app.aiScore !== null && app.insights.missingSkills.map(s => <Badge key={s} variant="outline" className="bg-slate-50 text-slate-400 border border-slate-200 px-2 py-1"><XCircle className="h-3 w-3 mr-1.5" />{s}</Badge>)}
                        </div>
                      </div>

                      {app.testScore !== null && (
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Fit Questionnaire Verification</span>
                          <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 text-sm font-bold shadow-sm">
                            <BrainCircuit className="h-4 w-4 mr-2" /> Score: {app.testScore}%
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="w-full lg:w-auto flex-shrink-0 mt-4 lg:mt-0">
                      <Link to={`/employer/applications/${app.id}`}>
                        <Button className="w-full lg:w-auto bg-slate-900 hover:bg-indigo-600 text-white rounded-xl px-8 py-6 h-auto font-black shadow-lg shadow-slate-200 transition-all group">
                          Review Profile
                          <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>

                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="all-applicants">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Date Applied</th>
                      <th className="px-6 py-4">Candidate</th>
                      <th className="px-6 py-4">AI Score</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.applicants.length === 0 ? (
                       <tr><td colSpan={5} className="text-center py-10">No applicants yet.</td></tr>
                    ) : (
                      data.applicants.map(app => (
                        <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-500">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                             <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                                {app.candidate.avatarUrl ? <img src={getAvatarUrl(app.candidate.avatarUrl)} className="h-full w-full object-cover"/> : <User className="h-4 w-4 text-indigo-400" />}
                             </div>
                             {app.candidate.fullName}
                          </td>
                          <td className="px-6 py-4">
                             {/* EXACT FIX: Added visual spinner for table view when AI is pending */}
                             {app.aiScore !== null ? (
                                <Badge variant="outline" className={`font-black px-2.5 py-1 border ${app.aiScore >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : app.aiScore >= 70 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                  {app.aiScore}% Match
                                </Badge>
                             ) : (
                                <Badge variant="outline" className="font-black px-2.5 py-1 border bg-slate-50 text-slate-500 border-slate-200">
                                  <Loader2 className="h-3 w-3 animate-spin mr-1.5 inline-block" /> Processing
                                </Badge>
                             )}
                          </td>
                          <td className="px-6 py-4">
                             <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold px-3">{app.status}</Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <Link to={`/employer/applications/${app.id}`}>
                               <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50 font-black">
                                 Review <ChevronRight className="h-4 w-4 ml-1" />
                               </Button>
                             </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}