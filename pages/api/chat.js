// pages/api/chat.js
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

    const langInstruction =
      language === "hi"
        ? "Always respond in Hindi. Keep answers clear and simple."
        : "Always respond in English. Keep answers clear and simple.";

    const systemPrompt = `You are LegalHelp AI, a legal information assistant for Indian laws.
Important: You are NOT a lawyer; include a short disclaimer that this is not legal advice.
Be concise, helpful, and accurate. Ask clarifying questions if needed.
When asked about sections (e.g., IPC 420, Article 21), explain plainly with a brief example.
${langInstruction}`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 500,
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
