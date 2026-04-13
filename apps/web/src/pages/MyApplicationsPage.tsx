import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Briefcase, MessageSquare, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { ChatModal } from "@/components/applications/ChatModal";

type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

interface Application {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  vacancyId: string;
  vacancy: { title: string; company: string; id: string };
  messages: any[];
}

export default function MyApplicationsPage() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filter, setFilter] = useState<'ALL' | ApplicationStatus>('ALL');
  const [sortBy, setSortBy] = useState<'UPDATED' | 'STATUS'>('UPDATED');
  
  const [chatAppId, setChatAppId] = useState<string | null>(null);
  const [chatCompanyName, setChatCompanyName] = useState<string>("");

  useEffect(() => {
    const fetchApps = async () => {
      if (!isAuthenticated) return;
      setIsLoading(true);
      try {
        const token = await getAccessTokenSilently();
        const { data } = await api.get('/vacancies/me/applications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(data);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApps();
  },[isAuthenticated, getAccessTokenSilently]);

  const filteredAndSorted = applications
    .filter(app => filter === 'ALL' ? true : app.status === filter)
    .sort((a, b) => {
      if (sortBy === 'STATUS') {
        const order = { ACCEPTED: 1, PENDING: 2, REJECTED: 3 };
        return order[a.status] - order[b.status];
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const getStatusConfig = (status: ApplicationStatus) => {
    switch (status) {
      case 'ACCEPTED': return { label: 'Interview Stage', color: 'bg-green-100 text-green-700 hover:bg-green-200' };
      case 'PENDING': return { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' };
      case 'REJECTED': return { label: 'Rejected', color: 'bg-red-100 text-red-700 hover:bg-red-200' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Applications</h1>
            <p className="text-slate-500 mt-1">Track your job applications and communicate with employers.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <select 
              className="h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
              value={filter} onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Under Review</option>
              <option value="ACCEPTED">Accepted / Interview</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select 
              className="h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
              value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="UPDATED">Sort: Last Updated</option>
              <option value="STATUS">Sort: By Status</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-slate-200 shadow-sm">
            <Briefcase className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700">No applications found</h3>
            <p className="text-slate-500 mt-2 mb-6">You haven't applied to any jobs that match this filter.</p>
            <Link to="/jobs"><Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Find jobs now</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSorted.map((app) => {
              const statusCfg = getStatusConfig(app.status);
              const hasMessages = app.messages && app.messages.length > 0;
              return (
                <Card key={app.id} className="transition-all hover:shadow-md border-slate-200">
                  <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{app.vacancy.title}</h3>
                      <p className="font-medium text-slate-600">{app.vacancy.company}</p>
                      <p className="text-xs text-slate-400 mt-2">Applied on: {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                      <Badge variant="secondary" className={`${statusCfg.color} font-medium px-3 py-1 whitespace-nowrap`}>
                        {statusCfg.label}
                      </Badge>
                      
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <Link to={`/jobs/${app.vacancy.id}`} className="flex-1 md:flex-none">
                          <Button variant="outline" className="w-full text-slate-600 border-slate-200 shadow-none">
                            <ExternalLink className="h-4 w-4 mr-2" /> Job
                          </Button>
                        </Link>
                        
                        <Button 
                          onClick={() => { setChatAppId(app.id); setChatCompanyName(app.vacancy.company); }}
                          disabled={app.status !== 'ACCEPTED'}
                          className={`flex-1 md:flex-none shadow-none relative ${app.status === 'ACCEPTED' ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200' : 'bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed'}`}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" /> Chat
                          {app.status === 'ACCEPTED' && hasMessages && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span>
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      
      <ChatModal 
        isOpen={!!chatAppId} 
        onClose={() => setChatAppId(null)} 
        applicationId={chatAppId!} 
        companyName={chatCompanyName} 
      />
    </div>
  );
}