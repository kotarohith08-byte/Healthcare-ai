import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  AlertOctagon,
  BookOpen,
  Info,
  RefreshCw,
  Download,
  Volume2,
  VolumeX,
  FileText
} from 'lucide-react';
import { healthcareApi } from '../api/healthcareApi';

const SUGGESTED_PROMPTS = [
  "What is the FAST protocol for identifying a stroke?",
  "What are the early warning signs of a heart attack?",
  "How is Type 2 Diabetes diagnosed using laboratory criteria?",
  "What lifestyle changes effectively reduce high blood pressure?",
  "What are the red flags for secondary headaches (SNOOP criteria)?"
];

export default function ChatbotModule() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content:
        "Hello! I am your **AI Healthcare Assistant**, grounded in verified medical knowledge sources (MedQuAD, NIH, CDC, and WHO clinical literature).\n\n" +
        "You can ask me questions about medical conditions, symptom explanations, laboratory test interpretations, or clinical guidelines in simple language.\n\n" +
        "*How may I assist your medical inquiry today?*",
      sources: [
        { title: 'MedQuAD Clinical QA Corpus', category: 'General', source: 'NIH / NLM Guidelines', relevance: 100 }
      ],
      simplified_terms: {
        'Clinical Literature': 'Published peer-reviewed scientific studies and medical guidelines'
      },
      is_emergency: false
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend = null) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      sources: [],
      simplified_terms: {},
      is_emergency: false
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const response = await healthcareApi.sendChatMessage(sessionId, text);
      if (!sessionId && response.session_id) {
        setSessionId(response.session_id);
      }

      const assistantMsg = {
        id: response.id || Date.now() + 1,
        role: 'assistant',
        content: response.content,
        sources: response.sources || [],
        simplified_terms: response.simplified_terms || {},
        is_emergency: response.is_emergency || false
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat API Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content:
            "⚠️ An error occurred while retrieving clinical knowledge. Please check the backend connection and try again.",
          sources: [],
          simplified_terms: {},
          is_emergency: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportTranscript = () => {
    const transcriptText = messages
      .map(
        (m) =>
          `[${m.role.toUpperCase()}] (${new Date().toLocaleTimeString()}):\n${m.content}\n${
            m.sources && m.sources.length ? `Sources: ${m.sources.map((s) => s.title).join(', ')}\n` : ''
          }\n---`
      )
      .join('\n\n');

    const blob = new Blob([transcriptText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical_consultation_transcript_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSpeech = (text) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_`]/g, ''));
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Chat Header Actions */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-3 bg-slate-900/60">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Medical Knowledge Assistant</span>
              <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] text-cyan-300 font-mono">
                RAG Active
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Retrieval-Augmented Generation • MedQuAD & NIH Guidelines
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportTranscript}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition"
            title="Export Consultation Transcript"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-md ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gradient-to-tr from-cyan-600 to-sky-500 text-white'
              }`}
            >
              {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-2xl rounded-2xl p-4 shadow-lg text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'border border-slate-800 bg-slate-900/90 text-slate-200 rounded-tl-none'
              }`}
            >
              {/* Emergency Alert Tag */}
              {msg.is_emergency && (
                <div className="mb-3 flex items-center space-x-2 rounded-lg border border-rose-500/40 bg-rose-950/40 p-2 text-xs font-semibold text-rose-300">
                  <AlertOctagon className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>EMERGENCY INDICATORS DETECTED IN PROMPT</span>
                </div>
              )}

              {/* Message Content */}
              <div className="whitespace-pre-wrap font-sans text-slate-100">{msg.content}</div>

              {/* Simplified Medical Terms Chips */}
              {msg.simplified_terms && Object.keys(msg.simplified_terms).length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <div className="text-[11px] font-semibold text-cyan-400 mb-2 flex items-center space-x-1">
                    <Info className="h-3 w-3" />
                    <span>Plain-Language Medical Term Definitions:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(msg.simplified_terms).map(([term, def]) => (
                      <span
                        key={term}
                        className="rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-2 py-1 text-[11px] text-cyan-200"
                        title={def}
                      >
                        <strong className="text-cyan-300">{term}:</strong> {def}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Grounded Sources Citation */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
                    <BookOpen className="h-3 w-3 text-cyan-400" />
                    <span>Cited Evidence:</span>
                  </span>
                  {msg.sources.map((src, i) => (
                    <span
                      key={i}
                      className="rounded-md border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono text-slate-300"
                    >
                      {src.title} ({src.source})
                    </span>
                  ))}
                </div>
              )}

              {/* Speech readout button for assistant */}
              {msg.role === 'assistant' && (
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => toggleSpeech(msg.content)}
                    className="text-slate-400 hover:text-cyan-400 text-xs flex items-center space-x-1"
                    title="Read Aloud"
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="h-3.5 w-3.5 text-rose-400" />
                        <span className="text-[10px]">Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3.5 w-3.5" />
                        <span className="text-[10px]">Audio Readout</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3 text-cyan-400">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20">
              <Bot className="h-4 w-4 animate-spin" />
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-xs text-slate-400 flex items-center space-x-2">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
              <span>Searching MedQuAD knowledge base & synthesizing clinical response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggested Prompts */}
      <div className="border-t border-slate-800/60 bg-slate-900/40 px-6 py-2">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap flex items-center space-x-1">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>Suggested:</span>
          </span>
          {SUGGESTED_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="shrink-0 rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-300 hover:border-cyan-500/50 hover:bg-slate-800 hover:text-cyan-300 transition"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="border-t border-slate-800 bg-slate-900/80 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-3"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask a health question (e.g. 'What are symptoms of hypertension?' or 'Explain asthma zones')..."
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 text-white font-medium shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
