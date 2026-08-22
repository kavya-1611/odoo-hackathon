import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/client";

export default function CopilotChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your PulseHR Copilot. Try: \"Apply 2 days sick leave from next Monday\" or \"Show my attendance this week.\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setSending(true);

    try {
      const res = await api.post("/ai/chat", { message: text });
      setMessages((m) => [...m, { role: "assistant", text: res.data.reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Sorry, I couldn't process that right now. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-lg flex items-center justify-center z-50 transition-colors"
        aria-label="Toggle AI Copilot"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-24 right-6 w-96 h-[28rem] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden"
          >
            <div className="bg-brand-600 text-white px-4 py-3 flex items-center gap-2">
              <Sparkles size={18} />
              <span className="font-semibold">PulseHR Copilot</span>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                    m.role === "user"
                      ? "bg-brand-600 text-white ml-auto rounded-br-sm"
                      : "bg-slate-100 text-slate-700 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {sending && (
                <div className="bg-slate-100 text-slate-400 text-sm px-3 py-2 rounded-2xl rounded-bl-sm w-fit">
                  Thinking…
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-200 flex gap-2">
              <input
                className="input"
                placeholder="Ask or tell the Copilot something…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={sending}
                className="btn-primary px-3"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
