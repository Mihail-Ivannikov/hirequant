import { useEffect, useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/hooks/use-user-store";
import {
  User, Mail, MapPin, Phone, Linkedin, Github,
  FileText, UploadCloud, Trash2, Plus, Loader2, Save, Camera, X, ShieldCheck, ShieldAlert, QrCode
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Skill {
  name: string;
  source: 'ai' | 'user';
}

interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  university: string;
  year: string;
}

interface ProfileData {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedInUrl: string;
  githubUrl: string;
  skills: Skill[];
  workExperience: Experience[];
  education: Education[];
  masterResume?: {
    filename: string;
    uploadedAt: string;
  };
  avatarUrl?: string;
  isTwoFactorEnabled?: boolean;
}

export default function CandidateProfilePage() {
  const { user, getAccessTokenSilently, isAuthenticated, isLoading: isAuthLoading } = useAuth0();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [is2FASetupVisible, setIs2FASetupVisible] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);

  const { avatarUrl, setAvatarUrl } = useUserStore();

  const [profile, setProfile] = useState<ProfileData>({
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    linkedInUrl: "",
    githubUrl: "",
    skills: [],
    workExperience: [],
    education: [],
    isTwoFactorEnabled: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthLoading) return;
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const token = await getAccessTokenSilently();
        const response = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const userData = response.data || {};
        const backendProfile = userData.profile || {};
        const backendPhoneAuth = userData.phoneAuth || {}; 

        const safeSkills: Skill[] = (backendProfile.skills || []).map((s: any) =>
          typeof s === 'string' ? { name: s, source: 'user' } : s
        );

        let resumeObj = backendProfile.resumeUrl
          ? { filename: backendProfile.resumeUrl.split('/').pop() || "Resume.pdf", uploadedAt: new Date().toISOString() }
          : undefined;

        const fullProfileData: ProfileData = {
          fullName: backendProfile.fullName || user.name || "",
          headline: backendProfile.headline || "",
          email: user.email || "",
          phone: backendProfile.phone || "",
          location: backendProfile.location || "",
          linkedInUrl: backendProfile.linkedInUrl || "",
          githubUrl: backendProfile.githubUrl || "",
          skills: safeSkills,
          workExperience: backendProfile.workExperience || [],
          education: backendProfile.education || [],
          masterResume: resumeObj,
          avatarUrl: backendProfile.avatarUrl,
          isTwoFactorEnabled: backendPhoneAuth.isTwoFactorEnabled || false,
        };

        setProfile(fullProfileData);

        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const dbAvatarUrl = fullProfileData.avatarUrl
            ? `${baseUrl}/uploads/${fullProfileData.avatarUrl}`
            : null;

        setAvatarUrl(dbAvatarUrl || user.picture || null);

      } catch (error) {
        console.error("Profile load error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, isAuthenticated, isAuthLoading, getAccessTokenSilently, setAvatarUrl]);


  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = await getAccessTokenSilently();

      const payload = {
        fullName: profile.fullName,
        headline: profile.headline,
        phone: profile.phone,
        location: profile.location,
        linkedInUrl: profile.linkedInUrl,
        githubUrl: profile.githubUrl,
        skills: profile.skills,
        workExperience: profile.workExperience,
        education: profile.education,
        avatarUrl: profile.avatarUrl 
      };

      await api.patch('/users/me', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({ title: "Saved", description: "Profile updated successfully." });
    } catch (error) {
      console.error("Save failed:", error);
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    setIsUploading(true);
    try {
      const token = await getAccessTokenSilently();
      const formData = new FormData();
      formData.append('resume', file);

      const response = await api.post('/users/me/resume', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const parsedData = response.data;
      const newSkills = (parsedData.skills || []).map((s: string) => ({ name: s, source: 'ai' }));

      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, ...newSkills],
        masterResume: {
          filename: file.name,
          uploadedAt: new Date().toISOString()
        }
      }));

      toast({ title: "Resume Parsed", description: "Skills extracted successfully!" });
    } catch (error) {
      console.error(error);
      toast({ title: "Upload Failed", description: "Could not parse resume.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    try {
        const token = await getAccessTokenSilently();
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await api.post('/users/me/avatar', formData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        setProfile(prev => ({ ...prev, avatarUrl: response.data.avatarUrl }));

        const objectUrl = URL.createObjectURL(file);
        setAvatarUrl(objectUrl);

        toast({ title: "Avatar Updated", description: "Your new profile picture is set." });
    } catch (error) {
        toast({ title: "Upload Failed", description: "Could not update avatar.", variant: "destructive" });
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setProfile(prev => ({
      ...prev,
      skills: [...prev.skills, { name: newSkill, source: 'user' }]
    }));
    setNewSkill("");
  };

  const removeSkill = (index: number) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const calculateStrength = () => {
    let score = 0;
    if (profile.fullName) score += 20;
    if (profile.headline) score += 20;
    if (profile.location) score += 10;
    if (profile.masterResume) score += 30;
    if (profile.skills.length > 0) score += 20;
    return Math.min(score, 100);
  };

  const handleGenerate2FA = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await api.post('/auth/2fa/generate', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQrCodeUrl(response.data.qrCodeUrl);
      setIs2FASetupVisible(true);
    } catch (error) {
      toast({ title: "Error", description: "Could not generate 2FA QR Code.", variant: "destructive" });
    }
  };

  const handleVerify2FA = async () => {
    if (twoFactorCode.length !== 6) {
      toast({ title: "Invalid Code", description: "Please enter a 6-digit code.", variant: "destructive" });
      return;
    }

    setIsVerifying2FA(true);
    try {
      const token = await getAccessTokenSilently();
      await api.post('/auth/2fa/turn-on', { code: twoFactorCode }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProfile(prev => ({ ...prev, isTwoFactorEnabled: true }));
      setIs2FASetupVisible(false);
      setQrCodeUrl(null);
      setTwoFactorCode("");
      toast({ title: "Success", description: "Two-Factor Authentication is now enabled." });
    } catch (error) {
      toast({ title: "Verification Failed", description: "The code you entered is invalid.", variant: "destructive" });
    } finally {
      setIsVerifying2FA(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <aside className="lg:col-span-4 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">

                  <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                    <div className="h-28 w-28 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-3xl font-bold border-4 border-white shadow-lg overflow-hidden">
                      {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt="Profile"
                            className="h-full w-full object-cover"
                            onError={(e) => { e.currentTarget.src = ""; }} 
                          />
                      ) : (
                          profile.fullName?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-8 w-8 text-white" />
                    </div>
                    <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                  </div>

                  <div className="mt-6 w-full space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400 uppercase tracking-wider font-bold">Full Name</Label>
                      <Input
                        className="text-center font-bold h-10"
                        value={profile.fullName}
                        onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400 uppercase tracking-wider font-bold">Headline</Label>
                      <Input
                        className="text-center text-slate-600 h-10"
                        placeholder="e.g. Senior Developer"
                        value={profile.headline}
                        onChange={(e) => setProfile({...profile, headline: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <Input value={profile.email} disabled className="bg-slate-50 border-none shadow-none" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="+1 (555)..."
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="City, Country"
                      value={profile.location}
                      onChange={(e) => setProfile({...profile, location: e.target.value})}
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-4 w-4 text-blue-600" />
                    <Input
                      placeholder="LinkedIn URL"
                      value={profile.linkedInUrl}
                      onChange={(e) => setProfile({...profile, linkedInUrl: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Github className="h-4 w-4 text-slate-800" />
                    <Input
                      placeholder="GitHub URL"
                      value={profile.githubUrl}
                      onChange={(e) => setProfile({...profile, githubUrl: e.target.value})}
                    />
                  </div>
                </div>

                <div className="mt-8 bg-indigo-50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm font-medium mb-2 text-indigo-900">
                    <span>Profile Strength</span>
                    <span>{calculateStrength()}%</span>
                  </div>
                  <Progress value={calculateStrength()} className="h-2 bg-indigo-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-indigo-100">
              <CardHeader className="bg-slate-50 border-b pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {profile.isTwoFactorEnabled ? (
                  <div className="flex items-center gap-3 bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
                    <ShieldCheck className="h-6 w-6" />
                    <div>
                      <p className="font-semibold">Two-Factor Authentication is ON</p>
                      <p className="text-sm opacity-90">Your account is secured with Google Authenticator.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-800">Two-Factor Authentication is not enabled</p>
                        <p className="text-sm text-slate-500">Protect your account by requiring an additional code to log in.</p>
                      </div>
                    </div>
                    
                    {!is2FASetupVisible ? (
                      <Button variant="outline" onClick={handleGenerate2FA} className="w-full">
                        Set up 2FA
                      </Button>
                    ) : (
                      <div className="bg-slate-50 p-4 rounded-lg border mt-4 space-y-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-slate-700 mb-2">1. Scan this QR code with Google Authenticator or Authy</p>
                          {qrCodeUrl ? (
                            <img src={qrCodeUrl} alt="2FA QR Code" className="mx-auto border p-2 bg-white rounded-md h-40 w-40" />
                          ) : (
                            <div className="h-40 w-40 mx-auto bg-slate-200 animate-pulse rounded-md" />
                          )}
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-2 text-center">2. Enter the 6-digit code from the app</p>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="000000" 
                              className="text-center tracking-widest font-mono text-lg"
                              maxLength={6}
                              value={twoFactorCode}
                              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                            />
                            <Button onClick={handleVerify2FA} disabled={isVerifying2FA} className="bg-indigo-600 hover:bg-indigo-700 min-w-[100px]">
                              {isVerifying2FA ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

          </aside>

          <div className="lg:col-span-8 space-y-6">

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Master Resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.masterResume ? (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-red-100 rounded flex items-center justify-center text-red-600">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{profile.masterResume.filename}</p>
                        <p className="text-xs text-slate-500">Uploaded {new Date(profile.masterResume.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setProfile({...profile, masterResume: undefined})}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-indigo-300 transition-colors bg-slate-50/50">
                    <UploadCloud className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                    <div className="relative inline-block">
                        <Button variant="outline" disabled={isUploading}>
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Browse Files"}
                        </Button>
                        <input
                            type="file"
                            accept=".pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-600" />
                  Key Competencies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-6">
                  {profile.skills.map((skill, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className={`px-3 py-1 text-sm flex items-center gap-1 ${skill.source === 'ai' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-100 text-slate-700'}`}
                    >
                      {skill.name}
                      <X className="h-3 w-3 cursor-pointer hover:text-red-500 ml-1" onClick={() => removeSkill(idx)} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a missing skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button onClick={addSkill} variant="secondary">Add</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Experience & Education
                </CardTitle>
                <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button>
              </CardHeader>
              <CardContent className="text-center py-8 text-slate-500 italic">
                No experience added yet. Upload resume to auto-fill this section.
              </CardContent>
            </Card>

          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 z-40 flex justify-end">
        <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Profile
        </Button>
      </div>
    </div>
  );
}