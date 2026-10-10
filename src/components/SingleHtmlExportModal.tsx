import React, { useState } from 'react';
import { Check, Copy, Download, FileCode, X } from 'lucide-react';
import { getStandaloneHtmlCode } from '../utils/generateSingleHtml';
import { getSavedGasUrl } from '../utils/gasService';
import { sounds } from '../utils/sound';

interface SingleHtmlExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SingleHtmlExportModal: React.FC<SingleHtmlExportModalProps> = ({ isOpen, onClose }) => {
  const currentGasUrl = getSavedGasUrl();
  const htmlCode = getStandaloneHtmlCode(currentGasUrl);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    sounds.playClick();
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
    }
  };

  const handleDownload = () => {
    sounds.playClick();
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'elementary_math_quiz.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border-4 border-amber-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-4 flex items-center justify-between text-amber-950">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-white/30 rounded-xl">
              <FileCode className="w-6 h-6 text-amber-950" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">單一獨立 HTML 測試檔案</h2>
              <p className="text-xs text-amber-900/80 font-medium">包含 HTML + &lt;style&gt; + &lt;script&gt;，可離線下載或獨立在任何瀏覽器直接執行！</p>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-700 text-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              這份程式碼已自動代入您設定的 Google Script 網址，已整合全部三個階段的邏輯：
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 rounded-lg transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? '已複製！' : '複製原始碼'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-lg transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                下載 index.html 檔案
              </button>
            </div>
          </div>

          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-[55vh] border border-slate-700">
            {htmlCode}
          </pre>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-end">
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
