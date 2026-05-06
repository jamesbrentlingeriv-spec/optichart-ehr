import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  User, 
  MoreVertical,
  X,
  CheckCircle2,
  AlertCircle,
  Settings,
  Trash2,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { schedulerService, patientService } from '../services/db';

const HOURS = Array.from({ length: 9 }, (_, i) => i + 9); // 9 AM to 5 PM

const APPOINTMENT_TYPES = [
  { id: 'new_patient', label: 'Exam Routine, New Patient', color: '#6366f1' },
  { id: 'est_patient', label: 'Exam Routine, Established Patient', color: '#10b981' },
  { id: 'new_patient_cl', label: 'Exam Routine, New Patient Contact Lens', color: '#8b5cf6' },
  { id: 'est_patient_cl', label: 'Exam Routine, Established Patient Contact Lens', color: '#ec4899' },
  { id: 'medical_exam', label: 'Medical Exam', color: '#ef4444' },
  { id: 'recheck_medical', label: 'Recheck Medical', color: '#f59e0b' },
  { id: 'recheck_glasses', label: 'Recheck Glasses', color: '#3b82f6' },
  { id: 'recheck_contact', label: 'Recheck Contact', color: '#06b6d4' },
  { id: 'dilation', label: 'Dilation Exam', color: '#f97316' },
  { id: 'block_off', label: 'Block Off / Restricted', color: '#475569' },
];

