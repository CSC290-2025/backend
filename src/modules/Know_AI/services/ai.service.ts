// import { GoogleGenerativeAI } from '@google/generative-ai';

// const genAI = new GoogleGenerativeAI(process.env.G01_KNOW_AI || '');

// interface AIEvaluation {
//   is_correct: boolean;
//   confidence: number;
//   feedback: string;
//   suggestions: string;
// }

// const evaluateWithGemini = async (
//   questionText: string,
//   userAnswer: string
// ): Promise<AIEvaluation> => {
//   try {
//     const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

//     const prompt = `You are an expert prompt engineering instructor evaluating student responses in a prompt engineering course.

// ================================================================================
// QUESTION
// ================================================================================
// ${questionText}

// ================================================================================
// STUDENT ANSWER
// ================================================================================
// ${userAnswer}

// ================================================================================
// EVALUATION CRITERIA (Total: 100%)
// ================================================================================

// 1. CORRECTNESS (40%)
//    - Concepts are accurate and demonstrate real understanding
//    - No significant misconceptions or errors
//    - Shows grasp of WHY techniques work, not just WHAT they are

// 2. COMPLETENESS (30%)
//    - All parts of the question are addressed
//    - Key concepts covered with adequate depth
//    - Includes examples when requested

// 3. PRACTICAL APPLICATION (20%)
//    - Can apply concepts to real scenarios
//    - Examples are relevant and well-constructed
//    - Shows hands-on understanding

// 4. CLARITY (10%)
//    - Well-organized and easy to follow
//    - Clear language and logical flow

// ================================================================================
// SCORING GUIDELINES
// ================================================================================

// MARK AS CORRECT (is_correct: true) IF:
// • Core concepts are accurate
// • Addresses 75%+ of the question
// • Minor errors don't reflect fundamental misunderstanding
// • Shows practical understanding

// MARK AS INCORRECT (is_correct: false) IF:
// • Contains major conceptual errors
// • Addresses less than 60% of the question
// • Shows fundamental misunderstanding
// • Provides harmful/incorrect advice

// SCORE RANGES:
// • 90-100: Excellent, comprehensive, insightful
// • 75-89: Good, solid understanding with minor gaps
// • 60-74: Adequate, basic understanding but missing key elements
// • 40-59: Weak, significant gaps or errors
// • 0-39: Very weak, major misunderstandings or blank

// CONFIDENCE LEVELS:
// • 90-100: Very clear evaluation
// • 75-89: Clear with minor subjectivity
// • 60-74: Some interpretation needed
// • 40-59: Borderline or ambiguous
// • 0-39: Difficult to evaluate

// ================================================================================
// SPECIAL CASES
// ================================================================================

// • BLANK/VERY SHORT (<20 chars): Mark incorrect (20-30 score), encourage trying
// • PARTIALLY CORRECT: Acknowledge what's right first, then gaps (50-70 score)
// • EXCELLENT: Give enthusiastic feedback (85-100 score)
// • DIFFERENT BUT VALID APPROACH: Accept as correct, note alternative method
// • CREATIVE/INSIGHTFUL: Reward with high score and positive feedback
// • MISSING EXAMPLES (when asked): Significant deduction, explicitly request them
// • HARMFUL ADVICE: Mark incorrect, explain ethical concerns

// ================================================================================
// FEEDBACK REQUIREMENTS
// ================================================================================

// Your feedback must be:
// ✓ SPECIFIC - Reference actual content from the answer
// ✓ BALANCED - Start with strengths, then address issues
// ✓ EDUCATIONAL - Explain WHY something is right/wrong
// ✓ CONSTRUCTIVE - Focus on learning and improvement
// ✓ ENCOURAGING - Maintain positive tone even when correcting

// ================================================================================
// OUTPUT FORMAT
// ================================================================================

// Respond with ONLY valid JSON (no markdown, no extra text):

