import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, BrainCircuit, Loader2, Save, Trash2, Plus, 
  Settings2, Briefcase, Info, CheckCircle2, AlertCircle 
} from "lucide-react";

interface QuestionConfig {
  id: string; // Temporary ID for frontend rendering
  text: string;
  options: string[];
  correct: string;
}

export default function JobConstructorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState(isEditMode);
  const[isSaving, setIsSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Full-time");
  const [salaryMin, setSalaryMin] = useState("");
  const[salaryMax, setSalaryMax] = useState("");
  const [description, setDescription] = useState("");
  
  // AI Skills State
  const [skills, setSkills] = useState<string[]>([]);
  const[skillInput, setSkillInput] = useState("");

  // Questionnaire State
  const [enableQuestionnaire, setEnableQuestionnaire] = useState(false);
  const [questions, setQuestions] = useState<QuestionConfig[]>([]);

  useEffect(() => {
    const fetchJobData = async () => {
      if (!isEditMode || !isAuthenticated) return;
      
      try {
        const token = await getAccessTokenSilently();
        const { data } = await api.get(`/vacancies/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setTitle(data.title);
        setLocation(data.location);
        setType(data.type);
        setDescription(data.description);
        setSkills(data.skills ||[]);

        // Parse Salary (e.g., "$100,000 - $150,000")
        if (data.salary) {
            const matches = data.salary.match(/\d+/g);
            if (matches && matches.length > 0) {
                setSalaryMin(matches[0]);
                if (matches.length > 1) setSalaryMax(matches[1]);
            }
        }

        if (data.questions && data.questions.length > 0) {
          setEnableQuestionnaire(true);
          setQuestions(data.questions.map((q: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            text: q.text,
            options: q.options,
            correct: q.correct
          })));
        }

      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to load vacancy data." });
        navigate("/employer/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobData();
  },[id, isEditMode, isAuthenticated, getAccessTokenSilently, navigate, toast]);

  // --- Handlers ---

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, {
      id: Math.random().toString(36).substr(2, 9),
      text: "",
      options: ["", ""],
      correct: ""
    }]);
  };

  const handleUpdateQuestion = (qId: string, field: string, value: any) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, [field]: value } : q));
  };

  const handleAddOption = (qId: string) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, options: [...q.options, ""] } : q));
  };

  const handleUpdateOption = (qId: string, optIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newOptions = [...q.options];
        newOptions[optIndex] = value;
        // If the updated option was the correct one, update the correct value too
        const isCurrentlyCorrect = q.correct === q.options[optIndex];
        return { ...q, options: newOptions, correct: isCurrentlyCorrect ? value : q.correct };
      }
      return q;
    }));
  };

  const handleRemoveOption = (qId: string, optIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newOptions = q.options.filter((_, idx) => idx !== optIndex);
        return { ...q, options: newOptions, correct: q.correct === q.options[optIndex] ? "" : q.correct };
      }
      return q;
    }));
  };

  const handleRemoveQuestion = (qId: string) => {
    setQuestions(questions.filter(q => q.id !== qId));
  };

  const handleSave = async () => {
    if (!title || !description || skills.length === 0) {
      toast({ variant: "destructive", title: "Validation Error", description: "Title, description, and at least one skill are required." });
      return;
    }

    // Validate Questionnaire
    if (enableQuestionnaire) {
        for (const q of questions) {
            if (!q.text.trim()) return toast({ variant: "destructive", title: "Missing Question Text", description: "All questions must have text." });
            if (q.options.some(opt => !opt.trim())) return toast({ variant: "destructive", title: "Empty Option", description: "All question options must be filled." });
            if (!q.correct) return toast({ variant: "destructive", title: "Missing Answer", description: "You must select a correct requirement answer for every question." });
        }
    }

    setIsSaving(true);
    try {
      const token = await getAccessTokenSilently();
      const payload = {
        title,
        location,
        type,
        salary: salaryMin && salaryMax ? `$${salaryMin} - $${salaryMax}` : (salaryMin ? `$${salaryMin}` : "Salary Undisclosed"),
        description,
        skills,
        questions: enableQuestionnaire ? questions :[]
      };

      if (isEditMode) {
        await api.put(`/vacancies/employer/edit/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast({ title: "Success", description: "Vacancy updated successfully." });
      } else {
        await api.post(`/vacancies/employer/create`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast({ title: "Success", description: "Vacancy published successfully." });
      }

      navigate("/employer/dashboard");
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save vacancy." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32">
      <Header />

      <header className="sticky top-16 z-40 w-full border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6 max-w-5xl">
          <div className="flex items-center gap-4">
            <Link to="/employer/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
              <ArrowLeft className="h-5 w-5 text-slate-500" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900">
              {isEditMode ? "Edit Vacancy" : "Create New Vacancy"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/employer/dashboard")} disabled={isSaving} className="text-slate-600">
              Discard
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {isEditMode ? "Save Changes" : "Publish Vacancy"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
        
        {/* Section 1: Basic Information */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">Job Details</h2>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Job Title <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g., Senior React Developer" value={title} onChange={e => setTitle(e.target.value)} className="h-12" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Location</Label>
                <Input placeholder="e.g., New York, NY" value={location} onChange={e => setLocation(e.target.value)} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Work Model</Label>
                <select 
                  className="w-full h-12 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={type} onChange={e => setType(e.target.value)}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Minimum Salary (USD)</Label>
                <Input type="number" placeholder="100000" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Maximum Salary (USD)</Label>
                <Input type="number" placeholder="150000" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} className="h-12" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Job Description <span className="text-red-500">*</span></Label>
              <textarea 
                className="w-full min-h-[200px] rounded-md border border-slate-200 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe the role, responsibilities, and benefits..."
                value={description} onChange={e => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: AI Matching Criteria */}
        <Card className="border-indigo-200 shadow-md overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
          <div className="bg-indigo-50/50 px-6 py-4 border-b border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-indigo-900">Required Skills (AI Core) <span className="text-red-500">*</span></h2>
            </div>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-100 text-indigo-800 text-sm">
              <Info className="h-5 w-5 shrink-0 mt-0.5 text-indigo-600" />
              <p>Add key skills and requirements here. Our AI matching engine uses these exact terms to parse, evaluate, and rank candidate resumes.</p>
            </div>

            <div className="space-y-3">
              <Label className="font-bold text-slate-700">Add Skill Tags</Label>
              <Input 
                placeholder="Type a skill and press Enter (e.g., 'TypeScript', 'B2B Sales')" 
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                className="h-12 border-indigo-200 focus:ring-indigo-500"
              />
              <div className="flex flex-wrap gap-2 mt-4 min-h-[40px]">
                {skills.length === 0 ? (
                  <span className="text-sm text-slate-400 italic">No skills added yet.</span>
                ) : (
                  skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 px-3 py-1.5 text-sm">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-red-500 focus:outline-none">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Candidate Fit Questionnaire */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-800">Candidate Fit Questionnaire (Pre-Screening)</h2>
            </div>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={enableQuestionnaire} onChange={() => setEnableQuestionnaire(!enableQuestionnaire)} />
                <div className={`block w-14 h-8 rounded-full transition-colors ${enableQuestionnaire ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enableQuestionnaire ? 'transform translate-x-6' : ''}`}></div>
              </div>
            </label>
          </div>
          
          {enableQuestionnaire && (
            <CardContent className="p-6 space-y-8 bg-slate-50/30">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-slate-200 text-slate-600 text-sm shadow-sm">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-slate-400" />
                <p>Create strict requirements. Candidates must select the correct requirement option. Their responses directly influence their overall application score.</p>
              </div>

              {questions.map((q, qIndex) => (
                <div key={q.id} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm relative group animate-in slide-in-from-bottom-4">
                  <button onClick={() => handleRemoveQuestion(q.id)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                  
                  <div className="space-y-6">
                    <div className="space-y-2 pr-12">
                      <Label className="font-bold text-slate-700">Requirement Question {qIndex + 1}</Label>
                      <Input 
                        placeholder="e.g., Are you willing to relocate to New York?" 
                        value={q.text} 
                        onChange={(e) => handleUpdateQuestion(q.id, 'text', e.target.value)} 
                        className="h-12 border-slate-300"
                      />
                    </div>

                    <div className="space-y-3 pl-4 border-l-2 border-slate-100">
                      <Label className="font-bold text-slate-700 text-xs uppercase tracking-wider">Candidate Options & Correct Requirement</Label>
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-3">
                          <button 
                            onClick={() => handleUpdateQuestion(q.id, 'correct', opt)}
                            disabled={!opt.trim()}
                            className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors
                              ${!opt.trim() ? 'border-slate-200 bg-slate-100 cursor-not-allowed' : 
                                q.correct === opt ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-400'}`}
                            title="Mark as correct requirement"
                          >
                            {q.correct === opt && <CheckCircle2 className="h-4 w-4" />}
                          </button>
                          <Input 
                            placeholder={`Option ${optIndex + 1}`} 
                            value={opt} 
                            onChange={(e) => handleUpdateOption(q.id, optIndex, e.target.value)} 
                            className={`flex-1 ${q.correct === opt ? 'border-emerald-200 bg-emerald-50/30' : ''}`}
                          />
                          <button onClick={() => handleRemoveOption(q.id, optIndex)} disabled={q.options.length <= 2} className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-50">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" onClick={() => handleAddOption(q.id)} className="text-indigo-600 mt-2 hover:bg-indigo-50">
                        <Plus className="h-4 w-4 mr-1" /> Add Option
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <Button onClick={handleAddQuestion} variant="outline" className="w-full h-14 border-dashed border-2 border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                <Plus className="h-5 w-5 mr-2" /> Add Requirement Question
              </Button>
            </CardContent>
          )}
        </Card>

      </main>
    </div>
  );
}