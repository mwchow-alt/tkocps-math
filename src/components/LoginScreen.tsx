import React, { useState } from 'react';
import { Sparkles, ArrowRight, User, Hash, GraduationCap, CheckCircle2, CloudOff, Settings } from 'lucide-react';
import { GradeLevel, StudentProfile } from '../types';
import { sounds } from '../utils/sound';

interface LoginScreenProps {
  onStartPractice: (profile: StudentProfile) => void;
  isLoading: boolean;
  onOpenSettings: () => void;
  gasUrl: string;
}

const AVATARS = [
  { id: 'owl', emoji: '🦉', label: '聰明貓頭鷹' },
  { id: 'fox', emoji: '🦊', label: '機智小狐狸' },
  { id: 'rabbit', emoji: '🐰', label: '活潑跳跳兔' },
  { id: 'lion', emoji: '🦁', label: '勇敢小獅王' },
  { id: 'panda', emoji: '🐼', label: '開朗小貓熊' },
  { id: 'rocket', emoji: '🚀', label: '算術太空人' },
];

const GRADE_OPTIONS: { id: GradeLevel; title: string; desc: string }[] = [
  { id: 'grade2', title: '小二：兩位數加減法', desc: '核心範圍：25+38、84-29' },
  { id: 'grade1', title: '小一：20 以內加減', desc: '基礎扎根：8+7、15-6' },
  { id: 'grade3', title: '小三：九九乘法與進階', desc: '九九乘法表、百位加減' },
  { id: 'grade4', title: '小四：除法與綜合算式', desc: '四則除法整除、三位數' },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onStartPractice,
  isLoading,
  onOpenSettings,
  gasUrl,
}) => {
  const [studentId, setStudentId] = useState('S101');
  const [studentName, setStudentName] = useState('王小明');
  const [selectedAvatar, setSelectedAvatar] = useState('owl');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('grade2');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setErrorMsg('請輸入學號喔！');
      sounds.playWrong();
      return;
    }
    if (!studentName.trim()) {
      setErrorMsg('請輸入姓名喔！');
      sounds.playWrong();
      return;
    }

    sounds.playClick();
    setErrorMsg('');
    onStartPractice({
      studentId: studentId.trim(),
      studentName: studentName.trim(),
      avatar: selectedAvatar,
      gradeLevel,
    });
  };

  const hasConfiguredGas = Boolean(gasUrl && gasUrl.startsWith('https://script.google.com/macros/s/'));

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-xl border-4 border-amber-200 overflow-hidden relative">
        {/* Banner with Mascot */}
        <div className="bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-200 p-6 md:p-8 text-amber-950 relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-amber-500/10 rounded-full blur-lg pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-1.5 max-w-[340px]">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-900/10 backdrop-blur-sm rounded-full text-xs font-bold text-amber-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                第二階段 · 學生登入
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-950">
                小學數學大冒險
              </h1>
              <p className="text-xs md:text-sm text-amber-900 font-medium leading-relaxed">
                每次 10 題隨機數學挑戰，登入與練習成果自動同步至 Google Sheet！
              </p>
            </div>

            {/* Mascot Avatar Preview */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white shadow-lg border-2 border-amber-200 flex items-center justify-center text-4xl md:text-5xl shrink-0 transform rotate-2 hover:rotate-0 transition duration-200">
              {AVATARS.find((a) => a.id === selectedAvatar)?.emoji || '🦉'}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2 animate-shake">
              <span>⚠️</span>
              {errorMsg}
            </div>
          )}

          {/* Avatar Picker */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-2">
              選擇我的冒險代表角色：
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedAvatar(av.id);
                  }}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center text-2xl transition border-2 ${
                    selectedAvatar === av.id
                      ? 'bg-amber-100 border-amber-500 scale-105 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 opacity-80'
                  }`}
                  title={av.label}
                >
                  <span>{av.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Student ID & Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="studentId" className="block text-xs font-extrabold text-slate-700 mb-1.5">
                學生學號 (Student ID) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  id="studentId"
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="例如：S101 或 202601"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm font-semibold transition"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="studentName" className="block text-xs font-extrabold text-slate-700 mb-1.5">
                學生姓名 (Name) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="studentName"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="例如：王小明、林小華"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm font-semibold transition"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          </div>

          {/* Grade Level Selection */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-amber-600" />
              選擇練習年級 / 題目類型：
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {GRADE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setGradeLevel(opt.id);
                  }}
                  className={`p-3 text-left rounded-2xl border-2 transition ${
                    gradeLevel === opt.id
                      ? 'border-amber-500 bg-amber-50/70 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-black text-slate-800">{opt.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Cloud Sync Status Note */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {hasConfiguredGas ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-700 font-medium">Google Sheet 雲端連線：<span className="text-emerald-700 font-bold">已就緒</span></span>
                </>
              ) : (
                <>
                  <CloudOff className="w-4 h-4 text-amber-600" />
                  <span className="text-slate-700 font-medium">Google Sheet 網址：<span className="text-amber-700 font-bold">尚未填入 (本地暫存模式)</span></span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 hover:underline"
            >
              <Settings className="w-3.5 h-3.5" />
              設定 API
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.99] text-white rounded-2xl font-black text-base shadow-lg shadow-amber-500/25 transition duration-150 flex items-center justify-center gap-2 group disabled:opacity-60 cursor-pointer"
          >
            <span>開始練習</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};
