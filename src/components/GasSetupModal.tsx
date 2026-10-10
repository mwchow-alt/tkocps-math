import React, { useState } from 'react';
import { Check, Copy, ExternalLink, RefreshCw, Server, ShieldCheck, X } from 'lucide-react';
import { DEFAULT_GAS_CODE, getSavedGasUrl, saveGasUrl, sendRecordToGas } from '../utils/gasService';
import { sounds } from '../utils/sound';

interface GasSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUrlUpdated?: (newUrl: string) => void;
}

export const GasSetupModal: React.FC<GasSetupModalProps> = ({ isOpen, onClose, onUrlUpdated }) => {
  const [gasUrl, setGasUrl] = useState(getSavedGasUrl());
  const [copiedScript, setCopiedScript] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    sounds.playClick();
    try {
      await navigator.clipboard.writeText(DEFAULT_GAS_CODE);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2500);
    } catch {
      // Fallback
      setCopiedScript(true);
    }
  };

  const handleSave = () => {
    sounds.playClick();
    saveGasUrl(gasUrl);
    if (onUrlUpdated) onUrlUpdated(gasUrl);
    onClose();
  };

  const handleTestConnection = async () => {
    sounds.playClick();
    if (!gasUrl.trim()) {
      setTestResult({
        status: 'error',
        message: '請先在下方輸入框貼上 Google Apps Script Web App 網址喔！',
      });
      return;
    }

    setTesting(true);
    setTestResult({ status: 'idle', message: '' });

    // Temporarily save to test
    saveGasUrl(gasUrl);

    const res = await sendRecordToGas({
      studentId: 'TEST_001',
      studentName: '連線測試員',
      action: '測試連線',
      timestamp: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
      score: 100,
      note: '這是由設定面板發出的測試訊息',
    });

    setTesting(false);
    if (res.success && !res.isSimulated) {
      sounds.playCorrect();
      setTestResult({
        status: 'success',
        message: '🎉 連線成功！已在您的 Google Sheet「紀錄」工作表寫入一筆測試資料！',
      });
    } else if (res.isSimulated) {
      setTestResult({
        status: 'error',
        message: '網址格式不符合 Google Script 規範 (需以 https://script.google.com/macros/s/ 開頭)',
      });
    } else {
      sounds.playWrong();
      setTestResult({
        status: 'error',
        message: res.message,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border-4 border-amber-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-4 flex items-center justify-between text-amber-950">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-white/30 rounded-xl">
              <Server className="w-6 h-6 text-amber-950" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">第一階段：Google Sheet 後端 (API) 設定</h2>
              <p className="text-xs text-amber-900/80 font-medium">把 Google 試算表變成免費又好用的學生練習資料庫</p>
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

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          {/* Quick status */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <p className="font-bold mb-1">💡 即使還沒設定 API 網址也能正常練習！</p>
              若暫時不想設定 Google Sheet，本軟體會自動將練習紀錄妥善保存在瀏覽器本地。一旦設定好網址，後續所有紀錄將直接自動寫入試算表！
            </div>
          </div>

          {/* Step 1 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                複製 Google Apps Script 程式碼
              </h3>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-lg transition shadow-sm"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedScript ? '已複製到剪貼簿！' : '一鍵複製程式碼'}
              </button>
            </div>
            <div className="relative">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-40 border border-slate-700">
                {DEFAULT_GAS_CODE}
              </pre>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">2</span>
              部署教學步驟 (約需 2 分鐘)
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-xs leading-relaxed text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <li>
                前往 <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold inline-flex items-center gap-0.5 hover:underline">Google 雲端試算表 <ExternalLink className="w-3 h-3" /></a> 新增一張表，將第一個工作表更名為「<strong className="text-amber-800">紀錄</strong>」。
              </li>
              <li>點選頂端選單【擴充功能】➔【Apps Script】開啟編輯器。</li>
              <li>清空編輯器預設程式碼，將上面第 1 步複製的程式碼貼上，並按儲存 (Ctrl+S)。</li>
              <li>
                點選右上角藍色【部署】按鈕 ➔ 選擇【新部署】➔ 齒輪選擇【網頁應用程式 (Web app)】。
              </li>
              <li className="font-medium text-amber-900 bg-amber-100/60 p-2 rounded-lg">
                ⚠️ <strong className="font-bold">關鍵設定：</strong>「執行身分」選『我』，「誰可以存取」必須選擇『<strong>任何人 (Anyone)</strong>』，這樣前端才能無需 Google 授權直接寫入。
              </li>
              <li>點選【部署】並完成權限核准，複製產生的「網頁應用程式網址 (Web App URL)」。</li>
            </ol>
          </div>

          {/* Step 3 */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">3</span>
              貼上您的 Web App API 網址
            </h3>
            <div className="space-y-2">
              <input
                type="url"
                value={gasUrl}
                onChange={(e) => setGasUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="w-full px-4 py-3 text-sm rounded-xl border-2 border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none font-mono"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  {testing ? '正在測試連線...' : '測試連線並寫入測試資料'}
                </button>
              </div>

              {testResult.message && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    testResult.status === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {testResult.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold transition"
          >
            稍後再設定
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition active:scale-95"
          >
            儲存設定
          </button>
        </div>
      </div>
    </div>
  );
};
