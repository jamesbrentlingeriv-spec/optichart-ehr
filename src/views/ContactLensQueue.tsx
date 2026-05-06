import React, { useState, useEffect } from 'react';
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  Search, 
  ExternalLink, 
  Trash2, 
  Filter,
  ArrowRight,
  User,
  Phone,
  Calendar,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { contactOrderService, patientService } from '../services/db';
import { Link } from 'react-router-dom';
import { ContactOrderModal } from '../components/ContactOrderModal';

export const ContactLensQueue = () => {
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'ordered'>('pending');
  const [search, setSearch] = useState('');
  
  // New Order State
  const [showOrderFlow, setShowOrderFlow] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const [pending, active] = await Promise.all([
        contactOrderService.getPendingContactOrders(),
        contactOrderService.getActiveContactOrders()
      ]);
      setPendingOrders(pending);
      setActiveOrders(active);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSearch = async (val: string) => {
    setPatientSearch(val);
    if (val.length > 2) {
      const results = await patientService.searchPatients(val);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleCreateOrder = async (orderData: any) => {
    if (!selectedPatient) return;
    try {
      await contactOrderService.createContactOrder(selectedPatient.id, orderData);
      setShowOrderFlow(false);
      setSelectedPatient(null);
      setPatientSearch('');
      setSearchResults([]);
      await loadOrders();
    } catch (error) {
      alert('Failed to create order');
    }
  };

  const handleStatusUpdate = async (order: any, newStatus: string) => {
    try {
      let additionalData = {};
      if (newStatus === 'received') {
        const drawer = prompt('Enter storage drawer location:', 'A-1');
        if (!drawer) return;
        additionalData = { drawer };
      }
      await contactOrderService.updateOrderStatus(order.patientId, order.id, newStatus, additionalData);
      await loadOrders();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const filteredOrders = (activeTab === 'pending' ? pendingOrders : activeOrders).filter(o => 
    o.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    o.od?.brand?.toLowerCase().includes(search.toLowerCase()) ||
    o.os?.brand?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-2 uppercase">Contact Lens Ordering</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Active Fulfillment Pipeline • {pendingOrders.length} Pending Orders</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowOrderFlow(true)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Plus size={14} />
            New Order
          </button>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('pending')}
              className={cn(
                "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2",
                activeTab === 'pending' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Clock size={14} />
              CONTACT LENS NEED ORDERED ({pendingOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('ordered')}
              className={cn(
                "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2",
                activeTab === 'ordered' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Package size={14} />
              CONTACT LENS ON ORDER ({activeOrders.length})
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text"
            placeholder="Search by patient or lens brand..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/5 transition shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-40 bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-20 rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-6">
              <Package size={32} />
            </div>
            <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Pipeline clean. No {activeTab} orders found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredOrders.map(order => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={order.id}
                className="bg-white p-10 rounded-[40px] border-2 border-slate-50 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group overflow-hidden relative"
              >
                {order.status === 'received' && (
                  <div className="absolute top-0 right-0 p-8">
                    <div className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200">
                      Drawer {order.drawer}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-900 rounded-[28px] flex items-center justify-center text-white shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform">
                      <User size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2">{order.patientName}</h4>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Phone size={12} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{order.phone || 'No Phone recorded'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-indigo-400">
                          <Calendar size={12} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Ordered {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[4px] mb-3">Dexter (OD)</p>
                    <p className="text-sm font-black text-slate-800 mb-1">{order.od?.brand || 'Spherical'}</p>
                    <p className="text-[11px] font-bold text-slate-400 font-mono tracking-widest italic">
                      {order.od?.sph} {order.od?.cyl && ` / ${order.od?.cyl} x ${order.od?.axis}`}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[4px] mb-3">Sinister (OS)</p>
                    <p className="text-sm font-black text-slate-800 mb-1">{order.os?.brand || 'Spherical'}</p>
                    <p className="text-[11px] font-bold text-slate-400 font-mono tracking-widest italic">
                      {order.os?.sph} {order.os?.cyl && ` / ${order.os?.cyl} x ${order.os?.axis}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[3px] border-2",
                      order.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" : 
                      order.status === 'received' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      "bg-indigo-50 text-indigo-600 border-indigo-100"
                    )}>
                      {order.status}
                    </div>
                    {order.quantity && (
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.quantity} Units</span>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => handleStatusUpdate(order, 'ordered')}
                        className="flex items-center gap-3 px-8 py-3.5 bg-indigo-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[3px] hover:bg-slate-900 shadow-2xl shadow-indigo-100 transition-all active:scale-95"
                      >
                        <CheckCircle2 size={16} strokeWidth={3} />
                        Mark as Ordered
                      </button>
                    )}
                    {order.status === 'ordered' && (
                      <button 
                        onClick={() => handleStatusUpdate(order, 'received')}
                        className="flex items-center gap-3 px-8 py-3.5 bg-emerald-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[3px] hover:bg-slate-900 shadow-2xl shadow-emerald-100 transition-all active:scale-95"
                      >
                        <Package size={16} strokeWidth={3} />
                        Mark Received
                      </button>
                    )}
                    {order.status === 'received' && (
                      <button 
                        onClick={() => {
                          if (confirm(`Confirm final pickup for ${order.patientName}? (Will remove from active queue)`)) {
                            handleStatusUpdate(order, 'dispensed');
                          }
                        }}
                        className="flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[3px] hover:bg-red-600 shadow-2xl transition-all active:scale-95"
                      >
                        <CheckCircle2 size={16} strokeWidth={3} />
                        Final Pickup
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* NEW ORDER FLOW */}
      <AnimatePresence>
        {showOrderFlow && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border-8 border-slate-900"
            >
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">Initiate Order Protocol</h2>
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[5px] mt-1">Identify Target Patient</p>
                </div>
                <button 
                  onClick={() => setShowOrderFlow(false)} 
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-red-500 transition-colors shadow-lg active:scale-95"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text"
                    autoFocus
                    placeholder="Search by first or last name..."
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/5 transition"
                    value={patientSearch}
                    onChange={(e) => handlePatientSearch(e.target.value)}
                  />
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {searchResults.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => setSelectedPatient(p)}
                      className="w-full p-4 hover:bg-indigo-50 rounded-2xl flex items-center justify-between group transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-indigo-600 transition">
                          <User size={18} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-slate-800 uppercase">{p.firstName} {p.lastName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{p.dob}</p>
                        </div>
                      </div>
                      <Plus size={18} className="text-slate-300 group-hover:text-indigo-600 transition" />
                    </button>
                  ))}
                  {patientSearch.length > 2 && searchResults.length === 0 && (
                    <p className="text-center py-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">No matching human records found</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectedPatient && (
        <ContactOrderModal 
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onSave={handleCreateOrder}
        />
      )}
    </div>
  );
};
