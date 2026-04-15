import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Briefcase, Users, FileWarning, Trash2, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardStats {
  activeJobs: number;
  totalApplicants: number;
  newApplicants: number;
}

interface EmployerVacancy {
  id: string;
  title: string;
  createdAt: string;
  status: string;
  applicantsCount: number;
  newApplicantsCount: number;
}

export default function EmployerDashboardPage() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vacancies, setVacancies] = useState<EmployerVacancy[]>([]);
  
  const[isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!isAuthenticated) return;
      setIsLoading(true);
      try {
        const token = await getAccessTokenSilently();
        const { data } = await api.get('/vacancies/employer/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(data.stats);
        setVacancies(data.vacancies);
      } catch (err: any) {
        if (err.response?.status === 403) {
            setError("Access Denied. You must be registered as an employer to view this page.");
        } else {
            setError("An error occurred while fetching your dashboard.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, [isAuthenticated, getAccessTokenSilently]);

  const handleDeleteVacancy = async (vacancyId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this vacancy? This action cannot be undone.")) return;
    
    setDeletingId(vacancyId);
    try {
      const token = await getAccessTokenSilently();
      await api.delete(`/vacancies/employer/${vacancyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const deletedVacancy = vacancies.find(v => v.id === vacancyId);
      setVacancies(vacancies.filter(v => v.id !== vacancyId));
      
      if (stats && deletedVacancy) {
        setStats({
          activeJobs: stats.activeJobs - 1,
          totalApplicants: stats.totalApplicants - deletedVacancy.applicantsCount,
          newApplicants: stats.newApplicants - deletedVacancy.newApplicantsCount,
        });
      }
      
      toast({ title: "Deleted", description: "Vacancy has been successfully removed." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete the vacancy." });
    } finally {
      setDeletingId(null);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <Header />
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
            <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">{error}</h2>
            <Link to="/" className="mt-6"><Button variant="outline">Return to Home</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Vacancies Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your job postings and review incoming candidates.</p>
          </div>
          
          <Link to="/employer/jobs/create">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white whitespace-nowrap shadow-sm">
              <Plus className="h-4 w-4 mr-2" /> Add New Vacancy
            </Button>
          </Link>
        </div>

        {isLoading || !stats ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Active Jobs</CardTitle>
                  <Briefcase className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-800">{stats.activeJobs}</div>
                </CardContent>
              </Card>
              
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Total Applicants</CardTitle>
                  <Users className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-800">{stats.totalApplicants}</div>
                </CardContent>
              </Card>

              <Card className="border-indigo-100 bg-indigo-50/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-indigo-600">New Applicants</CardTitle>
                  <FileWarning className="h-4 w-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-indigo-700">
                    {stats.newApplicants} <span className="text-sm font-medium text-indigo-500">Needs Review</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {vacancies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700">You haven't posted any jobs yet.</h3>
                <p className="text-slate-500 mt-2 mb-6">Create your first vacancy to start receiving AI-matched applicants.</p>
                
                <Link to="/employer/jobs/create">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Create Your First Vacancy</Button>
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-6 py-4 font-medium">Job Title</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Applicants</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {vacancies.map((vacancy) => (
                        <tr key={vacancy.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{vacancy.title}</div>
                            <div className="text-xs text-slate-400 mt-1">Created on: {new Date(vacancy.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none">
                              {vacancy.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-700">{vacancy.applicantsCount} Total</div>
                            {vacancy.newApplicantsCount > 0 && (
                              <div className="text-xs font-semibold text-indigo-600 mt-0.5">
                                {vacancy.newApplicantsCount} New
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                            
                            <Link to={`/employer/jobs/edit/${vacancy.id}`}>
                              <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 shadow-none">
                                Edit
                              </Button>
                            </Link>

                            <Button size="sm" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-none">
                              View Applicants
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              onClick={() => handleDeleteVacancy(vacancy.id)}
                              disabled={deletingId === vacancy.id}
                            >
                              {deletingId === vacancy.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}