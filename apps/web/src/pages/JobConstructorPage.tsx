import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, BrainCircuit, Loader2, Save, Trash2, Plus, 
  Settings2, Briefcase, Info, CheckCircle2, AlertCircle, X 
} from "lucide-react";

interface QuestionConfig {
  id: string; 
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
  const [isSaving, setIsSaving] = useState(false);

  const[title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const[type, setType] = useState("Full-time");
  const [salaryMin, setSalaryMin] = useState("");
  const[salaryMax, setSalaryMax] = useState("");
  const [description, setDescription] = useState("");
  
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const [enableQuestionnaire, setEnableQuestionnaire] = useState(false);
  const [questions, setQuestions] = useState<QuestionConfig[]>([]);

  useEffect(() => {
    if (isEditMode && isAuthenticated) {
      const fetchJobData = async () => {
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
          
          if (data.salary) {
            const matches = data.salary.match(/\d+/g);
            if (matches) {
              setSalaryMin(matches[0]);
              if (matches[1]) setSalaryMax(matches[1]);
            }
          }

          if (data.questions && data.questions.length > 0) {
            setEnableQuestionnaire(true);
            setQuestions(data.questions.map((q: any) => ({
              id: `q_${Math.random().toString(36).substr(2, 9)}`,
              text: q.text,
              options: q.options,
              correct: q.correct
            })));
          }
        } catch (e) {
          toast({ variant: "destructive", title: "Error", description: "Job not found or access denied." });
          navigate("/employer/dashboard");
        } finally {
          setIsLoading(false);
        }
      };
      fetchJobData();
    }
  },[id, isEditMode, isAuthenticated, getAccessTokenSilently, navigate, toast]);

  const addSkill = () => {
    const val = newSkill.trim();
    if (val && !skills.includes(val)) {
      setSkills([...skills, val]);
    }
    setNewSkill("");
  };

