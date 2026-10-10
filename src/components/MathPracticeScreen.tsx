import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, ArrowRight, Lightbulb, Delete, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { MathQuestion, StudentProfile } from '../types';
import { sounds } from '../utils/sound';

interface MathPracticeScreenProps {
  student: StudentProfile;
  questions: MathQuestion[];
  onFinishQuiz: (finalQuestions: MathQuestion[], totalSeconds: number) => void;
}

export const MathPracticeScreen: React.FC<MathPracticeScreenProps> = ({
  student,
  questions,
  onFinishQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswerStr, setUserAnswerStr] = useState('');
  const [answeredQuestions, setAnsweredQuestions] = useState<MathQuestion[]>(questions);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentIsCorrect, setCurrentIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentQ = answeredQuestions[currentIndex];
  const totalCount = answeredQuestions.length;

  useEffect(() => {
    // Focus input on question change
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setUserAnswerStr('');
    setIsSubmitted(false);
    setCurrentIsCorrect(null);
    setShowHint(false);
  }, [currentIndex]);

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const handleKeypadPress = (val: string) => {
    if (isSubmitted) return;
    sounds.playClick();
    if (val === 'backspace') {
      setUserAnswerStr((prev) => prev.slice(0, -1));
    } else if (val === 'clear') {
      setUserAnswerStr('');
    } else {
      if (userAnswerStr.length < 5) {
        setUserAnswerStr((prev) => prev + val);
      }
    }
  };

  const handleSubmitAnswer = () => {
    if (isSubmitted || userAnswerStr.trim() === '') return;

    const parsed = parseInt(userAnswerStr.trim(), 10);
    if (isNaN(parsed)) return;

    const isCorrect = parsed === currentQ.correctAnswer;
    setIsSubmitted(true);
    setCurrentIsCorrect(isCorrect);

    if (isCorrect) {
      sounds.playCorrect();
    } else {
      sounds.playWrong();
    }

    // Update record
    setAnsweredQuestions((prev) => {
      const updated = [...prev];
      updated[currentIndex] = {
        ...updated[currentIndex],
        userAnswer: parsed,
        isCorrect,
      };
      return updated;
    });
  };

  const handleNextOrFinish = () => {
    sounds.playClick();
    if (currentIndex + 1 < totalCount) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onFinishQuiz(answeredQuestions, elapsedSeconds);
    }
  };

  const correctSoFar = answeredQuestions.slice(0, currentIndex).filter((q) => q.isCorrect).length + (isSubmitted && currentIsCorrect ? 1 : 0);

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shadow-inner">
            {student.avatar === 'owl' ? '🦉' : student.avatar === 'fox' ? '🦊' : student.avatar === 'lion' ? '🦁' : '🎒'}
          </span>
          <div>
            <div className="text-xs font-black text-slate-800 flex items-center gap-2">
              <span>{student.studentName} 同學</span>
              <span className="text-[11px] font-mono text-slate-400">({student.studentId})</span>
            </div>
            <div className="text-[11px] text-amber-700 font-bold">
              目前得分：{correctSoFar * 10} 分
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-black text-slate-700">第 {currentIndex + 1} / {totalCount} 題</span>
            <div className="text-[11px] font-mono text-slate-400">
              時間：{Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
            title={soundEnabled ? '關閉音效' : '開啟音效'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl shadow-lg border-4 border-amber-200 p-6 md:p-8 space-y-6">
        {/* Math Equation Box */}
        <div className="bg-amber-50/80 border-2 border-dashed border-amber-300 rounded-2xl p-6 text-center relative overflow-hidden">
          <div className="absolute top-2 right-3 text-amber-300 select-none">
            <Sparkles className="w-6 h-6 opacity-40" />
          </div>

          <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
            請算算看答案是多少：
          </div>

          <div className="text-4xl md:text-5xl font-black text-amber-950 font-mono tracking-wider tabular-nums">
            {currentQ.num1} {currentQ.operator} {currentQ.num2} = ?
          </div>

          {/* Quick vertical calculation preview hint toggle */}
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 px-3 py-1 bg-amber-100/60 rounded-full transition"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              {showHint ? '收起解題提示' : '看小提示'}
            </button>
          </div>

          {showHint && (
            <div className="mt-3 p-3 bg-amber-100/80 rounded-xl text-xs text-amber-950 text-left border border-amber-300/60 animate-fade-in">
              <span className="font-bold">💡 提示指引：</span>
              {currentQ.hint}
            </div>
          )}
        </div>

        {/* Answer Display & Input */}
        <div className="space-y-3">
          <div className="relative">
            <input
              ref={inputRef}
              type="number"
              value={userAnswerStr}
              onChange={(e) => {
                if (!isSubmitted) setUserAnswerStr(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (!isSubmitted) handleSubmitAnswer();
                  else handleNextOrFinish();
                }
              }}
              disabled={isSubmitted}
              placeholder="在此輸入答案"
              className={`w-full py-4 text-center text-3xl font-black rounded-2xl border-3 outline-none transition font-mono ${
                isSubmitted
                  ? currentIsCorrect
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800'
                    : 'border-rose-400 bg-rose-50/50 text-rose-800'
                  : 'border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 text-slate-800'
              }`}
            />
          </div>

          {/* Instant Feedback Banner */}
          {isSubmitted && (
            <div
              className={`p-4 rounded-2xl border-2 flex items-start gap-3 animate-fade-in ${
                currentIsCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {currentIsCorrect ? (
                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-black text-sm">
                  {currentIsCorrect ? '🎉 答對了！太厲害了！' : `💡 再加把勁！正確答案是 ${currentQ.correctAnswer}`}
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  {currentQ.explanation}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Virtual Kid-friendly Keypad (Supports Touch and Mouse) */}
        {!isSubmitted && (
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeypadPress(digit)}
                className="py-3 bg-slate-100 hover:bg-amber-100 active:scale-95 text-slate-800 font-extrabold text-xl rounded-xl transition shadow-xs"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleKeypadPress('clear')}
              className="py-3 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              清空
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="py-3 bg-slate-100 hover:bg-amber-100 active:scale-95 text-slate-800 font-extrabold text-xl rounded-xl transition shadow-xs"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('backspace')}
              className="py-3 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-700 font-bold rounded-xl transition flex items-center justify-center"
              title="倒退刪除"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Action Button: Submit or Next */}
        <div className="pt-2">
          {!isSubmitted ? (
            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={userAnswerStr.trim() === ''}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] disabled:opacity-50 text-white rounded-2xl font-black text-base shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>送出答案</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextOrFinish}
              className={`w-full py-4 text-white rounded-2xl font-black text-base shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                currentIndex + 1 < totalCount
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
              }`}
            >
              <span>{currentIndex + 1 < totalCount ? '下一題 ➡️' : '結算成績 🏆'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
