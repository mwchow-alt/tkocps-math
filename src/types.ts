export type GradeLevel = 'grade1' | 'grade2' | 'grade3' | 'grade4' | 'custom';

export type MathOperator = '+' | '-' | '×' | '÷';

export interface StudentProfile {
  studentId: string;
  studentName: string;
  avatar: string;
  gradeLevel: GradeLevel;
}

export interface MathQuestion {
  id: number;
  prompt: string;
  num1: number;
  num2: number;
  operator: MathOperator;
  correctAnswer: number;
  userAnswer?: number;
  isCorrect?: boolean;
  hint: string;
  explanation: string;
}

export interface QuizResult {
  studentId: string;
  studentName: string;
  totalQuestions: number;
  correctCount: number;
  score: number; // 0 - 100
  timeSpentSeconds: number;
  completedAt: string;
  questions: MathQuestion[];
  gradeLevel: GradeLevel;
}

export interface GasPayload {
  studentId: string;
  studentName: string;
  action: '登入' | '完成練習' | '測試連線';
  timestamp: string;
  score?: number | string;
  note?: string;
}

export interface GasApiResponse {
  status: 'success' | 'error';
  message: string;
  received?: Record<string, unknown>;
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  studentId: string;
  studentName: string;
  action: string;
  score?: number | string;
  syncStatus: 'synced' | 'pending' | 'simulated' | 'failed';
  apiUrlUsed?: string;
  errorMessage?: string;
}
