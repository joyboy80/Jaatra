import { Bot, Send, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { askSafarAI, suggestedQuestions } from "../../services/aiService";
import Button from "../common/Button";
import Loading from "../common/Loading";

const welcome = { id: "welcome", role: "assistant", text: "I use your authorized SAFAR transport data. Ask about your buses, schedules, tracking, reservations, tickets, or seats." };

export default function AIChatPanel({ onClose, floating = false }) {
  const [messages, setMessages] = useState([welcome]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function submit(event) {
    event?.preventDefault();
    const text = question.trim();
    if (!text || loading) return;
    
    // Remove previous error messages before continuing
    const validMessages = messages.filter(msg => !msg.error);
    
    setMessages([...validMessages, { id: `user-${Date.now()}`, role: "user", text }]);
    setQuestion(""); 
    setLoading(true);
    
    try {
      const response = await askSafarAI(text, validMessages);
      setMessages((items) => [...items, { id: `assistant-${Date.now()}`, role: "assistant", text: response.answer }]);
    } catch (error) {
      setMessages((items) => [...items, { id: `error-${Date.now()}`, role: "assistant", error: true, text: error.message }]);
    } finally { 
      setLoading(false); 
    }
  }

  return (
    <div className={`ai-shell flex h-full min-h-0 flex-col overflow-hidden bg-white/80 backdrop-blur-3xl dark:bg-slate-900/80 ${floating ? "sm:rounded-3xl sm:shadow-float sm:ring-1 sm:ring-white/20" : "rounded-3xl shadow-sm ring-1 ring-slate-200/50"}`}>
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200/50 bg-white/50 px-6 py-4 dark:border-slate-800/50 dark:bg-slate-900/50">
        <div className="flex min-w-0 items-center gap-4">
          <div className="ai-avatar grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-lg">
            <Bot className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold text-safar-ink">Safar AI</h2>
            <p className="truncate text-xs font-medium text-safar-gray">Intelligent Transport Assistant</p>
          </div>
        </div>
        {onClose && (
          <button className="focus-ring icon-button rounded-full" onClick={onClose} aria-label="Close SAFAR AI">
            <X className="h-5 w-5" />
          </button>
        )}
      </header>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6 scroll-smooth">
        {messages.length === 1 && !loading && (
          <div className="my-8 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="mb-4 grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-brand-maroon/20 to-brand-cyan/20 shadow-inner">
              <Bot className="h-12 w-12 text-brand-maroon dark:text-pink-400" />
            </div>
            <h3 className="font-display text-2xl font-bold text-gradient">Hi, I'm Safar AI 👋</h3>
            <p className="mt-3 max-w-[280px] text-sm text-safar-gray leading-relaxed">
              Your intelligent transportation assistant. Ask me about buses, routes, schedules, locations, and travel information.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <article key={message.id} className={`flex gap-3 animate-slide-up ${message.role === "user" ? "justify-end" : ""}`}>
            {message.role !== "user" && (
              <span className="ai-avatar grid h-8 w-8 shrink-0 place-items-center rounded-full text-white shadow-sm mt-1">
                <Bot className="h-4 w-4" />
              </span>
            )}
            
            <p className={`max-w-[85%] whitespace-pre-wrap rounded-3xl px-5 py-3 text-sm leading-relaxed shadow-sm ${
              message.role === "user" 
                ? "rounded-tr-none bg-slate-100 text-safar-ink dark:bg-slate-800 dark:text-white" 
                : message.error 
                  ? "rounded-tl-none bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:ring-red-900" 
                  : "rounded-tl-none bg-gradient-to-br from-brand-maroon/5 to-brand-purple/5 text-safar-ink ring-1 ring-brand-purple/20 dark:from-pink-900/10 dark:to-purple-900/10 dark:text-slate-100 dark:ring-purple-500/30"
            }`}>
              {message.text}
            </p>

            {message.role === "user" && (
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-200 text-safar-gray dark:bg-slate-700 dark:text-slate-300 mt-1">
                <UserRound className="h-4 w-4" />
              </span>
            )}
          </article>
        ))}

        {loading && (
          <article className="flex gap-3 animate-fade-in">
            <span className="ai-avatar grid h-8 w-8 shrink-0 place-items-center rounded-full text-white shadow-sm mt-1">
              <Bot className="h-4 w-4" />
            </span>
            <div className="flex h-[44px] w-[60px] items-center justify-center gap-1.5 rounded-3xl rounded-tl-none bg-gradient-to-br from-brand-maroon/5 to-brand-purple/5 ring-1 ring-brand-purple/20 dark:from-pink-900/10 dark:to-purple-900/10 dark:ring-purple-500/30">
              <span className="h-2 w-2 animate-bounce rounded-full bg-brand-purple" style={{ animationDelay: "0ms" }}></span>
              <span className="h-2 w-2 animate-bounce rounded-full bg-brand-purple" style={{ animationDelay: "150ms" }}></span>
              <span className="h-2 w-2 animate-bounce rounded-full bg-brand-purple" style={{ animationDelay: "300ms" }}></span>
            </div>
          </article>
        )}
        <div ref={endRef} />
      </div>

      <div className="shrink-0 bg-white/50 p-4 backdrop-blur-md border-t border-slate-200/50 dark:bg-slate-900/50 dark:border-slate-800/50">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {suggestedQuestions.map((item) => (
            <button key={item} type="button" className="focus-ring shrink-0 rounded-full bg-brand-cyan/10 px-4 py-2 text-xs font-semibold text-brand-cyan hover:bg-brand-cyan hover:text-white transition-colors duration-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:hover:bg-cyan-600 dark:hover:text-white" onClick={() => { setQuestion(item); }}>
              {item}
            </button>
          ))}
        </div>
        <form className="flex gap-2" onSubmit={submit}>
          <input className="focus-ring min-w-0 flex-1 rounded-full border border-slate-300 bg-white/80 px-5 py-3 text-sm text-safar-ink shadow-inner placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask Safar AI..." maxLength={600} />
          <button type="submit" disabled={!question.trim() || loading} className="ai-fab grid h-12 w-12 shrink-0 place-items-center rounded-full text-white disabled:pointer-events-none disabled:opacity-50" aria-label="Send question">
            {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Send className="h-5 w-5 ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
