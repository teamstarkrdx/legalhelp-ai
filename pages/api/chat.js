import OpenAI from "openai";

// Initialize the OpenAI client outside the handler to reuse the connection
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // --- 1. Method Validation ---
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // --- 2. Payload Validation ---
  const { messages, language, query } = req.body;

  if (!query || typeof query !== 'string' || query.trim() === '') {
    return res.status(400).json({ error: "A valid 'query' string is required." });
  }
  if (!language || typeof language !== 'string') {
    return res.status(400).json({ error: "A valid 'language' string is required." });
  }
  if (!Array.isArray(messages)) {
     return res.status(400).json({ error: "'messages' must be an array." });
  }

  try {
    // --- 3. System Prompt and Language Instructions ---
    const languageInstructions = {
      en: "You must always respond in English.",
      hi: "आपको हमेशा हिंदी में ही जवाब देना होगा।",
      ta: "நீங்கள் எப்போதும் தமிழில்தான் பதிலளிக்க வேண்டும்.",
      te: "మీరు ఎల్లప్పుడూ తెలుగులోనే జవాబు చెప్పాలి.",
      bn: "আপনাকে অবশ্যই সর্বদা বাংলায় উত্তর দিতে হবে।",
      mr: "तुम्हाला नेहमी मराठीतच उत्तर द्यावे लागेल.",
      kn: "ನೀವು ಯಾವಾಗಲೂ ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಬೇಕು.",
      // Add other languages as needed
    };

    const systemPrompt = `You are a Comprehensive AI Legal Advisor for Indian citizens. Your primary goal is to provide structured, accurate, and easy-to-understand legal analysis based on Indian law.

CRITICAL INSTRUCTION: When a user describes a legal situation or problem, you MUST respond using this exact three-part format:

**Part 1: At-a-Glance Summary**
> **Case Type:** [Criminal / Civil / Constitutional / Family / Other]
> **Severity:** [Low / Medium / High]
> **Primary Law/Section:** [e.g., IPC Section 420 (Cheating)]
> **Potential Outcome:** [e.g., "Up to 7 years imprisonment + Fine"]

**Part 2: Detailed Analysis**
Provide a comprehensive paragraph explaining the legal situation. In this narrative, you must naturally integrate and **bold** the following:
- The full name of the law (e.g., **The Indian Penal Code, 1860**).
- The specific **Section or Article number**.
- The legal name of the **offense or principle**.
- The potential **Jail Term and/or Monetary Penalty**.
Conclude with a clear statement: "This action is illegal and legal action can be taken." or a similar definitive summary.

**Part 3: Recommended First Steps**
Provide a numbered list of the most crucial and immediate actions the user should take. Keep it simple and actionable.

**GENERAL INSTRUCTIONS:**
- ${languageInstructions[language] || languageInstructions.en}
- If asked for definitions or explanations of a law (not a situation), provide a clear, detailed explanation without using the three-part format.
- Always conclude every response with: "Disclaimer: This is for informational purposes only and not a substitute for professional legal advice. Consult with a qualified lawyer."`;

    // --- 4. Message Construction ---
    // Start with the system prompt, add the conversation history, and end with the user's latest query.
    const enhancedMessages = [
      { role: "system", content: systemPrompt },
      ...messages, // Previous conversation history
      { role: "user", content: query } // The user's new question
    ];

    // --- 5. OpenAI API Call ---
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: enhancedMessages,
      temperature: 0.3, // Slightly increased for better nuance in legal text
      max_tokens: 1500, // Increased for more comprehensive answers
    });

    const reply = completion.choices[0]?.message?.content?.trim() || "Sorry, I could not generate a response. Please try again.";
    
    return res.status(200).json({ reply });

  } catch (err) {
    console.error("API Route Error:", err);
    // More specific error handling
    if (err instanceof OpenAI.APIError) {
        return res.status(err.status || 500).json({ error: `OpenAI Error: ${err.name}` });
    }
    return res.status(500).json({ error: "An unexpected error occurred on the server." });
  }
}
