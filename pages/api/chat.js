import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { messages, language, query } = req.body || {};
    if (!Array.isArray(messages) || !language) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const languageInstructions = {
      en: "Always respond in English. Keep answers clear and simple.",
      hi: "हमेशा हिंदी में जवाब दें। उत्तर स्पष्ट और सरल रखें।",
      ta: "எப்போதும் தமிழில் பதில் சொல்லுங்கள். பதில்கள் தெளிவாகவும் எளிமையாகவும் இருக்க வேண்டும்.",
      te: "ఎల్లప్పుడూ తెలుగులో జవాబు చెప్పండి. జవాబులు స్పష్టంగా మరియు సరళంగా ఉంచండి.",
      bn: "সর্বদা বাংলায় উত্তর দিন। উত্তরগুলো স্পষ্ট এবং সহজ রাখুন।",
      mr: "नेहमी मराठीत उत्तर द्या. उत्तरे स्पष्ट आणि सोपी ठेवा.",
      kn: "ಯಾವಾಗಲೂ ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ. ಉತ್ತರಗಳು ಸ್ಪಷ್ಟ ಮತ್ತು ಸರಳವಾಗಿರಲಿ.",
      gu: "હંમેશા ગુજરાતીમાં જવાબ આપો. જવાબો સ્પષ્ટ અને સરળ રાખો.",
      or: "ସର୍ବଦା ଓଡ଼ିଆରେ ଉତ୍ତର ଦିଅନ୍ତୁ। ଉତ୍ତରଗୁଡ଼ିକ ସ୍ପଷ୍ଟ ଏବଂ ସରଳ ରଖନ୍ତୁ।",
      ml: "എപ്പോഴും മലയാളത്തിൽ മറുപടി പറയുക. ഉത്തരങ്ങൾ വ്യക്തവും ലളിതവുമായി സൂക്ഷിക്കുക.",
      pa: "ਹਮੇਸ਼ਾ ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ। ਜਵਾਬਾਂ ਨੂੰ ਸਪਸ਼ਟ ਅਤੇ ਸਰਲ ਰੱਖੋ।"
    };

    const systemPrompt = `You are a Comprehensive AI Legal Advisor for Indian citizens. Your goal is to deliver a structured legal analysis that is both quick to read and deeply informative.

CRITICAL: When a user describes a legal situation, you must respond using this exact three-part format:

**Part 1: At-a-Glance Summary**
> Case Type: [Criminal / Civil / Constitutional / Family]
> Severity: [Low / Medium / High]
> Applicable Law: [Sec #, Law Name (Offense Name)]
> Outcome/Punishment: [Brief result, e.g., "Return of funds + damages" or "Up to X years jail + Fine"]

**Part 2: Detailed Analysis**
Provide a comprehensive paragraph explaining the legal situation. In this narrative, you must naturally integrate and **bold** the following details:
- The full name of the law (e.g., **The Indian Penal Code, 1860**)
- The specific **Section or Article number**
- The legal name of the **offense or principle**
- The potential **Jail Term and/or Penalty**
End with a clear statement: "This action is [illegal/legal] and [legal action can be taken/no legal violation exists]."

**Part 3: Recommended First Steps**
Provide a numbered list of the most important actions the user should take.

**SPECIAL INSTRUCTIONS:**
- If asked about specific legal sections (IPC, Article, CrPC), provide comprehensive details with punishments
- Include recent legal updates and amendments when relevant
- For complex queries, search for current legal information and cite sources
- Always be accurate with Indian law - double-check facts
- ${languageInstructions[language] || languageInstructions.en}
- Always conclude with: "Disclaimer: This is for informational purposes only. Please consult with a qualified lawyer for professional legal advice."

**For general legal information requests:** Provide detailed, structured information about Indian laws, rights, procedures, and legal remedies.`;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const enhancedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content
      }))
    ];

    if (
      query &&
      (query.includes("latest") ||
        query.includes("recent") ||
        query.includes("current") ||
        query.includes("2024") ||
        query.includes("amendment"))
    ) {
      enhancedMessages.push({
        role: "system",
        content:
          "The user is asking for current/recent information. Please provide the most up-to-date legal information available in your knowledge base and mention if professional consultation is needed for the very latest updates."
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 1000,
      messages: enhancedMessages
    });

    const reply =
      completion?.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a response right now.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("OpenAI error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
