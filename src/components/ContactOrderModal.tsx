import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { cn } from '../lib/utils';

interface ContactOrderModalProps {
  patient: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const ContactOrderModal = ({ patient, onClose, onSave }: ContactOrderModalProps) => {
  const [data, setData] = useState({
    brand: '',
    quantity: '2',
    isCustomQuantity: false,
    customQuantityCount: '',
    od: { sph: '', cyl: '', axis: '', bc: '', dia: '', brand: '' },
    os: { sph: '', cyl: '', axis: '', bc: '', dia: '', brand: '' },
    isTrial: false,
    insurance: 'none', // 'none' | 'insurance'
    insuranceName: '',
    paymentStatus: 'pickup', // 'paid' | 'pickup' | 'covered'
    paymentAmount: '',
    isMultifocal: false,
    multifocalAdd: 'low', // 'low' | 'medium' | 'high'
    phone: patient.phone || '',
    shippingAddress: patient.address || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuantity = data.isCustomQuantity ? data.customQuantityCount : data.quantity;
    onSave({ 
      ...data, 
      quantity: finalQuantity,
      patientName: `${patient.firstName} ${patient.lastName}` 
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border-8 border-slate-900 flex flex-col max-h-[90vh]">
        <div className="p-8 bg-slate-900 text-white flex justify-between items-center shrink-0">
           <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Contact Lens Prescription Order</h2>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[5px] mt-1 italic">VisiOrder Protocol v1.0</p>
           </div>
           <button 
             onClick={onClose} 
             className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-red-500 transition-colors shadow-lg active:scale-95"
           >
             <X size={24} strokeWidth={3} />
           </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
           {/* Quantity Selection */}
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center block">Select Desired Supply Quantity</label>
              
              {!data.isCustomQuantity ? (
                <div className="grid grid-cols-3 gap-3">
                   <button
                     type="button"
                     onClick={() => setData({...data, quantity: '1'})}
                     className={cn(
                       "flex flex-col items-center justify-center py-5 rounded-[24px] border-2 transition-all group active:scale-95",
                       data.quantity === '1' ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-200" : "bg-white border-slate-100 hover:border-indigo-200 text-slate-500"
                     )}
                   >
                     <span className={cn("text-[10px] font-black uppercase tracking-widest mb-1", data.quantity === '1' ? "text-indigo-100" : "text-slate-400")}>Single Box</span>
                     <span className={cn("text-sm font-black", data.quantity === '1' ? "text-white" : "text-slate-800")}>1 per Eye</span>
                   </button>

                   <button
                     type="button"
                     onClick={() => setData({...data, quantity: '4'})}
                     className={cn(
                       "flex flex-col items-center justify-center py-5 rounded-[24px] border-2 transition-all group active:scale-95",
                       data.quantity === '4' ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-200" : "bg-white border-slate-100 hover:border-indigo-200 text-slate-500"
                     )}
                   >
                     <span className={cn("text-[10px] font-black uppercase tracking-widest mb-1", data.quantity === '4' ? "text-indigo-100" : "text-slate-400")}>Semi-Annual</span>
                     <span className={cn("text-sm font-black", data.quantity === '4' ? "text-white" : "text-slate-800")}>6-MO Supply</span>
                   </button>

                   <button
                     type="button"
                     onClick={() => setData({...data, quantity: '8'})}
                     className={cn(
                       "flex flex-col items-center justify-center py-5 rounded-[24px] border-2 transition-all group active:scale-95",
                       data.quantity === '8' ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-200" : "bg-white border-slate-100 hover:border-indigo-200 text-slate-500"
                     )}
                   >
                     <span className={cn("text-[10px] font-black uppercase tracking-widest mb-1", data.quantity === '8' ? "text-indigo-100" : "text-slate-400")}>Optimal</span>
                     <span className={cn("text-sm font-black", data.quantity === '8' ? "text-white" : "text-slate-800")}>Annual Supply</span>
                   </button>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <input 
                    type="number"
                    placeholder="Enter total boxes per eye..."
                    className="w-full bg-slate-50 p-4 rounded-[20px] font-black text-lg border-2 border-indigo-200 outline-none focus:ring-8 focus:ring-indigo-100 text-center text-indigo-900 transition-all"
                    value={data.customQuantityCount}
                    onChange={e => setData({...data, customQuantityCount: e.target.value})}
                    autoFocus
                  />
                </div>
              )}

              <div className="flex justify-center">
                <button 
                  type="button"
                  onClick={() => setData({...data, isCustomQuantity: !data.isCustomQuantity})}
                  className="flex items-center gap-2 px-6 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-[3px] transition-colors"
                >
                  {data.isCustomQuantity ? "Return to Presets" : "Input Custom Order Quantity"}
                </button>
              </div>
           </div>

            {/* Rx Section */}
           <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-black text-indigo-600 w-8">OD</span>
                  <div className="grid grid-cols-4 gap-2 flex-1">
                    <input className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-mono focus:border-indigo-400 outline-none" placeholder="SPH" value={data.od.sph} onChange={e => setData({...data, od: {...data.od, sph: e.target.value}})} />
                    <input className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-mono focus:border-indigo-400 outline-none" placeholder="CYL" value={data.od.cyl} onChange={e => setData({...data, od: {...data.od, cyl: e.target.value}})} />
                    <input className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-mono focus:border-indigo-400 outline-none" placeholder="AXIS" value={data.od.axis} onChange={e => setData({...data, od: {...data.od, axis: e.target.value}})} />
                    <input className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-mono focus:border-indigo-400 outline-none" placeholder="BRAND" value={data.od.brand} onChange={e => setData({...data, od: {...data.od, brand: e.target.value}})} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-black text-indigo-600 w-8">OS</span>
                  <div className="grid grid-cols-4 gap-2 flex-1">
                    <input className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-mono focus:border-indigo-400 outline-none" placeholder="SPH" value={data.os.sph} onChange={e => setData({...data, os: {...data.os, sph: e.target.value}})} />
                    <input className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-mono focus:border-indigo-400 outline-none" placeholder="CYL" value={data.os.cyl} onChange={e => setData({...data, os: {...data.os, cyl: e.target.value}})} />
                    <input className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-mono focus:border-indigo-400 outline-none" placeholder="AXIS" value={data.os.axis} onChange={e => setData({...data, os: {...data.os, axis: e.target.value}})} />
                    <input className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-mono focus:border-indigo-400 outline-none" placeholder="BRAND" value={data.os.brand} onChange={e => setData({...data, os: {...data.os, brand: e.target.value}})} />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 block">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="isMultifocal"
                      checked={data.isMultifocal}
                      onChange={e => setData({...data, isMultifocal: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                    />
                    <label htmlFor="isMultifocal" className="text-[10px] font-black uppercase text-slate-500 tracking-widest cursor-pointer select-none">Multifocal ADD Protocol</label>
                  </div>
                  
                  {data.isMultifocal && (
                    <div className="flex bg-white border border-slate-200 p-1 rounded-xl animate-in fade-in slide-in-from-right-4">
                      {['low', 'medium', 'high'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setData({...data, multifocalAdd: level as any})}
                          className={cn(
                            "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition",
                            data.multifocalAdd === level ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
           </div>

           {/* Trial & Phone Section */}
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Patient Contact Phone</label>
                 <input 
                    type="tel"
                    placeholder="(555) 000-0000"
                    className="w-full bg-slate-50 p-3 rounded-xl font-bold text-xs border border-slate-100 outline-none focus:ring-4 focus:ring-indigo-100"
                    value={data.phone}
                    onChange={e => setData({...data, phone: e.target.value})}
                 />
              </div>
              <div className={cn(
                "flex items-center gap-3 p-4 rounded-2xl border transition-all self-end h-[50px]",
                data.isTrial ? "bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100" : "bg-indigo-50/50 border-indigo-100/50"
              )}>
                 <input 
                    type="checkbox" 
                    checked={data.isTrial} 
                    id="isTrial"
                    onChange={e => setData({...data, isTrial: e.target.checked})}
                    className="w-5 h-5 rounded border-slate-300 text-white focus:ring-indigo-500 accent-white"
                 />
                 <label htmlFor="isTrial" className={cn(
                   "text-[10px] font-black uppercase tracking-widest cursor-pointer select-none",
                   data.isTrial ? "text-white" : "text-indigo-900"
                 )}>Designate as Trial Pair</label>
              </div>
           </div>

           {/* Insurance & Payment - Conditional Visibility */}
           {!data.isTrial && (
             <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Insurance Requirement</label>
                   <div className="flex bg-slate-100 p-1 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setData({...data, insurance: 'none', paymentStatus: data.paymentStatus === 'covered' ? 'pickup' : data.paymentStatus})}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition",
                          data.insurance === 'none' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                        )}
                      >None</button>
                      <button
                        type="button"
                        onClick={() => setData({...data, insurance: 'insurance'})}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition",
                          data.insurance === 'insurance' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                        )}
                      >Insurance</button>
                   </div>
                   {data.insurance === 'insurance' && (
                     <input 
                       placeholder="Enter Insurance Carrier Name..."
                       className="w-full bg-slate-50 p-3 rounded-xl font-bold text-[10px] border border-indigo-100 outline-none focus:ring-4 focus:ring-indigo-100 animate-in fade-in zoom-in duration-200"
                       value={data.insuranceName}
                       onChange={e => setData({...data, insuranceName: e.target.value})}
                     />
                   )}
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Fulfillment Payment</label>
                   <div className="flex bg-slate-100 p-1 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setData({...data, paymentStatus: 'paid'})}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition",
                          data.paymentStatus === 'paid' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"
                        )}
                      >Paid</button>
                      <button
                        type="button"
                        onClick={() => setData({...data, paymentStatus: 'pickup'})}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition",
                          data.paymentStatus === 'pickup' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                        )}
                      >Pickup</button>
                      <button
                        type="button"
                        onClick={() => setData({...data, paymentStatus: 'covered', insurance: 'insurance'})}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition",
                          data.paymentStatus === 'covered' ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400"
                        )}
                      >Ins. Cov.</button>
                   </div>
                   {(data.paymentStatus === 'paid' || data.paymentStatus === 'pickup') && (
                      <div className="relative animate-in fade-in zoom-in duration-200">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                        <input 
                          type="number"
                          placeholder="Amount..."
                          className="w-full bg-slate-50 pl-8 pr-4 py-3 rounded-xl font-black text-xs border border-indigo-100 outline-none focus:ring-4 focus:ring-indigo-100"
                          value={data.paymentAmount}
                          onChange={e => setData({...data, paymentAmount: e.target.value})}
                        />
                      </div>
                   )}
                </div>
             </div>
           )}

           <button 
              type="submit"
              className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-sm uppercase tracking-[4px] hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-200 active:scale-[0.98]"
           >
              Finalize & Queue Order
           </button>
        </form>
      </div>
    </div>
  );
};
