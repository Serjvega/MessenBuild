
import React, { useState, useEffect, useRef } from 'react';
import { 
  LogIn, UserPlus, MessageSquare, Code, X, ShieldCheck, 
  Database, Terminal, ChevronRight, Lock, Search, MoreVertical, 
  Paperclip, Send, Check, CheckCheck, Menu, ArrowLeft, Info
} from 'lucide-react';
import { AuthMode, User, Message, ChatSession } from './types';
import { getBackendAdvice } from './geminiService';

const MOCK_CHATS: ChatSession[] = [
  { id: '1', participant: 'ИИ-Наставник', lastMessage: 'Как успехи с Argon2?', lastMessageTime: '12:45', unreadCount: 1, isOnline: true, avatar: 'AI' },
  { id: '2', participant: 'Александр (Dev)', lastMessage: 'Скинул пример миграций.', lastMessageTime: 'Вчера', unreadCount: 0, isOnline: false, avatar: 'AD' },
  { id: '3', participant: 'Frontend Группа', lastMessage: 'Кто-то пробовал Tailwind v4?', lastMessageTime: 'Пн', unreadCount: 0, isOnline: true, avatar: 'FG' },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: 'm1', senderId: '1', text: 'Привет! Я твой виртуальный наставник по Flask.', timestamp: '12:40', status: 'read' },
    { id: 'm2', senderId: 'me', text: 'Привет! Пытаюсь разобраться с базой данных.', timestamp: '12:42', status: 'read' },
    { id: 'm3', senderId: '1', text: 'Отлично. Как успехи с Argon2? Помни, что безопасность — это фундамент.', timestamp: '12:45', status: 'sent' },
  ]
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Chat state
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState('');
  
  // AI Assistant state
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Simulated backend logs
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (messageEndRef.current) messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChatId]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (username.length < 3 || password.length < 6) {
      setError('Логин должен быть > 3 символов, пароль > 6.');
      return;
    }
    const storedUsers = JSON.parse(localStorage.getItem('edu_users') || '[]');
    if (mode === 'register') {
      const exists = storedUsers.find((u: User) => u.username === username);
      if (exists) { setError('Пользователь существует.'); return; }
      storedUsers.push({ id: Date.now().toString(), username, password });
      localStorage.setItem('edu_users', JSON.stringify(storedUsers));
      setMode('login');
      addLog(`User ${username} registered with simulated Argon2.`);
    } else {
      const user = storedUsers.find((u: User) => u.username === username && u.password === password);
      if (user) {
        setIsLoggedIn(true);
        setCurrentUser(user);
        addLog(`Login successful for ${username}. Session established.`);
      } else {
        setError('Неверный логин или пароль.');
      }
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChatId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMessage]
    }));
    setInputMessage('');
    addLog(`POST /api/messages - Payload: "${inputMessage}" to Chat ${activeChatId}`);
  };

  const askAi = async (topic: string) => {
    setIsAiLoading(true);
    setIsAiOpen(true);
    const advice = await getBackendAdvice(topic);
    setAiAdvice(advice);
    setIsAiLoading(false);
  };

  if (isLoggedIn && currentUser) {
    const activeChat = MOCK_CHATS.find(c => c.id === activeChatId);

    return (
      <div className="flex h-screen bg-slate-950 overflow-hidden font-sans text-slate-200">
        {/* Sidebar */}
        <div className={`${showSidebar ? 'w-full sm:w-80 lg:w-96' : 'hidden'} flex-shrink-0 border-r border-white/5 flex flex-col bg-slate-900/50 backdrop-blur-xl transition-all duration-300`}>
          <div className="p-4 flex items-center justify-between border-b border-white/5 h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                {currentUser.username[0].toUpperCase()}
              </div>
              <h2 className="font-bold text-lg hidden sm:block">Чаты</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => askAi('Flask-SocketIO real-time architecture')} className="p-2 hover:bg-white/5 rounded-full text-indigo-400">
                <Code size={20} />
              </button>
              <button onClick={() => { setIsLoggedIn(false); addLog('Logout'); }} className="p-2 hover:bg-white/5 rounded-full text-slate-500">
                <LogOutIcon size={20} />
              </button>
            </div>
          </div>

          <div className="p-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input 
                placeholder="Поиск сообщений..." 
                className="w-full bg-slate-950 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {MOCK_CHATS.map(chat => (
              <button 
                key={chat.id}
                onClick={() => { setActiveChatId(chat.id); if (window.innerWidth < 640) setShowSidebar(false); }}
                className={`w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-all text-left relative ${activeChatId === chat.id ? 'bg-indigo-600/10' : ''}`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-bold text-slate-400 overflow-hidden">
                    {chat.avatar === 'AI' ? <MessageSquare size={24} className="text-indigo-400" /> : chat.avatar}
                  </div>
                  {chat.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-sm text-slate-200 truncate">{chat.participant}</h3>
                    <span className="text-[10px] text-slate-500">{chat.lastMessageTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
                    {chat.unreadCount > 0 && (
                      <span className="bg-indigo-600 text-[10px] font-bold text-white px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-lg shadow-indigo-600/30">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] relative ${!showSidebar ? 'block' : 'hidden sm:flex'}`}>
          {!activeChatId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/40 backdrop-blur-sm">
              <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center text-indigo-400 mb-6 animate-pulse">
                <MessageSquare size={40} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Выберите чат</h2>
              <p className="text-slate-500 max-w-sm">Или начните проектировать backend-логику эндпоинтов для получения сообщений.</p>
              <button 
                onClick={() => askAi('Designing Message SQL Model in Flask-SQLAlchemy')}
                className="mt-6 flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-bold bg-indigo-600/10 px-4 py-2 rounded-xl transition"
              >
                <Code size={18} /> Изучить структуру БД
              </button>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 bg-slate-900/80 backdrop-blur-xl z-10">
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowSidebar(true)} className="sm:hidden p-2 -ml-2 text-slate-400">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-indigo-400">
                    {activeChat?.avatar === 'AI' ? <MessageSquare size={20} /> : activeChat?.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{activeChat?.participant}</h3>
                    <p className="text-[10px] text-emerald-400 font-medium">{activeChat?.isOnline ? 'в сети' : 'был недавно'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => askAi(`Implementing search in messages Flask SQLite`)} className="p-2 hover:bg-white/5 rounded-full text-slate-500"><Search size={20} /></button>
                  <button className="p-2 hover:bg-white/5 rounded-full text-slate-500"><Info size={20} /></button>
                  <button className="p-2 hover:bg-white/5 rounded-full text-slate-500"><MoreVertical size={20} /></button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950/20 backdrop-blur-[2px]">
                {(messages[activeChatId] || []).map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-xl relative ${
                      msg.senderId === 'me' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-slate-800/90 text-slate-200 rounded-bl-none border border-white/5'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className={`text-[10px] ${msg.senderId === 'me' ? 'text-indigo-200' : 'text-slate-500'}`}>
                          {msg.timestamp}
                        </span>
                        {msg.senderId === 'me' && (
                          msg.status === 'read' ? <CheckCheck size={12} className="text-indigo-200" /> : <Check size={12} className="text-indigo-200" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>

              {/* Input Bar */}
              <form onSubmit={sendMessage} className="p-4 bg-slate-900/80 backdrop-blur-xl border-t border-white/5">
                <div className="flex items-center gap-3 max-w-5xl mx-auto">
                  <button type="button" className="p-2 hover:bg-white/5 rounded-full text-slate-500">
                    <Paperclip size={22} />
                  </button>
                  <div className="flex-1 relative">
                    <input 
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Напишите сообщение..."
                      className="w-full bg-slate-950 border border-white/5 text-white rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm"
                    />
                  </div>
                  <button 
                    disabled={!inputMessage.trim()}
                    className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:bg-slate-800 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Mini Log Console (Overlay Toggle) */}
          <div className="absolute top-20 right-4 flex flex-col items-end gap-2 group z-20 pointer-events-none">
            <div className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-2xl p-3 shadow-2xl w-64 h-48 overflow-hidden pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-between mb-2 border-b border-white/10 pb-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  <Terminal size={12} /> Live API Logs
                </span>
              </div>
              <div className="h-full overflow-y-auto font-mono text-[9px] text-emerald-500/70 space-y-1">
                {logs.map((l, i) => <div key={i}>{l}</div>)}
              </div>
            </div>
            <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full text-[10px] font-bold pointer-events-auto cursor-help shadow-lg">
              LOGS ACTIVE
            </div>
          </div>
        </div>

        {/* AI Overlay Modal */}
        {isAiOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="glass w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col border-white/10">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/30">
                    <Code className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Архитектор Messenger</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Flask + Real-time + Security</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAiOpen(false)}
                  className="p-3 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {isAiLoading ? (
                  <div className="space-y-6">
                    <div className="h-5 bg-white/5 rounded-full w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-white/5 rounded-full w-full animate-pulse"></div>
                    <div className="h-4 bg-white/5 rounded-full w-5/6 animate-pulse"></div>
                    <div className="h-40 bg-slate-950 rounded-3xl w-full animate-pulse mt-8 border border-white/5"></div>
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm">
                    {aiAdvice}
                  </div>
                )}
              </div>
              
              <div className="p-6 bg-slate-950/50 border-t border-white/5 text-center flex items-center justify-center gap-4">
                <span className="text-[10px] text-slate-600 uppercase tracking-widest font-black">Powered by Gemini AI</span>
                <div className="h-4 w-px bg-white/10"></div>
                <span className="text-[10px] text-indigo-400 font-bold">Уровень: Middle+</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Auth View (Existing)
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] -z-10 rounded-full"></div>
      
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-5 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-600/40 mb-6 transition-all hover:rotate-6 active:scale-95 cursor-pointer">
            <MessageSquare className="text-white" size={44} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">EduMessenger</h1>
          <p className="text-slate-500 mt-2 font-medium tracking-wide">Разработка профессионального бэкенда</p>
        </div>

        <div className="glass rounded-[3rem] p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 relative">
          <div className="flex p-1.5 bg-slate-950/80 rounded-2xl mb-10 border border-white/5">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 text-[10px] font-black tracking-[0.2em] rounded-xl transition-all duration-500 uppercase ${
                mode === 'login' 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-3 text-[10px] font-black tracking-[0.2em] rounded-xl transition-all duration-500 uppercase ${
                mode === 'register' 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              REGISTER
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">USER ID</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-600 group-focus-within:text-indigo-400 transition-all">
                  <LogIn size={20} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin_dev"
                  className="w-full bg-slate-950 border border-white/10 text-white rounded-[1.5rem] py-4 pl-14 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-800 font-bold text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">SECRET KEY</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-600 group-focus-within:text-indigo-400 transition-all">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-white/10 text-white rounded-[1.5rem] py-4 pl-14 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-800 font-bold text-sm"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-[11px] font-black bg-red-400/5 p-4 rounded-2xl border border-red-400/20 text-center uppercase tracking-wider">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-[0.3em] py-5 rounded-[1.5rem] shadow-2xl shadow-indigo-600/40 transition-all transform active:scale-95 flex items-center justify-center gap-3"
            >
              {mode === 'login' ? 'Proceed' : 'Create Entry'}
              <ChevronRight size={18} />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-4">
             <button 
                onClick={() => askAi('Comparison: Argon2 vs PBKDF2 in Python')}
                className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-widest"
              >
                <ShieldCheck size={14} /> Argon2ID Protected
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple wrapper for the logout icon
const LogOutIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);

export default App;
