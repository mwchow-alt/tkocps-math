import React, { useState } from 'react';
import { Sparkles, ArrowRight, User, Hash, GraduationCap, CheckCircle2, CloudOff, Settings, ShieldCheck, Lock, KeyRound } from 'lucide-react';
import { GradeLevel, StudentProfile, TeacherProfile, UserRole } from '../types';
import { sounds } from '../utils/sound';

interface LoginScreenProps {
  onStartPractice: (profile: StudentProfile) => void;
  onTeacherLogin: (profile: TeacherProfile) => void;
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
  onTeacherLogin,
  isLoading,
  onOpenSettings,
  gasUrl,
}) => {
  const [activeRole, setActiveRole] = useState<UserRole>('student');

  // Student state
  const [studentId, setStudentId] = useState('S101');
  const [studentName, setStudentName] = useState('王小明');
  const [selectedAvatar, setSelectedAvatar] = useState('owl');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('grade2');

  // Teacher state
  const [teacherId, setTeacherId] = useState('T101');
  const [teacherName, setTeacherName] = useState('李老師');
  const [teacherPassword, setTeacherPassword] = useState('teacher123');

  const [errorMsg, setErrorMsg] = useState('');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setErrorMsg('請輸入學生學號喔！');
      sounds.playWrong();
      return;
    }
    if (!studentName.trim()) {
      setErrorMsg('請輸入學生姓名喔！');
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
      role: 'student',
    });
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId.trim()) {
      setErrorMsg('請輸入教師代號！');
      sounds.playWrong();
      return;
    }
    if (!teacherName.trim()) {
      setErrorMsg('請輸入教師姓名！');
      sounds.playWrong();
      return;
    }

    sounds.playCorrect();
    setErrorMsg('');
    onTeacherLogin({
      teacherId: teacherId.trim(),
      teacherName: teacherName.trim(),
      role: 'teacher',
      lastLogin: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
    });
  };

  const hasConfiguredGas = Boolean(gasUrl && gasUrl.startsWith('https://script.google.com/macros/s/'));

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Role Switcher Tabs */}
      <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border-2 border-amber-200 flex items-center shadow-sm">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveRole('student');
            setErrorMsg('');
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs md:text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
            activeRole === 'student'
              ? 'bg-amber-500 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50/50'
          }`}
        >
          <span>🎒 我是學生登入</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveRole('teacher');
            setErrorMsg('');
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs md:text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
            activeRole === 'teacher'
              ? 'bg-amber-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50/50'
          }`}
        >
          <span>👩‍🏫 我是老師登入</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-xl border-4 border-amber-200 overflow-hidden relative">
        {/* Banner */}
        <div className={`p-6 md:p-8 relative overflow-hidden transition-colors ${
          activeRole === 'student'
            ? 'bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-200 text-amber-950'
            : 'bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 text-amber-50'
        }`}>
          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-1.5 max-w-[340px]">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                activeRole === 'student'
                  ? 'bg-amber-900/10 text-amber-900'
                  : 'bg-white/10 text-amber-200'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
                {activeRole === 'student' ? '小學數學練習 · 學生入口' : '教師管理中心 · 成績儀表板'}
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                {activeRole === 'student' ? '小學數學大冒險' : '班級管理後台'}
              </h1>
              <p className={`text-xs md:text-sm font-medium leading-relaxed ${
                activeRole === 'student' ? 'text-amber-900' : 'text-amber-200/80'
              }`}>
                {activeRole === 'student' 
                  ? '隨機 10 題趣味算術，成果自動同步至 Google Sheet！'
                  : '查看全班練習紀錄、統計分析平均分與試算表串接。'}
              </p>
            </div>

            {/* Avatar Preview */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white shadow-lg border-2 border-amber-200 flex items-center justify-center text-4xl md:text-5xl shrink-0 transform rotate-2">
              {activeRole === 'student' 
                ? (AVATARS.find((a) => a.id === selectedAvatar)?.emoji || '🦉')
                : '👩‍🏫'}
            </div>
          </div>
        </div>

        {/* Form Body */}
        {activeRole === 'student' ? (
          /* ================= STUDENT FORM ================= */
          <form onSubmit={handleStudentSubmit} className="p-6 md:p-8 space-y-6 animate-fade-in">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
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
                    <span className="text-slate-700 font-medium">Google Sheet 網址：<span className="text-amber-700 font-bold">尚未填入 (本地暫存)</span></span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={onOpenSettings}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                設定 API
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.99] text-white rounded-2xl font-black text-base shadow-lg shadow-amber-500/25 transition duration-150 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>開始練習</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        ) : (
          /* ================= TEACHER FORM ================= */
          <form onSubmit={handleTeacherSubmit} className="p-6 md:p-8 space-y-5 animate-fade-in">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
                <span>⚠️</span>
                {errorMsg}
              </div>
            )}

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">教師管理權限：</span>
                登入後可即時監控全班練習紀錄、匯出成績報表，並設定 Google Sheet 試算表串接網址。
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="teacherId" className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  教師編號 / 帳號 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="teacherId"
                    type="text"
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    placeholder="例如：T101 或 admin"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-none text-sm font-semibold transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="teacherName" className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  教師姓名 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="teacherName"
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="例如：李老師、林主任"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-none text-sm font-semibold transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="teacherPassword" className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  教師密碼
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="teacherPassword"
                    type="password"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="預設：teacher123 (免密碼亦可)"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-none text-sm font-semibold transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 示範環境提供快捷登入，點擊下方按鈕即可直接進入後台
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-amber-800 to-amber-950 hover:from-amber-900 hover:to-black active:scale-[0.99] text-white rounded-2xl font-black text-base shadow-lg shadow-amber-950/20 transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>進入教師管理後台</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
