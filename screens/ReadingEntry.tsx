import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BillingPeriod, Reading, WorkflowStatus } from '../types';
import { useFeedback } from '../App';
import { 
  Camera, 
  ChevronLeft, 
  Save, 
  CheckCircle, 
  Trash2, 
  Zap, 
  AlertCircle,
  Loader2,
  Check,
  Calculator
} from 'lucide-react';

const ReadingEntry: React.FC<{ period: BillingPeriod, setPeriod: React.Dispatch<React.SetStateAction<BillingPeriod>> }> = ({ period, setPeriod }) => {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const { playClick, playSuccess } = useFeedback();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const reading = period.readings.find(r => r.tenantId === tenantId);

  const [closing, setClosing] = useState<string>(reading?.isCaptured ? reading.closing.toString() : '');
  const [remarks, setRemarks] = useState(reading?.remarks || '');
  const [photo, setPhoto] = useState<string | undefined>(reading?.photo);
  const [isSubmitting, setIsSubmitting] = useState<'draft' | 'done' | null>(null);
  const [showToast, setShowToast] = useState(false);

  if (!reading) return <div className="p-8 text-center text-gray-500">Tenant not found</div>;

  const rawDifference = closing !== '' ? (parseFloat(closing) - reading.opening) : 0;
  const currentUnits = rawDifference * reading.meterCT;
  const isHighConsumption = currentUnits > 2000;

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    playClick();
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    playClick();
    setPhoto(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async (type: 'draft' | 'done') => {
    if (type === 'done') playSuccess();
    else playClick();

    setIsSubmitting(type);
    await new Promise(resolve => setTimeout(resolve, 600));

    const val = closing === '' ? 0 : parseFloat(closing);
    const diff = val - reading.opening;
    const units = diff * reading.meterCT;
    
    // Fix: Explicitly cast the updated reading object to Reading type to avoid flag widening to string
    setPeriod(prev => {
      const updatedReadings = prev.readings.map(r => 
        r.tenantId === tenantId 
        ? ({ 
            ...r, 
            closing: val, 
            units, 
            remarks, 
            photo,
            isCaptured: true,
            flag: (units > 5000 ? 'Spike' : (units === 0 && val >= reading.opening ? 'Zero' : 'Normal')) as 'Spike' | 'Zero' | 'Normal'
          } as Reading)
        : r
      );

      return {
        ...prev,
        readings: updatedReadings
      };
    });

    setIsSubmitting(null);
    if (type === 'done') navigate('/readings');
    else setShowToast(true);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-[90vh] relative border border-gray-100">
      {showToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-gray-900 text-white px-4 py-2 rounded-full shadow-2xl flex items-center space-x-2 text-sm font-medium">
            <Check size={16} className="text-green-400" />
            <span>Draft saved</span>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-5 text-white flex items-center justify-between">
        <button onClick={() => { playClick(); navigate('/readings'); }} className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-95"><ChevronLeft size={24} /></button>
        <div className="text-center">
          <h2 className="font-bold text-lg">{reading.tenantId}</h2>
          <p className="text-[10px] uppercase font-bold opacity-70">Meter ID: {reading.meterId}</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto bg-gray-50/50">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Meter CT</span>
            <p className="text-xl font-black text-blue-600">{reading.meterCT}x</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Load (kW)</span>
            <p className="text-xl font-black text-gray-800">{reading.sanctionedLoad}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Opening Reading</label>
              <div className="p-3 bg-white border border-gray-200 rounded-xl text-gray-500 font-mono font-bold">{reading.opening}</div>
            </div>
            <div className="space-y-1 text-blue-600">
              <label className="text-[11px] font-bold uppercase ml-1">Closing Reading</label>
              <input 
                type="number" 
                value={closing} 
                onChange={(e) => setClosing(e.target.value)} 
                placeholder="0" 
                className="w-full p-3 bg-white border-2 border-blue-200 rounded-xl text-blue-900 font-mono font-black focus:border-blue-500 outline-none" 
              />
            </div>
          </div>

          <div className={`p-4 rounded-2xl border-2 flex items-center justify-between shadow-sm transition-all ${closing !== '' ? isHighConsumption ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-green-50 border-green-200 text-green-900' : 'bg-white border-gray-100 text-gray-300'}`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${closing !== '' ? 'bg-white/50' : 'bg-gray-50'}`}><Zap size={20} /></div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Consumption Units</p>
                <p className="text-2xl font-black">{currentUnits.toFixed(1)} <span className="text-xs font-bold">kWh</span></p>
              </div>
            </div>
            {isHighConsumption && <AlertCircle size={20} className="text-amber-600 animate-pulse" />}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase">Meter Photo (Optional)</label>
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handlePhotoCapture} />
            {photo ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-white shadow-md">
                <img src={photo} alt="Meter" className="w-full h-40 object-cover" />
                <button onClick={removePhoto} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full transition-transform active:scale-90"><Trash2 size={16} /></button>
              </div>
            ) : (
              <button onClick={() => { playClick(); fileInputRef.current?.click(); }} className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 bg-white rounded-2xl text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-all active:scale-95">
                <Camera size={32} strokeWidth={1.5} />
                <p className="font-bold text-sm mt-2 text-center">Capture Photo Evidence</p>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 bg-white border-t border-gray-100 grid grid-cols-2 gap-4">
        <button 
          onClick={() => handleSave('draft')} 
          disabled={isSubmitting !== null} 
          className="flex items-center justify-center space-x-2 p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-600 active:scale-95 transition-all"
        >
          {isSubmitting === 'draft' ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /><span>Draft</span></>}
        </button>
        <button 
          onClick={() => handleSave('done')} 
          disabled={isSubmitting !== null || closing === ''} 
          className="flex items-center justify-center space-x-2 p-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSubmitting === 'done' ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle size={20} /><span>Save</span></>}
        </button>
      </div>
    </div>
  );
};

export default ReadingEntry;