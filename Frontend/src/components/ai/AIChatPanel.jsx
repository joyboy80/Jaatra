import { Bot, CheckCircle2, Send, Sparkles, Trash2, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "../common/Button";
import Modal from "../common/Modal";
import { useAuth } from "../../context/AuthContext";
import { askJaatraAI, clearConversation, getConversation, saveConversation, suggestedQuestions } from "../../services/aiService";

function RecommendationCard({ recommendation }) {
  return (
    <div className="mt-3 rounded-lg bg-violet-50 p-3 ring-1 ring-violet-100">
      <p className="text-xs font-bold uppercase tracking-wider text-violet-700">Recommended Bus</p>
      <p className="mt-1 text-lg font-bold text-jaatra-ink">{recommendation.busName}</p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div><dt className="text-jaatra-gray">Departure</dt><dd className="font-bold text-jaatra-ink">{recommendation.departureTime}</dd></div>
        <div><dt className="text-jaatra-gray">Arrival</dt><dd className="font-bold text-jaatra-ink">{recommendation.arrivalTime}</dd></div>
        <div className="col-span-2"><dt className="text-jaatra-gray">Available seats</dt><dd className="font-bold text-jaatra-ink">{recommendation.availableSeats}</dd></div>
      </dl>
      <div className="mt-3 space-y-1.5">{recommendation.reasons.map((reason) => <p key={reason} className="flex items-center gap-2 text-xs font-semibold text-jaatra-ink"><CheckCircle2 className="h-3.5 w-3.5 text-cyan-600" />{reason}</p>)}</div>
    </div>
  );
}

export default function AIChatPanel({ onClose, floating = false }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState(() => getConversation(user.id));
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");
  const [clearOpen, setClearOpen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  async function sendMessage(question = input) {
    const prompt = question.trim();
    if (!prompt || typing) return;
    const userMessage = { id: `user-${Date.now()}`, role: "user", content: prompt, timestamp: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date()) };
    const pendingMessages = [...messages, userMessage];
    setMessages(pendingMessages);
    saveConversation(user.id, pendingMessages);
    setInput("");
    setError("");
    setTyping(true);
    try {
      const response = await askJaatraAI({ prompt, user, role: user.role });
      const nextMessages = [...pendingMessages, response];
      setMessages(nextMessages);
      saveConversation(user.id, nextMessages);
    } catch (_error) {
      setError("Jaatra AI could not answer right now. Please try again.");
    } finally {
      setTyping(false);
    }
  }

  function confirmClear() {
    setMessages(clearConversation(user.id));
    setClearOpen(false);
  }

  return (
    <div className={`ai-shell flex h-full min-h-0 flex-col overflow-hidden bg-white ${floating ? "sm:rounded-xl sm:shadow-soft sm:ring-1 sm:ring-slate-200" : "rounded-xl shadow-sm ring-1 ring-slate-200"}`}>
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3"><div className="ai-avatar relative grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white"><Bot className="h-5 w-5" /><span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-cyan-400 ring-2 ring-white" /></div><div className="min-w-0"><h2 className="font-bold text-jaatra-ink">Jaatra AI</h2><p className="truncate text-xs text-jaatra-gray">Context-aware transport assistant</p></div></div>
        <div className="flex gap-1"><button className="focus-ring icon-button" onClick={() => setClearOpen(true)} aria-label="Clear AI conversation"><Trash2 className="h-4 w-4" /></button>{onClose && <button className="focus-ring icon-button" onClick={onClose} aria-label="Close Jaatra AI"><X className="h-5 w-5" /></button>}</div>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4" aria-live="polite">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role === "assistant" && <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-600"><Bot className="h-4 w-4" /></div>}
            <div className={`max-w-[84%] rounded-xl px-3.5 py-3 text-sm leading-6 ${message.role === "user" ? "rounded-br-sm bg-jaatra-teal text-white" : "rounded-bl-sm bg-white text-jaatra-ink shadow-sm ring-1 ring-slate-200"}`}>
              <p>{message.content}</p>
              {message.recommendation && <RecommendationCard recommendation={message.recommendation} />}
              <p className={`mt-1.5 text-[10px] font-semibold ${message.role === "user" ? "text-white/70" : "text-jaatra-gray"}`}>{message.timestamp}</p>
            </div>
            {message.role === "user" && <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-jaatra-navy text-white"><UserRound className="h-4 w-4" /></div>}
          </div>
        ))}
        {typing && <div className="flex items-center gap-2"><div className="grid h-8 w-8 place-items-center rounded-lg bg-violet-100 text-violet-600"><Bot className="h-4 w-4" /></div><div className="flex gap-1 rounded-xl rounded-bl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200" aria-label="Jaatra AI is typing"><span className="h-2 w-2 animate-bounce rounded-full bg-violet-500" /><span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500 [animation-delay:120ms]" /><span className="h-2 w-2 animate-bounce rounded-full bg-violet-500 [animation-delay:240ms]" /></div></div>}
        {error && <div className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">{error}</div>}
      </div>

      <div className="shrink-0 border-t border-slate-100 bg-white p-3">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">{suggestedQuestions.slice(0, floating ? 4 : 6).map((question) => <button key={question} type="button" className="focus-ring min-h-9 shrink-0 rounded-full bg-violet-50 px-3 text-xs font-semibold text-violet-700 ring-1 ring-violet-100 transition hover:bg-cyan-50 hover:text-cyan-700" onClick={() => sendMessage(question)}>{question}</button>)}</div>
        <form className="flex items-end gap-2" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
          <label className="min-w-0 flex-1"><span className="sr-only">Ask Jaatra AI</span><textarea className="focus-ring max-h-28 min-h-11 w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-jaatra-ink" rows="1" placeholder="Ask about buses, routes, or seats" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} /></label>
          <Button className="h-11 w-11 shrink-0 px-0" icon={Send} disabled={!input.trim() || typing} type="submit"><span className="sr-only">Send message</span></Button>
        </form>
        <p className="mt-2 flex items-center justify-center gap-1 text-[10px] font-semibold text-jaatra-gray"><Sparkles className="h-3 w-3" /> Mock AI responses use live Jaatra data</p>
      </div>

      <Modal open={clearOpen} title="Clear AI conversation?" description="Your saved mock conversation history will be removed." confirmLabel="Clear Chat" danger onClose={() => setClearOpen(false)} onConfirm={confirmClear} />
    </div>
  );
}
