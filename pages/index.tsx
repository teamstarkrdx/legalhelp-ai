import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Role = "user" | "assistant";
type Language = "en" | "hi" | "ta" | "te" | "bn" | "mr" | "kn" | "gu" | "or" | "ml" | "pa";

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  rating?: number;
  feedback?: string;
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  userName: string;
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

// Comprehensive Indian Law Database
const COMPREHENSIVE_LAW_DB = [
  { key: "ipc-302", title: "IPC 302 — Murder", summary: "Punishment for murder with life imprisonment or death penalty", category: "Criminal" },
  { key: "ipc-307", title: "IPC 307 — Attempt to Murder", summary: "Punishment for attempt to commit murder - up to 10 years imprisonment", category: "Criminal" },
  { key: "ipc-376", title: "IPC 376 — Rape", summary: "Punishment for rape - minimum 7 years to life imprisonment", category: "Criminal" },
  { key: "ipc-420", title: "IPC 420 — Cheating", summary: "Punishment for cheating - up to 7 years imprisonment and fine", category: "Criminal" },
  { key: "ipc-498a", title: "IPC 498A — Dowry Harassment", summary: "Punishment for subjecting woman to cruelty - up to 3 years imprisonment", category: "Criminal" },
  { key: "ipc-354", title: "IPC 354 — Assault on Woman", summary: "Assault or use of criminal force on woman - up to 2 years imprisonment", category: "Criminal" },
  { key: "ipc-379", title: "IPC 379 — Theft", summary: "Punishment for theft - up to 3 years imprisonment or fine", category: "Criminal" },
  { key: "ipc-406", title: "IPC 406 — Breach of Trust", summary: "Criminal breach of trust - up to 3 years imprisonment", category: "Criminal" },
  { key: "article-12", title: "Article 12 — Definition of State", summary: "Defines 'State' for fundamental rights enforcement", category: "Constitutional" },
  { key: "article-13", title: "Article 13 — Laws Inconsistent with Fundamental Rights", summary: "Laws violating fundamental rights are void", category: "Constitutional" },
  { key: "article-14", title: "Article 14 — Right to Equality", summary: "Equality before law and equal protection of laws", category: "Constitutional" },
  { key: "article-15", title: "Article 15 — Prohibition of Discrimination", summary: "Prohibits discrimination on grounds of religion, race, caste, sex", category: "Constitutional" },
  { key: "article-19", title: "Article 19 — Protection of Certain Rights", summary: "Six fundamental freedoms including speech, assembly, movement", category: "Constitutional" },
  { key: "article-20", title: "Article 20 — Protection Against Conviction", summary: "Protection against ex post facto laws and double jeopardy", category: "Constitutional" },
  { key: "article-21", title: "Article 21 — Right to Life and Liberty", summary: "No person shall be deprived of life or liberty except by due process", category: "Constitutional" },
  { key: "article-22", title: "Article 22 — Protection Against Arrest", summary: "Right to be informed of arrest and consult lawyer", category: "Constitutional" },
  { key: "article-32", title: "Article 32 — Right to Constitutional Remedies", summary: "Right to approach Supreme Court for fundamental rights", category: "Constitutional" },
  { key: "crpc-41", title: "CrPC 41 — Arrest Without Warrant", summary: "When police can arrest without warrant", category: "Procedural" },
  { key: "crpc-154", title: "CrPC 154 — FIR Registration", summary: "Information relating to cognizable offense", category: "Procedural" },
  { key: "rti-2005", title: "Right to Information Act, 2005", summary: "Citizens' right to access government information", category: "Civil" },
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

// Sample reviews for demonstration
const INITIAL_REVIEWS: Review[] = [
  { id: "1", rating: 5, comment: "Incredibly helpful! Got instant answers about my legal rights in Hindi. The AI understood my problem perfectly.", userName: "Rajesh K.", timestamp: Date.now() - 86400000 },
  { id: "2", rating: 4, comment: "Great tool for quick legal guidance. Saved me a trip to the lawyer for basic questions.", userName: "Priya S.", timestamp: Date.now() - 172800000 },
  { id: "3", rating: 5, comment: "The voice chat feature is amazing! I could ask questions in Tamil and got clear answers.", userName: "Muthu R.", timestamp: Date.now() - 259200000 },
  { id: "4", rating: 4, comment: "Very user-friendly interface. The law search feature helped me understand IPC sections easily.", userName: "Amit P.", timestamp: Date.now() - 345600000 },
  { id: "5", rating: 5, comment: "Excellent service! The explanations are clear and the response time is instant.", userName: "Kavya M.", timestamp: Date.now() - 432000000 }
];

function detectLawQuery(text: string) {
  const lower = text.toLowerCase().trim();
  
  for (const law of COMPREHENSIVE_LAW_DB) {
    if (law.key.startsWith('ipc-')) {
      const sectionNum = law.key.split('-')[1];
      const ipcRegex = new RegExp(`\\bipc\\s*${sectionNum}\\b|\\bsection\\s*${sectionNum}\\s*(of\\s*)?ipc\\b`, 'i');
      if (ipcRegex.test(text)) return law;
    }
    
    if (law.key.startsWith('article-')) {
      const articleNum = law.key.split('-')[1];
      const articleRegex = new RegExp(`\\barticle\\s*${articleNum}\\b`, 'i');
      if (articleRegex.test(text)) return law;
    }
    
    if (law.key.startsWith('crpc-')) {
      const sectionNum = law.key.split('-')[1];
      const crpcRegex = new RegExp(`\\bcrpc\\s*${sectionNum}\\b|\\bsection\\s*${sectionNum}\\s*(of\\s*)?crpc\\b`, 'i');
      if (crpcRegex.test(text)) return law;
    }
    
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

function RatingStars({ rating, onRatingChange, interactive = false }: { rating: number; onRatingChange?: (rating: number) => void; interactive?: boolean }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRatingChange?.(star)}
          disabled={!interactive}
          className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} ${interactive ? 'hover:text-yellow-300 cursor-pointer' : ''}`}
        >
          ⭐
        </button>
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

// Animated Background Component
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900"></div>
      
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
      
      {/* Geometric shapes */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-r from-pink-400/10 to-blue-400/10 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full blur-2xl"></div>
    </div>
  );
}

// Copy to Clipboard Component
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <span className="text-green-500 text-xs">✓ Copied!</span>
      ) : (
        <span className="text-sm">📋</span>
      )}
    </button>
  );
}

// Feedback Component
function FeedbackComponent({ messageId, onSubmit }: { messageId: string; onSubmit: (rating: number, feedback?: string) => void }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, feedback.trim() || undefined);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="mt-2 text-xs text-green-600 dark:text-green-400">
        ✓ Thank you for your feedback!
      </div>
    );
  }

  return (
    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Rate this response:</div>
      <div className="flex items-center gap-2 mb-2">
        <RatingStars rating={rating} onRatingChange={setRating} interactive />
        {rating > 0 && (
          <span className="text-xs text-gray-500">({rating}/5)</span>
        )}
      </div>
      {rating > 0 && (
        <>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Optional: Share your thoughts..."
            className="w-full mt-2 p-2 text-xs border rounded dark:bg-gray-600 dark:border-gray-500"
            rows={2}
          />
          <button
            onClick={handleSubmit}
            className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Submit Feedback
          </button>
        </>
      )}
    </div>
  );
}

// Voice Recognition Hook
function useVoiceRecognition(language: Language, onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };
    }
  }, [onResult]);

  useEffect(() => {
    if (recognitionRef.current) {
      const langMap: { [key in Language]: string } = {
        en: 'en-US',
        hi: 'hi-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        bn: 'bn-IN',
        mr: 'mr-IN',
        kn: 'kn-IN',
        gu: 'gu-IN',
        or: 'or-IN',
        ml: 'ml-IN',
        pa: 'pa-IN'
      };
      recognitionRef.current.lang = langMap[language] || 'en-US';
    }
  }, [language]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  return { isListening, isSupported, startListening, stopListening };
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
  const [reviews, setReviews] = useLocalStorage<Review[]>("lh_reviews", INITIAL_REVIEWS);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleVoiceResult = (transcript: string) => {
    setInput(transcript);
  };

  const { isListening, isSupported, startListening, stopListening } = useVoiceRecognition(language || 'en', handleVoiceResult);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  const generateShareUrl = () => {
    const chatData = btoa(JSON.stringify(messages.slice(-10)));
    const url = `${window.location.origin}${window.location.pathname}?shared=${chatData}`;
    setShareUrl(url);
    setShowShareModal(true);
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
          bn: `📖 **${law.title}**\n\n📋 **সারসংক্ষেপ:** ${law.summary}\n\n📂 **বিভাগ:** ${law.category}\n\n⚠️ **নোট:** এটি শুধুমাত্র তথ্যের জন্য, আইনি পরামর্শ নয়।`,
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
          language,
          query: input.trim()
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

  const handleFeedbackSubmit = (messageId: string, rating: number, feedback?: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, rating, feedback } : msg
    ));

    // Add to reviews
    const newReview: Review = {
      id: Math.random().toString(36),
      rating,
      comment: feedback || `Rated ${rating} stars`,
      userName: `User ${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
      timestamp: Date.now()
    };
    setReviews(prev => [newReview, ...prev].slice(0, 20));
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

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      <AnimatedBackground />
      
      {/* Glassmorphism Header */}
      <nav className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20 p-4 z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors backdrop-blur"
            >
              <div className="space-y-1">
                <div className="w-6 h-0.5 bg-current transition-transform"></div>
                <div className="w-6 h-0.5 bg-current transition-transform"></div>
                <div className="w-6 h-0.5 bg-current transition-transform"></div>
              </div>
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LegalHelp AI
            </h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setRightsOpen(true)} className="px-4 py-2 bg-blue-500/80 backdrop-blur text-white rounded-lg hover:bg-blue-600/80 transition-colors hidden md:block">
              My Rights
            </button>
            <button onClick={() => setLawSearchOpen(true)} className="px-4 py-2 bg-green-500/80 backdrop-blur text-white rounded-lg hover:bg-green-600/80 transition-colors hidden md:block">
              🔍 Law Search
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="px-3 py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur border border-white/30 dark:border-gray-700/30 rounded-lg hover:bg-white/30 dark:hover:bg-gray-700/30 transition-colors">
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </nav>

      {/* Enhanced Hamburger Menu with Glassmorphism */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-80 h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Menu</h2>
                <button onClick={() => setMenuOpen(false)} className="text-2xl hover:bg-white/20 dark:hover:bg-gray-800/20 w-8 h-8 rounded transition-colors">×</button>
              </div>
              <nav className="space-y-4">
                <button onClick={() => scrollToSection('home')} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/30 dark:hover:bg-gray-800/30 w-full text-left transition-colors backdrop-blur">
                  🏠 <span>Home</span>
                </button>
                <button onClick={() => { setRightsOpen(true); setMenuOpen(false); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/30 dark:hover:bg-gray-800/30 w-full text-left transition-colors backdrop-blur">
                  ⚖️ <span>Legal Rights</span>
                </button>
                <button onClick={() => { setChatOpen(true); setMenuOpen(false); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/30 dark:hover:bg-gray-800/30 w-full text-left transition-colors backdrop-blur">
                  🤖 <span>AI Legal Chat</span>
                </button>
                <button onClick={() => { setLawSearchOpen(true); setMenuOpen(false); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/30 dark:hover:bg-gray-800/30 w-full text-left transition-colors backdrop-blur">
                  🔍 <span>Law Search</span>
                </button>
                <button onClick={() => scrollToSection('legal-guidance')} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/30 dark:hover:bg-gray-800/30 w-full text-left transition-colors backdrop-blur">
                  📚 <span>Legal Guidance</span>
                </button>
                <button onClick={() => scrollToSection('contact')} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/30 dark:hover:bg-gray-800/30 w-full text-left transition-colors backdrop-blur">
                  📞 <span>Contact Us</span>
                </button>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Hero Section with Glassmorphism */}
      <section id="home" className="max-w-6xl mx-auto px-4 py-12 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            🇮🇳 India's AI Legal Assistant
          </h2>
          <p className="text-xl mb-6 max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
            Get instant legal answers in 11 Indian languages • Voice chat enabled • 24/7 availability
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-full border border-white/30 dark:border-gray-700/30 mb-6">
            <span className="text-yellow-400">⭐</span>
            <span className="font-semibold">{averageRating}/5</span>
            <span className="text-gray-600 dark:text-gray-400">• {reviews.length} reviews</span>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <button 
            onClick={() => setChatOpen(true)} 
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur"
          >
            🤖 Start AI Chat
          </button>
          <button 
            onClick={() => setRightsOpen(true)} 
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur"
          >
            ⚖️ Know Your Rights
          </button>
          <button 
            onClick={() => setLawSearchOpen(true)} 
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl text-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur"
          >
            🔍 Search Laws
          </button>
        </motion.div>

        {/* Enhanced Features Grid with Glassmorphism */}
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { icon: "⚡", title: "Instant Legal Answers", desc: "Get immediate responses to your legal queries" },
            { icon: "🌐", title: "11 Indian Languages", desc: "Ask questions in your preferred language" },
            { icon: "🎤", title: "Voice Chat Enabled", desc: "Speak your questions, get voice responses" },
            { icon: "🔒", title: "100% Confidential", desc: "Your conversations are completely private" }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl p-6 rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Enhanced Legal Guidance Section with Glassmorphism */}
      <section id="legal-guidance" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🎯 Legal Guidance Hub
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Navigate India's legal landscape with confidence. Get expert guidance tailored to your needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "🏛️", title: "Constitutional Law", desc: "Understand your fundamental rights", color: "from-blue-500 to-blue-600" },
              { icon: "⚖️", title: "Criminal Law", desc: "FIRs, bail, and criminal procedure", color: "from-red-500 to-red-600" },
              { icon: "📋", title: "Civil Matters", desc: "Property, contracts, consumer rights", color: "from-green-500 to-green-600" },
              { icon: "👨‍👩‍👧‍👦", title: "Family Law", desc: "Marriage, divorce, custody matters", color: "from-purple-500 to-purple-600" },
              { icon: "🏢", title: "Corporate Law", desc: "Business, compliance, contracts", color: "from-yellow-500 to-orange-500" },
              { icon: "🎓", title: "Legal Education", desc: "Learn about Indian legal system", color: "from-indigo-500 to-indigo-600" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5, scale: 1.02 }} 
                className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} text-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-lg`}>
                  {item.icon}
                </div>
                <h4 className="text-xl font-bold mb-4 text-center">{item.title}</h4>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-6">{item.desc}</p>
                <div className="flex justify-center">
                  <button 
                    onClick={() => setChatOpen(true)}
                    className={`px-6 py-3 bg-gradient-to-r ${item.color} text-white rounded-lg hover:shadow-lg transition-all duration-300`}
                  >
                    Get Help
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Help Section */}
      <section id="about" className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold mb-12 text-center">How LegalHelp AI Helps You</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "🕐", title: "24/7 Availability", desc: "Legal guidance whenever you need it" },
              { icon: "💰", title: "Free Basic Guidance", desc: "Essential legal information at no cost" },
              { icon: "📱", title: "Mobile Friendly", desc: "Works perfectly on your smartphone" },
              { icon: "🎯", title: "Easy to Understand", desc: "Complex legal concepts explained simply" }
            ].map((item, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05 }} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">
                  {item.icon}
                </div>
                <h4 className="font-bold mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rights Preview Section */}
      <section className="py-16 bg-white/5 dark:bg-gray-800/5">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold mb-6 text-center">Your Fundamental Rights</h3>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Know your 30 most important legal rights as an Indian citizen
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {ENHANCED_RIGHTS.slice(0, 6).map((right, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.02 }} 
                className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl p-6 rounded-xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300"
              >
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
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur"
            >
              📜 View All 30 Rights
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-6">Contact Us</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl p-6 rounded-xl border border-white/20 dark:border-gray-700/20">
              <h4 className="font-bold mb-4 text-xl">Get in Touch</h4>
              <p className="mb-2">📧 Email: support@legalhelp.ai</p>
              <p className="mb-2">⏰ Hours: 10:00–18:00 IST, Mon–Fri</p>
              <p className="mb-4">📍 Location: Karnataka, India</p>
            </div>
            <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl p-6 rounded-xl border border-white/20 dark:border-gray-700/20">
              <h4 className="font-bold mb-4 text-xl">Emergency Contacts</h4>
              <p className="mb-2">🚨 Police: 100</p>
              <p className="mb-2">👨‍⚖️ Legal Aid: 15100</p>
              <p className="mb-2">👩‍⚖️ Women Helpline: 181</p>
            </div>
          </div>
        </div>
      </section>

      {/* User Reviews Section */}
      <section id="reviews" className="py-16 bg-white/5 dark:bg-gray-800/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">What Our Users Say</h3>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-full border border-white/30 dark:border-gray-700/30">
              <div className="flex">
                {[1,2,3,4,5].map(star => (
                  <span key={star} className="text-yellow-400 text-lg">⭐</span>
                ))}
              </div>
              <span className="font-bold text-lg">{averageRating}/5</span>
              <span className="text-gray-600 dark:text-gray-400">({reviews.length} reviews)</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.slice(0, 6).map((review) => (
              <motion.div 
                key={review.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl p-6 rounded-xl border border-white/20 dark:border-gray-700/20 shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <RatingStars rating={review.rating} />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(review.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm mb-3 text-gray-700 dark:text-gray-300">{review.comment}</p>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">— {review.userName}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Law Search Modal */}
      <AnimatePresence>
        {lawSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setLawSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-white/30 dark:border-gray-700/30"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/20 dark:border-gray-700/20">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">🔍 Indian Law Search Engine</h3>
                  <button onClick={() => setLawSearchOpen(false)} className="px-4 py-2 bg-gray-500/80 backdrop-blur text-white rounded-lg hover:bg-gray-600/80">
                    ✕ Close
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="🔍 Search laws, articles, sections (e.g., 'IPC 420', 'Article 21', 'domestic violence')"
                  value={lawSearchTerm}
                  onChange={(e) => setLawSearchTerm(e.target.value)}
                  className="w-full p-4 border border-white/30 dark:border-gray-700/30 rounded-xl bg-white/20 dark:bg-gray-700/20 backdrop-blur text-lg"
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
                        className="bg-white/10 dark:bg-gray-700/10 backdrop-blur p-4 rounded-xl border border-white/20 dark:border-gray-700/20 hover:shadow-lg transition-all duration-300"
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setRightsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto p-6 border border-white/30 dark:border-gray-700/30"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h3 className="text-2xl font-bold mb-4 md:mb-0">30 Essential Legal Rights</h3>
                <button onClick={() => setRightsOpen(false)} className="px-4 py-2 bg-gray-500/80 backdrop-blur text-white rounded-lg hover:bg-gray-600/80">
                  ✕ Close
                </button>
              </div>
              
              <div className="mb-6 space-y-4">
                <input
                  type="text"
                  placeholder="🔍 Search rights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 border border-white/30 dark:border-gray-700/30 rounded-xl bg-white/20 dark:bg-gray-700/20 backdrop-blur"
                />
                
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-xl text-sm transition-colors backdrop-blur ${
                        selectedCategory === category 
                          ? 'bg-blue-500/80 text-white' 
                          : 'bg-white/20 dark:bg-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-600/30'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRights.map((right, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/10 dark:bg-gray-700/10 backdrop-blur p-4 rounded-xl border border-white/20 dark:border-gray-700/20 hover:shadow-lg transition-all duration-300"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl max-w-md w-full p-6 border border-white/30 dark:border-gray-700/30"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Share Chat</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Share this conversation with others:</p>
              <div className="bg-white/20 dark:bg-gray-700/20 p-3 rounded-lg mb-4 break-all text-sm">
                {shareUrl}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(shareUrl)}
                  className="flex-1 px-4 py-2 bg-blue-500/80 backdrop-blur text-white rounded-lg hover:bg-blue-600/80"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-gray-500/80 backdrop-blur text-white rounded-lg hover:bg-gray-600/80"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Multilingual Chatbot with All Features */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-4 right-4 w-[520px] h-[680px] max-w-[95vw] max-h-[90vh] bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{ maxWidth: 'min(520px, 95vw)', maxHeight: 'min(680px, 90vh)' }}
          >
            {/* Chat Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-blue-500/80 to-blue-600/80 text-white backdrop-blur flex-shrink-0">
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
              <div className="flex items-center gap-2">
                <button 
                  onClick={generateShareUrl}
                  className="text-white hover:bg-white/20 rounded p-2 transition-colors"
                  title="Share chat"
                >
                  🔗
                </button>
                <button 
                  onClick={() => setChatOpen(false)} 
                  className="text-white hover:bg-white/20 rounded p-2 transition-colors"
                >
                  ←
                </button>
              </div>
            </div>

            {/* Language Selection */}
            {!language && (
              <div className="p-6 border-b border-white/20 dark:border-gray-700/20 bg-blue-50/50 dark:bg-blue-900/30 flex-shrink-0">
                <h5 className="font-semibold mb-4 text-center">🌐 Choose Your Language</h5>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {INDIAN_LANGUAGES.map((lang) => (
                    <motion.button
                      key={lang.code}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setLanguage(lang.code as Language)}
                      className="p-3 bg-white/30 dark:bg-gray-700/30 backdrop-blur rounded-xl hover:bg-white/50 dark:hover:bg-gray-600/50 transition-colors text-sm border border-white/20 dark:border-gray-600/20"
                    >
                      <div className="font-medium">{lang.nativeName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div 
              ref={chatRef} 
              className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div className="text-xs bg-blue-50/80 dark:bg-blue-900/50 backdrop-blur p-3 rounded-xl border border-blue-200/30 dark:border-blue-700/30">
                💡 <strong>Pro Tips:</strong> Describe your legal situation, ask "IPC 420" for instant law info, or use voice chat!
              </div>
              
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] p-3 rounded-xl ${
                      msg.role === "user" 
                        ? "bg-blue-500/80 backdrop-blur text-white" 
                        : "bg-white/30 dark:bg-gray-700/30 backdrop-blur border border-white/20 dark:border-gray-600/20"
                    }`}>
                      <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                      {msg.role === "assistant" && (
                        <CopyButton text={msg.content} />
                      )}
                    </div>
                  </div>
                  
                  {/* Feedback Component for Assistant Messages */}
                  {msg.role === "assistant" && !msg.rating && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%]">
                        <FeedbackComponent 
                          messageId={msg.id} 
                          onSubmit={(rating, feedback) => handleFeedbackSubmit(msg.id, rating, feedback)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-white/30 dark:bg-gray-700/30 backdrop-blur p-3 rounded-xl border border-white/20 dark:border-gray-600/20">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-75"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input with Voice */}
            <div className="p-4 border-t border-white/20 dark:border-gray-700/20 flex-shrink-0">
              <div className="flex gap-2 mb-2">
                <button onClick={() => setMessages([])} className="text-xs px-3 py-1 bg-gray-500/80 backdrop-blur text-white rounded-lg hover:bg-gray-600/80">
                  Clear
                </button>
                <button onClick={() => setLanguage(null)} className="text-xs px-3 py-1 bg-gray-500/80 backdrop-blur text-white rounded-lg hover:bg-gray-600/80">
                  Language
                </button>
                <button onClick={generateShareUrl} className="text-xs px-3 py-1 bg-blue-500/80 backdrop-blur text-white rounded-lg hover:bg-blue-600/80">
                  Share Chat
                </button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={
                      language 
                        ? (language === "hi" ? "अपना कानूनी सवाल लिखें या बोलें..." : 
                           language === "ta" ? "உங்கள் சட்ட கேள்வியை எழுதுங்கள் அல்லது பேசுங்கள்..." :
                           "Type or speak your legal question...")
                        : "Choose a language first..."
                    }
                    className="w-full p-3 border border-white/30 dark:border-gray-700/30 rounded-xl resize-none bg-white/20 dark:bg-gray-700/20 backdrop-blur pr-10"
                    rows={2}
                    disabled={!language}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  {isSupported && language && (
                    <button
                      onClick={isListening ? stopListening : startListening}
                      disabled={sending}
                      className={`absolute right-2 top-2 p-1.5 rounded-lg transition-colors ${
                        isListening 
                          ? 'bg-red-500/80 backdrop-blur text-white animate-pulse' 
                          : 'bg-blue-500/80 backdrop-blur text-white hover:bg-blue-600/80'
                      }`}
                      title={isListening ? "Stop listening" : "Start voice input"}
                    >
                      🎤
                    </button>
                  )}
                </div>
                <button 
                  onClick={sendMessage}
                  disabled={sending || !language || !input.trim()}
                  className="px-4 py-2 bg-blue-500/80 backdrop-blur text-white rounded-xl disabled:opacity-50 hover:bg-blue-600/80 transition-colors"
                >
                  Send
                </button>
              </div>
              {isListening && (
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 text-center">
                  🎤 Listening... Speak now
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Chatbot Icon */}
      {!chatOpen && (
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-20 h-20 bg-gradient-to-br from-blue-500/80 to-blue-600/80 backdrop-blur-xl border-2 border-white/30 dark:border-gray-700/30 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group z-40"
        >
          <div className="relative">
            <div className="text-3xl group-hover:scale-110 transition-transform">🤖</div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-md"></div>
          </div>
        </motion.button>
      )}

      {/* Enhanced Footer */}
      <footer className="bg-white/5 dark:bg-gray-900/50 backdrop-blur py-12 border-t border-white/10 dark:border-gray-700/30">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            LegalHelp AI
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Empowering Indians with accessible legal knowledge since 2024
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <span>© 2024 LegalHelp AI</span>
            <span>Educational Use Only</span>
            <span>Made in India 🇮🇳</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 dark:bg-gray-800/10 backdrop-blur rounded-full">
            <span className="text-yellow-400">⭐</span>
            <span className="font-semibold">{averageRating}/5</span>
            <span className="text-gray-600 dark:text-gray-400">• Trusted by thousands</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
