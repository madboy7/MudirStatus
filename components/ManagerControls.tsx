import React, { useState, useEffect } from 'react';
import { OfficeStatus, StatusData, STORAGE_KEY } from '../types';
import { generateStatusMessage, getDefaultMessage } from '../services/geminiService';

// Icons
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const BusyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const PrayerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
     <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
  </svg>
);

const InstallIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

interface ManagerControlsProps {
  initialData: StatusData;
  onUpdate: (data: StatusData) => void;
  goBack: () => void;
}

const ManagerControls: React.FC<ManagerControlsProps> = ({ initialData, onUpdate, goBack }) => {
  const [status, setStatus] = useState<OfficeStatus>(initialData.status);
  const [context, setContext] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date(initialData.timestamp));
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  // Sync state if external changes happen
  useEffect(() => {
    setStatus(initialData.status);
    setLastUpdated(new Date(initialData.timestamp));
  }, [initialData]);

  const handleStatusChange = async (newStatus: OfficeStatus) => {
    setStatus(newStatus);
    
    let message = "";
    
    if (context.trim().length > 0) {
        setIsGenerating(true);
        message = await generateStatusMessage(newStatus, context);
        setIsGenerating(false);
    } else {
        message = getDefaultMessage(newStatus);
    }

    const newData: StatusData = {
      status: newStatus,
      message: message,
      timestamp: Date.now(),
      customContext: context
    };

    onUpdate(newData);
    setLastUpdated(new Date());
    setContext(''); // Clear context after send
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pb-8 safe-bottom">
      {/* Header */}
      <div className="w-full bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10 safe-top">
        <h1 className="text-xl font-bold text-gray-800">لوحة التحكم</h1>
        <div className="flex gap-2">
            <button 
              onClick={() => setShowInstallHelp(true)}
              className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 flex items-center gap-1"
            >
              <InstallIcon />
              <span className="hidden sm:inline">تثبيت التطبيق</span>
            </button>
            <button 
              onClick={goBack} 
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              خروج
            </button>
        </div>
      </div>

      {/* Install Help Modal */}
      {showInstallHelp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowInstallHelp(false)}>
           <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-center mb-4">كيفية تثبيت التطبيق</h3>
              
              <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-bold text-gray-800 mb-1">📱 آيفون (iOS)</p>
                      <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                          <li>اضغط على زر المشاركة <span className="inline-block bg-gray-200 px-1 rounded">Share</span> في أسفل المتصفح.</li>
                          <li>اختر <b>"إضافة إلى الصفحة الرئيسية"</b> (Add to Home Screen).</li>
                      </ol>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-bold text-gray-800 mb-1">🤖 أندرويد (Android)</p>
                      <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                          <li>اضغط على القائمة (3 نقاط) في المتصفح.</li>
                          <li>اختر <b>"تثبيت التطبيق"</b> أو "الإضافة للشاشة الرئيسية".</li>
                      </ol>
                  </div>
              </div>

              <button 
                onClick={() => setShowInstallHelp(false)}
                className="w-full mt-6 bg-blue-600 text-white py-2 rounded-xl font-bold"
              >
                حسناً
              </button>
           </div>
        </div>
      )}

      <div className="w-full max-w-md p-6 space-y-6 flex-1 flex flex-col justify-center">
        
        {/* Status Indicator */}
        <div className="text-center mb-6">
          <p className="text-gray-500 text-sm mb-1">الحالة الحالية (آخر تحديث {lastUpdated.toLocaleTimeString('ar-SA', {hour: '2-digit', minute:'2-digit'})})</p>
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold border-2
            ${status === OfficeStatus.AVAILABLE ? 'bg-green-100 text-green-700 border-green-200' : ''}
            ${status === OfficeStatus.BUSY ? 'bg-red-100 text-red-700 border-red-200' : ''}
            ${status === OfficeStatus.CLOSED ? 'bg-gray-200 text-gray-700 border-gray-300' : ''}
            ${status === OfficeStatus.PRAYER ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : ''}
          `}>
             {status === OfficeStatus.AVAILABLE && 'متاح الآن'}
             {status === OfficeStatus.BUSY && 'مشغول'}
             {status === OfficeStatus.CLOSED && 'مغلق'}
             {status === OfficeStatus.PRAYER && 'في الصلاة'}
          </div>
        </div>

        {/* Context Input */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
             <span>سبب الحالة (اختياري)</span>
             <SparklesIcon />
           </label>
           <input 
             type="text" 
             value={context}
             onChange={(e) => setContext(e.target.value)}
             placeholder="مثال: اجتماع، استراحة، صلاة الظهر..."
             className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-right"
             dir="rtl"
           />
           <p className="text-xs text-gray-400 mt-2">اكتب السبب ليقوم الذكاء الاصطناعي بصياغته، أو اتركه فارغاً للرسالة الافتراضية.</p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 gap-4">
          <button 
            disabled={isGenerating}
            onClick={() => handleStatusChange(OfficeStatus.AVAILABLE)}
            className={`
              relative overflow-hidden group p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between
              ${status === OfficeStatus.AVAILABLE ? 'bg-green-50 border-green-500 shadow-md transform scale-[1.02]' : 'bg-white border-green-100 hover:border-green-300'}
            `}
          >
             <div className="flex items-center">
                <div className={`p-2 rounded-full mr-4 ${status === OfficeStatus.AVAILABLE ? 'bg-green-500 text-white' : 'bg-green-100 text-green-500'}`}>
                  <CheckIcon />
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-gray-800">متاح</h3>
                  <p className="text-xs text-gray-500">استقبال الزوار والموظفين</p>
                </div>
             </div>
             {isGenerating && status === OfficeStatus.AVAILABLE && <span className="animate-spin h-5 w-5 border-2 border-green-600 rounded-full border-t-transparent"></span>}
          </button>

          <button 
             disabled={isGenerating}
             onClick={() => handleStatusChange(OfficeStatus.BUSY)}
             className={`
              relative overflow-hidden group p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between
              ${status === OfficeStatus.BUSY ? 'bg-red-50 border-red-500 shadow-md transform scale-[1.02]' : 'bg-white border-red-100 hover:border-red-300'}
            `}
          >
             <div className="flex items-center">
                <div className={`p-2 rounded-full mr-4 ${status === OfficeStatus.BUSY ? 'bg-red-500 text-white' : 'bg-red-100 text-red-500'}`}>
                   <BusyIcon />
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-gray-800">مشغول</h3>
                  <p className="text-xs text-gray-500">الرجاء عدم الإزعاج</p>
                </div>
             </div>
             {isGenerating && status === OfficeStatus.BUSY && <span className="animate-spin h-5 w-5 border-2 border-red-600 rounded-full border-t-transparent"></span>}
          </button>

          <button 
             disabled={isGenerating}
             onClick={() => handleStatusChange(OfficeStatus.PRAYER)}
             className={`
              relative overflow-hidden group p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between
              ${status === OfficeStatus.PRAYER ? 'bg-indigo-50 border-indigo-500 shadow-md transform scale-[1.02]' : 'bg-white border-indigo-100 hover:border-indigo-300'}
            `}
          >
             <div className="flex items-center">
                <div className={`p-2 rounded-full mr-4 ${status === OfficeStatus.PRAYER ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-500'}`}>
                   <PrayerIcon />
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-gray-800">وقت الصلاة</h3>
                  <p className="text-xs text-gray-500">سأعود قريباً</p>
                </div>
             </div>
             {isGenerating && status === OfficeStatus.PRAYER && <span className="animate-spin h-5 w-5 border-2 border-indigo-600 rounded-full border-t-transparent"></span>}
          </button>

          <button 
             disabled={isGenerating}
             onClick={() => handleStatusChange(OfficeStatus.CLOSED)}
             className={`
              relative overflow-hidden group p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between
              ${status === OfficeStatus.CLOSED ? 'bg-gray-100 border-gray-500 shadow-md transform scale-[1.02]' : 'bg-white border-gray-200 hover:border-gray-400'}
            `}
          >
             <div className="flex items-center">
                <div className={`p-2 rounded-full mr-4 ${status === OfficeStatus.CLOSED ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <MoonIcon />
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-gray-800">خارج المكتب</h3>
                  <p className="text-xs text-gray-500">مغلق أو في استراحة</p>
                </div>
             </div>
             {isGenerating && status === OfficeStatus.CLOSED && <span className="animate-spin h-5 w-5 border-2 border-gray-600 rounded-full border-t-transparent"></span>}
          </button>
        </div>

      </div>
      
      <div className="pb-6 text-center text-gray-400 text-xs">
         MudirStatus v1.1 • مدعوم بواسطة Gemini
      </div>
    </div>
  );
};

export default ManagerControls;