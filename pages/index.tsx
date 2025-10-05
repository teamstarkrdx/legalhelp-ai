import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Role = "user" | "assistant";
type Language = "en" | "hi";

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
};

const RIGHTS = [
  { title: "Right to Equality (Article 14)", detail: "All persons are equal before the law and entitled to equal protection of the laws." },
  { title: "Right to Freedom of Speech (Article 19(1)(a))", detail: "Freedom of speech and expression with reasonable restrictions." },
  { title: "Right to Life & Personal Liberty (Article 21)", detail: "No person shall be deprived of life or personal liberty except according to procedure established by law." },
  { title: "Right against Exploitation (Article 23-24)", detail: "Prohibits human trafficking and child labor in hazardous employment." },
  { title: "Right to Freedom of Religion (Article 25-28)", detail: "Freedom to profess, practice and propagate religion." },
  { title: "Cultural & Educational Rights (Article 29-30)", detail: "Protects interests of minorities to conserve culture and establish institutions." },
  { title: "Right to Constitutional Remedies (Article 32)", detail: "Right to approach the Supreme Court for enforcement of fundamental rights." },
  { title: "Right to Education (Article 21A)", detail: "Free and compulsory education for children aged 6 to 14 years." },
  { title: "Right to Information (RTI Act, 2005)", detail: "Citizens can request information from public authorities." },
  { title: "Right to Privacy", detail: "Recognized as a fundamental right under Article 21 (Puttaswamy judgment)." },
  { title: "Right of Arrested Persons (Article 22)", detail: "Right to be informed of grounds of arrest and to consult a lawyer." },
  { title: "Right against Self-Incrimination (Article 20(3))", detail: "No person accused of an offense shall be compelled to be a witness against themselves." },
  { title: "Right to Bail (CrPC)", detail: "Bailable offenses allow bail as a matter of right; non-bailable at court's discretion." },
  { title: "Right to Lodge an FIR", detail: "Police must register an FIR for cognizable offenses." },
  { title: "Right to Legal Aid", detail: "Free legal aid for eligible persons under Legal Services Authorities Act." },
  { title: "Consumer Rights", detail: "Protection from defective goods/deficient services and right to redressal." },
  { title: "Workplace Harassment (POSH Act)", detail: "Right to a safe workplace and complaint redressal mechanism." },
  { title: "Domestic Violence (PWDVA, 2005)", detail: "Protection from abuse and access to protection orders/shelter." },
  { title: "Senior Citizens' Rights", detail: "Maintenance and welfare under the Senior Citizens Act." },
  { title: "Children's Rights (JJ Act)", detail: "Protection, care, and adoption under Juvenile Justice framework." },
];

const LAW_DB = [
  {
    key: "ipc-420",
    title: "IPC 420 — Cheating and Dishonestly Inducing Delivery of Property",
    summary: "Punishes cheating that leads to delivery of property. Example: Taking money on false promise and never delivering goods.",
  },
  {
    key: "article-21",
    title: "Article 21 — Right to Life and Personal Liberty",
    summary: "Protects life and personal liberty. Any deprivation must follow a just, fair, and reasonable procedure established by law.",
  },
  {
    key: "article-14",
    title: "Article 14 — Right to Equality",
    summary: "Equality before law and equal protection of the laws; prohibits arbitrary discrimination.",
  }
];

function detectLawQuery(text: string) {
  const lower = text.toLowerCase();
  const ipcMatch = lower.match(/\bipc\s*([0-9]{1,3})\b/);
  if (ipcMatch) {
    const found = LAW_DB.find(e => e.key === `ipc-${ipcMatch[1]}`);
    if (found) return found;
  }
  const articleMatch = lower.match(/\barticle\s*([0-9]{1,2})\b/);
  if (articleMatch) {
    const found = LAW_DB.find(e => e.key === `article-${articleMatch[1]}`);
    if (found) return found;
  }
  return null;
}

function useLocalStorage<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(defaultValue);
  useEffect(() => {
    try { const item = localStorage.getItem(key); if (item) setState(JSON.parse(item)); } catch {}
  }, [key]);
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState] as const;
}

export default function LegalHelpAI() {
  const [rightsOpen, setRightsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [language, setLanguage] = useLocalStorage<Language | null>("lh_lang", null);
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>("lh_chat", []);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [darkMode, setDarkMode] = useLocalStorage("lh_dark", false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !language) return;
    const userMsg: ChatMessage = {
      id: Math.random().toString(36),
      role: "user",
      content: input.trim(),
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setSending(true);

    const law = detectLawQuery(input);
    if (law) {
      const response = language === "hi" 
        ? `• शीर्षक: ${law.title}\n• सार: ${law.summary}\n\nनोट: यह केवल जानकारी है, कानूनी सलाह नहीं।`
        : `• Title: ${law.title}\n• Summary: ${law.summary}\n\nNote: This is informational only.`;
      setMessages(prev => [...prev, {
        id: Math.random().toString(36),
        role: "assistant",
        content: response,
        timestamp: Date.now()
      }]);
      setSending(false);
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].slice(-10),
          language
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: Math.random().toString(36),
        role: "assistant",
        content: data.reply || "Sorry, something went wrong.",
        timestamp: Date.now()
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Math.random().toString(36),
        role: "assistant", 
        content: "Sorry, I couldn't connect right now. Please try again.",
        timestamp: Date.now()
      }]);
    }
    setSending(false);
  };

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      <nav className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b p-4 z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">LegalHelp AI</h1>
          <div className="flex gap-2">
            <button onClick={() => setRightsOpen(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              My Rights
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="px-3 py-2 border rounded">
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 py-12 text-center">
        <h2 className="text-4xl font-bold mb-4 text-blue-600">Know Your Legal Rights</h2>
        <p className
