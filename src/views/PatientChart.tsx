import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { patientService, examService, orderService, contactOrderService } from '../services/db';
import { 
  Plus, 
  Calendar, 
  FileText, 
  Eye, 
  Glasses, 
  FileUp, 
  History,
  Activity,
  ArrowLeft,
  ChevronRight,
  ClipboardList,
  Package,
  Edit2,
  Save,
  X,
  ShoppingCart
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ImagingView } from './Imaging';
import { ExamForm } from './ExamForm';
import { PrescriptionPrint } from '../components/PrescriptionPrint';
import { ContactOrderModal } from '../components/ContactOrderModal';
import { useNavigate } from 'react-router-dom';

export const PatientChart = ({ id, onBack }: { id: string, onBack: () => void }) => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'exams' | 'orders' | 'diagnostics' | 'documents'>('profile');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [contactOrders, setContactOrders] = useState<any[]>([]);
  const [showExamForm, setShowExamForm] = useState(false);
  const [showContactOrderForm, setShowContactOrderForm] = useState(false);
  const [opticalTab, setOpticalTab] = useState<'glasses' | 'contacts'>('glasses');
  const [showPrint, setShowPrint] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);

  const fetchChartData = async () => {
    try {
      const [patientData, examsData, ordersData, clOrdersData] = await Promise.all([
        patientService.getPatient(id),
        examService.getExamsByPatient(id),
        orderService.getOrdersByPatient(id),
        contactOrderService.getContactOrdersByPatient(id)
      ]);
      setPatient(patientData);
      setEditData(patientData);
      setExams(examsData);
      setOrders(ordersData);
      setContactOrders(clOrdersData);
    } catch (error) {
      console.error("Error loading chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePatient = async () => {
    if (!editData) return;
    try {
      await patientService.updatePatient(id, editData);
      setPatient(editData);
      setIsEditing(false);
    } catch (error) {
      alert("Failed to update patient profile.");
    }
  };

  const handleStartGlassesOrder = () => {
    if (!patient) return;
    // Pre-fill data for the glasses order app
    const orderData = {
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientId: patient.id,
      phone: patient.phone,
      insurance: patient.insuranceProvider || 'None',
      // We could also pass RX if we find the latest exam
      latestRx: exams.length > 0 ? exams[0].subjectiveRefraction : null
    };
    sessionStorage.setItem('pendingGlassesOrder', JSON.stringify(orderData));
    navigate('/orders');
  };

  React.useEffect(() => {
    fetchChartData();
  }, [id]);

  const handleCreateExam = async (data: any) => {
    await examService.createExam(id, data);
    setShowExamForm(false);
    fetchChartData();
  };

  const handleCreateContactOrder = async (orderData: any) => {
    try {
      await contactOrderService.createContactOrder(id, orderData);
      setShowContactOrderForm(false);
      fetchChartData();
    } catch (error) {
      alert("Failed to submit contact lens order.");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      await patientService.updatePatient(id, editData);
      setPatient(editData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black uppercase tracking-[4px] text-[10px] text-slate-400">Loading Clinical Dataset...</p>
      </div>
    </div>
  );

  if (showExamForm) {
    return <ExamForm patientId={id} onBack={() => setShowExamForm(false)} onSave={handleCreateExam} />;
  }

  if (!patient) return (
    <div className="h-full flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-800 uppercase mb-2">Record Not Found</h2>
        <button onClick={onBack} className="text-indigo-600 font-bold uppercase tracking-widest text-[10px]">Return to Archives</button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Dynamic Sub-Header */}
      <div className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 transition border border-slate-100">
            <ArrowLeft size={18} />
          </button>
          <div className="w-px h-6 bg-slate-200"></div>
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{patient.firstName} {patient.lastName}</h2>
            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded uppercase tracking-widest border border-indigo-100">DOB: {patient.dob}</span>
            <span className="text-slate-400 text-[11px] font-bold tracking-widest uppercase italic">ID: #{patient.id.slice(-6).toUpperCase()}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleStartGlassesOrder} 
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <ShoppingCart size={14} /> Start New Glasses Order
          </button>
          <button onClick={() => setShowExamForm(true)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-indigo-700 transition">Initiate Exam</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#f0f2f5] p-6 lg:p-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
          {/* Patient Card Sidebar */}
          <div className="w-full lg:w-72 shrink-0 space-y-6">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-indigo-500 overflow-hidden flex items-center justify-center text-white font-black text-4xl mb-6 shadow-xl">
                {patient.firstName[0]}{patient.lastName[0]}
              </div>
              <div className="w-full grid grid-cols-2 gap-4 text-center border-t border-slate-50 pt-6">
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-[2px] mb-1">Diabetes Result</p>
                  <p className="font-bold text-slate-700 text-xs uppercase">{patient.diabetes?.hasDiabetes ? `Type ${patient.diabetes.type}` : 'None'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-[2px] mb-1">A1C Level</p>
                  <p className="font-bold text-emerald-600 text-xs uppercase">{patient.diabetes?.lastA1C || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-600 p-6 rounded-xl text-white shadow-lg space-y-2">
               <p className="text-[9px] font-black uppercase tracking-[3px] text-amber-200">Regulatory Consent</p>
               <h4 className="text-sm font-black uppercase">Dilation Permission</h4>
               <p className="text-xs font-bold opacity-80">{patient.dilationConsent ? 'PATIENT HAS PROVIDED EXPLICIT CONSENT' : 'CONSENT NOT OBTAINED'}</p>
            </div>

            {/* Quick Actions List */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <h3 className="text-[9px] font-black uppercase tracking-[3px] text-slate-400 p-2 border-b border-slate-50 mb-2">Diagnostic Tools</h3>
              {[
                { icon: Plus, label: 'Encounter', action: () => setShowExamForm(true) },
                { icon: Glasses, label: 'Prescribe', action: () => setActiveTab('exams') },
                { icon: FileUp, label: 'Document', action: () => setActiveTab('documents') }
              ].map(action => (
                <button key={action.label} onClick={action.action} className="flex items-center justify-between w-full p-3 hover:bg-slate-50 rounded-lg transition group">
                   <div className="flex items-center gap-3">
                      <action.icon size={16} className="text-slate-400 group-hover:text-indigo-600" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900">{action.label}</span>
                   </div>
                   <ChevronRight size={12} className="text-slate-200 group-hover:text-indigo-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Main Chart Content */}
          <div className="flex-1 min-w-0 space-y-6">
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="flex bg-slate-50 border-b border-slate-200 p-1">
                  {(['profile', 'exams', 'orders', 'diagnostics', 'documents'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "flex-1 py-3 px-6 rounded-lg font-black uppercase tracking-[3px] text-[10px] transition-all",
                        activeTab === tab ? "bg-white shadow-sm text-indigo-600 border border-slate-200/50" : "text-slate-400 hover:text-slate-800"
                      )}
                    >
                      {tab === 'profile' ? 'Clinical Bio' : 
                       tab === 'exams' ? 'Encounters' : 
                       tab === 'diagnostics' ? 'Imaging and Diagnostics' : 
                       tab === 'documents' ? 'Electronic Records' : 'Optical'}
                    </button>
                  ))}
                </div>

                <div className="p-10">
                  {activeTab === 'profile' && (
                    <div className="space-y-12">
                      <div className="flex justify-between items-center">
                        <h3 className="text-[12px] font-black uppercase tracking-[4px] text-indigo-600">Patient Bio & Clinical History</h3>
                        {!isEditing ? (
                          <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition"
                          >
                            <Edit2 size={12} /> Edit History
                          </button>
                        ) : (
                          <div className="flex gap-2">
                             <button 
                              onClick={handleSavePatient}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition"
                            >
                              <Save size={12} /> Save Changes
                            </button>
                            <button 
                              onClick={() => { setIsEditing(false); setEditData(patient); }}
                              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition"
                            >
                              <X size={12} /> Cancel
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                         <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[4px] text-indigo-600">Ocular History Matrix</h3>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Patient Health history</p>
                               {isEditing ? (
                                 <textarea 
                                  className="w-full bg-white border border-slate-200 p-3 rounded-lg text-xs font-bold text-slate-700 min-h-[100px] focus:ring-2 focus:ring-indigo-500 outline-none"
                                  value={editData.patientHealthHistory || ''}
                                  onChange={e => setEditData({...editData, patientHealthHistory: e.target.value})}
                                 />
                               ) : (
                                 <p className="text-xs font-bold text-slate-700 leading-relaxed italic">{patient.patientHealthHistory || 'No history recorded'}</p>
                               )}
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Patient Ocular history</p>
                               {isEditing ? (
                                 <textarea 
                                  className="w-full bg-white border border-slate-200 p-3 rounded-lg text-xs font-bold text-slate-700 min-h-[100px] focus:ring-2 focus:ring-indigo-500 outline-none"
                                  value={editData.patientOcularHistory || ''}
                                  onChange={e => setEditData({...editData, patientOcularHistory: e.target.value})}
                                 />
                               ) : (
                                 <p className="text-xs font-bold text-slate-700 leading-relaxed italic">{patient.patientOcularHistory || 'No history recorded'}</p>
                               )}
                            </div>
                         </div>
                         <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Biological Lineage history</h3>
                            <div className="p-6 bg-white border border-slate-100 rounded-2xl">
                               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Family General history</p>
                               {isEditing ? (
                                 <textarea 
                                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs font-bold text-slate-700 min-h-[100px] focus:ring-2 focus:ring-indigo-500 outline-none"
                                  value={editData.familyHistory || ''}
                                  onChange={e => setEditData({...editData, familyHistory: e.target.value})}
                                 />
                               ) : (
                                 <p className="text-xs font-bold text-slate-500 leading-relaxed italic">{patient.familyHistory || 'No history recorded'}</p>
                               )}
                            </div>
                            <div className="p-6 bg-white border border-slate-100 rounded-2xl">
                               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Family Ocular History</p>
                               {isEditing ? (
                                 <textarea 
                                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs font-bold text-slate-700 min-h-[100px] focus:ring-2 focus:ring-indigo-500 outline-none"
                                  value={editData.familyOcularHistory || ''}
                                  onChange={e => setEditData({...editData, familyOcularHistory: e.target.value})}
                                 />
                               ) : (
                                 <p className="text-xs font-bold text-slate-500 leading-relaxed italic">{patient.familyOcularHistory || 'No history recorded'}</p>
                               )}
                            </div>
                         </div>
                      </div>

                      <div className="h-px bg-slate-100"></div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <section className="space-y-8">
                           <h3 className="text-[10px] font-black uppercase tracking-[4px] text-slate-300 flex items-center gap-4">
                             <span className="w-10 h-0.5 bg-indigo-500 rounded-full"></span> Contact Details
                           </h3>
                           <div className="grid grid-cols-1 gap-6">
                              <div className="group">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 group-hover:text-indigo-500 transition-colors">Digital Correspondence (Email)</p>
                                {isEditing ? (
                                  <input 
                                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={editData.email || ''}
                                    onChange={e => setEditData({...editData, email: e.target.value})}
                                  />
                                ) : (
                                  <p className="text-slate-800 font-bold border-l-2 border-slate-100 pl-4 py-1 italic tracking-tight">{patient.email || 'Not provided'}</p>
                                )}
                              </div>
                              <div className="group">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 group-hover:text-indigo-500 transition-colors">Primary Phone</p>
                                {isEditing ? (
                                  <input 
                                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={editData.phone || ''}
                                    onChange={e => setEditData({...editData, phone: e.target.value})}
                                  />
                                ) : (
                                  <p className="text-slate-800 font-bold border-l-2 border-slate-100 pl-4 py-1 italic tracking-tight">{patient.phone || 'Not provided'}</p>
                                )}
                              </div>
                              <div className="group">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 group-hover:text-indigo-500 transition-colors">Home Address</p>
                                {isEditing ? (
                                  <textarea 
                                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={editData.address || ''}
                                    onChange={e => setEditData({...editData, address: e.target.value})}
                                  />
                                ) : (
                                  <p className="text-slate-800 font-bold border-l-2 border-slate-100 pl-4 py-1 italic tracking-tight leading-relaxed">{patient.address || 'Not provided'}</p>
                                )}
                              </div>
                           </div>
                        </section>
                        
                        <section className="space-y-8">
                           <h3 className="text-[10px] font-black uppercase tracking-[4px] text-slate-300 flex items-center gap-4">
                             <span className="w-10 h-0.5 bg-indigo-500 rounded-full"></span> Core Coverage
                           </h3>
                           <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                 <FileText size={80} />
                              </div>
                              <div className="relative z-10">
                                 <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">Assigned Carrier</p>
                                 {isEditing ? (
                                   <select 
                                    className="w-full bg-white border border-slate-200 p-3 rounded-lg font-black uppercase text-xs outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
                                    value={editData.insuranceProvider || ''}
                                    onChange={e => setEditData({...editData, insuranceProvider: e.target.value})}
                                   >
                                      <option value="None">None</option>
                                      <option value="VSP">VSP</option>
                                      <option value="EyeMed">EyeMed</option>
                                      <option value="Humana">Humana</option>
                                      <option value="Medicare">Medicare</option>
                                      <option value="Medicaid">Medicaid</option>
                                      <option value="Spectera">Spectera</option>
                                   </select>
                                 ) : (
                                   <p className="text-2xl font-black text-[#1e293b] uppercase tracking-tighter mb-6">{patient.insuranceProvider}</p>
                                 )}
                                 
                                 <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">Member Authentication ID</p>
                                 {isEditing ? (
                                   <input 
                                    className="w-full bg-white border border-slate-200 p-3 rounded-lg font-mono font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={editData.insuranceId || ''}
                                    onChange={e => setEditData({...editData, insuranceId: e.target.value})}
                                   />
                                 ) : (
                                   <p className="text-lg font-mono font-black tracking-[4px] text-indigo-600 bg-white inline-block px-3 py-1 rounded-lg border border-slate-100 shadow-sm">{patient.insuranceId}</p>
                                 )}
                              </div>
                           </div>
                        </section>
                      </div>
                    </div>
                  )}

                  {activeTab === 'exams' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center mb-10">
                          <div>
                            <h3 className="text-[11px] font-black uppercase tracking-[4px] text-slate-400">Clinical Timeline</h3>
                            <p className="text-[10px] font-bold text-indigo-600 mt-1 uppercase">Historical findings & refractions</p>
                          </div>
                          <button 
                            onClick={() => setShowExamForm(true)}
                            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition transform hover:-translate-y-1 active:scale-95 flex items-center gap-3"
                          >
                            <Plus size={18} /> New Clinical Encounter
                          </button>
                      </div>
                      <div className="space-y-4">
                        {exams.length === 0 ? (
                          <div className="p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                             <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-300">No Historical Exams Protocol Found</p>
                          </div>
                        ) : (
                          exams.map(exam => (
                            <div key={exam.id} className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-indigo-400 hover:shadow-xl transition-all duration-300 group">
                                <div className="flex justify-between items-start mb-10">
                                   <div className="flex items-center gap-4">
                                      <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-indigo-400 shadow-xl group-hover:scale-110 transition-transform">
                                        <ClipboardList size={24} />
                                      </div>
                                      <div>
                                        <p className="text-xl font-black text-slate-900 uppercase tracking-tighter">Clinical Encounter</p>
                                        <div className="flex items-center gap-3 mt-1">
                                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{exam.findings?.substring(0, 30) || 'PROTOCOL_ACTIVE'}</p>
                                           <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                           <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{format(new Date(exam.date?.toDate?.() || Date.now()), 'MMM dd, yyyy')}</p>
                                        </div>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-3">
                                      <button 
                                        onClick={() => { setSelectedExam(exam); setShowPrint(true); }}
                                        className="px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-[3px] hover:bg-slate-50 transition shadow-sm"
                                      >
                                        View Rx
                                      </button>
                                      <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[3px] hover:bg-slate-800 transition shadow-lg">Load Dataset</button>
                                   </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                   <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">OD Visuals</p>
                                      <p className="text-lg font-black text-slate-800">{exam.subjectiveRefraction?.od?.sph || '0.00'}/{exam.subjectiveRefraction?.od?.cyl || '0.00'}</p>
                                   </div>
                                   <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">OS Visuals</p>
                                      <p className="text-lg font-black text-slate-800">{exam.subjectiveRefraction?.os?.sph || '0.00'}/{exam.subjectiveRefraction?.os?.cyl || '0.00'}</p>
                                   </div>
                                   <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">IOP (OD/OS)</p>
                                      <p className="text-lg font-black text-slate-800">{exam.iop?.od || '0'} / {exam.iop?.os || '0'}</p>
                                   </div>
                                   <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                                      <p className="text-[9px] font-black text-indigo-400 uppercase mb-2 tracking-widest">VA Metrics</p>
                                      <p className="text-lg font-black text-indigo-600 italic">{exam.subjectiveRefraction?.od?.va || '20/20'} | {exam.subjectiveRefraction?.os?.va || '20/20'}</p>
                                   </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Findings / Notes</p>
                                   <p className="text-xs text-slate-600 leading-relaxed italic">{exam.findings || 'No clinical remarks recorded.'}</p>
                                </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'orders' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center mb-8">
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                          <button 
                            onClick={() => setOpticalTab('glasses')}
                            className={cn(
                              "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition",
                              opticalTab === 'glasses' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                          >Glasses</button>
                          <button 
                            onClick={() => setOpticalTab('contacts')}
                            className={cn(
                              "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition",
                              opticalTab === 'contacts' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                          >Contact Lenses</button>
                        </div>
                        {opticalTab === 'contacts' && (
                          <button 
                            onClick={() => setShowContactOrderForm(true)}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-indigo-700 transition flex items-center gap-2"
                          >
                            <Plus size={14} /> New Order
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {opticalTab === 'glasses' ? (
                          orders.length === 0 ? (
                            <div className="p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                               <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-300">No Historical Glasses Orders</p>
                            </div>
                          ) : (
                            orders.map(order => (
                              <div key={order.id} className="p-6 bg-white border border-slate-200 rounded-xl flex items-center justify-between group hover:border-indigo-400 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                      <Glasses size={20} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-black uppercase tracking-tight text-slate-800">Order #{order.id.slice(-6).toUpperCase()}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                      <span className={cn(
                                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                        order.status === 'pending' ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                      )}>{order.status}</span>
                                    </div>
                                    <button className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition shadow-sm">
                                      <ChevronRight size={18} />
                                    </button>
                                </div>
                              </div>
                            ))
                          )
                        ) : (
                          contactOrders.length === 0 ? (
                            <div className="p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                               <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-300">No Contact Lens History Protocols Found</p>
                            </div>
                          ) : (
                            contactOrders.map(order => (
                              <div key={order.id} className="p-6 bg-white border border-slate-200 rounded-xl flex items-center justify-between group hover:border-indigo-400 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                      <Package size={20} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-black uppercase tracking-tight text-slate-800">{order.od?.brand || order.brand || 'Prescription Order'}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Ordered {format(new Date(order.createdAt?.seconds * 1000), 'MMM dd, yyyy')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                      <span className={cn(
                                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                        order.status === 'pending' ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                      )}>{order.status}</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                      <ChevronRight size={18} />
                                    </div>
                                </div>
                              </div>
                            ))
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'diagnostics' && (
                    <div className="-m-10">
                      <ImagingView patientId={id} category="imaging" />
                    </div>
                  )}

                  {activeTab === 'documents' && (
                    <div className="-m-10">
                      <ImagingView patientId={id} category="documents" />
                    </div>
                  )}
                </div>
             </div>
          </div>
        </div>
      </div>
      {showPrint && selectedExam && patient && (
        <PrescriptionPrint 
          exam={selectedExam} 
          patient={patient} 
          onClose={() => setShowPrint(false)} 
        />
      )}
      {showContactOrderForm && patient && (
        <ContactOrderModal 
          patient={patient} 
          onClose={() => setShowContactOrderForm(false)} 
          onSave={handleCreateContactOrder} 
        />
      )}
    </div>
  );
};
