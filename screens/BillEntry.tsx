
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BillingPeriod } from '../types';
import { FileText, Calculator, Upload, Loader2, Check, AlertCircle, RefreshCw, Save } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { useFeedback } from '../App';

const BillEntry: React.FC<{ period: BillingPeriod, setPeriod: React.Dispatch<React.SetStateAction<BillingPeriod>> }> = ({ period, setPeriod }) => {
  const navigate = useNavigate();
  const { playClick, playSuccess } = useFeedback();
  const [formData, setFormData] = useState(period.bill);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (field: string, val: any) => setFormData(prev => ({ ...prev, [field]: val }));

  const processBillWithAI = async (base64Data: string, mimeType: string) => {
    setIsProcessing(true);
    setError(null);
    playClick();
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data: base64Data.split(',')[1],
                  mimeType: mimeType,
                },
              },
              {
                text: "Extract the following details from this electricity bill into a JSON object: total units consumed, energy charges amount, fixed charges amount, and total taxes/surcharges. Use these exact keys: totalUnits, energyCharges, fixedCharges, taxes. Ensure all values are numbers. If a value is missing, use 0.",
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              totalUnits: { type: Type.NUMBER },
              energyCharges: { type: Type.NUMBER },
              fixedCharges: { type: Type.NUMBER },
              taxes: { type: Type.NUMBER },
            },
            required: ["totalUnits", "energyCharges", "fixedCharges", "taxes"],
          },
        },
      });

      const result = JSON.parse(response.text || '{}');
      setFormData(prev => ({
        ...prev,
        totalUnits: result.totalUnits || 0,
        energyCharges: result.energyCharges || 0,
        fixedCharges: result.fixedCharges || 0,
        taxes: result.taxes || 0,
      }));
      playSuccess();
    } catch (err) {
      console.error("AI Extraction Error:", err);
      setError("Could not extract data from the bill. Please check the image quality or enter manually.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        processBillWithAI(reader.result as string, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    playSuccess();
    setPeriod(prev => ({ ...prev, bill: { ...formData, uploaded: true } }));
    // Automatically navigate to the next logical step: Reconciliation
    navigate('/reconciliation');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl border shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-2xl text-purple-600">
              <FileText size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Main AVVNL Bill</h2>
              <p className="text-gray-500">Official bill data extraction powered by AI</p>
            </div>
          </div>
          {formData.uploaded && !isProcessing && (
            <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-100">
              <Check size={14} />
              <span>BILL VERIFIED</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            {/* AI Upload Zone */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Document Upload</label>
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*,application/pdf"
              />
              <div 
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={`relative group h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${
                  isProcessing ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200 hover:bg-purple-50 hover:border-purple-300'
                }`}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center space-y-3 animate-pulse">
                    <Loader2 size={40} className="text-purple-600 animate-spin" />
                    <p className="text-sm font-bold text-purple-700">AI Reading Bill...</p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                      <Upload size={24} className="text-purple-600" />
                    </div>
                    <div className="text-center mt-3">
                      <p className="font-bold text-gray-700">Upload PDF or Image</p>
                      <p className="text-[10px] text-gray-400">System will auto-extract all fields</p>
                    </div>
                  </>
                )}
                {error && (
                  <div className="absolute inset-x-0 bottom-0 bg-red-500 text-white p-2 text-[10px] flex items-center justify-center">
                    <AlertCircle size={12} className="mr-1" /> {error}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Main Meter Units</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={formData.totalUnits}
                    onChange={(e) => update('totalUnits', parseFloat(e.target.value) || 0)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl font-mono font-bold text-lg text-purple-900 focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="0"
                  />
                  {formData.totalUnits > 0 && !isProcessing && <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Energy Charges (₹)</label>
                <input 
                  type="number"
                  value={formData.energyCharges}
                  onChange={(e) => update('energyCharges', parseFloat(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-200 rounded-xl font-mono font-bold text-lg text-purple-900 focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Fixed Charges</label>
                <input 
                  type="number"
                  value={formData.fixedCharges}
                  onChange={(e) => update('fixedCharges', parseFloat(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-200 rounded-xl font-mono font-bold text-gray-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Taxes</label>
                <input 
                  type="number"
                  value={formData.taxes}
                  onChange={(e) => update('taxes', parseFloat(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-200 rounded-xl font-mono font-bold text-gray-700"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-8 bg-gradient-to-br from-purple-50 to-white rounded-3xl border border-purple-100 flex flex-col justify-between h-full shadow-inner">
              <div>
                <div className="flex items-center space-x-2 text-purple-800 mb-6">
                  <Calculator size={20} />
                  <h3 className="font-black uppercase tracking-widest text-xs">Extraction Summary</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-purple-50 pb-2">
                    <span className="text-xs text-gray-500">Variable Rate (Approx)</span>
                    <span className="font-mono font-black text-purple-700">₹ {(formData.energyCharges / (formData.totalUnits || 1)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-purple-50 pb-2">
                    <span className="text-xs text-gray-500">Tax Impact / Unit</span>
                    <span className="font-mono font-black text-purple-700">₹ {(formData.taxes / (formData.totalUnits || 1)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end bg-purple-100/50 p-3 rounded-xl">
                    <span className="text-xs font-bold text-purple-900 uppercase">Effective Unit Cost</span>
                    <span className="font-mono font-black text-xl text-purple-900">₹ {((formData.energyCharges + formData.taxes + formData.fixedCharges) / (formData.totalUnits || 1)).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-start space-x-2 p-3 bg-white/60 rounded-xl border border-purple-50">
                <RefreshCw size={14} className="text-purple-400 mt-0.5 shrink-0" />
                <p className="text-[10px] text-purple-400 leading-relaxed italic">
                  Note: The system will automatically guide you to reconciliation once verified.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex space-x-4">
          <button 
            onClick={() => {
              playClick();
              setFormData({ totalUnits: 0, energyCharges: 0, fixedCharges: 0, taxes: 0, uploaded: false });
              setError(null);
            }}
            className="px-6 py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all active:scale-95"
          >
            Reset
          </button>
          <button 
            onClick={handleSave}
            disabled={isProcessing || formData.totalUnits === 0}
            className="flex-1 p-4 bg-purple-600 text-white rounded-2xl font-black shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale flex items-center justify-center space-x-2"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>{isProcessing ? 'Wait for AI...' : 'Verify & Proceed to Reconciliation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillEntry;
