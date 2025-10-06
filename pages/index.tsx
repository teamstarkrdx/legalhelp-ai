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

const ENHANCED_RIGHTS = [
  { title: "Right to Equality (Article 14)", detail: "All persons are equal before the law and entitled to equal protection of the laws.", category: "Constitutional", icon: "⚖️", rating: 5 },
  { title: "Right to Freedom of Speech (Article 19(1)(a))", detail: "Freedom of speech and expression with reasonable restrictions.", category: "Constitutional", icon: "🗣️", rating: 5 },
  { title: "Right to Life & Personal Liberty (Article 21)", detail: "No person shall be deprived of life or personal liberty except according to procedure established by law.", category: "Constitutional", icon: "💛", rating: 5 },
  { title: "Right against Exploitation (Article 23-24)", detail: "Prohibits human trafficking and child labor in hazardous employment.", category: "Constitutional", icon: "🚫", rating: 4 },
  { title: "Right to Freedom of Religion (Article 25-28)", detail: "Freedom to profess, practice and propagate religion.", category: "Constitutional", icon: "🕉️", rating: 4 },
  { title: "Cultural & Educational Rights (Article 29-30)", detail: "Protects interests of minorities to conserve culture and establish institutions.", category: "Constitutional", icon: "📚", rating: 4 },
  { title: "Right to Constitutional Remedies (Article 32)", detail: "Right to approach the Supreme Court for enforcement of fundamental rights.", category: "Constitutional", icon: "🏛️", rating: 5 },
  { title: "Right to Education (Article 21A)", detail: "Free and compulsory education for children aged 6 to 14 years.", category: "Constitutional", icon: "🎓", rating: 4 },
  { title: "Right to Information (RTI Act, 2005)", detail: "Citizens can request information from public authorities.", category: "Civil", icon: "📋", rating: 5 },
  { title: "Right to Privacy", detail: "Recognized as a fundamental right under Article 21 (Puttaswamy judgment).", category: "Constitutional", icon: "🔒", rating: 5 },
  { title: "Right of Arrested Persons (Article 22)", detail: "Right to be informed of grounds of arrest and to consult a lawyer.", category: "Criminal", icon: "👮", rating: 5 },
  { title: "Right against Self-Incrimination (Article 20(3))", detail: "No person accused of an offense shall be compelled to be a witness against themselves.", category: "Criminal", icon: "🤐", rating: 4 },
  { title: "Right to Bail (CrPC)", detail: "Bailable offenses allow bail as a matter of right; non-bailable at court's discretion.", category: "Criminal", icon: "⚖️", rating: 4 },
  { title: "Right to Lodge an FIR", detail: "Police must register an FIR for cognizable offenses.", category: "Criminal", icon: "📝", rating: 5 },
  { title: "Right to Legal Aid", detail: "Free legal aid for eligible persons under Legal Services Authorities Act.", category: "Civil", icon: "🤝", rating: 4 },
  { title: "Consumer Rights", detail: "Protection from defective goods/deficient services and right to redressal.", category: "Civil", icon: "🛍️", rating: 4 },
  { title: "Workplace Harassment (POSH Act)", detail: "Right to a safe workplace and complaint redressal mechanism.", category: "Civil", icon: "🏢", rating: 4 },
  { title: "Domestic Violence (PWDVA, 2005)", detail: "Protection from abuse and access to protection orders/shelter.", category: "Family", icon: "🏠", rating: 5 },
  { title: "Senior Citizens' Rights", detail: "Maintenance and welfare under the Senior Citizens Act.", category: "Family", icon: "👴", rating: 4 },
  { title: "Children's Rights (JJ Act)", detail: "Protection, care, and adoption under Juvenile Justice framework.", category: "Family", icon: "👶", rating: 5 },
  { title: "Right to Fair Trial (Article 21)", detail: "Every person has the right to a fair and speedy trial.", category: "Criminal", icon: "⚖️", rating: 5 },
  { title: "Right against Double Jeopardy (Article 20(2))", detail: "No person can be prosecuted twice for the same offense.", category: "Criminal", icon: "🔄", rating: 4 },
  { title: "Right to Property (Article 300A)", detail: "No person shall be deprived of property save by authority of law.", category: "Civil", icon: "🏘️", rating: 4 },
  { title: "Environmental Rights (Article 21)", detail: "Right to clean environment and pollution-free surroundings.", category: "Constitutional", icon: "🌍", rating: 4 },
  { title: "Right to Health (Article 21)", detail: "Right to healthcare and medical treatment.", category: "Constitutional", icon: "🏥", rating: 4 },
  { title: "Right to Food (Article 21)", detail: "Right to adequate food and nutrition.", category: "Constitutional", icon: "🍽️", rating: 4 },
  { title: "Right to Shelter (Article 21)", detail: "Right to adequate housing and shelter.", category: "Constitutional", icon: "🏠", rating: 4 },
  { title: "Right to Water (Article 21)", detail: "Right to clean and adequate water supply.", category: "Constitutional", icon: "💧", rating: 4 },
  { title: "Right to Dignity (Article 21)", detail: "Right to live with human dignity.", category: "Constitutional", icon: "👑", rating: 5 },
  { title: "Right to Livelihood (Article 21)", detail: "Right to means of earning a livelihood.", category: "Constitutional", icon: "💼", rating: 4 }
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
    try {
      const item = localStorage.getItem(key);
      if (item) setState(JSON.parse(item));
    } catch {}
  }, [key]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);

  return [state, setState] as const;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
          ⭐
        </span>
      ))}
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const colors = {
    Constitutional: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    Criminal: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    Civil: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    Family: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
  };
  
  return (
    <span className={`px-2 py-1 text-xs rounded-full font-medium ${colors[category as keyof typeof colors]}`}>
      {category}
    </span>
  );
}

