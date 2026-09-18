
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { Shield, UserPlus, Trash2, X, Lock, Check, Edit2, LayoutDashboard, Truck, FileText, Users, ClipboardList, PieChart, History, Settings, Eye, EyeOff, Info, CheckSquare, Square, RotateCcw, Undo2 } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onAddUser: (userData: Omit<User, 'id'>) => void;
  onUpdateUser: (userData: User) => void;
  onDeleteUser: (id: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    role: UserRole.STAFF,
    password: '',
    mobileNumber: '',
    permissions: ['dashboard', 'inventory', 'billing', 'customers']
  });

  const modules = [
    { id: 'dashboard', label: 'Home Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Fleet Inventory', icon: Truck },
    { id: 'billing', label: 'Sales & Billing', icon: FileText },
    { id: 'customers', label: 'Enquiry Pipeline', icon: Users },
    { id: 'return-request', label: 'Return Requests', icon: RotateCcw },
    { id: 'sales-return', label: 'Sales Returns (Admin)', icon: Undo2 },
    { id: 'models', label: 'Tractor Catalog', icon: ClipboardList },
    { id: 'reports', label: 'Performance Analytics', icon: PieChart },
    { id: 'logs', label: 'System Security Logs', icon: History },
    { id: 'users', label: 'Team Settings', icon: UserCircleIcon },
    { id: 'settings', label: 'Business Configurations', icon: Settings },
  ];

  // Helper because Lucide Icons can sometimes conflict
  function UserCircleIcon(props: any) { return <Users {...props} /> }

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ 
      fullName: '', 
      username: '', 
      role: UserRole.STAFF, 
      password: 'admin123',
      mobileNumber: '',
      permissions: ['dashboard', 'inventory', 'billing', 'customers'] 
    });
    setShowModal(true);
  };
 
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ 
      fullName: user.fullName, 
      username: user.username, 
      role: user.role, 
      password: user.password || 'admin123',
      mobileNumber: user.mobileNumber || '',
      permissions: user.permissions || []
    });
    setShowModal(true);
  };

  const handleRoleChange = (role: UserRole) => {
    const defaultPermissions = role === UserRole.ADMIN 
      ? modules.map(m => m.id)
      : ['dashboard', 'inventory', 'billing', 'customers'];
    
    setFormData({ ...formData, role, permissions: defaultPermissions });
  };

  const togglePermission = (id: string) => {
    const newPermissions = formData.permissions.includes(id)
      ? formData.permissions.filter(p => p !== id)
      : [...formData.permissions, id];
    setFormData({ ...formData, permissions: newPermissions });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUser({ ...editingUser, ...formData });
    } else {
      onAddUser(formData);
    }
    setShowModal(false);
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === UserRole.ADMIN).length,
    staff: users.filter(u => u.role === UserRole.STAFF).length,
    totalPermissions: users.reduce((acc, u) => acc + (u.permissions?.length || 0), 0)
  };

  return (
    <div className="space-y-10 pb-20">
      {/* ERP Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-hw-accent text-white text-[10px] font-mono font-bold uppercase tracking-widest">
              IDENTITY_MANAGEMENT_V4
            </span>
            <span className="hw-label">
              Team Access & Security Control
            </span>
          </div>
          <h1 className="text-5xl font-display font-bold text-hw-text tracking-tighter uppercase">
            User Management
          </h1>
          <p className="text-hw-muted font-mono text-sm">Manage showroom staff and granular access levels.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="hw-btn-primary px-10 py-5 flex items-center gap-3 group"
        >
          <UserPlus size={20} className="group-hover:scale-110 transition-transform" /> New User Account
        </button>
      </div>

      {/* Team Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-hw-surface border border-hw-border p-6">
          <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-1">Total Team</p>
          <p className="text-3xl font-display font-bold text-hw-text">{stats.total}</p>
        </div>
        <div className="bg-hw-surface border border-hw-border p-6">
          <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-1">Administrators</p>
          <p className="text-3xl font-display font-bold text-hw-accent">{stats.admins}</p>
        </div>
        <div className="bg-hw-surface border border-hw-border p-6">
          <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-1">Standard Staff</p>
          <p className="text-3xl font-display font-bold text-hw-text">{stats.staff}</p>
        </div>
        <div className="bg-hw-surface border border-hw-border p-6">
          <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-1">Active Nodes</p>
          <p className="text-3xl font-display font-bold text-hw-text">{stats.totalPermissions}</p>
        </div>
      </div>

      <div className="bg-hw-surface border border-hw-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-hw-text font-mono">
            <thead className="bg-hw-bg text-[10px] font-bold uppercase text-hw-muted border-b border-hw-border">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Access Modules</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hw-border text-xs">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-hw-bg transition-colors group">
                  <td className="px-6 py-6 font-bold text-hw-text border-r border-hw-border/50">{u.fullName}</td>
                  <td className="px-6 py-6 text-hw-muted border-r border-hw-border/50">@{u.username}</td>
                  <td className="px-6 py-6 border-r border-hw-border/50">
                    <span className={`inline-flex items-center gap-1.5 font-bold ${u.role === UserRole.ADMIN ? 'text-hw-accent' : 'text-hw-muted'}`}>
                      <Shield size={14} />
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-6 border-r border-hw-border/50">
                    <div className="flex gap-1 flex-wrap">
                        {u.permissions?.slice(0, 4).map(p => (
                            <span key={p} className="px-2 py-0.5 bg-hw-bg text-[8px] font-bold uppercase border border-hw-border text-hw-muted">{p}</span>
                        ))}
                        {(u.permissions?.length || 0) > 4 && <span className="text-[8px] font-bold text-hw-muted">+{u.permissions.length - 4} more</span>}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenEdit(u)}
                        className="p-2 text-hw-text hover:bg-hw-accent hover:text-white border border-hw-border transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onDeleteUser(u.id)}
                        className="p-2 text-hw-accent hover:bg-hw-accent hover:text-white border border-hw-border transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex flex-col no-print bg-hw-bg overflow-hidden animate-scale-in">
          <div className="px-6 sm:px-10 py-8 border-b border-hw-border flex justify-between items-center bg-hw-surface shrink-0">
            <div className="flex items-center gap-6">
                <div className="p-4 bg-hw-accent text-white border border-hw-border">
                  <Users size={32} />
                </div>
                <div>
                    <h2 className="text-xl sm:text-3xl font-display font-bold text-hw-text uppercase tracking-tighter">
                    {editingUser ? 'Account Maintenance' : 'Induct Team Member'}
                    </h2>
                    <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest mt-1">Identity & Access Management Node</p>
                </div>
            </div>
            <button onClick={() => setShowModal(false)} className="text-hw-muted hover:text-hw-accent transition-all p-3 border border-hw-border hover:bg-hw-bg active:scale-95">
              <X size={32} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 sm:p-12 custom-scrollbar bg-hw-bg">
            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Identity Side */}
              <div className="space-y-8">
                <h3 className="text-xs font-mono font-bold uppercase text-hw-accent tracking-[0.2em] flex items-center gap-2 mb-4">
                    <Shield size={14} /> Identity Details
                </h3>
                
                <div className="space-y-2">
                    <label className="hw-label">Full Legal Name</label>
                    <input 
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-6 py-4 bg-hw-surface border border-hw-border text-hw-text font-mono font-bold text-xs outline-none focus:border-hw-accent transition-all"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                </div>

                <div className="space-y-2">
                    <label className="hw-label">Registered Mobile Number {formData.role === UserRole.ADMIN ? '(Required for Admin OTP)' : '(Optional)'}</label>
                    <input 
                    type="text"
                    required={formData.role === UserRole.ADMIN}
                    placeholder="e.g. 9098832111"
                    className="w-full px-6 py-4 bg-hw-surface border border-hw-border text-hw-text font-mono font-bold text-xs outline-none focus:border-hw-accent transition-all"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({...formData, mobileNumber: e.target.value.replace(/[^0-9+]/g, '')})}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="hw-label">Login Alias</label>
                        <input 
                        type="text"
                        required
                        placeholder="username"
                        className="w-full px-6 py-4 bg-hw-surface border border-hw-border font-mono text-xs font-bold text-hw-accent lowercase outline-none focus:border-hw-accent"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="hw-label">Access Key</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-hw-muted" size={16} />
                            <input 
                            type="password"
                            required
                            placeholder="passcode"
                            className="w-full pl-12 pr-6 py-4 bg-hw-surface border border-hw-border text-hw-text font-mono text-xs font-bold outline-none focus:border-hw-accent"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-8 border-t border-hw-border">
                    <label className="hw-label">Security Access Protocol</label>
                    <div className="grid grid-cols-2 gap-4">
                        {[UserRole.STAFF, UserRole.ADMIN].map(role => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => handleRoleChange(role)}
                                className={`px-6 py-6 border transition-all font-mono font-bold text-[10px] uppercase tracking-widest text-center ${
                                    formData.role === role 
                                    ? 'bg-hw-accent border-hw-accent text-white shadow-xl' 
                                    : 'bg-hw-surface border-hw-border text-hw-muted hover:border-hw-accent hover:text-hw-accent'
                                }`}
                            >
                                {role === UserRole.ADMIN ? 'Full Administrator' : 'Standard Staff Access'}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    type="submit"
                    className="hw-btn-primary w-full py-6 mt-10"
                >
                  <Check size={20} /> {editingUser ? 'Update Profile' : 'Commit Induction'}
                </button>
              </div>

              {/* Tick Mark Side */}
              <div className="bg-hw-surface p-10 border border-hw-border relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xs font-mono font-bold uppercase text-hw-text tracking-[0.2em] flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-hw-accent"></div>
                        Assign Permissions (Tick Marks)
                    </h3>
                    
                    <div className="space-y-3">
                        {modules.map((m, i) => {
                            const isTicked = formData.permissions.includes(m.id);
                            return (
                                <div 
                                    key={m.id} 
                                    onClick={() => togglePermission(m.id)}
                                    className={`flex items-center justify-between p-5 border transition-all duration-300 cursor-pointer ${
                                        isTicked 
                                        ? 'bg-hw-bg border-hw-accent shadow-md translate-x-1' 
                                        : 'bg-hw-surface border-hw-border opacity-60'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 transition-colors ${isTicked ? 'bg-hw-accent text-white' : 'bg-hw-bg text-hw-muted border border-hw-border'}`}>
                                            <m.icon size={18} />
                                        </div>
                                        <div>
                                            <span className={`text-[11px] font-mono font-bold uppercase tracking-tight ${isTicked ? 'text-hw-text' : 'text-hw-muted'}`}>{m.label}</span>
                                            <p className={`text-[8px] font-mono font-bold uppercase tracking-widest ${isTicked ? 'text-hw-accent' : 'text-hw-muted'}`}>
                                                {isTicked ? 'Access Granted' : 'Restricted Module'}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        {isTicked ? (
                                            <div className="w-7 h-7 bg-hw-accent flex items-center justify-center text-white shadow-lg">
                                                <Check size={16} strokeWidth={4} />
                                            </div>
                                        ) : (
                                            <div className="w-7 h-7 border border-hw-border flex items-center justify-center text-hw-muted">
                                                <Square size={14} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-10 p-6 bg-hw-bg border border-hw-border">
                        <div className="flex items-start gap-4">
                            <Info size={16} className="text-hw-accent mt-0.5" />
                            <p className="text-[10px] font-mono font-bold text-hw-muted leading-relaxed italic uppercase">
                                Use the tick marks above to precisely control which system modules {formData.fullName || 'this user'} can access. Changes will take effect upon their next session login.
                            </p>
                        </div>
                    </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
