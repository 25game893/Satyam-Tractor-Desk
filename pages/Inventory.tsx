
import React, { useState } from 'react';
import { 
  Plus, Search, Edit3, Trash2, Truck, X, Power, 
  Package, Palette, Filter, CheckCircle2, 
  ShoppingBag, Clock, LayoutGrid, AlertCircle, Save
} from 'lucide-react';
import CountdownTimer from '../components/CountdownTimer';
import SearchableSelect from '../src/components/SearchableSelect';
import { Tractor, TractorStatus, TractorModel, ShowroomSettings } from '../types';

interface InventoryProps {
  tractors: Tractor[];
  catalogModels: TractorModel[];
  settings: ShowroomSettings;
  onAdd: (tractor: Omit<Tractor, 'id' | 'createdAt'>) => void;
  onUpdate: (tractor: Tractor) => void;
  onDelete: (id: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const Inventory: React.FC<InventoryProps> = ({ tractors, catalogModels, settings, onAdd, onUpdate, onDelete, showToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTractor, setEditingTractor] = useState<Tractor | null>(null);

  const [formData, setFormData] = useState({
    modelName: catalogModels[0]?.name || '',
    manufacturer: catalogModels[0]?.manufacturer || 'Unknown',
    hp: catalogModels[0]?.hp || '',
    engineNo: '',
    chassisNo: '',
    hsnCode: '8701',
    exShowroomPrice: 0,
    status: TractorStatus.AVAILABLE,
    color: 'Red',
  });

  const handleOpenEdit = (tractor: Tractor) => {
    setEditingTractor(tractor);
    setFormData({
      modelName: tractor.modelName,
      manufacturer: tractor.manufacturer,
      hp: tractor.hp,
      engineNo: tractor.engineNo,
      chassisNo: tractor.chassisNo,
      hsnCode: tractor.hsnCode || '8701',
      exShowroomPrice: tractor.exShowroomPrice || 0,
      status: tractor.status,
      color: tractor.color || 'Red',
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setShowAddModal(false);
    setEditingTractor(null);
    setFormData({
      modelName: catalogModels[0]?.name || '',
      manufacturer: catalogModels[0]?.manufacturer || 'Unknown',
      hp: catalogModels[0]?.hp || '',
      engineNo: '',
      chassisNo: '',
      hsnCode: '8701',
      exShowroomPrice: 0,
      status: TractorStatus.AVAILABLE,
      color: 'Red',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.chassisNo.length < 12 || formData.chassisNo.length > 13) {
        showToast("Invalid Chassis ID: Must be exactly 12 or 13 digits.", "error");
        return;
    }
    
    setIsSaving(true);
    
    // Simulate slight delay for professional feel
    setTimeout(() => {
      const tractorPayload = { ...formData };
      if (editingTractor) {
        onUpdate({ ...editingTractor, ...tractorPayload });
        showToast("Inventory record updated successfully.", "success");
      } else {
        onAdd(tractorPayload);
        showToast("New unit registered in inventory.", "success");
      }
      setIsSaving(false);
      resetForm();
    }, 600);
  };

  const filteredTractors = tractors.filter(t => {
    const matchesSearch = t.modelName.toLowerCase().includes(searchTerm.toLowerCase()) || t.chassisNo.includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const isNotDelivered = t.status !== TractorStatus.DELIVERED;
    return matchesSearch && matchesStatus && isNotDelivered;
  });

  const stats = {
    total: tractors.length,
    available: tractors.filter(t => t.status === TractorStatus.AVAILABLE).length,
    sold: tractors.filter(t => t.status === TractorStatus.SOLD).length,
    reserved: tractors.filter(t => t.status === TractorStatus.RESERVED).length,
    totalValue: tractors.filter(t => t.status === TractorStatus.AVAILABLE).reduce((acc, t) => acc + (t.exShowroomPrice || 0), 0)
  };

  return (
    <div className="space-y-10 pb-20">
      {/* ERP Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-hw-accent text-white text-[10px] font-mono font-bold uppercase tracking-widest">
              ASSET_REGISTRY_V4
            </span>
            <span className="hw-label">
              Fleet Management & Logistics
            </span>
          </div>
          <h1 className="text-5xl font-display font-bold text-hw-text tracking-tighter uppercase">
            Inventory
          </h1>
          <p className="text-hw-muted font-mono text-sm">Manage your showroom's high-performance fleet assets.</p>
        </div>
        <button 
          onClick={() => {
            if (settings.isShopClosed) {
              showToast("SHOP CLOSED: Inventory induction is restricted.", "error");
              return;
            }
            setShowAddModal(true);
          }} 
          className={`hw-btn-primary ${settings.isShopClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Plus size={20} className={settings.isShopClosed ? '' : 'group-hover:rotate-90 transition-transform duration-500'} /> Induction
        </button>
      </div>

      {/* Fleet Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-transparent border border-hw-border p-6 hover:bg-hw-accent/[0.01] transition-all">
          <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-1">Total Database</p>
          <p className="text-3xl font-display font-bold text-hw-text">{stats.total}</p>
        </div>
        <div className="bg-transparent border border-hw-border p-6 hover:bg-hw-accent/[0.01] transition-all">
          <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-1">Available</p>
          <p className="text-3xl font-display font-bold text-hw-accent">{stats.available}</p>
        </div>
        <div className="bg-transparent border border-hw-border p-6 hover:bg-hw-accent/[0.01] transition-all">
          <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-1">Sold (Pending)</p>
          <p className="text-3xl font-display font-bold text-hw-text">{stats.sold}</p>
        </div>
        <div className="bg-transparent border border-hw-border p-6 hover:bg-hw-accent/[0.01] transition-all">
          <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-1">Reserved</p>
          <p className="text-3xl font-display font-bold text-hw-text">{stats.reserved}</p>
        </div>
        <div className="bg-transparent border border-hw-border p-6 col-span-2 md:col-span-1 hover:bg-hw-accent/[0.01] transition-all">
          <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-1">Stock Value</p>
          <p className="text-2xl font-display font-bold text-hw-text">₹{(stats.totalValue / 100000).toFixed(1)}L</p>
        </div>
      </div>

      {settings.isShopClosed && (
        <div className="bg-transparent border border-hw-accent/50 p-6 flex flex-col md:flex-row items-center justify-between gap-6 no-print mb-8">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-transparent border border-hw-accent text-hw-accent flex items-center justify-center">
              <AlertCircle size={32} />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-hw-text uppercase tracking-tight">Shop Operations Suspended</h3>
              <p className="text-sm font-mono text-hw-muted">The administrator has marked the shop as CLOSED. Inventory induction and modifications are temporarily disabled.</p>
            </div>
          </div>
          <CountdownTimer closedAt={settings.closedAt || ''} />
        </div>
      )}

      <div className="bg-transparent p-6 border border-hw-border flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-hw-muted" size={20} />
          <input 
            type="text" 
            placeholder="Search by model or chassis..." 
            className="w-full pl-16 pr-8 py-5 bg-hw-bg border border-hw-border text-hw-text focus:border-hw-accent outline-none transition-all font-mono text-sm" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['ALL', TractorStatus.AVAILABLE, TractorStatus.SOLD, TractorStatus.RESERVED].map(s => (
            <button 
              key={s} 
              onClick={() => setStatusFilter(s)} 
              className={`px-6 py-4 border font-mono font-bold text-[10px] uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-hw-accent text-white border-hw-accent' : 'bg-transparent text-hw-muted border-hw-border hover:border-hw-accent hover:bg-hw-accent/[0.02]'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredTractors.map((tractor, index) => (
          <div key={tractor.id} className="hw-card group relative">
            <div className="p-10">
              <div className="flex justify-between items-start mb-10">
                <div className="space-y-2">
                  <div className={`inline-flex items-center gap-2 px-2 py-1 text-[9px] font-mono font-bold uppercase border ${
                    tractor.status === TractorStatus.AVAILABLE ? 'border-hw-accent/50 text-hw-accent' : 
                    tractor.status === TractorStatus.DELIVERED ? 'border-hw-muted/50 text-hw-muted' :
                    'border-hw-accent/50 text-hw-accent'
                  }`}>
                    <div className={`w-1.5 h-1.5 ${
                      tractor.status === TractorStatus.AVAILABLE ? 'bg-hw-accent' : 
                      tractor.status === TractorStatus.DELIVERED ? 'bg-hw-muted' :
                      'bg-hw-accent'
                    } animate-pulse`} />
                    {tractor.status}
                  </div>
                  <h3 className="text-3xl font-display font-bold text-hw-text tracking-tighter uppercase pt-1">
                    {tractor.modelName}
                  </h3>
                  <p className="hw-label">
                    Chassis: <span className="text-hw-text">{tractor.chassisNo}</span>
                  </p>
                </div>
                <div className="w-16 h-16 bg-hw-bg border border-hw-border flex items-center justify-center text-hw-muted group-hover:text-hw-accent group-hover:border-hw-accent transition-all duration-500">
                  <Truck size={32} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-transparent p-4 border border-hw-border hover:bg-hw-accent/[0.01] transition-all">
                  <p className="hw-label mb-1">Performance</p>
                  <p className="hw-value text-sm text-hw-text">{tractor.hp} HP</p>
                </div>
                <div className="bg-transparent p-4 border border-hw-border hover:bg-hw-accent/[0.01] transition-all">
                  <p className="hw-label mb-1">Aesthetic</p>
                  <p className="hw-value text-sm text-hw-text">{tractor.color || 'Standard'}</p>
                </div>
                <div className="bg-transparent p-4 border border-hw-border hover:bg-hw-accent/[0.01] transition-all">
                  <p className="hw-label mb-1">HSN Code</p>
                  <p className="hw-value text-sm text-hw-text">{tractor.hsnCode}</p>
                </div>
                <div className="bg-transparent p-4 border border-hw-border hover:bg-hw-accent/[0.01] transition-all">
                  <p className="hw-label mb-1">Engine ID</p>
                  <p className="hw-value text-sm text-hw-text">{tractor.engineNo}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-hw-border border-dashed">
                <div>
                  <p className="hw-label mb-1">Commercial Value (Ex-Showroom)</p>
                  <div className="flex items-baseline gap-1">
                    <span className="hw-label">₹</span>
                    <h4 className="text-3xl hw-value text-hw-text">
                      {(tractor.exShowroomPrice || 0).toLocaleString()}
                    </h4>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => {
                    if (settings.isShopClosed) {
                      showToast("SHOP CLOSED: Modification restricted.", "error");
                      return;
                    }
                    handleOpenEdit(tractor);
                  }} 
                  className={`flex-1 hw-btn-secondary ${
                    settings.isShopClosed 
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                  }`}
                >
                  <Edit3 size={14} /> Edit Asset
                </button>
                <button 
                  onClick={() => {
                    if (settings.isShopClosed) {
                      showToast("SHOP CLOSED: Deletion restricted.", "error");
                      return;
                    }
                    if (window.confirm("Are you sure you want to remove this unit from inventory?")) {
                      onDelete(tractor.id);
                      showToast("Unit removed from inventory.", "info");
                    }
                  }} 
                  className={`p-4 border transition-all active:scale-95 ${
                    settings.isShopClosed 
                      ? 'bg-transparent text-hw-muted border-hw-border cursor-not-allowed' 
                      : 'bg-transparent border-hw-border text-hw-accent hover:bg-hw-accent hover:text-white hover:border-hw-accent'
                  }`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 w-full transition-all duration-500 group-hover:h-2 ${
              tractor.status === TractorStatus.AVAILABLE ? 'bg-hw-accent' : 
              tractor.status === TractorStatus.DELIVERED ? 'bg-hw-muted' :
              'bg-hw-accent'
            }`} />
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[1000] flex flex-col no-print bg-hw-bg overflow-hidden">
           <div className="p-6 sm:p-10 border-b border-hw-border flex justify-between items-center bg-transparent shrink-0">
              <div className="flex items-center gap-6">
                <div className="p-4 sm:p-6 bg-hw-accent text-white border border-hw-border">
                  <Truck size={32} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-3xl font-display font-bold text-hw-text uppercase tracking-tighter">
                    {editingTractor ? 'Update Unit' : 'Induct Fleet'}
                  </h2>
                  <p className="hw-label mt-1">Technical Specification Registry</p>
                </div>
              </div>
              <button onClick={resetForm} className="p-3 sm:p-4 text-hw-muted hover:text-hw-accent transition-all"><X size={32} /></button>
           </div>
           <div className="flex-1 overflow-y-auto p-6 sm:p-12 custom-scrollbar">
             <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 max-w-5xl mx-auto">
                <div className="space-y-2">
                  <label className="hw-label">Asset Model</label>
                  <SearchableSelect
                    placeholder="-- Select Model --"
                    options={catalogModels.map(m => ({ 
                      id: m.name, 
                      label: m.name, 
                      sublabel: `${m.manufacturer} (${m.hp} HP)` 
                    }))}
                    value={formData.modelName}
                    onChange={(val) => {
                      const model = catalogModels.find(m => m.name === val);
                      setFormData({
                        ...formData,
                        modelName: val,
                        manufacturer: model?.manufacturer || 'Eicher',
                        hp: model?.hp || ''
                      });
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="hw-label">Power (HP)</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-transparent border border-hw-border text-hw-muted font-mono font-bold text-xs outline-none cursor-not-allowed opacity-60" 
                    value={formData.hp} 
                    readOnly 
                    placeholder="Auto-filled from model"
                  />
                </div>
                <div className="space-y-2">
                  <label className="hw-label">Chassis ID</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-transparent border border-hw-border text-hw-text font-mono font-bold uppercase text-xs outline-none focus:border-hw-accent hover:bg-hw-accent/[0.01] transition-all" 
                    value={formData.chassisNo} 
                    onChange={(e) => setFormData({...formData, chassisNo: e.target.value.toUpperCase()})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="hw-label">Engine ID</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-transparent border border-hw-border text-hw-text font-mono font-bold uppercase text-xs outline-none focus:border-hw-accent hover:bg-hw-accent/[0.01] transition-all" 
                    value={formData.engineNo} 
                    onChange={(e) => setFormData({...formData, engineNo: e.target.value.toUpperCase()})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="hw-label">Tractor Color</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-transparent border border-hw-border text-hw-text font-mono font-bold text-xs outline-none focus:border-hw-accent hover:bg-hw-accent/[0.01] transition-all" 
                    value={formData.color} 
                    onChange={(e) => setFormData({...formData, color: e.target.value})} 
                    placeholder="e.g. Red, Blue, Silver" 
                  />
                </div>
                <div className="md:col-span-2 pt-10 border-t border-hw-border">
                   <div className="space-y-4 max-w-sm mx-auto">
                     <label className="hw-label block text-center">Ex-Showroom Price (₹)</label>
                     <input 
                       type="number" 
                       className="w-full px-6 py-6 bg-transparent border border-hw-border text-hw-text font-mono font-bold text-2xl text-center outline-none focus:border-hw-accent hover:bg-hw-accent/[0.01] transition-all" 
                       value={formData.exShowroomPrice || ''} 
                       onChange={(e) => setFormData({...formData, exShowroomPrice: parseFloat(e.target.value) || 0})} 
                       required 
                     />
                   </div>
                </div>
                <div className="md:col-span-2 flex justify-center sm:justify-end gap-6 pt-10">
                  <button type="button" onClick={resetForm} className="hw-btn-secondary">Discard</button>
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="hw-btn-primary disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Save size={16} />
                    )}
                    {editingTractor ? 'Update Sync' : 'Register Sync'}
                  </button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
