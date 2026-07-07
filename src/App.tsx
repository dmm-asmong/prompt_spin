import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { STAGES, INTERESTS, getStageOptions } from './constants';

export default function App() {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [selectedExampleIdx, setSelectedExampleIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [lastPick, setLastPick] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [confetti, setConfetti] = useState<{ id: number; color: string; left: number; delay: number; rotate: number }[]>([]);

  // Wheel animation refs
  const wheelRef = useRef<HTMLDivElement>(null);
  const spinFrame = useRef<number | null>(null);
  const spinStartedAt = useRef<number>(0);
  const currentRotation = useRef<number>(0);

  const selectedInterest = INTERESTS[selectedExampleIdx];
  const currentStage = isComplete ? STAGES[STAGES.length - 1] : STAGES[currentStageIdx];
  const options = useMemo(() => getStageOptions(currentStage.key, selectedInterest.interest, selectedInterest.problem), [currentStage.key, selectedInterest]);

  // Timer
  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const resetTimer = () => setTimeLeft(180);

  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1600);
  };

  const triggerConfetti = () => {
    if (window.innerWidth < 700) return;
    const colors = ["#e63946", "#ff6b35", "#ffd166", "#06d6a0", "#4cc9f0", "#f8f9fa"];
    const pieces = Array.from({ length: 38 }).map((_, i) => ({
      id: Date.now() + i,
      color: colors[i % colors.length],
      left: 8 + Math.random() * 84,
      delay: Math.random() * 0.24,
      rotate: Math.random() * 180
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 1800);
  };

  const selectedTotal = Object.keys(selectedOptions).length;

  const buildPrompt = useCallback(() => {
    const values = STAGES.reduce((acc, stage) => {
      acc[stage.key] = selectedOptions[stage.key] || stage.title;
      return acc;
    }, {} as Record<string, string>);

    return `나는 중학생이야. 내 관심사는 "${selectedInterest.interest}"이고, 해결하고 싶은 문제는 "${selectedInterest.problem}"이야.

너는 ${values.role}.
목표는 ${values.goal}.
상황은 ${values.context}.

반드시 지킬 조건:
- ${values.condition}
- AI가 도울 일과 내가 직접 판단하고 책임질 일을 구분해줘.
- 이름, 얼굴, 학교, 연락처 같은 개인정보를 넣지 않는 방식으로 제안해줘.

출력 형식:
- ${values.format}

마지막에는 다음 검증 요청을 반영해줘:
- ${values.verify}`;
  }, [selectedInterest, selectedOptions]);

  const startWheel = () => {
    if (spinFrame.current) cancelAnimationFrame(spinFrame.current);
    setIsSpinning(true);
    setLastPick('');
    if (wheelRef.current) wheelRef.current.style.transition = 'none';

    const startRot = currentRotation.current;
    spinStartedAt.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - spinStartedAt.current;
      const newRot = startRot + elapsed * 0.62;
      currentRotation.current = newRot;
      if (wheelRef.current) {
        wheelRef.current.style.transform = `rotate(${newRot}deg)`;
        wheelRef.current.style.setProperty('--counter-angle', `${-newRot}deg`);
      }
      spinFrame.current = requestAnimationFrame(animate);
    };
    spinFrame.current = requestAnimationFrame(animate);
  };

  const stopWheel = () => {
    const index = Math.floor(Math.random() * options.length);
    const pick = options[index].value;
    const segmentCenter = index * 60 + 30;
    const target = 360 - segmentCenter;
    const currentMod = ((currentRotation.current % 360) + 360) % 360;
    const delta = (target - currentMod + 360) % 360;

    setIsSpinning(false);
    if (spinFrame.current) cancelAnimationFrame(spinFrame.current);

    const finalRot = currentRotation.current + 720 + delta;
    currentRotation.current = finalRot;
    
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 2.4s cubic-bezier(.08, .72, .12, 1)';
      wheelRef.current.style.transform = `rotate(${finalRot}deg)`;
      wheelRef.current.style.setProperty('--counter-angle', `${-finalRot}deg`);
    }
    
    setLastPick('멈추는 중...');
    
    setTimeout(() => {
      setLastPick(pick);
    }, 2450);
  };

  const handleSpinToggle = () => {
    if (isComplete) {
      handleReset();
      return;
    }
    if (isSpinning) {
      stopWheel();
    } else {
      startWheel();
    }
  };

  const acceptPick = () => {
    if (!lastPick || lastPick === '멈추는 중...' || isComplete) return;
    
    setSelectedOptions(prev => ({
      ...prev,
      [currentStage.key]: lastPick
    }));
    setLastPick('');

    if (currentStageIdx < STAGES.length - 1) {
      setCurrentStageIdx(prev => prev + 1);
    } else {
      setIsComplete(true);
      triggerConfetti();
      displayToast("프롬프트가 완성됐습니다.");
    }
  };

  const fillAll = () => {
    const newSelected = { ...selectedOptions };
    STAGES.forEach(stage => {
      if (!newSelected[stage.key]) {
        const stageOpts = getStageOptions(stage.key, selectedInterest.interest, selectedInterest.problem);
        newSelected[stage.key] = stageOpts[Math.floor(Math.random() * stageOpts.length)].value;
      }
    });
    setSelectedOptions(newSelected);
    setCurrentStageIdx(STAGES.length - 1);
    setLastPick('');
    setIsComplete(true);
    triggerConfetti();
    displayToast("즉시 완성했습니다.");
  };

  const handleReset = () => {
    setCurrentStageIdx(0);
    currentRotation.current = 0;
    setSelectedOptions({});
    setLastPick('');
    setIsSpinning(false);
    setIsComplete(false);
    setSelectedExampleIdx(0);
    if (spinFrame.current) cancelAnimationFrame(spinFrame.current);
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 0.4s ease';
      wheelRef.current.style.transform = `rotate(0deg)`;
      wheelRef.current.style.setProperty('--counter-angle', `0deg`);
    }
    resetTimer();
  };

  const copyPrompt = async () => {
    const prompt = buildPrompt();
    try {
      await navigator.clipboard.writeText(prompt);
      displayToast("복사했습니다.");
    } catch (e) {
      displayToast("복사 실패 (HTTPS 환경 필요)");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).matches('textarea, input')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleSpinToggle();
      }
      if (e.key === 'Enter') {
        if (isSpinning) stopWheel();
        else acceptPick();
      }
      if (e.key.toLowerCase() === 'r') {
        handleReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, isComplete, lastPick, currentStageIdx, options]);

  const formattedTime = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`;
  const pickedTextDisplay = isComplete ? "완성 프롬프트가 준비됐습니다." : (lastPick || `${currentStage.title}에 넣을 실제 문장을 뽑으세요.`);
  const resultNoteDisplay = isComplete ? "아래 프롬프트를 복사해서 AI에게 넣고, 출처와 사실은 학생이 직접 확인하게 안내하세요." : currentStage.note;
    
  let spinBtnText = "돌리기";
  if (isComplete) spinBtnText = "새 배틀 시작";
  else if (lastPick === "멈추는 중...") spinBtnText = "멈추는 중...";
  else if (isSpinning) spinBtnText = "멈추기";
  else if (lastPick) spinBtnText = "다시 돌리기";

  const btnDisabled = lastPick === '멈추는 중...' || isSpinning || (lastPick === '' && !isComplete);

  return (
    <main className="flex flex-col max-w-[1400px] min-h-screen mx-auto p-4 lg:p-6 font-sans text-slate-900 bg-slate-50">
      <header className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-indigo-600">프롬프트 조립 배틀</h1>
          <p className="text-slate-500 font-medium">중학생을 위한 창의적 프롬프트 조립 도구</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-3">
          <span className="hidden sm:inline text-xs font-bold text-slate-400 uppercase tracking-widest">개인정보 입력 금지</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500">운영시간</span>
            <strong className="text-indigo-600 text-lg font-black tracking-wide">{formattedTime}</strong>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-grow">
        <section className="col-span-1 lg:col-span-3 bg-white rounded-[2rem] p-5 md:p-6 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-indigo-600 font-bold">01</span>
            </div>
            <h2 className="font-bold text-lg m-0">나의 관심사</h2>
          </div>
          <div className="flex flex-col gap-3 flex-grow overflow-y-auto">
            {INTERESTS.map((item, idx) => {
              const isActive = idx === selectedExampleIdx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => !isSpinning && setSelectedExampleIdx(idx)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-200 select-none ${isActive ? 'bg-indigo-50 border-indigo-100 shadow-sm' : 'bg-white border-slate-100 hover:bg-slate-50 hover:-translate-y-0.5'}`}
                >
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div className="flex flex-col min-w-0">
                    <span className={`font-bold truncate ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>{item.interest}</span>
                    <span className={`text-[0.8rem] leading-snug font-medium line-clamp-2 ${isActive ? 'text-indigo-700/80' : 'text-slate-400'}`}>
                      {item.problem}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="col-span-1 lg:col-span-5 bg-white rounded-[2rem] p-5 md:p-6 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-purple-600 font-bold">02</span>
              </div>
              <h2 className="font-bold text-lg text-slate-800 m-0">프롬프트 룰렛</h2>
            </div>
            <div className="flex gap-1.5">
              {STAGES.map((stage, idx) => {
                const isDone = !!selectedOptions[stage.key];
                const isActive = idx === currentStageIdx && !isComplete;
                return (
                  <span
                    key={stage.key}
                    title={stage.title}
                    className={`grid place-items-center w-7 h-7 border rounded-full text-xs font-black ${isDone ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : isActive ? 'border-purple-300 bg-purple-100 text-purple-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                  >
                    {isDone ? "✓" : idx + 1}
                  </span>
                );
              })}
            </div>
          </div>

          <h3 className="m-0 text-purple-600 text-[clamp(1.1rem,1.5vw,1.3rem)] font-black text-center mb-2">
            {isComplete ? "완성 · AI에게 바로 넣을 프롬프트" : `${currentStageIdx + 1}/6단계 · ${currentStage.title} 선택하기`}
          </h3>

          <div className="wheel-wrap mx-auto mt-auto mb-auto">
            <div className="pointer" aria-hidden="true"></div>
            <div className="wheel" ref={wheelRef}>
              {options.map((opt, idx) => (
                <div key={idx} className="slice-label whitespace-pre-line">
                  {opt.label}
                </div>
              ))}
            </div>
            <div className="wheel-center">
              <strong className="block text-indigo-600 text-[clamp(1.2rem,1.8vw,1.8rem)] leading-none font-black whitespace-pre-line">
                {`${currentStageIdx + 1}\n${currentStage.wheel}`}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <button 
              className="btn-animate sm:col-span-2 py-4 text-xl font-black text-white rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-200"
              onClick={handleSpinToggle}
              disabled={lastPick === '멈추는 중...'}
            >
              {spinBtnText}
            </button>
            <button 
              className="btn-animate py-3 px-4 rounded-xl font-bold bg-indigo-50 text-indigo-600 border border-indigo-100"
              onClick={acceptPick}
              disabled={btnDisabled || isComplete}
            >
              채택하고 다음
            </button>
            <button 
              className="btn-animate py-3 px-4 rounded-xl font-bold bg-slate-50 text-slate-600 border border-slate-200"
              onClick={startWheel}
              disabled={isSpinning || lastPick === '멈추는 중...' || isComplete}
            >
              다른 조건 뽑기
            </button>
          </div>
        </section>

        <section className="col-span-1 lg:col-span-4 flex flex-col gap-4">
          <div className="bg-indigo-600 rounded-[2rem] p-5 md:p-6 text-white shadow-xl flex flex-col flex-grow">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-500/50 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold">03</span>
              </div>
              <h2 className="font-black text-xl m-0">결과 확인</h2>
            </div>

            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 mb-4 min-h-[120px] flex items-center">
              <p className="text-xl font-bold leading-tight break-keep text-center w-full m-0">
                {pickedTextDisplay}
              </p>
            </div>
            
            <p className="text-indigo-200 text-sm font-medium mb-4 text-center m-0">
              {resultNoteDisplay}
            </p>

            <div className="flex-grow flex flex-col gap-2 bg-indigo-900/40 rounded-2xl p-4 border border-indigo-500/30">
              <div className="flex items-center justify-between text-sm font-bold text-indigo-200">
                <span>최종 조립된 프롬프트</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-xs">
                  {selectedTotal}/6 완성
                </span>
              </div>
              <textarea 
                className="w-full h-full min-h-[160px] bg-transparent text-white text-sm leading-relaxed outline-none resize-none"
                spellCheck="false"
                value={buildPrompt()}
                readOnly
              />
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-5 border border-slate-200 shadow-sm shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button 
                className="btn-animate py-3 rounded-xl font-bold bg-indigo-600 text-white shadow-md shadow-indigo-200"
                onClick={copyPrompt}
              >
                복사
              </button>
              <button 
                className="btn-animate py-3 rounded-xl font-bold bg-purple-50 text-purple-600 border border-purple-100"
                onClick={fillAll}
              >
                즉시 완성
              </button>
              <button 
                className="btn-animate py-3 rounded-xl font-bold bg-slate-50 text-slate-600 border border-slate-200"
                onClick={handleReset}
              >
                처음부터
              </button>
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-4 text-left text-slate-400 text-xs font-medium">
        <p>&copy; {new Date().getFullYear()} asmong. All rights reserved.</p>
      </footer>

      {/* Confetti */}
      <div className="pointer-events-none fixed inset-0 w-screen h-screen z-10 overflow-hidden" aria-hidden="true">
        {confetti.map(c => (
          <span 
            key={c.id} 
            className="confetti-piece"
            style={{
              left: `${c.left}%`,
              background: c.color,
              animationDelay: `${c.delay}s`,
              transform: `rotate(${c.rotate}deg)`
            }}
          />
        ))}
      </div>

      {/* Toast */}
      <div 
        className={`fixed left-1/2 bottom-6 z-20 max-w-[calc(100vw-32px)] px-5 py-3.5 border border-brand-green/50 rounded-lg bg-[#071613]/95 text-brand-green text-[1.1rem] font-black text-center shadow-2xl transition-transform duration-300 ${showToast ? '-translate-x-1/2 translate-y-0' : '-translate-x-1/2 translate-y-[120px]'}`}
        role="status"
      >
        {toastMessage}
      </div>
    </main>
  );
}
