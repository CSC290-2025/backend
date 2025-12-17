import { ExerciseModel, QuestionModel } from '@/modules/Know_AI/models';
import type { exercise, exerciseId } from '@/modules/Know_AI/types';
import { evaluateWithGemini } from './ai.service';
import { createUserSpecialty } from '@/modules/citizens/models/userSpecialtyG1.model';

const getExercise = async (id: number): Promise<exercise> => {
  return await ExerciseModel.getExercise(id);
};

const submitAnswer = async (
  userId: number,
  questionId: number,
  userAnswer: string
) => {
  // Get the question from database
  const question = await QuestionModel.getQuestion(questionId);

  if (!question) {
    throw new Error('Question not found');
  }

  // Evaluate answer with Gemini AI
  const evaluation = await evaluateWithGemini(question.question, userAnswer);

  // Save to database
  const savedExercise = await ExerciseModel.createUserExercise({
    user_id: userId,
    question_id: questionId,
    user_answer: userAnswer,
    is_correct: evaluation.is_correct,
  });

  // if correct all question allowed user specialty
  let specialtyGranted = false;
  if (evaluation.is_correct && question.level === 3) {
    const correctCount = await ExerciseModel.countCorrectAnswersByLevel(
      userId,
      3
    );
    const totalQuestions = await QuestionModel.countQuestionsByLevel(3);

    if (correctCount >= totalQuestions) {
      specialtyGranted = true;
      try {
        const SPECIALTY_ID = 1;

        await createUserSpecialty({
          user_id: userId,
          specialty_id: SPECIALTY_ID,
        });
        console.log('Specialty granted to user');
      } catch (error) {
        console.error('User already has the specialty or error', error);
      }
    }
  }

  // Return evaluation result to frontend
  return {
    id: savedExercise.id,
    is_correct: evaluation.is_correct,
    feedback: evaluation.feedback,
    confidence: evaluation.confidence,
    suggestions: evaluation.suggestions,
    specialty_granted: specialtyGranted,
  };
};

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
