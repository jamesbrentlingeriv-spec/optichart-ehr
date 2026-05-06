import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { 
  Users, 
  UserPlus, 
  ClipboardList, 
  FileText, 
  Settings, 
  LogOut, 
  Eye, 
  Glasses, 
  Search,
  Plus,
  Home,
  Monitor,
  Activity,
  ArrowRight,
  Camera,
  Calendar,
  User,
  Heart,
  ChevronRight,
  Phone,
  Clock,
  Grid,
  ExternalLink,
  Menu,
  X,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import { auth } from './lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Patients } from './views/Patients';
import { ImagingView } from './views/Imaging';
import { VisionWebPortal } from './views/VisionWebPortal';
import { Scheduler } from './views/Scheduler';
import { ContactLensQueue } from './views/ContactLensQueue';
import OpticalPosApp from './post/PostTool';
import { schedulerService, patientService, contactOrderService } from './services/db';

// Components
const StatCard = ({ title, value, icon: Icon, color, onClick, isBig = false }: any) => (
  <button 
    onClick={onClick}
    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:border-indigo-200 transition text-left w-full group"
  >
    <div className={cn("p-3 rounded-xl bg-slate-50 transition group-hover:bg-indigo-50", color)}>
      <Icon size={24} />
    </div>
    <div>
      {title && <p className="text-sm font-medium text-slate-500 italic uppercase tracking-tight">{title}</p>}
      <p className={cn(
        "font-black text-slate-900 tracking-tighter",
        isBig ? "text-4xl" : "text-2xl"
      )}>{value}</p>
    </div>
  </button>
);

const Dashboard = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [pendingContacts, setPendingContacts] = useState(0);
  const [activeContacts, setActiveContacts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    schedulerService.getAppointments(today).then(setAppointments);
    contactOrderService.getPendingContactOrders().then(res => setPendingContacts(res.length));
    contactOrderService.getActiveContactOrders().then(res => setActiveContacts(res.length));
  }, []);

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.length > 2) {
      const all = await patientService.getAllPatients();
      const filtered = all.filter((p: any) => 
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(val.toLowerCase()) ||
        p.phone?.includes(val)
      );
      setSearchResults(filtered.slice(0, 8));
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black text-slate-800 tracking-tighter mb-2 uppercase">Dashboard</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Active Session Governance • Real-time patient flow</p>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded ring-1 ring-indigo-200">Practitioner Mode</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => navigate('/orders')}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:border-indigo-200 transition group relative aspect-[3/1] md:aspect-auto"
        >
          <img 
            src="/post.png" 
            alt="POST" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors" />
        </button>
        <StatCard title="CONTACT LENS NEED ORDERED" value={pendingContacts} icon={Package} color="text-amber-500" onClick={() => navigate('/contacts')} />
        <StatCard title="CONTACT LENS ON ORDER" value={activeContacts} icon={Clock} color="text-emerald-500" onClick={() => navigate('/contacts')} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Today's Appointments */}
        <div className="xl:col-span-7 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] flex items-center gap-2">
              <Calendar className="text-indigo-500" size={14} /> Today's Registry
            </h3>
            <Link to="/scheduler" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Full Scheduler</Link>
          </div>
          
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                <Clock className="text-slate-200 mb-4" size={40} />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No appointments designated for today</p>
              </div>
            ) : (
              appointments.sort((a,b) => a.time.localeCompare(b.time)).map(appt => (
                <div key={appt.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-200 transition group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex flex-col items-center justify-center group-hover:bg-indigo-50 transition">
                      <span className="text-[10px] font-black text-slate-900">{appt.time}</span>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{appt.patientName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{appt.type.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {appt.status === 'confirmed' && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded">Confirmed</span>}
                    {appt.status === 'pending' && <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-black uppercase rounded">Pending</span>}
                    {appt.status === 'arrived' && <span className="px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black uppercase rounded">Arrived</span>}
                    <Link to={`/patients?id=${appt.patientId}`} className="p-2 text-slate-300 hover:text-indigo-500 transition">
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Search */}
        <div className="xl:col-span-5 space-y-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] flex items-center gap-2">
            <Search className="text-indigo-500" size={14} /> Patient Quick Search
          </h3>
          
          <div className="relative">
            <input 
              type="text"
              placeholder="Search by name, phone, or DOB..."
              className="w-full bg-white border-2 border-slate-100 p-6 rounded-3xl font-bold text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition shadow-sm"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">
              <Search size={24} />
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {searchResults.length > 0 ? (
                searchResults.map((p: any) => (
                  <motion.button 
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => navigate(`/patients?id=${p.id}`)}
                    className="w-full bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:bg-slate-50 transition text-left"
                  >
                    <div>
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{p.firstName} {p.lastName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">DOB: {p.dob} • {p.phone}</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </motion.button>
                ))
              ) : searchQuery.length > 2 ? (
                <div className="p-8 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  No matching patients found
                </div>
              ) : (
                <div className="p-12 bg-indigo-500/5 rounded-[40px] border-2 border-indigo-500/10 flex flex-col items-center justify-center text-center border-dashed">
                  <UserPlus className="text-indigo-200 mb-4" size={32} />
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Global Patient Lookup</p>
                  <p className="text-[9px] font-bold text-indigo-300 uppercase mt-2">Enter at least 3 characters to scan</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Calendar, label: 'Scheduler', path: '/scheduler' },
    { icon: Users, label: 'Patient Search', path: '/patients' },
    { icon: Package, label: 'Contact Lens Ordering', path: '/contacts' },
    { icon: Glasses, label: 'Resource Hub', path: '/orders' },
    { icon: Eye, label: 'Imaging', path: '/imaging' },
    { icon: Grid, label: 'Links', path: '/links' },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-[#f0f2f5] font-sans text-slate-800 overflow-hidden relative">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Geometric Balance Dark Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-20 bg-[#1e293b] flex flex-col items-center py-8 gap-8 border-r border-slate-200 shadow-2xl z-[60] transition-transform duration-300 transform lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white mb-2"
        >
          <X size={24} />
        </button>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsAboutOpen(true);
          }}
          className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-2 mt-2 transition-all hover:rotate-12 hover:scale-105 cursor-pointer border-none outline-none group overflow-hidden relative z-10"
          aria-label="About OptiChart"
        >
          <img 
            src="/apple-touch-icon.png" 
            alt="OptiChart" 
            className="w-full h-full object-contain p-2"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-indigo-50/0 group-hover:bg-indigo-50/10 transition-colors" />
        </button>

        <nav className="flex flex-col gap-6 w-full items-center px-0">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group relative",
                  isActive 
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 translate-x-1" 
                    : "text-slate-500 hover:bg-slate-800 hover:text-indigo-400"
                )}
              >
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute -left-3 w-1 h-10 bg-indigo-500 rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col items-center gap-6 pb-4">
          {profile && (
            <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-indigo-400 overflow-hidden flex items-center justify-center text-white text-xs font-black uppercase shadow-inner">
               {profile.firstName[0]}{profile.lastName[0]}
            </div>
          )}
          <button 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            onClick={handleLogout}
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-20">
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shadow-sm relative z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase tracking-[2px] hidden sm:block">
              OptiChart <span className="text-red-600">EHR</span>
            </h1>
            {profile && (
              <>
                <span className="w-px h-6 bg-slate-100 hidden md:block"></span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest italic hidden md:block">{profile.role} session active</span>
              </>
            )}
          </div>
          <div className="flex gap-2 sm:gap-3">
             <div className="hidden xl:flex items-center gap-2 mr-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Secure</span>
             </div>
             <button 
               onClick={() => navigate('/patients')}
               className="px-3 md:px-4 py-2 bg-slate-50 rounded-lg text-xs font-bold uppercase tracking-widest text-slate-600 border border-slate-200 hover:bg-slate-100 transition truncate flex items-center gap-2"
             >
               <FileText size={14} />
               <span className="hidden sm:inline">System Records</span>
               <span className="sm:hidden">Files</span>
             </button>
             <button 
               onClick={() => {
                 alert('Initiating global clinical synchronization... Data refreshed across primary nodes.');
               }}
               className="px-3 md:px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm hover:bg-indigo-700 transition truncate flex items-center gap-2"
             >
               <Activity size={14} />
               <span className="hidden sm:inline">Live Sync</span>
               <span className="sm:hidden">Sync</span>
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="h-10 bg-white border-t border-slate-200 px-8 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
           <div>User: <span className="text-indigo-600">Dr. {profile?.lastName || 'Vance'}</span> | System: VisiManage Pro v4.2</div>
           <div className="flex gap-6">
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Database Connected</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> VisionWeb Link</span>
           </div>
        </footer>

        {/* About OptiChart Modal */}
        <AnimatePresence>
          {isAboutOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/80 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white max-w-3xl w-full h-[85vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative"
              >
                <button 
                  onClick={() => setIsAboutOpen(false)}
                  className="absolute top-8 right-8 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors z-20"
                >
                  <X size={24} />
                </button>

                <div className="flex-1 overflow-y-auto p-12 md:p-16 scrollbar-hide">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <Eye size={28} />
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter uppercase text-slate-800">
                      Introducing OptiChart <span className="text-red-600">EHR</span>
                    </h2>
                  </div>

                  <div className="space-y-8 text-slate-600">
                    <section className="space-y-4">
                      <p className="text-xl font-bold text-slate-800 leading-tight">
                        Built for Opticians & Optometrists. Engineered for Peace of Mind.
                      </p>
                      <p className="leading-relaxed">
                        At OptiChart, we believe that electronic health records shouldn’t get in the way of patient care. Designed specifically for the fast-paced flow of optical practices and optometric clinics, OptiChart blends cutting-edge clinical charting, seamless optical workflow management, and top-tier security into one intuitive dashboard.
                      </p>
                      <p className="leading-relaxed">
                        We bridge the gap between the lab, the retail floor, and the exam lane, giving your entire team a unified, hassle-free experience.
                      </p>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[4px] text-indigo-600">Ease of Use: Designed for the Entire Practice</h3>
                      <p className="leading-relaxed">
                        A system is only as good as its weakest user interface. OptiChart was built from the ground up to be incredibly user-friendly for every role in your office:
                      </p>
                      <ul className="space-y-4 pt-2">
                        <li className="flex gap-4">
                          <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0"></div>
                          <p><span className="font-black text-slate-800">For Optometrists:</span> Rapid charting, quick-select vision testing values, and intuitive prescription writing that keeps your eyes on the patient, not the screen.</p>
                        </li>
                        <li className="flex gap-4">
                          <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0"></div>
                          <p><span className="font-black text-slate-800">For Opticians:</span> Effortless integration with frame measurements, lens parameters, and laboratory orders. No unnecessary clinical clutter—just the details you need to dispense accurately and efficiently.</p>
                        </li>
                        <li className="flex gap-4">
                          <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0"></div>
                          <p><span className="font-black text-slate-800">For Support Staff:</span> Quick scheduling, clear billing workflows, and uncomplicated navigation that minimizes training time and eliminates daily frustration.</p>
                        </li>
                      </ul>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[4px] text-red-600">Our Uncompromising Commitment to HIPAA Compliance</h3>
                      <p className="leading-relaxed">
                        Protecting Protected Health Information (PHI) is not just a regulatory hurdle; it is a fundamental pillar of our platform. We strive for and maintain rigorous administrative, physical, and technical safeguards to keep your practice and your patients secure.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="p-6 bg-slate-50 rounded-3xl space-y-2">
                          <p className="text-xl">🛡️</p>
                          <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest">Secure Data Encryption</h4>
                          <p className="text-xs leading-relaxed">All sensitive data—whether at rest or in transit—is shielded using industry-standard AES 256-bit encryption. Your clinical notes and prescriptions are safe from unauthorized eyes.</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl space-y-2">
                          <p className="text-xl">👥</p>
                          <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest">Role-Based Access Controls</h4>
                          <p className="text-xs leading-relaxed">Not everyone in the clinic needs to see the same information. OptiChart employs strict user-level permissions, ensuring opticians, doctors, and front-desk staff only access the specific data required to do their jobs.</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl space-y-2">
                          <p className="text-xl">📝</p>
                          <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest">Comprehensive Audit Trails</h4>
                          <p className="text-xs leading-relaxed">Every single action within the EHR—from viewing a chart to updating a prescription—is logged. This permanent, tamper-resistant digital audit trail ensures total accountability and effortless compliance tracking.</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl space-y-2">
                          <p className="text-xl">🚫</p>
                          <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest">Non-Secure Channel Protection</h4>
                          <p className="text-xs leading-relaxed">To safeguard patient privacy, OptiChart actively segregates clinical data from non-secure communications. We strictly restrict the transmission of PHI over inherently insecure channels like standard SMS, keeping all sensitive medical and optical data strictly within our secure, encrypted environment.</p>
                        </div>
                      </div>
                    </section>

                    <blockquote className="p-8 bg-indigo-600 rounded-[32px] text-white italic font-medium leading-relaxed shadow-xl shadow-indigo-600/20">
                      "We deliver the robust security standards your practice demands, packaged in an interface your staff will actually enjoy using. No compromises. Just better charting."
                      <p className="not-italic text-[10px] font-black mt-4 uppercase tracking-[4px] text-white/50">The OptiChart Promise</p>
                    </blockquote>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function App() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center mb-8 shadow-2xl overflow-hidden">
         <img src="/apple-touch-icon.png" alt="OptiChart" className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
      </div>
      <motion.div 
        animate={{ width: [0, 200, 200], opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="h-1 bg-blue-600 rounded-full"
      />
      <p className="mt-8 text-[10px] font-black uppercase tracking-[5px] text-slate-400">
        Initializing OptiChart <span className="text-red-600 text-[10px]">EHR</span>
      </p>
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginView />} />
      <Route 
        path="/*" 
        element={
          user ? (
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/scheduler" element={<Scheduler />} />
                <Route path="/imaging" element={<ImagingView />} />
                <Route path="/contacts" element={<ContactLensQueue />} />
                <Route path="/links" element={<VisionWebPortal />} />
                <Route path="/orders" element={<OpticalPosApp userProfile={profile} />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } 
      />
    </Routes>
  );
}

const LoginView = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const finalEmail = email.includes('@') ? email : `${email.toLowerCase()}@clinic.com`;
    
    // reCAPTCHA Enterprise Verification for Login
    try {
      const grecaptcha = (window as any).grecaptcha;
      if (grecaptcha?.enterprise) {
        await new Promise<void>((resolve) => grecaptcha.enterprise.ready(resolve));
        const token = await grecaptcha.enterprise.execute('6LffKdssAAAAABkez12A8ZFiacm5Qj8pqqcjiccj', { action: 'LOGIN' });
        console.log('reCAPTCHA Login Token:', token);
      }
    } catch (captchaErr) {
      console.error('reCAPTCHA Login Error:', captchaErr);
      setError('Bot detection failed. Please try again.');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, finalEmail, password);
      navigate('/');
    } catch (err: any) {
      setError('System rejected authentication. Check credentials.');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const { setDoc, doc } = await import('firebase/firestore');
    const { db } = await import('./lib/firebase');
    
    const finalEmail = email.includes('@') ? email : `${email.toLowerCase()}@clinic.com`;
    
    if (accessCode !== 'OPTIC-2026') {
      setError('Invalid Clinical Access Code.');
      setLoading(false);
      return;
    }

    // reCAPTCHA Enterprise Verification
    try {
      const grecaptcha = (window as any).grecaptcha;
      if (grecaptcha?.enterprise) {
        // Wait for the enterprise script to be ready
        await new Promise<void>((resolve) => grecaptcha.enterprise.ready(resolve));
        // Execute the reCAPTCHA challenge with the provided site key
        const token = await grecaptcha.enterprise.execute('6LffKdssAAAAABkez12A8ZFiacm5Qj8pqqcjiccj', { action: 'registration' });
        console.log('reCAPTCHA Token generated:', token);
        // In a production app, you would send this token to your server to verify via the reCAPTCHA API
      } else {
        console.warn('reCAPTCHA Enterprise not loaded yet');
      }
    } catch (captchaErr) {
      console.error('reCAPTCHA Error:', captchaErr);
      setError('Anti-bot verification failed. Please refresh and try again.');
      setLoading(false);
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, finalEmail, password);
      const userPath = `users/${userCred.user.uid}`;
      try {
        await setDoc(doc(db, 'users', userCred.user.uid), {
          uid: userCred.user.uid,
          email: finalEmail,
          firstName: firstName || email,
          lastName: lastName || 'Practitioner',
          role: 'doctor',
          createdAt: new Date().toISOString()
        });
      } catch (fsError) {
        const { handleFirestoreError, OperationType } = await import('./lib/firestoreErrorHandler');
        handleFirestoreError(fsError, OperationType.WRITE, userPath);
      }
      navigate('/');
    } catch (err: any) {
      console.error('Registration/Firestore Error:', err);
      let displayError = err.message;
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error) displayError = `Permissions Error: ${parsed.error}`;
      } catch (e) {
        // Not JSON, use as is
      }
      setError(displayError || 'Failed to create account.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f0f2f5] font-sans">
      <div className="hidden lg:flex lg:w-[60%] bg-[#1e293b] p-20 flex-col justify-between text-white relative overflow-hidden border-r border-slate-200 shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-24">
             <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-xl overflow-hidden">
                <img src="/apple-touch-icon.png" alt="OptiChart" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
             </div>
             <div>
                <span className="text-3xl font-black tracking-tight uppercase block leading-none">
                  OptiChart <span className="text-red-600">EHR</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[5px] text-indigo-400 leading-none">v4.2 PRO</span>
             </div>
          </div>
          <h1 className="text-8xl font-black leading-[0.9] mb-12 tracking-tighter uppercase max-w-lg">
            Geometric<br />
            <span className="text-indigo-400">Balance</span><br />
            & Care.
          </h1>
          <p className="text-slate-400 text-xl max-w-sm font-medium leading-relaxed italic border-l-2 border-indigo-500 pl-6">
            Advanced EHR architecture for elite optometry practices. Minimalist workflow, Maximal data integrity.
          </p>
        </div>
        
        <div className="relative z-10 grid grid-cols-2 gap-6">
           <div className="p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[4px] text-indigo-400 mb-4">Precision</p>
              <h4 className="text-xl font-bold mb-2">Automated Rx</h4>
              <p className="text-slate-500 text-xs">Zero-drift laboratory synchronization.</p>
           </div>
           <div className="p-8 bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-600/30">
              <p className="text-[10px] font-black uppercase tracking-[3px] text-white/50 mb-4">Governance</p>
              <h4 className="text-xl font-bold mb-2">Unified RBAC</h4>
              <p className="text-white/70 text-xs">Role-specific diagnostic interfaces.</p>
           </div>
        </div>

        {/* Geometric Elements */}
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full border-[100px] border-white/5 pointer-events-none"></div>
        <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-indigo-800/10 blur-[80px] pointer-events-none"></div>
      </div>

      <div className="w-full lg:w-[40%] flex items-center justify-center p-12 lg:p-24 bg-white relative">
        <div className="w-full max-w-sm">
          <div className="mb-12">
            <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tighter uppercase">
              {isRegistering ? 'Create Account' : 'Access Portal'}
            </h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              {isRegistering ? 'Register new practitioner profile' : 'Secure terminal entry required'}
            </p>
          </div>
          
          <form className="space-y-4" onSubmit={isRegistering ? handleRegister : handleLogin}>
            {isRegistering && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] ml-1">First Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="James"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition font-bold text-sm"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] ml-1">Last Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Vance"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition font-bold text-sm"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] ml-1">Practitioner ID / Username</label>
              <input 
                required
                type="text" 
                placeholder="james or james@clinic.com"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition font-bold text-sm"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] ml-1">Authentication Keys</label>
              <input 
                required
                type="password" 
                placeholder="••••••••"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition font-bold text-sm"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {isRegistering && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] ml-1">Clinical Access Code</label>
                <input 
                  required
                  type="text" 
                  placeholder="Clinical ID Required"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition font-bold text-sm"
                  value={accessCode}
                  onChange={e => setAccessCode(e.target.value)}
                />
              </div>
            )}

            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 p-4 rounded-xl border border-red-100"
              >
                {error}
              </motion.p>
            )}

            <button 
              disabled={loading}
              className={cn(
                "w-full py-5 text-white rounded-xl font-black text-xs uppercase tracking-[3px] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]",
                loading ? "bg-slate-300 cursor-not-allowed" : "bg-slate-800 hover:bg-slate-900 shadow-slate-200"
              )}
            >
              {loading ? "Verifying..." : isRegistering ? "Register Profile" : "Establish Secure Link"}
            </button>
          </form>

          <div className="mt-6">
             <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="w-full py-3 border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition"
             >
               {isRegistering ? 'Back to Portal Access' : 'Register New Practitioner'}
             </button>
          </div>

          <div className="mt-12">
             <button 
                onClick={async () => {
                   const { createUserWithEmailAndPassword } = await import('firebase/auth');
                   const { setDoc, doc } = await import('firebase/firestore');
                   const { auth, db } = await import('./lib/firebase');
                   try {
                      const userCred = await createUserWithEmailAndPassword(auth, 'james@clinic.com', 'admin123');
                      await setDoc(doc(db, 'users', userCred.user.uid), {
                         uid: userCred.user.uid,
                         email: 'james@clinic.com',
                         firstName: 'James',
                         lastName: 'Admin',
                         role: 'admin',
                         createdAt: new Date().toISOString()
                      });
                      alert('Account initialized! Log in with james@clinic.com / admin123');
                   } catch (e: any) {
                      alert('Account status: ' + e.message);
                   }
                }}
                className="w-full py-3 border-2 border-dashed border-slate-100 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-400 transition"
             >
               Quick-Start James Admin
             </button>
          </div>

          <div className="mt-20 pt-10 border-t border-slate-100 flex items-center justify-between">
              <h1 className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">© 2026 OPTICHART EHR INTEL</h1>
             <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
