import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, User as UserIcon, ArrowRight, Zap, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { User, UserRole, ShowroomSettings } from '../types';
import { StorageService } from '../services/storage';

interface LoginProps {
  onLogin: (user: User) => void;
  settings: ShowroomSettings;
}

const Login: React.FC<LoginProps> = ({ onLogin, settings }) => {
  // Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');

  const generateCaptcha = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptcha(code);
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (captchaInput !== captcha) {
      setLoginError('Invalid CAPTCHA code. Please try again.');
      generateCaptcha();
      return;
    }

    const users = StorageService.getUsers();
    const user = users.find(u => u.username === loginUsername.toLowerCase());
    const validPassword = user?.password || 'admin123';
    
    if (user && loginPassword === validPassword) {
      onLogin(user);
    } else {
      setLoginError('Invalid system credentials. Please verify.');
      generateCaptcha();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-hw-accent/10 blur-[150px] rounded-full -mr-96 -mt-96 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-hw-accent/10 blur-[150px] rounded-full -ml-72 -mb-72"></div>

      <div className="relative z-10 w-full max-w-[500px]">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center p-4 mx-auto mb-6 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <img src={settings.logoUrl} className="w-full h-full object-contain" alt="Logo" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">{settings.name}</h1>
          <p className="text-slate-500 mt-3 font-black text-[10px] uppercase tracking-[0.5em] flex items-center justify-center gap-2">
            <Zap size={10} className="text-hw-accent" /> Enterprise Showroom Terminal
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/5 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">System Access</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Enter your credentials to authenticate</p>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-hw-accent transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Username" 
                    required
                    className="w-full pl-14 pr-6 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white text-sm outline-none focus:border-hw-accent focus:ring-4 focus:ring-hw-accent/10 transition-all font-bold"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-hw-accent transition-colors" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    required
                    className="w-full pl-14 pr-14 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white text-sm outline-none focus:border-hw-accent focus:ring-4 focus:ring-hw-accent/10 transition-all font-bold"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-hw-accent transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                <div className="flex items-center justify-end px-2">
                  <a href="#" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Forgot Password?</a>
                </div>
                
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="CAPTCHA" 
                    required
                    className="flex-1 px-6 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white text-sm outline-none focus:border-hw-accent focus:ring-4 focus:ring-hw-accent/10 transition-all font-bold text-center tracking-[0.4em]"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                  />
                  <div className="bg-slate-950/50 border border-slate-800 rounded-2xl px-6 flex items-center gap-3">
                    <span className="text-lg font-black text-hw-accent italic select-none">{captcha}</span>
                    <button type="button" onClick={generateCaptcha} className="text-slate-600 hover:text-hw-accent transition-colors">
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {loginError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black rounded-2xl flex items-center gap-3 uppercase">
                  <ShieldCheck size={16} />
                  {loginError}
                </div>
              )}
 
              <button 
                type="submit" 
                className="w-full py-5 bg-hw-accent hover:bg-hw-accent/80 text-white font-black rounded-2xl shadow-2xl shadow-hw-accent/30 transition-all active:scale-95 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
              >
                Authenticate & Enter Terminal <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest italic">Authorized Personnel Access Only</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center z-10">
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">© 2025 {settings.name} Enterprise Resource Platform</p>
        </div>
      </div>
  );
};

export default Login;