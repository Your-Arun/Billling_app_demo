
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BillingPeriod } from '../types';
import { Upload, Sun, Info, Save } from 'lucide-react';
import { useFeedback } from '../App';

const SolarEntry: React.FC<{ period: BillingPeriod, setPeriod: React.Dispatch<React.SetStateAction<BillingPeriod>> }> = ({ period, setPeriod }) => {
  const navigate = useNavigate();
  const { playClick, playSuccess } = useFeedback();
  const [units, setUnits] = useState(period.solar.unitsGenerated.toString());
  const [method, setMethod] = useState(period.solar.allocationMethod);

  const handleSave = () => {
    playSuccess();
    setPeriod(prev => ({
      ...prev,
      solar: { ...prev.solar, unitsGenerated: parseFloat(units) || 0, allocationMethod: method }
    }));
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl border shadow-sm">
        <div className="flex items-center space-x-4 mb-8">
          <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
            <Sun size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Solar Inverter Input</h2>
            <p className="text-gray-500">Capture monthly generation and rules</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Total Units Generated</label>
              <div className="relative">
                <input 
                  type="number"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="w-full p-4 bg-gray-50 border rounded-2xl text-2xl font-black text-amber-700 focus:ring-2 focus:ring-amber-500 outline-none pr-12"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Units</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Evidence Upload</label>
              <button onClick={playClick} className="w-full h-[62px] border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors active:scale-95">
                <Upload size={20} className="mr-2" />
                <span>PDF or Inverter Photo</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center">
              Allocation Rule <Info size={14} className="ml-2 text-gray-400" />
            </label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'CommonFirst', label: 'Common first, then pro-rata', desc: 'Offsets common loss first, balance split among tenants.' },
                { id: 'ProRata', label: 'Pro-rata to tenants', desc: 'Directly distributed based on individual consumption %.' },
                { id: 'Custom', label: 'Custom split', desc: 'Specific percentage defined in admin settings.' }
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => { playClick(); setMethod(r.id as any); }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${
                    method === r.id ? 'border-amber-500 bg-amber-50 shadow-sm shadow-amber-100' : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <p className={`font-bold ${method === r.id ? 'text-amber-900' : 'text-gray-700'}`}>{r.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full p-5 bg-amber-500 text-white rounded-2xl font-black shadow-lg shadow-amber-100 hover:bg-amber-600 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <Save size={20} />
            <span>Confirm & Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SolarEntry;
