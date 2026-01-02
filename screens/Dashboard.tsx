
import React, { useContext } from 'react';
import { BillingPeriod, WorkflowStatus, UserRole, User } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Send, 
  ClipboardCheck, 
  ShieldCheck, 
  FileSearch,
  Zap,
  RefreshCcw,
  Users,
  BellRing,
  Key,
  Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFeedback, SyncContext } from '../App';

const StatusCard = ({ title, status, desc, onClick, primary = false, disabled = false, alert = false, success = false, icon: Icon }: { title: string, status: string, desc: string, onClick?: () => void, primary?: boolean, disabled?: boolean, alert?: boolean, success?: boolean, icon?: any }) => {
  const isDone = status === 'Completed' || status === 'Uploaded' || status === 'Generated' || status.includes('Submitted') || status === 'Approved' || status === 'Finalized';
  
  return (
    <div 
      className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between transition-all active:scale-[0.98] ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'
      } ${primary ? 'ring-2 ring-blue-500' : ''} ${alert ? 'animate-pulse ring-4 ring-orange-500/20 border-orange-200' : ''} ${success ? 'border-green-200 bg-green-50/30' : ''}`}
      onClick={() => !disabled && onClick && onClick()}
    >
      <div className="flex items-center space-x-4">
        {Icon && (
          <div className={`p-2.5 rounded-xl ${alert ? 'bg-orange-100 text-orange-600' : success ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
            <Icon size={20} />
          </div>
        )}
        <div>
          <h3 className={`font-black text-sm tracking-tight ${alert ? 'text-orange-900' : 'text-gray-800'}`}>{title}</h3>
          <p className={`text-xs mt-0.5 font-bold uppercase tracking-wider ${alert ? 'text-orange-600' : isDone || success ? 'text-green-600' : 'text-blue-600'}`}>
            {status}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        {alert ? <BellRing className="text-orange-500 animate-bounce" size={18} /> : isDone || success ? <CheckCircle2 className="text-green-500" size={18} /> : <Clock className="text-amber-500" size={18} />}
        {(primary || alert) && <ArrowRight className={`${alert ? 'text-orange-500' : 'text-blue-500'} animate-pulse`} size={18} />}
      </div>
    </div>
  );
};

