
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
  Users,
  UserCircle,
  ShieldCheck,
  LogOut,
  Cloud,
  RefreshCcw
} from 'lucide-react';

import Auth from './screens/Auth';
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
import { WorkflowStatus, BillingPeriod, Reading, UserRole, User } from './types';

// Sync Context to handle global user and cloud state
interface SyncContextType {
  syncStatus: 'idle' | 'syncing' | 'done' | 'error';
  triggerFetch: () => Promise<void>;
  triggerPush: (customPeriod?: BillingPeriod) => Promise<void>;
  user: User | null;
  logout: () => void;
}
export const SyncContext = createContext<SyncContextType | null>(null);

export const useFeedback = () => {
  const playClick = useCallback(() => {}, []);
  const playSuccess = useCallback(() => {}, []);
  return { playClick, playSuccess };
};

const INITIAL_TENANTS: Partial<Reading>[] = [
  { tenantId: 'Croma', meterId: 'M-CRO', opening: 0, meterCT: 30, rate: 10.2, sanctionedLoad: '140-150', fixedCharge: 14945, transformerLossPercentage: 4, hasDGCharge: false },
  { tenantId: 'Mr.Diy', meterId: 'M-DIY', opening: 0, meterCT: 60, rate: 10.2, sanctionedLoad: '50', fixedCharge: 14945, transformerLossPercentage: 0, hasDGCharge: false },
  { tenantId: 'Reliance', meterId: 'M-REL', opening: 0, meterCT: 20, rate: 10.2, sanctionedLoad: '75', fixedCharge: 14945, transformerLossPercentage: 4, hasDGCharge: true },
  { tenantId: 'Zudio', meterId: 'M-ZUD', opening: 0, meterCT: 30, rate: 10.2, sanctionedLoad: '1.5 kva/sqm', fixedCharge: 40670, transformerLossPercentage: 0, hasDGCharge: true },
];

const GET_INITIAL_PERIOD = (companyCode: string): BillingPeriod => ({
  month: 'January',
  year: 2025,
  status: WorkflowStatus.DRAFT,
  companyCode,
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
    { id: 'DG Set 2', units: 0, fuelCost: 0, costPerUnit: 1, mappedTenants: [] }
  ],
  bill: { totalUnits: 0, energyCharges: 0, fixedCharges: 0, taxes: 0, uploaded: false },
  dbConfig: { apiUrl: 'https://api.example.com/v1/electrabill', apiKey: 'MOCK_KEY' }
});

