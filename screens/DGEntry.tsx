
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BillingPeriod } from '../types';
import { Zap, Info, CheckCircle2, Circle, Users, Settings2, IndianRupee, Save } from 'lucide-react';
import { useFeedback } from '../App';

const DGEntry: React.FC<{ period: BillingPeriod, setPeriod: React.Dispatch<React.SetStateAction<BillingPeriod>> }> = ({ period, setPeriod }) => {
  const navigate = useNavigate();
  const { playClick, playSuccess } = useFeedback();
  const [dgSets, setDgSets] = useState(period.dgSets);
  const [selectedDGIdx, setSelectedDGIdx] = useState(0);

  const updateDG = (index: number, field: string, value: any) => {
    const updated = [...dgSets];
    updated[index] = { ...updated[index], [field]: value };
    setDgSets(updated);
  };

  const toggleTenantMapping = (dgIdx: number, tenantId: string) => {
    playClick();
    const updated = [...dgSets];
    const currentMappings = updated[dgIdx].mappedTenants || [];
    
    if (currentMappings.includes(tenantId)) {
      updated[dgIdx].mappedTenants = currentMappings.filter(id => id !== tenantId);
    } else {
      updated[dgIdx].mappedTenants = [...currentMappings, tenantId];
    }
    setDgSets(updated);
  };

  const handleSave = () => {
    playSuccess();
    setPeriod(prev => ({ ...prev, dgSets }));
    navigate('/');
  };

  const activeDG = dgSets[selectedDGIdx];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-8 rounded-3xl border shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
              <Zap size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">DG Sets Management</h2>
              <p className="text-gray-500">Assign tenants to DG sets and record units</p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            className="hidden md:flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
          >
            <CheckCircle2 size={18} />
            <span>Confirm & Return</span>
          </button>
        </div>

        {/* DG Set Selector & Unit Input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {dgSets.map((dg, idx) => (
            <button 
              key={dg.id}
              onClick={() => { playClick(); setSelectedDGIdx(idx); }}
              className={`p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden active:scale-[0.98] ${
                selectedDGIdx === idx 
                ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-50' 
                : 'border-gray-100 hover:border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-black text-gray-800 uppercase tracking-wider text-sm">{dg.id}</h3>
                {selectedDGIdx === idx && <Settings2 size={16} className="text-blue-500" />}
              </div>
              <div className="space-y-4">
                <div onClick={(e) => e.stopPropagation()}>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Total Units Recorded</label>
                  <input 
                    type="number"
                    value={dg.units}
                    onChange={(e) => updateDG(idx, 'units', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-white border border-gray-200 rounded font-black text-lg text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0"
                  />
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center">
                    <IndianRupee size={10} className="mr-1" /> Cost Per Unit
                  </label>
                  <input 
                    type="number"
                    step="0.1"
                    value={dg.costPerUnit}
                    onChange={(e) => updateDG(idx, 'costPerUnit', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-white border border-gray-200 rounded font-black text-lg text-amber-700 focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="1.0"
                  />
                </div>
                <div className="flex items-center space-x-2 text-xs font-bold text-gray-500">
                  <Users size={12} />
                  <span>{dg.mappedTenants?.length || 0} Tenants Linked</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Tenant Mapping Interface */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="bg-gray-900 p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users size={18} />
              <h3 className="font-bold text-sm">Assign Tenants to {activeDG.id}</h3>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Toggle connections</p>
          </div>
          
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {period.readings.map(r => {
              const isMapped = activeDG.mappedTenants?.includes(r.tenantId);
              const isMappedToOther = dgSets.some((dg, i) => i !== selectedDGIdx && dg.mappedTenants?.includes(r.tenantId));

              return (
                <button
                  key={r.tenantId}
                  onClick={() => toggleTenantMapping(selectedDGIdx, r.tenantId)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all active:scale-95 ${
                    isMapped 
                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-inner' 
                    : 'border-gray-50 bg-gray-50/50 text-gray-500 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-black text-sm">{r.tenantId}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Meter: {r.meterId}</span>
                  </div>
                  <div className="flex items-center">
                    {isMapped ? (
                      <CheckCircle2 size={20} className="text-blue-600" />
                    ) : (
                      <Circle size={20} className="text-gray-200" />
                    )}
                  </div>
                  {isMappedToOther && !isMapped && (
                    <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                      DUAL
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="p-4 bg-blue-50/50 border-t border-gray-100 flex items-start space-x-3">
            <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
              Mapping logic: Tenants assigned to <strong>{activeDG.id}</strong> will be charged <strong>₹{activeDG.costPerUnit || '1.0'}</strong> per unit based on their consumption.
            </p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full mt-8 p-5 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all md:hidden flex items-center justify-center space-x-2"
        >
          <Save size={20} />
          <span>Save & Return</span>
        </button>
      </div>
    </div>
  );
};

export default DGEntry;
