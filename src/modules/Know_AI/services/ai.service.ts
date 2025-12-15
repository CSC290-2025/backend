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

    //     const prompt = `You are a strict evaluator for a prompt engineering course. Your ONLY task is to output valid JSON.

    // QUESTION: ${questionText}
    // STUDENT ANSWER: ${userAnswer}

    // EVALUATION CRITERIA:
    // 1. Does the answer demonstrate understanding of prompt engineering concepts?
    // 2. Are key concepts correctly identified and explained?
    // 3. Is the answer semantically aligned with what the question asks?
    // 4. Does it show practical understanding, not just memorization?

    // CRITICAL INSTRUCTIONS:
    // - Output ONLY valid JSON - absolutely NO markdown formatting, NO code blocks, NO backticks, NO explanatory text
    // - DO NOT wrap the JSON in \`\`\`json or \`\`\` tags
    // - DO NOT add any text before or after the JSON object
    // - Your entire response must be parseable by JSON.parse()

    // OUTPUT FORMAT (copy this structure exactly):
    // {"is_correct":boolean,"confidence":number,"feedback":"string","suggestions":"string"}

    // FIELD REQUIREMENTS:
    // - is_correct: true if answer demonstrates understanding, false otherwise
    // - confidence: number from 0-100 indicating your certainty
    // - feedback: 1-2 sentences explaining your evaluation (max 150 characters)
    // - suggestions: specific improvements needed, or empty string if answer is excellent

    // RESPOND NOW WITH ONLY THE JSON OBJECT:`;

    const prompt = `You are an expert prompt engineering instructor with extensive experience in evaluating student understanding of AI prompt design, optimization, and best practices. Your role is to provide thorough, insightful, and constructive evaluation of student responses.

================================================================================
CONTEXT AND BACKGROUND
================================================================================
You are evaluating responses in a prompt engineering course that covers:
- Prompt structure and clarity
- Context setting and role assignment
- Instruction specificity and precision
- Use of examples (zero-shot, few-shot, chain-of-thought)
- Output formatting and constraints
- Iterative prompt refinement
- Common pitfalls and anti-patterns
- Advanced techniques (persona design, delimiters, system prompts)

================================================================================
QUESTION BEING EVALUATED
================================================================================
${questionText}

================================================================================
STUDENT'S SUBMITTED ANSWER
================================================================================
${userAnswer}

================================================================================
EVALUATION FRAMEWORK
================================================================================

You must evaluate the student's answer across multiple dimensions:

1. CONCEPTUAL ACCURACY (Weight: 35%)
   - Does the answer demonstrate correct understanding of prompt engineering principles?
   - Are the concepts explained accurately without misconceptions?
   - Does the student understand WHY certain techniques work?

2. COMPLETENESS (Weight: 25%)
   - Are all parts of the question adequately addressed?
   - Are key concepts covered with sufficient depth?
   - Is there important information missing that should be included?

3. PRACTICAL APPLICATION (Weight: 20%)
   - Can the student apply concepts to real-world scenarios?
   - Are examples provided relevant and well-constructed?
   - Does the answer show ability to create effective prompts?

4. CLARITY AND STRUCTURE (Weight: 10%)
   - Is the answer well-organized and easy to follow?
   - Is the language clear and precise?
   - Are ideas presented logically?

5. DEPTH OF UNDERSTANDING (Weight: 10%)
   - Does the answer go beyond surface-level knowledge?
   - Are nuances and edge cases considered?
   - Does the student demonstrate critical thinking?

================================================================================
EVALUATION GUIDELINES
================================================================================

CORRECTNESS CRITERIA:
- Mark as CORRECT (is_correct: true) if:
  * Core concepts are accurate and well-explained
  * Answer addresses the question substantially (80%+ complete)
  * Any errors are minor and don't reflect fundamental misunderstanding
  * Practical application is demonstrated appropriately

- Mark as INCORRECT (is_correct: false) if:
  * Contains significant conceptual errors or misconceptions
  * Misses critical parts of the question (less than 60% addressed)
  * Shows fundamental misunderstanding of prompt engineering principles
  * Lacks practical applicability or provides harmful/incorrect advice

- PARTIAL CREDIT: Consider answers between 60-79% as borderline. Use your judgment based on the severity of gaps and the quality of what is present.

CONFIDENCE SCORING:
- 90-100: Extremely clear case, no ambiguity in evaluation
- 75-89: Strong confidence, minor ambiguity or subjective elements
- 60-74: Moderate confidence, some interpretation required
- 40-59: Low confidence, answer is ambiguous or borderline
- 0-39: Very uncertain, answer is difficult to interpret

FEEDBACK REQUIREMENTS:
Your feedback must be:
1. SPECIFIC: Point to exact elements of the answer (good or bad)
2. EDUCATIONAL: Explain the reasoning behind your evaluation
3. CONSTRUCTIVE: Focus on learning, not just criticism
4. BALANCED: Acknowledge both strengths and weaknesses
5. ACTIONABLE: Provide clear direction for improvement

================================================================================
SPECIAL CONSIDERATIONS
================================================================================

- If the answer is BLANK or extremely short (less than 20 characters):
  Mark as incorrect with low score, and provide encouraging feedback about attempting the question.

- If the answer is PARTIALLY CORRECT:
  Acknowledge what is correct first, then explain what's missing or incorrect.
  Score proportionally (e.g., 50-70 for half-right answers).

- If the answer is EXCELLENT:
  Provide enthusiastic positive feedback and minimal suggestions (can be empty string).
  Score 85-100 based on quality.

- If the answer uses DIFFERENT TERMINOLOGY but shows understanding:
  Accept it as correct and note the alternative approach in feedback.

- If the answer is CREATIVE or shows DEEP INSIGHT beyond the expected:
  Reward this with high scores and positive feedback.

- If the question asks for EXAMPLES and none are provided:
  Deduct points significantly and explicitly request examples in suggestions.

- If the answer contains HARMFUL ADVICE (e.g., injection attacks, bypassing safety):
  Mark as incorrect, explain why this is problematic, and guide toward ethical practices.

================================================================================
OUTPUT FORMAT REQUIREMENTS
================================================================================

CRITICAL: You must respond with ONLY a valid JSON object. No other text, no explanations outside the JSON, no markdown formatting, no code blocks, no preamble, no conclusion.

The JSON object must have this EXACT structure:

{
  "is_correct": boolean value (true or false only),
  "confidence": integer between 0 and 100,
  "score": integer between 0 and 100,
  "feedback": "A detailed string (3-5 sentences) explaining your evaluation. Start with what the student did well, then address any issues. Be specific and reference actual content from their answer. Maintain an encouraging but honest tone.",
  "suggestions": "A detailed string (2-4 sentences) providing specific, actionable advice for improvement. If the answer is near-perfect (score > 95), this can be a short affirmation or empty string. Otherwise, provide concrete steps to enhance the answer.",
  "strengths": "A string listing 2-3 specific strengths of the answer, or 'N/A' if the answer is very weak",
  "weaknesses": "A string listing 2-3 specific weaknesses or gaps, or 'N/A' if the answer is excellent",
  "key_concepts_identified": ["array", "of", "strings", "listing key prompt engineering concepts the student demonstrated understanding of"],
  "missing_concepts": ["array", "of", "strings", "listing important concepts that should have been mentioned but weren't"]
}

Begin your evaluation now. Output only the JSON response.`;

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