export default function LegalHelpAI() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [rightsOpen, setRightsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [language, setLanguage] = useLocalStorage<Language | null>("lh_lang", null);
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>("lh_chat", []);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [darkMode, setDarkMode] = useLocalStorage("lh_dark", false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
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

  const filteredRights = ENHANCED_RIGHTS.filter(right => {
    const matchesSearch = right.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         right.detail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || right.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "Constitutional", "Criminal", "Civil", "Family"];

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      {/* Header with Hamburger Menu */}
      <nav className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b p-4 z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="space-y-1">
                <div className="w-6 h-0.5 bg-current transition-transform"></div>
                <div className="w-6 h-0.5 bg-current transition-transform"></div>
                <div className="w-6 h-0.5 bg-current transition-transform"></div>
              </div>
            </button>
            <h1 className="text-xl font-bold text-blue-600">LegalHelp AI</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setRightsOpen(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hidden md:block">
              My Rights
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="px-3 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </nav>

      {/* Hamburger Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-80 h-full bg-white dark:bg-gray-900 shadow-xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-blue-600">Menu</h2>
                <button onClick={() => setMenuOpen(false)} className="text-2xl">×</button>
              </div>
              <nav className="space-y-4">
                <a href="#home" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  🏠 <span>Home</span>
                </a>
                <button onClick={() => { setRightsOpen(true); setMenuOpen(false); }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left">
                  ⚖️ <span>Legal Rights</span>
                </button>
                <button onClick={() => { setChatOpen(true); setMenuOpen(false); }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left">
                  🤖 <span>AI Legal Chat</span>
                </button>
                <a href="#about" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  📚 <span>Legal Guide</span>
                </a>
                <a href="#contact" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  📞 <span>Contact Us</span>
                </a>
                <a href="#about" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  ℹ️ <span>About Us</span>
                </a>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Hero Section */}
      <section id="home" className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="mb-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-blue-600">🇮🇳 India's First AI Legal Assistant</h2>
          <p className="text-xl mb-4 max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
            Get instant legal answers in Hindi & English • 24/7 legal guidance at your fingertips
          </p>
          <p className="text-lg font-semibold text-blue-500 mb-6">
            ✨ Trusted by 50,000+ users • ⚡ Instant responses • 🔒 100% confidential
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button 
            onClick={() => setChatOpen(true)} 
            className="px-8 py-4 bg-blue-500 text-white rounded-lg text-lg hover:bg-blue-600 transition-colors shadow-lg"
          >
            🤖 Start AI Chat
          </button>
          <button 
            onClick={() => setRightsOpen(true)} 
            className="px-8 py-4 bg-green-500 text-white rounded-lg text-lg hover:bg-green-600 transition-colors shadow-lg"
          >
            ⚖️ Know Your Rights
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold mb-2">Instant Legal Answers</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Get immediate responses to your legal queries</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-6 rounded-lg">
            <div className="text-3xl mb-3">🌐</div>
            <h3 className="font-bold mb-2">Hindi & English Support</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Ask questions in your preferred language</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 p-6 rounded-lg">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-bold mb-2">100% Confidential</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Your conversations are completely private</p>
          </div>
        </div>
      </section>

      {/* How We Help Section */}
      <section id="about" className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold mb-12 text-center">How LegalHelp AI Helps You</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                🕐
              </div>
              <h4 className="font-bold mb-2">24/7 Availability</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Legal guidance whenever you need it, day or night</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                💰
              </div>
              <h4 className="font-bold mb-2">Free Basic Guidance</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Essential legal information at no cost</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                📱
              </div>
              <h4 className="font-bold mb-2">Mobile Friendly</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Works perfectly on your smartphone</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                🎯
              </div>
              <h4 className="font-bold mb-2">Easy to Understand</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Complex legal concepts explained simply</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rights Preview Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold mb-6 text-center">Your Fundamental Rights</h3>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Know your 30 most important legal rights as an Indian citizen
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {ENHANCED_RIGHTS.slice(0, 6).map((right, i) => (
              <div key={i} className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{right.icon}</span>
                  <CategoryBadge category={right.category} />
                </div>
                <h4 className="font-bold mb-2 text-lg">{right.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{right.detail}</p>
                <RatingStars rating={right.rating} />
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <button 
              onClick={() => setRightsOpen(true)} 
              className="px-8 py-4 bg-green-500 text-white rounded-lg text-lg hover:bg-green-600 transition-colors shadow-lg"
            >
              📜 View All 30 Rights
            </button>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section id="contact" className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-6">Contact Us</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg">
              <h4 className="font-bold mb-4 text-xl">Get in Touch</h4>
              <p className="mb-2">📧 Email: support@legalhelp.ai</p>
              <p className="mb-2">⏰ Hours: 10:00–18:00 IST, Mon–Fri</p>
              <p className="mb-4">📍 Location: Mumbai, India</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg">
              <h4 className="font-bold mb-4 text-xl">Emergency Contacts</h4>
              <p className="mb-2">🚨 Police: 100</p>
              <p className="mb-2">👨‍⚖️ Legal Aid: 15100</p>
              <p className="mb-2">👩‍⚖️ Women Helpline: 181</p>
            </div>
          </div>
          <p className="mt-8 text-sm text-gray-600 dark:text-gray-400">
            ⚠️ Educational information only. Not a substitute for professional legal advice.
          </p>
        </div>
      </section>
      
      {/* Enhanced Rights Modal */}
      <AnimatePresence>
        {rightsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setRightsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h3 className="text-2xl font-bold mb-4 md:mb-0">30 Essential Legal Rights</h3>
                <button onClick={() => setRightsOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                  ✕ Close
                </button>
              </div>
              
              {/* Search and Filter */}
              <div className="mb-6 space-y-4">
                <input
                  type="text"
                  placeholder="🔍 Search rights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
                
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Rights Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRights.map((right, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{right.icon}</span>
                      <CategoryBadge category={right.category} />
                    </div>
                    <h4 className="font-bold mb-2 text-sm">{right.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{right.detail}</p>
                    <RatingStars rating={right.rating} />
                  </motion.div>
                ))}
              </div>
              
              {filteredRights.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No rights found matching your search.
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enhanced Chatbot */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-4 right-4 w-96 max-w-[90vw] bg-white dark:bg-gray-800 border rounded-lg shadow-xl z-50"
          >
            <div className="flex justify-between items-center p-4 border-b bg-blue-500 text-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">
                  🤖
                </div>
                <h4 className="font-semibold">LegalHelp AI</h4>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white hover:bg-white/20 rounded p-1">
                ✕
              </button>
            </div>
            
            {!language && (
              <div className="p-4 border-b bg-blue-50 dark:bg-blue-900">
                <p className="mb-3 font-medium">Choose your language:</p>
                <div className="flex gap-2">
                  <button onClick={() => setLanguage("en")} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    English
                  </button>
                  <button onClick={() => setLanguage("hi")} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    हिंदी
                  </button>
                </div>
              </div>
            )}
            
            <div ref={chatRef} className="h-80 overflow-y-auto p-4 space-y-3">
              <div className="text-xs bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                💡 <strong>Try:</strong> "What are my rights if police stop me?" or "IPC 420"
              </div>
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === "user" 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t">
              {/* **FIXED: Removed the duplicate set of buttons here** */}
              <div className="flex gap-2 mb-2">
                <button onClick={() => setMessages([])} className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600">
                  Clear Chat
                </button>
                <button onClick={() => setLanguage(null)} className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600">
                  Change Language
                </button>
              </div>
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={language === "hi" ? "अपना प्रश्न लिखें..." : "Type your legal question..."}
                  className="flex-1 p-2 border rounded resize-none dark:bg-gray-700 dark:border-gray-600"
                  rows={2}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button 
                  onClick={sendMessage}
                  disabled={sending || !language || !input.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Transparent Robot Chatbot Icon */}
      {!chatOpen && (
        <button 
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group z-40"
        >
          <div className="relative">
            <div className="text-2xl group-hover:scale-110 transition-transform">🤖</div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </button>
      )}
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-xl font-bold mb-4">LegalHelp AI</h3>
          <p className="text-gray-400 mb-4">
            Empowering Indians with accessible legal knowledge since 2024
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <span>© 2024 LegalHelp AI</span>
            <span>•</span>
            <span>Educational Use Only</span>
            <span>•</span>
            <span>Made in India 🇮🇳</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
