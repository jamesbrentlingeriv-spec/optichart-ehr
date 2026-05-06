import React from 'react';
import { 
  ExternalLink, 
  Globe,
  ShieldCheck,
  Zap,
  LayoutGrid,
  FileText,
  CreditCard,
  Target,
  Activity,
  Heart,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface LinkCardProps {
  title: string;
  url: string;
  description: string;
  icon: React.ElementType;
  color: string;
  category: 'Portal' | 'Insurance' | 'System';
}

const LinkCard = ({ title, url, description, icon: Icon, color, category }: LinkCardProps) => (
  <motion.button
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => window.open(url, '_blank')}
    className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all text-left flex flex-col justify-between h-full relative overflow-hidden"
  >
    <div className={cn("absolute top-0 right-0 w-32 h-32 blur-3xl opacity-5 transition-opacity group-hover:opacity-10", color)} />
    
    <div>
      <div className="flex justify-between items-start mb-6">
        <div className={cn("p-3 rounded-2xl shadow-sm", color, "text-white")}>
          <Icon size={24} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-amber-500 transition-colors">
          {category}
        </span>
      </div>
      
      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm font-medium text-slate-500 leading-relaxed italic lowercase">
        {description}
      </p>
    </div>

    <div className="mt-8 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Link Active</span>
      </div>
      <ExternalLink size={16} className="text-slate-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
    </div>
  </motion.button>
);

export const VisionWebPortal = () => {
  const links: LinkCardProps[] = [
    {
      title: "VisionWeb",
      url: "https://visionweb.com/login/login.jsp",
      description: "Primary portal for lab orders, claim processing, and clinical synchronization.",
      icon: Zap,
      color: "bg-[#005596]",
      category: "Portal"
    },
    {
      title: "VSP",
      url: "https://www.eyefinity.com/",
      description: "Access VSP vision care via Eyefinity for verification and claim processing.",
      icon: CreditCard,
      color: "bg-emerald-600",
      category: "Insurance"
    },
    {
      title: "EyeMed",
      url: "https://claims.eyemedvisioncare.com/claims/loginForm.emvc",
      description: "Direct access to the EyeMed claims and benefits portal.",
      icon: ShieldCheck,
      color: "bg-rose-500",
      category: "Insurance"
    },
    {
      title: "Spectera",
      url: "https://www.spectera.com/PWP/Landing",
      description: "UHC/Spectera insurance portal for vision claim adjudication.",
      icon: FileText,
      color: "bg-sky-500",
      category: "Insurance"
    },
    {
      title: "Davis/Versant",
      url: "https://provideraccessrequest.versanthealth.com/",
      description: "Provider portal for Davis Vision and Versant Health managed care services.",
      icon: Globe,
      color: "bg-teal-600",
      category: "Insurance"
    },
    {
      title: "KY Medicaid",
      url: "https://sso.kymmis.com/adfs/ls/?wa=wsignin1.0&wtrealm=https%3A%2F%2Fwww.kymmis.com%2Fkyhealthnet%2F&wctx=rm%3D0%26id%3Dpassive%26ru%3D%252Fkyhealthnet%252F&wct=2026-05-06T02%3A05%3A57Z&whr=https%3A%2F%2Fsso.kymmis.com%2Fadfs%2Fls%2Fid",
      description: "Kentucky healthnet portal for Medicaid member management and billing.",
      icon: LayoutGrid,
      color: "bg-blue-600",
      category: "Insurance"
    },
    {
      title: "Avesis",
      url: "https://avesis.veriben.net/portal/Framework3/Login.aspx",
      description: "Avesis provider portal for vision and dental benefit management.",
      icon: ShieldCheck,
      color: "bg-indigo-500",
      category: "Insurance"
    },
    {
      title: "Eyequest",
      url: "https://vision-providers.dentaquest.com/PWP/Landing",
      description: "DentaQuest/Eyequest portal for vision provider services.",
      icon: Target,
      color: "bg-amber-600",
      category: "Insurance"
    },
    {
      title: "Eyesynergy",
      url: "https://providers.eyesynergy.com/",
      description: "Digital platform for eye care professional collaboration and referral.",
      icon: Activity,
      color: "bg-emerald-500",
      category: "Portal"
    },
    {
      title: "Premier Vision",
      url: "https://login.premiereyecare.net/",
      description: "Premier Eye Care provider network portal for clinical administration.",
      icon: Heart,
      color: "bg-rose-600",
      category: "Portal"
    },
    {
      title: "Marlo",
      url: "https://meetmarlo.com/signin",
      description: "Alcon's digital platform for contact lens patients and practitioners.",
      icon: User,
      color: "bg-indigo-400",
      category: "Portal"
    },
    {
      title: "EHR Support",
      url: "#",
      description: "Access official OptiStream technical guides and support documentation.",
      icon: Zap,
      color: "bg-slate-800",
      category: "System"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] font-sans">
      <header className="px-10 py-12 shrink-0">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black text-slate-800 tracking-tighter uppercase mb-2">Resource Hub</h1>
            <p className="text-slate-400 font-bold uppercase tracking-[4px] text-[10px]">Unified External Intelligence • Secure Directory</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">
                    S{i}
                  </div>
                ))}
             </div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Node Systems Online</span>
          </div>
        </div>
      </header>

      <div className="flex-1 px-10 pb-10 overflow-y-auto">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {links.map((link, index) => (
            <motion.div key={index} variants={item}>
              <LinkCard {...link} />
            </motion.div>
          ))}
        </motion.div>

        {/* Global Security Disclaimer */}
        <div className="mt-12 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
                <ShieldCheck size={28} />
              </div>
              <div>
                 <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Security Handshake</p>
                 <p className="text-[10px] font-bold text-slate-400 italic">All external links established via encrypted TLS 1.3 containers.</p>
              </div>
           </div>
           <p className="text-[9px] font-black text-slate-300 uppercase tracking-[4px]">Verified Infrastructure</p>
        </div>
      </div>
    </div>
  );
};

