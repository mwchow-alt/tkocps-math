import React, { useEffect, useState } from 'react';
import { Award, RotateCcw, UserPlus, CheckCircle2, Clock, Sparkles, ChevronDown, ChevronUp, AlertCircle, CloudCheck } from 'lucide-react';
import { QuizResult } from '../types';
import { sendRecordToGas } from '../utils/gasService';
import { sounds } from '../utils/sound';

interface ResultScreenProps {
  result: QuizResult;
  onRestart: () => void;
  onChangeStudent: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  onRestart,
  onChangeStudent,
}) => {
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'simulated' | 'error'>('syncing');
  const [syncMessage, setSyncMessage] = useState('正在將成績上傳至 Google Sheet...');
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    // Fanfare sound on mount
    sounds.playFanfare();

    // Send result to Google Apps Script API
    const syncData = async () => {
      setSyncStatus('syncing');
      const res = await sendRecordToGas({
        studentId: result.studentId,
        studentName: result.studentName,
        action: '完成練習',
        timestamp: result.completedAt,
        score: result.score,
        note: `耗時 ${result.timeSpentSeconds} 秒，答對 ${result.correctCount}/${result.totalQuestions} 題`,
      });

      if (res.success && !res.isSimulated) {
        setSyncStatus('synced');
        setSyncMessage('成績已成功記錄至 Google Sheet 試算表！');
      } else if (res.isSimulated) {
        setSyncStatus('simulated');
        setSyncMessage('尚未設定 Google Sheet 網址，已先儲存於本機歷史紀錄！');
      } else {
        setSyncStatus('error');
        setSyncMessage(res.message);
      }
    };

    syncData();
  }, [result]);

  // Badge determination
  const getBadgeInfo = () => {
    if (result.score >= 90) {
      return {
        title: '🌟 算術金牌大師',
        desc: '太不可思議了！你的數學計算能力無懈可擊！',
        color: 'from-amber-400 to-yellow-500',
        textColor: 'text-amber-950',
      };
    }
    if (result.score >= 70) {
      return {
        title: '🥈 算術銀牌好手',
        desc: '表現非常優異！只要再細心一點點就能拿滿分囉！',
        color: 'from-slate-200 to-slate-400',
        textColor: 'text-slate-800',
      };
    }
    if (result.score >= 60) {
      return {
        title: '🥉 算術銅牌小將',
        desc: '及格過關！多加練習進退位技巧會更加進步！',
        color: 'from-amber-600 to-amber-700',
        textColor: 'text-white',
      };
    }
    return {
      title: '🎈 潛力加油勇士',
      desc: '不要灰心！失敗為成功之母，再挑戰一次吧！',
      color: 'from-rose-400 to-amber-400',
      textColor: 'text-slate-900',
    };
  };

  const badge = getBadgeInfo();

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Main Score Card */}
      <div className="bg-white rounded-3xl shadow-xl border-4 border-amber-200 overflow-hidden text-center">
        {/* Badge Header Banner */}
        <div className={`bg-gradient-to-r ${badge.color} p-6 ${badge.textColor} relative`}>
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-black/10 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            練習總成績結算
          </div>
          <h2 className="text-2xl md:text-3xl font-black">{badge.title}</h2>
          <p className="text-xs md:text-sm font-medium mt-1 opacity-90">{badge.desc}</p>
        </div>

        {/* Big Score Display */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">本次挑戰得分</span>
            <div className="flex items-baseline gap-1 my-2">
              <span className="text-6xl md:text-7xl font-black text-amber-500 font-mono tabular-nums">
                {result.score}
              </span>
              <span className="text-2xl font-bold text-amber-700">分</span>
            </div>
            <div className="text-xs font-bold text-slate-500">
              答對題數：<span className="text-slate-800 font-black">{result.correctCount}</span> / {result.totalQuestions} 題
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 gap-3 py-2 border-y border-slate-100">
            <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <div className="text-left">
                <div className="text-[11px] text-slate-400">練習耗時</div>
                <div className="text-xs font-bold text-slate-700 font-mono">
                  {Math.floor(result.timeSpentSeconds / 60)} 分 {(result.timeSpentSeconds % 60)} 秒
                </div>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <div className="text-left">
                <div className="text-[11px] text-slate-400">答題正確率</div>
                <div className="text-xs font-bold text-slate-700 font-mono">
                  {Math.round((result.correctCount / result.totalQuestions) * 100)} %
                </div>
              </div>
            </div>
          </div>

          {/* Google Sheets Sync Status Card */}
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center gap-3 text-left transition ${
              syncStatus === 'syncing'
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : syncStatus === 'synced'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : syncStatus === 'simulated'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {syncStatus === 'syncing' && (
              <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
            )}
            {syncStatus === 'synced' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {syncStatus === 'simulated' && <CloudCheck className="w-5 h-5 text-amber-600 shrink-0" />}
            {syncStatus === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            <div className="flex-1">
              <div className="font-bold">Google Sheet 雲端紀錄</div>
              <div className="text-[11px] opacity-90">{syncMessage}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                sounds.playClick();
                onRestart();
              }}
              className="py-3.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              再練習一次
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                onChangeStudent();
              }}
              className="py-3.5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              更換學生
            </button>
          </div>
        </div>
      </div>

      {/* Question Review Accordion */}
      <div className="bg-white rounded-3xl p-5 shadow-md border-2 border-slate-200">
        <button
          onClick={() => setShowReview(!showReview)}
          className="w-full flex items-center justify-between font-bold text-sm text-slate-800"
        >
          <span>查看全部 10 題答題明細與解析</span>
          {showReview ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {showReview && (
          <div className="mt-4 space-y-2.5 pt-3 border-t border-slate-100 animate-fade-in">
            {result.questions.map((q, idx) => (
              <div
                key={q.id}
                className={`p-3 rounded-xl border text-xs flex items-start gap-3 ${
                  q.isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-bold text-[10px] text-slate-700 shrink-0 shadow-xs">
                  {idx + 1}
                </span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="font-mono text-sm">{q.num1} {q.operator} {q.num2} = {q.correctAnswer}</span>
                    <span className={q.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                      {q.isCorrect ? '答對 (+10分)' : `答錯 (你的答案: ${q.userAnswer ?? '無'})`}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] leading-relaxed">
                    {q.explanation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
