
import React, { useState, useMemo } from 'react';
import { BillingPeriod, WorkflowStatus, UserRole } from '../types';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Zap,
  Camera,
  FileSearch,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowUpRight,
  Minus,
  // Fix: Added missing Check icon import
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFeedback } from '../App';

const Approval: React.FC<{ period: BillingPeriod, setPeriod: React.Dispatch<React.SetStateAction<BillingPeriod>> }> = ({ period, setPeriod }) => {
  const navigate = useNavigate();
  const { playClick, playSuccess } = useFeedback();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const capturedReadings = useMemo(() => period.readings.filter(r => r.isCaptured), [period.readings]);
  const totalUnitsCaptured = useMemo(() => capturedReadings.reduce((acc, curr) => acc + curr.units, 0), [capturedReadings]);
  const flags = useMemo(() => capturedReadings.filter(r => r.flag !== 'Normal'), [capturedReadings]);

  const handleAction = (approve: boolean) => {
    if (approve) {
      if (!window.confirm(`Approve all readings? Total Units: ${totalUnitsCaptured.toLocaleString()}`)) return;
      playSuccess();
      setPeriod(prev => ({ 
        ...prev, 
        status: WorkflowStatus.APPROVED,
        rejectionRemarks: undefined 
      }));
      navigate('/');
    } else {
      const reason = window.prompt('Field Staff ko rejection ka reason bataein:');
      if (reason === null) return;
      
      playClick();
      setPeriod(prev => ({ 
        ...prev, 
        status: WorkflowStatus.DRAFT,
        rejectionRemarks: reason || 'Readings mein error hai. Dubara check karein.'
      }));
      navigate('/');
    }
  };

  if (period.status === WorkflowStatus.APPROVED || period.status === WorkflowStatus.FINALIZED) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24 px-6">
        <div className="bg-green-100 text-green-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner animate-in zoom-in-50 duration-500">
          <ShieldCheck size={48} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Readings Approved</h2>
        <p className="text-gray-500 mt-2 font-medium">Data lock ho chuka hai. Ab aap AVVNL Main Bill aur Reconciliation handle kar sakte hain.</p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate('/')} className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all">Dashboard</button>
          <button onClick={() => navigate('/bill')} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 active:scale-95 transition-all">Next: Enter Bill</button>
        </div>
      </div>
    );
  }

  if (period.status !== WorkflowStatus.SUBMITTED) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24 px-6 animate-in fade-in duration-500">
        <div className="bg-blue-50 text-blue-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
          <FileSearch size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Pending Request Nahi Hai</h2>
        <p className="text-gray-500 mt-2">Staff ki taraf se submission ka intezar karein.</p>
        <button onClick={() => navigate('/')} className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all">Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-32 animate-in fade-in duration-500">
      
      {/* Header with quick stats */}
      <div className="bg-white p-8 rounded-[32px] shadow-xl border border-blue-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-blue-600 pointer-events-none">
          <Zap size={140} />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Review Batch</h2>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">{period.month} {period.year} Cycle</p>
          </div>
          
          <div className="flex gap-6">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center min-w-[120px]">
               <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Meters</p>
               <p className="text-2xl font-black text-blue-800">{capturedReadings.length} / {period.readings.length}</p>
            </div>
            <div className="bg-indigo-600 p-4 rounded-2xl shadow-xl shadow-indigo-100 text-center min-w-[140px] text-white">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Total Units</p>
               <p className="text-2xl font-black">{totalUnitsCaptured.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flagged items alert - Only show if there are anomalies */}
      {flags.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-start space-x-4">
           <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
             <AlertTriangle size={24} />
           </div>
           <div>
              <p className="font-black text-amber-900">Anomalies Detected ({flags.length})</p>
              <p className="text-sm text-amber-700 mt-1 font-medium">Kuch meters mein abnormally high (Spike) ya zero consumption hai. Inhe verify karein.</p>
           </div>
        </div>
      )}

      {/* Review Table */}
      <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-6">Tenant / Shop</th>
                <th className="px-6 py-6 text-center">Reading Status</th>
                <th className="px-6 py-6 text-center">Closing</th>
                <th className="px-6 py-6 text-center">Units (Billed)</th>
                <th className="px-6 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {period.readings.map((r) => (
                <tr key={r.tenantId} className={`group transition-all ${r.flag !== 'Normal' ? 'bg-amber-50/30' : ''}`}>
                  <td className="px-8 py-5">
                    <p className="font-black text-gray-900">{r.tenantId}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{r.meterId}</p>
                  </td>
                  
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      {r.flag === 'Spike' ? (
                        <span className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-200">
                          <ArrowUpRight size={10} strokeWidth={3} />
                          <span>Spike</span>
                        </span>
                      ) : r.flag === 'Zero' ? (
                        <span className="flex items-center space-x-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200">
                          <Minus size={10} strokeWidth={3} />
                          <span>Zero</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                          <Check size={10} strokeWidth={3} />
                          <span>Normal</span>
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-5 text-center">
                     <p className="font-mono font-black text-blue-900 text-lg">
                       {r.isCaptured ? r.closing : <span className="text-gray-200">--</span>}
                     </p>
                     <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-1">Opening: {r.opening}</p>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <div className="inline-block px-4 py-2 bg-gray-900 text-white rounded-xl font-black text-sm shadow-sm">
                      {r.isCaptured ? r.units : 0} <span className="text-[10px] opacity-60 ml-0.5">kWh</span>
                    </div>
                  </td>

                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end space-x-2">
                       {r.photo && (
                         <button 
                          onClick={() => { playClick(); setSelectedPhoto(r.photo!); }} 
                          className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 active:scale-90 transition-all border border-blue-100"
                          title="View Proof"
                         >
                           <Camera size={18} />
                         </button>
                       )}
                       <button 
                        onClick={() => { playClick(); navigate(`/readings/entry/${r.tenantId}`); }} 
                        className={`p-3 rounded-2xl active:scale-90 transition-all border ${r.flag !== 'Normal' ? 'bg-orange-600 text-white border-orange-400 shadow-lg shadow-orange-100' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`} 
                        title="Edit Manually"
                       >
                         <Edit2 size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
        <div className="bg-white p-6 rounded-[36px] shadow-2xl border border-gray-100 flex gap-4 items-center">
          <button 
            onClick={() => handleAction(false)}
            className="flex-1 flex items-center justify-center space-x-2 py-4 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 border border-gray-200 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95"
          >
            <XCircle size={20} />
            <span>Reject Batch</span>
          </button>
          
          <button 
            onClick={() => handleAction(true)}
            className="flex-[1.8] flex items-center justify-center space-x-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 transition-all active:scale-95"
          >
            <CheckCircle2 size={24} />
            <span className="text-lg">Approve & Lock</span>
          </button>
        </div>
      </div>

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <img src={selectedPhoto} alt="Meter Reading Proof" className="w-full h-auto max-h-[80vh] object-contain bg-gray-50" />
            <div className="p-6 flex justify-between items-center bg-gray-900 text-white">
              <div className="flex items-center space-x-3">
                 <Camera size={20} className="text-blue-400" />
                 <p className="font-black uppercase tracking-[0.2em] text-[10px]">Staff Evidence Verification</p>
              </div>
              <button onClick={() => setSelectedPhoto(null)} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black transition-colors uppercase tracking-widest">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approval;
