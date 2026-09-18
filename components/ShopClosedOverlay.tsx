
import React from 'react';
import { AlertCircle, Lock, Settings as SettingsIcon, LogOut } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { User, UserRole, ShowroomSettings } from '../types';

interface ShopClosedOverlayProps {
  settings: ShowroomSettings;
  user: User;
  onLogout: () => void;
  onBypass: () => void;
}

const ShopClosedOverlay: React.FC<ShopClosedOverlayProps> = ({ settings, user, onLogout, onBypass }) => {
  const isAdmin = user.role === UserRole.ADMIN;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
      <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl shadow-rose-500/20 border border-white/20 overflow-hidden animate-in zoom-in duration-500">
        <div className="bg-rose-600 p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-black rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center text-white mb-8 shadow-inner border border-white/30">
              <Lock size={48} className="animate-pulse" />
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
              Shop Operations <br /> Suspended
            </h1>
            <p className="text-rose-100 font-bold text-sm max-w-md mx-auto leading-relaxed">
              The shop is CLOSED. Please do it in next working hours. 
              All digital operations, billing, and inventory management are temporarily locked.
            </p>
          </div>
        </div>

        <div className="p-12 text-center space-y-10">
          <div className="flex flex-col items-center gap-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Estimated Reopening</p>
            <div className="scale-150 transform origin-center">
              <CountdownTimer closedAt={settings.closedAt || ''} />
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full"></div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-500 italic">
              "Efficiency is doing things right; effectiveness is doing the right things."
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button
                onClick={onLogout}
                className="flex items-center gap-3 px-8 py-4 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
              >
                <LogOut size={16} />
                Logout Session
              </button>

              {isAdmin && (
                <button
                  onClick={onBypass}
                  className="flex items-center gap-3 px-8 py-4 bg-hw-accent text-white hover:opacity-90 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-hw-accent/20 active:scale-95"
                >
                  <SettingsIcon size={16} />
                  Admin Control Panel
                </button>
              )}
            </div>
          </div>

          {!isAdmin && (
            <div className="flex items-center justify-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <AlertCircle size={12} className="text-rose-500" />
              <span>Contact Administrator for Emergency Access</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopClosedOverlay;
