//just for response to frontend

export interface SubmitAnswerRequest {
  user_id: number;
  user_answer: string;
}

export interface SubmitAnswerResponse {
  id: number;
  is_correct: boolean;
  feedback: string;
  confidence: number;
  suggestions: string;
}

export interface ProgressResponse {
  level: number;
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  progress_percentage: number;
  score_percentage: number;
  questions: QuestionProgress[];
}

export interface QuestionProgress {
  id: number;
  question: string;
  answered: boolean;
  is_correct: boolean;
}

export interface CompleteLevelRequest {
  user_id: number;
}

export interface CompleteLevelResponse {
  passed: boolean;
  score_percentage: number;
  correct_answers: number;
  total_questions: number;
  current_level: number;
  new_level: number;
  leveled_up: boolean;
}
