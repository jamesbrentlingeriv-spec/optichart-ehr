import React, { useState, useRef, useEffect } from 'react';
import { 
  Save, 
  ArrowLeft, 
  Eye, 
  Activity, 
  FileText,
  Camera,
  Printer,
  ChevronRight,
  Plus,
  Trash2,
  Stethoscope,
  Clipboard,
  History,
  FileEdit,
  User,
  Heart,
  AlertCircle,
  Calendar,
  Search,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fileService, patientService } from '../services/db';
import { motion, AnimatePresence } from 'framer-motion';

// --- SUB-COMPONENTS ---

const SectionHeader = ({ icon: Icon, title, subtitle }: any) => (
  <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
      <Icon size={16} />
    </div>
    <div>
      <h3 className="text-[10px] font-black uppercase tracking-[3px] text-slate-800">{title}</h3>
      {subtitle && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>}
    </div>
  </div>
);

const EyeInputGroup = ({ label, od, os, fields, onChange, segment }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">{label}</p>
    <div className="space-y-4 flex-1">
      {['od', 'os'].map((eye) => (
        <div key={eye} className="flex items-center gap-3">
          <span className="text-[10px] font-black text-indigo-600 uppercase w-6">{eye}</span>
          <div className="grid grid-cols-4 gap-2 flex-1">
            {fields.map((f: string) => (
              <div key={f} className="space-y-1">
                <p className="text-[8px] font-bold text-slate-300 uppercase text-center">{f}</p>
                <input 
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-1.5 text-center font-mono text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  value={eye === 'od' ? (od?.[f] || '') : (os?.[f] || '')}
                  onChange={(e) => onChange(segment, eye, f, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SegmentMatrix = ({ label, od, os, fields, onChange, segment }: any) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full">
    <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex justify-between items-center">
      <p className="text-[10px] font-black uppercase tracking-[2px] text-slate-500">{label}</p>
      <div className="flex gap-12 mr-8">
        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest w-24 text-center">Right (OD)</span>
        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest w-24 text-center">Left (OS)</span>
      </div>
    </div>
    <div className="divide-y divide-slate-50">
      {fields.map((f: string) => (
        <div key={f} className="grid grid-cols-12 gap-4 items-center px-5 py-2.5 hover:bg-slate-50/50 transition">
          <span className="col-span-3 text-[10px] font-bold text-slate-700 uppercase tracking-tight">{f}</span>
          
          {/* OD Column */}
          <div className="col-span-4 flex items-center gap-3">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                checked={od[f]?.checked || false}
                onChange={(e) => onChange(segment, 'od', f, { ...od[f], checked: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
              />
            </div>
            <input 
              className={cn(
                "flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100",
                od[f]?.checked ? "opacity-100" : "opacity-40 italic font-normal"
              )}
              value={od[f]?.note || ''}
              onChange={(e) => onChange(segment, 'od', f, { ...od[f], note: e.target.value })}
              placeholder={od[f]?.checked ? "Clinical details..." : "WNL"}
            />
          </div>

          <div className="col-span-1 flex justify-center opacity-20">
            <div className="w-px h-6 bg-slate-300" />
          </div>

          {/* OS Column */}
          <div className="col-span-4 flex items-center gap-3">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                checked={os[f]?.checked || false}
                onChange={(e) => onChange(segment, 'os', f, { ...os[f], checked: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
              />
            </div>
            <input 
              className={cn(
                "flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100",
                os[f]?.checked ? "opacity-100" : "opacity-40 italic font-normal"
              )}
              value={os[f]?.note || ''}
              onChange={(e) => onChange(segment, 'os', f, { ...os[f], note: e.target.value })}
              placeholder={os[f]?.checked ? "Clinical details..." : "WNL"}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const ExamForm = ({ patientId, onBack, onSave }: any) => {
  const [activeTab, setActiveTab] = useState('clinical');
  const [patient, setPatient] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    details: { type: 'Comprehensive Adult', doctor: '', cc: '', optician: '' },
    social: { alcohol: false, smoking: false, drugs: false, computer: false, glasses: false, contacts: false, occupation: '', familyDr: '', alerts: '' },
    histories: { pohx: [], fohx: [], pmhx: [], fmhx: [], rxo: [], rxs: [], allergies: [] },
    vitals: { bp: { sbp: '', dbp: '', pulse: '', arm: 'Left' }, bmi: { height: '', weight: '', value: '', class: '' } },
    
    va: { 
      od: { od: '', os: '', ou: '' }, 
      os: { od: '', os: '', ou: '' },
      type: 'Old Glasses',
      chart: 'NUMBERS'
    },
    entrance: {
      iop: { od: '', os: '', time: '', method: 'NCT' },
      eom: { perrla: true, apdOD: false, apdOS: false, stereo: '', limitation: '' },
      cover: { dist: '', near: '' },
      color: { ishiharaR: '', ishiharaL: '', score: '' }
    },
    pd: { dpdR: '', dpdL: '', dpdB: '', npdR: '', npdL: '', npdB: '' },
    
    lensometry: { od: { sph: '', cyl: '', axis: '', add: '' }, os: { sph: '', cyl: '', axis: '', add: '' } },
    auto: { od: { sph: '', cyl: '', axis: '', add: '' }, os: { sph: '', cyl: '', axis: '', add: '' } },
    keratometry: { od: { k1: '', k2: '', axis: '' }, os: { k1: '', k2: '', axis: '' } },
    subjective: { od: { sph: '', cyl: '', axis: '', add: '', prism: '' }, os: { sph: '', cyl: '', axis: '', add: '', prism: '' } },
    finalRx: { od: { sph: '', cyl: '', axis: '', add: '', prism: '' }, os: { sph: '', cyl: '', axis: '', add: '', prism: '' } },
    
    anterior: {
      od: { lids: { checked: true, note: '' }, conj: { checked: true, note: '' }, cornea: { checked: true, note: '' }, lens: { checked: true, note: '' }, ac: { checked: true, note: '' }, iris: { checked: true, note: '' }, tears: { checked: true, note: '' }, angles: { checked: true, note: '' } } as any,
      os: { lids: { checked: true, note: '' }, conj: { checked: true, note: '' }, cornea: { checked: true, note: '' }, lens: { checked: true, note: '' }, ac: { checked: true, note: '' }, iris: { checked: true, note: '' }, tears: { checked: true, note: '' }, angles: { checked: true, note: '' } } as any
    },
    posterior: {
      od: { cd: { checked: false, note: '' }, cup: { checked: true, note: '' }, rim: { checked: true, note: '' }, margin: { checked: true, note: '' }, color: { checked: true, note: '' }, macula: { checked: true, note: '' }, vitreous: { checked: true, note: '' }, av: { checked: true, note: '' }, vessels: { checked: true, note: '' }, periphery: { checked: true, note: '' } } as any,
      os: { cd: { checked: false, note: '' }, cup: { checked: true, note: '' }, rim: { checked: true, note: '' }, margin: { checked: true, note: '' }, color: { checked: true, note: '' }, macula: { checked: true, note: '' }, vitreous: { checked: true, note: '' }, av: { checked: true, note: '' }, vessels: { checked: true, note: '' }, periphery: { checked: true, note: '' } } as any
    },
    dilation: { time: '', mydriacyl: false, cyclogyl: false, percent: '' },
    
    assessment: '',
    plan: '',
    medications: [] as any[],
    recalls: [] as any[],
    referral: { to: '', reason: '', date: '' },
    notes: ''
  });

  useEffect(() => {
    patientService.getPatient(patientId).then(p => {
      setPatient(p);
      if (p) {
        setFormData(prev => ({
          ...prev,
          details: { ...prev.details, cc: (p as any).reasonForVisit || '' }
        }));
      }
    });
  }, [patientId]);

  const handleUpdate = (path: string, eye: string | null, field: string, val: any) => {
    setFormData(prev => {
      const newData = { ...prev } as any;
      if (eye) {
        if (!newData[path][eye]) newData[path][eye] = {};
        newData[path][eye][field] = val;
      } else {
        newData[path][field] = val;
      }
      return newData;
    });
  };

  const tabs = [
    { id: 'health', label: 'Health History', icon: History },
    { id: 'clinical', label: 'Clinical Exams', icon: Stethoscope },
    { id: 'assessment', label: 'Assessment & Plans', icon: FileEdit },
    { id: 'notes', label: 'Notes', icon: Clipboard }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header HUD */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-400">
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Exam Protocol v6.0</h1>
                {patient && (
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-full">
                    {patient.firstName} {patient.lastName} ({patient.id})
                  </span>
                )}
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Authorized Practitioner Session • {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition",
                    activeTab === tab.id ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>
            <button 
              onClick={() => onSave(formData)}
              className="px-8 py-3 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-100"
            >
              Finalize & Save
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto space-y-8 pb-32">
          
          <AnimatePresence mode="wait">
            {activeTab === 'health' && (
              <motion.div 
                key="health" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-12 gap-6"
              >
                {/* Exam Details & Social */}
                <div className="col-span-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <SectionHeader title="Exam Metadata" icon={Clipboard} />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400">Exam Type</label>
                          <select 
                            className="w-full bg-slate-50 p-3 rounded-xl font-bold text-xs outline-none"
                            value={formData.details.type}
                            onChange={e => handleUpdate('details', null, 'type', e.target.value)}
                          >
                            <option>Comprehensive Adult</option>
                            <option>Comprehensive Pediatric</option>
                            <option>Follow-up</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400">Chief Complaint</label>
                          <input 
                            className="w-full bg-slate-50 p-3 rounded-xl font-bold text-xs outline-none"
                            value={formData.details.cc}
                            onChange={e => handleUpdate('details', null, 'cc', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <SectionHeader title="Social History" icon={User} />
                      <div className="grid grid-cols-3 gap-2">
                        {['alcohol', 'smoking', 'drugs', 'computer', 'glasses', 'contacts'].map(key => (
                          <label key={key} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-indigo-50 transition">
                            <input 
                              type="checkbox" 
                              checked={(formData.social as any)[key]} 
                              onChange={e => handleUpdate('social', null, key, e.target.checked)}
                              className="accent-indigo-600"
                            />
                            <span className="text-[9px] font-black uppercase text-slate-600">{key}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 pt-4">
                    <div className="col-span-1 border rounded-2xl p-4 space-y-2">
                      <p className="text-[9px] font-black uppercase text-slate-400">Allergies</p>
                      <textarea className="w-full h-24 bg-red-50/30 p-2 text-xs font-bold text-red-600 rounded-xl outline-none" placeholder="Environmental, Pollen, Peanuts..." />
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                        <p className="text-[9px] font-black uppercase text-slate-400">Vitals: Blood Pressure</p>
                        <div className="flex gap-2">
                          <input className="w-full bg-white p-2 rounded-lg text-xs font-mono text-center" placeholder="SYS" />
                          <input className="w-full bg-white p-2 rounded-lg text-xs font-mono text-center" placeholder="DIA" />
                          <input className="w-full bg-white p-2 rounded-lg text-xs font-mono text-center" placeholder="Pulse" />
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                        <p className="text-[9px] font-black uppercase text-slate-400">Physical: BMI</p>
                        <div className="flex gap-2">
                          <input className="w-full bg-white p-2 rounded-lg text-xs font-mono text-center" placeholder="Height" />
                          <input className="w-full bg-white p-2 rounded-lg text-xs font-mono text-center" placeholder="Weight" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                  <SectionHeader title="Systemic & Ocular Logs" icon={History} />
                  {['POHx', 'FOHx', 'PMHx', 'FMHx', 'RX (Systemic)', 'RX (Ocular)'].map(title => (
                    <div key={title} className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[9px] font-black uppercase text-indigo-600">{title}</p>
                        <Plus size={14} className="text-indigo-400 cursor-pointer" />
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 italic">No historical records active...</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'clinical' && (
              <motion.div 
                key="clinical" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Refraction Density Grid */}
                <div className="grid grid-cols-4 gap-6">
                  <EyeInputGroup 
                    label="Visual Acuity" 
                    od={formData.va.od} os={formData.va.os} 
                    fields={['od', 'os', 'ou']} 
                    segment="va" 
                    onChange={handleUpdate}
                  />
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Entrance Test: IOP</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[8px] font-bold text-slate-300 uppercase">OD</p>
                        <input 
                           className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-center font-mono" 
                           placeholder="00" 
                           value={formData.entrance.iop.od}
                           onChange={e => handleUpdate('entrance', 'iop', 'od', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-bold text-slate-300 uppercase">OS</p>
                        <input 
                           className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-center font-mono" 
                           placeholder="00" 
                           value={formData.entrance.iop.os}
                           onChange={e => handleUpdate('entrance', 'iop', 'os', e.target.value)}
                        />
                      </div>
                    </div>
                    <select 
                       className="w-full bg-indigo-50/50 p-2 rounded-lg text-[10px] font-black uppercase outline-none"
                       value={formData.entrance.iop.method}
                       onChange={e => handleUpdate('entrance', 'iop', 'method', e.target.value)}
                    >
                      <option>NCT (Air-puff)</option>
                      <option>Goldmann</option>
                      <option>iCare</option>
                    </select>
                  </div>
                  <EyeInputGroup 
                    label="Lensometry" 
                    od={formData.lensometry.od} os={formData.lensometry.os} 
                    fields={['sph', 'cyl', 'axis', 'add']} 
                    segment="lensometry" 
                    onChange={handleUpdate}
                  />
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Pupillary Distance</p>
                    <div className="grid grid-cols-3 gap-2">
                      <input className="bg-slate-50 p-2 rounded text-center text-xs" placeholder="R" value={formData.pd.dpdR} onChange={e => handleUpdate('pd', null, 'dpdR', e.target.value)} />
                      <input className="bg-slate-50 p-2 rounded text-center text-xs" placeholder="L" value={formData.pd.dpdL} onChange={e => handleUpdate('pd', null, 'dpdL', e.target.value)} />
                      <input className="bg-slate-50 p-2 rounded text-center text-xs" placeholder="B" value={formData.pd.dpdB} onChange={e => handleUpdate('pd', null, 'dpdB', e.target.value)} />
                    </div>
                    <div className="h-px bg-slate-100" />
                    <p className="text-[8px] font-black text-slate-300 uppercase text-center">Calculated Net</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-6">
                  <EyeInputGroup 
                    label="Auto Refraction" 
                    od={formData.auto.od} os={formData.auto.os} 
                    fields={['sph', 'cyl', 'axis']} 
                    segment="auto" 
                    onChange={handleUpdate}
                  />
                  <EyeInputGroup 
                    label="Keratometry" 
                    od={formData.keratometry.od} os={formData.keratometry.os} 
                    fields={['k1', 'k2', 'axis']} 
                    segment="keratometry" 
                    onChange={handleUpdate}
                  />
                  <EyeInputGroup 
                    label="Subjective Refraction" 
                    od={formData.subjective.od} os={formData.subjective.os} 
                    fields={['sph', 'cyl', 'axis', 'add']} 
                    segment="subjective" 
                    onChange={handleUpdate}
                  />
                  <EyeInputGroup 
                    label="Final Rx Recommendation" 
                    od={formData.finalRx.od} os={formData.finalRx.os} 
                    fields={['sph', 'cyl', 'axis', 'add']} 
                    segment="finalRx" 
                    onChange={handleUpdate}
                  />
                </div>

                {/* Segment Matrices */}
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-4">
                    <SegmentMatrix 
                      label="Anterior Segment Protocol"
                      od={formData.anterior.od} os={formData.anterior.os}
                      fields={['lids', 'conj', 'cornea', 'lens', 'ac', 'iris', 'tears', 'angles']}
                      onChange={handleUpdate}
                      segment="anterior"
                    />
                  </div>
                  <div className="col-span-5">
                    <SegmentMatrix 
                      label="Posterior Segment Mapping"
                      od={formData.posterior.od} os={formData.posterior.os}
                      fields={['cd', 'cup', 'rim', 'margin', 'color', 'macula', 'vitreous', 'av', 'vessels', 'periphery']}
                      onChange={handleUpdate}
                      segment="posterior"
                    />
                  </div>
                  <div className="col-span-3 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Dilation Protocol</p>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-[10px] font-bold">
                          <input type="checkbox" checked={formData.dilation.mydriacyl} onChange={e => handleUpdate('dilation', null, 'mydriacyl', e.target.checked)} className="accent-indigo-600" /> Mydriacyl
                        </label>
                        <label className="flex items-center gap-2 text-[10px] font-bold">
                          <input type="checkbox" checked={formData.dilation.cyclogyl} onChange={e => handleUpdate('dilation', null, 'cyclogyl', e.target.checked)} className="accent-indigo-600" /> Cyclogyl
                        </label>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-bold text-slate-300 uppercase">Instillation Time</p>
                        <input type="time" className="w-full bg-slate-50 p-2 rounded-xl text-xs font-black" value={formData.dilation.time} onChange={e => handleUpdate('dilation', null, 'time', e.target.value)} />
                      </div>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-3xl text-white space-y-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="text-amber-400" size={14} />
                        <span className="text-[9px] font-black uppercase italic">Clinician Alert</span>
                      </div>
                      <p className="text-[10px] font-bold opacity-60">High intraocular pressure detected in previous record. Prioritize Goldmann applanation if NCT exceeds 21mmHg.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'assessment' && (
              <motion.div 
                key="assessment" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-2 gap-6"
              >
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-4">
                    <SectionHeader title="Assessment" subtitle="ICD-10 Findings" icon={Stethoscope} />
                    <textarea 
                      className="w-full h-48 bg-slate-50 p-6 rounded-3xl font-medium text-sm italic outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter clinical diagnoses and findings..."
                      value={formData.assessment}
                      onChange={e => setFormData({...formData, assessment: e.target.value})}
                    />
                  </div>
                  <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-4">
                    <SectionHeader title="Management Plan" subtitle="Therapeutic Strategy" icon={FileEdit} />
                    <textarea 
                      className="w-full h-48 bg-slate-50 p-6 rounded-3xl font-medium text-sm italic outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Detail the management plan and patient instructions..."
                      value={formData.plan}
                      onChange={e => setFormData({...formData, plan: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-indigo-600 p-10 rounded-[50px] shadow-2xl text-white space-y-8">
                    <SectionHeader title="Prescribed Medications" icon={Heart} />
                    <div className="space-y-4">
                      {formData.medications.length === 0 ? (
                        <div className="p-8 border-2 border-dashed border-white/20 rounded-3xl text-center">
                          <p className="text-[10px] font-black uppercase text-indigo-200">No active prescriptions designated</p>
                        </div>
                      ) : (
                        formData.medications.map((m, i) => (
                           <div key={i} className="flex justify-between p-4 bg-white/10 rounded-2xl">
                              <span className="font-bold">{m.name}</span>
                              <Trash2 size={16} />
                           </div>
                        ))
                      )}
                      <button className="w-full py-4 bg-white/20 rounded-2xl font-black text-[10px] uppercase hover:bg-white/30 transition">
                        + Add Medication Protocol
                      </button>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
                     <SectionHeader title="Clinical Recall" icon={Calendar} />
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <p className="text-[9px] font-black uppercase text-slate-400">Recall Frequency</p>
                           <select className="w-full bg-slate-50 p-3 rounded-xl font-bold text-xs outline-none">
                              <option>Annual Exam</option>
                              <option>6 Month Follow-up</option>
                              <option>3 Month Follow-up</option>
                              <option>PRN</option>
                           </select>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[9px] font-black uppercase text-slate-400">Assigned Clinician</p>
                           <input className="w-full bg-slate-50 p-3 rounded-xl font-bold text-xs outline-none" placeholder="Search provider..." />
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notes' && (
              <motion.div 
                key="notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-white p-12 rounded-[50px] shadow-sm border border-slate-100"
              >
                <SectionHeader title="Global Clinical Notes" subtitle="Internal record documentation" icon={Clipboard} />
                <textarea 
                  className="w-full h-[600px] bg-slate-50 p-10 rounded-[40px] font-medium text-lg italic outline-none focus:ring-4 focus:ring-indigo-500/10 border-2 border-dashed border-slate-100"
                  placeholder="Record full clinical narrative here..."
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

