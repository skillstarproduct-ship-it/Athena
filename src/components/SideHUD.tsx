import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  UserCheck, 
  Zap, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  FilePlus,
  Wifi,
  X
} from 'lucide-react';

interface SideHUDProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function SideHUD({ isOpen, onToggle }: SideHUDProps) {
  const navigate = useNavigate();
  const [presence, setPresence] = useState<'online' | 'busy' | 'away' | 'meeting'>('online');
  const [isClockedIn, setIsClockedIn] = useState(true);
  const [clockInTime, setClockInTime] = useState<string>('09:00 AM');
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [ping, setPing] = useState(24);

  // Periodic latency simulation for HUD display
  useEffect(() => {
    const interval = setInterval(() => {
      setPing(Math.floor(Math.random() * 15) + 18);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickMeeting = () => {
    const randomRoom = 'meeting-' + Math.floor(1000 + Math.random() * 9000);
    navigate(`/meetings?room=${randomRoom}&name=Instant%20HUD%20Call`);
  };

  const handleClockToggle = () => {
    setIsClockedIn(!isClockedIn);
    if (!isClockedIn) {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setClockInTime(now);
    }
  };

  return (
    <>
      {/* Mobile/Tablet Backdrop when HUD is open on small screens */}
      {isOpen && (
        <div 
          onClick={onToggle}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Floating Toggle Button (visible ONLY when HUD is closed, so it never obscures any page content!) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed right-0 top-20 z-40 bg-slate-900 text-blue-400 p-2 rounded-l-xl border-l border-y border-slate-700/80 shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-1 group cursor-pointer"
          title="Open Athena HUD"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[11px] font-bold tracking-wider uppercase rotate-180 [writing-mode:vertical-lr] text-slate-300 group-hover:text-blue-400 py-1">
            HUD PANEL
          </span>
        </button>
      )}

      {/* Side HUD Panel: Desktop Flex Sibling & Mobile Fixed Drawer */}
      <aside 
        className={`bg-slate-950 text-slate-100 flex flex-col justify-between shadow-2xl transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          isOpen 
            ? "fixed inset-y-0 right-0 z-50 lg:static lg:z-30 w-72 xl:w-80 border-l border-slate-800 opacity-100 pointer-events-auto" 
            : "fixed inset-y-0 right-0 z-50 lg:static lg:z-30 w-0 border-none opacity-0 pointer-events-none"
        }`}
      >
        <div className="w-72 xl:w-80 flex flex-col h-full justify-between">
          {/* Header (Aligned with App Header) */}
          <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-400 animate-pulse" />
              <h3 className="font-bold text-sm tracking-wider uppercase text-slate-200">Athena HUD</h3>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-[10px] px-2 py-0.5 rounded-full font-mono">
                <Wifi className="w-3 h-3" />
                <span>{ping}ms</span>
              </div>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close HUD Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-5 overflow-y-auto space-y-6 flex-1">

          {/* User Presence & Quick Status */}
          <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Presence Status</span>
              <span className={`w-2.5 h-2.5 rounded-full ${
                presence === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' :
                presence === 'busy' ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' :
                presence === 'meeting' ? 'bg-purple-500 shadow-[0_0_8px_#a855f7]' : 'bg-amber-500'
              }`}></span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button 
                onClick={() => setPresence('online')}
                className={`py-1.5 px-2 rounded-lg font-medium transition-all ${presence === 'online' ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-800/80' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
              >
                Available
              </button>
              <button 
                onClick={() => setPresence('busy')}
                className={`py-1.5 px-2 rounded-lg font-medium transition-all ${presence === 'busy' ? 'bg-rose-950/90 text-rose-300 border border-rose-800/80' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
              >
                Do Not Disturb
              </button>
            </div>
          </div>

          {/* HR Attendance Card */}
          <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-slate-200">Work Shift Tracker</span>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${isClockedIn ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-slate-800 text-slate-400'}`}>
                {isClockedIn ? 'CLOCKED IN' : 'OFF SHIFT'}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Shift Started:</span>
              <span className="font-mono text-slate-200">{isClockedIn ? clockInTime : '--:--'}</span>
            </div>

            <button
              onClick={handleClockToggle}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                isClockedIn 
                  ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{isClockedIn ? 'Clock Out Shift' : 'Clock In Now'}</span>
            </button>
          </div>

          {/* Admin Approvals Shortcut (Only for Admins) */}
          {(() => {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            if (user?.role === 'Admin') {
              return (
                <div 
                  onClick={() => navigate('/approvals')}
                  className="bg-amber-950/40 rounded-xl p-3 border border-amber-900/50 hover:bg-amber-900/40 transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg group-hover:bg-amber-500/30 transition-colors">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-amber-200">Pending Approvals</h4>
                      <p className="text-[10px] text-amber-400/70">Manage worker accounts</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-500/50 group-hover:text-amber-400 transition-colors" />
                </div>
              );
            }
            return null;
          })()}

          {/* Real-time WebRTC Call HUD Widget */}
          <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-slate-200">WebRTC Quick Call</span>
              </div>
              <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded font-mono">
                Mesh P2P
              </span>
            </div>

            {inCall ? (
              <div className="space-y-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Call Active
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">Room #HUD</span>
                </div>

                <div className="flex items-center justify-center space-x-3 pt-1">
                  <button 
                    onClick={() => setIsMuted(!isMuted)} 
                    className={`p-2 rounded-full text-xs ${isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => setIsVideoOff(!isVideoOff)} 
                    className={`p-2 rounded-full text-xs ${isVideoOff ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => setInCall(false)} 
                    className="p-2 rounded-full bg-rose-600 text-white hover:bg-rose-700"
                  >
                    <PhoneOff className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleQuickMeeting}
                className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-purple-950"
              >
                <Video className="w-4 h-4" />
                <span>Launch Instant Meeting</span>
              </button>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-2">Shortcuts</span>
            <button 
              onClick={() => navigate('/directory')} 
              className="w-full text-left py-2 px-3 bg-slate-900/60 hover:bg-slate-800 rounded-lg text-xs font-medium text-slate-300 flex items-center justify-between border border-slate-800/80 transition-all"
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Leave Applications</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button 
              onClick={() => navigate('/files')} 
              className="w-full text-left py-2 px-3 bg-slate-900/60 hover:bg-slate-800 rounded-lg text-xs font-medium text-slate-300 flex items-center justify-between border border-slate-800/80 transition-all"
            >
              <div className="flex items-center space-x-2">
                <FilePlus className="w-4 h-4 text-blue-400" />
                <span>Share Document</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>

          {/* HUD Footer System Info */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 text-[11px] text-slate-500 flex items-center justify-between font-mono shrink-0">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ATHENA TEAMS v1.0</span>
            </div>
            <span>PORT 4000</span>
          </div>
        </div>
      </aside>
    </>
  );
}
