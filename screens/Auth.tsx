
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight, Loader2, Key } from 'lucide-react';

interface AuthProps {
  onLogin: (u: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyCodeInput, setCompanyCodeInput] = useState('');

  const generateCompanyCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate Network/DB Call
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (isLogin) {
      // Mock Login logic
      const mockUser: User = {
        id: 'u-' + Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0],
        email,
        role: email.includes('staff') ? UserRole.READING_TAKER : UserRole.ADMIN,
        companyCode: '123456' // In real app, this comes from MongoDB
      };
      onLogin(mockUser);
    } else {
      // Signup logic
      const code = role === UserRole.ADMIN ? generateCompanyCode() : companyCodeInput;
      
      if (role === UserRole.READING_TAKER && !companyCodeInput) {
        alert("Staff signup ke liye Admin ka Company Code chahiye!");
        setLoading(false);
        return;
      }

      const newUser: User = {
        id: 'u-' + Math.random().toString(36).substr(2, 9),
        name,
        email,
        role,
        companyCode: code
      };
      onLogin(newUser);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="p-8 text-center bg-gray-50 border-b border-gray-100">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-blue-200">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">ElectraBill</h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Property Utility Management</p>
        </div>

        <div className="p-8">
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>Login</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>Signup</button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div className="flex bg-gray-50 p-1 rounded-xl border mb-4">
                  <button type="button" onClick={() => setRole(UserRole.ADMIN)} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${role === UserRole.ADMIN ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Admin</button>
                  <button type="button" onClick={() => setRole(UserRole.READING_TAKER)} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${role === UserRole.READING_TAKER ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Staff</button>
                </div>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input required value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Full Name" className="w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input required value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input required value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>

            {!isLogin && role === UserRole.READING_TAKER && (
              <div className="relative animate-in slide-in-from-top-2">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                <input required value={companyCodeInput} onChange={e => setCompanyCodeInput(e.target.value)} type="text" placeholder="6-Digit Company Code" className="w-full pl-12 pr-4 py-4 bg-blue-50 border-2 border-blue-100 rounded-2xl font-black text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            )}

            <button disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center space-x-2">
              {loading ? <Loader2 size={20} className="animate-spin" /> : (
                <>
                  <span>{isLogin ? 'Login Now' : 'Create Account'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {isLogin && (
            <p className="text-center text-[10px] text-gray-400 font-bold mt-6 uppercase tracking-widest cursor-pointer hover:text-blue-600">
              Forgot Password?
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