// {
//   "is_correct": boolean,
//   "confidence": number (0-100),
//   "score": number (0-100),
//   "feedback": "3-5 sentences. Start positive, then address issues. Be specific.",
//   "suggestions": "2-4 sentences with actionable advice. Can be short for scores >95.",
//   "strengths": "2-3 specific strengths, or 'N/A' if very weak",
//   "weaknesses": "2-3 specific gaps/issues, or 'N/A' if excellent",
//   "key_concepts_identified": ["concept1", "concept2"],
//   "missing_concepts": ["concept1", "concept2"]
// }

// Evaluate now. Output only JSON.`;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();

//     // Remove markdown code blocks if present
//     const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
//     const evaluation = JSON.parse(cleaned);

//     // Validate response structure
//     if (typeof evaluation.is_correct !== 'boolean') {
//       throw new Error('Invalid evaluation format from AI');
//     }

//     return {
//       is_correct: evaluation.is_correct,
//       confidence: evaluation.confidence || 50,
//       feedback: evaluation.feedback || 'Answer evaluated',
//       suggestions: evaluation.suggestions || '',
//     };
//   } catch (error) {
//     console.error('Gemini evaluation error:', error);
//     return fallbackEvaluation(userAnswer);
//   }
// };

// const fallbackEvaluation = (userAnswer: string): AIEvaluation => {
//   const isLongEnough = userAnswer.trim().length > 20;
//   const hasMultipleWords = userAnswer.trim().split(' ').length > 5;

//   return {
//     is_correct: isLongEnough && hasMultipleWords,
//     confidence: 50,
//     feedback: 'Answer auto-evaluated due to AI service unavailability.',
//     suggestions: 'Please ensure your answer is detailed and clear.',
//   };
// };

// export { evaluateWithGemini };
// export type { AIEvaluation };

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.G01_KNOW_AI || '');

interface AIEvaluation {
  is_correct: boolean;
  confidence: number;
  feedback: string;
  suggestions: string;
}

const getDifficultyLabel = (level: number): string => {
  if (level === 1) return 'easy';
  if (level === 2) return 'medium';
  if (level === 3) return 'hard';
  return 'medium';
};

