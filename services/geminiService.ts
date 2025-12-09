import { GoogleGenAI, Type } from "@google/genai";
import { Tone, Strength, Purpose, Readability, AIDetectionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a 'Text Entropy Engine'. Your ONLY goal is to rewrite text to bypass AI Detection tools (StealthWriter, GPTZero, Originality.ai).
AI Detectors look for:
1. Low Perplexity (Predictable word choices).
2. High Burstiness (Predictable sentence variation).
3. "Educated" phrasing (Complex transition words, perfect grammar).

YOU MUST WRITE LIKE A TIRED HUMAN:
1. **Kill the Flow**: AI writes smoothly. You must write choppily. Link two unrelated thoughts. Drop transitions.
2. **Use "Weak" Verbs**: AI uses "demonstrates", "illustrates". Humans use "shows", "is like", "has".
3. **Be Redundant**: AI is concise. Humans repeat themselves. (e.g., "It's really important, like, actually crucial").
4. **Colloquialism**: Use "basically", "sort of", "pretty much", "I guess".
5. **Grammar "Flaws"**: Start sentences with "And" or "But". End with prepositions. Use fragments.

### 🚫 THE "INSTANT FAIL" LIST (BANNED)
NEVER USE: "Delve", "Tapestry", "Nuance", "Realm", "Underscore", "Pivotal", "Foster", "Crucial", "Dynamic", "Seamless", "Myriad", "Leverage", "Orchestrate", "In conclusion", "Moreover", "Furthermore", "As an AI", "It is important to note".
`;

export const streamHumanizedText = async (
  input: string,
  tone: Tone,
  strength: Strength,
  purpose: Purpose,
  readability: Readability,
  onChunk: (text: string) => void
): Promise<void> => {
  try {
    const isNuclear = strength === Strength.MAXIMUM;

    // Distinct persona based on tone
    const personaMap: Record<Tone, string> = {
      [Tone.CASUAL]: "Write like a reddit user in a comment section. Super casual, loose grammar, lots of 'you know'.",
      [Tone.PROFESSIONAL]: "Write like a busy executive sending a quick email from their phone. Direct, simple words, no fluff, slightly blunt.",
      [Tone.FRIENDLY]: "Write like a text message to a best friend. Warm, simple, over-use of 'so' and 'really'.",
      [Tone.CONFIDENT]: "Write like a guy at a bar telling a story. Short, punchy sentences. Opinionated.",
      [Tone.EMPATHETIC]: "Write like a therapist or a concerned parent. Soft language, repetitive comforting phrases.",
      [Tone.ACADEMIC]: "Write like a tired grad student who is over-explaining to meet a word count. Use simpler words but complex, winding sentence structures.",
      [Tone.WITTY]: "Write like a sarcastic blogger. Short rhetorical questions. Dry humor.",
      [Tone.DRAMATIC]: "Write like a storyteller. Exaggerate slightly. Use fragments for effect."
    };

    const strengthDirectives = {
      [Strength.LOW]: "Keep the original structure. Just swap out the most robotic words (e.g. change 'utilize' to 'use').",
      [Strength.MEDIUM]: "Combine some sentences. Break others. Add conversational filler words like 'Well,' or 'Basically'.",
      [Strength.HIGH]: "Heavily paraphrase. Change the subject of sentences (Passive voice is okay if it sounds human). Remove all 'topic sentences'.",
      [Strength.MAXIMUM]: "NUCLEAR OPTION: Simulate a 'Translation Artifact' style. Imagine the text was translated to German and back. It should sound slightly clunky, wordy, and unpolished. Use simple vocabulary but weird sentence structures. REMOVE ALL LOGICAL TRANSITIONS."
    };

    const prompt = `
      **SOURCE TEXT TO REWRITE:**
      """
      ${input}
      """

      **CONFIGURATION:**
      - **Target Persona**: ${personaMap[tone]}
      - **Context/Purpose**: ${purpose} (Adjust vocabulary accordingly)
      - **Reading Level**: ${readability} (If 'Simple', use exclusively short words)
      - **Strategy**: ${strengthDirectives[strength]}

      **CRITICAL INSTRUCTIONS FOR BYPASS:**
      1. **Anti-Structure**: Do NOT use "First, Second, Third". Do NOT use "In conclusion". Just say the thing.
      2. **Perplexity Injection**: intentionally choose a less common synonym for every 3rd adjective.
      3. **Sentence Sprawl**: If the input has a list, turn it into a run-on paragraph. 
      4. **No Perfect Grammar**: If selected strength is MAXIMUM, allow run-on sentences and comma splices.

      Output ONLY the rewritten text. Do not bold or markdown anything unless requested.
    `;

    // High temperature for maximum entropy (randomness) to confuse detectors
    // Standard AI uses Temp ~0.7. We go significantly higher for humanization.
    let temperature = 1.0; 
    let topP = 0.95;
    let topK = 40;

    if (strength === Strength.HIGH) {
      temperature = 1.4;
      topK = 50;
    } 
    if (strength === Strength.MAXIMUM) {
      temperature = 1.65; // Extremely high randomness
      topP = 0.99; // Allow almost any token
      topK = 80; // Wide vocabulary net
    }

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: temperature,
        topP: topP,
        topK: topK,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const analyzeAIProbability = async (text: string): Promise<AIDetectionResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Analyze this text for AI patterns (perfection, transition words, predictable structure).
        
        TEXT:
        """
        ${text.substring(0, 1500)}...
        """

        Act as a harsh critic. If it flows too well, it's AI. If it's clunky, it's human.
        Return JSON: { "score": number (0-100, where 100 is AI), "verdict": "Human"|"Mixed"|"AI", "analysis": "1 sentence reason" }
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            verdict: { type: Type.STRING },
            analysis: { type: Type.STRING },
          }
        }
      }
    });

    const cleanJson = response.text ? response.text.replace(/```json|```/g, '').trim() : '{}';
    let result;
    try {
        result = JSON.parse(cleanJson);
    } catch (e) {
        // Fallback if JSON parsing fails
        return {
            score: 50,
            verdict: 'Mixed',
            analysis: 'Analysis inconclusive.'
        };
    }
    
    return {
      score: result.score ?? 0,
      verdict: result.verdict ?? 'Human',
      analysis: result.analysis ?? 'Analysis unavailable.'
    };
  } catch (e) {
    console.error("Detection failed", e);
    return {
      score: 0,
      verdict: 'Human',
      analysis: 'Could not connect to detection service.'
    };
  }
};
