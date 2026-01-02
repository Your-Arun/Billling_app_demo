
import React from 'react';
import { BillingPeriod, WorkflowStatus, Reading } from '../types';
import { Download, Share2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const Statements: React.FC<{ period: BillingPeriod }> = ({ period }) => {
  const isFinalized = period.status === WorkflowStatus.FINALIZED;

  const getCalculations = (r: Reading) => {
    const difference = r.closing > 0 ? (r.closing - r.opening) : 0;
    const units = difference * r.meterCT;
    const amount = units * r.rate;
    const fixedCharge = r.fixedCharge;
    
    // Manual DG Mapping Logic
    const dgCharge = period.dgSets.reduce((totalDg, dg) => {
      if (dg.units > 0 && dg.mappedTenants?.includes(r.tenantId)) {
        return totalDg + (units * (dg.costPerUnit || 0));
      }
      return totalDg;
    }, 0);

    const isMappedToDG = period.dgSets.some(dg => 
      dg.units > 0 && dg.mappedTenants?.includes(r.tenantId)
    );
    
    // Use the custom transformer loss percentage from the tenant profile
    const transformerLoss = (amount * (r.transformerLossPercentage || 0)) / 100;
    const total = amount + fixedCharge + transformerLoss + dgCharge;

    return { difference, units, amount, fixedCharge, transformerLoss, dgCharge, total, isMappedToDG };
  };

  const totals = period.readings.reduce((acc, r) => {
    const calc = getCalculations(r);
    return {
      units: acc.units + calc.units,
      amount: acc.amount + calc.amount,
      fixed: acc.fixed + calc.fixedCharge,
      loss: acc.loss + calc.transformerLoss,
      dg: acc.dg + calc.dgCharge,
      grand: acc.grand + calc.total
    };
  }, { units: 0, amount: 0, fixed: 0, loss: 0, dg: 0, grand: 0 });

  return (
    <div className="max-w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Master Billing Statement</h2>
          <p className="text-gray-500 font-medium">Utility Reconciliation - {period.month} {period.year}</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-all">
            <Download size={18} />
            <span>Export XLS</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
            <Share2 size={18} />
            <span>Share All</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest text-center">
                <th className="px-4 py-4 text-left border-r border-gray-800">Tenants</th>
                <th className="px-2 py-4 border-r border-gray-800">Opening</th>
                <th className="px-2 py-4 border-r border-gray-800">Closing</th>
                <th className="px-2 py-4 border-r border-gray-800">Diff</th>
                <th className="px-2 py-4 border-r border-gray-800">Meter CT</th>
                <th className="px-2 py-4 border-r border-gray-800 bg-blue-900">Units</th>
                <th className="px-2 py-4 border-r border-gray-800">Rate</th>
                <th className="px-2 py-4 border-r border-gray-800">Amount</th>
                <th className="px-4 py-4 border-r border-gray-800">Load (kW)</th>
                <th className="px-2 py-4 border-r border-gray-800">Fixed Chg</th>
                <th className="px-2 py-4 border-r border-gray-800">Loss %</th>
                <th className="px-2 py-4 border-r border-gray-800">DG Charge</th>
                <th className="px-4 py-4 bg-green-900">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[13px]">
              {period.readings.map((r) => {
                const c = getCalculations(r);
                return (
                  <tr key={r.tenantId} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-4 py-4 font-black text-gray-900 border-r border-gray-50">{r.tenantId}</td>
                    <td className="px-2 py-4 text-center font-mono text-gray-500 border-r border-gray-50">{r.opening}</td>
                    <td className={`px-2 py-4 text-center font-mono font-bold border-r border-gray-50 ${r.closing > 0 || r.isCaptured ? 'text-blue-600' : 'text-red-400 italic'}`}>
                      {r.isCaptured ? r.closing : 'Pending'}
                    </td>
                    <td className="px-2 py-4 text-center font-mono text-gray-500 border-r border-gray-50">{c.difference.toFixed(1)}</td>
                    <td className="px-2 py-4 text-center font-bold text-gray-400 border-r border-gray-50">{r.meterCT}</td>
                    <td className="px-2 py-4 text-center font-black text-blue-900 border-r border-gray-50 bg-blue-50/30">{c.units.toFixed(0)}</td>
                    <td className="px-2 py-4 text-center font-medium text-gray-600 border-r border-gray-50">{r.rate}</td>
                    <td className="px-2 py-4 text-center font-bold text-gray-800 border-r border-gray-50">{c.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-4 text-center text-xs font-bold text-gray-500 border-r border-gray-50">{r.sanctionedLoad}</td>
                    <td className="px-2 py-4 text-center font-medium text-gray-700 border-r border-gray-50">{c.fixedCharge > 0 ? c.fixedCharge.toLocaleString('en-IN') : '-'}</td>
                    <td className="px-2 py-4 text-center font-medium text-amber-700 border-r border-gray-50 italic">
                      {r.transformerLossPercentage > 0 ? `${r.transformerLossPercentage}% (₹${c.transformerLoss.toLocaleString('en-IN', {maximumFractionDigits: 0})})` : '-'}
                    </td>
                    <td className={`px-2 py-4 text-center font-bold border-r border-gray-50 ${c.isMappedToDG ? 'text-indigo-700' : 'text-gray-300'}`}>
                      {c.dgCharge > 0 ? c.dgCharge.toLocaleString('en-IN', {maximumFractionDigits: 0}) : (c.isMappedToDG ? '0' : '-')}
                    </td>
                    <td className="px-4 py-4 text-right font-black text-green-900 bg-green-50/30">{c.total.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
                  </tr>
                );
              })}
              {/* Grand Total Row */}
              <tr className="bg-gray-900 text-white font-black text-[14px]">
                <td className="px-4 py-5 uppercase tracking-widest border-r border-gray-800">Total Payable</td>
                <td colSpan={4} className="border-r border-gray-800"></td>
                <td className="px-2 py-5 text-center bg-blue-800">{totals.units.toFixed(0)}</td>
                <td className="border-r border-gray-800"></td>
                <td className="px-2 py-5 text-center">{totals.amount.toLocaleString('en-IN')}</td>
                <td className="border-r border-gray-800"></td>
                <td className="px-2 py-5 text-center">{totals.fixed.toLocaleString('en-IN')}</td>
                <td className="px-2 py-5 text-center italic">₹ {totals.loss.toLocaleString('en-IN', {maximumFractionDigits: 0})} (Loss)</td>
                <td className="px-2 py-5 text-center">{totals.dg.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
                <td className="px-4 py-5 text-right bg-green-700">₹ {totals.grand.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Statements;
