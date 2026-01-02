
import React, { useEffect } from 'react';
import { BillingPeriod, WorkflowStatus, UserRole } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  PlayCircle, 
  BellRing, 
  Send, 
  ClipboardCheck, 
  ShieldCheck, 
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFeedback } from '../App';

const StatusCard = ({ title, status, desc, onClick, primary = false, disabled = false, alert = false, success = false }: { title: string, status: string, desc: string, onClick?: () => void, primary?: boolean, disabled?: boolean, alert?: boolean, success?: boolean }) => {
  const isDone = status === 'Completed' || status === 'Uploaded' || status === 'Generated' || status.includes('Submitted') || status === 'Approved' || status === 'Finalized';
  const { playClick } = useFeedback();

  const handleClick = () => {
    if (disabled) return;
    playClick();
    if (onClick) onClick();
  };
  
  return (
    <div 
      className={`bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between transition-all active:scale-[0.98] ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'
      } ${primary ? 'ring-2 ring-blue-500' : ''} ${alert ? 'animate-pulse ring-4 ring-orange-500/20 border-orange-200' : ''} ${success ? 'border-green-200 bg-green-50/30' : ''}`}
      onClick={handleClick}
    >
      <div>
        <h3 className={`font-bold ${alert ? 'text-orange-900' : 'text-gray-800'}`}>{title}</h3>
        <p className={`text-sm mt-1 ${alert ? 'text-orange-600 font-black' : isDone || success ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
          {status}
        </p>
        <p className="text-xs text-gray-400 mt-2">{desc}</p>
      </div>
      <div className="flex items-center space-x-3">
        {alert ? <BellRing className="text-orange-500 animate-bounce" size={20} /> : isDone || success ? <CheckCircle2 className="text-green-500" /> : <Clock className="text-amber-500" />}
        {(primary || alert) && <ArrowRight className={`${alert ? 'text-orange-500' : 'text-blue-500'} animate-pulse`} />}
      </div>
    </div>
  );
};

const Dashboard: React.FC<{ period: BillingPeriod, startNextMonth: () => void, role: UserRole }> = ({ period, startNextMonth, role }) => {
  const navigate = useNavigate();
  const { playClick, playChime } = useFeedback();
  
  const isFinalized = period.status === WorkflowStatus.FINALIZED;
  const isApprovalPending = period.status === WorkflowStatus.SUBMITTED;
  const isApproved = period.status === WorkflowStatus.APPROVED || isFinalized;
  const isRejected = period.status === WorkflowStatus.DRAFT && !!period.rejectionRemarks;
  
  const capturedCount = period.readings.filter(r => r.isCaptured).length;
  const readyToSubmit = capturedCount > 0 && period.status === WorkflowStatus.DRAFT;

  useEffect(() => {
    if (isApprovalPending && role === UserRole.ADMIN) {
      playChime();
    }
  }, [isApprovalPending, role]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Dynamic Role Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1.5 h-full ${role === UserRole.ADMIN ? 'bg-purple-600' : 'bg-green-600'}`} />
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-2xl ${role === UserRole.ADMIN ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
            {role === UserRole.ADMIN ? <ShieldCheck size={28} /> : <ClipboardCheck size={28} />}
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">{role === UserRole.ADMIN ? 'Administrator Control' : 'Meter Reading Staff'}</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{period.month} Billing Cycle</p>
          </div>
        </div>
        <div className="text-right">
           <p className="text-2xl font-black text-gray-900 leading-none">{period.year}</p>
           <p className={`text-[10px] font-black uppercase tracking-tighter mt-1 ${isApproved ? 'text-green-600' : 'text-blue-600'}`}>{period.status}</p>
        </div>
      </div>

      {/* READING TAKER ALERTS */}
      {role === UserRole.READING_TAKER && (
        <>
          {isRejected && (
            <div className="bg-white border-2 border-red-500 p-5 rounded-2xl shadow-xl shadow-red-100 animate-in slide-in-from-top-4 duration-500 relative">
              <div className="absolute -top-3 left-6 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Action Required</div>
              <div className="flex items-start space-x-4 mt-1">
                <div className="bg-red-100 text-red-600 p-2 rounded-xl">
                  <XCircle size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-black text-gray-900">Submission Rejected</p>
                  <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-sm font-bold text-red-800 italic">"{period.rejectionRemarks}"</p>
                  </div>
                  <button 
                    onClick={() => navigate('/readings')}
                    className="mt-4 w-full py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-200 active:scale-95 transition-all"
                  >
                    Fix & Re-submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {isApproved && !isFinalized && (
            <div className="bg-green-600 p-5 rounded-2xl shadow-xl shadow-green-100 text-white flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <CheckCircle2 size={32} className="shrink-0" />
                <div>
                  <p className="font-black uppercase tracking-widest text-sm">Task Completed!</p>
                  <p className="text-xs font-medium opacity-80">Admin has verified and locked the readings.</p>
                </div>
              </div>
            </div>
          )}

          {readyToSubmit && !isRejected && (
            <div 
              onClick={() => navigate('/readings')}
              className="bg-blue-600 p-5 rounded-2xl shadow-xl shadow-blue-200 text-white flex items-center justify-between cursor-pointer active:scale-95 transition-all hover:bg-blue-700"
            >
              <div className="flex items-center space-x-4">
                <Send size={28} className="animate-pulse" />
                <div>
                  <p className="font-black text-sm uppercase tracking-widest">Ready for Review</p>
                  <p className="text-xs font-medium opacity-80">{capturedCount} readings recorded. Tap to send.</p>
                </div>
              </div>
              <ArrowRight size={24} />
            </div>
          )}
        </>
      )}

      {/* ADMIN NOTIFICATIONS */}
      {role === UserRole.ADMIN && isApprovalPending && (
        <div 
          onClick={() => navigate('/approval')}
          className="bg-orange-500 p-5 rounded-2xl shadow-xl shadow-orange-100 text-white flex items-center justify-between cursor-pointer active:scale-95 transition-all hover:bg-orange-600 animate-pulse"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-2 rounded-xl">
              <BellRing size={28} />
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-widest">New Submission</p>
              <p className="text-xs font-medium opacity-90">Field readings received. Review & Approve now.</p>
            </div>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-xl font-black text-[10px] uppercase">Open Workflow</div>
        </div>
      )}

      {/* Primary Action Grid */}
      <div className="grid gap-4">
        <StatusCard 
          title="Meter Readings" 
          status={period.status === WorkflowStatus.DRAFT ? `In Capture (${capturedCount}/${period.readings.length})` : 'Submitted'} 
          desc="Meter photos & closing units"
          onClick={() => navigate('/readings')}
          primary={role === UserRole.READING_TAKER && period.status === WorkflowStatus.DRAFT}
          success={isApproved}
          disabled={isApproved}
          alert={isRejected && role === UserRole.READING_TAKER}
        />

        {role === UserRole.ADMIN && (
          <>
            <StatusCard 
              title="Approval Workflow" 
              status={isApprovalPending ? 'Review Pending' : (isApproved ? 'Approved & Locked' : 'Waiting for Staff')} 
              desc="Verify field data accuracy"
              onClick={() => navigate('/approval')}
              primary={isApprovalPending}
              alert={isApprovalPending}
              success={isApproved}
            />
            
            <div className="pt-6 pb-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Management Cycle</p>
            </div>

            <StatusCard 
              title="Reconciliation" 
              status={isFinalized ? 'Finalized' : (isApproved ? 'Draft' : 'Locked')} 
              desc="AVVNL Bill & Loss Analysis"
              onClick={() => navigate('/reconciliation')}
              disabled={!isApproved}
              primary={isApproved && !isFinalized}
            />

            <StatusCard 
              title="Master Reports" 
              status={isFinalized ? 'Ready' : 'Pending'} 
              desc="Download tenant statements"
              onClick={() => navigate('/statements')}
              disabled={!isFinalized}
              primary={isFinalized}
            />
          </>
        )}
      </div>

      {isFinalized && role === UserRole.ADMIN && (
         <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 -mr-4 -mt-4 transition-transform group-hover:scale-110">
              <History size={120} />
            </div>
            <h3 className="text-xl font-black mb-2 tracking-tight">Cycle Finalized</h3>
            <p className="text-sm opacity-80 mb-6 font-medium">All data for {period.month} is locked and reports are generated.</p>
            <button 
              onClick={startNextMonth} 
              className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all flex items-center space-x-2"
            >
              <PlayCircle size={18} />
              <span>Start Next Month Cycle</span>
            </button>
         </div>
      )}
    </div>
  );
};

export default Dashboard;
