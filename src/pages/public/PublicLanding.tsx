import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, CheckCircle2, ShieldCheck, ArrowRight, Sparkles, 
  Users, ShoppingCart, MessageCircle, FileText, ChevronRight,
  Calculator, Lock, Eye, EyeOff, Layers, Check, ScanFace, 
  PhoneForwarded, Clock, CreditCard, ChevronDown, Laptop, Smartphone,
  UserCheck, ShieldAlert
} from 'lucide-react';

interface ModuleOption {
  id: string;
  name: string;
  tagline: string;
  category: string;
  pricePerMonth: number;
  icon: any;
  accentColor: string;
  accentBg: string;
  features: string[];
}

const AVAILABLE_MODULES: ModuleOption[] = [
  {
    id: 'crm',
    name: 'CRM & Sales Suite',
    category: 'REVENUE ENGINE',
    tagline: 'Pipelines, deals, quotations and built-in cloud telephony.',
    pricePerMonth: 499,
    icon: Users,
    accentColor: 'text-[#0071e3]',
    accentBg: 'bg-[#0071e3]/10',
    features: ['Kanban Deal Pipeline', 'Instant PDF Quotations', 'Integrated VOIP Dialer', 'Customer 360° Profile']
  },
  {
    id: 'pos',
    name: 'Retail POS & Billing',
    category: 'POINT OF SALE',
    tagline: 'Millisecond counter billing, barcode scanning, and multi-location sync.',
    pricePerMonth: 499,
    icon: ShoppingCart,
    accentColor: 'text-emerald-600',
    accentBg: 'bg-emerald-500/10',
    features: ['High-Speed Barcode Billing', 'Real-Time Inventory Sync', 'Cashier Register Closes', 'GST Thermal Print Ready']
  },
  {
    id: 'hem',
    name: 'HRMS & Workforce Suite',
    category: 'HUMAN CAPITAL',
    tagline: 'AI facial attendance, automated payroll, leave policies & ESS mobile.',
    pricePerMonth: 699,
    icon: ScanFace,
    accentColor: 'text-purple-600',
    accentBg: 'bg-purple-500/10',
    features: ['Biometric & Face ID Clock-in', '1-Click Payroll & Tax', 'Shift & Overtime Allocator', 'Employee Self-Service (ESS)']
  },
  {
    id: 'erp',
    name: 'ERP & Financials',
    category: 'CORE OPERATIONS',
    tagline: 'GST tax compliant invoicing, vendor procurement, and ledger balance sheets.',
    pricePerMonth: 599,
    icon: FileText,
    accentColor: 'text-amber-600',
    accentBg: 'bg-amber-500/10',
    features: ['GST E-Invoicing Ready', 'Purchase Entry & GRN', 'Multi-Warehouse Stock Ledger', 'Real-time Profit & Loss']
  },
  {
    id: 'ai-whatsapp',
    name: 'AI WhatsApp Engine',
    category: 'INTELLIGENT BOT',
    tagline: 'Direct device linking via QR with autonomous AI-driven customer replies.',
    pricePerMonth: 799,
    icon: MessageCircle,
    accentColor: 'text-teal-600',
    accentBg: 'bg-teal-500/10',
    features: ['Baileys Direct Web QR Link', 'Autonomous AI Auto-Responder', 'Automated Invoice Dispatch', 'Unified Team Live Inbox']
  }
];

