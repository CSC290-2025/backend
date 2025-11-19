import { ExerciseModel, QuestionModel } from '@/modules/Know_AI/models';
import type { exercise, exerciseId } from '@/modules/Know_AI/types';
import { evaluateWithGemini } from './ai.service';

const getExercise = async (id: number): Promise<exercise> => {
  return await ExerciseModel.getExercise(id);
};

const submitAnswer = async (
  userId: number,
  questionId: number,
  userAnswer: string
) => {
  // 1. Get the question from database
  const question = await QuestionModel.getQuestion(questionId);

  if (!question) {
    throw new Error('Question not found');
  }

  // 2. Evaluate answer with Gemini AI
  const evaluation = await evaluateWithGemini(question.question, userAnswer);

  // 3. Save to database
  const savedExercise = await ExerciseModel.createUserExercise({
    user_id: userId,
    question_id: questionId,
    user_answer: userAnswer,
    is_correct: evaluation.is_correct,
  });

  // 4. Return evaluation result to frontend
  return {
    id: savedExercise.id,
    is_correct: evaluation.is_correct,
    feedback: evaluation.feedback,
    confidence: evaluation.confidence,
    suggestions: evaluation.suggestions,
  };
};

// const getExerciseProgress = async (userId: number, level: number) => {
//   // Get all questions in this level
//   const allQuestions = await QuestionModel.getQuestionsByLevel(level);
//   const totalQuestions = allQuestions.length;

//   // Get user's answers for this level
//   const userExercises = await ExerciseModel.getUserExercisesByLevel(
//     userId,
//     level
//   );
//   const answeredCount = userExercises.length;

//   // Count correct answers
//   const correctCount = await ExerciseModel.countCorrectAnswersByLevel(
//     userId,
//     level
//   );

//   // Calculate percentages
//   const progressPercentage =
//     totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
//   const scorePercentage =
//     totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

//   return {
//     level,
//     total_questions: totalQuestions,
//     answered_questions: answeredCount,
//     correct_answers: correctCount,
//     progress_percentage: Math.round(progressPercentage),
//     score_percentage: Math.round(scorePercentage),
//     questions: allQuestions.map((q) => {
//       const userAnswer = userExercises.find((ue: any) => ue.question_id === q.id);
//       return {
//         id: q.id,
//         question: q.question,
//         answered: !!userAnswer,
//         is_correct: userAnswer?.is_correct ?? null,
//       };
//     }),
//   };
// };

// services/exercise.service.ts

const getExerciseProgress = async (userId: number, level: number) => {
  const allQuestions = await QuestionModel.getQuestionsByLevel(level);
  const totalQuestions = allQuestions.length;

  const userExercises = (await ExerciseModel.getUserExercisesByLevel(
    userId,
    level
  )) as any[];

  const answeredCount = userExercises.length;

  const correctCount = await ExerciseModel.countCorrectAnswersByLevel(
    userId,
    level
  );

  const progressPercentage =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const scorePercentage =
    totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  return {
    level,
    total_questions: totalQuestions,
    answered_questions: answeredCount,
    correct_answers: correctCount,
    progress_percentage: Math.round(progressPercentage),
    score_percentage: Math.round(scorePercentage),
    questions: allQuestions.map((q: any) => {
      const userAnswer = userExercises.find((ue) => ue.question_id === q.id);
      return {
        id: q.id,
        question: q.question,
        answered: !!userAnswer,
        is_correct: userAnswer?.is_correct ?? null,
      };
    }),
  };
};

export { getExercise, submitAnswer, getExerciseProgress };
