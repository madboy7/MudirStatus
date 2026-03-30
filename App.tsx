import React, { useState, useEffect, useCallback } from 'react';
import ManagerControls from './components/ManagerControls';
import DisplayView from './components/DisplayView';
import SetupWizard from './components/SetupWizard';
import { OfficeStatus, StatusData } from './types';
import { initFirebase, subscribeToStatus, updateRemoteStatus, isConfigured, clearConfig, checkConnection } from './services/firebaseService';

// Initial default state
const DEFAULT_DATA: StatusData = {
  status: OfficeStatus.AVAILABLE,
  message: 'المكتب مفتوح، تفضل بالدخول.',
  timestamp: Date.now(),
};

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'SELECTION' | 'MANAGER' | 'DISPLAY' | 'SETUP'>('SETUP');
  const [currentData, setCurrentData] = useState<StatusData>(DEFAULT_DATA);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // Initialize Firebase and Subscribe on App Start
  useEffect(() => {
    // 1. Check if configured
    if (isConfigured()) {
      initFirebase();
      setViewMode('SELECTION');
      
      // Check connection
      checkConnection().then(setIsConnected);

      // 2. Subscribe to changes
      subscribeToStatus((data) => {
        if (data && data.status) {
          setCurrentData(data);
        }
      });
    } else {
      setViewMode('SETUP');
    }
  }, []);

  // Update Handler (Sends to Firebase)
  const updateStatus = useCallback(async (newData: StatusData) => {
    // Optimistic update for UI responsiveness
    setCurrentData(newData);
    // Send to cloud
    try {
      await updateRemoteStatus(newData);
    } catch (err) {
      console.error("Remote update failed", err);
      throw err;
    }
  }, []);

  // Navigation Helper
  const goBack = () => setViewMode('SELECTION');

  const handleSetupComplete = async () => {
    initFirebase();
    setViewMode('SELECTION');
    
    // Check connection
    const connected = await checkConnection();
    setIsConnected(connected);

    subscribeToStatus((data) => {
      if (data && data.status) {
        setCurrentData(data);
      }
    });
  };

  const [showConfig, setShowConfig] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'IDLE' | 'SUCCESS'>('IDLE');

  const handleReset = () => {
    clearConfig();
    window.location.reload();
  };

  const handleCopyConfig = () => {
    const config = localStorage.getItem('mudir_firebase_config');
    if (config) {
      navigator.clipboard.writeText(config);
      setCopyStatus('SUCCESS');
      setTimeout(() => setCopyStatus('IDLE'), 2000);
    }
  };

  const currentConfig = JSON.parse(localStorage.getItem('mudir_firebase_config') || '{}');

  // --- RENDER VIEWS ---

  if (viewMode === 'SETUP') {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  if (viewMode === 'SELECTION') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-8 relative">
          
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">نظام إدارة المكتب</h1>
            <div className="flex flex-col items-center gap-1">
              <p className={`font-medium text-sm inline-block px-3 py-1 rounded-full ${isConnected ? 'bg-green-50 text-green-600' : isConnected === false ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
                ● {isConnected ? 'متصل بالنظام السحابي' : isConnected === false ? 'فشل الاتصال بالسحاب' : 'جاري الاتصال...'}
              </p>
              {isConnected === false && (
                <p className="text-[10px] text-red-400 max-w-[200px]">تأكد من صحة بيانات Firebase وقواعد الحماية (Rules)</p>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={() => setViewMode('MANAGER')}
              className="w-full group relative flex items-center justify-between p-6 border-2 border-blue-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              <div className="flex flex-col items-start">
                 <span className="text-lg font-bold text-blue-900">لوحة تحكم المدير</span>
                 <span className="text-sm text-blue-400">للموبايل</span>
              </div>
              <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </button>

            <button 
              onClick={() => setViewMode('DISPLAY')}
              className="w-full group relative flex items-center justify-between p-6 border-2 border-purple-100 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200"
            >
              <div className="flex flex-col items-start">
                 <span className="text-lg font-bold text-purple-900">شاشة العرض</span>
                 <span className="text-sm text-purple-400">للتابلت / الآيباد</span>
              </div>
               <div className="bg-purple-100 p-3 rounded-full text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setShowConfig(true)}
              className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
            >
              عرض بيانات الاتصال الحالية
            </button>
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              إعادة ضبط إعدادات الاتصال
            </button>
          </div>

          {showConfig && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-right">
                <h3 className="text-lg font-bold mb-4">بيانات الاتصال الحالية</h3>
                <div className="space-y-2 text-xs font-mono bg-gray-50 p-3 rounded-lg overflow-x-auto relative group">
                   <p><span className="font-bold text-gray-400">Project:</span> {currentConfig.projectId || 'N/A'}</p>
                   <p><span className="font-bold text-gray-400">API Key:</span> {currentConfig.apiKey ? `${currentConfig.apiKey.substring(0, 8)}...` : 'N/A'}</p>
                   <button 
                    onClick={handleCopyConfig}
                    className="absolute top-2 left-2 bg-white shadow-sm border p-1 rounded hover:bg-gray-100"
                    title="نسخ البيانات"
                   >
                     {copyStatus === 'SUCCESS' ? '✓' : '📋'}
                   </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-4 leading-relaxed">
                  للتزامن، يجب أن تكون هذه البيانات **متطابقة تماماً** على كلا الجهازين. يمكنك نسخ هذه البيانات وإرسالها للجهاز الآخر.
                </p>
                <div className="flex gap-2 mt-6">
                  <button 
                    onClick={() => setShowConfig(false)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          )}

          {showResetConfirm && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                <h3 className="text-lg font-bold text-center mb-4">تأكيد إعادة الضبط</h3>
                <p className="text-gray-600 text-center mb-6">هل أنت متأكد من رغبتك في مسح إعدادات الاتصال والبدء من جديد؟</p>
                <div className="flex gap-3">
                  <button 
                    onClick={handleReset}
                    className="flex-1 bg-red-600 text-white py-2 rounded-xl font-bold"
                  >
                    نعم، امسح
                  </button>
                  <button 
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl font-bold"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Manager Mode
  if (viewMode === 'MANAGER') {
    return <ManagerControls initialData={currentData} onUpdate={updateStatus} goBack={goBack} />;
  }

  // Render Display Mode
  if (viewMode === 'DISPLAY') {
    return <DisplayView data={currentData} goBack={goBack} />;
  }

  return null;
};

export default App;