export default function PublicLanding() {
  const navigate = useNavigate();

  // Persistent Session: If already logged in, skip landing page and route directly to their role dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        const role = user.role;
        if (role === 'Cashier') {
          navigate('/pos', { replace: true });
        } else if (role === 'Sales') {
          navigate('/crm/leads', { replace: true });
        } else if (role === 'HR') {
          navigate('/dashboards/hr', { replace: true });
        } else if (role === 'Employee') {
          navigate('/dashboards/employee', { replace: true });
        } else {
          navigate('/os', { replace: true });
        }
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [navigate]);

  // Pricing State
  const [selectedModules, setSelectedModules] = useState<string[]>(['crm', 'pos']);
  const [durationMonths, setDurationMonths] = useState<number>(12); // default annual

  // Separate Modal States for Staff vs Owner
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);

  // Checkout Form State
  const [checkoutForm, setCheckoutForm] = useState({
    companyName: '',
    companyCode: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Staff Login Form State (Requires Company Code + Staff ID/Username + Password)
  const [staffForm, setStaffForm] = useState({
    companyCode: '',
    identifier: '',
    password: ''
  });
  const [staffLoginError, setStaffLoginError] = useState('');
  const [isStaffLoggingIn, setIsStaffLoggingIn] = useState(false);

  // Owner Login Form State (Requires Owner Email + Password)
  const [ownerForm, setOwnerForm] = useState({
    email: '',
    password: ''
  });
  const [ownerLoginError, setOwnerLoginError] = useState('');
  const [isOwnerLoggingIn, setIsOwnerLoggingIn] = useState(false);

  // Toggle Module Selection
  const toggleModule = (id: string) => {
    setSelectedModules(prev => 
      prev.includes(id) 
        ? prev.length > 1 ? prev.filter(m => m !== id) : prev 
        : [...prev, id]
    );
  };

  // Pricing Calculation
  const discountMultiplier = durationMonths === 12 ? 0.8 : durationMonths === 6 ? 0.9 : 1.0;
  const baseMonthlyPrice = useMemo(() => {
    return selectedModules.reduce((sum, modId) => {
      const mod = AVAILABLE_MODULES.find(m => m.id === modId);
      return sum + (mod ? mod.pricePerMonth : 0);
    }, 0);
  }, [selectedModules]);

  const effectiveMonthlyPrice = Math.round(baseMonthlyPrice * discountMultiplier);
  const totalBillingAmount = effectiveMonthlyPrice * durationMonths;

  // Handle Checkout / Provisioning
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/subscribe-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: checkoutForm.companyName,
          companyCode: checkoutForm.companyCode,
          ownerName: checkoutForm.ownerName,
          ownerEmail: checkoutForm.ownerEmail,
          ownerPhone: checkoutForm.ownerPhone,
          password: checkoutForm.password,
          selectedModules,
          durationMonths,
          amountPaid: totalBillingAmount
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.error || 'Failed to provision company workspace.');
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('company', JSON.stringify(data.company));

      setShowCheckoutModal(false);
      navigate('/os');
    } catch (err: any) {
      setCheckoutError(err.message || 'Network error during checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Staff Login (Requires Company Code)
  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffLoginError('');
    setIsStaffLoggingIn(true);

    try {
      const res = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyCode: staffForm.companyCode.toUpperCase().trim(),
          identifier: staffForm.identifier.trim(),
          password: staffForm.password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setStaffLoginError(data.error || 'Invalid credentials or company code.');
        setIsStaffLoggingIn(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.company) {
        localStorage.setItem('company', JSON.stringify(data.company));
      }

      setShowStaffModal(false);

      const role = data.user.role;
      if (role === 'Cashier') {
        navigate('/pos');
      } else if (role === 'Sales') {
        navigate('/crm/leads');
      } else if (role === 'HR') {
        navigate('/dashboards/hr');
      } else if (role === 'Employee') {
        navigate('/dashboards/employee');
      } else {
        navigate('/os');
      }

    } catch (err: any) {
      setStaffLoginError(err.message || 'Staff login failed. Please try again.');
    } finally {
      setIsStaffLoggingIn(false);
    }
  };

  // Handle Owner Login (Requires Owner Email + Password)
  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setOwnerLoginError('');
    setIsOwnerLoggingIn(true);

    try {
      const res = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: ownerForm.email.toLowerCase().trim(),
          password: ownerForm.password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setOwnerLoginError(data.error || 'Invalid owner credentials.');
        setIsOwnerLoggingIn(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.company) {
        localStorage.setItem('company', JSON.stringify(data.company));
      }

      setShowOwnerModal(false);
      navigate('/os');
    } catch (err: any) {
      setOwnerLoginError(err.message || 'Owner sign in failed.');
    } finally {
      setIsOwnerLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] flex flex-col font-sans selection:bg-[#0071e3] selection:text-white">
      {/* 1. APPLE ULTRA-MINIMAL GLASS HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#1d1d1f] flex items-center justify-center text-white shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-[-0.03em] text-[#1d1d1f]">
              Athena<span className="text-[#0071e3]">.</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* BUTTON 1: DEDICATED STAFF SIGN IN */}
            <button
              onClick={() => setShowStaffModal(true)}
              className="text-xs sm:text-sm font-semibold text-[#1d1d1f] hover:text-[#0071e3] px-3.5 py-1.5 rounded-full hover:bg-black/[0.04] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-[#0071e3]" />
              <span>Staff Sign In</span>
            </button>

            {/* BUTTON 2: DEDICATED OWNER PORTAL */}
            <button
              onClick={() => setShowOwnerModal(true)}
              className="text-xs sm:text-sm font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 border border-purple-200"
            >
              <Building2 className="w-3.5 h-3.5 text-purple-700" />
              <span>Owner Portal</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('pricing-calculator');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs sm:text-sm font-medium shadow-xs transition-all flex items-center cursor-pointer ml-1"
            >
              <span>Build Plan</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. APPLE KEYNOTE HERO */}
      <section className="pt-20 pb-24 px-4 sm:px-6 relative text-center overflow-hidden">
        <div className="max-w-4xl mx-auto">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/[0.04] text-[#1d1d1f] text-xs font-semibold tracking-tight mb-8">
            <span className="w-2 h-2 rounded-full bg-[#0071e3] animate-pulse" />
            <span>Athena Multi-Tenant Cloud OS</span>
            <span className="text-black/20">|</span>
            <span className="text-[#86868b] font-normal">Direct Vendor Platform</span>
          </div>

          {/* Monumental Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-[80px] font-bold tracking-[-0.04em] text-[#1d1d1f] leading-[1.05]">
            One system. <br />
            <span className="bg-gradient-to-r from-[#1d1d1f] via-[#434346] to-[#0071e3] bg-clip-text text-transparent">
              Endless capability.
            </span>
          </h1>

          {/* Precision Subtext */}
          <p className="mt-7 text-lg sm:text-2xl text-[#86868b] max-w-2xl mx-auto font-normal tracking-[-0.015em] leading-relaxed">
            Everything your business needs to operate seamlessly. CRM, Point of Sale, AI Facial Attendance, Payroll, and WhatsApp Automation — unified in one pure architecture.
          </p>

          {/* Apple Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                const el = document.getElementById('pricing-calculator');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-base shadow-[0_4px_16px_rgba(0,113,227,0.25)] hover:shadow-[0_6px_20px_rgba(0,113,227,0.35)] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Configure Your Modules</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowStaffModal(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-black/[0.05] hover:bg-black/[0.08] text-[#1d1d1f] font-medium text-base transition-all active:scale-[0.98] cursor-pointer"
            >
              Staff & Cashier Sign In
            </button>
          </div>

          {/* Key Value Micro-Bar */}
          <div className="mt-16 pt-8 border-t border-black/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-[#86868b] font-medium tracking-tight">
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-[#1d1d1f]">100%</span>
              <span className="mt-0.5">Isolated Multi-Tenant</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-[#1d1d1f]">Instant</span>
              <span className="mt-0.5">Workspace Provisioning</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-[#1d1d1f]">Role-Based</span>
              <span className="mt-0.5">Granular Access Control</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-[#1d1d1f]">Zero Fluff</span>
              <span className="mt-0.5">Pay For What You Use</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. APPLE BENTO SHOWCASE GRID */}
      <section className="py-20 px-4 sm:px-8 max-w-6xl mx-auto w-full">
        <div className="mb-14 text-center">
          <p className="text-xs font-semibold tracking-wider text-[#0071e3] uppercase">Pure Architecture</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-[#1d1d1f] mt-1.5">
            Engineered for high performance.
          </h2>
          <p className="text-[#86868b] text-base mt-3 max-w-xl mx-auto font-normal">
            Modular applications built on a single unified database. No third-party connectors or sync delays.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Wide Flagship Card (CRM & Deals) */}
          <div className="md:col-span-2 rounded-[32px] bg-white border border-black/[0.06] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0071e3]">Sales Pipeline & CRM</span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] mt-1">
                Close deals faster with intelligent pipelines.
              </h3>
              <p className="text-[#86868b] text-sm sm:text-base mt-2 max-w-lg">
                Drag-and-drop Kanban deals, instant GST quotations, integrated VoIP dialer, and live customer activity timelines in a single screen.
              </p>
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] grid grid-cols-3 gap-3 text-left">
              <div className="p-3 bg-white rounded-xl shadow-xs border border-black/[0.04]">
                <div className="text-[10px] text-[#86868b] font-medium">New Leads</div>
                <div className="text-lg font-bold text-[#1d1d1f] mt-0.5">24 Leads</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1">● 92% SLA met</div>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-xs border border-black/[0.04]">
                <div className="text-[10px] text-[#86868b] font-medium">In Negotiation</div>
                <div className="text-lg font-bold text-[#0071e3] mt-0.5">₹4,82,000</div>
                <div className="text-[10px] text-[#86868b] font-medium mt-1">6 Active Deals</div>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-xs border border-black/[0.04]">
                <div className="text-[10px] text-[#86868b] font-medium">Won Today</div>
                <div className="text-lg font-bold text-emerald-600 mt-0.5">₹1,24,500</div>
                <div className="text-[10px] text-[#86868b] font-medium mt-1">Instant Invoice</div>
              </div>
            </div>
          </div>

          {/* Card 2: AI Facial Attendance & Biometrics */}
          <div className="rounded-[32px] bg-white border border-black/[0.06] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                <ScanFace className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">HRMS & Biometrics</span>
              <h3 className="text-2xl font-bold tracking-tight text-[#1d1d1f] mt-1">
                Face ID Attendance & 1-Click Payroll.
              </h3>
              <p className="text-[#86868b] text-sm mt-2">
                Verify employee attendance at the storefront or on mobile. Auto-compute tax, deductions, and issue PDF payslips.
              </p>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  FD
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1d1d1f]">Facial Match 99.8%</div>
                  <div className="text-[10px] text-purple-700">Verified at 09:02 AM</div>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                Present
              </span>
            </div>
          </div>

          {/* Card 3: Retail POS Billing */}
          <div className="rounded-[32px] bg-white border border-black/[0.06] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Retail Point of Sale</span>
              <h3 className="text-2xl font-bold tracking-tight text-[#1d1d1f] mt-1">
                Millisecond counter billing.
              </h3>
              <p className="text-[#86868b] text-sm mt-2">
                Barcode scanning, shift registers, and omnichannel stock deduction across physical stores and web.
              </p>
            </div>

            <div className="mt-6 p-3.5 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] text-xs space-y-1.5">
              <div className="flex justify-between font-medium text-[#1d1d1f]">
                <span>Total Items (4)</span>
                <span>₹1,850.00</span>
              </div>
              <div className="flex justify-between text-[#86868b] text-[11px]">
                <span>GST (18% Included)</span>
                <span>₹282.20</span>
              </div>
              <div className="pt-2 border-t border-black/[0.06] flex justify-between font-bold text-[#1d1d1f]">
                <span>Paid via UPI QR</span>
                <span className="text-emerald-600 font-extrabold">Instant Success</span>
              </div>
            </div>
          </div>

          {/* Card 4: AI WhatsApp Automation (2 Columns) */}
          <div className="md:col-span-2 rounded-[32px] bg-white border border-black/[0.06] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">AI WhatsApp Engine</span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] mt-1">
                Link your WhatsApp in seconds. Automate customer service.
              </h3>
              <p className="text-[#86868b] text-sm sm:text-base mt-2 max-w-lg">
                Direct Baileys QR code linking. Athena's autonomous AI responds to customer questions, sends receipts, and shares payment links 24/7.
              </p>
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1d1d1f]">AI Auto-Reply Bot Active</div>
                  <div className="text-[11px] text-[#86868b]">"Hello! Your order #1089 is ready for pickup."</div>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-white text-teal-700 px-3 py-1 rounded-full border border-teal-200">
                Live Linked
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE MODULE & PRICING CALCULATOR */}
      <section id="pricing-calculator" className="py-24 bg-[#f5f5f7] border-t border-black/[0.06] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0071e3]">SaaS Pricing Calculator</span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-[#1d1d1f] mt-1.5">
              Select your modules. <br />
              <span className="text-[#86868b] font-normal">Pay only for what your team uses.</span>
            </h2>

            {/* Segmented Pill */}
            <div className="mt-8 inline-flex items-center p-1 rounded-full bg-white shadow-xs border border-black/[0.06]">
              <button
                onClick={() => setDurationMonths(1)}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  durationMonths === 1 ? 'bg-[#1d1d1f] text-white shadow-xs' : 'text-[#86868b] hover:text-[#1d1d1f]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setDurationMonths(6)}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  durationMonths === 6 ? 'bg-[#1d1d1f] text-white shadow-xs' : 'text-[#86868b] hover:text-[#1d1d1f]'
                }`}
              >
                6 Months <span className="text-[10px] text-emerald-600 font-bold ml-1">10% OFF</span>
              </button>
              <button
                onClick={() => setDurationMonths(12)}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  durationMonths === 12 ? 'bg-[#1d1d1f] text-white shadow-xs' : 'text-[#86868b] hover:text-[#1d1d1f]'
                }`}
              >
                Annual <span className="text-[10px] text-emerald-600 font-bold ml-1">20% OFF</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Cols: Module Selection Cards */}
            <div className="lg:col-span-2 space-y-4">
              {AVAILABLE_MODULES.map(mod => {
                const Icon = mod.icon;
                const isSelected = selectedModules.includes(mod.id);

                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    className={`p-6 rounded-[24px] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-5 border ${
                      isSelected
                        ? 'bg-white border-[#0071e3] shadow-[0_8px_24px_rgba(0,113,227,0.08)] ring-2 ring-[#0071e3]/15'
                        : 'bg-white border-black/[0.06] hover:border-black/[0.12] hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-6 h-6 mt-1 rounded-full flex items-center justify-center transition-all ${
                        isSelected ? 'bg-[#0071e3] text-white' : 'border border-black/[0.15] bg-transparent'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className={`w-12 h-12 rounded-2xl ${mod.accentBg} ${mod.accentColor} flex items-center justify-center shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868b]">{mod.category}</span>
                          {isSelected && (
                            <span className="text-[10px] font-bold bg-[#0071e3]/10 text-[#0071e3] px-2 py-0.5 rounded-full">
                              Selected
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold tracking-tight text-[#1d1d1f] mt-0.5">{mod.name}</h3>
                        <p className="text-xs text-[#86868b] mt-0.5 font-normal">{mod.tagline}</p>

                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {mod.features.map((feat, idx) => (
                            <span key={idx} className="text-[11px] bg-[#f5f5f7] text-[#1d1d1f]/80 px-2 py-0.5 rounded-md font-medium">
                              • {feat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-right sm:shrink-0 pl-10 sm:pl-0">
                      <div className="text-2xl font-bold tracking-tight text-[#1d1d1f]">₹{mod.pricePerMonth}</div>
                      <div className="text-[11px] text-[#86868b]">per month</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Col: Apple Configure Checkout Card */}
            <div className="bg-white rounded-[32px] border border-black/[0.06] p-7 sticky top-24 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between pb-5 border-b border-black/[0.06]">
                <h3 className="text-lg font-bold tracking-tight text-[#1d1d1f]">Your Custom Plan</h3>
                <span className="text-xs font-semibold bg-black/[0.05] text-[#1d1d1f] px-2.5 py-1 rounded-full">
                  {selectedModules.length} Modules
                </span>
              </div>

              {/* Modules list */}
              <div className="py-4 space-y-2.5 border-b border-black/[0.06] text-xs">
                {selectedModules.map(mId => {
                  const m = AVAILABLE_MODULES.find(mod => mod.id === mId);
                  return (
                    <div key={mId} className="flex justify-between items-center text-[#1d1d1f]">
                      <span className="font-medium flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-[#0071e3]" />
                        {m?.name}
                      </span>
                      <span className="font-semibold">₹{m?.pricePerMonth}/mo</span>
                    </div>
                  );
                })}
              </div>

              {/* Calculations */}
              <div className="py-4 space-y-2 text-xs">
                <div className="flex justify-between text-[#86868b]">
                  <span>Billing Frequency</span>
                  <span className="font-semibold text-[#1d1d1f]">
                    {durationMonths === 1 ? 'Monthly' : durationMonths === 6 ? '6 Months' : 'Annual (12 Mos)'}
                  </span>
                </div>
                {durationMonths > 1 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount Included</span>
                    <span>{durationMonths === 12 ? '20% OFF' : '10% OFF'}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#86868b]">
                  <span>Effective Monthly</span>
                  <span className="font-semibold text-[#1d1d1f]">₹{effectiveMonthlyPrice} / month</span>
                </div>
              </div>

              {/* Total Banner */}
              <div className="p-5 rounded-2xl bg-[#f5f5f7] mb-6">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">Total Payable</div>
                <div className="text-4xl font-bold tracking-tight text-[#1d1d1f] mt-1">₹{totalBillingAmount}</div>
                <div className="text-[11px] text-[#86868b] mt-1">
                  Covers full access for {durationMonths} months • Up to 15 staff members
                </div>
              </div>

              <button
                onClick={() => setShowCheckoutModal(true)}
                className="w-full py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-sm shadow-[0_4px_14px_rgba(0,113,227,0.25)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Purchase Workspace</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-[#86868b] mt-3 font-normal">
                Instant setup. Your primary admin credentials will be generated immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-14 bg-white border-t border-black/[0.06] text-xs text-[#86868b]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#1d1d1f]">Athena.</span>
            <span>— The Enterprise Operating System.</span>
          </div>
          <div className="flex items-center space-x-6 text-[#86868b]">
            <Link to="/superadmin" className="text-purple-600 font-bold hover:underline flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Platform Owner SuperAdmin</span>
            </Link>
            <span className="hover:text-[#1d1d1f] cursor-pointer">Security Whitepaper</span>
            <span className="hover:text-[#1d1d1f] cursor-pointer">Tenant Privacy</span>
          </div>
          <p>© 2026 Athena. All rights reserved.</p>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* 6. CHECKOUT MODAL                                        */}
      {/* ======================================================== */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] max-w-lg w-full p-8 sm:p-10 shadow-2xl relative my-8 border border-black/[0.08]">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute right-6 top-6 w-8 h-8 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] font-bold text-xs cursor-pointer transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-[#1d1d1f]">Create Workspace</h3>
                <p className="text-xs text-[#86868b]">Direct multi-tenant deployment on Athena</p>
              </div>
            </div>

            {checkoutError && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {checkoutError}
              </div>
            )}

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">Company / Store Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Athena Retailers"
                  value={checkoutForm.companyName}
                  onChange={e => {
                    const name = e.target.value;
                    const code = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
                    setCheckoutForm({ ...checkoutForm, companyName: name, companyCode: checkoutForm.companyCode || code });
                  }}
                  className="w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-[#1d1d1f] text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Company Code (Unique Tenant ID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ATHENA01"
                  value={checkoutForm.companyCode}
                  onChange={e => setCheckoutForm({ ...checkoutForm, companyCode: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-[#0071e3] font-mono font-bold text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition-all uppercase"
                />
                <p className="text-[10px] text-[#86868b] mt-1">Your staff will use this code to sign into your workspace.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={checkoutForm.ownerName}
                    onChange={e => setCheckoutForm({ ...checkoutForm, ownerName: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-[#1d1d1f] text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">Owner Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@athena.com"
                    value={checkoutForm.ownerEmail}
                    onChange={e => setCheckoutForm({ ...checkoutForm, ownerEmail: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-[#1d1d1f] text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={checkoutForm.ownerPhone}
                    onChange={e => setCheckoutForm({ ...checkoutForm, ownerPhone: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-[#1d1d1f] text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">Admin Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={checkoutForm.password}
                      onChange={e => setCheckoutForm({ ...checkoutForm, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-[#1d1d1f] text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-[#86868b] hover:text-[#1d1d1f]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Recap Banner */}
              <div className="p-4 rounded-2xl bg-[#f5f5f7] flex justify-between items-center text-xs">
                <div>
                  <span className="text-[#86868b]">Total Payable ({durationMonths} Mo):</span>
                  <div className="font-bold text-[#1d1d1f] text-base">₹{totalBillingAmount}</div>
                </div>
                <div className="text-right">
                  <span className="text-[#86868b]">Active Modules:</span>
                  <div className="text-[#0071e3] font-bold uppercase">{selectedModules.join(', ')}</div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-sm shadow-[0_4px_14px_rgba(0,113,227,0.25)] transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Provisioning Workspace...</span>
                ) : (
                  <>
                    <span>Confirm & Launch Workspace</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. DEDICATED MODAL A: STAFF & EMPLOYEE SIGN IN           */}
      {/* ======================================================== */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-md w-full p-8 sm:p-10 shadow-2xl relative border border-black/[0.08]">
            <button
              onClick={() => setShowStaffModal(false)}
              className="absolute right-6 top-6 w-8 h-8 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] font-bold text-xs cursor-pointer transition-colors"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7" />
              </div>
              <div className="inline-block px-3 py-0.5 rounded-full bg-blue-50 text-[#0071e3] text-[10px] font-bold uppercase tracking-wider mb-1 border border-blue-200">
                Staff & Employee Access
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">Staff Workstation Sign In</h3>
              <p className="text-xs text-[#86868b] mt-1">Direct access for Cashiers, Sales Reps, HRs & Employees</p>
            </div>

            {staffLoginError && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {staffLoginError}
              </div>
            )}

            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                  1. Company Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STAR01 or ATHENA01"
                  value={staffForm.companyCode}
                  onChange={e => setStaffForm({ ...staffForm, companyCode: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-[#0071e3] font-mono font-black text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition-all uppercase"
                />
                <p className="text-[10px] text-[#86868b] mt-1">Ask your employer for your unique Company Code.</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                  2. Staff Username / Employee ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. karthik_pos or EMP-01"
                  value={staffForm.identifier}
                  onChange={e => setStaffForm({ ...staffForm, identifier: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-[#1d1d1f] text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                  3. Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={staffForm.password}
                  onChange={e => setStaffForm({ ...staffForm, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-[#1d1d1f] text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isStaffLoggingIn}
                className="w-full py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-sm shadow-[0_4px_14px_rgba(0,113,227,0.25)] transition-all flex items-center justify-center disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isStaffLoggingIn ? 'Signing In...' : 'Sign In to Staff Workstation'}
              </button>

              <div className="pt-3 border-t border-black/[0.06] text-center">
                <button
                  type="button"
                  onClick={() => { setShowStaffModal(false); setShowOwnerModal(true); }}
                  className="text-xs text-[#86868b] hover:text-purple-700 font-medium transition-colors"
                >
                  Are you the business owner? <span className="font-bold underline text-purple-700">Open Owner Portal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. DEDICATED MODAL B: COMPANY OWNER PORTAL               */}
      {/* ======================================================== */}
      {showOwnerModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-md w-full p-8 sm:p-10 shadow-2xl relative border border-black/[0.08]">
            <button
              onClick={() => setShowOwnerModal(false)}
              className="absolute right-6 top-6 w-8 h-8 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] font-bold text-xs cursor-pointer transition-colors"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="inline-block px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wider mb-1 border border-purple-200">
                Business Owner / Executive
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">Company Owner Portal</h3>
              <p className="text-xs text-[#86868b] mt-1">Full executive access to revenue, staff management & settings</p>
            </div>

            {ownerLoginError && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {ownerLoginError}
              </div>
            )}

            <form onSubmit={handleOwnerLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                  Registered Owner Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="owner@mybusiness.com"
                  value={ownerForm.email}
                  onChange={e => setOwnerForm({ ...ownerForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-[#1d1d1f] text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-600 transition-all"
                />
                <p className="text-[10px] text-[#86868b] mt-1">The email address you used when purchasing your plan.</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                  Admin Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={ownerForm.password}
                  onChange={e => setOwnerForm({ ...ownerForm, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-[#1d1d1f] text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-600 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isOwnerLoggingIn}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-sm shadow-[0_4px_14px_rgba(126,34,206,0.25)] transition-all flex items-center justify-center disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isOwnerLoggingIn ? 'Entering Workspace...' : 'Enter Executive Dashboard'}
              </button>

              <div className="pt-3 border-t border-black/[0.06] flex flex-col gap-2 text-center text-xs text-[#86868b]">
                <button
                  type="button"
                  onClick={() => { setShowOwnerModal(false); setShowStaffModal(true); }}
                  className="hover:text-[#0071e3] transition-colors"
                >
                  Employee or Cashier? <span className="font-bold underline text-[#0071e3]">Switch to Staff Sign In</span>
                </button>
                <Link
                  to="/superadmin"
                  className="hover:text-purple-700 transition-colors font-medium mt-1 inline-flex items-center justify-center gap-1 text-[11px]"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                  <span>Platform Super Admin? Open Master Command Center</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
