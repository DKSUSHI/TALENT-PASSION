import React from 'react';
import { AssessmentResult, DOMAIN_COLORS } from '../types';
import { Button } from './Button';

interface HistoryViewProps {
  history: AssessmentResult[];
  onSelectResult: (result: AssessmentResult) => void;
  onBack: () => void;
  onClear: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onSelectResult, onBack, onClear }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <div className="w-20 h-20 text-slate-300 mb-6">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">尚未有測驗記錄</h2>
        <p className="text-slate-500 mb-8">完成測驗後，您的結果將會儲存在這裡。</p>
        <Button onClick={onBack}>返回首頁</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-start md:items-center mb-8 flex-col md:flex-row gap-4">
        <h2 className="text-3xl font-bold text-slate-900">歷史記錄</h2>
        <div className="space-x-4">
            <Button variant="outline" onClick={onClear} className="text-red-500 hover:bg-red-50 hover:border-red-200">
                清除記錄
            </Button>
            <Button variant="ghost" onClick={onBack}>返回</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {history.map((result) => (
          <div 
            key={result.id} 
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group"
            onClick={() => onSelectResult(result)}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                {new Date(result.date).toLocaleDateString('zh-TW')}
              </span>
              <span className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                查看 &rarr;
              </span>
            </div>
            
            <div className="space-y-3">
              {result.topStrengths.slice(0, 3).map((strength, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: DOMAIN_COLORS[strength.domain] }}
                  ></span>
                  <span className="text-sm font-medium text-slate-700">{strength.name}</span>
                </div>
              ))}
              {result.topStrengths.length > 3 && (
                  <div className="text-xs text-slate-400 pl-4">+ 其他 {result.topStrengths.length - 3} 項優勢</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};