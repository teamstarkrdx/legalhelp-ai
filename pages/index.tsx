import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Role = "user" | "assistant";
type Language = "en" | "hi" | "ta" | "te" | "bn" | "mr" | "kn" | "gu" | "or" | "ml" | "pa";

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

// Comprehensive Indian Law Database (Add#1)
const COMPREHENSIVE_LAW_DB = [
  // IPC Sections (Major ones)
  { key: "ipc-302", title: "IPC 302 — Murder", summary: "Punishment for murder with life imprisonment or death penalty", category: "Criminal" },
  { key: "ipc-307", title: "IPC 307 — Attempt to Murder", summary: "Punishment for attempt to commit murder - up to 10 years imprisonment", category: "Criminal" },
  { key: "ipc-376", title: "IPC 376 — Rape", summary: "Punishment for rape - minimum 7 years to life imprisonment", category: "Criminal" },
  { key: "ipc-420", title: "IPC 420 — Cheating", summary: "Punishment for cheating - up to 7 years imprisonment and fine", category: "Criminal" },
  { key: "ipc-498a", title: "IPC 498A — Dowry Harassment", summary: "Punishment for subjecting woman to cruelty - up to 3 years imprisonment", category: "Criminal" },
  { key: "ipc-354", title: "IPC 354 — Assault on Woman", summary: "Assault or use of criminal force on woman - up to 2 years imprisonment", category: "Criminal" },
  { key: "ipc-379", title: "IPC 379 — Theft", summary: "Punishment for theft - up to 3 years imprisonment or fine", category: "Criminal" },
  { key: "ipc-406", title: "IPC 406 — Breach of Trust", summary: "Criminal breach of trust - up to 3 years imprisonment", category: "Criminal" },
  { key: "ipc-504", title: "IPC 504 — Intentional Insult", summary: "Intentional insult with intent to provoke breach of peace - up to 2 years", category: "Criminal" },
  { key: "ipc-506", title: "IPC 506 — Criminal Intimidation", summary: "Criminal intimidation - up to 2 years imprisonment", category: "Criminal" },
  
  // Constitutional Articles
  { key: "article-12", title: "Article 12 — Definition of State", summary: "Defines 'State' for fundamental rights enforcement", category: "Constitutional" },
  { key: "article-13", title: "Article 13 — Laws Inconsistent with Fundamental Rights", summary: "Laws violating fundamental rights are void", category: "Constitutional" },
  { key: "article-14", title: "Article 14 — Right to Equality", summary: "Equality before law and equal protection of laws", category: "Constitutional" },
  { key: "article-15", title: "Article 15 — Prohibition of Discrimination", summary: "Prohibits discrimination on grounds of religion, race, caste, sex", category: "Constitutional" },
  { key: "article-16", title: "Article 16 — Equality in Public Employment", summary: "Equal opportunity in matters of public employment", category: "Constitutional" },
  { key: "article-17", title: "Article 17 — Abolition of Untouchability", summary: "Abolishes untouchability in all its forms", category: "Constitutional" },
  { key: "article-18", title: "Article 18 — Abolition of Titles", summary: "Prohibits state from conferring titles except military/academic", category: "Constitutional" },
  { key: "article-19", title: "Article 19 — Protection of Certain Rights", summary: "Six fundamental freedoms including speech, assembly, movement", category: "Constitutional" },
  { key: "article-20", title: "Article 20 — Protection Against Conviction", summary: "Protection against ex post facto laws and double jeopardy", category: "Constitutional" },
  { key: "article-21", title: "Article 21 — Right to Life and Liberty", summary: "No person shall be deprived of life or liberty except by due process", category: "Constitutional" },
  { key: "article-22", title: "Article 22 — Protection Against Arrest", summary: "Right to be informed of arrest and consult lawyer", category: "Constitutional" },
  { key: "article-25", title: "Article 25 — Freedom of Religion", summary: "Freedom of conscience and right to practice religion", category: "Constitutional" },
  { key: "article-32", title: "Article 32 — Right to Constitutional Remedies", summary: "Right to approach Supreme Court for fundamental rights", category: "Constitutional" },
  
  // CrPC Sections
  { key: "crpc-41", title: "CrPC 41 — Arrest Without Warrant", summary: "When police can arrest without warrant", category: "Procedural" },
  { key: "crpc-154", title: "CrPC 154 — FIR Registration", summary: "Information relating to cognizable offense", category: "Procedural" },
  { key: "crpc-161", title: "CrPC 161 — Police Statement", summary: "Examination of witnesses by police", category: "Procedural" },
  { key: "crpc-437", title: "CrPC 437 — Bail for Non-Bailable Offenses", summary: "When bail can be granted for non-bailable offenses", category: "Procedural" },
  
  // Important Acts
  { key: "rti-2005", title: "Right to Information Act, 2005", summary: "Citizens' right to access government information", category: "Civil" },
  { key: "consumer-2019", title: "Consumer Protection Act, 2019", summary: "Protection of consumer rights and redressal mechanisms", category: "Civil" },
  { key: "posh-2013", title: "POSH Act, 2013", summary: "Prevention of Sexual Harassment at Workplace", category: "Civil" },
  { key: "domestic-violence-2005", title: "Domestic Violence Act, 2005", summary: "Protection of women from domestic violence", category: "Family" },
];

