import { Bot, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import AIChatPanel from "./AIChatPanel";

export default function FloatingAIChat() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  if (location.pathname.endsWith("/ai")) return null;

  return (
    <>
      {!open && <button type="button" className="ai-fab focus-ring fixed bottom-5 right-4 z-40 flex h-14 items-center gap-2 rounded-full px-4 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 sm:right-6" onClick={() => setOpen(true)} aria-label="Open Jaatra AI"><span className="relative"><Bot className="h-5 w-5" /><Sparkles className="absolute -right-2 -top-2 h-3.5 w-3.5 text-cyan-200" /></span><span>Jaatra AI</span></button>}
      {open && <div className="fixed inset-0 z-40 h-[100dvh] w-full sm:inset-auto sm:bottom-5 sm:right-6 sm:h-[min(620px,calc(100vh-40px))] sm:w-[390px]"><AIChatPanel floating onClose={() => setOpen(false)} /></div>}
    </>
  );
}
