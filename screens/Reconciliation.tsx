
import React from 'react';
import { BillingPeriod, WorkflowStatus } from '../types';
import { BarChart3, AlertCircle, FileCheck, Info, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFeedback } from '../App';

const Reconciliation: React.FC<{ period: BillingPeriod, setPeriod: React.Dispatch<React.SetStateAction<BillingPeriod>> }> = ({ period, setPeriod }) => {
  const navigate = useNavigate();
  const { playClick, playSuccess } = useFeedback();
  
  const tenantSum = period.readings.reduce((acc, curr) => acc + curr.units, 0);
  const dgSum = period.dgSets.reduce((acc, curr) => acc + curr.units, 0);
  const solarCredit = period.solar.unitsGenerated;
  const mainUnits = period.bill.totalUnits;

  const netToAllocate = mainUnits - solarCredit + dgSum;
  const commonLoss = netToAllocate - tenantSum;
  const lossPercentage = (commonLoss / (mainUnits || 1)) * 100;

  const handleFinalize = () => {
    playClick();
    if (confirm('Finalize month? This will generate PDFs and lock all data permanently.')) {
      playSuccess();
      setPeriod(prev => ({ ...prev, status: WorkflowStatus.FINALIZED }));
      navigate('/statements');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl border shadow-lg border-blue-50">
        <div className="flex items-center space-x-4 mb-8">
          <div className="bg-green-100 p-3 rounded-2xl text-green-600">
            <BarChart3 size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Reconciliation Summary</h2>
            <p className="text-gray-500">Period: {period.month} {period.year}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 overflow-hidden">
          <h3 className="font-bold text-gray-800 mb-6 flex justify-between">
            Units Summary <span className="text-xs text-gray-400">All Units</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">AVVNL bill units (main meter)</span>
              <span className="font-mono font-bold">{mainUnits}</span>
            </div>
            <div className="flex justify-between items-center py-2 text-green-600">
              <span className="flex items-center italic">Less: Solar credited (as per rule) <Info size={12} className="ml-1" /></span>
              <span className="font-mono font-bold">− {solarCredit}</span>
            </div>
            <div className="flex justify-between items-center py-2 text-blue-600">
              <span className="flex items-center italic">Add: DG units billed (company-managed) <Zap size={12} className="ml-1" /></span>
              <span className="font-mono font-bold">+ {dgSum}</span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between items-center py-2 font-black text-gray-900 bg-white px-2 rounded-lg border">
              <span>Net units to allocate to tenants</span>
              <span className="font-mono text-lg">{netToAllocate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 font-medium">Sum of tenant sub-meter units</span>
              <span className="font-mono font-bold text-blue-800">{tenantSum.toFixed(2)}</span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className={`flex justify-between items-center py-2 px-2 rounded-lg ${commonLoss > 100 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
              <span className="font-bold">Common / Loss units (difference)</span>
              <span className="font-mono font-black">{commonLoss.toFixed(2)} ({lossPercentage.toFixed(1)}%)</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Flags / Warnings</h4>
          <div className="space-y-2">
            {tenantSum === 0 && (
              <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                <AlertCircle size={16} />
                <span>Any missing reading? Tenant sum is 0.</span>
              </div>
            )}
            {lossPercentage > 10 && (
              <div className="flex items-center space-x-2 text-amber-600 text-sm bg-amber-50 p-3 rounded-lg border border-amber-100">
                <AlertCircle size={16} />
                <span>Common/Loss beyond tolerance (10%)? Please check sub-meters.</span>
              </div>
            )}
            {period.readings.some(r => r.flag === 'Spike') && (
              <div className="flex items-center space-x-2 text-blue-600 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
                <AlertCircle size={16} />
                <span>Unresolved spikes detected. High billing impact.</span>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handleFinalize}
          disabled={period.status === WorkflowStatus.FINALIZED}
          className={`w-full p-5 rounded-2xl font-black flex items-center justify-center space-x-3 transition-all active:scale-[0.98] ${
            period.status === WorkflowStatus.FINALIZED
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed grayscale'
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100'
          }`}
        >
          <FileCheck size={24} />
          <span className="text-xl">Finalize & Generate Statements</span>
        </button>
      </div>
    </div>
  );
};

export default Reconciliation;
