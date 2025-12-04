import React, { useEffect, useState } from 'react';
import { OfficeStatus, StatusData } from '../types';

interface DisplayViewProps {
  data: StatusData;
  goBack: () => void;
}

const DisplayView: React.FC<DisplayViewProps> = ({ data, goBack }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock for the display
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine colors based on status
  const getTheme = (status: OfficeStatus) => {
    switch (status) {
      case OfficeStatus.AVAILABLE:
        return {
          bg: 'bg-emerald-600',
          bgGradient: 'from-emerald-500 to-emerald-700',
          text: 'text-white',
          accent: 'bg-emerald-800',
          icon: (
            <svg className="w-48 h-48 text-white opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: "تفضل بالدخول"
        };
      case OfficeStatus.BUSY:
        return {
          bg: 'bg-rose-600',
          bgGradient: 'from-rose-500 to-rose-700',
          text: 'text-white',
          accent: 'bg-rose-800',
          icon: (
             <svg className="w-48 h-48 text-white opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
          ),
          label: "مشغول حالياً"
        };
      case OfficeStatus.PRAYER:
        return {
          bg: 'bg-indigo-600',
          bgGradient: 'from-indigo-500 to-indigo-700',
          text: 'text-white',
          accent: 'bg-indigo-800',
          icon: (
             <svg className="w-48 h-48 text-white opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
          ),
          label: "وقت الصلاة"
        };
      case OfficeStatus.CLOSED:
      default:
        return {
          bg: 'bg-slate-800',
          bgGradient: 'from-slate-700 to-slate-900',
          text: 'text-gray-200',
          accent: 'bg-slate-950',
          icon: (
            <svg className="w-48 h-48 text-gray-400 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ),
          label: "المكتب مغلق"
        };
    }
  };

  const theme = getTheme(data.status);

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col items-center justify-between relative bg-gradient-to-br ${theme.bgGradient} transition-colors duration-1000`}>
      
      {/* Hidden Back Button (Top Left corner) */}
      <button onClick={goBack} className="absolute top-0 left-0 w-20 h-20 opacity-0 z-50 cursor-default" />

      {/* Top Bar: Time & Date */}
      <div className="w-full p-8 flex justify-between items-start text-white/80 z-10">
        <div className="text-right">
           <h2 className="text-3xl font-light">{currentTime.toLocaleDateString('ar-SA', { weekday: 'long' })}</h2>
           <p className="text-xl opacity-75">{currentTime.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="text-5xl font-mono font-bold tracking-widest dir-ltr">
          {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl px-8 z-10 text-center">
        
        {/* Status Icon */}
        <div className={`mb-8 drop-shadow-2xl transition-transform duration-500 ${data.status === OfficeStatus.BUSY ? 'animate-pulse-slow' : ''}`}>
           {theme.icon}
        </div>

        {/* Primary Status Label */}
        <h1 className="text-7xl font-black text-white mb-8 drop-shadow-md tracking-wide">
          {theme.label}
        </h1>

        {/* Dynamic AI Message */}
        <div className={`p-8 rounded-3xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl max-w-3xl w-full transform transition-all duration-500`}>
           <p className="text-4xl leading-relaxed text-white font-medium">
             "{data.message}"
           </p>
        </div>

      </div>

      {/* Footer */}
      <div className="w-full p-6 text-center text-white/40 text-sm z-10">
         تحديث تلقائي • نظام إدارة المكتب
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-64 bg-black/20 blur-2xl pointer-events-none"></div>
    </div>
  );
};

export default DisplayView;