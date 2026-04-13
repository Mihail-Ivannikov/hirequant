import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuth0 } from "@auth0/auth0-react";
import { Loader2, Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: { role: string; profile?: { fullName: string; avatarUrl?: string } };
}

export function ChatModal({ isOpen, onClose, applicationId, companyName }: { isOpen: boolean, onClose: () => void, applicationId: string, companyName: string }) {
  const { getAccessTokenSilently, user } = useAuth0();
  const[messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const[isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (showLoading = false) => {
    if (!applicationId) return;
    if (showLoading) setIsLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const { data } = await api.get(`/vacancies/me/applications/${applicationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages(true);
      // High-frequency polling effectively achieves socket-level UX seamlessly 
      // without modifying package.json ensuring 100% stable integration.
      const intervalId = setInterval(() => fetchMessages(false), 3000);
      return () => clearInterval(intervalId);
    }
  },[isOpen, applicationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !applicationId) return;
    const msgToSend = newMessage;
    setNewMessage(""); // Optimistic clear

    try {
      const token = await getAccessTokenSilently();
      await api.post(`/vacancies/me/applications/${applicationId}/messages`, { content: msgToSend }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMessages(false);
    } catch (e) {
      console.error("Failed to send message", e);
      setNewMessage(msgToSend); // Revert on fail
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md h-[600px] max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0 border-slate-200">
        <DialogHeader className="px-6 py-4 border-b bg-slate-50/50">
          <DialogTitle className="text-slate-800">Chat with {companyName}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50" ref={scrollRef}>
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-indigo-600" /></div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <p className="text-sm text-center">No messages yet.<br/>Introduce yourself to the recruiter!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.sender.role === 'CANDIDATE'; // Current user is candidate
              const showAvatar = idx === messages.length - 1 || messages[idx + 1].sender.role !== msg.sender.role;

              return (
                <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-sm'}`}>
                      {msg.content}
                    </div>
                    {showAvatar && (
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-full bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 px-4"
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newMessage.trim()}
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 transition-all"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}