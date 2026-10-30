import React from 'react';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Toast() {
  const { toast } = useCart();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-sm">
      <div className="bg-white text-slate-800 px-4 py-3 rounded-xl shadow-xl border border-slate-200/80 flex items-center gap-3 backdrop-blur-md">
        {icons[toast.type] || icons.info}
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    </div>
  );
}
