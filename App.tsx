
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Sun, 
  Zap, 
  Receipt, 
  FileCheck, 
  PieChart, 
  Settings,
  Menu,
  X,
  XCircle,
  History,
  Users,
  UserCircle,
  ShieldCheck,
  LogOut,
  Activity
} from 'lucide-react';

import Dashboard from './screens/Dashboard';
import ReadingEntry from './screens/ReadingEntry';
import ReadingsTable from './screens/ReadingsTable';
import Approval from './screens/Approval';
import SolarEntry from './screens/SolarEntry';
import DGEntry from './screens/DGEntry';
import BillEntry from './screens/BillEntry';
import Reconciliation from './screens/Reconciliation';
import Statements from './screens/Statements';
import TenantManagement from './screens/TenantManagement';
import { WorkflowStatus, BillingPeriod, Reading, UserRole } from './types';

// Feedback Utility
export const useFeedback = () => {
  const playClick = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(10);
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  const playSuccess = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }, []);

  const playChime = useCallback(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.4);
    });
  }, []);

  return { playClick, playSuccess, playChime };
};

const INITIAL_TENANTS: Partial<Reading>[] = [
  { tenantId: 'Croma', meterId: 'M-CRO', opening: 0, meterCT: 30, rate: 10.2, sanctionedLoad: '140-150', fixedCharge: 14945, transformerLossPercentage: 4, hasDGCharge: false },
  { tenantId: 'Mr.Diy', meterId: 'M-DIY', opening: 0, meterCT: 60, rate: 10.2, sanctionedLoad: '50', fixedCharge: 14945, transformerLossPercentage: 0, hasDGCharge: false },
  { tenantId: 'Reliance', meterId: 'M-REL', opening: 0, meterCT: 20, rate: 10.2, sanctionedLoad: '75', fixedCharge: 14945, transformerLossPercentage: 4, hasDGCharge: true },
  { tenantId: 'Zudio', meterId: 'M-ZUD', opening: 0, meterCT: 30, rate: 10.2, sanctionedLoad: '1.5 kva/sqm', fixedCharge: 40670, transformerLossPercentage: 0, hasDGCharge: true },
  { tenantId: 'Zori', meterId: 'M-ZOR', opening: 0, meterCT: 1, rate: 12.0, sanctionedLoad: '-', fixedCharge: 0, transformerLossPercentage: 0, hasDGCharge: true },
  { tenantId: 'L.G.', meterId: 'M-LG', opening: 0, meterCT: 1, rate: 12.0, sanctionedLoad: '-', fixedCharge: 0, transformerLossPercentage: 0, hasDGCharge: true },
  { tenantId: 'Bellavita', meterId: 'M-BEL', opening: 0, meterCT: 1, rate: 12.0, sanctionedLoad: '-', fixedCharge: 0, transformerLossPercentage: 0, hasDGCharge: true },
];

const INITIAL_PERIOD: BillingPeriod = {
  month: 'January',
  year: 2025,
  status: WorkflowStatus.DRAFT,
  readings: INITIAL_TENANTS.map(t => ({
    tenantId: t.tenantId!,
    meterId: t.meterId!,
    opening: 0,
    closing: 0,
    units: 0,
    meterCT: t.meterCT || 1,
    rate: t.rate || 10.2,
    sanctionedLoad: t.sanctionedLoad || '-',
    fixedCharge: t.fixedCharge || 0,
    transformerLossPercentage: t.transformerLossPercentage || 0,
    hasDGCharge: t.hasDGCharge || false,
    isCaptured: false,
    flag: 'Normal'
  })),
  solar: { unitsGenerated: 0, allocationMethod: 'CommonFirst' },
  dgSets: [
    { id: 'DG Set 1', units: 0, fuelCost: 0, costPerUnit: 1, mappedTenants: [] },
    { id: 'DG Set 2', units: 0, fuelCost: 0, costPerUnit: 1, mappedTenants: [] },
    { id: 'DG Set 3', units: 0, fuelCost: 0, costPerUnit: 1, mappedTenants: [] }
  ],
  bill: { totalUnits: 0, energyCharges: 0, fixedCharges: 0, taxes: 0, uploaded: false }
};