const Dashboard: React.FC<{ period: BillingPeriod, startNextMonth: () => void, role: UserRole, user: User }> = ({ period, startNextMonth, role, user }) => {
  const navigate = useNavigate();
  const syncCtx = useContext(SyncContext);
  
  const isFinalized = period.status === WorkflowStatus.FINALIZED;
  const isApprovalPending = period.status === WorkflowStatus.SUBMITTED;
  const isApproved = period.status === WorkflowStatus.APPROVED || isFinalized;
  const isRejected = period.status === WorkflowStatus.DRAFT && !!period.rejectionRemarks;
  
  const capturedCount = period.readings.filter(r => r.isCaptured).length;
  const readyToSubmit = capturedCount > 0 && period.status === WorkflowStatus.DRAFT;

  const copyCode = () => {
    navigator.clipboard.writeText(user.companyCode);
    alert("Code copied! Ab aap ise staff ke saath share kar sakte hain.");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Welcome Header */}
      <div className="bg-white p-6 rounded-[32px] border border-gray-100 flex items-center justify-between shadow-sm relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1.5 h-full ${role === UserRole.ADMIN ? 'bg-purple-600' : 'bg-green-600'}`} />
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-2xl ${role === UserRole.ADMIN ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}>
            {role === UserRole.ADMIN ? <ShieldCheck size={28} /> : <ClipboardCheck size={28} />}
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 leading-tight">Namaste, {user.name}</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-widest">{role} • {period.month} Cycle</p>
          </div>
        </div>
        
        {role === UserRole.ADMIN && (
          <button onClick={() => syncCtx?.triggerFetch()} className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-[10px] uppercase hover:bg-blue-100 transition-all active:scale-95">
            <RefreshCcw size={14} className={syncCtx?.syncStatus === 'syncing' ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
        )}
      </div>

      {/* Admin Invite Card */}
      {role === UserRole.ADMIN && (
        <div className="bg-slate-900 p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Users size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2 text-blue-400 mb-2">
              <Key size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Share Invite Code</span>
            </div>
            <h3 className="text-xl font-black mb-4">Add Field Staff</h3>
            <div className="flex items-center space-x-3">
               <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/20">
                  <span className="text-2xl font-mono font-black tracking-[0.4em]">{user.companyCode}</span>
               </div>
               <button onClick={copyCode} className="p-4 bg-blue-600 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 active:scale-95">
                  <Copy size={20} />
               </button>
            </div>
            <p className="text-[9px] font-medium text-slate-400 mt-4 leading-relaxed">Staff member jab register karega, toh ye code enter karne par wo aapki company ke meters capture kar payega.</p>
          </div>
        </div>
      )}

      {/* Rejection / Action Alerts */}
      {role === UserRole.READING_TAKER && isRejected && (
        <div className="bg-white border-2 border-red-500 p-6 rounded-3xl shadow-xl shadow-red-100 animate-in slide-in-from-top-4">
          <div className="flex items-center space-x-3 text-red-600 mb-3">
            <BellRing size={20} className="animate-bounce" />
            <p className="text-[10px] font-black uppercase tracking-widest">Re-Correction Required</p>
          </div>
          <h3 className="text-lg font-black text-gray-900">Admin ne readings reject ki hain</h3>
          <div className="mt-3 p-4 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-sm font-bold text-red-800 italic">"{period.rejectionRemarks}"</p>
          </div>
          <button onClick={() => navigate('/readings')} className="mt-5 w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg shadow-red-200 uppercase tracking-widest">Fix Now</button>
        </div>
      )}

      {role === UserRole.READING_TAKER && readyToSubmit && !isRejected && (
        <div onClick={() => navigate('/readings')} className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between cursor-pointer active:scale-95 transition-all">
           <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-2xl"><Send size={24} /></div>
              <div>
                <h3 className="font-black text-lg">Send to Admin</h3>
                <p className="text-xs font-medium opacity-80 mt-0.5">{capturedCount} readings finished.</p>
              </div>
           </div>
           <ArrowRight size={24} />
        </div>
      )}

      {/* Status Grid */}
      <div className="grid gap-4">
        <StatusCard 
          title="Field Data Entry" 
          status={period.status === WorkflowStatus.DRAFT ? `Capturing (${capturedCount}/${period.readings.length})` : period.status} 
          desc="Meter photos & units"
          icon={ClipboardCheck}
          onClick={() => navigate('/readings')}
          primary={role === UserRole.READING_TAKER && period.status === WorkflowStatus.DRAFT}
          success={isApproved}
          alert={isRejected && role === UserRole.READING_TAKER}
        />

        {role === UserRole.ADMIN && (
          <>
            <StatusCard 
              title="Review & Approval" 
              status={isApprovalPending ? 'Review Pending' : (isApproved ? 'Approved' : 'Waiting')} 
              desc="Verify staff captures"
              icon={FileSearch}
              onClick={() => navigate('/approval')}
              primary={isApprovalPending}
              alert={isApprovalPending}
              success={isApproved}
              disabled={!isApprovalPending && !isApproved}
            />
            <StatusCard 
              title="Reconciliation" 
              status={isFinalized ? 'Cycle Closed' : (isApproved ? 'Ready' : 'Locked')} 
              desc="Loss Analysis & Statements"
              icon={Zap}
              onClick={() => navigate('/reconciliation')}
              disabled={!isApproved}
              primary={isApproved && !isFinalized}
              success={isFinalized}
            />
          </>
        )}
      </div>

      {isFinalized && role === UserRole.ADMIN && (
         <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl mt-8 flex flex-col items-center text-center">
            <CheckCircle2 size={48} className="text-green-500 mb-4" />
            <h3 className="text-2xl font-black mb-2 tracking-tight">Cycle Finalized</h3>
            <p className="text-sm opacity-60 mb-8 font-medium">Monthly billing cycle complete ho chuka hai.</p>
            <button onClick={startNextMonth} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all uppercase tracking-widest">Next Month Start</button>
         </div>
      )}
    </div>
  );
};

export default Dashboard;
