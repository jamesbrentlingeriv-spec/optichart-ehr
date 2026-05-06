import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, collectionGroup, where, limit, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { fileService } from '../services/db';
import { 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Maximize2, 
  Calendar,
  User,
  ChevronRight,
  FileText,
  Search,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export const ImagingView = ({ patientId: initialPatientId, category = 'imaging' }: { patientId?: string, category?: 'imaging' | 'documents' }) => {
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId);
  const [images, setImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState<any[]>([]);
  const [selectedPatientName, setSelectedPatientName] = useState<string | null>(null);

  useEffect(() => {
    // If we have a patientId, listen to their docs. Otherwise, use collectionGroup for global view.
    const path = selectedPatientId ? `patients/${selectedPatientId}/documents` : 'documents';
    const q = selectedPatientId 
      ? query(collection(db, path), orderBy('uploadedAt', 'desc'))
      : query(collectionGroup(db, 'documents'), orderBy('uploadedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Filter based on category
      if (category === 'imaging') {
        setImages(allDocs.filter((d: any) => d.url || (d.type && ['mri', 'fundus', 'oct', 'retinal', 'photo'].includes(d.type))));
      } else {
        setImages(allDocs.filter((d: any) => !d.url && (d.type === 'optical_order' || d.type === 'billing' || d.type === 'rx')));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return unsubscribe;
  }, [selectedPatientId, category]);

  useEffect(() => {
    if (patientSearch.length < 2) {
      setPatientResults([]);
      return;
    }

    const searchPatients = async () => {
      const q = query(
        collection(db, 'patients'),
        where('lastName', '>=', patientSearch.toUpperCase()),
        where('lastName', '<=', patientSearch.toUpperCase() + '\uf8ff'),
        limit(5)
      );
      const snap = await getDocs(q);
      setPatientResults(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    const timer = setTimeout(searchPatients, 300);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPatientId) return;

    setUploading(true);
    try {
      await fileService.uploadFundusPhoto(selectedPatientId, file, selectedPatientName || 'Unknown Patient');
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const isImaging = category === 'imaging';

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-800 tracking-tighter mb-2 uppercase">
            {isImaging ? 'imaging and diagnostics' : 'Electronic Records'}
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            {isImaging 
              ? 'Premier high-resolution diagnostics. imaging and diagnostics photos, OCT scans, and MRI records.' 
              : 'Full data capture slips, billing statements, and electronic optical orders.'}
          </p>
        </div>

        <div className="flex gap-4 items-center">
          {!initialPatientId && (
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search patient to upload..."
                className="w-full bg-white border border-slate-200 pl-10 pr-4 h-14 rounded-xl font-bold text-xs uppercase outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
                value={selectedPatientName || patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  setSelectedPatientName(null);
                  if (!initialPatientId) setSelectedPatientId(undefined);
                }}
              />
              <AnimatePresence>
                {patientResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] overflow-hidden"
                  >
                    {patientResults.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => {
                          setSelectedPatientId(p.id);
                          setSelectedPatientName(`${p.firstName} ${p.lastName}`);
                          setPatientResults([]);
                        }}
                        className="w-full text-left px-6 py-4 hover:bg-indigo-50 border-b border-slate-50 last:border-none transition"
                      >
                        <p className="font-black uppercase text-xs text-slate-800">{p.firstName} {p.lastName}</p>
                        <p className="text-[10px] font-bold text-slate-400">DOB: {p.dob}</p>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {selectedPatientId && isImaging && (
            <label className="bg-indigo-600 text-white h-14 px-8 rounded-xl flex items-center gap-3 hover:bg-indigo-700 transition cursor-pointer shadow-lg shadow-indigo-100 font-black uppercase tracking-widest text-xs">
              <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
              <Upload size={20} className={uploading ? "animate-bounce" : ""} />
              {uploading ? "Uploading..." : "Upload Photo"}
            </label>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
        {images.length === 0 ? (
          <div className="col-span-full h-80 bg-white border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
             {isImaging ? <Camera size={48} className="mb-4 opacity-10" /> : <FileText size={48} className="mb-4 opacity-10" />}
             <p className="font-black uppercase tracking-[4px] text-[10px]">
               {isImaging ? 'No diagnostic imaging found' : 'No electronic records found'}
             </p>
          </div>
        ) : (
          images.map((img) => (
            <div key={img.id} className="group bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500">
                 <div className="relative aspect-square overflow-hidden bg-slate-900 group-hover:bg-slate-800 transition-colors">
                  {img.url ? (
                    <img 
                      src={img.url} 
                      alt={img.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-indigo-400">
                      <FileText size={64} className="mb-4 opacity-20" />
                      <p className="font-black uppercase tracking-[3px] text-xs">Electronic Record</p>
                      <p className="text-[10px] opacity-60 mt-2 font-bold uppercase">{img.type === 'optical_order' ? 'Full Data Capture Slip' : 'Diagnostic Document'}</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-indigo-600 hover:scale-110 transition shadow-xl">
                        <Maximize2 size={24} />
                     </button>
                  </div>
                  <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded shadow-sm text-[9px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-100">
                    {img.type}
                  </div>
               </div>
               
               <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{format(new Date(img.uploadedAt?.toDate?.() || Date.now()), 'MMM dd, yyyy')}</span>
                     </div>
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic truncate max-w-[120px]">{img.name}</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                     <div className="w-8 h-8 rounded bg-white flex items-center justify-center border border-slate-100">
                        <User size={14} className="text-slate-400" />
                     </div>
                     <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight truncate">{img.patientName || 'ANONYMOUS DATASET'}</span>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
