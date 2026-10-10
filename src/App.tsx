/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Cloud, FileCode, History, Sparkles, BookOpen, UserCheck, LogOut } from 'lucide-react';
import { GradeLevel, MathQuestion, QuizResult, StudentProfile, TeacherProfile } from './types';
import { generateQuestionList } from './utils/mathGenerator';
import { getSavedGasUrl, sendRecordToGas } from './utils/gasService';
import { LoginScreen } from './components/LoginScreen';
import { MathPracticeScreen } from './components/MathPracticeScreen';
import { ResultScreen } from './components/ResultScreen';
import { TeacherDashboard } from './components/TeacherDashboard';
import { GasSetupModal } from './components/GasSetupModal';
import { SingleHtmlExportModal } from './components/SingleHtmlExportModal';
import { RecordsHistoryModal } from './components/RecordsHistoryModal';
import { sounds } from './utils/sound';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'loading' | 'practice' | 'result' | 'teacher'>('login');
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<TeacherProfile | null>(null);
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [gasUrl, setGasUrl] = useState(getSavedGasUrl());

  // Modals
  const [isGasModalOpen, setIsGasModalOpen] = useState(false);
  const [isSingleHtmlModalOpen, setIsSingleHtmlModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Student Login & Start
  const handleStartPractice = async (profile: StudentProfile) => {
    setCurrentStudent(profile);
    setCurrentScreen('loading');

    // 發送學生登入紀錄至 Google Apps Script
    const timestamp = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    sendRecordToGas({
      studentId: profile.studentId,
      studentName: profile.studentName,
      action: '登入',
      timestamp,
      score: '',
      note: `年級設定：${profile.gradeLevel}`,
    });

    // 準備 10 題數學題
    const generated = generateQuestionList(profile.gradeLevel, 10);
    setQuestions(generated);

    // 顯示「載入題目中...」短暫過場
    setTimeout(() => {
      setCurrentScreen('practice');
    }, 1200);
  };

  // Teacher Login
  const handleTeacherLogin = (profile: TeacherProfile) => {
    setCurrentTeacher(profile);
    setCurrentScreen('teacher');
  };

  // Teacher Logout
  const handleTeacherLogout = () => {
    setCurrentTeacher(null);
    setCurrentScreen('login');
  };

  // Student finish 10 questions
  const handleFinishQuiz = (finishedQuestions: MathQuestion[], elapsedSeconds: number) => {
    if (!currentStudent) return;

    const correctCount = finishedQuestions.filter((q) => q.isCorrect).length;
    const finalScore = Math.round((correctCount / finishedQuestions.length) * 100);

    const result: QuizResult = {
      studentId: currentStudent.studentId,
      studentName: currentStudent.studentName,
      totalQuestions: finishedQuestions.length,
      correctCount,
      score: finalScore,
      timeSpentSeconds: elapsedSeconds,
      completedAt: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
      questions: finishedQuestions,
      gradeLevel: currentStudent.gradeLevel,
    };

    setQuizResult(result);
    setCurrentScreen('result');
  };

  // Restart with same student
  const handleRestart = () => {
    if (!currentStudent) return;
    const generated = generateQuestionList(currentStudent.gradeLevel, 10);
    setQuestions(generated);
    setCurrentScreen('practice');
  };

  // Back to login screen
  const handleChangeStudent = () => {
    setCurrentScreen('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-amber-50/30 to-amber-100/40 text-slate-800 flex flex-col font-sans">
      {/* Top Bar Contract: 3 zones */}
      <header className="border-b border-amber-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🎒</span>
            <span className="text-lg font-black tracking-tight text-amber-950">
              小學數學大冒險
            </span>
            {currentScreen === 'teacher' && (
              <span className="ml-2 text-xs font-black bg-amber-900 text-amber-100 px-2 py-0.5 rounded-md hidden sm:inline">
                教師管理模式
              </span>
            )}
          </div>

          {/* Zone 2: Clean text links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
            <button
              onClick={() => { sounds.playClick(); setIsGasModalOpen(true); }}
              className="hover:text-amber-800 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5 text-amber-600" />
              <span>Google Sheet API 設定</span>
            </button>
            <button
              onClick={() => { sounds.playClick(); setIsSingleHtmlModalOpen(true); }}
              className="hover:text-amber-800 transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-600" />
              <span>單一 HTML 原始碼匯出</span>
            </button>
            <button
              onClick={() => { sounds.playClick(); setIsHistoryModalOpen(true); }}
              className="hover:text-amber-800 transition flex items-center gap-1.5 cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-amber-600" />
              <span>發送紀錄日誌</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action buttons */}
          <div className="flex items-center gap-2">
            {currentScreen === 'teacher' ? (
              <button
                onClick={handleTeacherLogout}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>返回學生登入</span>
              </button>
            ) : (
              <button
                onClick={() => { sounds.playClick(); setIsGasModalOpen(true); }}
                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">試算表設定</span>
                <span className="sm:hidden">設定</span>
              </button>
            )}

            <button
              onClick={() => { sounds.playClick(); setIsHistoryModalOpen(true); }}
              className="p-1.5 md:hidden text-slate-600 hover:text-amber-900 rounded-xl hover:bg-amber-100"
              title="歷史紀錄"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        {/* Screen 1: Login (Supports Student & Teacher Tabs) */}
        {currentScreen === 'login' && (
          <LoginScreen
            onStartPractice={handleStartPractice}
            onTeacherLogin={handleTeacherLogin}
            isLoading={false}
            onOpenSettings={() => setIsGasModalOpen(true)}
            gasUrl={gasUrl}
          />
        )}

        {/* Screen 2: Loading State */}
        {currentScreen === 'loading' && (
          <div className="w-full max-w-md mx-auto text-center p-8 bg-white rounded-3xl shadow-xl border-4 border-amber-200 space-y-4 animate-pulse">
            <div className="w-14 h-14 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto" />
            <h2 className="text-xl font-black text-amber-950">載入題目中...</h2>
            <p className="text-xs text-slate-500 font-medium">
              正在登入學號，並建立 Google Sheet 練習紀錄中，請稍候片刻！
            </p>
          </div>
        )}

        {/* Screen 3: Practice */}
        {currentScreen === 'practice' && currentStudent && (
          <MathPracticeScreen
            student={currentStudent}
            questions={questions}
            onFinishQuiz={handleFinishQuiz}
          />
        )}

        {/* Screen 4: Result */}
        {currentScreen === 'result' && quizResult && (
          <ResultScreen
            result={quizResult}
            onRestart={handleRestart}
            onChangeStudent={handleChangeStudent}
          />
        )}

        {/* Screen 5: Teacher Dashboard */}
        {currentScreen === 'teacher' && currentTeacher && (
          <TeacherDashboard
            teacher={currentTeacher}
            onLogout={handleTeacherLogout}
            onOpenGasSettings={() => setIsGasModalOpen(true)}
            gasUrl={gasUrl}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-amber-100 bg-white/40">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            小學數學大冒險 · 學生練習與教師管理雙系統 · Google Sheet 自動串接
          </div>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <button onClick={() => { sounds.playClick(); setIsGasModalOpen(true); }} className="hover:underline">GAS 部署指南</button>
            <span>·</span>
            <button onClick={() => { sounds.playClick(); setIsSingleHtmlModalOpen(true); }} className="hover:underline">下載單檔 HTML</button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <GasSetupModal
        isOpen={isGasModalOpen}
        onClose={() => setIsGasModalOpen(false)}
        onUrlUpdated={(newUrl) => setGasUrl(newUrl)}
      />

      <SingleHtmlExportModal
        isOpen={isSingleHtmlModalOpen}
        onClose={() => setIsSingleHtmlModalOpen(false)}
      />

      <RecordsHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </div>
  );
}