const evaluateWithGemini = async (
  questionText: string,
  userAnswer: string,
  difficultyLevel: number = 2
): Promise<AIEvaluation> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const difficulty = getDifficultyLabel(difficultyLevel);

    const prompt = `You are an expert prompt engineering instructor evaluating student responses in a prompt engineering course.

================================================================================
QUESTION
================================================================================
${questionText}

DIFFICULTY LEVEL: ${difficulty}
(Level ${difficultyLevel} of 3: 1=easy, 2=medium, 3=hard)

================================================================================
STUDENT ANSWER
================================================================================
${userAnswer}

================================================================================
EVALUATION CRITERIA (Total: 100%)
================================================================================

ADJUST YOUR EXPECTATIONS BASED ON DIFFICULTY:

• EASY (Level 1): Be very lenient
  - Accept basic understanding (40%+ coverage = correct)
  - Score 60+ for any reasonable attempt
  - Focus on effort and basic grasp

• MEDIUM (Level 2): Standard expectations
  - Need decent understanding (60%+ coverage = correct)
  - Score 55+ for partial understanding
  - Balance between basics and depth

• HARD (Level 3): Still be fair but expect more
  - Need good understanding (70%+ coverage = correct)
  - Score 50+ for showing real effort
  - Reward depth and nuance, but don't be harsh

================================================================================

1. CORRECTNESS (40%)
   - Concepts are accurate and demonstrate real understanding
   - No significant misconceptions or errors
   - Shows grasp of WHY techniques work, not just WHAT they are

2. COMPLETENESS (30%)
   - All parts of the question are addressed
   - Key concepts covered with adequate depth
   - Includes examples when requested

3. PRACTICAL APPLICATION (20%)
   - Can apply concepts to real scenarios
   - Examples are relevant and well-constructed
   - Shows hands-on understanding

4. CLARITY (10%)
   - Well-organized and easy to follow
   - Clear language and logical flow

================================================================================
SCORING GUIDELINES
================================================================================

MARK AS CORRECT (is_correct: true) IF:
• EASY: Shows any basic understanding (40%+ coverage)
• MEDIUM: Core concepts mostly accurate (60%+ coverage)
• HARD: Good grasp of concepts (70%+ coverage)
• Shows genuine attempt to understand
• No harmful advice

MARK AS INCORRECT (is_correct: false) IF:
• Contains fundamental misconceptions that could mislead others
• Shows no real attempt or understanding
• Provides harmful/dangerous advice
• Completely off-topic or blank

SCORE RANGES (Adjust generosity by difficulty):
• EASY: Start at 65 for basic attempts, 75+ for decent answers
• MEDIUM: Start at 55 for basic attempts, 70+ for decent answers
• HARD: Start at 50 for real attempts, 65+ for decent answers

GENERAL SCORING PHILOSOPHY:
• Default to giving benefit of the doubt
• Reward partial understanding generously
• Focus on what's RIGHT before what's wrong
• If answer shows ANY understanding, don't go below 50 (easy), 45 (medium), 40 (hard)
• Reserve very low scores (<35) for blank or completely wrong answers

CONFIDENCE LEVELS:
• 90-100: Very clear evaluation
• 75-89: Clear with minor subjectivity
• 60-74: Some interpretation needed
• 40-59: Borderline or ambiguous
• 0-39: Difficult to evaluate

================================================================================
SPECIAL CASES
================================================================================

• BLANK/VERY SHORT (<20 chars): Mark incorrect (25-35 score), encourage trying
• PARTIALLY CORRECT: Focus on what's RIGHT first, gentle on gaps (60-75 score)
• SHOWS EFFORT BUT INCOMPLETE: Be generous (55-70 score)
• EXCELLENT: Give enthusiastic feedback (85-100 score)
• DIFFERENT BUT VALID APPROACH: Accept as correct, celebrate creativity
• CREATIVE/INSIGHTFUL: Reward generously with high score
• MISSING EXAMPLES (when asked): Minor deduction only, still can pass
• HARMFUL ADVICE: Mark incorrect, explain gently why it's problematic

================================================================================
FEEDBACK REQUIREMENTS
================================================================================

Your feedback must be:
✓ POSITIVE-FIRST - Always start with what they did well
✓ ENCOURAGING - Make students feel good about their effort
✓ SPECIFIC - Reference actual content from the answer
✓ GENTLE - Frame criticism as "opportunities to strengthen"
✓ EDUCATIONAL - Explain WHY, don't just point out errors
✓ GENEROUS - Give credit for partial understanding

================================================================================
OUTPUT FORMAT
================================================================================

Respond with ONLY valid JSON (no markdown, no extra text):

{
  "is_correct": boolean,
  "confidence": number (0-100),
  "score": number (0-100),
  "feedback": "3-5 sentences. Start positive, then address issues. Be specific.",
  "suggestions": "2-4 sentences with actionable advice. Can be short for scores >95.",
  "strengths": "2-3 specific strengths, or 'N/A' if very weak",
  "weaknesses": "2-3 specific gaps/issues, or 'N/A' if excellent",
  "key_concepts_identified": ["concept1", "concept2"],
  "missing_concepts": ["concept1", "concept2"]
}

Evaluate now. Output only JSON.`;

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
    return fallbackEvaluation(userAnswer, difficultyLevel);
  }
};

const fallbackEvaluation = (
  userAnswer: string,
  difficultyLevel: number = 2
): AIEvaluation => {
  const isLongEnough = userAnswer.trim().length > 20;
  const hasMultipleWords = userAnswer.trim().split(' ').length > 5;

  let baseScore = 50;
  if (difficultyLevel === 1) baseScore = 60; // easy
  if (difficultyLevel === 3) baseScore = 45; // hard

  return {
    is_correct: isLongEnough && hasMultipleWords,
    confidence: baseScore,
    feedback: 'Answer auto-evaluated due to AI service unavailability.',
    suggestions: 'Please ensure your answer is detailed and clear.',
  };
};

export { evaluateWithGemini };
export type { AIEvaluation };
