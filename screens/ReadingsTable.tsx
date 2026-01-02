
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BillingPeriod, WorkflowStatus, UserRole } from '../types';
import { Edit2, Send, AlertTriangle, MinusCircle, Search, X, UserSearch, CheckCircle2, AlertCircle, Info, Loader2, Activity, BarChart2 } from 'lucide-react';
import { useFeedback } from '../App';

const ReadingsTable: React.FC<{ period: BillingPeriod, setPeriod: React.Dispatch<React.SetStateAction<BillingPeriod>>, role?: UserRole }> = ({ period, setPeriod, role = UserRole.ADMIN }) => {
  const navigate = useNavigate();
  const { playClick, playSuccess } = useFeedback();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = role === UserRole.ADMIN;
  const capturedCount = period.readings.filter(r => r.isCaptured).length;
  const totalCount = period.readings.length;
  const progressPercent = Math.round((capturedCount / totalCount) * 100);
  
  const hasAnyCaptured = capturedCount > 0;
  const isAllCaptured = capturedCount === totalCount;

  const handleSubmit = () => {
    if (isSubmitting || period.status !== WorkflowStatus.DRAFT) return;
    
    playClick();
    const msg = isAllCaptured 
      ? 'Submit all readings for approval? This will lock editing.' 
      : `Submit ${capturedCount} readings for approval? Others can be updated later if admin rejects.`;
    
    if (window.confirm(msg)) {
      setIsSubmitting(true);
      playSuccess();
      
      setPeriod(prev => ({ 
        ...prev, 
        status: WorkflowStatus.SUBMITTED 
      }));

      navigate('/approval');
    }
  };

  const filteredReadings = period.readings.filter(r => 
    r.tenantId.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.meterId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Dynamic Header for Admin Monitoring */}
      {isAdmin ? (
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center space-x-2 text-blue-600 mb-2">
                   <Activity size={18} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Field Activity Monitor</span>
                </div>
                <h2 className="text-2xl font-black text-gray-900">Current Progress</h2>
                <p className="text-gray-500 text-sm font-medium mt-1">Status of meter readings for {period.month} cycle.</p>
              </div>
              
              <div className="w-full md:w-64 space-y-2">
                 <div className="flex justify-between text-xs font-black uppercase tracking-tighter">
                    <span className="text-gray-400">Completion</span>
                    <span className="text-blue-600">{progressPercent}%</span>
                 </div>
                 <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-50 shadow-inner">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.4)]" 
                      style={{ width: `${progressPercent}%` }}
                    />
                 </div>
                 <p className="text-[10px] text-gray-400 font-bold text-right">{capturedCount} of {totalCount} meters captured</p>
              </div>
           </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Monthly Reading Table</h2>
            <p className="text-gray-500">Capture and submit tenant readings</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Search tenant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-medium"
              />
            </div>

            <button 
              disabled={!hasAnyCaptured || period.status !== WorkflowStatus.DRAFT || isSubmitting}
              onClick={handleSubmit}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all w-full sm:w-auto justify-center active:scale-95 ${
                hasAnyCaptured && period.status === WorkflowStatus.DRAFT && !isSubmitting
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              <span>{isSubmitting ? 'Sending...' : 'Submit to Admin'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Progress Stats Bar for Staff */}
      {!isAdmin && (
        <div className="grid grid-cols-3 gap-4">
           <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
              <div className="bg-green-100 text-green-600 p-2 rounded-xl"><CheckCircle2 size={20} /></div>
              <div><p className="text-[10px] font-black text-gray-400 uppercase">Done</p><p className="font-black text-lg">{capturedCount}</p></div>
           </div>
           <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
              <div className="bg-red-100 text-red-600 p-2 rounded-xl"><AlertCircle size={20} /></div>
              <div><p className="text-[10px] font-black text-gray-400 uppercase">Missing</p><p className="font-black text-lg">{totalCount - capturedCount}</p></div>
           </div>
           <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-xl"><BarChart2 size={20} /></div>
              <div><p className="text-[10px] font-black text-gray-400 uppercase">Progress</p><p className="font-black text-lg">{progressPercent}%</p></div>
           </div>
        </div>
      )}

      {period.status !== WorkflowStatus.DRAFT && (
        <div className="bg-blue-600 p-4 rounded-2xl flex items-center justify-center space-x-3 text-white shadow-xl shadow-blue-100 animate-in zoom-in-95">
          <CheckCircle2 size={20} />
          <p className="text-sm font-black uppercase tracking-[0.2em]">
            Batch {period.status === WorkflowStatus.SUBMITTED ? 'Waiting for Approval' : 'Verified'}
          </p>
        </div>
      )}

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-6">Tenant / Shop</th>
                <th className="px-6 py-6 text-center">Status</th>
                <th className="px-6 py-6 text-center">Current Reading</th>
                <th className="px-6 py-6 text-center">Units</th>
                <th className="px-8 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReadings.length > 0 ? (
                filteredReadings.map((r) => (
                  <tr key={r.tenantId} className={`transition-all ${period.status !== WorkflowStatus.DRAFT ? 'opacity-40' : 'hover:bg-blue-50/20'}`}>
                    <td className="px-8 py-5">
                      <p className="font-black text-gray-900">{r.tenantId}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{r.meterId}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        {r.isCaptured ? (
                          <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black border border-green-100 uppercase tracking-tighter">
                            <CheckCircle2 size={12} className="mr-1" /> Captured
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black border border-red-100 uppercase tracking-tighter">
                            <AlertCircle size={12} className="mr-1" /> Missing
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center font-mono font-black text-blue-900 text-lg">
                      {r.isCaptured ? r.closing : '--'}
                    </td>
                    <td className="px-6 py-5 text-center font-black text-gray-900">
                      {r.isCaptured ? r.units : 0}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => { playClick(); navigate(`/readings/entry/${r.tenantId}`); }}
                        className={`p-3 rounded-2xl transition-all active:scale-90 shadow-sm border ${
                          period.status === WorkflowStatus.DRAFT 
                          ? 'bg-white text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-100' 
                          : 'bg-gray-50 text-gray-300 border-gray-100'
                        }`}
                        disabled={period.status !== WorkflowStatus.DRAFT}
                      >
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <UserSearch size={48} className="mx-auto mb-4 text-gray-200" />
                    <p className="font-black text-gray-400 uppercase tracking-widest text-xs">No matching tenants</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReadingsTable;
