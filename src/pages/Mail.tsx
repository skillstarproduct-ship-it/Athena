import React, { useState } from 'react';
import { 
  Mail as MailIcon, Inbox, Send, Archive, Trash2, Star, Clock, 
  FileText, AlertCircle, Search, Edit3, MoreVertical, Paperclip, 
  Reply, Forward, ChevronLeft, PanelLeftClose, PanelLeft, ArrowLeft
} from 'lucide-react';

export default function Mail() {
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [selectedMail, setSelectedMail] = useState<number | null>(1);
  const [isFolderExpanded, setIsFolderExpanded] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('detail');

  const folders = [
    { id: 'inbox', name: 'Inbox', icon: Inbox, count: 24 },
    { id: 'starred', name: 'Starred', icon: Star, count: 5 },
    { id: 'snoozed', name: 'Snoozed', icon: Clock, count: 0 },
    { id: 'sent', name: 'Sent', icon: Send, count: 0 },
    { id: 'drafts', name: 'Drafts', icon: FileText, count: 12 },
    { id: 'spam', name: 'Spam', icon: AlertCircle, count: 4 },
    { id: 'trash', name: 'Trash', icon: Trash2, count: 0 },
  ];

  const emails = [
    {
      id: 1,
      sender: 'Stripe',
      email: 'receipts@stripe.com',
      subject: 'Payment successfully processed for Invoice #INV-2026-098',
      preview: 'Your payment of $4,500.00 to Cloud Hosting Services has been processed successfully...',
      time: '10:42 AM',
      date: 'Today',
      isUnread: true,
      isStarred: false,
      body: 'Hi Admin,\n\nWe successfully processed your payment of $4,500.00 for Invoice #INV-2026-098. You can download your official receipt using the link below.\n\nThank you for using Stripe.',
    },
    {
      id: 2,
      sender: 'Sarah Jenkins',
      email: 's.jenkins@clientcorp.com',
      subject: 'Re: Q4 Marketing Proposal Review',
      preview: 'Hi team, I reviewed the proposal and it looks great. Just a few minor adjustments needed on page 4...',
      time: '09:15 AM',
      date: 'Today',
      isUnread: true,
      isStarred: true,
      body: 'Hi team,\n\nI reviewed the proposal and it looks great. Just a few minor adjustments needed on page 4 regarding the budget breakdown. \n\nCan we jump on a quick 10-minute call this afternoon to finalize it?\n\nBest,\nSarah',
    },
    {
      id: 3,
      sender: 'System Alerts',
      email: 'noreply@athena-os.com',
      subject: 'Server Capacity Warning: DB-Node-02',
      preview: 'Warning: Database node 02 is currently operating at 87% capacity. Please scale up resources...',
      time: 'Yesterday',
      date: 'Oct 01',
      isUnread: false,
      isStarred: false,
      body: 'Warning: Database node 02 is currently operating at 87% capacity. \n\nPlease scale up resources or perform cleanup within the next 24 hours to prevent performance degradation.',
    },
    {
      id: 4,
      sender: 'Michael Chang',
      email: 'm.chang@internal.com',
      subject: 'Weekly Team Sync Notes',
      preview: 'Here are the minutes from today\'s sync. Action items are highlighted in bold...',
      time: 'Yesterday',
      date: 'Oct 01',
      isUnread: false,
      isStarred: false,
      body: 'Here are the minutes from today\'s sync.\n\nAction items:\n- Review Q3 targets (All)\n- Finalize the UI mockups (Design)\n- Send the compliance report to Legal (Mike)\n\nLet me know if I missed anything!',
    }
  ];

  const activeEmailData = emails.find(e => e.id === selectedMail);

  return (
    <div className="h-[calc(100vh-4.5rem)] bg-white flex overflow-hidden rounded-2xl shadow-sm border border-gray-200 min-w-0">
      
      {/* 1. Folders Pane (Collapsible: icon bar w-16 or expanded w-52) */}
      <div className={`bg-gray-50/80 border-r border-gray-200 flex flex-col shrink-0 transition-all duration-200 hidden md:flex ${
        isFolderExpanded ? 'w-52' : 'w-16'
      }`}>
        <div className="p-3 border-b border-gray-200/60 flex items-center justify-between">
          <button 
            onClick={() => setIsFolderExpanded(!isFolderExpanded)}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200/60 rounded-xl transition-colors mx-auto cursor-pointer"
            title={isFolderExpanded ? "Collapse folders" : "Expand folders"}
          >
            {isFolderExpanded ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
          </button>
        </div>

        <div className="p-2.5">
          <button 
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
              isFolderExpanded ? 'py-2.5 px-3 text-sm' : 'p-2.5 aspect-square'
            }`}
            title="Compose New Email"
          >
            <Edit3 className="w-4 h-4 shrink-0" />
            {isFolderExpanded && <span className="truncate">Compose</span>}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          {folders.map(folder => {
            const isActive = activeFolder === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`w-full flex items-center rounded-xl transition-all cursor-pointer ${
                  isFolderExpanded 
                    ? 'justify-between px-3 py-2 text-xs font-semibold' 
                    : 'justify-center p-2.5'
                } ${
                  isActive 
                    ? 'bg-blue-100/70 text-blue-700 font-bold' 
                    : 'text-gray-600 hover:bg-gray-200/50'
                }`}
                title={folder.name}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <folder.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  {isFolderExpanded && <span className="truncate">{folder.name}</span>}
                </div>
                {isFolderExpanded && folder.count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {folder.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Email List Column */}
      <div className={`w-full sm:w-64 md:w-72 lg:w-72 shrink-0 border-r border-gray-200 flex flex-col bg-white min-w-0 ${
        mobileView === 'detail' ? 'hidden sm:flex' : 'flex'
      }`}>
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search emails..." 
              className="w-full pl-9 pr-3 py-1.5 bg-gray-100 border-transparent rounded-xl text-xs sm:text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {emails.map(email => {
            const isSelected = selectedMail === email.id;
            return (
              <div 
                key={email.id}
                onClick={() => {
                  setSelectedMail(email.id);
                  setMobileView('detail');
                }}
                className={`p-3.5 cursor-pointer transition-colors hover:bg-gray-50/80 ${
                  isSelected ? 'bg-blue-50/70 border-l-4 border-l-blue-600' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1 gap-1.5">
                  <span className={`text-xs sm:text-sm truncate ${email.isUnread ? 'font-black text-gray-900' : 'font-semibold text-gray-700'}`}>
                    {email.sender}
                  </span>
                  <span className={`text-[11px] shrink-0 ${email.isUnread ? 'font-bold text-blue-600' : 'text-gray-400'}`}>
                    {email.time}
                  </span>
                </div>
                <div className={`text-xs mb-1 truncate ${email.isUnread ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                  {email.subject}
                </div>
                <div className="text-[11px] text-gray-500 line-clamp-2">
                  {email.preview}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Email Body Reading Pane */}
      <div className={`flex-1 min-w-0 flex flex-col bg-white overflow-hidden ${
        mobileView === 'list' ? 'hidden sm:flex' : 'flex'
      }`}>
        {activeEmailData ? (
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Top Toolbar (Back on mobile, Actions on right) */}
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between gap-2 shrink-0 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setMobileView('list')}
                  className="sm:hidden p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 flex items-center gap-1 text-xs font-semibold cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Emails</span>
                </button>
                <span className="text-xs text-gray-400 hidden sm:inline font-mono">Invoice Receipt</span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200/60 rounded-lg transition-colors cursor-pointer" title="Archive">
                  <Archive className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200/60 rounded-lg transition-colors cursor-pointer" title="More Actions">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Email Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col gap-3 shrink-0">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 leading-snug break-words">
                {activeEmailData.subject}
              </h1>

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
                  {activeEmailData.sender.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-gray-900 text-sm">{activeEmailData.sender}</span>
                    <span className="text-xs text-gray-500 font-mono">&lt;{activeEmailData.email}&gt;</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    to me • {activeEmailData.date} at {activeEmailData.time}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Email Body Content */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto min-w-0">
              <div className="whitespace-pre-wrap text-gray-800 text-xs sm:text-sm leading-relaxed max-w-2xl break-words font-sans">
                {activeEmailData.body}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-2.5">
                <button className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs">
                  <Reply className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs">
                  <Forward className="w-3.5 h-3.5" />
                  <span>Forward</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
            <MailIcon className="w-16 h-16 mb-3 opacity-20" />
            <p className="text-sm font-semibold text-gray-500">Select an email from the list to read</p>
          </div>
        )}
      </div>

    </div>
  );
}
