import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
    AppView, 
    Question, 
    Answer, 
    AssessmentResult, 
    StrengthItem, 
    DOMAIN_COLORS, 
    DomainType 
} from './types';
import { QUESTIONS, MOCK_LOADING_MESSAGES } from './constants';
import { analyzeStrengths } from './services/geminiService';
import { Button } from './components/Button';
import { ResultChart } from './components/ResultChart';
import { HistoryView } from './components/HistoryView';

export default function App() {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [history, setHistory] = useState<AssessmentResult[]>([]);
  const [loadingMsg, setLoadingMsg] = useState(MOCK_LOADING_MESSAGES[0]);
  const loadingIntervalRef = useRef<number | null>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('strengths_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveResult = (newResult: AssessmentResult) => {
    const updatedHistory = [newResult, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('strengths_history', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    if(window.confirm("確定要清除所有測驗記錄嗎？")){
        setHistory([]);
        localStorage.removeItem('strengths_history');
    }
  }

  const startQuiz = () => {
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setView(AppView.QUIZ);
  };

  const handleAnswer = (option: 'A' | 'B', text: string) => {
    const newAnswer: Answer = {
      questionId: QUESTIONS[currentQuestionIndex].id,
      selectedOption: option,
      selectedText: text
    };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      // Scroll to top for mobile
      window.scrollTo(0, 0);
    } else {
      finishQuiz(updatedAnswers);
    }
  };

  const finishQuiz = async (finalAnswers: Answer[]) => {
    setView(AppView.ANALYZING);
    
    // Cycle loading messages
    let msgIndex = 0;
    loadingIntervalRef.current = window.setInterval(() => {
      msgIndex = (msgIndex + 1) % MOCK_LOADING_MESSAGES.length;
      setLoadingMsg(MOCK_LOADING_MESSAGES[msgIndex]);
    }, 2000);

    try {
      const analysis = await analyzeStrengths(finalAnswers);
      const newResult: AssessmentResult = {
        id: uuidv4(),
        date: new Date().toISOString(),
        ...analysis
      };
      setResult(newResult);
      saveResult(newResult);
      setView(AppView.RESULT);
    } catch (error) {
      console.error(error);
      alert("分析過程中發生錯誤，請稍後再試。");
      setView(AppView.LANDING);
    } finally {
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    }
  };

  const renderLanding = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl space-y-8 animate-fade-in-up">
        <div className="inline-block p-4 rounded-full bg-white shadow-xl mb-4">
           <svg className="w-16 h-16 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
           </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          探索你的<span className="text-indigo-600">天賦優勢</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
          透過 AI 驅動的心理測驗，發掘您的核心競爭力。
          <br />
          <span className="text-sm md:text-base text-slate-500 mt-4 block p-4 bg-white/50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-700 block mb-1">關於此版本</span>
            本工具為基於蓋洛普理論的<span className="font-semibold text-indigo-600"> 170 題完整研究版</span>。
            <br />
            為了獲得精準的分析結果，請依直覺回答，預計需要 <span className="font-semibold text-indigo-600">30 - 40 分鐘</span>。
          </span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button size="lg" onClick={startQuiz} className="w-full sm:w-auto shadow-indigo-200 shadow-lg">
            開始深度測驗
          </Button>
          {history.length > 0 && (
            <Button variant="outline" size="lg" onClick={() => setView(AppView.HISTORY)} className="w-full sm:w-auto">
              查看歷史記錄 ({history.length})
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const renderQuiz = () => {
    const question = QUESTIONS[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="w-full max-w-3xl space-y-8">
          {/* Header & Progress */}
          <div className="space-y-4">
            <div className="flex justify-between items-end text-sm font-medium text-slate-500">
              <span>問題 {currentQuestionIndex + 1} / {QUESTIONS.length}</span>
              <span>{Math.round(progress)}% 完成</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8 animate-fade-in">
            <h2 className="text-xl md:text-2xl font-bold text-center text-slate-800 leading-snug">
              在這兩種情況中，哪一個更符合您的自然反應？
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <button
                onClick={() => handleAnswer('A', question.optionA)}
                className="group relative p-6 md:p-8 text-left border-2 border-slate-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 flex flex-col h-full"
              >
                <span className="absolute top-4 left-4 text-xs font-bold text-slate-300 group-hover:text-indigo-400">OPTION A</span>
                <span className="mt-4 text-lg text-slate-700 font-medium group-hover:text-indigo-900">
                  {question.optionA}
                </span>
              </button>

              <button
                onClick={() => handleAnswer('B', question.optionB)}
                className="group relative p-6 md:p-8 text-left border-2 border-slate-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 flex flex-col h-full"
              >
                <span className="absolute top-4 left-4 text-xs font-bold text-slate-300 group-hover:text-indigo-400">OPTION B</span>
                <span className="mt-4 text-lg text-slate-700 font-medium group-hover:text-indigo-900">
                  {question.optionB}
                </span>
              </button>
            </div>
            
            <p className="text-center text-slate-400 text-sm">
              請選擇第一直覺，不要過度思考。沒有對錯之分。
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalyzing = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-8">
      <div className="relative">
        <div className="w-24 h-24 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🧠</span>
        </div>
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-bold text-slate-800">正在分析您的天賦基因</h2>
        <p className="text-lg text-indigo-600 font-medium animate-pulse">
          {loadingMsg}
        </p>
        <p className="text-sm text-slate-400 pt-4">
            請勿關閉視窗，這可能需要一分鐘...
        </p>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!result) return null;

    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              您的天賦優勢報告
            </h1>
            <p className="text-slate-500 max-w-2xl mx-auto">
              根據您對 170 道題目的回應，我們分析出了您的核心優勢與能量分佈。
            </p>
          </div>

          {/* Top Section: Chart & Summary */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <span className="w-1 h-6 bg-indigo-500 mr-2 rounded-full"></span>
                四大領域能量分佈
              </h3>
              <div className="flex-1 flex items-center justify-center">
                <ResultChart distribution={result.domainDistribution} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
               <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <span className="w-1 h-6 bg-indigo-500 mr-2 rounded-full"></span>
                綜合分析
              </h3>
              <div className="prose prose-slate flex-1 overflow-y-auto max-h-80 custom-scrollbar">
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {result.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Strengths List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 text-center">Top 5 核心優勢</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {result.topStrengths.map((strength, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md border-l-4 overflow-hidden hover:shadow-xl transition-shadow" 
                     style={{ borderLeftColor: DOMAIN_COLORS[strength.domain] }}>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-slate-800">{strength.name}</h3>
                      <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-500 rounded">
                        {strength.domain}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {strength.description}
                    </p>
                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">建議行動</h4>
                      <p className="text-slate-700 text-sm italic">
                        "{strength.advice}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4 pt-8 border-t border-slate-200">
            <Button size="lg" onClick={() => setView(AppView.LANDING)}>
              返回首頁
            </Button>
            <Button variant="outline" size="lg" onClick={() => setView(AppView.HISTORY)}>
              查看歷史記錄
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans text-slate-900">
      {view === AppView.LANDING && renderLanding()}
      {view === AppView.QUIZ && renderQuiz()}
      {view === AppView.ANALYZING && renderAnalyzing()}
      {view === AppView.RESULT && renderResult()}
      {view === AppView.HISTORY && (
        <div className="min-h-screen bg-slate-50">
            <HistoryView 
                history={history} 
                onSelectResult={(r) => { setResult(r); setView(AppView.RESULT); }}
                onBack={() => setView(AppView.LANDING)}
                onClear={clearHistory}
            />
        </div>
      )}
    </div>
  );
}