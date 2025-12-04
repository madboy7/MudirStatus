import React, { useState } from 'react';
import { FirebaseConfig } from '../types';
import { saveConfig, initFirebase } from '../services/firebaseService';

interface SetupWizardProps {
  onComplete: () => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [configInput, setConfigInput] = useState<Partial<FirebaseConfig>>({
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfigInput({
      ...configInput,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    if (!configInput.apiKey || !configInput.projectId) {
      setError('الرجاء تعبئة الحقول الأساسية على الأقل');
      return;
    }
    
    // Construct config object
    const finalConfig = configInput as FirebaseConfig;
    
    // Auto-fill database URL if missing (common pattern)
    if (!finalConfig.databaseURL && finalConfig.projectId) {
        finalConfig.databaseURL = `https://${finalConfig.projectId}-default-rtdb.firebaseio.com`;
    }

    saveConfig(finalConfig);
    
    // Try to init
    if (initFirebase()) {
      onComplete();
    } else {
      setError('حدث خطأ أثناء الاتصال. تأكد من صحة البيانات.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">إعداد الربط السحابي</h1>
          <p className="text-gray-500 text-sm">
            لربط الموبايل بالشاشة عن بعد، نحتاج إلى ربط التطبيق بقاعدة بيانات Firebase.
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 space-y-2">
              <p className="font-bold">كيف تحصل على البيانات؟</p>
              <ol className="list-decimal list-inside space-y-1 opacity-90">
                <li>اذهب إلى <a href="https://console.firebase.google.com" target="_blank" className="underline">console.firebase.google.com</a></li>
                <li>أنشئ مشروعاً جديداً.</li>
                <li>من القائمة اختر <b>Realtime Database</b> وأنشئ قاعدة بيانات (اختر Start in Test Mode).</li>
                <li>من إعدادات المشروع (Project Settings)، اختر الويب (Web App).</li>
                <li>انسخ البيانات (apiKey, projectId, etc) والصقها هنا.</li>
              </ol>
            </div>
            
            <button 
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              لدي البيانات، لنبدأ
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
             {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
             
             <div className="grid grid-cols-1 gap-3">
                <input 
                  name="apiKey"
                  placeholder="API Key"
                  value={configInput.apiKey}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg text-left"
                  dir="ltr"
                />
                 <input 
                  name="projectId"
                  placeholder="Project ID"
                  value={configInput.projectId}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg text-left"
                  dir="ltr"
                />
                <input 
                  name="databaseURL"
                  placeholder="Database URL (Optional)"
                  value={configInput.databaseURL}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg text-left"
                  dir="ltr"
                />
                <input 
                  name="appId"
                  placeholder="App ID"
                  value={configInput.appId}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg text-left"
                  dir="ltr"
                />
             </div>

             <button 
              onClick={handleSave}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition"
            >
              حفظ واتصال
            </button>
             <button 
              onClick={() => setStep(1)}
              className="w-full text-gray-400 py-2 text-sm hover:text-gray-600"
            >
              رجوع للتعليمات
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default SetupWizard;