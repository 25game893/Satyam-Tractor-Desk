
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, ClipboardList, Check, Building } from 'lucide-react';
import SearchableSelect from '../src/components/SearchableSelect';
import { TractorModel } from '../types';
import { MANUFACTURERS } from '../constants';

interface ModelManagerProps {
  models: TractorModel[];
  onAdd: (model: Omit<TractorModel, 'id'>) => void;
  onUpdate: (model: TractorModel) => void;
  onDelete: (id: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ModelManager: React.FC<ModelManagerProps> = ({ models, onAdd, onUpdate, onDelete, showToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingModel, setEditingModel] = useState<TractorModel | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    manufacturer: MANUFACTURERS[0],
    hp: '',
    description: '',
    features: [] as string[]
  });

  const [newFeature, setNewFeature] = useState('');

  const filteredModels = models.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingModel(null);
    setFormData({ name: '', manufacturer: MANUFACTURERS[0], hp: '', description: '', features: [] });
    setNewFeature('');
    setShowModal(true);
  };

  const handleOpenEdit = (model: TractorModel) => {
    setEditingModel(model);
    setFormData({ 
      name: model.name, 
      manufacturer: model.manufacturer, 
      hp: model.hp,
      description: model.description || '',
      features: model.features || []
    });
    setNewFeature('');
    setShowModal(true);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingModel) {
      onUpdate({ ...editingModel, ...formData });
      showToast("Model updated successfully.", "success");
    } else {
      onAdd(formData);
      showToast("Model added to catalog.", "success");
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    showToast("Model removed from catalog.", "info");
  };

  return (
    <div className="space-y-10 pb-20">
      {/* ERP Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-hw-accent text-white text-[10px] font-mono font-bold uppercase tracking-widest">
              CATALOG_V3
            </span>
            <span className="hw-label">
              Global Model Registry
            </span>
          </div>
          <h1 className="text-5xl font-display font-bold text-hw-text tracking-tighter uppercase">
            Model Manager
          </h1>
          <p className="text-hw-muted font-mono text-sm">Manage the global catalog of tractor models and specifications.</p>
        </div>
        
        <button 
          onClick={handleOpenAdd}
          className="hw-btn-primary flex items-center gap-4"
        >
          <Plus size={18} /> Define New Model
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-hw-surface border border-hw-border p-2 shadow-xl">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-hw-muted group-focus-within:text-hw-accent transition-colors" size={20} />
          <input 
            type="text"
            placeholder="SEARCH BY MODEL NAME OR BRAND..."
            className="w-full pl-16 pr-8 py-6 bg-hw-bg border border-hw-border outline-none focus:border-hw-accent transition-all font-mono font-bold text-xs text-hw-text uppercase tracking-wider shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-hw-surface border border-hw-border shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-hw-bg border-b border-hw-border">
                <th className="px-8 py-6 text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest">Brand</th>
                <th className="px-8 py-6 text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest">Model Name</th>
                <th className="px-8 py-6 text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest">Horsepower</th>
                <th className="px-8 py-6 text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest">Description</th>
                <th className="px-8 py-6 text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest">Features</th>
                <th className="px-8 py-6 text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hw-border">
              {filteredModels.map(model => (
                <tr key={model.id} className="hover:bg-hw-bg/50 transition-colors group">
                  <td className="px-8 py-8">
                    <span className="px-3 py-1.5 bg-hw-bg text-hw-text font-mono font-bold border border-hw-border text-[10px] uppercase tracking-widest group-hover:bg-hw-accent group-hover:text-white group-hover:border-hw-accent transition-all">
                      {model.manufacturer}
                    </span>
                  </td>
                  <td className="px-8 py-8">
                    <p className="text-sm font-display font-bold text-hw-text uppercase tracking-tight">{model.name}</p>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-hw-text">{model.hp}</span>
                      <span className="text-[10px] font-mono font-bold text-hw-muted uppercase">HP</span>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <p className="text-xs text-hw-muted font-mono font-bold uppercase italic max-w-xs truncate">
                      {model.description || 'NO DESCRIPTION PROVIDED'}
                    </p>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {model.features && model.features.length > 0 ? (
                        model.features.slice(0, 3).map((f, i) => (
                          <span key={i} className="px-2 py-0.5 bg-hw-bg border border-hw-border text-[9px] font-mono font-bold text-hw-muted uppercase">
                            {f}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-hw-muted opacity-50 uppercase tracking-widest">No Specs</span>
                      )}
                      {model.features && model.features.length > 3 && (
                        <span className="text-[9px] font-mono font-bold text-hw-accent">+{model.features.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <div className="flex justify-end gap-4">
                      <button 
                        onClick={() => handleOpenEdit(model)}
                        className="w-10 h-10 bg-hw-bg border border-hw-border flex items-center justify-center text-hw-muted hover:bg-hw-text hover:text-hw-bg transition-all"
                        title="Edit Model"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(model.id)}
                        className="w-10 h-10 bg-hw-bg border border-hw-border flex items-center justify-center text-hw-accent hover:bg-hw-accent hover:text-white transition-all"
                        title="Delete Model"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredModels.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-20">
                      <div className="w-24 h-24 bg-hw-bg border border-hw-border flex items-center justify-center">
                        <ClipboardList size={48} />
                      </div>
                      <p className="text-xl font-display font-bold uppercase tracking-[0.2em]">Model Catalog is Empty</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-hw-text/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-hw-surface w-full max-w-2xl border border-hw-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-hw-border flex justify-between items-center bg-hw-bg">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-hw-text text-hw-bg flex items-center justify-center shadow-xl">
                  <ClipboardList size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-hw-text uppercase tracking-tight">
                    {editingModel ? 'Update Catalog Entry' : 'New Catalog Entry'}
                  </h2>
                  <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest mt-1">Registry Protocol V3.1</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-12 h-12 bg-hw-surface border border-hw-border flex items-center justify-center text-hw-muted hover:bg-hw-accent hover:text-white hover:border-hw-accent transition-all active:scale-95"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <SearchableSelect 
                      label="Manufacturer / Brand"
                      placeholder="Select Manufacturer"
                      options={MANUFACTURERS.map(m => ({ id: m, label: m }))}
                      value={formData.manufacturer}
                      onChange={(val) => setFormData({...formData, manufacturer: val})}
                      searchable={false}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest ml-1">Model Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="E.G. TIGER DI 65"
                      className="w-full px-6 py-5 bg-hw-bg border border-hw-border focus:border-hw-accent outline-none font-display font-bold text-hw-text uppercase shadow-inner"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest ml-1">Horsepower (HP)</label>
                    <input 
                      type="text"
                      required
                      placeholder="E.G. 65"
                      className="w-full px-6 py-5 bg-hw-bg border border-hw-border focus:border-hw-accent outline-none font-mono font-bold text-hw-text shadow-inner"
                      value={formData.hp}
                      onChange={(e) => setFormData({...formData, hp: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest ml-1">Key Features / USPs</label>
                    <div className="flex gap-4 mb-4">
                      <input 
                        type="text"
                        placeholder="ADD A FEATURE (E.G. SIDE SHIFT GEARS)"
                        className="flex-1 px-6 py-5 bg-hw-bg border border-hw-border focus:border-hw-accent outline-none font-mono font-bold text-hw-text uppercase shadow-inner"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      />
                      <button 
                        type="button"
                        onClick={addFeature}
                        className="px-8 bg-hw-text text-hw-bg font-mono font-bold text-[10px] uppercase tracking-widest hover:bg-hw-accent transition-all"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3 p-6 bg-hw-bg border border-hw-border border-dashed">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 px-4 py-2 bg-hw-surface border border-hw-border">
                          <span className="text-[10px] font-mono font-bold text-hw-text uppercase">{feature}</span>
                          <button 
                            type="button" 
                            onClick={() => removeFeature(index)}
                            className="text-hw-accent hover:text-rose-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {formData.features.length === 0 && (
                        <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest italic opacity-50">No features added yet</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest ml-1">Technical Specifications / Notes</label>
                    <textarea 
                      rows={4}
                      placeholder="ENTER DETAILED SPECIFICATIONS OR MODEL NOTES..."
                      className="w-full px-6 py-5 bg-hw-bg border border-hw-border focus:border-hw-accent outline-none font-mono font-bold text-hw-text shadow-inner uppercase"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-6 pt-10 border-t border-hw-border">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    className="px-10 py-5 text-hw-muted font-mono font-bold uppercase tracking-widest text-[10px] hover:text-hw-text transition-colors"
                  >
                    Discard Changes
                  </button>
                  <button 
                    type="submit"
                    className="hw-btn-primary px-16 py-5"
                  >
                    <Check size={20} /> {editingModel ? 'Update Catalog' : 'Commit to Catalog'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelManager;
