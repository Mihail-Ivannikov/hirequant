import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  UploadCloud,
  User,
  BrainCircuit,
  Loader2,
  X,
  AlertCircle,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Info,
} from "lucide-react";

interface JobContext {
  id: string;
  title: string;
  company: string;
}

interface Question {
  id: string;
  text: string;
  options: string[];
}

export default function ApplicationWizardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    user,
    getAccessTokenSilently,
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useAuth0();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [job, setJob] = useState<JobContext | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedIn: "",
    resumeOption: "profile",
    coverLetter: "",
    answers: {} as Record<string, string>,
  });

  useEffect(() => {
    const initializeWizard = async () => {
      if (isAuthLoading) return;

      if (!isAuthenticated || !user) {
        navigate(`/jobs/${id}`);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
        fullName: user.name || "",
      }));

      try {
        const token = await getAccessTokenSilently();
        const headers = { Authorization: `Bearer ${token}` };

        const jobRes = await api.get(`/vacancies/${id}`, { headers });
        setJob({
          id: jobRes.data.id,
          title: jobRes.data.title,
          company: jobRes.data.company,
        });

        const questionsRes = await api.get(`/vacancies/${id}/questions`, {
          headers,
        });
        console.log(
          "System: Questions synchronized from DB:",
          questionsRes.data,
        );
        setQuestions(questionsRes.data || []);

        try {
          const userRes = await api.get("/users/me", { headers });
          if (userRes.data?.profile) {
            setFormData((prev) => ({
              ...prev,
              fullName: userRes.data.profile.fullName || prev.fullName,
            }));
          }
        } catch (profileErr) {
          console.log(
            "System: No DB profile record found, proceeding with account defaults.",
          );
        }
      } catch (error: any) {
        console.error("System: Critical wizard initialization failure:", error);
        toast({
          variant: "destructive",
          title: "Synchronization Error",
          description:
            "Could not establish a secure connection with the HR microservice.",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    initializeWizard();
  }, [
    id,
    isAuthenticated,
    isAuthLoading,
    getAccessTokenSilently,
    navigate,
    user,
    toast,
  ]);

  const handleNextStep = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setStep((prev) => prev - 1);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Blocked",
          description:
            "The selected resume exceeds the 5MB limit. Please upload a compressed PDF.",
        });
        return;
      }
      setSelectedFile(file);
      setFormData((prev) => ({ ...prev, resumeOption: "upload" }));
    }
  };

  const onFinalSubmission = async () => {
    setIsSubmitting(true);
    try {
      const token = await getAccessTokenSilently();

      const payload = new FormData();
      payload.append("fullName", formData.fullName);
      payload.append("coverLetter", formData.coverLetter);
      payload.append("resumeOption", formData.resumeOption);

      payload.append("answers", JSON.stringify(formData.answers));

      if (formData.resumeOption === "upload" && selectedFile) {
        payload.append("resume", selectedFile);
      }

      const response = await api.post(`/vacancies/${id}/apply`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast({
          title: "Application Received 🚀",
          description: `Score: ${response.data.score || 0}% - Your competency vector has been saved.`,
        });

        setTimeout(() => {
          navigate("/jobs");
        }, 2000);
      }
    } catch (err: any) {
      console.error("System: Application submission crash:", err);
      const serverMsg =
        err.response?.data?.message ||
        "Verify your internet connection and file format.";
      toast({
        variant: "destructive",
        title: "Submission Failure",
        description: serverMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 gap-6">
        <Loader2 className="h-14 w-14 animate-spin text-indigo-600" />
        <div className="text-center">
          <p className="text-lg font-bold text-slate-800 tracking-tight">
            Syncing HR Wizard
          </p>
          <p className="text-sm text-slate-400 animate-pulse">
            Initializing competency analysis environment...
          </p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-2xl">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">
              Vacancy Not Found
            </h2>
            <p className="text-slate-500">
              The job you are looking for might have been closed or the ID is
              invalid.
            </p>
          </div>
          <Button
            className="w-full bg-indigo-600 py-6 text-lg font-bold"
            onClick={() => navigate("/jobs")}
          >
            Return to Job Market
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link
              to={`/jobs/${id}`}
              className="group p-2 rounded-full hover:bg-slate-100 transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-slate-400 group-hover:text-slate-900" />
            </Link>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-slate-900 leading-none">
                {job.title}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Briefcase className="h-3 w-3 text-indigo-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {job.company}
                </span>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-indigo-600 uppercase">
                Application Progress
              </span>
              <span className="text-sm font-bold text-slate-900">
                Step {step} of 4
              </span>
            </div>
            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-700"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-12">
        <div className="mb-14 flex items-center justify-between px-2 max-w-2xl mx-auto relative">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="flex flex-col items-center gap-3 relative flex-1"
            >
              {s < 4 && (
                <div
                  className={`absolute left-[50%] top-[20px] w-full h-[3px] -z-0 transition-colors duration-1000 ${step > s ? "bg-indigo-600" : "bg-slate-200"}`}
                />
              )}

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full border-4 z-10 transition-all duration-700
                ${step >= s ? "border-indigo-600 bg-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-110" : "border-slate-200 bg-white text-slate-400"}
              `}
              >
                {step > s ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <span className="text-sm font-black">{s}</span>
                )}
              </div>
              <span
                className={`text-[10px] uppercase tracking-tighter font-black ${step >= s ? "text-indigo-600" : "text-slate-400"}`}
              >
                {s === 1
                  ? "Contact"
                  : s === 2
                    ? "Resume"
                    : s === 3
                      ? "Analysis"
                      : "Review"}
              </span>
            </div>
          ))}
        </div>

        <Card className="border-slate-200 shadow-2xl shadow-slate-300/30 rounded-[2.5rem] overflow-hidden bg-white border-none">
          <CardContent className="p-0">
            {step === 1 && (
              <div className="p-8 md:p-14 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest">
                    <User className="h-3 w-3" /> Basic Info
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                    Personal Details
                  </h2>
                  <p className="text-slate-500 font-medium">
                    Verify your primary contact records as they appear in our
                    database.
                  </p>
                </div>
                <Separator className="bg-slate-100" />

                <div className="grid gap-10 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label className="font-black text-slate-700 ml-1 text-xs uppercase tracking-widest">
                      Full Legal Name
                    </Label>
                    <Input
                      className="h-14 rounded-2xl border-slate-200 px-5 text-base font-medium focus:ring-4 focus:ring-indigo-50 transition-all"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-black text-slate-700 ml-1 text-xs uppercase tracking-widest">
                      Verified Email
                    </Label>
                    <Input
                      className="h-14 rounded-2xl bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed px-5"
                      value={formData.email}
                      disabled
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-black text-slate-700 ml-1 text-xs uppercase tracking-widest">
                      Mobile Number
                    </Label>
                    <Input
                      className="h-14 rounded-2xl border-slate-200 px-5 text-base font-medium"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-black text-slate-700 ml-1 text-xs uppercase tracking-widest">
                      Portfolio / LinkedIn
                    </Label>
                    <Input
                      className="h-14 rounded-2xl border-slate-200 px-5 text-base font-medium"
                      placeholder="https://linkedin.com/in/..."
                      value={formData.linkedIn}
                      onChange={(e) =>
                        setFormData({ ...formData, linkedIn: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 flex items-start gap-4 border border-slate-100">
                  <Info className="h-5 w-5 text-slate-400 mt-0.5" />
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    <b>Note:</b> Your email address is synchronized with your
                    Auth0 identity. If you need to change it, please update your
                    account settings.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="p-8 md:p-14 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                    <FileText className="h-3 w-3" /> Document Analysis
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                    Resume Source
                  </h2>
                  <p className="text-slate-500 font-medium">
                    Our AI model will parse this file to calculate your vector
                    match score.
                  </p>
                </div>
                <Separator className="bg-slate-100" />

                <RadioGroup
                  value={formData.resumeOption}
                  onValueChange={(v) =>
                    setFormData({ ...formData, resumeOption: v })
                  }
                  className="grid gap-6"
                >
                  <label
                    className={`group flex cursor-pointer items-start gap-6 rounded-[2rem] border-2 p-8 transition-all duration-500 ${formData.resumeOption === "profile" ? "border-indigo-600 bg-indigo-50/50 shadow-xl shadow-indigo-100" : "border-slate-100 hover:border-slate-300 hover:bg-slate-50/30"}`}
                  >
                    <RadioGroupItem value="profile" className="mt-1.5" />
                    <div className="flex-1">
                      <div className="font-black text-slate-900 text-lg flex items-center gap-3">
                        <ShieldCheck className="h-6 w-6 text-indigo-600" />{" "}
                        Master Profile CV
                      </div>
                      <p className="text-sm text-slate-500 mt-2">
                        Use the primary resume attached to your global profile.
                        Recommended for general applications.
                      </p>
                      <div className="mt-6 flex items-center gap-4 text-xs font-bold text-slate-400 bg-white w-fit px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                        <FileText className="h-4 w-4 text-red-500" />{" "}
                        master_curriculum_vitae_final.pdf
                        <span className="bg-slate-50 px-2 py-1 rounded-md ml-2">
                          PDF • 1.2 MB
                        </span>
                      </div>
                    </div>
                  </label>

                  <div
                    className={`group flex cursor-pointer items-start gap-6 rounded-[2rem] border-2 p-8 transition-all duration-500 ${formData.resumeOption === "upload" ? "border-indigo-600 bg-indigo-50/50 shadow-xl shadow-indigo-100" : "border-slate-100 hover:border-slate-300 hover:bg-slate-50/30"}`}
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        resumeOption: "upload",
                      }));
                      fileInputRef.current?.click();
                    }}
                  >
                    <RadioGroupItem
                      value="upload"
                      className="mt-1.5"
                      checked={formData.resumeOption === "upload"}
                    />
                    <div className="flex-1">
                      <div className="font-black text-slate-900 text-lg flex items-center gap-3">
                        <UploadCloud className="h-6 w-6 text-indigo-600" />{" "}
                        Targeted Application CV
                      </div>
                      <p className="text-sm text-slate-500 mt-2">
                        Upload a specific CV tailored to this role. Our AI
                        prioritizes specific experience over general claims.
                      </p>

                      <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        accept=".pdf,.docx"
                        onChange={onFileChange}
                        onClick={(e) => e.stopPropagation()}
                      />

                      {selectedFile ? (
                        <div className="mt-6 flex items-center justify-between p-4 bg-white rounded-2xl border border-indigo-200 text-indigo-700 text-xs shadow-lg animate-in zoom-in-95">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                              <FileText className="h-5 w-5" />
                            </div>
                            <span className="truncate max-w-[200px] font-black uppercase tracking-tight">
                              {selectedFile.name}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                            }}
                            className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all"
                          >
                            <X className="h-6 w-6" />
                          </button>
                        </div>
                      ) : (
                        <div className="mt-6 py-12 border-4 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center bg-slate-50/20 group-hover:bg-white group-hover:border-indigo-200 transition-all">
                          <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-50 mb-4">
                            <UploadCloud className="h-10 w-10 text-indigo-400" />
                          </div>
                          <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest">
                            Click to Browse for File
                          </p>
                          <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase tracking-widest">
                            Supported formats: PDF, DOCX (5MB Max)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}

            {step === 3 && (
              <div className="p-8 md:p-14 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900 text-white text-[10px] font-black uppercase tracking-widest">
                    <BrainCircuit className="h-3 w-3" /> Pre-screening Logic
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                    Requirement Check
                  </h2>
                  <p className="text-slate-500 font-medium italic">
                    Please answer these questions to confirm you meet the role's
                    core requirements.
                  </p>
                </div>

                <div className="flex items-center gap-6 rounded-[2rem] bg-slate-900 p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
                  <div className="absolute right-[-10%] top-[-10%] opacity-10">
                    <BrainCircuit className="h-40 w-40" />
                  </div>
                  <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-500/30">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-black tracking-tight">
                      Pre-screening System Active
                    </p>
                    <p className="text-xs text-indigo-200 font-medium leading-relaxed max-w-sm">
                      Your answers help us quickly determine if you meet the
                      essential criteria for this role before the technical
                      interview stage.
                    </p>
                  </div>
                </div>

                <Separator className="bg-slate-100" />

                {questions.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                    <CheckCircle2 className="h-20 w-20 text-indigo-600 mx-auto mb-6 opacity-20" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-sm">
                      No pre-screening required.
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      Your CV analysis provides sufficient data for this role.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-20">
                    {questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="space-y-10 animate-in slide-in-from-left-6"
                        style={{ animationDelay: `${idx * 150}ms` }}
                      >
                        <div className="flex items-start gap-6">
                          <div className="bg-slate-900 text-white h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 shadow-lg mt-1">
                            {idx + 1}
                          </div>
                          <p className="font-black text-slate-900 text-2xl leading-[1.2] tracking-tight pt-1">
                            {q.text}
                          </p>
                        </div>

                        <RadioGroup
                          onValueChange={(val) => {
                            console.log(
                              `System: Answer for ${q.id} updated to ->`,
                              val,
                            );
                            setFormData((prev) => ({
                              ...prev,
                              answers: { ...prev.answers, [q.id]: val },
                            }));
                          }}
                          value={formData.answers[q.id] || ""}
                          className="grid gap-4 pl-16"
                        >
                          {q.options.map((opt) => (
                            <div
                              key={opt}
                              className={`flex items-center space-x-5 group p-5 rounded-2xl border-2 transition-all cursor-pointer ${formData.answers[q.id] === opt ? "border-indigo-600 bg-white shadow-md" : "border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-200"}`}
                            >
                              <RadioGroupItem
                                value={opt}
                                id={`${q.id}-${opt}`}
                              />
                              <Label
                                htmlFor={`${q.id}-${opt}`}
                                className="font-bold text-slate-700 group-hover:text-indigo-600 cursor-pointer text-lg transition-colors flex-1"
                              >
                                {opt}
                              </Label>
                              <ChevronRight
                                className={`h-5 w-5 text-indigo-200 opacity-0 group-hover:opacity-100 transition-all ${formData.answers[q.id] === opt ? "opacity-100 text-indigo-600" : ""}`}
                              />
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="p-8 md:p-14 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest">
                    <ExternalLink className="h-3 w-3" /> Finalization
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                    Final Verification
                  </h2>
                  <p className="text-slate-500 font-medium">
                    Add context to your vector and execute the submission
                    protocols.
                  </p>
                </div>
                <Separator className="bg-slate-100" />

                <div className="space-y-4">
                  <Label className="font-black text-slate-700 uppercase tracking-[0.2em] text-[10px] ml-1">
                    Strategic Cover Letter (Optional)
                  </Label>
                  <textarea
                    className="w-full min-h-[220px] rounded-3xl border-2 border-slate-100 bg-slate-50 px-6 py-6 text-base font-medium focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 shadow-inner"
                    placeholder="Briefly describe why your unique skill vector makes you the ideal candidate..."
                    value={formData.coverLetter}
                    onChange={(e) =>
                      setFormData({ ...formData, coverLetter: e.target.value })
                    }
                  />
                </div>

                <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-10 space-y-8 shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 p-10 opacity-[0.03]">
                    <CheckCircle2 className="h-60 w-60" />
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-sm border border-indigo-100">
                      <User className="h-7 w-7 text-indigo-600" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-slate-400 block tracking-widest mb-1">
                        Applying Account
                      </span>
                      <span className="text-xl font-black text-slate-900 leading-none">
                        {formData.fullName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-sm border border-indigo-100">
                      <FileText className="h-7 w-7 text-indigo-600" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-slate-400 block tracking-widest mb-1">
                        Document Payload
                      </span>
                      <span className="text-xl font-black text-slate-900 leading-none">
                        {formData.resumeOption === "profile"
                          ? "Global Profile Resume"
                          : selectedFile?.name || "ERROR: NO FILE SELECTED"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-sm border border-indigo-100">
                      <BrainCircuit className="h-7 w-7 text-indigo-600" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-slate-400 block tracking-widest mb-1">
                        Assessment State
                      </span>
                      <span className="text-xl font-black text-slate-900 leading-none">
                        {Object.keys(formData.answers).length} of{" "}
                        {questions.length} Verifications Logic Completed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-14 flex items-center justify-between max-w-3xl mx-auto px-4">
          <Button
            variant="ghost"
            onClick={
              step === 1 ? () => navigate(`/jobs/${id}`) : handlePreviousStep
            }
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest text-[11px] h-14 px-8 rounded-2xl hover:bg-slate-100 transition-all"
          >
            {step === 1 ? "Cancel Protocol" : "Back Track"}
          </Button>

          {step < 4 ? (
            <Button
              onClick={handleNextStep}
              className="bg-indigo-600 hover:bg-indigo-700 px-12 h-16 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-300 transition-all active:scale-95 group"
            >
              Next Step{" "}
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          ) : (
            <Button
              onClick={onFinalSubmission}
              className="bg-indigo-600 hover:bg-indigo-700 px-12 h-16 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-300 transition-all active:scale-95 disabled:bg-slate-200 disabled:shadow-none"
              disabled={
                isSubmitting ||
                (formData.resumeOption === "upload" && !selectedFile)
              }
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Analyzing Competency...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span>Execute Application</span>
                  <ExternalLink className="h-4 w-4" />
                </div>
              )}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