const SidebarItem = ({ icon: Icon, label, path, active, onClick, badge }: { icon: any, label: string, path: string, active: boolean, onClick: () => void, badge?: boolean }) => (
  <Link 
    to={path} 
    onClick={onClick}
    className={`flex items-center justify-between p-3 rounded-lg transition-all active:scale-95 ${
      active ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    <div className="flex items-center space-x-3">
      <Icon size={20} />
      <span className="font-medium text-sm">{label}</span>
    </div>
    {badge && <div className="w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />}
  </Link>
);

const AppContent = () => {
  const { playClick, playSuccess } = useFeedback();
  const [role, setRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('electra_user_role');
    return (savedRole as UserRole) || UserRole.ADMIN;
  });

  const [period, setPeriod] = useState<BillingPeriod>(() => {
    const saved = localStorage.getItem('electra_billing_state');
    return saved ? JSON.parse(saved) : INITIAL_PERIOD;
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('electra_billing_state', JSON.stringify(period));
  }, [period]);

  useEffect(() => {
    localStorage.setItem('electra_user_role', role);
  }, [role]);

  const toggleSidebar = () => {
    playClick();
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    playSuccess();
    setRole(newRole);
    navigate('/');
    setIsSidebarOpen(false);
  };

  const startNextMonth = () => {
    if (role !== UserRole.ADMIN) return;
    playSuccess();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentIndex = months.indexOf(period.month);
    const nextMonth = months[(currentIndex + 1) % 12];
    const nextYear = nextMonth === "January" ? period.year + 1 : period.year;

    const nextReadings = period.readings.map(r => ({
      ...r,
      opening: r.isCaptured ? r.closing : r.opening, 
      closing: 0,
      units: 0,
      isCaptured: false,
      flag: 'Normal' as const,
      remarks: '',
      photo: undefined
    }));

    setPeriod({
      ...INITIAL_PERIOD,
      month: nextMonth,
      year: nextYear,
      status: WorkflowStatus.DRAFT,
      readings: nextReadings
    });
  };

  const isApprovalPending = period.status === WorkflowStatus.SUBMITTED;

  return (
    <div className="flex h-screen overflow-hidden">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={toggleSidebar} />}
      
      {/* Dynamic Sidebar based on Role */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r z-30 transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b flex flex-col">
          <h1 className="text-xl font-bold text-blue-800 tracking-tight">ElectraBill</h1>
          <div className={`mt-2 inline-flex items-center space-x-2 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${role === UserRole.ADMIN ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
            {role === UserRole.ADMIN ? <ShieldCheck size={12} /> : <UserCircle size={12} />}
            <span>{role}</span>
          </div>
        </div>
        
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-160px)]">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/" active={location.pathname === '/'} onClick={playClick} />
          
          <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {role === UserRole.ADMIN ? 'Monitoring & Ops' : 'Field Tasks'}
          </div>
          
          <SidebarItem 
            icon={role === UserRole.ADMIN ? Activity : ClipboardCheck} 
            label={role === UserRole.ADMIN ? 'Field Progress' : 'Capture Readings'} 
            path="/readings" 
            active={location.pathname === '/readings'} 
            onClick={playClick} 
          />
          
          {role === UserRole.ADMIN && (
            <>
              <SidebarItem 
                icon={FileCheck} 
                label="Approval Workflow" 
                path="/approval" 
                active={location.pathname === '/approval'} 
                onClick={playClick} 
                badge={isApprovalPending}
              />
              <SidebarItem icon={PieChart} label="Reconciliation" path="/reconciliation" active={location.pathname === '/reconciliation'} onClick={playClick} />
              
              <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Utility Inputs</div>
              <SidebarItem icon={Sun} label="Solar Gen" path="/solar" active={location.pathname === '/solar'} onClick={playClick} />
              <SidebarItem icon={Zap} label="DG Back-up" path="/dg" active={location.pathname === '/dg'} onClick={playClick} />
              <SidebarItem icon={Receipt} label="Main AVVNL Bill" path="/bill" active={location.pathname === '/bill'} onClick={playClick} />

              <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Master Data</div>
              <SidebarItem icon={Users} label="Manage Tenants" path="/manage-tenants" active={location.pathname === '/manage-tenants'} onClick={playClick} />
              <SidebarItem icon={Settings} label="Master Statements" path="/statements" active={location.pathname === '/statements'} onClick={playClick} />
            </>
          )}
        </nav>

        {/* Role Quick-Switcher for Demo */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <button 
            onClick={() => handleRoleSwitch(role === UserRole.ADMIN ? UserRole.READING_TAKER : UserRole.ADMIN)}
            className="w-full flex items-center justify-center space-x-2 p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all active:scale-95"
          >
            <LogOut size={14} />
            <span>Switch to {role === UserRole.ADMIN ? 'Reading Taker' : 'Admin'}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-gray-50">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-8 shadow-sm z-10">
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-gray-100 rounded active:scale-90 transition-transform mr-2">
              <Menu size={24} />
            </button>
            <div className="font-bold text-gray-800 truncate">
              {period.month} {period.year} <span className="hidden sm:inline text-gray-400 font-medium">Cycle</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
             <div className="hidden md:block text-right mr-2">
                <p className="text-[10px] font-black uppercase text-gray-400 leading-none">Logged in as</p>
                <p className="text-xs font-bold text-gray-700">{role}</p>
             </div>
             <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${
               period.status === WorkflowStatus.FINALIZED ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'
             }`}>
              {period.status}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard period={period} startNextMonth={startNextMonth} role={role} />} />
            <Route path="/readings" element={<ReadingsTable period={period} setPeriod={setPeriod} role={role} />} />
            <Route path="/readings/entry/:tenantId" element={<ReadingEntry period={period} setPeriod={setPeriod} />} />
            
            {/* Admin Protected Routes */}
            {role === UserRole.ADMIN && (
              <>
                <Route path="/solar" element={<SolarEntry period={period} setPeriod={setPeriod} />} />
                <Route path="/dg" element={<DGEntry period={period} setPeriod={setPeriod} />} />
                <Route path="/bill" element={<BillEntry period={period} setPeriod={setPeriod} />} />
                <Route path="/approval" element={<Approval period={period} setPeriod={setPeriod} />} />
                <Route path="/reconciliation" element={<Reconciliation period={period} setPeriod={setPeriod} />} />
                <Route path="/statements" element={<Statements period={period} />} />
                <Route path="/manage-tenants" element={<TenantManagement period={period} setPeriod={setPeriod} />} />
              </>
            )}
            
            {/* Fallback for unauthorized access */}
            <Route path="*" element={<div className="flex flex-col items-center justify-center h-full text-center p-8">
              <XCircle className="text-red-500 mb-4" size={48} />
              <h2 className="text-2xl font-bold">Access Denied</h2>
              <p className="text-gray-500 mt-2">You don't have permission to view this page with your current role.</p>
              <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Back to Dashboard</button>
            </div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App = () => (
  <HashRouter>
    <AppContent />
  </HashRouter>
);

export default App;
