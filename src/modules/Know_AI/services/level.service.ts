import {
  LevelModel,
  QuestionModel,
  ExerciseModel,
} from '@/modules/Know_AI/models';
import type { level, levelId } from '@/modules/Know_AI/types';

const getLevel = async (id: number): Promise<level> => {
  return await LevelModel.getLevel(id);
};

const completeLevel = async (userId: number, currentLevel: number) => {
  // Get total questions in this level
  const totalQuestions =
    await QuestionModel.countQuestionsByLevel(currentLevel);

  // Get correct answers count
  const correctCount = await ExerciseModel.countCorrectAnswersByLevel(
    userId,
    currentLevel
  );

  // Calculate score percentage
  const scorePercentage =
    totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  // Check if passed (80% or higher)
  const PASSING_SCORE = 80;
  const passed = scorePercentage >= PASSING_SCORE;

  let newLevel = currentLevel;

  if (passed) {
    // Level up!
    newLevel = currentLevel + 1;
    await LevelModel.updateLevel(userId, newLevel);
  }

  return {
    passed,
    score_percentage: Math.round(scorePercentage),
    correct_answers: correctCount,
    total_questions: totalQuestions,
    current_level: currentLevel,
    new_level: newLevel,
    leveled_up: passed,
  };
};

export { getLevel, completeLevel };