const AppContent = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('eb_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [period, setPeriod] = useState<BillingPeriod>(() => {
    const saved = localStorage.getItem(`eb_state_${user?.companyCode || 'guest'}`);
    return saved ? JSON.parse(saved) : GET_INITIAL_PERIOD(user?.companyCode || 'DEFAULT');
  });
  
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle');
  const location = useLocation();
  const navigate = useNavigate();

  const triggerFetch = useCallback(async () => {
    if (!user || !period.dbConfig?.apiUrl) return;
    setSyncStatus('syncing');
    try {
      // In real scenario, fetch from MongoDB using company code
      const res = await fetch(`${period.dbConfig.apiUrl}?companyCode=${user.companyCode}`, {
        headers: { 'x-api-key': period.dbConfig.apiKey }
      });
      if (res.ok) {
        const data = await res.json();
        if (data) setPeriod(data);
        setSyncStatus('done');
      } else { setSyncStatus('error'); }
    } catch (e) { setSyncStatus('error'); }
  }, [user, period.dbConfig]);

  const triggerPush = useCallback(async (customPeriod?: BillingPeriod) => {
    if (!user || !period.dbConfig?.apiUrl) return;
    const dataToPush = customPeriod || period;
    setSyncStatus('syncing');
    try {
      const res = await fetch(period.dbConfig.apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': period.dbConfig.apiKey,
          'x-company-code': user.companyCode
        },
        body: JSON.stringify(dataToPush)
      });
      if (res.ok) setSyncStatus('done');
      else setSyncStatus('error');
    } catch (e) { setSyncStatus('error'); }
  }, [user, period]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('eb_user', JSON.stringify(user));
      localStorage.setItem(`eb_state_${user.companyCode}`, JSON.stringify(period));
    } else {
      localStorage.removeItem('eb_user');
    }
  }, [user, period]);

  const logout = () => {
    if (window.confirm("Logout karein?")) {
      setUser(null);
      navigate('/');
    }
  };

  if (!user) return <Auth onLogin={setUser} />;

  const navItems = [
    { label: 'Home', icon: LayoutDashboard, path: '/' },
    { label: 'Readings', icon: ClipboardCheck, path: '/readings' },
    ...(user.role === UserRole.ADMIN ? [
      { label: 'Approval', icon: FileCheck, path: '/approval', badge: period.status === WorkflowStatus.SUBMITTED },
      { label: 'Tenants', icon: Users, path: '/manage-tenants' }
    ] : [])
  ];

  return (
    <SyncContext.Provider value={{ syncStatus, triggerFetch, triggerPush, user, logout }}>
      <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r">
          <div className="p-6 border-b bg-gray-50/50">
            <h1 className="text-xl font-black text-blue-900 tracking-tight italic">ElectraBill</h1>
            <div className="mt-3 flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${user.role === UserRole.ADMIN ? 'bg-purple-500' : 'bg-green-500'}`}></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{user.role}</span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map(item => (
              <Link key={item.path} to={item.path} className={`flex items-center justify-between p-3 rounded-2xl transition-all ${location.pathname === item.path ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}>
                <div className="flex items-center space-x-3">
                  <item.icon size={20} />
                  <span className="font-bold text-sm">{item.label}</span>
                </div>
                {item.badge && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t space-y-3">
            <div className="px-4 py-3 bg-gray-100 rounded-2xl">
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Logged in</p>
               <p className="text-xs font-black text-gray-800 truncate">{user.name}</p>
            </div>
            <button onClick={logout} className="w-full flex items-center justify-center space-x-2 p-3 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
          <header className="h-14 lg:h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-6 sticky top-0 z-20">
            <div className="font-black text-gray-900 truncate">{period.month} {period.year}</div>
            <div className="flex items-center space-x-3">
               <button onClick={triggerFetch} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                 {syncStatus === 'syncing' ? <RefreshCcw size={18} className="animate-spin" /> : <Cloud size={18} className={syncStatus === 'done' ? 'text-green-500' : ''} />}
               </button>
               <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[9px] font-black uppercase tracking-widest">{period.status}</span>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard period={period} startNextMonth={() => {}} role={user.role} user={user} />} />
              <Route path="/readings" element={<ReadingsTable period={period} setPeriod={setPeriod} role={user.role} />} />
              <Route path="/readings/entry/:tenantId" element={<ReadingEntry period={period} setPeriod={setPeriod} />} />
              {user.role === UserRole.ADMIN && (
                <>
                  <Route path="/approval" element={<Approval period={period} setPeriod={setPeriod} />} />
                  <Route path="/reconciliation" element={<Reconciliation period={period} setPeriod={setPeriod} />} />
                  <Route path="/statements" element={<Statements period={period} />} />
                  <Route path="/manage-tenants" element={<TenantManagement period={period} setPeriod={setPeriod} />} />
                </>
              )}
            </Routes>
          </div>

          <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around z-50 shadow-lg px-2">
            {navItems.map(item => (
              <Link key={item.path} to={item.path} className={`flex flex-col items-center space-y-1 relative ${location.pathname === item.path ? 'text-blue-600' : 'text-gray-400'}`}>
                <item.icon size={22} />
                <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                {item.badge && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />}
              </Link>
            ))}
            <button onClick={logout} className="flex flex-col items-center space-y-1 text-red-400">
              <LogOut size={22} />
              <span className="text-[9px] font-black uppercase tracking-widest">Exit</span>
            </button>
          </nav>
        </main>
      </div>
    </SyncContext.Provider>
  );
};

const App = () => (
  <HashRouter>
    <AppContent />
  </HashRouter>
);

export default App;