const INDIAN_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" }
];

function detectLawQuery(text: string) {
  const lower = text.toLowerCase().trim();
  
  // Check comprehensive database
  for (const law of COMPREHENSIVE_LAW_DB) {
    // Match IPC sections
    if (law.key.startsWith('ipc-')) {
      const sectionNum = law.key.split('-')[1];
      const ipcRegex = new RegExp(`\\bipc\\s*${sectionNum}\\b|\\bsection\\s*${sectionNum}\\s*(of\\s*)?ipc\\b`, 'i');
      if (ipcRegex.test(text)) return law;
    }
    
    // Match Articles
    if (law.key.startsWith('article-')) {
      const articleNum = law.key.split('-')[1];
      const articleRegex = new RegExp(`\\barticle\\s*${articleNum}\\b`, 'i');
      if (articleRegex.test(text)) return law;
    }
    
    // Match CrPC sections
    if (law.key.startsWith('crpc-')) {
      const sectionNum = law.key.split('-')[1];
      const crpcRegex = new RegExp(`\\bcrpc\\s*${sectionNum}\\b|\\bsection\\s*${sectionNum}\\s*(of\\s*)?crpc\\b`, 'i');
      if (crpcRegex.test(text)) return law;
    }
    
    // Match act names
    if (lower.includes(law.key) || lower.includes(law.title.toLowerCase())) {
      return law;
    }
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
    Family: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    Procedural: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
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
  const [lawSearchOpen, setLawSearchOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [language, setLanguage] = useLocalStorage<Language | null>("lh_lang", null);
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>("lh_chat", []);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [darkMode, setDarkMode] = useLocalStorage("lh_dark", false);
  const [searchTerm, setSearchTerm] = useState("");
  const [lawSearchTerm, setLawSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false); // Fix for Add#6
  };

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

    // Quick law lookup with comprehensive database
    const law = detectLawQuery(input);
    if (law) {
      const getLanguageResponse = (lang: Language, law: any) => {
        const responses = {
          en: `📖 **${law.title}**\n\n📋 **Summary:** ${law.summary}\n\n📂 **Category:** ${law.category}\n\n⚠️ **Note:** This is informational only, not legal advice.`,
          hi: `📖 **${law.title}**\n\n📋 **सार:** ${law.summary}\n\n📂 **श्रेणी:** ${law.category}\n\n⚠️ **नोट:** यह केवल जानकारी है, कानूनी सलाह नहीं।`,
          ta: `📖 **${law.title}**\n\n📋 **சுருக்கம்:** ${law.summary}\n\n📂 **வகை:** ${law.category}\n\n⚠️ **குறிப்பு:** இது தகவலுக்கு மட்டுமே, சட்ட ஆலோசனை அல்ல.`,
          te: `📖 **${law.title}**\n\n📋 **సారాంశం:** ${law.summary}\n\n📂 **వర్గం:** ${law.category}\n\n⚠️ **గమనిక:** ఇది సమాచారం మాత్రమే, చట్టపరమైన సలహా కాదు.`,
          bn: `📖 **${law.title}**\n\n📋 **সারসংক্ষেপ:** ${law.summary}\n\n📂 **বিভাग:** ${law.category}\n\n⚠️ **নোট:** এটি শুধুমাত্র তথ্যের জন্য, আইনি পরামর্শ নয়।`,
          mr: `📖 **${law.title}**\n\n📋 **सारांश:** ${law.summary}\n\n📂 **श्रेणी:** ${law.category}\n\n⚠️ **टीप:** हे केवळ माहितीसाठी आहे, कायदेशीर सल्ला नाही.`,
          kn: `📖 **${law.title}**\n\n📋 **ಸಾರಾಂಶ:** ${law.summary}\n\n📂 **ವರ್ಗ:** ${law.category}\n\n⚠️ **ಗಮನಿಸಿ:** ಇದು ಕೇವಲ ಮಾಹಿತಿಗಾಗಿ ಮಾತ್ರ, ಕಾನೂನು ಸಲಹೆಯಲ್ಲ.`,
          gu: `📖 **${law.title}**\n\n📋 **સાર:** ${law.summary}\n\n📂 **વર્ગ:** ${law.category}\n\n⚠️ **નોંધ:** આ ફક્ત માહિતી માટે છે, કાનૂની સલાહ નથી.`,
          or: `📖 **${law.title}**\n\n📋 **ସାରାଂଶ:** ${law.summary}\n\n📂 **ଶ୍ରେଣୀ:** ${law.category}\n\n⚠️ **ନୋଟ୍:** ଏହା କେବଳ ସୂଚନା ପାଇଁ, ଆଇନଗତ ପରାମର୍ଶ ନୁହେଁ।`,
          ml: `📖 **${law.title}**\n\n📋 **സംഗ്രഹം:** ${law.summary}\n\n📂 **വിഭാഗം:** ${law.category}\n\n⚠️ **കുറിപ്പ്:** ഇത് വിവരങ്ങൾക്ക് മാത്രമാണ്, നിയമ ഉപദേശമല്ല.`,
          pa: `📖 **${law.title}**\n\n📋 **ਸੰਖੇਪ:** ${law.summary}\n\n📂 **ਸ਼ਰੇਣੀ:** ${law.category}\n\n⚠️ **ਨੋਟ:** ਇਹ ਸਿਰਫ਼ ਜਾਣਕਾਰੀ ਲਈ ਹੈ, ਕਾਨੂੰਨੀ ਸਲਾਹ ਨਹੀਂ।`
        };
        return responses[lang] || responses.en;
      };

      setMessages(prev => [...prev, {
        id: Math.random().toString(36),
        role: "assistant",
        content: getLanguageResponse(language, law),
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

  const filteredLaws = COMPREHENSIVE_LAW_DB.filter(law => {
    return law.title.toLowerCase().includes(lawSearchTerm.toLowerCase()) ||
           law.summary.toLowerCase().includes(lawSearchTerm.toLowerCase()) ||
           law.key.toLowerCase().includes(lawSearchTerm.toLowerCase());
  });

  const categories = ["All", "Constitutional", "Criminal", "Civil", "Family", "Procedural"];

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
            <button onClick={() => setLawSearchOpen(true)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 hidden md:block">
              🔍 Law Search
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="px-3 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </nav>

      {/* Enhanced Hamburger Menu Overlay */}
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
                <button onClick={() => setMenuOpen(false)} className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-800 w-8 h-8 rounded">×</button>
              </div>
              <nav className="space-y-4">
                <button onClick={() => scrollToSection('home')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left transition-colors">
                  🏠 <span>Home</span>
                </button>
                <button onClick={() => { setRightsOpen(true); setMenuOpen(false); }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left transition-colors">
                  ⚖️ <span>Legal Rights</span>
                </button>
                <button onClick={() => { setChatOpen(true); setMenuOpen(false); }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left transition-colors">
                  🤖 <span>AI Legal Chat</span>
                </button>
                <button onClick={() => { setLawSearchOpen(true); setMenuOpen(false); }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left transition-colors">
                  🔍 <span>Law Search</span>
                </button>
                <button onClick={() => scrollToSection('legal-guidance')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left transition-colors">
                  📚 <span>Legal Guidance</span>
                </button>
                <button onClick={() => scrollToSection('contact')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left transition-colors">
                  📞 <span>Contact Us</span>
                </button>
                <button onClick={() => scrollToSection('about')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left transition-colors">
                  ℹ️ <span>About Us</span>
                </button>
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
            Get instant legal answers in 11 Indian languages • 24/7 legal guidance at your fingertips
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
          <button 
            onClick={() => setLawSearchOpen(true)} 
            className="px-8 py-4 bg-purple-500 text-white rounded-lg text-lg hover:bg-purple-600 transition-colors shadow-lg"
          >
            🔍 Search Laws
          </button>
        </div>

        {/* Enhanced Features Grid */}
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold mb-2">Instant Legal Answers</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Get immediate responses to your legal queries</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-3">🌐</div>
            <h3 className="font-bold mb-2">11 Indian Languages</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Ask questions in your preferred language</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-bold mb-2">Comprehensive Law Search</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Search through thousands of Indian laws</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-bold mb-2">100% Confidential</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Your conversations are completely private</p>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Legal Guidance Section (Add#7) */}
      <section id="legal-guidance" className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              🎯 Legal Guidance Hub
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Navigate India's legal landscape with confidence. Get expert guidance tailored to your needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }} 
              className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-lg">
                🏛️
              </div>
              <h4 className="text-xl font-bold mb-4 text-center">Constitutional Law</h4>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Understand your fundamental rights and constitutional protections under Indian law.
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => setRightsOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Explore Rights
                </button>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }} 
              className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-lg">
                ⚖️
              </div>
              <h4 className="text-xl font-bold mb-4 text-center">Criminal Law</h4>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Get guidance on criminal matters, FIRs, bail, and criminal procedure.
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => setChatOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Ask AI
                </button>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }} 
              className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-lg">
                📋
              </div>
              <h4 className="text-xl font-bold mb-4 text-center">Civil Matters</h4>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Property disputes, contracts, consumer rights, and civil procedures.
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => setChatOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Get Help
                </button>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }} 
              className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-lg">
                👨‍👩‍👧‍👦
              </div>
              <h4 className="text-xl font-bold mb-4 text-center">Family Law</h4>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Marriage, divorce, custody, domestic violence, and family matters.
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => setChatOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Learn More
                </button>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }} 
              className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-lg">
                🏢
              </div>
              <h4 className="text-xl font-bold mb-4 text-center">Corporate Law</h4>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Business formation, compliance, contracts, and corporate governance.
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => setLawSearchOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Search Laws
                </button>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }} 
              className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-lg">
                🎓
              </div>
              <h4 className="text-xl font-bold mb-4 text-center">Legal Education</h4>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Learn about Indian legal system, procedures, and your rights as a citizen.
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => setRightsOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Start Learning
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How We Help Section */}
      <section id="about" className="bg-white dark:bg-gray-900 py-16">
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
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold mb-6 text-center">Your Fundamental Rights</h3>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Know your 30 most important legal rights as an Indian citizen
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {ENHANCED_RIGHTS.slice(0, 6).map((right, i) => (
              <motion.div key={i} whileHover={{ scale: 1.02 }} className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{right.icon}</span>
                  <CategoryBadge category={right.category} />
                </div>
                <h4 className="font-bold mb-2 text-lg">{right.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{right.detail}</p>
                <RatingStars rating={right.rating} />
              </motion.div>
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
      <section id="contact" className="bg-white dark:bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-6">Contact Us</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h4 className="font-bold mb-4 text-xl">Get in Touch</h4>
              <p className="mb-2">📧 Email: support@legalhelp.ai</p>
              <p className="mb-2">⏰ Hours: 10:00–18:00 IST, Mon–Fri</p>
              <p className="mb-4">📍 Location: Mumbai, India</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
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

      {/* Law Search Modal (Add#1) */}
      <AnimatePresence>
        {lawSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setLawSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">🔍 Indian Law Search Engine</h3>
                  <button onClick={() => setLawSearchOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                    ✕ Close
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="🔍 Search laws, articles, sections (e.g., 'IPC 420', 'Article 21', 'domestic violence')"
                  value={lawSearchTerm}
                  onChange={(e) => setLawSearchTerm(e.target.value)}
                  className="w-full p-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-lg"
                  autoFocus
                />
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="grid gap-4">
                  {filteredLaws.length > 0 ? (
                    filteredLaws.map((law, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-bold text-lg">{law.title}</h4>
                          <CategoryBadge category={law.category} />
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">{law.summary}</p>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Search terms: {law.key.replace('-', ' ').toUpperCase()}
                        </div>
                      </motion.div>
                    ))
                  ) : lawSearchTerm ? (
                    <div className="text-center py-8 text-gray-500">
                      No laws found matching "{lawSearchTerm}". Try searching for IPC sections, Articles, or legal topics.
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Start typing to search through Indian laws, articles, and sections...
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Enhanced Multilingual Chatbot (Add#2, Add#3, Add#5) */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-4 right-4 w-[480px] h-[600px] max-w-[95vw] max-h-[85vh] bg-white dark:bg-gray-800 border rounded-lg shadow-2xl z-50 flex flex-col"
            style={{ maxWidth: 'min(480px, 95vw)', maxHeight: 'min(600px, 85vh)' }}
          >
            {/* Chat Header */}
            <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg">
                  🤖
                </div>
                <div>
                  <h4 className="font-semibold">LegalHelp AI</h4>
                  <p className="text-xs opacity-90">
                    {language ? INDIAN_LANGUAGES.find(l => l.code === language)?.nativeName : 'Choose Language'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setChatOpen(false)} 
                className="text-white hover:bg-white/20 rounded p-2 transition-colors"
              >
                ←
              </button>
            </div>

            {/* Language Selection (Add#2) */}
            {!language && (
              <div className="p-6 border-b bg-blue-50 dark:bg-blue-900 flex-shrink-0">
                <h5 className="font-semibold mb-4 text-center">🌐 Choose Your Language</h5>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {INDIAN_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as Language)}
                      className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors text-sm border border-gray-200 dark:border-gray-600"
                    >
                      <div className="font-medium">{lang.nativeName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages (Add#3 - Fixed Scrolling) */}
            <div 
              ref={chatRef} 
              className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
              style={{ 
                scrollBehavior: 'smooth',
                overflowAnchor: 'none'
              }}
            >
              <div className="text-xs bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                💡 <strong>Try:</strong> Describe your legal situation or ask "What are my rights if police stop me?" or search "IPC 420"
              </div>
              
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-3 rounded-lg ${
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

            {/* Chat Input */}
            <div className="p-4 border-t flex-shrink-0">
              <div className="flex gap-2 mb-2">
                <button onClick={() => setMessages([])} className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600">
                  Clear
                </button>
                <button onClick={() => setLanguage(null)} className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600">
                  Change Language
                </button>
              </div>
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={
                    language 
                      ? (language === "hi" ? "अपना प्रश्न लिखें..." : 
                         language === "ta" ? "உங்கள் கேள்வியை எழுதுங்கள்..." :
                         language === "te" ? "మీ ప్రశ్నను రాయండి..." :
                         language === "bn" ? "আপনার প্রশ্ন লিখুন..." :
                         language === "mr" ? "आपला प्रश्न लिहा..." :
                         language === "kn" ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಬರೆಯಿರಿ..." :
                         language === "gu" ? "તમારો પ્રશ્ન લખો..." :
                         language === "or" ? "ଆପଣଙ୍କ ପ୍ରଶ୍ନ ଲେଖନ୍ତୁ..." :
                         language === "ml" ? "നിങ്ങളുടെ ചോദ്യം എഴുതുക..." :
                         language === "pa" ? "ਆਪਣਾ ਸਵਾਲ ਲਿਖੋ..." : "Type your legal question...")
                      : "Choose a language first..."
                  }
                  className="flex-1 p-3 border rounded resize-none dark:bg-gray-700 dark:border-gray-600"
                  rows={2}
                  disabled={!language}
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
                  className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Chatbot Icon (Add#5) */}
      {!chatOpen && (
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white dark:border-gray-700 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group z-40"
        >
          <div className="relative">
            <div className="text-3xl group-hover:scale-110 transition-transform">🤖</div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-md"></div>
          </div>
        </motion.button>
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
