import React, { useState } from 'react';
import {
    MessageSquare,
    Users,
    Send,
    BarChart3,
    Settings,
    Search,
    Plus,
    MoreVertical,
    Paperclip,
    Smile,
    CheckCheck,
    Smartphone,
    Zap,
    LogOut,
    Bell,
    Calendar,
    User,
    Tag,
    Clock,
    FileText,
    ChevronRight,
    Filter
} from 'lucide-react';

// --- Mock Data ---

const AGENTS = [
    { id: 'a1', name: 'You (Admin)', avatar: 'ME' },
    { id: 'a2', name: 'Sarah J.', avatar: 'SJ' },
    { id: 'a3', name: 'Mike R.', avatar: 'MR' },
];

const MOCK_CONTACTS = [
    {
        id: 1,
        name: 'Rahul Sharma',
        number: '+91 98765 43210',
        tags: ['Hot Lead', 'Gym Inquiry'],
        lastMsg: 'Price kya hai?',
        time: '10:30 AM',
        unread: 2,
        assignedTo: 'a1',
        nextFollowUp: 'Today, 4:00 PM',
        notes: 'Interested in annual plan. Budget is tight.'
    },
    {
        id: 2,
        name: 'Priya Patel',
        number: '+91 91234 56789',
        tags: ['Customer', 'VIP'],
        lastMsg: 'Payment done. Thanks!',
        time: 'Yesterday',
        unread: 0,
        assignedTo: 'a2',
        nextFollowUp: null,
        notes: 'Prefer morning slots.'
    },
    {
        id: 3,
        name: 'Amit Kumar',
        number: '+91 99887 76655',
        tags: ['Pending Payment'],
        lastMsg: 'Okay, I will visit tomorrow.',
        time: 'Yesterday',
        unread: 0,
        assignedTo: null,
        nextFollowUp: 'Tomorrow, 10:00 AM',
        notes: null
    },
];

const MOCK_CHATS = {
    1: [
        { id: 1, type: 'msg', sender: 'user', text: 'Hi Rahul, thanks for your interest in our Gym Membership.', time: '10:25 AM', status: 'read' },
        { id: 2, type: 'note', sender: 'system', text: 'Rahul called earlier. Very interested in weight loss program.', time: '10:28 AM' },
        { id: 3, type: 'msg', sender: 'contact', text: 'Price kya hai?', time: '10:30 AM' }
    ],
    2: [
        { id: 1, type: 'msg', sender: 'contact', text: 'Payment done. Thanks!', time: 'Yesterday' },
        { id: 2, type: 'msg', sender: 'user', text: 'Received! We will schedule your session shortly.', time: 'Yesterday', status: 'delivered' }
    ]
};

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 group ${active ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
    >
        <div className="flex items-center space-x-3">
            <Icon size={20} className={active ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'} />
            <span className="font-medium text-sm">{label}</span>
        </div>
        {badge && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {badge}
            </span>
        )}
    </button>
);

