import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Send, Maximize2, Loader2, Sparkles, User as UserIcon, Bot, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = {
  navy: "#0A1628",
  navyMid: "#112240",
  teal: "#00C9A7",
  tealLight: "#E0FDF6",
  white: "#FFFFFF",
  offWhite: "#F8FAFC",
  border: "#E2E8F0",
  muted: "#64748B",
};

const ease = [0.16, 1, 0.3, 1] as const;

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
}

const HIDDEN_PATHS = ['/', '/login', '/register', '/DashBoard/RogNidhiHistory'];

export const GlobalChatBot: React.FC = () => {
  // 'pill' = semi-expanded bar, 'open' = full window, null = in HIDDEN_PATHS (no render)
  const [mode, setMode] = useState<'pill' | 'open'>('pill');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'open') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, mode]);

  useEffect(() => {
    if (mode === 'open' && messages.length === 0) {
      setMessages([{ id: Date.now(), sender: 'ai', text: "Hello! I'm RogNidhi. How can I help you today?" }]);
    }
  }, [mode, messages.length]);

  useEffect(() => {
    if (mode === 'open') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [mode]);

  // Replace this:
// if (HIDDEN_PATHS.includes(location.pathname)) return null;

// With this variable check:
const isHidden = HIDDEN_PATHS.includes(location.pathname);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const newMsg: Message = { id: Date.now(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsLoading(true);

    let activeSessionId = sessionId;

    try {
      const token = localStorage.getItem('access');
      if (!token) throw new Error('No auth token');

      if (!activeSessionId) {
        const res = await fetch('http://127.0.0.1:8000/api/chat/sessions/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ title: newMsg.text.slice(0, 30) + '...' })
        });
        if (res.ok) {
          const data = await res.json();
          activeSessionId = data.id;
          setSessionId(activeSessionId);
        } else throw new Error('Failed to create session');
      }

      const res = await fetch(`http://127.0.0.1:8000/api/chat/sessions/${activeSessionId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ question: newMsg.text })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.messages?.length > 0) {
          const last = data.messages[data.messages.length - 1];
          if (last.sender === 'ai') {
            setMessages(prev => [...prev, { id: last.id, sender: 'ai', text: last.text }]);
          }
        }
      } else {
        setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: 'Something went wrong.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: 'Network error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: isHidden ? 'none' : 'block' }}>
      <AnimatePresence mode="wait">

        {/* ─── PILL (semi-expanded) ─── */}
        {mode === 'pill' && (
          <motion.div
            key="pill"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.22, ease }}
            style={{
              position: 'fixed',
              bottom: 28, right: 28,
              width: 320, height: 58,
              background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyMid} 100%)`,
              borderRadius: 12,
              display: 'flex', alignItems: 'center',
              padding: '0 6px 0 16px',
              boxShadow: '0 8px 28px rgba(10,22,40,0.22)',
              zIndex: 9999,
              gap: 10,
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Icon */}
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(0,201,167,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={15} color={COLORS.teal} />
            </div>

            {/* Fake input tap target */}
            <div
              onClick={() => setMode('open')}
              style={{ flex: 1, cursor: 'text', fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 500, userSelect: 'none' }}
            >
              Ask RogNidhi…
            </div>

            {/* Expand button */}
            <button
              onClick={() => setMode('open')}
              title="Expand"
              style={{ background: 'rgba(0,201,167,0.15)', border: 'none', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: COLORS.teal }}
            >
              <ChevronDown size={16} style={{ transform: 'rotate(180deg)' }} />
            </button>

            {/* Full page */}
            <button
              onClick={() => navigate('/DashBoard/RogNidhiHistory')}
              title="Open full page"
              style={{ background: 'transparent', border: 'none', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}
            >
              <Maximize2 size={15} />
            </button>
          </motion.div>
        )}

        {/* ─── FULL WINDOW ─── */}
        {mode === 'open' && (
          <motion.div
            key="window"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.24, ease }}
            style={{
              position: 'fixed',
              bottom: 28, right: 28,
              width: 400, height: 580,
              background: COLORS.white,
              borderRadius: 14,
              boxShadow: '0 20px 60px rgba(10,22,40,0.14), 0 4px 16px rgba(10,22,40,0.06)',
              border: `1px solid ${COLORS.border}`,
              display: 'flex', flexDirection: 'column',
              zIndex: 9999,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 18px',
              background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyMid} 100%)`,
              display: 'flex', alignItems: 'center', gap: 12,
              flexShrink: 0,
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(0,201,167,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={16} color={COLORS.teal} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>RogNidhi AI</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Medical Insights</div>
              </div>
              <button
                onClick={() => navigate('/DashBoard/RogNidhiHistory')}
                title="Open full page"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center' }}
              >
                <Maximize2 size={15} />
              </button>
              <button
                onClick={() => setMode('pill')}
                title="Minimize"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center' }}
              >
                <ChevronDown size={16} />
              </button>
              <button
                onClick={() => { setMode('pill'); }}
                title="Close"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages area */}
            <div
              style={{ flex: 1, overflowY: 'auto', padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}
            >
              <style>{`
                .gcb-scroll::-webkit-scrollbar { width: 4px; }
                .gcb-scroll::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 4px; }
                .gcb-spin { animation: gcb-spin 1s linear infinite; }
                @keyframes gcb-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              `}</style>
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease }}
                    style={{ display: 'flex', gap: 10, flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: msg.sender === 'user' ? COLORS.navy : COLORS.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {msg.sender === 'user' ? <UserIcon size={13} color="#fff" /> : <Bot size={13} color={COLORS.teal} />}
                    </div>
                    <div style={{
                      maxWidth: '78%', padding: '11px 15px', fontSize: 13.5, lineHeight: 1.6,
                      borderRadius: msg.sender === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                      background: msg.sender === 'user' ? COLORS.navy : COLORS.offWhite,
                      color: msg.sender === 'user' ? '#fff' : COLORS.navy,
                      border: msg.sender === 'user' ? 'none' : `1px solid ${COLORS.border}`,
                      boxShadow: msg.sender === 'user' ? '0 3px 10px rgba(10,22,40,0.14)' : '0 2px 6px rgba(0,0,0,0.03)',
                    }}>
                      {msg.text.split('\n').map((line, i) => (
                        <React.Fragment key={i}>{line}{i < msg.text.split('\n').length - 1 && <br />}</React.Fragment>
                      ))}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.18, ease }}
                    style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: COLORS.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bot size={13} color={COLORS.teal} />
                    </div>
                    <div style={{ padding: '11px 15px', background: COLORS.offWhite, border: `1px solid ${COLORS.border}`, borderRadius: '4px 14px 14px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Loader2 size={14} color={COLORS.teal} className="gcb-spin" />
                      <span style={{ fontSize: 13, color: COLORS.muted }}>Thinking...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '14px 16px', borderTop: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: COLORS.offWhite, borderRadius: 9, padding: '9px 12px', border: `1px solid ${COLORS.border}` }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask RogNidhi..."
                  style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13.5, fontWeight: 500, color: COLORS.navy }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  style={{
                    background: inputValue.trim() ? COLORS.teal : COLORS.border,
                    color: inputValue.trim() ? COLORS.navy : COLORS.muted,
                    border: 'none', width: 32, height: 32, borderRadius: 7,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: inputValue.trim() ? 'pointer' : 'default',
                    transition: 'all 0.18s ease', flexShrink: 0,
                  }}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};