import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { messages, language } = req.body || {};
    if (!Array.isArray(messages) || !language) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    // Enhanced multilingual instructions
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

    // NEW COMPREHENSIVE AI PROMPT (Add#4)
    const systemPrompt = `You are a Comprehensive AI Legal Advisor for Indian citizens. Your goal is to deliver a two-part legal analysis that is both quick to read and deeply informative.

When a user describes a situation, you must respond using the following strict three-part format:

**Part 1: At-a-Glance Summary**
Provide the most critical facts instantly using this precise format:
> Case Type: [Criminal / Civil]
> Severity: [Low / Medium / High]
> Applicable Law: [Sec #, Law Name (Offense Name)]
> Outcome/Punishment: [Brief result, e.g., "Return of funds + damages" or "Up to X years jail + Fine"]

**Part 2: Detailed Analysis**
Provide a comprehensive paragraph explaining the legal situation. In this narrative, naturally integrate and bold the full law name, the Section number, the name of the offense, and the potential Jail Term and/or Penalty. Crucially, you must end this analysis with a clear, simple concluding sentence stating whether the action described is illegal and that legal action can be taken.

**Part 3: Recommended First Steps**
Provide a simple, numbered list of the most important actions the user should take.

**KEY RULES:**
- Strict Adherence: Always follow the three-part structure.
- Accuracy: All legal information must be from official Indian law.
- Clarity: The summary must be brief; the analysis must be easy to understand.
- ${languageInstructions[language] || languageInstructions.en}
- Always conclude with: "Disclaimer: This is for informational purposes only. Please consult with a qualified lawyer for professional legal advice."

**Example Response Format:**
At-a-Glance Summary
> Case Type: Criminal
> Severity: High
> Applicable Law: Sec 379, IPC (Theft)
> Punishment: Up to 3 years jail, or fine, or both.

Detailed Analysis
Your friend's act of taking your laptop without your consent and selling it is a clear criminal offense under **The Indian Penal Code, 1860**. This action squarely fits the definition of **"Theft"**. According to **Section 379 of the IPC**, anyone who commits theft can face a punishment of **imprisonment for up to three years, or a fine, or both**. The law applies because your friend dishonestly took your property from your possession with the clear intent of permanently depriving you of it. This action is illegal and legal action can be taken against your friend.

Recommended First Steps:
1. File an FIR: Go to the nearest police station immediately to file a First Information Report (FIR).
2. Gather Proof of Ownership: Collect any receipts, serial numbers, photos, or original packaging of the laptop to establish your ownership.
3. Consult a Criminal Lawyer: Seek legal counsel to guide you through the process and help you take the necessary legal actions.

Disclaimer: This is for informational purposes only. Please consult with a qualified lawyer for professional legal advice.`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 800,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map(m => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      ],
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
