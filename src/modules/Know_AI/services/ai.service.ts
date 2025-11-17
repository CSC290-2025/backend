import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.G01_KNOW_AI || '');

interface AIEvaluation {
  is_correct: boolean;
  confidence: number;
  feedback: string;
  suggestions: string;
}

const evaluateWithGemini = async (
  questionText: string,
  userAnswer: string
): Promise<AIEvaluation> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are evaluating a student's answer for a prompt engineering course.

Question: ${questionText}
Student Answer: ${userAnswer}

Evaluate if the student's answer demonstrates understanding of prompt engineering concepts.
Consider semantic similarity, key concepts, and practical understanding.

Respond ONLY with a JSON object in this exact format (no markdown, no extra text):
{
  "is_correct": true or false,
  "confidence": 0-100,
  "feedback": "brief explanation of why the answer is correct or incorrect",
  "suggestions": "what could be improved (empty string if perfect)"
}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Remove markdown code blocks if present
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    const evaluation = JSON.parse(cleaned);

    // Validate response structure
    if (typeof evaluation.is_correct !== 'boolean') {
      throw new Error('Invalid evaluation format from AI');
    }

    return {
      is_correct: evaluation.is_correct,
      confidence: evaluation.confidence || 50,
      feedback: evaluation.feedback || 'Answer evaluated',
      suggestions: evaluation.suggestions || '',
    };
  } catch (error) {
    console.error('Gemini evaluation error:', error);
    return fallbackEvaluation(userAnswer);
  }
};

const fallbackEvaluation = (userAnswer: string): AIEvaluation => {
  const isLongEnough = userAnswer.trim().length > 20;
  const hasMultipleWords = userAnswer.trim().split(' ').length > 5;

  return {
    is_correct: isLongEnough && hasMultipleWords,
    confidence: 50,
    feedback: 'Answer auto-evaluated due to AI service unavailability.',
    suggestions: 'Please ensure your answer is detailed and clear.',
  };
};

export { evaluateWithGemini };
export type { AIEvaluation };
