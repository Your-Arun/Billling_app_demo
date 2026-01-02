
import React, { useState } from 'react';
import { BillingPeriod, Reading } from '../types';
import { useFeedback } from '../App';
import { Users, Trash2, Edit2, X, Search, UserPlus, Save, Percent, Hash } from 'lucide-react';

const TenantManagement: React.FC<{ period: BillingPeriod, setPeriod: React.Dispatch<React.SetStateAction<BillingPeriod>> }> = ({ period, setPeriod }) => {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);
  const { playClick, playSuccess } = useFeedback();
  
  const [formData, setFormData] = useState<Partial<Reading>>({
    tenantId: '',
    meterId: '',
    opening: 0,
    meterCT: 1,
    rate: 10.2,
    sanctionedLoad: '0',
    fixedCharge: 0,
    transformerLossPercentage: 0,
    hasDGCharge: false,
  });

  const openAdd = () => {
    playClick();
    setEditingTenantId(null);
    setFormData({
      tenantId: '',
      meterId: '',
      opening: 0,
      meterCT: 1,
      rate: 10.2,
      sanctionedLoad: '0',
      fixedCharge: 0,
      transformerLossPercentage: 0,
      hasDGCharge: false,
    });
    setShowForm(true);
  };

  const openEdit = (tenant: Reading) => {
    playClick();
    setEditingTenantId(tenant.tenantId);
    setFormData({ ...tenant });
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenantId || !formData.meterId) return alert('Name and Meter ID required');

    playSuccess();

    setPeriod(prev => {
      // Find if we are updating an existing tenant to preserve current cycle data
      const existingReading = prev.readings.find(r => r.tenantId === editingTenantId);
      
      const updatedReading: Reading = {
        tenantId: formData.tenantId!,
        meterId: formData.meterId!,
        opening: Number(formData.opening) || 0,
        // Preserve data if we are editing, otherwise use defaults
        closing: existingReading ? existingReading.closing : (formData.closing || 0),
        units: existingReading ? existingReading.units : (formData.units || 0),
        meterCT: Number(formData.meterCT) || 1,
        rate: Number(formData.rate) || 10.2,
        sanctionedLoad: formData.sanctionedLoad || '-',
        fixedCharge: Number(formData.fixedCharge) || 0,
        transformerLossPercentage: Number(formData.transformerLossPercentage) || 0,
        hasDGCharge: !!formData.hasDGCharge,
        flag: existingReading ? existingReading.flag : (formData.flag || 'Normal'),
        isCaptured: existingReading ? existingReading.isCaptured : (formData.isCaptured || false),
        photo: existingReading ? existingReading.photo : formData.photo,
        remarks: existingReading ? existingReading.remarks : formData.remarks
      };

      if (editingTenantId) {
        return {
          ...prev,
          readings: prev.readings.map(r => r.tenantId === editingTenantId ? updatedReading : r)
        };
      } else {
        return {
          ...prev,
          readings: [...prev.readings, updatedReading]
        };
      }
    });

    setShowForm(false);
  };

  const deleteTenant = (id: string) => {
    playClick();
    if (confirm(`Remove tenant ${id}? This will delete their data for this cycle.`)) {
      playSuccess();
      setPeriod(prev => ({
        ...prev,
        readings: prev.readings.filter(r => r.tenantId !== id)
      }));
    }
  };

  const filtered = period.readings.filter(r => 
    r.tenantId.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.meterId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
            <Users size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Tenant Management</h2>
            <p className="text-gray-500">Manage properties and custom billing rules</p>
          </div>
        </div>
        <button 
          onClick={openAdd}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
        >
          <UserPlus size={18} />
          <span>Add New Tenant</span>
        </button>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Search by name or meter..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
        />
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500">
                <th className="px-6 py-4">Tenant Info</th>
                <th className="px-6 py-4 text-center">Opening (Admin Only)</th>
                <th className="px-6 py-4">Meter Specs</th>
                <th className="px-6 py-4">Billing Rules</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(r => (
                <tr key={r.tenantId} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-black text-gray-900">{r.tenantId}</p>
                    <p className="text-xs text-gray-500 font-mono tracking-tighter">Meter: {r.meterId}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-lg font-mono font-bold text-gray-700 text-sm">
                      {r.opening}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-gray-600 font-bold">Multiplier: <span className="text-blue-600">{r.meterCT}x</span></p>
                    <p className="text-[10px] text-gray-400 font-medium">Rate: ₹{r.rate}/unit</p>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-wrap gap-2">
                       {r.transformerLossPercentage > 0 && <span className="bg-amber-50 text-amber-600 text-[8px] font-black px-1.5 py-0.5 rounded border border-amber-100 uppercase">{r.transformerLossPercentage}% Loss</span>}
                       {r.fixedCharge > 0 && <span className="bg-purple-50 text-purple-600 text-[8px] font-black px-1.5 py-0.5 rounded border border-purple-100 uppercase">Fixed Charge</span>}
                       {r.hasDGCharge && <span className="bg-blue-50 text-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded border border-blue-100 uppercase">DG Linked</span>}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEdit(r)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit Details"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteTenant(r.tenantId)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Tenant"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No tenants found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black tracking-tight">{editingTenantId ? 'Edit Tenant Settings' : 'Register New Tenant'}</h3>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">
                  {editingTenantId ? `Updating ${editingTenantId}` : 'Initial Setup'}
                </p>
              </div>
              <button onClick={() => { playClick(); setShowForm(false); }} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Name / Shop ID</label>
                  <input 
                    required 
                    value={formData.tenantId} 
                    onChange={e => setFormData({...formData, tenantId: e.target.value})} 
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800" 
                    placeholder="e.g. Croma" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Meter ID</label>
                  <input 
                    required 
                    value={formData.meterId} 
                    onChange={e => setFormData({...formData, meterId: e.target.value})} 
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800" 
                    placeholder="M-001" 
                  />
                </div>
              </div>

              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 space-y-4 shadow-inner">
                <div className="flex items-center space-x-2 text-amber-700">
                   <Hash size={16} />
                   <h4 className="text-xs font-black uppercase tracking-widest">Critical: Opening Reading</h4>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] text-amber-600/70 font-bold leading-tight mb-2">Change this ONLY if you need to correct the meter starting point for the current month.</p>
                   <input 
                    type="number" 
                    value={formData.opening} 
                    onChange={e => setFormData({...formData, opening: Number(e.target.value)})} 
                    className="w-full p-4 bg-white border-2 border-amber-200 rounded-xl outline-none focus:border-amber-500 font-mono font-black text-xl text-amber-900" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Multiplier (CT)</label>
                  <input type="number" value={formData.meterCT} onChange={e => setFormData({...formData, meterCT: Number(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Rate (₹/Unit)</label>
                  <input type="number" step="0.1" value={formData.rate} onChange={e => setFormData({...formData, rate: Number(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center">
                    Transformer Loss (%) <Percent size={10} className="ml-1" />
                  </label>
                  <div className="relative">
                    <input 
                      type="number"
                      step="0.1"
                      value={formData.transformerLossPercentage}
                      onChange={e => setFormData({...formData, transformerLossPercentage: Number(e.target.value)})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-black text-amber-900" 
                      placeholder="0.0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-amber-600 uppercase">Percent</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Fixed Monthly Charge (₹)</label>
                  <input 
                    type="number" 
                    value={formData.fixedCharge} 
                    onChange={e => setFormData({...formData, fixedCharge: Number(e.target.value)})} 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-blue-900" 
                    placeholder="0"
                  />
                </div>
              </div>

              <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center space-x-2">
                <Save size={20} />
                <span>{editingTenantId ? 'Update Profile' : 'Create Tenant'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantManagement;
