import React, { useEffect } from 'react';
import { useFleet } from '../context/FleetContext';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { toastMessage, setToastMessage } = useFleet();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToastMessage]);

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[2500] max-w-sm w-full animate-in slide-in-from-bottom-5 duration-200">
      <div
        className={`p-3.5 rounded-xl border shadow-2xl flex items-start gap-3 ${
          toastMessage.type === 'alert'
            ? 'bg-red-950/95 border-red-600 text-red-100 shadow-red-950/50'
            : toastMessage.type === 'success'
            ? 'bg-emerald-950/95 border-emerald-600 text-emerald-100 shadow-emerald-950/50'
            : 'bg-slate-900/95 border-slate-700 text-slate-100 shadow-slate-950/50'
        }`}
      >
        <div className="mt-0.5 shrink-0">
          {toastMessage.type === 'alert' && <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />}
          {toastMessage.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
          {toastMessage.type === 'info' && <Info className="w-5 h-5 text-indigo-400" />}
        </div>

        <div className="flex-1 text-xs">
          <div className="font-bold text-white leading-tight">{toastMessage.title}</div>
          <div className="mt-1 text-[11px] opacity-90 leading-snug">{toastMessage.desc}</div>
        </div>

        <button
          onClick={() => setToastMessage(null)}
          className="text-slate-400 hover:text-white shrink-0 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
