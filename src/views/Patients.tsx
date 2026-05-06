import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  ChevronRight, 
  Filter, 
  MapPin, 
  Calendar, 
  ShieldCheck,
  User,
  ExternalLink,
  ArrowRight,
  Database,
  History,
  Info,
  Clock,
  Heart,
  Droplets,
  Activity,
  Eye,
  Stethoscope
} from 'lucide-react';
import { patientService } from '../services/db';
import { PatientChart } from './PatientChart';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const Patients = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    lastName: '',
    firstName: '',
    dob: ''
  });
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setSelectedPatientId(id);
    }
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await patientService.getAllPatients();
      setPatients(data);
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setHasSearched(true);
  };

  const seedDemoData = async () => {
    setLoading(true);
    try {
      await patientService.createPatient({
        firstName: 'Paul',
        lastName: 'Smith',
        dob: '1977-01-12',
        phone: '(403) 000-1111',
        email: 'paul.smith@example.com',
        gender: 'M',
        address: '123 Test Street NE',
        city: 'Calgary',
        state: 'AB',
        zipCode: 'T1Y 4P2',
        insuranceProvider: 'VSP',
        status: 'Active',
        reasonForVisit: 'Excessive Blinking, FB in eye, Lid irritation, Dryness in eyes',
        medicalConditions: { highBP: true, highCholesterol: true },
        diabetes: { hasDiabetes: false },
        ocularConditions: { dryEyes: true },
        dilationPreference: 'Agree'
      });
      await fetchPatients();
      alert("Demo patient 'Paul Smith' created successfully. Use the search to find him.");
    } catch (error) {
      console.error("Seed failed", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    if (!hasSearched) return false;
    const matchLast = p.lastName.toLowerCase().includes(searchParams.lastName.toLowerCase());
    const matchFirst = p.firstName.toLowerCase().includes(searchParams.firstName.toLowerCase());
    const matchDob = searchParams.dob ? p.dob === searchParams.dob : true;
    
    // Only return true if at least one field is filled, or if user explicitly clicked search
    return matchLast && matchFirst && matchDob;
  });

  if (selectedPatientId) {
    return <PatientChart id={selectedPatientId} onBack={() => setSelectedPatientId(null)} />;
  }

  return (
    <div className="bg-[#f0f2f5] min-h-screen">
      {/* Search Protocol Portal Header */}
      <header className="bg-white border-b border-slate-200 px-12 py-10">
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <div>
            <div className="flex items-center gap-4 mb-4">
               <div className="w-14 h-14 bg-slate-900 rounded-[20px] flex items-center justify-center text-indigo-400 border border-slate-700 shadow-xl">
                  <Search size={28} />
               </div>
               <div>
                  <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Patient Search</h1>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[6px] mt-2 italic">Central Identity Lookup Protocol</p>
               </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={seedDemoData}
              className="px-6 py-5 bg-emerald-50 text-emerald-700 rounded-2xl font-black uppercase tracking-[3px] text-[10px] hover:bg-emerald-100 transition flex items-center gap-3 border-b-4 border-emerald-200"
            >
              <Database size={16} /> Seed Demo Data
            </button>
            <button 
              onClick={() => setShowRegistration(true)}
              className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[3px] text-[10px] hover:bg-bold hover:bg-indigo-700 transition shadow-2xl shadow-indigo-100 flex items-center gap-3 border-b-4 border-indigo-800"
            >
              <Plus size={18} /> Register New Entry
            </button>
          </div>
        </div>
      </header>

      {/* Control Matrix Panel */}
      <div className="px-12 pt-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border-4 border-slate-900 rounded-[32px] p-10 shadow-2xl relative overflow-hidden">
             {/* Decorative Grid Overlay */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                   <div className="h-0.5 bg-slate-900 flex-1"></div>
                   <h3 className="text-[11px] font-black uppercase tracking-[5px] text-slate-400 flex items-center gap-3">
                      <Filter size={14} className="text-indigo-600" /> Selection Criteria
                   </h3>
                   <div className="h-0.5 bg-slate-900 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                   <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-[3px] text-slate-900 flex items-center gap-2">
                        Last Name <span className="text-indigo-500 font-mono text-[9px] font-normal tracking-normal truncate">(Match String)</span>
                      </label>
                      <input 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-indigo-600 transition font-black uppercase tracking-widest text-xs placeholder:text-slate-300 shadow-inner"
                        placeholder="Type surname..."
                        value={searchParams.lastName}
                        onChange={e => { setSearchParams({...searchParams, lastName: e.target.value}); setHasSearched(false); }}
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-[3px] text-slate-900 flex items-center gap-2">
                        First Name <span className="text-indigo-500 font-mono text-[9px] font-normal tracking-normal truncate">(Match String)</span>
                      </label>
                      <input 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-indigo-600 transition font-black uppercase tracking-widest text-xs placeholder:text-slate-300 shadow-inner"
                        placeholder="Type given name..."
                        value={searchParams.firstName}
                        onChange={e => { setSearchParams({...searchParams, firstName: e.target.value}); setHasSearched(false); }}
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-[3px] text-slate-900 flex items-center gap-2">
                        Date of Birth <span className="text-indigo-500 font-mono text-[9px] font-normal tracking-normal truncate">(ISO 8601)</span>
                      </label>
                      <input 
                        type="date"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-indigo-600 transition font-bold text-xs shadow-inner"
                        value={searchParams.dob}
                        onChange={e => { setSearchParams({...searchParams, dob: e.target.value}); setHasSearched(false); }}
                      />
                   </div>
                </div>

                <div className="mt-12 flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100">
                         <ShieldCheck size={14} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Master Auth Secure</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 group cursor-help">
                         <Info size={14} />
                         <span className="text-[9px] font-black uppercase tracking-widest underline decoration-dotted">F2 Shortcut Active</span>
                      </div>
                   </div>
                   
                   <div className="flex gap-4">
                      <button 
                        onClick={() => { setSearchParams({ lastName: '', firstName: '', dob: '' }); setHasSearched(false); }}
                        className="px-8 py-4 text-[10px] font-black uppercase tracking-[4px] text-slate-400 hover:text-slate-800 transition"
                      >Reset Matrix</button>
                      <button 
                        onClick={handleSearch}
                        className="px-16 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[5px] shadow-xl hover:bg-slate-800 transition transform active:scale-95"
                      >
                         Execute Search
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Result Space */}
      <div className="p-12">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {!hasSearched ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center opacity-30 border-4 border-dashed border-slate-200 rounded-[40px] py-32"
              >
                 <History size={80} className="mb-6 text-slate-200" />
                 <h2 className="text-2xl font-black uppercase tracking-[10px] text-slate-400">Registry Latency</h2>
                 <p className="text-[10px] font-bold uppercase tracking-[4px] mt-4">Awaiting Input Parameters for Data Retrieval</p>
              </motion.div>
            ) : loading ? (
              <motion.div 
                key="loading"
                className="flex flex-col items-center justify-center h-full py-40 gap-6"
              >
                 <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-8 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[8px] text-slate-400 animate-pulse">Syncing Master Node...</p>
              </motion.div>
            ) : filteredPatients.length > 0 ? (
               <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden"
               >
                  <div className="bg-slate-900 text-white px-10 py-6 flex justify-between items-center">
                     <h4 className="text-[11px] font-black uppercase tracking-[5px] text-indigo-400">Registry Snapshot: {filteredPatients.length} Matches Found</h4>
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[9px] font-black uppercase tracking-widest">Protocol Success</span>
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Legal Name</th>
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Geospatial / Address</th>
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Birth Protocol</th>
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Retrieve</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {filteredPatients.map(patient => (
                            <tr 
                              key={patient.id} 
                              onClick={() => setSelectedPatientId(patient.id)}
                              className="hover:bg-slate-50 transition-colors cursor-pointer group"
                            >
                               <td className="px-10 py-8">
                                  <div className="flex items-center gap-5">
                                     <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg border-2 border-indigo-500 shadow-lg group-hover:bg-indigo-600 transition-colors">
                                        {patient.lastName[0]}{patient.firstName[0]}
                                     </div>
                                     <div>
                                        <p className="text-lg font-black text-slate-800 tracking-tighter uppercase leading-none group-hover:text-indigo-600 transition-colors mb-1">{patient.lastName}, {patient.firstName}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">UID: <span className="font-mono text-indigo-500">{patient.id.slice(0, 8)}</span></p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-10 py-8">
                                  <p className="text-xs font-bold text-slate-600 leading-relaxed uppercase tracking-tight max-w-[200px] truncate">{patient.address || 'PROTOCOL_NULL'}</p>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">{patient.phone}</p>
                               </td>
                               <td className="px-10 py-8">
                                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl inline-block">
                                     <p className="text-sm font-black text-slate-800 flex items-center gap-2">
                                        <Calendar size={14} className="text-slate-300" /> {patient.dob}
                                     </p>
                                  </div>
                               </td>
                               <td className="px-10 py-8 text-center">
                                  <span className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[2px] rounded-full ring-1 ring-emerald-200">Active Map</span>
                               </td>
                               <td className="px-10 py-8 text-right">
                                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm ml-auto">
                                     <ArrowRight size={20} />
                                  </div>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                  </div>
               </motion.div>
            ) : (
              <motion.div 
                key="empty"
                className="h-full flex flex-col items-center justify-center text-center py-20"
              >
                 <div className="w-24 h-24 bg-slate-100 rounded-[40px] flex items-center justify-center text-slate-300 mb-8 border border-slate-200 border-dashed">
                    <Database size={40} />
                 </div>
                 <h2 className="text-2xl font-black uppercase tracking-[5px] text-slate-400">Zero Matches Identified</h2>
                 <p className="text-xs font-bold uppercase tracking-[2px] mt-2 italic text-slate-300">Criteria Matrix Resulted in Null Dataset</p>
                 <button 
                  onClick={() => { setSearchParams({ lastName: '', firstName: '', dob: '' }); setHasSearched(false); }}
                  className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[3px]"
                 >Clear Matrix</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {showRegistration && (
        <RegistrationModal 
          onClose={() => setShowRegistration(false)} 
          onSuccess={() => { fetchPatients(); setShowRegistration(false); }} 
        />
      )}
    </div>
  );
};

// ... RegistrationModal stays the same but with styled modal components ...
const RegistrationModal = ({ onClose, onSuccess }: any) => {
  const [formData, setFormData] = useState({
    registrationDate: new Date().toISOString().split('T')[0],
    lastExamDate: '',

    // I. Patient’s Personal Information
    lastName: '',
    firstName: '',
    middleInitial: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    dob: '',
    ssn: '',
    gender: 'M',
    maritalStatus: 'Single',
    employer: '',
    occupation: '',
    insuranceProvider: '',
    insuranceId: '',
    groupNumber: '',
    policyHolderName: '',

    // II. Patient Social & Medical History
    bloodPressure: '',
    height: '',
    weight: '',
    doesDrive: false,
    usesTobacco: false,
    drinksAlcohol: false,
    usesIllegalDrugs: false,
    hadBloodTransfusion: false,
    medicalConditions: {
      allergies: false,
      arthritis: false,
      asthma: false,
      bronchitis: false,
      emphysema: false,
      heartDisease: false,
      highBP: false,
      highCholesterol: false,
      thyroid: false,
    },
    diabetes: {
      hasDiabetes: false,
      type: '1',
      lastA1C: ''
    },
    medicationAllergies: {
      hasAllergies: false,
      details: ''
    },
    currentMedications: '',

    // III. Ocular (Eye) History
    ocularConditions: {
      amblyopia: false,
      blindness: false,
      blurredVision: false,
      cataracts: false,
      discharge: false,
      doubleVision: false,
      dryEyes: false,
      eyePain: false,
      flashesFloaters: false,
      glaucoma: false,
      itchyEyes: false,
      macularDegeneration: false,
      strabismus: false,
      styEyelidBump: false,
      wateryEyes: false,
    },

    // IV. Dilation Preference
    dilationPreference: 'Agree',

    // V. Family Medical & Ocular History
    familyHistory: {
      blindness: false,
      cancer: false,
      cataracts: false,
      diabetes: false,
      heartDisease: false,
      highBP: false,
      highCholesterol: false,
      glaucoma: false,
      macularDegeneration: false,
      retinalDetachment: false,
      strabismus: false,
      thyroid: false,
    },

    // VI. Provider Information
    familyDoctor: '',
    pharmacyLocation: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await patientService.createPatient(formData);
      onSuccess();
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  const toggleCheck = (section: string, key: string) => {
    setFormData(prev => ({
      ...prev,
      // @ts-ignore
      [section]: {
        // @ts-ignore
        ...prev[section],
        // @ts-ignore
        [key]: !prev[section][key]
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border-8 border-slate-900 flex flex-col max-h-[95vh]">
        <div className="p-8 bg-slate-900 text-white flex justify-between items-center shrink-0">
           <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">New Patient Registration</h2>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[5px] mt-1 italic">Identity & Metric Synchronization Protocol</p>
           </div>
           <button onClick={onClose} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition">Esc</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-12 overflow-y-auto custom-scrollbar">
           {/* HEADER METRICS */}
           <div className="grid grid-cols-2 gap-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entry Timestamp</label>
                 <input type="date" className="w-full bg-white px-4 py-3 border border-slate-200 rounded-xl font-bold" value={formData.registrationDate} readOnly />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Previous Visual Encounter</label>
                 <input 
                    type="date" 
                    className="w-full bg-white px-4 py-3 border border-slate-200 rounded-xl font-bold focus:border-indigo-600 outline-none transition" 
                    value={formData.lastExamDate} 
                    onChange={e => setFormData({...formData, lastExamDate: e.target.value})}
                 />
              </div>
           </div>

           {/* SECTION I: PERSONAL */}
           <div className="space-y-8">
              <div className="flex items-center gap-6">
                 <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-indigo-400"><User size={20} /></div>
                 <h4 className="text-[12px] font-black uppercase tracking-[6px] text-slate-900">01. Patient Personal Identity</h4>
                 <div className="h-0.5 flex-1 bg-slate-100"></div>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Name</label>
                    <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition font-black uppercase" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">First Name</label>
                    <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition font-black uppercase" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">M.I.</label>
                    <input maxLength={1} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition font-black uppercase" value={formData.middleInitial} onChange={e => setFormData({...formData, middleInitial: e.target.value})} />
                 </div>
              </div>

              <div className="grid grid-cols-4 gap-6">
                 <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Address line</label>
                    <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition font-bold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">City</label>
                    <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition font-bold" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">State</label>
                       <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition font-bold" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Zip</label>
                       <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition font-bold" value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})} />
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-4 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">DOB</label>
                    <input required type="date" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition font-bold" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SSN</label>
                    <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition font-bold" value={formData.ssn} onChange={e => setFormData({...formData, ssn: e.target.value})} placeholder="XXX-XX-XXXX" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Biological Sex</label>
                    <div className="flex bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden p-1">
                       <button type="button" onClick={() => setFormData({...formData, gender: 'M'})} className={cn("flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition", formData.gender === 'M' ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-100")}>Male</button>
                       <button type="button" onClick={() => setFormData({...formData, gender: 'F'})} className={cn("flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition", formData.gender === 'F' ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-100")}>Female</button>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Marital Status</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition uppercase font-black tracking-widest text-[10px]" value={formData.maritalStatus} onChange={e => setFormData({...formData, maritalStatus: e.target.value})}>
                       <option>Single</option><option>Married</option><option>Divorced</option><option>Separated</option><option>Widowed</option>
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6 bg-slate-900 rounded-3xl p-8 border-b-4 border-indigo-600">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Insurance Provider</label>
                    <input className="w-full bg-slate-800 border-none rounded-2xl px-6 py-4 text-white font-black uppercase tracking-widest placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 transition" placeholder="CARRIER NAME" value={formData.insuranceProvider} onChange={e => setFormData({...formData, insuranceProvider: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Member ID / Policy #</label>
                       <input className="w-full bg-slate-800 border-none rounded-2xl px-6 py-4 text-white font-mono placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 transition" placeholder="ID_9422X" value={formData.insuranceId} onChange={e => setFormData({...formData, insuranceId: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Group #</label>
                       <input className="w-full bg-slate-800 border-none rounded-2xl px-6 py-4 text-white font-mono placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 transition" placeholder="GRP_01" value={formData.groupNumber} onChange={e => setFormData({...formData, groupNumber: e.target.value})} />
                    </div>
                 </div>
              </div>
           </div>

           {/* SECTION II: SOCIAL & MEDICAL */}
           <div className="space-y-8">
              <div className="flex items-center gap-6">
                 <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-indigo-400"><Activity size={20} /></div>
                 <h4 className="text-[12px] font-black uppercase tracking-[6px] text-slate-900">02. Social & Medical History</h4>
                 <div className="h-0.5 flex-1 bg-slate-100"></div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Blood Pressure</label>
                    <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition font-bold" placeholder="120/80" value={formData.bloodPressure} onChange={e => setFormData({...formData, bloodPressure: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Height (cm/in)</label>
                    <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition font-bold" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weight (kg/lb)</label>
                    <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition font-bold" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
                 </div>
              </div>

              <div className="grid grid-cols-5 gap-4">
                 {[
                    { label: 'Drives', key: 'doesDrive' },
                    { label: 'Tobacco', key: 'usesTobacco' },
                    { label: 'Alcohol', key: 'drinksAlcohol' },
                    { label: 'Illegal Drugs', key: 'usesIllegalDrugs' },
                    { label: 'Transfusion', key: 'hadBloodTransfusion' }
                 ].map(item => (
                    <button 
                       key={item.key}
                       type="button" 
                       onClick={() => setFormData({...formData, [item.key]: !formData[item.key as keyof typeof formData]})}
                       className={cn(
                          "py-4 px-2 rounded-2xl border transition text-[10px] font-black uppercase tracking-tighter",
                          formData[item.key as keyof typeof formData] ? "bg-indigo-600 border-indigo-700 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                       )}
                    >
                       {item.label}
                    </button>
                 ))}
              </div>

              <div className="space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Identify Active Conditions</p>
                 <div className="grid grid-cols-3 gap-3">
                    {[
                       { label: 'Allergies / Hay Fever', key: 'allergies' },
                       { label: 'Arthritis, Rheumatoid', key: 'arthritis' },
                       { label: 'Asthma', key: 'asthma' },
                       { label: 'Bronchitis', key: 'bronchitis' },
                       { label: 'Emphysema', key: 'emphysema' },
                       { label: 'Heart Disease', key: 'heartDisease' },
                       { label: 'High Blood Pressure', key: 'highBP' },
                       { label: 'High Cholesterol', key: 'highCholesterol' },
                       { label: 'Thyroid Disease', key: 'thyroid' }
                    ].map(condition => (
                       <label key={condition.key} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition group">
                          <input 
                             type="checkbox" 
                             className="w-5 h-5 rounded-lg accent-indigo-600" 
                             checked={formData.medicalConditions[condition.key as keyof typeof formData.medicalConditions]} 
                             onChange={() => toggleCheck('medicalConditions', condition.key)}
                          />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{condition.label}</span>
                       </label>
                    ))}
                 </div>
              </div>

              <div className="p-8 bg-indigo-50/50 border border-indigo-100 rounded-[32px] grid grid-cols-3 gap-8">
                 <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", formData.diabetes.hasDiabetes ? "bg-indigo-600 text-white" : "bg-white text-slate-200")}>
                       <Droplets size={24} />
                    </div>
                    <div>
                       <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Diabetes Matrix</p>
                       <label className="flex items-center gap-2 mt-1 cursor-pointer">
                          <input type="checkbox" checked={formData.diabetes.hasDiabetes} onChange={() => setFormData({...formData, diabetes: {...formData.diabetes, hasDiabetes: !formData.diabetes.hasDiabetes}})} className="w-4 h-4 accent-indigo-600" />
                          <span className="text-[10px] font-bold text-slate-400">Flag positive</span>
                       </label>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-indigo-400">Class Type</label>
                    <div className="flex bg-white rounded-xl p-1 border border-indigo-100">
                       <button type="button" onClick={() => setFormData({...formData, diabetes: {...formData.diabetes, type: '1'}})} className={cn("flex-1 py-2 text-[9px] font-black rounded-lg transition", formData.diabetes.type === '1' ? "bg-indigo-600 text-white" : "text-slate-400")}> TYPE 1</button>
                       <button type="button" onClick={() => setFormData({...formData, diabetes: {...formData.diabetes, type: '2'}})} className={cn("flex-1 py-2 text-[9px] font-black rounded-lg transition", formData.diabetes.type === '2' ? "bg-indigo-600 text-white" : "text-slate-400")}> TYPE 2</button>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-indigo-400">Last A1C Metric</label>
                    <input className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600 font-bold" placeholder="Value..." value={formData.diabetes.lastA1C} onChange={e => setFormData({...formData, diabetes: {...formData.diabetes, lastA1C: e.target.value}})} disabled={!formData.diabetes.hasDiabetes} />
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[11px] font-black uppercase tracking-[4px] text-slate-900">Current Medications & Ocular Drops</label>
                 <textarea 
                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[24px] focus:border-indigo-600 outline-none transition font-medium text-sm min-h-[120px] placeholder:text-slate-300" 
                    placeholder="List all active prescriptions, vitamins, and supplements..."
                    value={formData.currentMedications}
                    onChange={e => setFormData({...formData, currentMedications: e.target.value})}
                 ></textarea>
              </div>
           </div>

           {/* SECTION III: OCULAR HISTORY */}
           <div className="space-y-8">
              <div className="flex items-center gap-6">
                 <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-indigo-400"><Eye size={20} /></div>
                 <h4 className="text-[12px] font-black uppercase tracking-[6px] text-slate-900">03. Ocular (Eye) History</h4>
                 <div className="h-0.5 flex-1 bg-slate-100"></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                 {[
                    { label: 'Amblyopia (lazy eye)', key: 'amblyopia' },
                    { label: 'Blindness / Loss', key: 'blindness' },
                    { label: 'Blurred Vision', key: 'blurredVision' },
                    { label: 'Cataracts', key: 'cataracts' },
                    { label: 'Discharge (yellow/green)', key: 'discharge' },
                    { label: 'Double Vision', key: 'doubleVision' },
                    { label: 'Dry / Sandy / Gritty', key: 'dryEyes' },
                    { label: 'Eye Pain / Soreness', key: 'eyePain' },
                    { label: 'Flashes / Floaters', key: 'flashesFloaters' },
                    { label: 'Glaucoma', key: 'glaucoma' },
                    { label: 'Itchy Eyes', key: 'itchyEyes' },
                    { label: 'Macular Degeneration', key: 'macularDegeneration' },
                    { label: 'Strabismus (eye turn)', key: 'strabismus' },
                    { label: 'Sty / Eyelid Bump', key: 'styEyelidBump' },
                    { label: 'Watery Eyes', key: 'wateryEyes' }
                 ].map(condition => (
                    <label key={condition.key} className="flex items-center gap-3 p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 cursor-pointer hover:bg-indigo-50 transition group transition-all active:scale-[0.98]">
                       <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded-lg accent-indigo-600" 
                          checked={formData.ocularConditions[condition.key as keyof typeof formData.ocularConditions]} 
                          onChange={() => toggleCheck('ocularConditions', condition.key)}
                       />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{condition.label}</span>
                    </label>
                 ))}
              </div>
           </div>

           {/* SECTION IV: DILATION */}
           <div className="p-10 bg-slate-900 rounded-[40px] text-white">
              <div className="flex items-center gap-6 mb-8">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition"><Clock size={24} /></div>
                 <h4 className="text-[14px] font-black uppercase tracking-[8px] text-white">IV. Dilation Consent Protocol</h4>
              </div>
              <p className="text-xs font-bold text-slate-400 leading-relaxed mb-10 max-w-2xl border-l-4 border-indigo-500 pl-6 uppercase">
                 Dilating the pupils is the medical standard of care. It allows the clinician to fully examine the retina for signs of disease, which can occur without symptoms and lead to permanent vision loss if untreated.
              </p>
              <div className="grid grid-cols-2 gap-6">
                 <button 
                    type="button" 
                    onClick={() => setFormData({...formData, dilationPreference: 'Agree'})}
                    className={cn(
                       "p-8 rounded-[32px] border-4 transition-all text-left group",
                       formData.dilationPreference === 'Agree' ? "bg-indigo-600 border-white text-white" : "bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-800/80"
                    )}
                 >
                    <div className="flex justify-between items-start mb-4">
                       <h5 className="font-black uppercase tracking-widest">I AGREE TO BE DILATED</h5>
                       <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", formData.dilationPreference === 'Agree' ? "border-white bg-white" : "border-slate-600")}>
                          {formData.dilationPreference === 'Agree' && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
                       </div>
                    </div>
                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">(Highly Recommended Protocol)</p>
                 </button>
                 <button 
                    type="button" 
                    onClick={() => setFormData({...formData, dilationPreference: 'Decline'})}
                    className={cn(
                       "p-8 rounded-[32px] border-4 transition-all text-left",
                       formData.dilationPreference === 'Decline' ? "bg-slate-100 border-white text-slate-900" : "bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-800/80"
                    )}
                 >
                    <div className="flex justify-between items-start mb-4">
                       <h5 className="font-black uppercase tracking-widest">I PREFER NOT TO BE DILATED</h5>
                       <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", formData.dilationPreference === 'Decline' ? "border-slate-900 bg-slate-900" : "border-slate-600")}></div>
                    </div>
                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">I ASSUME ALL RESPONSIBILITY FOR OPTING OUT</p>
                 </button>
              </div>
           </div>

           {/* SECTION V: FAMILY HISTORY */}
           <div className="space-y-8">
              <div className="flex items-center gap-6">
                 <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-indigo-400"><Heart size={20} /></div>
                 <h4 className="text-[12px] font-black uppercase tracking-[6px] text-slate-900">05. Family Medical & Ocular History</h4>
                 <div className="h-0.5 flex-1 bg-slate-100"></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                 {[
                    { label: 'Blindness', key: 'blindness' },
                    { label: 'Cancer', key: 'cancer' },
                    { label: 'Cataracts', key: 'cataracts' },
                    { label: 'Diabetes', key: 'diabetes' },
                    { label: 'Heart Disease', key: 'heartDisease' },
                    { label: 'High Blood Pressure', key: 'highBP' },
                    { label: 'High Cholesterol', key: 'highCholesterol' },
                    { label: 'Glaucoma', key: 'glaucoma' },
                    { label: 'Macular Degeneration', key: 'macularDegeneration' },
                    { label: 'Retinal Detachment', key: 'retinalDetachment' },
                    { label: 'Strabismus (eye turn)', key: 'strabismus' },
                    { label: 'Thyroid Disease', key: 'thyroid' }
                 ].map(condition => (
                    <label key={condition.key} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition group transition-all active:scale-[0.98]">
                       <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded-lg accent-indigo-600" 
                          checked={formData.familyHistory[condition.key as keyof typeof formData.familyHistory]} 
                          onChange={() => toggleCheck('familyHistory', condition.key)}
                       />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{condition.label}</span>
                    </label>
                 ))}
              </div>
           </div>

           {/* SECTION VI: PROVIDERS */}
           <div className="space-y-8">
              <div className="flex items-center gap-6">
                 <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-indigo-400"><Stethoscope size={20} /></div>
                 <h4 className="text-[12px] font-black uppercase tracking-[6px] text-slate-900">06. Provider Information</h4>
                 <div className="h-0.5 flex-1 bg-slate-100"></div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-[4px] text-slate-900">Name of Family Doctor</label>
                    <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition font-bold" value={formData.familyDoctor} onChange={e => setFormData({...formData, familyDoctor: e.target.value})} />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-[4px] text-slate-900">Pharmacy (and Location)</label>
                    <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition font-bold" value={formData.pharmacyLocation} onChange={e => setFormData({...formData, pharmacyLocation: e.target.value})} />
                 </div>
              </div>
           </div>
           
           {/* SUBMIT */}
           <div className="pt-20 border-t border-slate-100 mt-12 shrink-0">
             <div className="flex gap-6">
                <button type="button" onClick={onClose} className="flex-1 py-6 bg-slate-100 text-slate-400 rounded-[32px] font-black uppercase tracking-[8px] text-[12px] hover:bg-slate-200 hover:text-slate-600 transition ring-8 ring-slate-50">DISCARD_ENTRY</button>
                <button type="submit" className="flex-1 py-6 bg-indigo-600 text-white rounded-[32px] font-black uppercase tracking-[8px] text-[12px] hover:bg-indigo-700 transition shadow-2xl shadow-indigo-100 flex items-center justify-center gap-4 ring-8 ring-indigo-50 transform active:scale-95 transition-transform">
                   <ShieldCheck size={20} /> SYNC_TO_NODES
                </button>
             </div>
           </div>
        </form>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};
