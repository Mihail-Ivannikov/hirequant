import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ChatInterface } from "@/components/applications/ChatInterface";
import { 
  ArrowLeft, Loader2, CheckCircle2, XCircle, BrainCircuit, 
  Download, FileText, UserCheck, UserX, MessageSquare
} from "lucide-react";

const CircularProgress = ({ value }: { value: number }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  let color = "text-red-500";
  if (value >= 90) color = "text-emerald-500";
  else if (value >= 70) color = "text-yellow-500";

  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
        <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className={`${color} transition-all duration-1000 ease-out`} />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-slate-800">{value}%</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Match</span>
      </div>
    </div>
  );
}

interface ApplicationDetails {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  testScore: number | null;
  aiScore: number;
  resumeUrl: string | null;
  candidate: {
    fullName: string;
    headline: string;
  };
  vacancy: {
    id: string;
    title: string;
  };
  insights: {
    matchedSkills: string[];
    missingSkills: string[];
  };
}

export default function CandidateReviewPage() {
  const { applicationId } = useParams();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { toast } = useToast();
  
  const [app, setApp] = useState<ApplicationDetails | null>(null);
  const[isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!isAuthenticated) return;
      try {
        const token = await getAccessTokenSilently();
        const res = await api.get(`/vacancies/employer/applications/${applicationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApp(res.data);
        if (res.data.status === 'ACCEPTED') setActiveTab("messages");
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to load application." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [applicationId, isAuthenticated, getAccessTokenSilently, toast]);

  const updateStatus = async (newStatus: 'ACCEPTED' | 'REJECTED') => {
    setIsUpdating(true);
    try {
      const token = await getAccessTokenSilently();
      await api.patch(`/vacancies/employer/applications/${applicationId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApp(prev => prev ? { ...prev, status: newStatus } : null);
      
      if (newStatus === 'ACCEPTED') {
        toast({ title: "Candidate Accepted", description: "Chat is now unlocked. Send them a message!" });
        setActiveTab("messages");
      } else {
        toast({ title: "Candidate Rejected", description: "This application has been closed." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed", description: "Could not change status." });
    } finally {
      setIsUpdating(false);
    }
  };

  const getPdfUrl = (url: string | null) => {
    if (!url) return "";
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/uploads/${url.replace('uploads/', '')}`;
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div>;
  if (!app) return null;

  const pdfUrl = getPdfUrl(app.resumeUrl);

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">
      
      <header className="h-20 bg-white border-b border-slate-200 shrink-0 flex items-center px-6 shadow-sm z-10">
        <div className="flex-1 flex items-center gap-6">
          <Link to={`/employer/jobs/${app.vacancy.id}/applicants`} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">{app.candidate.fullName}</h1>
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mt-0.5">Applying for: {app.vacancy.title}</p>
          </div>
        </div>
        
        <Badge variant="outline" className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest border-2
          ${app.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
            app.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 
            'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
          {app.status === 'PENDING' ? 'Under Review' : app.status}
        </Badge>
      </header>

      <main className="flex-1 flex overflow-hidden">
        
        <div className="flex-1 flex flex-col border-r border-slate-200 bg-slate-100">
          <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
              <FileText className="h-4 w-4" /> 
              {app.resumeUrl ? app.resumeUrl.split('/').pop()?.substring(0, 30) + "..." : "No Document"}
            </div>
            {pdfUrl && (
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" download>
                <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50 font-black tracking-wide text-xs">
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
              </a>
            )}
          </div>
          
          <div className="flex-1 p-6 relative">
            {pdfUrl ? (
              <iframe src={pdfUrl} className="w-full h-full rounded-xl border border-slate-300 shadow-xl bg-white" title="Resume PDF" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-slate-400">
                <FileText className="h-16 w-16 mb-4 opacity-50" />
                <p className="font-bold tracking-tight">No document available</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-[500px] flex flex-col bg-white shrink-0 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] z-20">
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <div className="px-6 pt-6 pb-2 shrink-0 border-b border-slate-100">
              <TabsList className="w-full h-12 bg-slate-100 p-1 rounded-xl">
                <TabsTrigger value="analysis" className="flex-1 font-bold text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">
                  <BrainCircuit className="h-4 w-4 mr-2" /> AI Analysis
                </TabsTrigger>
                <TabsTrigger value="messages" disabled={app.status !== 'ACCEPTED'} className="flex-1 font-bold text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">
                  <MessageSquare className="h-4 w-4 mr-2" /> Messages
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="analysis" className="flex-1 overflow-y-auto p-6 space-y-8 m-0 data-[state=inactive]:hidden">
              
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 flex items-center gap-6 shadow-inner">
                <CircularProgress value={app.aiScore} />
                <div className="flex-1">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">AI Assessment</h3>
                  <p className="text-sm font-medium text-slate-500 mt-1 leading-relaxed">
                    {app.aiScore >= 90 ? "Highly suitable based on vector similarity and direct keyword matching." : 
                     app.aiScore >= 70 ? "Strong potential, meets the majority of core requirements." : 
                     "Low alignment with specified technical requirements."}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Matched Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {app.insights.matchedSkills.length === 0 ? <span className="text-sm text-slate-400 italic">None detected</span> : 
                     app.insights.matchedSkills.map(s => <Badge key={s} variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1.5 text-sm shadow-sm">{s}</Badge>)}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2"><XCircle className="h-4 w-4 text-red-400" /> Missing Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {app.insights.missingSkills.length === 0 ? <span className="text-sm text-slate-400 italic">All requirements met</span> : 
                     app.insights.missingSkills.map(s => <Badge key={s} variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 px-3 py-1.5 text-sm shadow-sm">{s}</Badge>)}
                  </div>
                </div>

                {app.testScore !== null && (
                  <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                    <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2">Pre-Screening Questionnaire</h4>
                    <p className="text-lg font-black text-indigo-900 flex items-center gap-2">
                      Score: {app.testScore}%
                      {app.testScore >= 80 && <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white ml-2">Passed</Badge>}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="messages" className="flex-1 overflow-hidden m-0 data-[state=inactive]:hidden">
               <ChatInterface applicationId={applicationId!} currentRole="EMPLOYER" />
            </TabsContent>

            {activeTab === 'analysis' && app.status === 'PENDING' && (
              <div className="p-6 border-t border-slate-200 bg-white shrink-0 grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => updateStatus('REJECTED')}
                  disabled={isUpdating}
                  className="h-14 font-black uppercase tracking-widest text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <UserX className="h-4 w-4 mr-2" /> Reject
                </Button>
                <Button 
                  onClick={() => updateStatus('ACCEPTED')}
                  disabled={isUpdating}
                  className="h-14 font-black uppercase tracking-widest text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 transition-all"
                >
                  <UserCheck className="h-4 w-4 mr-2" /> Accept & Contact
                </Button>
              </div>
            )}
            {activeTab === 'analysis' && app.status !== 'PENDING' && (
              <div className="p-6 border-t border-slate-200 bg-slate-50 shrink-0 text-center">
                 <p className="text-sm font-bold text-slate-500">
                    Application is currently marked as <span className={app.status === 'ACCEPTED' ? 'text-emerald-600' : 'text-red-600'}>{app.status}</span>.
                 </p>
              </div>
            )}

          </Tabs>
        </div>
      </main>
    </div>
  );
}