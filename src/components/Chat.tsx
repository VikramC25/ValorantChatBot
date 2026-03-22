"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Crosshair, Map, TrendingUp, ShieldAlert, User, Bot, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  { icon: TrendingUp, text: "Help me rank up", prompt: "I'm stuck in my current rank, how do I rank up faster?" },
  { icon: User, text: "Best agent for me", prompt: "What are the best agents for beginners to learn?" },
  { icon: Crosshair, text: "Improve aim", prompt: "How can I improve my crosshair placement and raw aim?" },
  { icon: Map, text: "Map strategies", prompt: "Give me some general map strategies for attacker and defender sides." },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Guided Flow State
  const [isGuidedFlow, setIsGuidedFlow] = useState(false);
  const [guidedStep, setGuidedStep] = useState(0); // 0=Rank, 1=Agent, 2=Struggle
  const [guidedData, setGuidedData] = useState({ rank: "", agent: "", struggle: "" });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleReset = () => {
    setMessages([]);
    setInput("");
    setError(null);
    setIsGuidedFlow(false);
    setGuidedStep(0);
    setGuidedData({ rank: "", agent: "", struggle: "" });
  };

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const newMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error("Coach lost connection. Try again.");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white text-black font-mono selection:bg-minuit-orange selection:text-black">
      {/* Header */}
      <header className="flex-none p-4 border-b-2 border-black bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={handleReset} className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-widest lowercase">valorant coach <span className="text-black"></span></h1>
              <p className="text-xs text-minuit-grey font-bold tracking-widest lowercase">tactical ai assistant</p>
            </div>
          </button>
          
          {messages.length > 0 && (
            <button 
              onClick={handleReset}
              className="text-sm font-bold text-white bg-black hover:bg-minuit-grey transition-colors border-2 border-black px-4 py-1.5 lowercase tracking-wider"
            >
              new chat
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative p-4 pb-32 flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          
          {messages.length === 0 ? (
            isGuidedFlow ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center w-full max-w-md mx-auto my-auto py-8"
              >
                <div className="bg-white border-2 border-black p-8 w-full shadow-none space-y-6 relative">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-black lowercase tracking-widest">guided coaching</h3>
                    <span className="text-minuit-orange font-bold text-sm">Step {guidedStep + 1}/3</span>
                  </div>
                  
                  {guidedStep === 0 && (
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-minuit-grey lowercase tracking-widest">What is your current Rank?</label>
                      <input 
                        autoFocus
                        placeholder="e.g. silver 2, ascendant 1"
                        className="w-full bg-minuit-light border-2 border-transparent focus:border-minuit-orange focus:bg-white p-3 text-black outline-none transition-colors"
                        value={guidedData.rank}
                        onChange={e => setGuidedData({...guidedData, rank: e.target.value})}
                        onKeyDown={e => e.key === 'Enter' && guidedData.rank && setGuidedStep(1)}
                      />
                    </div>
                  )}
                  {guidedStep === 1 && (
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-minuit-grey lowercase tracking-widest">Who is your Main Agent?</label>
                      <input 
                        autoFocus
                        placeholder="e.g. jett, omen, killjoy"
                        className="w-full bg-minuit-light border-2 border-transparent focus:border-minuit-orange focus:bg-white p-3 text-black outline-none transition-colors"
                        value={guidedData.agent}
                        onChange={e => setGuidedData({...guidedData, agent: e.target.value})}
                        onKeyDown={e => e.key === 'Enter' && guidedData.agent && setGuidedStep(2)}
                      />
                    </div>
                  )}
                  {guidedStep === 2 && (
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-minuit-grey lowercase tracking-widest">What's your biggest struggle?</label>
                      <textarea 
                        autoFocus
                        placeholder="e.g. i lose every aim duel, or i don't know how to entry"
                        className="w-full bg-minuit-light border-2 border-transparent focus:border-minuit-orange focus:bg-white p-3 text-black outline-none transition-colors min-h-[100px] resize-none"
                        value={guidedData.struggle}
                        onChange={e => setGuidedData({...guidedData, struggle: e.target.value})}
                      />
                    </div>
                  )}

                  <div className="flex gap-0 pt-4 border-2 border-black mt-6">
                    <button 
                      onClick={() => {
                        if (guidedStep > 0) setGuidedStep(guidedStep - 1);
                        else setIsGuidedFlow(false);
                      }}
                      className="flex-1 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-minuit-light transition-colors border-r-2 border-black"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => {
                        if (guidedStep < 2) {
                          if (guidedStep === 0 && !guidedData.rank) return;
                          if (guidedStep === 1 && !guidedData.agent) return;
                          setGuidedStep(guidedStep + 1);
                        } else {
                          if (!guidedData.struggle) return;
                          const prompt = `I am currently Rank: ${guidedData.rank}. My main agent is: ${guidedData.agent}. My biggest struggle is: ${guidedData.struggle}. Please give me a personalized coaching plan to help me rank up based on this.`;
                          setIsGuidedFlow(false);
                          handleSubmit(prompt);
                        }
                      }}
                      className="flex-1 py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-minuit-grey transition-colors"
                    >
                      {guidedStep === 2 ? "Get Plan" : "Next"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center space-y-10 my-auto py-8 w-full"
              >
                <div className="space-y-6">
                  <h2 className="text-4xl md:text-6xl font-bold lowercase tracking-tighter">
                    rank up <span className="text-minuit-orange">faster</span>
                  </h2>
                  <p className="text-minuit-grey max-w-lg mx-auto text-base tracking-widest lowercase">
                    get real strategies, smarter plays, and tailored advice to climb the ranks.
                  </p>
                  <button 
                    onClick={() => setIsGuidedFlow(true)}
                    className="mt-8 inline-flex items-center gap-3 bg-black text-white px-8 py-4 font-bold tracking-widest lowercase hover:bg-minuit-grey transition-colors border-2 border-black"
                  >
                    <Crosshair className="w-5 h-5" />
                    start guided coaching
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-2 border-black w-full max-w-2xl mx-4">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ backgroundColor: "var(--color-minuit-light)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSubmit(s.prompt)}
                      className={`flex flex-col items-start gap-3 p-6 bg-white hover:text-black transition-colors group text-left border-black ${i === 0 || i === 1 ? 'border-b-2' : ''} ${i % 2 === 0 ? 'border-r-2' : ''}`}
                    >
                      <s.icon className="w-6 h-6 text-minuit-orange" />
                      <span className="font-bold lowercase tracking-widest">{s.text}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )
          ) : (
            <div className="w-full space-y-6 pt-4">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`w-10 h-10 shrink-0 border-2 border-black flex items-center justify-center ${m.role === "user" ? "bg-white" : "bg-black"}`}>
                    {m.role === "user" ? <User className="w-5 h-5 text-black" /> : <Bot className="w-6 h-6 text-white" />}
                  </div>
                  
                  <div className={`max-w-[85%] p-4 whitespace-pre-wrap leading-relaxed ${
                    m.role === "user" 
                      ? "bg-minuit-light text-black border-2 border-transparent" 
                      : "bg-white text-black border-2 border-black"
                  }`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex gap-4 flex-row"
                >
                  <div className="w-10 h-10 border-2 border-black bg-black flex items-center justify-center shrink-0">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-white border-2 border-black p-4 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-minuit-orange" />
                    <span className="text-sm font-bold text-minuit-grey lowercase tracking-widest">analyzing your gameplay...</span>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="bg-red-50 border-2 border-red-500 text-red-600 p-4 text-center text-sm font-bold flex items-center justify-center gap-2 lowercase tracking-widest"
                >
                  <ShieldAlert className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
              
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-10 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(input);
            }}
            className="flex gap-0 items-end bg-white border-2 border-black focus-within:ring-2 focus-within:ring-minuit-orange transition-all"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ask your coach anything..."
              className="w-full bg-transparent resize-none outline-none p-4 text-black placeholder-minuit-grey h-14 font-mono lowercase tracking-wide"
              disabled={isLoading || isGuidedFlow}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || isGuidedFlow}
              className="h-14 w-14 bg-black disabled:bg-minuit-grey text-white flex items-center justify-center transition-colors hover:bg-minuit-grey shrink-0 border-l-2 border-black"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-3 text-xs text-minuit-grey font-bold lowercase tracking-widest">
            ai can make mistakes. verify important strats.
          </div>
        </div>
      </div>
    </div>
  );
}
