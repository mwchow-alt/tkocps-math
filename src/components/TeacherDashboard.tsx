import React, { useState, useEffect } from 'react';
import { 
  Users, Award, TrendingUp, CheckCircle2, Search, Download, 
  RefreshCw, LogOut, Settings, Trash2, Cloud, Sparkles, Filter, FileSpreadsheet
} from 'lucide-react';
import { HistoryRecord, TeacherProfile } from '../types';
import { getHistoryRecords, clearHistoryRecords, addHistoryRecord } from '../utils/gasService';
import { sounds } from '../utils/sound';

interface TeacherDashboardProps {
  teacher: TeacherProfile;
  onLogout: () => void;
  onOpenGasSettings: () => void;
  gasUrl: string;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacher,
  onLogout,
  onOpenGasSettings,
  gasUrl,
}) => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<'all' | '完成練習' | '登入'>('all');

  const loadRecords = () => {
    setRecords(getHistoryRecords());
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // Compute stats
  const completedRecords = records.filter((r) => r.action === '完成練習' && typeof r.score === 'number');
  const totalSubmissions = completedRecords.length;
  const avgScore = totalSubmissions > 0
    ? Math.round(completedRecords.reduce((acc, cur) => acc + Number(cur.score || 0), 0) / totalSubmissions)
    : 0;
  const passCount = completedRecords.filter((r) => Number(r.score || 0) >= 60).length;
  const passRate = totalSubmissions > 0 ? Math.round((passCount / totalSubmissions) * 100) : 0;
  const perfectCount = completedRecords.filter((r) => Number(r.score || 0) === 100).length;

  // Filter records
  const filtered = records.filter((rec) => {
    const matchesSearch = 
      rec.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || rec.action === filterAction;
    return matchesSearch && matchesAction;
  });

  // Export CSV
  const handleExportCsv = () => {
    sounds.playClick();
    if (records.length === 0) {
      alert('目前尚無學生紀錄可匯出');
      return;
    }

    const headers = ['時間戳記', '學號', '姓名', '動作', '得分', '同步狀態', 'API網址'];
    const rows = records.map((r) => [
      `"${r.timestamp}"`,
      `"${r.studentId}"`,
      `"${r.studentName}"`,
      `"${r.action}"`,
      r.score !== undefined ? r.score : '',
      `"${r.syncStatus}"`,
      `"${r.apiUrlUsed || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `學生數學練習成績報表_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Add demo data for convenience
  const handleGenerateSampleData = () => {
    sounds.playClick();
    const demoStudents = [
      { id: 'S101', name: '王小明', score: 100 },
      { id: 'S102', name: '陳美美', score: 90 },
      { id: 'S103', name: '李大同', score: 80 },
      { id: 'S104', name: '林小華', score: 60 },
      { id: 'S105', name: '張小安', score: 100 },
      { id: 'S106', name: '周志強', score: 70 },
    ];

    demoStudents.forEach((student, idx) => {
      const now = new Date(Date.now() - idx * 15 * 60000).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
      addHistoryRecord({
        id: `demo_${Date.now()}_${idx}`,
        timestamp: now,
        studentId: student.id,
        studentName: student.name,
        action: '完成練習',
        score: student.score,
        syncStatus: 'synced',
        apiUrlUsed: gasUrl || 'Google Sheet 試算表',
      });
    });

    loadRecords();
  };

  const handleClearRecords = () => {
    sounds.playClick();
    if (confirm('確定要清空本地所有學生發送紀錄嗎？這不會刪除 Google 試算表上的資料。')) {
      clearHistoryRecords();
      setRecords([]);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Teacher Top Bar */}
      <div className="bg-white rounded-3xl p-6 shadow-md border-3 border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl shadow-inner border border-amber-200">
            👩‍🏫
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">{teacher.teacherName} 老師</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold font-mono">
                教師編號: {teacher.teacherId}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              班級數學練習管理中心 · 雲端即時連線監控
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => { sounds.playClick(); onOpenGasSettings(); }}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
          >
            <Cloud className="w-4 h-4 text-amber-600" />
            <span>試算表串接設定</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); loadRecords(); }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="重新整理數據"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>重整</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); onLogout(); }}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>登出</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border-2 border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>完成練習人次</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2 font-mono tabular-nums">
            {totalSubmissions}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">累計測驗總次數</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border-2 border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>班級平均分數</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2 font-mono tabular-nums">
            {avgScore} <span className="text-sm font-bold text-slate-400">分</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">滿分 100 分制</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border-2 border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>測驗及格率</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-blue-600 mt-2 font-mono tabular-nums">
            {passRate} <span className="text-sm font-bold text-slate-400">%</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">及格標準: 60 分以上</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border-2 border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>滿分人數</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-500 mt-2 font-mono tabular-nums">
            {perfectCount} <span className="text-sm font-bold text-slate-400">人</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">獲得金牌大師榮譽</div>
        </div>
      </div>

      {/* Main Records Table Card */}
      <div className="bg-white rounded-3xl p-6 shadow-md border-3 border-amber-200 space-y-4">
        {/* Table Top Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜尋學生學號或姓名..."
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-amber-500 outline-none font-medium"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              <button
                onClick={() => setFilterAction('all')}
                className={`px-2.5 py-1.5 rounded-lg transition ${filterAction === 'all' ? 'bg-white text-amber-900 shadow-xs' : ''}`}
              >
                全部
              </button>
              <button
                onClick={() => setFilterAction('完成練習')}
                className={`px-2.5 py-1.5 rounded-lg transition ${filterAction === '完成練習' ? 'bg-white text-amber-900 shadow-xs' : ''}`}
              >
                已交卷
              </button>
              <button
                onClick={() => setFilterAction('登入')}
                className={`px-2.5 py-1.5 rounded-lg transition ${filterAction === '登入' ? 'bg-white text-amber-900 shadow-xs' : ''}`}
              >
                登入
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {records.length === 0 && (
              <button
                onClick={handleGenerateSampleData}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>生成示範學生紀錄</span>
              </button>
            )}

            <button
              onClick={handleExportCsv}
              disabled={records.length === 0}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>匯出成績 CSV</span>
            </button>

            <button
              onClick={handleClearRecords}
              disabled={records.length === 0}
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition disabled:opacity-30 cursor-pointer"
              title="清空紀錄"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">時間戳記</th>
                <th className="py-3 px-4">學號</th>
                <th className="py-3 px-4">學生姓名</th>
                <th className="py-3 px-4">動作</th>
                <th className="py-3 px-4 text-center">得分</th>
                <th className="py-3 px-4">評級</th>
                <th className="py-3 px-4 text-right">試算表同步狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto stroke-[1.5] mb-2 opacity-50" />
                    <p className="font-medium">尚無符合條件的學生紀錄</p>
                    <p className="text-[11px] mt-1">學生在登入或完成 10 題數學練習後，資料將即時在此更新</p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const scoreNum = Number(item.score);
                  const isCompleted = item.action === '完成練習' && item.score !== '' && item.score !== undefined;
                  return (
                    <tr key={item.id} className="hover:bg-amber-50/40 transition">
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{item.timestamp}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{item.studentId}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{item.studentName}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          item.action === '完成練習'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-black text-sm">
                        {isCompleted ? (
                          <span className={scoreNum >= 90 ? 'text-amber-600' : scoreNum >= 60 ? 'text-emerald-600' : 'text-rose-600'}>
                            {scoreNum} 分
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isCompleted ? (
                          <span className="font-bold text-[11px]">
                            {scoreNum === 100 && '🌟 滿分金牌'}
                            {scoreNum >= 80 && scoreNum < 100 && '🥈 銀牌好手'}
                            {scoreNum >= 60 && scoreNum < 80 && '🥉 銅牌小將'}
                            {scoreNum < 60 && '🎈 再接再厲'}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">練習進行中</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {item.syncStatus === 'synced' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> 已同步 Sheet
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            本地備份
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
