import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChatInterface } from "./ChatInterface";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  companyName: string;
}

export function ChatModal({ isOpen, onClose, applicationId, companyName }: ChatModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md h-[600px] max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0 border-slate-200 shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b bg-slate-50/80 shrink-0">
          <DialogTitle className="text-slate-800">Chat with {companyName}</DialogTitle>
        </DialogHeader>
        
        {isOpen && (
          <div className="flex-1 overflow-hidden relative">
             <ChatInterface applicationId={applicationId} currentRole="CANDIDATE" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}