export const Scheduler = () => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [typeColors, setTypeColors] = useState<Record<string, string>>(
    APPOINTMENT_TYPES.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.color }), {})
  );

  useEffect(() => {
    fetchAppointments();
  }, [currentDate]);

  const fetchAppointments = async () => {
    const data = await schedulerService.getAppointments(currentDate);
    setAppointments(data);
  };

  const handleSlotClick = (hour: number, minute: number) => {
    setSelectedSlot({ hour, minute });
    setSelectedAppt(null);
    setShowModal(true);
  };

  const handleApptDoubleClick = (appt: any) => {
    setSelectedAppt(appt);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this appointment?')) {
      await schedulerService.deleteAppointment(id);
      fetchAppointments();
      setShowModal(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-indigo-400">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Scheduler</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] italic">Clinical Availability Matrix</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-2xl border border-slate-200">
          <button 
            onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() - 1);
              setCurrentDate(d.toISOString().split('T')[0]);
            }}
            className="p-2 hover:bg-white rounded-lg transition"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="px-6 font-black uppercase tracking-widest text-xs">{new Date(currentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
          <button 
            onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() + 1);
              setCurrentDate(d.toISOString().split('T')[0]);
            }}
            className="p-2 hover:bg-white rounded-lg transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition"
          >
            <Settings size={20} />
          </button>
          <button 
            onClick={() => {
              // Find first empty slot today starting from now
              const now = new Date();
              const isToday = currentDate === now.toISOString().split('T')[0];
              const currentHour = now.getHours();
              const currentMin = now.getMinutes();
              
              let found = false;
              for (let h of HOURS) {
                // If checking today, skip past hours/minutes
                if (isToday && h < currentHour) continue;
                
                for (let m of [0, 20, 40]) {
                  if (isToday && h === currentHour && m <= currentMin) continue;
                  
                  const searchStart = h * 60 + m;
                  const searchEnd = searchStart + 20;

                  const conflict = appointments.some(a => {
                    const [ah, am] = a.time.split(':').map(Number);
                    const aStart = ah * 60 + am;
                    const aEnd = aStart + (a.duration || 20);
                    return (searchStart < aEnd && searchEnd > aStart);
                  });

                  if (!conflict) {
                    handleSlotClick(h, m);
                    found = true;
                    break;
                  }
                }
                if (found) break;
              }
              if (!found) alert('No slots available starting from this point.');
            }}
            className="px-6 py-3 bg-white border border-slate-200 text-indigo-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition shadow-sm"
          >
            Find Next Available
          </button>
          <button 
            onClick={() => {
              const now = new Date();
              handleSlotClick(now.getHours(), 0);
            }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
          >
            Quick Add
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden flex relative">
          {/* Time Column */}
          <div className="w-24 border-r border-slate-100 bg-slate-50/50 shrink-0">
             {HOURS.map(hour => (
               <div key={hour} className="h-24 border-b border-slate-100 flex flex-col items-center justify-start py-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase">{hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}</span>
               </div>
             ))}
          </div>

          {/* Slots View */}
          <div className="flex-1 relative">
             {HOURS.map(hour => (
               <div key={hour} className="h-24 border-b border-slate-100 relative group">
                  {/* 20 min increments slots */}
                  {/* Slot 1: :00 */}
                  <div 
                    className={cn(
                      "absolute inset-x-0 top-0 h-1/3 cursor-pointer hover:bg-sky-100/80 transition-colors",
                      hour === 9 && "bg-slate-50/50 cursor-not-allowed opacity-50"
                    )} 
                    onClick={() => hour !== 9 && handleSlotClick(hour, 0)}
                  >
                    {hour === 9 && (
                      <div className="flex items-center justify-center h-full">
                        <Lock size={12} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                  
                  {/* Slot 2: :20 */}
                  <div 
                    className="absolute inset-x-0 top-1/3 h-1/3 cursor-pointer border-t border-slate-50 border-dashed hover:bg-sky-100/80 transition-colors" 
                    onClick={() => handleSlotClick(hour, 20)}
                  ></div>
                  
                  {/* Slot 3: :40 */}
                  <div 
                    className="absolute inset-x-0 top-2/3 h-1/3 cursor-pointer border-t border-slate-50 border-dashed hover:bg-sky-100/80 transition-colors" 
                    onClick={() => handleSlotClick(hour, 40)}
                  ></div>
                  
                  {/* Subtle dividers */}
                  <div className="absolute top-1/3 inset-x-0 h-px border-t border-slate-50 border-dashed pointer-events-none"></div>
                  <div className="absolute top-2/3 inset-x-0 h-px border-t border-slate-50 border-dashed pointer-events-none"></div>
               </div>
             ))}

             {/* Dynamic Appointments */}
             {appointments.map(appt => {
               const [h, m] = appt.time.split(':').map(Number);
               const top = ((h - 9) * 96) + (m / 60 * 96);
               const height = (appt.duration / 60 * 96);
               const bgColor = typeColors[appt.type] || '#6366f1';
               const isBlocked = appt.type === 'block_off';

               return (
                 <motion.div
                   key={appt.id}
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   onDoubleClick={() => handleApptDoubleClick(appt)}
                   style={{ 
                     top, 
                     height: Math.max(height, 32),
                     backgroundColor: isBlocked ? '#475569' : `${bgColor}20`,
                     borderColor: bgColor,
                     borderLeftWidth: '6px'
                   }}
                   className={cn(
                     "absolute left-4 right-4 rounded-xl border border-l-8 p-3 shadow-sm cursor-pointer hover:shadow-md transition-all group overflow-hidden",
                     isBlocked ? "text-white" : "text-slate-800"
                   )}
                 >
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-2">
                          {isBlocked ? <Lock size={12} /> : <User size={12} className="opacity-50" />}
                          <span className="text-[10px] font-black uppercase tracking-widest truncate">
                             {appt.patientName || appt.reason || 'Restricted'}
                          </span>
                       </div>
                       <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold opacity-50">{appt.time}</span>
                          {appt.confirmed && <CheckCircle2 size={10} className="text-emerald-500" />}
                          {appt.initials && <span className="text-[8px] font-black bg-white/40 px-1 rounded">{appt.initials}</span>}
                       </div>
                    </div>
                    {height > 40 && (
                      <p className={cn("text-[9px] mt-1 font-medium truncate opacity-70 italic")}>
                        {appt.notes || APPOINTMENT_TYPES.find(t => t.id === appt.type)?.label}
                      </p>
                    )}
                 </motion.div>
               );
             })}
          </div>

          {/* Side Legend */}
          <div className="w-64 border-l border-slate-100 p-6 bg-slate-50/30 overflow-y-auto hidden lg:block">
             <h3 className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 mb-6">Legend / Color Map</h3>
             <div className="space-y-4">
                {APPOINTMENT_TYPES.map(type => (
                  <div key={type.id} className="flex flex-col gap-1">
                     <div className="flex items-center gap-3">
                        <input 
                           type="color" 
                           value={typeColors[type.id]} 
                           onChange={(e) => setTypeColors({...typeColors, [type.id]: e.target.value})}
                           className="w-4 h-4 rounded-full border-none p-0 cursor-pointer overflow-hidden accent-transparent" 
                        />
                        <span className="text-[9px] font-black uppercase tracking-tight text-slate-600 leading-tight">{type.label}</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <AppointmentModal 
            slot={selectedSlot}
            appt={selectedAppt}
            onClose={() => setShowModal(false)}
            onSave={() => { fetchAppointments(); setShowModal(false); }}
            onDelete={handleDelete}
            date={currentDate}
            existingAppointments={appointments}
          />
        )}
        {showSettingsModal && (
          <SettingsModal 
            typeColors={typeColors}
            onUpdateColors={setTypeColors}
            onClose={() => setShowSettingsModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const SettingsModal = ({ typeColors, onUpdateColors, onClose }: any) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-sm bg-white rounded-[32px] shadow-2xl relative overflow-hidden border-4 border-slate-900"
      >
         <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
            <div>
               <h2 className="text-xl font-black uppercase tracking-tighter">Scheduler Settings</h2>
               <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[4px]">Legend Optimization</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition">
               <X size={20} />
            </button>
         </div>

         <div className="p-6 space-y-6">
            <div className="space-y-4">
               <h3 className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Exam Type Legend Colors</h3>
               <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {APPOINTMENT_TYPES.map(type => (
                    <div key={type.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition">
                       <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: typeColors[type.id] }}
                          />
                          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight leading-tight">{type.label}</span>
                       </div>
                       <input 
                          type="color" 
                          value={typeColors[type.id]} 
                          onChange={(e) => onUpdateColors({...typeColors, [type.id]: e.target.value})}
                          className="w-8 h-8 rounded-lg border-none p-0 cursor-pointer overflow-hidden bg-transparent" 
                       />
                    </div>
                  ))}
               </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[4px] text-[10px] hover:bg-slate-800 transition"
            >
               Close Settings
            </button>
         </div>
      </motion.div>
    </div>
  );
};

const AppointmentModal = ({ slot, appt, onClose, onSave, onDelete, date, existingAppointments = [] }: any) => {
  const [formData, setFormData] = useState({
    patientName: appt?.patientName || '',
    patientId: appt?.patientId || '',
    phone: appt?.phone || '',
    dob: appt?.dob || '',
    insurance: appt?.insurance || '',
    time: appt?.time || (slot ? `${String(slot.hour).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')}` : '09:00'),
    type: appt?.type || 'new_patient',
    duration: appt?.duration || 20,
    notes: appt?.notes || '',
    status: appt?.status || 'pending',
    confirmed: appt?.confirmed || false,
    confirmationStatus: appt?.confirmationStatus || 'Pending',
    initials: appt?.initials || '',
    date: appt?.date || date
  });
  const [loading, setLoading] = useState(false);
  const [patientResults, setPatientResults] = useState<any[]>([]);
  const [isNewPatient, setIsNewPatient] = useState(!appt?.patientId && appt?.patientName);

  const handlePatientSearch = async (val: string) => {
    setFormData(prev => ({ ...prev, patientName: val, patientId: '' }));
    if (val.length > 2) {
      const all: any[] = await patientService.getAllPatients();
      const filtered = all.filter((p: any) => 
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(val.toLowerCase())
      );
      setPatientResults(filtered.slice(0, 5));
    } else {
      setPatientResults([]);
    }
  };

  const selectPatient = (p: any) => {
    setFormData(prev => ({ 
      ...prev, 
      patientName: `${p.firstName} ${p.lastName}`,
      patientId: p.id,
      phone: p.phone || '',
      dob: p.dob || '',
      insurance: p.insuranceProvider || ''
    }));
    setPatientResults([]);
    setIsNewPatient(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.type !== 'block_off') {
      if (!formData.patientName || !formData.phone || !formData.dob || !formData.insurance) {
        alert('Missing required fields: Name, Phone, DOB, and Insurance are mandatory.');
        return;
      }
    }

    // Double booking prevention
    const [newH, newM] = formData.time.split(':').map(Number);
    const newStart = newH * 60 + newM;
    const newEnd = newStart + formData.duration;

    const hasOverlap = existingAppointments.some((a: any) => {
      // Don't check against self if updating
      if (appt && a.id === appt.id) return false;
      
      const [exH, exM] = a.time.split(':').map(Number);
      const exStart = exH * 60 + exM;
      const exEnd = exStart + a.duration;

      // Conflict if: New starts inside existing OR Existing starts inside new
      return (newStart < exEnd && newEnd > exStart);
    });

    if (hasOverlap) {
      alert('CONFLICT: This time slot overlaps with an existing appointment. Please choose a different time or duration.');
      return;
    }

    setLoading(true);
    try {
      if (appt) {
        // In a real app we'd have schedulerService.updateAppointment
        // For now we'll delete and recreate or just simulate update
        await schedulerService.deleteAppointment(appt.id);
        await schedulerService.createAppointment(formData);
      } else {
        let pId = formData.patientId;
        if (!pId && formData.type !== 'block_off') {
          // Check if patient exists by name/dob before creating new?
          // For simplicity, we create new if no pId
          const names = formData.patientName.split(' ');
          const res = await patientService.createPatient({
            firstName: names[0] || 'Unknown',
            lastName: names.slice(1).join(' ') || 'Patient',
            phone: formData.phone,
            dob: formData.dob,
            insuranceProvider: formData.insurance,
            status: 'Lead',
            registeredFromScheduler: true
          });
          pId = res.id;
        }

        await schedulerService.createAppointment({
          ...formData,
          patientId: pId
        });
      }
      onSave();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md bg-white rounded-[32px] shadow-2xl relative overflow-hidden border-4 border-slate-900"
      >
         <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
            <div>
               <h2 className="text-xl font-black uppercase tracking-tighter">
                  {appt ? 'Appointment Details' : 'Designate Slot'}
               </h2>
               <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[4px]">Temporal Registry Interface</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition">
               <X size={20} />
            </button>
         </div>

         <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSave} className="p-6 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Encounter Type</label>
                     <select 
                        className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl font-black uppercase tracking-widest text-xs outline-none focus:border-indigo-600 transition"
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                     >
                        {APPOINTMENT_TYPES.map(t => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                     </select>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration (Min)</label>
                     <input 
                        type="number"
                        step="20"
                        className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl font-black outline-none focus:border-indigo-600 transition"
                        value={formData.duration}
                        onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                     />
                  </div>
               </div>

               {formData.type !== 'block_off' && (
                 <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex justify-between">
                         Patient Identity
                         <span className="text-red-500">* Required</span>
                      </label>
                      <div className="relative">
                         <input 
                            className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl font-black outline-none focus:border-indigo-600 transition"
                            placeholder="Search or enter full name..."
                            value={formData.patientName}
                            onChange={e => handlePatientSearch(e.target.value)}
                         />
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                            <User size={18} />
                         </div>

                  <AnimatePresence>
                    {patientResults.length > 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] overflow-hidden"
                      >
                        {patientResults.map(p => (
                          <button 
                            key={p.id}
                            type="button"
                            onClick={() => selectPatient(p)}
                            className="w-full text-left px-6 py-4 hover:bg-slate-50 border-b border-slate-50 last:border-none transition"
                          >
                            <p className="font-black uppercase text-xs text-slate-800">{p.firstName} {p.lastName}</p>
                            <p className="text-[10px] font-bold text-slate-400">DOB: {p.dob} • {p.phone}</p>
                          </button>
                        ))}
                      </motion.div>
                    ) : formData.patientName.length > 2 && !formData.patientId && formData.type !== 'block_off' ? (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] overflow-hidden"
                      >
                        <button 
                          type="button"
                          onClick={() => {
                            setIsNewPatient(true);
                            setPatientResults([]);
                          }}
                          className="w-full text-left px-6 py-5 hover:bg-indigo-50 border-b border-slate-50 transition group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition">
                              <Plus size={18} className="text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-black uppercase text-xs text-indigo-600">Add New Patient</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5">"{formData.patientName}" not found in system</p>
                            </div>
                          </div>
                        </button>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                       </div>
                    </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number *</label>
                       <input 
                          className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl font-black outline-none focus:border-indigo-600 transition"
                          placeholder="(555) 000-0000"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date of Birth *</label>
                       <input 
                          className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl font-black outline-none focus:border-indigo-600 transition"
                          placeholder="MM/DD/YYYY"
                          value={formData.dob}
                          onChange={e => setFormData({...formData, dob: e.target.value})}
                       />
                     </div>
                   </div>

                   <div className="space-y-1">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Insurance Type *</label>
                     <select 
                       className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl font-black uppercase tracking-widest text-xs outline-none focus:border-indigo-600 transition"
                       value={formData.insurance}
                       onChange={e => setFormData({...formData, insurance: e.target.value})}
                     >
                       <option value="">Select Insurance...</option>
                       <option value="None">None / Private Pay</option>
                       <option value="VSP">VSP</option>
                       <option value="EyeMed">EyeMed</option>
                       <option value="Spectera">Spectera</option>
                       <option value="Davis Vision">Davis Vision</option>
                       <option value="Superior Vision">Superior Vision</option>
                       <option value="Medicare">Medicare</option>
                       <option value="Medicaid">Medicaid</option>
                       <option value="BCBS">BCBS</option>
                       <option value="UnitedHealthcare">UnitedHealthcare</option>
                       <option value="Aetna">Aetna</option>
                       <option value="Cigna">Cigna</option>
                       <option value="Humana">Humana</option>
                     </select>
                   </div>
                 </div>
               )}

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Start Time</label>
                     <input 
                        type="time"
                        className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl font-black outline-none focus:border-indigo-600 transition"
                        value={formData.time}
                        onChange={e => setFormData({...formData, time: e.target.value})}
                     />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Arrival Status</label>
                     <select 
                        className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl font-black uppercase text-xs outline-none focus:border-indigo-600 transition"
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                     >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="arrived">Arrived</option>
                        <option value="no-show">No-show</option>
                        <option value="cancelled">Cancelled</option>
                     </select>
                  </div>
               </div>

               <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Appointment Confirmation</h3>
                  <div className="grid grid-cols-12 gap-4 items-end">
                     <div className="col-span-2 flex flex-col items-center gap-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Confirmed</label>
                        <input 
                           type="checkbox"
                           className="w-5 h-5 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500"
                           checked={formData.confirmed}
                           onChange={e => setFormData({...formData, confirmed: e.target.checked})}
                        />
                     </div>
                     <div className="col-span-10 space-y-1">
                        <div className="flex gap-4">
                           <div className="flex-1 space-y-1">
                              <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Outcome</label>
                              <select 
                                 className="w-full bg-white border border-slate-200 p-2 rounded-xl font-bold text-[10px] uppercase outline-none focus:border-indigo-600 transition"
                                 value={formData.confirmationStatus}
                                 onChange={e => setFormData({...formData, confirmationStatus: e.target.value})}
                              >
                                 <option value="Pending">Pending</option>
                                 <option value="Confirmed">Confirmed</option>
                                 <option value="Left message">Left message</option>
                                 <option value="No answer">No answer</option>
                              </select>
                           </div>
                           <div className="w-20 space-y-1">
                              <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Initials</label>
                              <input 
                                 className="w-full bg-white border border-slate-200 p-2 rounded-xl font-bold text-[10px] uppercase outline-none focus:border-indigo-600 transition text-center"
                                 placeholder="ID"
                                 maxLength={4}
                                 value={formData.initials}
                                 onChange={e => setFormData({...formData, initials: e.target.value.toUpperCase()})}
                              />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clinical Focus / Notes</label>
                  <textarea 
                     className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl font-medium text-sm outline-none focus:border-indigo-600 transition min-h-[60px]"
                     placeholder="Additional context..."
                     value={formData.notes}
                     onChange={e => setFormData({...formData, notes: e.target.value})}
                  />
               </div>


               <div className="flex gap-4 pt-4">
                  {appt && (
                    <button 
                     type="button"
                     onClick={() => onDelete(appt.id)}
                     className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition"
                    >
                       <Trash2 size={20} />
                    </button>
                  )}
                  <button 
                   type="submit"
                   disabled={loading}
                   className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[4px] text-[10px] hover:bg-bold hover:bg-indigo-700 transition shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                     {loading ? 'Processing...' : appt ? 'Update Registry' : 'Confirm Designation'} <CheckCircle2 size={18} />
                  </button>
               </div>
            </form>
         </div>
      </motion.div>
    </div>
  );
};
