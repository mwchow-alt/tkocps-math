import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, CloudOff, RefreshCw, Trash2, X, AlertCircle } from 'lucide-react';
import { HistoryRecord } from '../types';
import { clearHistoryRecords, getHistoryRecords, sendRecordToGas } from '../utils/gasService';
import { sounds } from '../utils/sound';

interface RecordsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecordsHistoryModal: React.FC<RecordsHistoryModalProps> = ({ isOpen, onClose }) => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRecords(getHistoryRecords());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClear = () => {
    sounds.playClick();
    if (confirm('確定要清空本地歷史發送紀錄嗎？（這不會影響 Google 試算表上的資料）')) {
      clearHistoryRecords();
      setRecords([]);
    }
  };

  const handleRetry = async (record: HistoryRecord) => {
    sounds.playClick();
    setRetryingId(record.id);
    await sendRecordToGas({
      studentId: record.studentId,
      studentName: record.studentName,
      action: record.action as '登入' | '完成練習' | '測試連線',
      timestamp: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
      score: record.score,
      note: '手動重試同步',
    });
    setRetryingId(null);
    setRecords(getHistoryRecords());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border-4 border-amber-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-4 flex items-center justify-between text-amber-950">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-white/30 rounded-xl">
              <Clock className="w-6 h-6 text-amber-950" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">練習與連線紀錄歷史</h2>
              <p className="text-xs text-amber-900/80 font-medium">查看所有登入與答題成績同步狀態</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/10 transition-colors text-amber-950"
            title="關閉"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-slate-700 text-sm">
          {records.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Clock className="w-12 h-12 mx-auto stroke-[1.5] mb-2 opacity-50" />
              <p className="text-sm font-medium">目前尚無練習或連線紀錄</p>
              <p className="text-xs text-slate-400 mt-1">完成練習或登入後，將在此即時顯示同步狀態</p>
            </div>
          ) : (
            records.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between hover:bg-white hover:border-amber-300 transition shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{rec.studentName}</span>
                    <span className="text-xs text-slate-500 font-mono">({rec.studentId})</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                      {rec.action}
                    </span>
                    {rec.score !== undefined && rec.score !== '' && (
                      <span className="text-xs font-extrabold text-amber-700">
                        {rec.score} 分
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <span>{rec.timestamp}</span>
                    <span>·</span>
                    <span className="truncate max-w-[260px] text-[11px] text-slate-500">{rec.apiUrlUsed}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {rec.syncStatus === 'synced' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      已寫入試算表
                    </span>
                  )}
                  {rec.syncStatus === 'simulated' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                      <CloudOff className="w-3.5 h-3.5" />
                      本地暫存
                    </span>
                  )}
                  {rec.syncStatus === 'failed' && (
                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-1 rounded-xl">
                        <AlertCircle className="w-3.5 h-3.5" />
                        傳送異常
                      </span>
                      <button
                        onClick={() => handleRetry(rec)}
                        disabled={retryingId === rec.id}
                        className="p-1 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-200"
                        title="重新發送"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${retryingId === rec.id ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleClear}
            disabled={records.length === 0}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            清空本機紀錄
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
