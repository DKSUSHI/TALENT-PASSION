import { GoogleGenAI, Type } from "@google/genai";
import { Answer, AssessmentResult, DomainType } from '../types';

export const analyzeStrengths = async (answers: Answer[], apiKey: string): Promise<Omit<AssessmentResult, 'id' | 'date'>> => {
  if (!apiKey) {
      throw new Error("API Key is required");
  }
  
  const ai = new GoogleGenAI({ apiKey: apiKey });

  const answerSummary = answers.map(a => `Q${a.questionId}: ${a.selectedText}`).join('\n');

  const prompt = `
    You are an expert psychometrician specializing in the CliftonStrengths (StrengthsFinder) methodology.
    Based on the user's responses to a forced-choice assessment, analyze their personality and identify their top 5 likely strengths themes.
    
    The 4 domains are:
    1. EXECUTING (執行力): Achiever, Arranger, Belief, Consistency, Deliberative, Discipline, Focus, Responsibility, Restorative.
    2. INFLUENCING (影響力): Activator, Command, Communication, Competition, Maximizer, Self-Assurance, Significance, Woo.
    3. RELATIONSHIP_BUILDING (建立關係): Adaptability, Connectedness, Developer, Empathy, Harmony, Includer, Individualization, Positivity, Relator.
    4. STRATEGIC_THINKING (戰略思維): Analytical, Context, Futuristic, Ideation, Input, Intellection, Learner, Strategic.

    User Responses:
    ${answerSummary}

    Task:
    1. Identify the Top 5 distinct strengths for this user.
    2. Calculate a percentage distribution (0-100) for each of the 4 domains based on the overall sentiment of answers.
    3. Write a personalized summary.
    4. Provide the output in Traditional Chinese (繁體中文).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topStrengths: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Name of the strength theme in Traditional Chinese (e.g., 成就, 戰略)" },
                domain: { 
                  type: Type.STRING, 
                  enum: [
                    DomainType.EXECUTING,
                    DomainType.INFLUENCING,
                    DomainType.RELATIONSHIP_BUILDING,
                    DomainType.STRATEGIC_THINKING
                  ]
                },
                description: { type: Type.STRING, description: "A brief description of this strength for the user." },
                advice: { type: Type.STRING, description: "Actionable advice on how to use this strength." }
              },
              required: ["name", "domain", "description", "advice"]
            }
          },
          domainDistribution: {
            type: Type.OBJECT,
            properties: {
              [DomainType.EXECUTING]: { type: Type.NUMBER },
              [DomainType.INFLUENCING]: { type: Type.NUMBER },
              [DomainType.RELATIONSHIP_BUILDING]: { type: Type.NUMBER },
              [DomainType.STRATEGIC_THINKING]: { type: Type.NUMBER }
            },
            required: [DomainType.EXECUTING, DomainType.INFLUENCING, DomainType.RELATIONSHIP_BUILDING, DomainType.STRATEGIC_THINKING]
          },
          summary: { type: Type.STRING, description: "Overall personality summary paragraph." }
        },
        required: ["topStrengths", "domainDistribution", "summary"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  return JSON.parse(text);
};