const Badge = ({ children, color = 'blue' }) => {
    const colors = {
        blue: 'bg-blue-100 text-blue-700',
        green: 'bg-green-100 text-green-700',
        yellow: 'bg-yellow-100 text-yellow-700',
        red: 'bg-red-100 text-red-700',
        gray: 'bg-gray-100 text-gray-700',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${colors[color] || colors.gray}`}>
            {children}
        </span>
    );
};

// --- Main App ---

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('inbox');
    const [selectedContact, setSelectedContact] = useState(MOCK_CONTACTS[0]);
    const [chatInput, setChatInput] = useState('');
    const [inputType, setInputType] = useState('msg'); // 'msg' or 'note'
    const [messages, setMessages] = useState(MOCK_CHATS);
    const [showRightPanel, setShowRightPanel] = useState(true);

    // Send Message / Note Logic
    const handleSend = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const newMessage = {
            id: Date.now(),
            type: inputType,
            sender: inputType === 'msg' ? 'user' : 'system',
            text: chatInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent'
        };

        setMessages(prev => ({
            ...prev,
            [selectedContact.id]: [...(prev[selectedContact.id] || []), newMessage]
        }));
        setChatInput('');
    };

    const renderInbox = () => (
        <div className="flex h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

            {/* 1. Contact List Column */}
            <div className="w-80 border-r border-gray-200 flex flex-col flex-shrink-0">
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-gray-700">Team Inbox</h3>
                        <div className="flex space-x-1">
                            <button className="p-1.5 hover:bg-white rounded text-gray-500" title="Filter"><Filter size={16} /></button>
                            <button className="p-1.5 hover:bg-white rounded text-gray-500" title="New Chat"><Plus size={16} /></button>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    {/* Quick Filters */}
                    <div className="flex space-x-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                        <button className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full whitespace-nowrap">All</button>
                        <button className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-full whitespace-nowrap">Unread</button>
                        <button className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-full whitespace-nowrap">Assigned to Me</button>
                        <button className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-full whitespace-nowrap">Follow-up</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {MOCK_CONTACTS.map(contact => (
                        <div
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedContact.id === contact.id ? 'bg-green-50 border-l-4 border-l-green-600' : 'border-l-4 border-l-transparent'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-gray-900 text-sm truncate w-32">{contact.name}</span>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">{contact.time}</span>
                            </div>
                            <p className={`text-xs truncate mb-2 ${contact.unread > 0 ? 'font-bold text-gray-800' : 'text-gray-500'}`}>
                                {contact.lastMsg}
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex space-x-1">
                                    {contact.tags.slice(0, 2).map((tag, i) => (
                                        <span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded">{tag}</span>
                                    ))}
                                </div>
                                {contact.assignedTo && (
                                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] flex items-center justify-center font-bold" title="Assigned Agent">
                                        {AGENTS.find(a => a.id === contact.assignedTo)?.avatar}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Chat Area Column */}
            <div className="flex-1 flex flex-col bg-[#efeae2] relative min-w-0">
                {/* Chat Header */}
                <div className="px-4 py-3 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
                    <div className="flex items-center cursor-pointer" onClick={() => setShowRightPanel(!showRightPanel)}>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold mr-3 border-2 border-white shadow-sm">
                            {selectedContact.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">{selectedContact.name}</h4>
                            <p className="text-xs text-gray-500">{selectedContact.number}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-md px-2 py-1">
                            <span className="text-xs text-gray-500">Assign:</span>
                            <select className="bg-transparent text-xs font-medium text-gray-700 focus:outline-none cursor-pointer">
                                <option value="">Unassigned</option>
                                {AGENTS.map(agent => (
                                    <option key={agent.id} value={agent.id} selected={agent.id === selectedContact.assignedTo}>
                                        {agent.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="h-6 w-px bg-gray-300 mx-2"></div>
                        <button className="text-gray-500 hover:text-green-600"><Search size={18} /></button>
                        <button className="text-gray-500 hover:text-green-600" onClick={() => setShowRightPanel(!showRightPanel)}>
                            {showRightPanel ? <ChevronRight size={18} /> : <FileText size={18} />}
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-opacity-50 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
                    {(messages[selectedContact.id] || []).map((msg) => {
                        if (msg.type === 'note') {
                            return (
                                <div key={msg.id} className="flex justify-center my-4">
                                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-1.5 rounded-lg text-xs flex items-center shadow-sm max-w-sm">
                                        <Users size={12} className="mr-2 opacity-60" />
                                        <span className="font-medium mr-1">Internal Note:</span> {msg.text}
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[75%] rounded-lg px-3 py-1.5 shadow-sm relative text-sm ${msg.sender === 'user' ? 'bg-[#d9fdd3] text-gray-800 rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'
                                        }`}
                                >
                                    <p>{msg.text}</p>
                                    <div className="flex justify-end items-center space-x-1 mt-0.5 opacity-70">
                                        <span className="text-[10px]">{msg.time}</span>
                                        {msg.sender === 'user' && <CheckCheck size={12} className={msg.status === 'read' ? 'text-blue-500' : 'text-gray-400'} />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-gray-200">
                    {/* Input Mode Tabs */}
                    <div className="flex space-x-4 mb-2 px-1">
                        <button
                            onClick={() => setInputType('msg')}
                            className={`text-xs font-bold pb-1 border-b-2 transition-colors ${inputType === 'msg' ? 'text-green-600 border-green-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                        >
                            Reply to Customer
                        </button>
                        <button
                            onClick={() => setInputType('note')}
                            className={`text-xs font-bold pb-1 border-b-2 transition-colors flex items-center ${inputType === 'note' ? 'text-yellow-600 border-yellow-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                        >
                            <Users size={12} className="mr-1" /> Internal Note
                        </button>
                    </div>

                    <form onSubmit={handleSend} className="flex items-end space-x-2">
                        <div className="flex space-x-2 pb-2 text-gray-400">
                            <button type="button" className="hover:text-gray-600"><Smile size={20} /></button>
                            <button type="button" className="hover:text-gray-600"><Paperclip size={20} /></button>
                        </div>
                        <div className={`flex-1 rounded-lg border p-2 ${inputType === 'note' ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-300'}`}>
                            <textarea
                                rows="1"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder={inputType === 'note' ? "Add a private note for the team..." : "Type a message..."}
                                className="w-full bg-transparent text-sm focus:outline-none resize-none max-h-32"
                                style={{ minHeight: '24px' }}
                            />
                        </div>
                        <button
                            type="submit"
                            className={`p-2 rounded-full mb-1 transition-colors ${chatInput.trim()
                                ? (inputType === 'note' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white')
                                : 'bg-gray-100 text-gray-400'
                                }`}
                            disabled={!chatInput.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>

            {/* 3. CRM Right Panel (The Money Feature) */}
            {showRightPanel && (
                <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto flex-shrink-0">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800 text-sm mb-4">Customer Details</h3>
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500 mr-3">
                                {selectedContact.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{selectedContact.name}</p>
                                <p className="text-sm text-gray-500">{selectedContact.number}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedContact.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md flex items-center group cursor-pointer hover:bg-gray-200">
                                    {tag}
                                </span>
                            ))}
                            <button className="px-2 py-1 border border-dashed border-gray-300 text-gray-400 text-xs rounded-md hover:border-green-500 hover:text-green-600">
                                + Tag
                            </button>
                        </div>
                    </div>

                    {/* Money Feature: Follow-ups */}
                    <div className="p-4 border-b border-gray-100 bg-orange-50/50">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-gray-800 text-xs flex items-center">
                                <Clock size={14} className="mr-1.5 text-orange-600" />
                                Next Follow-up
                            </h4>
                            <button className="text-orange-600 text-xs font-medium hover:underline">+ Add</button>
                        </div>

                        {selectedContact.nextFollowUp ? (
                            <div className="bg-white p-3 rounded-lg border border-orange-200 shadow-sm flex items-start">
                                <Calendar size={16} className="text-orange-500 mt-0.5 mr-2" />
                                <div>
                                    <p className="text-sm font-bold text-gray-800">{selectedContact.nextFollowUp}</p>
                                    <p className="text-xs text-gray-500 mt-1">Reminder set by You</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 italic">No follow-ups scheduled.</p>
                        )}
                    </div>

                    {/* Custom Fields / Info */}
                    <div className="p-4 border-b border-gray-100">
                        <h4 className="font-bold text-gray-800 text-xs mb-3">Contact Info</h4>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Email</p>
                                <p className="text-sm text-gray-700">rahul.gym@gmail.com</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Location</p>
                                <p className="text-sm text-gray-700">Mumbai, Andheri West</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Source</p>
                                <Badge color="blue">Facebook Ad</Badge>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="p-4">
                        <h4 className="font-bold text-gray-800 text-xs mb-3 flex items-center justify-between">
                            <span>Notes</span>
                            <button className="text-gray-400 hover:text-gray-600"><Plus size={14} /></button>
                        </h4>
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm text-gray-700 italic">
                            "{selectedContact.notes || "No notes yet."}"
                        </div>
                    </div>

                </div>
            )}
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
            {/* Sidebar */}
            <div className="w-16 lg:w-64 bg-white border-r border-gray-200 flex flex-col z-20 flex-shrink-0 transition-all duration-300">
                <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-100">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-sm shadow-green-200">
                        <Smartphone size={18} />
                    </div>
                    <span className="hidden lg:block ml-3 text-lg font-bold tracking-tight text-gray-800">WtsCRM</span>
                </div>

                <nav className="flex-1 px-2 lg:px-4 space-y-1 mt-4 overflow-y-auto">
                    <SidebarItem icon={BarChart3} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <SidebarItem icon={MessageSquare} label="Team Inbox" active={activeTab === 'inbox'} onClick={() => setActiveTab('inbox')} badge="2" />
                    <SidebarItem icon={Users} label="Contacts" active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} />
                    <SidebarItem icon={Send} label="Broadcasts" active={activeTab === 'broadcast'} onClick={() => setActiveTab('broadcast')} />
                    <div className="pt-4 pb-2">
                        <p className="hidden lg:block px-4 text-xs font-bold text-gray-400 uppercase mb-2">Tools</p>
                        <SidebarItem icon={Calendar} label="Follow-ups" active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} badge="5" />
                        <SidebarItem icon={Zap} label="Automation" active={activeTab === 'automation'} onClick={() => setActiveTab('automation')} />
                    </div>
                </nav>

                <div className="p-2 lg:p-4 border-t border-gray-100">
                    <SidebarItem icon={Settings} label="Settings" onClick={() => { }} />
                    <button className="hidden lg:flex mt-2 w-full items-center px-4 py-2 text-xs text-gray-500 hover:bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold mr-2">ME</div>
                        <div className="text-left">
                            <p className="font-bold text-gray-700">Admin User</p>
                            <p className="text-[10px]">Starter Plan</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full min-w-0">
                {activeTab === 'inbox' ? renderInbox() : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                {activeTab === 'dashboard' && <BarChart3 size={32} />}
                                {activeTab === 'contacts' && <Users size={32} />}
                                {activeTab === 'broadcast' && <Send size={32} />}
                                {activeTab === 'tasks' && <Calendar size={32} />}
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">
                                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module
                            </h2>
                            <p className="text-gray-500 text-sm mb-6">
                                This module is part of the full build. In the MVP, focus on the Inbox and Follow-ups first.
                            </p>
                            <button className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-black transition-all">
                                Return to Inbox
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}