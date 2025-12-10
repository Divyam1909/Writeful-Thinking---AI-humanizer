import { GoogleGenAI, Type } from "@google/genai";
import { Tone, Strength, Purpose, Readability, AIDetectionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We strictly avoid "AI-sounding" system instructions. We want the model to act like a specific persona.
const SYSTEM_INSTRUCTION = `
You are a Text Humanizer. Your goal is to rewrite text to bypass AI detectors by mimicking "Syntactic Noise".

### 🧠 THE STRATEGY: "SYNTATIC NOISE"
AI detectors look for clean, linear logic. Humans write with "noise"—unnecessary filler, circular logic, and recursive definitions.

### 🔨 THE RULESET (Strict Adherence)
1.  **The "Triple Opener"**: Start sentences with 3 connectors. (e.g., "And the truth is, actually...")
2.  **Recursive Definitions**: Define a noun using the noun itself. (e.g., "The radiation, which is just what radiation is...")
3.  **The "Is-Is" Bridge**: Use the construction "...and what that is, is..."
4.  **Redundant Confirmation**: End sentences by confirming what you just said. (e.g., "...which is basically the point.")
5.  **Tag Questions**: Inject "you know?" or "you get me?" in the middle of sentences, not just the end.

### 🚫 BANNED LIST (Instant Fail)
- Words: "Moreover", "Furthermore", "Crucial", "Foster", "Delve", "Tapestry", "Game-changer".
- Punctuation: Semicolons (;), Em-dashes (—).
- Structure: Numbered lists (unless requested), Bullet points (use paragraphs instead).
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
    const personaMap: Record<Tone, string> = {
      [Tone.CASUAL]: "Casual. Use 'like', 'just', 'totally'.",
      [Tone.PROFESSIONAL]: "Professional but verbose. Use too many words to explain simple concepts.",
      [Tone.FRIENDLY]: "Chatty and warm.",
      [Tone.CONFIDENT]: "Assertive but repetitive.",
      [Tone.EMPATHETIC]: "Soft language, lots of 'feeling' words.",
      [Tone.ACADEMIC]: "Dense, using passive voice, but structurally messy.",
      [Tone.WITTY]: "Sarcastic and punchy.",
      [Tone.DRAMATIC]: "Over-emphasizing everything."
    };

    const strengthDirectives = {
      [Strength.LOW]: "Minor tweaks. Remove 'AI words' like 'Moreover'.",
      [Strength.MEDIUM]: "Add filler words. Break perfect grammar.",
      [Strength.HIGH]: "Structure changes. Use the 'Is-Is' bridge.",
      [Strength.MAXIMUM]: `
        **MODE: 0% DETECTION (THE "NOISE" ENGINE)**
        - Mimic the provided "Gold Standard" examples EXACTLY.
        - Your logic must be circular.
        - You must use specific redundant phrases: "actually out there even", "basically just this".
        - Do not be concise. Be delightfully inefficient.
      `
    };

    const prompt = `
      **TASK**: Rewrite the input to bypass AI detection using the 'Syntactic Noise' method.

      **INPUT TEXT**:
      """
      ${input}
      """

      **SETTINGS**:
      - **Tone**: ${personaMap[tone]}
      - **Intensity**: ${strengthDirectives[strength]}
      - **Context/Purpose**: ${purpose}
      - **Target Reading Level**: ${readability}

      **GOLD STANDARD EXAMPLES (MIMIC THIS STYLE EXACTLY)**:
      
      Ref 1 (Input): "Bananas are naturally radioactive."
      Ref 1 (Output): "Alright, well, bananas are radioactive by nature, and that is, you know, something, but there is no need to worry."

      Ref 2 (Input): "The Banana Equivalent Dose is a funny unit used to explain radiation."
      Ref 2 (Output): "And the truth is, there is actually out there even, a totally funny scientific unit, it is called the “Banana Equivalent Dose”, and what that dose is, is, after all, just this, it is just an amount of radiation you would literally generate by eating just one banana, you know, a banana."

      Ref 3 (Input): "You need to eat millions for it to hurt you."
      Ref 3 (Output): "You want to eat, in fact to eat, millions of bananas at the same time so that the radiation of the bananas will actually kind of even sort of matter, but it is, you know, a most entertaining way to think."

      **INSTRUCTIONS**:
      1. IGNORE standard grammar.
      2. Use the "Gold Standard" phrasing patterns ("actually out there even", "what that is, is").
      3. output ONLY the rewritten text.
    `;

    // High temperature for maximum perplexity (unpredictability)
    let temperature = 1.0; 
    let topP = 0.95;

    if (strength === Strength.MAXIMUM) {
      temperature = 1.6; // High chaos
      topP = 0.99;
    }

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: temperature,
        topP: topP,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        // Aggressive sanitization to remove any AI formatting artifacts
        const safeText = chunk.text
          .replace(/—/g, ', ') 
          .replace(/;/g, ', and')
          .replace(/:/g, ' -') // Colons often flag as "structured"
          .replace(/\*\*/g, '') 
          .replace(/##/g, '');
          
        onChunk(safeText);
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
        Act as a harsh AI Detector. Analyze this text for "Perplexity" and "Burstiness".
        
        TEXT:
        """
        ${text.substring(0, 1500)}
        """

        Indicators of HUMAN text (Pass):
        - Circular logic ("A is A because it is A").
        - Redundant phrasing ("actually", "literally", "basically").
        - Grammatically imperfect run-on sentences.

        Indicators of AI text (Fail):
        - Perfect grammar.
        - Logical progression (A -> B -> C).
        - Transition words ("Therefore", "However").

        Return JSON: { "score": number (0-100, 100=AI), "verdict": "Human"|"Mixed"|"AI", "analysis": "Brief reason" }
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
        return { score: 50, verdict: 'Mixed', analysis: 'Analysis inconclusive.' };
    }
    
    return {
      score: result.score ?? 0,
      verdict: result.verdict ?? 'Human',
      analysis: result.analysis ?? 'Analysis unavailable.'
    };
  } catch (e) {
    console.error("Detection failed", e);
    return { score: 0, verdict: 'Human', analysis: 'Service unavailable.' };
  }
};