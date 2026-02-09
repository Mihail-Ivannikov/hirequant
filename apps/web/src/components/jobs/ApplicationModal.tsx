import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth0 } from "@auth0/auth0-react";
import { FileText, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
}

export function ApplicationModal({ isOpen, onClose, jobTitle }: ApplicationModalProps) {
  const { user } = useAuth0();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleApply = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>Apply for {jobTitle}</DialogTitle>
              <DialogDescription>
                Review your details before submitting your application.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-slate-500">Applicant</Label>
                <div className="col-span-3 font-medium text-slate-900">
                  {user?.name || user?.email}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-slate-500">Resume</Label>
                <div className="col-span-3">
                  <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    <span className="truncate">my_latest_resume.pdf</span>
                    <span className="ml-auto text-xs text-slate-400">PDF • 2.4MB</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="text-sm">
                    <p className="font-semibold text-yellow-800">Short Assessment Required</p>
                    <p className="text-yellow-700 mt-1">
                      This role requires a 5-minute competency quiz based on your resume gaps.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                onClick={handleApply} 
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Application
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-4 rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Application Sent!</h2>
            <p className="mt-2 text-slate-500">
              The employer has been notified. You can track this in your dashboard.
            </p>
            <Button onClick={onClose} className="mt-6">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}