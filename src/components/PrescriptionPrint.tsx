import React from 'react';
import { Eye, Printer, User, Calendar, MapPin, Phone } from 'lucide-react';
import { format } from 'date-fns';

interface RxValue {
  sph: string;
  cyl: string;
  axis: string;
  add: string;
  va: string;
}

interface ExamData {
  patientId: string;
  date?: any;
  finalRx?: {
    spectacle?: {
      od: RxValue;
      os: RxValue;
      notes?: string;
    };
  };
}

interface PatientData {
  firstName: string;
  lastName: string;
  dob: string;
  address?: string;
}

export const PrescriptionPrint = ({ 
  exam, 
  patient,
  doctorName = "Dr. Vance",
  clinicName = "Precision Optical Care",
  onClose 
}: { 
  exam: any, 
  patient: any,
  doctorName?: string,
  clinicName?: string,
  onClose: () => void 
}) => {
  const printRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const rx = exam.finalRx || exam.subjective || exam.subjectiveRefraction;
  const pd = exam.pd || {};
  if (!rx || !rx.od) return (
    <div className="fixed inset-0 z-[5000] bg-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-sm font-black uppercase text-slate-400">Error: Missing Prescription Data</p>
        <button onClick={onClose} className="px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-black uppercase">Close</button>
      </div>
    </div>
  );

  const today = format(new Date(), 'MM/dd/yyyy');
  const expireDate = format(new Date(Date.now() + 31536000000 * 2), 'MM/dd/yyyy'); // 2 years default

  return (
    <div className="fixed inset-0 z-[5000] bg-white flex flex-col p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full print:p-0">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <Eye size={20} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">Prescription for Spectacles</h2>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-2 border-2 border-slate-200 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition"
            >
              Close
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-3 px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-black transition active:scale-95"
            >
              <Printer size={16} strokeWidth={3} />
              Print Prescription
            </button>
          </div>
        </div>

        {/* PRINTABLE AREA */}
        <div id="print-root" ref={printRef} className="bg-white p-12 relative min-h-[10.5in] border border-slate-200 font-serif text-slate-900">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-8">
            <div className="space-y-1">
              <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">PAL OPTICAL</h1>
              <p className="text-sm font-bold uppercase tracking-widest">Excellence in Vision Care</p>
              <div className="text-[11px] font-medium leading-tight">
                <p>123 Medical Center Way • Lexington, KY 40503</p>
                <p>Phone: (859) 555-0199 • Fax: (859) 555-0198</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-black uppercase border-2 border-slate-900 px-4 py-2 mb-4 inline-block">SPECTACLE RX</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Electronic Medical Record Verified</p>
            </div>
          </div>

          {/* Patient Info Box */}
          <div className="grid grid-cols-12 border-2 border-slate-900 mb-8">
            <div className="col-span-12 bg-slate-900 text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest">
              Patient Information
            </div>
            <div className="col-span-8 p-4 border-r-2 border-slate-900 space-y-4">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Patient Name</p>
                <p className="text-xl font-black uppercase border-b border-slate-100 pb-1">{patient.firstName} {patient.lastName}</p>
              </div>
              <div className="flex gap-12">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Address</p>
                  <p className="text-xs font-bold uppercase">{patient.address || '_______________________________________'}</p>
                </div>
              </div>
            </div>
            <div className="col-span-4 p-4 space-y-4">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Date of Birth</p>
                <p className="text-sm font-black border-b border-slate-100 pb-1">{patient.dob}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Exam Date</p>
                <p className="text-sm font-black border-b border-slate-100 pb-1">{today}</p>
              </div>
            </div>
          </div>

          {/* Rx Matrix */}
          <div className="mb-10">
            <div className="grid grid-cols-12 gap-0 border-2 border-slate-900">
               <div className="col-span-1 border-r border-b-2 bg-slate-50 border-slate-900 flex items-center justify-center font-black text-xs">Eye</div>
               <div className="col-span-2 border-r border-b-2 bg-slate-50 border-slate-900 flex flex-col items-center justify-center p-2">
                  <span className="text-[8px] font-black uppercase">Sphere</span>
               </div>
               <div className="col-span-2 border-r border-b-2 bg-slate-50 border-slate-900 flex flex-col items-center justify-center p-2">
                  <span className="text-[8px] font-black uppercase">Cylinder</span>
               </div>
               <div className="col-span-2 border-r border-b-2 bg-slate-50 border-slate-900 flex flex-col items-center justify-center p-2">
                  <span className="text-[8px] font-black uppercase">Axis</span>
               </div>
               <div className="col-span-2 border-r border-b-2 bg-slate-50 border-slate-900 flex flex-col items-center justify-center p-2">
                  <span className="text-[8px] font-black uppercase">Prism</span>
               </div>
               <div className="col-span-1 border-r border-b-2 bg-slate-50 border-slate-900 flex flex-col items-center justify-center p-2">
                  <span className="text-[8px] font-black uppercase">Base</span>
               </div>
               <div className="col-span-2 border-b-2 bg-slate-50 border-slate-900 flex flex-col items-center justify-center p-2">
                  <span className="text-[8px] font-black uppercase">Add Cap</span>
               </div>

               {/* OD ROW */}
               <div className="col-span-1 border-r border-b border-slate-900 p-4 font-black flex items-center justify-center text-xl">OD</div>
               <div className="col-span-2 border-r border-b border-slate-900 flex items-center justify-center text-2xl font-black italic">{rx.od.sph || 'S.P.H.'}</div>
               <div className="col-span-2 border-r border-b border-slate-900 flex items-center justify-center text-2xl font-black italic">{rx.od.cyl || '—'}</div>
               <div className="col-span-2 border-r border-b border-slate-900 flex items-center justify-center text-2xl font-black italic">{rx.od.axis || '—'}</div>
               <div className="col-span-2 border-r border-b border-slate-900 flex items-center justify-center text-xl font-black italic">{rx.od.prism || '—'}</div>
               <div className="col-span-1 border-r border-b border-slate-900 flex items-center justify-center text-lg font-black italic">{rx.od.base || '—'}</div>
               <div className="col-span-2 border-b border-slate-900 flex items-center justify-center text-2xl font-black italic">{rx.od.add || '—'}</div>

               {/* OS ROW */}
               <div className="col-span-1 border-r border-slate-900 p-4 font-black flex items-center justify-center text-xl">OS</div>
               <div className="col-span-2 border-r border-slate-900 flex items-center justify-center text-2xl font-black italic">{rx.os.sph || 'S.P.H.'}</div>
               <div className="col-span-2 border-r border-slate-900 flex items-center justify-center text-2xl font-black italic">{rx.os.cyl || '—'}</div>
               <div className="col-span-2 border-r border-slate-900 flex items-center justify-center text-2xl font-black italic">{rx.os.axis || '—'}</div>
               <div className="col-span-2 border-r border-slate-900 flex items-center justify-center text-xl font-black italic">{rx.os.prism || '—'}</div>
               <div className="col-span-1 border-r border-slate-900 flex items-center justify-center text-lg font-black italic">{rx.os.base || '—'}</div>
               <div className="col-span-2 flex items-center justify-center text-2xl font-black italic">{rx.os.add || '—'}</div>
            </div>
          </div>

          {/* Supplementary Info */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div className="space-y-6">
               <div className="border-2 border-slate-900 p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Dist. Pupillary Distance (PD)</p>
                  <div className="flex gap-8">
                     <div>
                        <span className="text-[10px] font-bold text-slate-400 mr-2">Binocular:</span>
                        <span className="text-base font-black italic">{pd.dpdB || '________'}</span>
                     </div>
                     <div>
                        <span className="text-[10px] font-bold text-slate-400 mr-2">OD:</span>
                        <span className="text-base font-black italic">{pd.dpdR || '____'}</span>
                        <span className="text-[10px] font-bold text-slate-400 mx-2">OS:</span>
                        <span className="text-base font-black italic">{pd.dpdL || '____'}</span>
                     </div>
                  </div>
               </div>

               <div className="border-2 border-slate-900 p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Lens Types & Material</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                     {['Single Vision', 'Bi-Focal', 'Tri-Focal', 'Progressive', 'Polycarbonate', 'High Index'].map(type => (
                       <div key={type} className="flex items-center gap-2">
                         <div className="w-3 h-3 border border-slate-900 rounded-sm"></div>
                         <label className="text-[9px] font-black uppercase text-slate-700">{type}</label>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="border-2 border-slate-900 p-4 h-full">
               <p className="text-[9px] font-black uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Clinical Notes & Recommendations</p>
               <div className="text-sm font-medium italic min-h-[100px] leading-relaxed">
                  {rx.notes ? rx.notes : (
                    <div className="space-y-4">
                      <p className="opacity-10">__________________________________________</p>
                      <p className="opacity-10">__________________________________________</p>
                      <p className="opacity-10">__________________________________________</p>
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="mt-12 pt-12 border-t-4 border-slate-900">
             <div className="flex justify-between items-end">
                <div className="space-y-4">
                   <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Provider Certification</p>
                      <p className="text-lg font-black uppercase italic">{doctorName}</p>
                      <div className="flex gap-6 text-[10px] font-bold uppercase text-slate-500">
                        <p>NPI: 1245598200</p>
                        <p>LICENSE: #KY-99214</p>
                      </div>
                   </div>
                   <div className="bg-slate-100 px-4 py-2 inline-block">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Expiration Clause</p>
                      <p className="text-sm font-black text-red-600">VOID AFTER: {expireDate}</p>
                   </div>
                </div>

                <div className="w-80">
                   <div className="border-b-2 border-slate-900 h-20 mb-2 relative">
                      {/* Fake Signature Script */}
                      <span className="absolute bottom-2 left-4 font-serif italic text-4xl opacity-80 text-slate-700 select-none">
                        Dr. {doctorName.split(' ').pop()}
                      </span>
                   </div>
                   <p className="text-[10px] font-black text-center uppercase tracking-[5px]">Authorized Signature</p>
                </div>
             </div>
          </div>

          {/* Legal Fine Print */}
          <div className="absolute bottom-8 left-12 right-12 text-center text-[7px] font-medium text-slate-300 uppercase tracking-widest leading-relaxed">
             This prescription is valid for 24 months from the date of issue unless otherwise noted. 
             Alteration of this document is prohibited by law. 
             Federal law restricts this device to sale by or on the order of a licensed practitioner.
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-root, #print-root * {
            visibility: visible;
          }
          #print-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 8.5in;
            height: 11in;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
};