  const removeSkill = (idxToRemove: number) => {
    setSkills(skills.filter((_, idx) => idx !== idxToRemove));
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, {
      id: `q_${Date.now()}`,
      text: "",
      options: ["", ""],
      correct: ""
    }]);
  };

  const handleRemoveQuestion = (qId: string) => {
    setQuestions(questions.filter(q => q.id !== qId));
  };

  const handleUpdateQuestionText = (qId: string, text: string) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, text } : q));
  };

  const handleAddOption = (qId: string) => {
    setQuestions(questions.map(q => 
      q.id === qId ? { ...q, options: [...q.options, ""] } : q
    ));
  };

  const handleUpdateOptionText = (qId: string, optIdx: number, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const oldOptionValue = q.options[optIdx];
        const newOpts = [...q.options];
        newOpts[optIdx] = text;
        
        const newCorrectValue = q.correct === oldOptionValue ? text : q.correct;
        
        return { ...q, options: newOpts, correct: newCorrectValue };
      }
      return q;
    }));
  };

  const handleRemoveOption = (qId: string, optIdxToRemove: number) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const optionBeingRemoved = q.options[optIdxToRemove];
        const newOptions = q.options.filter((_, idx) => idx !== optIdxToRemove);
        
        const newCorrectValue = q.correct === optionBeingRemoved ? "" : q.correct;
        
        return { ...q, options: newOptions, correct: newCorrectValue };
      }
      return q;
    }));
  };

  const handleSetCorrectOption = (qId: string, correctOptionText: string) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, correct: correctOptionText } : q));
  };

  const handleSave = async () => {
    if (!title || !description || skills.length === 0) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Title, description, and at least one skill are required." });
      return;
    }
    
    if (enableQuestionnaire) {
        for (const q of questions) {
            if (!q.text.trim()) {
              return toast({ variant: "destructive", title: "Missing Question Text", description: "All questions must have text." });
            }
            if (q.options.some(opt => !opt.trim())) {
              return toast({ variant: "destructive", title: "Empty Option", description: "All question options must be filled." });
            }
            if (!q.correct) {
              return toast({ variant: "destructive", title: "Missing Answer", description: "You must select a correct requirement answer for every question." });
            }
        }
    }

    setIsSaving(true);
    try {
      const token = await getAccessTokenSilently();
      const payload = {
        title, 
        location, 
        type, 
        description, 
        skills,
        salary: salaryMin && salaryMax ? `$${salaryMin} - $${salaryMax}` : (salaryMin ? `$${salaryMin}` : "Undisclosed"),
        questions: enableQuestionnaire ? questions :[]
      };
      
      if (isEditMode) {
        await api.put(`/vacancies/employer/edit/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await api.post(`/vacancies/employer/create`, payload, { headers: { Authorization: `Bearer ${token}` } });
      }
      
      toast({ title: "Success", description: "Vacancy published successfully." });
      navigate("/employer/dashboard");
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save job." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Header />
      
      <div className="sticky top-16 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto max-w-4xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/employer/dashboard">
              <Button variant="ghost" size="icon" className="hover:bg-slate-100 text-slate-500">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-slate-900">
              {isEditMode ? "Edit Vacancy" : "Create New Vacancy"}
            </h1>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEditMode ? "Save Changes" : "Publish Vacancy"}
          </Button>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
        
        {/* Basic Details Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
              <Briefcase className="h-5 w-5 text-slate-500" /> 
              Job Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Job Title <span className="text-red-500">*</span></Label>
              <Input className="h-12 border-slate-300" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Senior React Developer" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Location</Label>
                <Input className="h-12 border-slate-300" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., New York, NY / Remote" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Work Type</Label>
                <select className="w-full h-12 rounded-md border border-slate-300 bg-white px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" value={type} onChange={e => setType(e.target.value)} >
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
                <Label className="font-bold text-slate-700">Minimum Salary ($)</Label>
                <Input className="h-12 border-slate-300" type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} placeholder="100000" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Maximum Salary ($)</Label>
                <Input className="h-12 border-slate-300" type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} placeholder="150000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Job Description <span className="text-red-500">*</span></Label>
              <textarea className="w-full min-h-[200px] p-4 rounded-md border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-base" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the role, responsibilities, and benefits..." />
            </div>
          </CardContent>
        </Card>

        {/* AI Skills Card */}
        <Card className="border-indigo-200 shadow-md">
          <CardHeader className="bg-indigo-50/50 border-b border-indigo-100">
            <CardTitle className="flex items-center gap-2 text-lg text-indigo-900">
              <BrainCircuit className="h-5 w-5 text-indigo-600" />
              Required Skills (AI Core) <span className="text-red-500">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 p-4 mb-6 bg-indigo-50 rounded-lg border border-indigo-100 text-indigo-800 text-sm">
              <Info className="h-5 w-5 shrink-0 mt-0.5 text-indigo-600" />
              <p>Add key skills and requirements. Our AI matching engine uses these exact terms to parse, evaluate, and rank candidate resumes.</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {skills.length === 0 && <span className="text-slate-400 text-sm italic">No skills added yet. Minimum 1 required.</span>}
              {skills.map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="px-3 py-1.5 text-sm flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">
                  {skill}
                  <X className="h-3.5 w-3.5 cursor-pointer hover:text-red-500 ml-1.5 transition-colors" onClick={() => removeSkill(idx)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                className="h-12 border-slate-300 focus:border-indigo-400 focus:ring-indigo-400" 
                placeholder="Add a required skill (e.g. Node.js)..." 
                value={newSkill} 
                onChange={(e) => setNewSkill(e.target.value)} 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }} 
              />
              <Button onClick={addSkill} variant="secondary" type="button" className="h-12 px-6 border border-slate-200 shadow-sm hover:bg-slate-100">
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Candidate Fit Questionnaire Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
              <Settings2 className="h-5 w-5 text-slate-500" /> 
              Candidate Fit Questionnaire
            </CardTitle>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={enableQuestionnaire} onChange={e => setEnableQuestionnaire(e.target.checked)} />
                <div className={`block w-14 h-8 rounded-full transition-colors ${enableQuestionnaire ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enableQuestionnaire ? 'transform translate-x-6' : ''}`}></div>
              </div>
            </label>
          </CardHeader>
          
          {enableQuestionnaire && (
            <CardContent className="p-6 space-y-8 bg-slate-50/30">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-slate-200 text-slate-600 text-sm shadow-sm">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-slate-400" />
                <p>Create strict requirements. Candidates must select the correct option. Their responses influence their application score.</p>
              </div>
              
              {questions.map((q, qIndex) => (
                <div key={q.id} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm relative group animate-in slide-in-from-bottom-4">
                  <button type="button" onClick={() => handleRemoveQuestion(q.id)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <div className="space-y-6">
                    <div className="space-y-2 pr-12">
                      <Label className="font-bold text-slate-700">Requirement Question {qIndex + 1}</Label>
                      <Input placeholder="e.g., Do you have the right to work in the US?" value={q.text} onChange={(e) => handleUpdateQuestionText(q.id, e.target.value)} className="h-12 border-slate-300 focus:border-indigo-400" />
                    </div>
                    <div className="space-y-3 pl-4 border-l-2 border-slate-100">
                      <Label className="font-bold text-slate-700 text-xs uppercase tracking-wider">Candidate Options & Correct Requirement</Label>
                      
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-3">
                          <button 
                            type="button" 
                            onClick={() => handleSetCorrectOption(q.id, opt)} 
                            disabled={!opt.trim()} 
                            className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${!opt.trim() ? 'border-slate-200 bg-slate-100 cursor-not-allowed' : q.correct === opt ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm' : 'border-slate-300 hover:border-emerald-400'}`} 
                            title="Mark as correct requirement" 
                          >
                            {q.correct === opt && opt !== "" && <CheckCircle2 className="h-4 w-4" />}
                          </button>
                          
                          <Input 
                            placeholder={`Option ${optIndex + 1}`} 
                            value={opt} 
                            onChange={(e) => handleUpdateOptionText(q.id, optIndex, e.target.value)} 
                            className={`h-11 flex-1 ${q.correct === opt && opt !== "" ? 'border-emerald-300 bg-emerald-50/50 focus:border-emerald-500 focus:ring-emerald-500' : 'border-slate-300'}`} 
                          />
                          
                          <button type="button" onClick={() => handleRemoveOption(q.id, optIndex)} disabled={q.options.length <= 2} className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-50 transition-colors">
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                      
                      <Button variant="ghost" size="sm" type="button" onClick={() => handleAddOption(q.id)} className="text-indigo-600 mt-2 hover:bg-indigo-50">
                        <Plus className="h-4 w-4 mr-1" /> Add Option
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button type="button" onClick={handleAddQuestion} variant="outline" className="w-full h-14 border-dashed border-2 border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-sm">
                <Plus className="h-5 w-5 mr-2" /> Add Requirement Question
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}