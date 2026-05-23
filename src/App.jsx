import React, { useState, useEffect } from 'react';
import {
    Home as HomeIcon,
    Clock,
    Dumbbell,
    Brain,
    User,
    CheckCircle2,
    ChevronRight,
    Flame,
    Play,
    Check,
    ChevronLeft,
    TrendingUp,
    Award,
    Calendar,
    ShoppingCart,
    Info,
    Droplet,
    Activity,
    Shield,
    Zap,
    AlertTriangle,
    Bell,
    BellRing,
    CreditCard,
    QrCode,
    Smartphone,
    Wallet,
    Package,
    X,
    Truck,
    Search,
    Loader,
    FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    saveRituals,
    getRituals,
    getStreak,
    updateStreak,
    getDailyCheckin,
    doCheckin,
    getHistory,
    saveToHistory,
    clearAllData,
    getUserId
} from './utils/storage';
import { supabase } from './utils/supabase';

// --- Sub-components ---

const BottomNav = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'home', icon: HomeIcon, label: 'Home' },
        { id: 'protocol', icon: Clock, label: 'Protocol' },
        { id: 'knowledge', icon: Brain, label: 'Knowledge' },
        { id: 'progress', icon: TrendingUp, label: 'Stats' },
        { id: 'store', icon: ShoppingCart, label: 'Store' },
        { id: 'profile', icon: User, label: 'Profile' }
    ];

    return (
        <nav className="glass-nav" style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            padding: '12px 0 calc(env(safe-area-inset-bottom) + 12px)', 
            borderTop: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(10,10,10,0.85)',
            backdropFilter: 'blur(10px)',
            position: 'fixed',
            bottom: 0,
            width: '100%',
            maxWidth: '480px',
            zIndex: 1000
        }}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: activeTab === tab.id ? '#FFFFFF' : '#666666',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.3s ease',
                        flex: 1,
                        cursor: 'pointer'
                    }}
                >
                    <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} style={{ filter: activeTab === tab.id ? 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' : 'none' }} />
                    <span style={{ fontSize: '11px', fontWeight: activeTab === tab.id ? 600 : 500 }}>{tab.label}</span>
                </button>
            ))}
        </nav>
    );
};

const NextRoutineBanner = ({ rituals }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const timeStr = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    
    // Find next ritual
    const remainingRituals = rituals
        .filter(r => !r.completed)
        .sort((a, b) => a.time.localeCompare(b.time));
    
    const nextRitual = remainingRituals.find(r => r.time >= timeStr) || remainingRituals[0];
    const allDone = rituals.every(r => r.completed);

    if (allDone) {
        return (
            <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(0,230,118,0.2) 0%, rgba(0,0,0,0.5) 100%)', marginBottom: '24px', border: '1px solid rgba(0,230,118,0.3)', textAlign: 'center' }}>
                <CheckCircle2 size={32} color="#00E676" style={{ marginBottom: '12px' }} />
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Misi Hari Ini Tuntas!</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#AAA' }}>Semua protocol telah dijalankan. Terus pertahankan!</p>
            </div>
        );
    }

    if (!nextRitual) return null;

    return (
        <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(0,230,118,0.15) 0%, rgba(20,20,20,0.8) 100%)', marginBottom: '24px', border: '1px solid rgba(0,230,118,0.2)', position: 'relative', overflow: 'hidden' }}>
            <Bell size={40} color="rgba(0,230,118,0.1)" style={{ position: 'absolute', right: -5, top: -5 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                    <span style={{ fontSize: '10px', color: '#00E676', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', background: 'rgba(0,230,118,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                        NEXT ROUTINE
                    </span>
                    <h3 style={{ margin: '12px 0 4px 0', fontSize: '20px', fontWeight: 'bold' }}>{nextRitual.title}</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#BBB' }}>{nextRitual.subtitle}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#FFF' }}>{nextRitual.time}</div>
                    <div style={{ fontSize: '10px', color: '#888' }}>SCHEDULED</div>
                </div>
            </div>
        </div>
    );
};

const SectionHeader = ({ title, subtitle }) => (
    <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', color: '#FFF', fontWeight: 'bold', letterSpacing: '-0.5px' }}>{title}</h1>
        {subtitle && <p style={{ color: '#888', marginTop: '4px', fontSize: '14px' }}>{subtitle}</p>}
    </div>
);

// --- Pages ---

const HomeView = ({ rituals, toggleRitual, streak, isAlarmActive, toggleAlarm }) => {
    const completedCount = rituals.filter(r => r.completed).length;
    const progressPercent = rituals.length > 0 ? (completedCount / rituals.length) * 100 : 0;
    
    // Quotes for motivation
    const quotes = [
        "Disiplin adalah jembatan antara tujuan dan pencapaian.",
        "Singkirkan kenyamanan, jemput kemenangan.",
        "Hari ini adalah investasi untuk versi terbaik dirimu.",
        "Rasa sakit karena disiplin jauh lebih ringan daripada rasa sakit karena penyesalan.",
        "Bangun lebih pagi, bekerja lebih keras, hidup lebih bermakna."
    ];
    const todayQuote = quotes[new Date().getDate() % quotes.length];

    // Determine level dynamically based on streak
    let level = 'Pria Pemula';
    if (streak >= 7 && streak < 21) level = 'Pria Disiplin';
    else if (streak >= 21 && streak < 60) level = 'Disiplin Elit';
    else if (streak >= 60) level = 'Sang Raja';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ paddingBottom: '100px' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Dashboard</h1>
                    <p style={{ color: '#888', fontSize: '14px' }}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Flame size={18} color="#FF5A5F" />
                    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{streak}</span>
                </div>
            </div>

            {/* Next Routine Banner */}
            <NextRoutineBanner rituals={rituals} />

            {/* Daily Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div className="glass-card" style={{ padding: '16px' }}>
                    <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Level Saat Ini</p>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFF' }}>{level}</div>
                </div>
                <div className="glass-card" style={{ padding: '16px' }}>
                    <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Energi Harian</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Activity size={16} color="#00E676" />
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#00E676' }}>Optimal</span>
                    </div>
                </div>
            </div>



            {/* Daily Protocol Checklist */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={20} /> Daily Protocol
                    </h2>
                    <span style={{ fontSize: '12px', color: '#888' }}>{completedCount}/{rituals.length} Selesai</span>
                </div>
                
                {/* Progress Bar */}
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '20px', overflow: 'hidden' }}>
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        style={{ height: '100%', background: '#FFF', borderRadius: '2px' }}
                    />
                </div>

                {rituals.length > 0 ? (
                    rituals.map(item => (
                        <div
                            key={item.id}
                            className={`ritual-item ${item.completed ? 'completed' : ''}`}
                            onClick={() => toggleRitual(item.id)}
                            style={{ 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                padding: '16px',
                                background: item.completed ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                marginBottom: '12px',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}
                        >

                            <div style={{ flex: 1, opacity: item.completed ? 0.5 : 1 }}>
                                <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{item.title}</div>
                                {item.subtitle && <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>{item.subtitle}</div>}
                                {item.time && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#00E676', fontWeight: 'bold' }}>
                                        <Clock size={12} /> {item.time}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className={`checkbox ${item.completed ? 'checked' : ''}`}>
                                    {item.completed && <CheckCircle2 size={16} />}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
                        <p style={{ color: '#666' }}>Protocol kosong. Atur di tab Protocol.</p>
                    </div>
                )}
            </div>

            {/* Education Card */}
            <div className="glass-card" style={{ background: 'linear-gradient(135deg, #111 0%, #000 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Info size={16} color="#888" />
                    <span style={{ color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Fakta Testosteron</span>
                </div>
                <p style={{ color: '#DDD', fontSize: '14px', lineHeight: '1.6' }}>
                    "Tidur kurang dari 5 jam per malam selama seminggu dapat menurunkan level testosteron sebesar 10-15%. Prioritaskan istirahat Anda untuk performa puncak."
                </p>
            </div>

            {/* Daily Motivation Section */}
            <div className="glass-card" style={{ marginTop: '24px', position: 'relative', overflow: 'hidden', padding: '24px', background: 'rgba(255,255,255,0.03)' }}>
                <Zap size={48} color="rgba(255,255,255,0.05)" style={{ position: 'absolute', top: -10, right: -10 }} />
                <h3 style={{ fontSize: '14px', color: '#00E676', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', fontWeight: 'bold' }}>HARI INI</h3>
                <p style={{ fontSize: '18px', fontWeight: '500', fontStyle: 'italic', lineHeight: '1.4', margin: 0, color: '#FFF' }}>
                    "{todayQuote}"
                </p>
            </div>
        </motion.div>
    );
};

const ProtocolView = ({ rituals, setRituals }) => {
    // Phase for 30 Day Program
    const [selectedDate, setSelectedDate] = useState(new Date());

    const days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });

    const handleResetProtocol = () => {
        const defaultRituals = [
            { id: 1, title: 'Bangun Pagi (Sebelum 06:00)', completed: false },
            { id: 2, title: 'Olahraga (Min 30 Menit)', completed: false },
            { id: 3, title: 'Minum Youman', completed: false },
            { id: 4, title: 'Fokus Kerja (Deep Work 2 Jam)', completed: false }
        ];
        setRituals(defaultRituals);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ paddingBottom: '100px' }}
        >
            <SectionHeader title="Protocol" subtitle="30 Day Discipline Program" />

            <div style={{ marginBottom: '32px', display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', msOverflowStyle: 'none', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain' }} className="calendar-scroll">
                {days.map((date, idx) => {
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const isToday = date.toDateString() === new Date().toDateString();
                    return (
                        <div 
                            key={idx}
                            onClick={() => setSelectedDate(date)}
                            className="glass-card"
                            style={{
                                minWidth: '70px',
                                padding: '16px 12px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                                border: isSelected ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.2s ease',
                                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                flexShrink: 0
                            }}
                        >
                            <div style={{ fontSize: '11px', color: isSelected ? '#FFF' : '#888', textTransform: 'uppercase', marginBottom: '8px', fontWeight: isSelected ? 'bold' : 'normal' }}>
                                {date.toLocaleDateString('id-ID', { weekday: 'short' })}
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: '800', position: 'relative' }}>
                                {date.getDate()}
                                {isToday && (
                                    <div style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', background: '#00E676', borderRadius: '50%' }} />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="glass-card" style={{ marginBottom: '24px', background: 'rgba(0, 230, 118, 0.05)', border: '1px solid rgba(0, 230, 118, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Calendar size={20} color="#00E676" />
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                            Jadwal {selectedDate.toDateString() === new Date().toDateString() ? 'Hari Ini' : selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888' }}>
                            {selectedDate.toDateString() === new Date().toDateString() ? 'Laksanakan protokol harian Anda.' : 'Siapkan disiplin Anda untuk hari esok.'}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px' }}>Daily Rituals</h2>
                {rituals.length === 0 && (
                    <button onClick={handleResetProtocol} style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '12px', textDecoration: 'underline' }}>Set Default</button>
                )}
            </div>

            {rituals.map(item => (
                <div key={item.id} className="glass-card" style={{ padding: '16px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input 
                            value={item.title}
                            onChange={(e) => setRituals(rituals.map(r => r.id === item.id ? { ...r, title: e.target.value } : r))}
                            placeholder="Nama Ritual"
                            style={{ background: 'none', border: 'none', color: '#FFF', fontWeight: '700', fontSize: '15px', padding: 0, outline: 'none', width: '100%' }}
                        />
                        <input 
                            value={item.subtitle}
                            onChange={(e) => setRituals(rituals.map(r => r.id === item.id ? { ...r, subtitle: e.target.value } : r))}
                            placeholder="Deskripsi"
                            style={{ background: 'none', border: 'none', color: '#888', fontSize: '12px', padding: 0, outline: 'none', width: '100%' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input 
                            type="time" 
                            value={item.time} 
                            onChange={(e) => {
                                setRituals(rituals.map(r => r.id === item.id ? { ...r, time: e.target.value } : r));
                            }}
                            style={{ 
                                background: 'rgba(255,255,255,0.05)', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                color: '#FFF', 
                                padding: '6px 8px', 
                                borderRadius: '8px',
                                fontSize: '12px',
                                outline: 'none'
                            }}
                        />
                        <button 
                            onClick={() => setRituals(rituals.filter(r => r.id !== item.id))}
                            style={{ background: 'none', border: 'none', color: '#FF3B30', fontSize: '12px', padding: '0' }}
                        >Hapus</button>
                    </div>
                </div>
            ))}

            <div style={{ marginTop: '24px' }}>
                <button 
                    onClick={() => {
                        const newId = Date.now();
                        setRituals([...rituals, { id: newId, title: 'Ritual Baru', subtitle: 'Atur deskripsi ritual Anda', time: '12:00', completed: false }]);
                    }}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', color: '#888', fontWeight: 'bold', fontSize: '13px' }}
                >
                    + Tambah Protocol Kustom
                </button>
            </div>
        </motion.div>
    );
};

const KnowledgeView = ({ streak }) => {
    const [knowledgeList, setKnowledgeList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activePdfUrl, setActivePdfUrl] = useState(null);
    const [activePdfTitle, setActivePdfTitle] = useState('');
    const [iframeLoading, setIframeLoading] = useState(true);

    let level = 'Pria Pemula';
    if (streak >= 7 && streak < 21) level = 'Pria Disiplin';
    else if (streak >= 21 && streak < 60) level = 'Disiplin Elit';
    else if (streak >= 60) level = 'Sang Raja';

    useEffect(() => {
        const fetchKnowledge = async () => {
            setIsLoading(true);
            const { data } = await supabase.from('knowledge_base').select('*').order('created_at', { ascending: false });
            if (data) {
                // Determine accessible levels
                const accessibleLevels = ['Semua Level', level];
                if (level === 'Sang Raja') accessibleLevels.push('Disiplin Elit', 'Pria Disiplin', 'Pria Pemula');
                else if (level === 'Disiplin Elit') accessibleLevels.push('Pria Disiplin', 'Pria Pemula');
                else if (level === 'Pria Disiplin') accessibleLevels.push('Pria Pemula');

                // Filter logic
                const filtered = data.filter(item => accessibleLevels.includes(item.target_level));
                setKnowledgeList(filtered);
            }
            setIsLoading(false);
        };
        fetchKnowledge();
    }, [streak, level]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ paddingBottom: '100px' }}
        >
            <SectionHeader title="Knowledge" subtitle="Pahami mesin penggerak maskulinitas Anda." />
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '13px', color: '#AAA' }}>
                Materi dibuka berdasarkan level kedisiplinan Anda. Level saat ini: <span style={{ color: '#00E676', fontWeight: 'bold' }}>{level}</span>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Memuat materi...</div>
            ) : knowledgeList.length > 0 ? (
                knowledgeList.map(item => (
                    <div key={item.id} className="glass-card" style={{ marginBottom: '24px', padding: '0', overflow: 'hidden' }}>
                        {item.image_url && (
                            <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                        )}
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' }}>
                                <h2 style={{ fontSize: '18px', margin: 0, lineHeight: '1.4' }}>{item.title}</h2>
                                <span style={{ fontSize: '10px', background: 'rgba(0,230,118,0.1)', color: '#00E676', padding: '6px 10px', borderRadius: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                    {item.target_level}
                                </span>
                            </div>
                            <div style={{ fontSize: '14px', color: '#BBB', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                {item.description}
                            </div>
                            {item.pdf_url && (
                                <div style={{ 
                                    marginTop: '20px', 
                                    paddingTop: '16px', 
                                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                                    display: 'flex',
                                    justifyContent: 'flex-start'
                                }}>
                                    <button 
                                        onClick={() => {
                                            setActivePdfUrl(item.pdf_url);
                                            setActivePdfTitle(item.title);
                                            setIframeLoading(true);
                                        }}
                                        style={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: '8px', 
                                            background: 'linear-gradient(135deg, #FF3B30 0%, #E60000 100%)', 
                                            color: '#FFF', 
                                            padding: '10px 18px', 
                                            borderRadius: '10px', 
                                            fontSize: '13px', 
                                            fontWeight: 'bold',
                                            border: 'none',
                                            boxShadow: '0 4px 12px rgba(255, 59, 48, 0.25)',
                                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 6px 18px rgba(255, 59, 48, 0.35)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 59, 48, 0.25)';
                                        }}
                                    >
                                        <FileText size={16} />
                                        Buka File PDF
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    Belum ada materi untuk level Anda saat ini.
                </div>
            )}

            <MotivationPanel />

            {/* Premium In-App PDF Reader Modal */}
            <AnimatePresence>
                {activePdfUrl && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(3, 7, 18, 0.95)',
                            backdropFilter: 'blur(12px)',
                            zIndex: 9999,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '16px'
                        }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="glass-card" 
                            style={{
                                width: '100%',
                                maxWidth: '900px',
                                height: '90%',
                                display: 'flex',
                                flexDirection: 'column',
                                padding: 0,
                                background: '#0a0f1d',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                        >
                            {/* Modal Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px 24px',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                                background: 'rgba(255, 255, 255, 0.02)'
                            }}>
                                <div>
                                    <span style={{ fontSize: '10px', color: '#FF3B30', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px' }}>In-App Reader</span>
                                    <h3 style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#FFF', fontWeight: 'bold', maxWidth: '300px', mdMaxWidth: '600px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {activePdfTitle}
                                    </h3>
                                </div>
                                <button 
                                    onClick={() => setActivePdfUrl(null)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '36px',
                                        height: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#FFF',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        padding: 0
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal Body / Iframe */}
                            <div style={{ flex: 1, position: 'relative', background: '#070a13', minHeight: '300px' }}>
                                {iframeLoading && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        background: '#070a13',
                                        zIndex: 10,
                                        gap: '12px'
                                    }}>
                                        <Loader className="animate-spin" size={32} color="#FF3B30" />
                                        <span style={{ fontSize: '13px', color: '#888' }}>Memuat dokumen PDF...</span>
                                    </div>
                                )}
                                <iframe 
                                    src={`https://docs.google.com/gview?url=${encodeURIComponent(activePdfUrl)}&embedded=true`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                        display: 'block'
                                    }}
                                    onLoad={() => setIframeLoading(false)}
                                    title={activePdfTitle}
                                ></iframe>
                            </div>

                            {/* Modal Footer */}
                            <div style={{
                                padding: '16px 24px',
                                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                                background: 'rgba(255, 255, 255, 0.02)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ fontSize: '12px', color: '#888' }}>
                                    Menggunakan Google PDF Viewer
                                </span>
                                <a 
                                    href={activePdfUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={{
                                        fontSize: '12px',
                                        color: '#FF3B30',
                                        textDecoration: 'none',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Buka di Tab Baru
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const MotivationPanel = () => {
    const quotes = [
        "Disiplin adalah jembatan antara cita-cita dan pencapaian.",
        "Rasa sakit karena disiplin jauh lebih ringan daripada rasa sakit karena penyesalan.",
        "Kemenangan terbesar adalah kemenangan atas diri sendiri.",
        "Jangan berhenti saat lelah, berhentilah saat selesai.",
        "Setiap hari adalah kesempatan untuk menjadi versi terbaik dirimu.",
        "Pria hebat tidak lahir dari kemudahan, tapi dari tempaan kesulitan.",
        "Waktumu terbatas, jangan habiskan untuk menjalani hidup orang lain."
    ];
    const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

    return (
        <div className="glass-card" style={{ 
            background: 'linear-gradient(135deg, rgba(0,230,118,0.1) 0%, rgba(0,184,212,0.1) 100%)',
            padding: '28px 20px',
            textAlign: 'center',
            borderRadius: '20px',
            marginTop: '16px',
            border: '1px solid rgba(0,230,118,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}>
            <div style={{ marginBottom: '16px', opacity: 0.6, fontSize: '24px' }}>“</div>
            <div style={{ fontSize: '17px', fontWeight: '500', fontStyle: 'italic', color: '#EEE', lineHeight: '1.6', marginBottom: '16px' }}>
                {quote}
            </div>
            <div style={{ fontSize: '10px', color: '#00E676', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Pesan Untuk Anda Hari Ini
            </div>
        </div>
    );
};

const StoreView = ({ onBack, userId }) => {
    const [products, setProducts] = useState([
        { id: '101', name: 'YOUMAN Premium Kit', price: 299000, stock: 45, status: 'Active' },
        { id: '102', name: 'Basic Fitness Band', price: 89000, stock: 12, status: 'Active' }
    ]);
    const [loading, setLoading] = useState(false);
    const [checkoutProduct, setCheckoutProduct] = useState(null);
    const [recipientName, setRecipientName] = useState(localStorage.getItem('youman_user_name') || '');
    const [recipientPhone, setRecipientPhone] = useState('');
    const [shippingProvince, setShippingProvince] = useState('');
    const [shippingCity, setShippingCity] = useState('');
    const [shippingDistrict, setShippingDistrict] = useState('');
    const [shippingVillage, setShippingVillage] = useState('');
    const [shippingStreet, setShippingStreet] = useState('');
    const [shippingCost, setShippingCost] = useState(0); // Fixed or 0 for manual
    
    const [paymentMethod, setPaymentMethod] = useState(null); // 'transfer', 'qris', 'pakasir'
    const [proofFile, setProofFile] = useState(null);

    const [paymentSettings, setPaymentSettings] = useState({
        xendit_enabled: true,
        xendit_api_key: ''
    });

    useEffect(() => {
        // Fetch products that are active
        supabase.from('products').select('*').eq('status', 'Active').then(({ data }) => {
            if (data && data.length > 0) setProducts(data);
        });
    }, []);



    const handleConfirmPayment = async () => {
        if (!recipientName.trim() || !recipientPhone.trim() || !shippingProvince.trim() || !shippingCity.trim() || !shippingDistrict.trim() || !shippingVillage.trim() || !shippingStreet.trim()) {
            return alert('Mohon lengkapi Nama, WhatsApp, dan Alamat Lengkap (Provinsi, Kabupaten/Kota, Kecamatan/Kelurahan, Desa, Nama Jalan).');
        }
        setLoading(true);
        try {
            const transactionId = `TRX-${Date.now().toString().slice(-6)}`;
            
            const productPrice = checkoutProduct.is_promo && checkoutProduct.discount_price ? checkoutProduct.discount_price : checkoutProduct.price;
            const amountToPay = productPrice + shippingCost;

            const fullAddress = `${shippingStreet}, Desa/Kel: ${shippingVillage}, Kec: ${shippingDistrict}, Kab/Kota: ${shippingCity}, Prov: ${shippingProvince}`;

            // 1. Simpan transaksi di Supabase dengan status Pending
            const { error: insertError } = await supabase.from('transactions').insert({
                id: transactionId,
                user_id: userId,
                user_name: recipientName,
                user_phone: recipientPhone,
                amount: amountToPay,
                status: 'Pending',
                method: 'Xendit Gateway',
                delivery_status: 'Processing',
                shipping_address: fullAddress,
                shipping_courier: 'Manual',
                shipping_cost: 0,
                shipping_area_id: null,
                shipping_postal_code: null,
                items: [{ 
                    id: checkoutProduct.id, 
                    name: checkoutProduct.name, 
                    price: amountToPay, 
                    quantity: 1 
                }]
            });

            if (insertError) {
                console.error('Supabase Insert Error:', insertError);
                throw new Error(`Gagal mencatat pesanan: ${insertError.message}`);
            }

            // 2. Buat Invoice Xendit
            const XENDIT_API_KEY = 'xnd_production_o1u7XXBaXExWBpfS8mdgtsaL6qdNPLjUykkPhkQ259EX7cnFKaxTpAo6pBESk7k9';
            
            const response = await fetch('https://api.xendit.co/v2/invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(XENDIT_API_KEY + ':')
                },
                body: JSON.stringify({
                    external_id: transactionId,
                    amount: amountToPay,
                    description: 'Pesanan YOUMAN: ' + checkoutProduct.name,
                    customer: {
                        given_names: recipientName,
                        email: 'customer@youman.id',
                        mobile_number: recipientPhone
                    },
                    success_redirect_url: window.location.href,
                    failure_redirect_url: window.location.href,
                    currency: 'IDR'
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.invoice_url) {
                // Beri sedikit feedback sebelum redirect
                alert(`Pesanan dibuat! Anda akan dialihkan ke gerbang pembayaran aman Xendit.`);
                window.location.href = data.invoice_url;
            } else {
                throw new Error(data.message || 'Gagal menghubungi Xendit');
            }
        } catch (e) {
            alert('Kesalahan Pembayaran: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    // Render Payment Confirmation
    if (checkoutProduct) {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                style={{ paddingBottom: '100px' }}
            >
                <button onClick={() => setCheckoutProduct(null)} style={{ background: 'none', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', cursor: 'pointer' }}>
                    <ChevronLeft size={24} /> Batal & Kembali ke Store
                </button>
                <SectionHeader title="Konfirmasi Pesanan" subtitle="Langkah terakhir untuk mendapatkan produk Anda." />

                <div className="glass-card" style={{ marginBottom: '24px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                            <div style={{ fontSize: '12px', color: '#888' }}>Produk</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{checkoutProduct.name}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', color: '#888' }}>Harga Produk</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                Rp {((checkoutProduct.is_promo && checkoutProduct.discount_price) ? checkoutProduct.discount_price : checkoutProduct.price).toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Total Pembayaran</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00E676' }}>
                                Rp {(((checkoutProduct.is_promo && checkoutProduct.discount_price) ? checkoutProduct.discount_price : checkoutProduct.price) + shippingCost).toLocaleString()}
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#888', fontSize: '13px' }}>
                            <CreditCard size={18} />
                            <span>Metode: <strong>Xendit (Pembayaran Instan)</strong></span>
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ marginBottom: '24px', padding: '16px', background: 'rgba(82, 77, 212, 0.05)', border: '1px solid rgba(82, 77, 212, 0.2)' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#FFF' }}>Informasi Penerima & Pengiriman</h4>
                    
                    <div style={{ marginBottom: '12px' }}>
                        <input 
                            type="text"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            placeholder="Nama Lengkap Penerima"
                            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '12px', borderRadius: '8px', outline: 'none', fontSize: '13px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <input 
                            type="tel"
                            value={recipientPhone}
                            onChange={(e) => setRecipientPhone(e.target.value)}
                            placeholder="Nomor WhatsApp"
                            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '12px', borderRadius: '8px', outline: 'none', fontSize: '13px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <input 
                            type="text"
                            value={shippingProvince}
                            onChange={(e) => setShippingProvince(e.target.value)}
                            placeholder="Provinsi"
                            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '12px', borderRadius: '8px', outline: 'none', fontSize: '13px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <input 
                            type="text"
                            value={shippingCity}
                            onChange={(e) => setShippingCity(e.target.value)}
                            placeholder="Kabupaten / Kota"
                            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '12px', borderRadius: '8px', outline: 'none', fontSize: '13px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <input 
                            type="text"
                            value={shippingDistrict}
                            onChange={(e) => setShippingDistrict(e.target.value)}
                            placeholder="Kecamatan / Kelurahan"
                            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '12px', borderRadius: '8px', outline: 'none', fontSize: '13px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <input 
                            type="text"
                            value={shippingVillage}
                            onChange={(e) => setShippingVillage(e.target.value)}
                            placeholder="Desa"
                            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '12px', borderRadius: '8px', outline: 'none', fontSize: '13px' }}
                        />
                    </div>

                    <textarea 
                        value={shippingStreet}
                        onChange={(e) => setShippingStreet(e.target.value)}
                        placeholder="Nama Jalan (Jl. No Rumah, Blok, RT/RW)"
                        rows="3"
                        style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '12px', borderRadius: '8px', outline: 'none', resize: 'vertical', fontSize: '13px', marginBottom: '12px' }}
                    ></textarea>
                </div>

                <div className="glass-card" style={{ marginBottom: '24px', padding: '16px', background: 'rgba(82, 77, 212, 0.05)', border: '1px solid rgba(82, 77, 212, 0.2)' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#CCC', lineHeight: '1.5' }}>
                        Klik tombol di bawah untuk membayar. Anda akan diarahkan ke invoice aman milik Xendit untuk memilih metode pembayaran (E-Wallet, VA, atau QRIS).
                    </p>
                </div>

                <button 
                    className="btn-primary" 
                    style={{ width: '100%', background: '#524DD4', color: '#FFF', borderRadius: '12px', fontWeight: 'bold', padding: '16px' }}
                    onClick={handleConfirmPayment}
                    disabled={loading}
                >
                    {loading ? 'Menghubungkan ke Xendit...' : 'Bayar Sekarang via Xendit'}
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            style={{ paddingBottom: '100px' }}
        >
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', cursor: 'pointer' }}>
                <ChevronLeft size={24} /> Kembali ke Profil
            </button>
            <SectionHeader title="Official Store" subtitle="Investasikan pada kesehatan pria Anda." />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '40px' }}>
                {products.map(product => (
                    <div 
                        key={product.id} 
                        className="glass-card" 
                        style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            padding: 0, 
                            borderRadius: '16px',
                            overflow: 'hidden',
                            position: 'relative',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}
                    >
                        {/* Promo Badge */}
                        {product.is_promo && (
                            <div style={{ 
                                position: 'absolute', top: 8, left: 8, zIndex: 5,
                                background: '#FF3B30', color: '#FFF', fontSize: '10px', 
                                fontWeight: '800', padding: '3px 8px', borderRadius: '12px' 
                            }}>
                                PROMO
                            </div>
                        )}

                        {/* Image Container */}
                        <div style={{ position: 'relative', paddingTop: '100%', background: 'rgba(255,255,255,0.02)' }}>
                            {product.image_url ? (
                                <img 
                                    src={product.image_url} 
                                    alt={product.name} 
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                            ) : (
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Package size={32} color="rgba(255,255,255,0.1)" />
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', height: '34px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.2' }}>
                                {product.name}
                            </h3>
                            
                            <div style={{ marginTop: 'auto' }}>
                                {product.is_promo && product.discount_price ? (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '10px', textDecoration: 'line-through', color: '#888' }}>Rp {product.price.toLocaleString()}</span>
                                        <span style={{ fontWeight: 'bold', color: '#FF3B30', fontSize: '14px' }}>Rp {product.discount_price.toLocaleString()}</span>
                                    </div>
                                ) : (
                                    <p style={{ fontWeight: 'bold', color: '#00E676', margin: '4px 0 0 0', fontSize: '14px' }}>Rp {product.price.toLocaleString()}</p>
                                )}
                                
                                <button 
                                    className="btn-primary" 
                                    style={{ width: '100%', padding: '8px', marginTop: '12px', background: '#FFF', color: '#000', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px' }}
                                    onClick={() => setCheckoutProduct(product)}
                                    disabled={loading}
                                >
                                    Beli
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const NotificationView = ({ onBack, isAlarmActive, toggleAlarm, userId }) => {
    const [emailNotif, setEmailNotif] = useState(true);
    const [waNotif, setWaNotif] = useState(false);
    const [pushNotif, setPushNotif] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                if (!userId) return;
                const { data, error } = await supabase
                    .from('users')
                    .select('whatsapp_reminder_enabled, push_reminder_enabled')
                    .eq('id', userId)
                    .maybeSingle();
                
                if (data) {
                    setWaNotif(!!data.whatsapp_reminder_enabled);
                    setPushNotif(!!data.push_reminder_enabled);
                }
            } catch (e) {
                console.error("Gagal memuat preferensi:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchPreferences();
    }, [userId]);

    const handleToggleWa = async () => {
        const newValue = !waNotif;
        setWaNotif(newValue);
        if (userId) {
            try {
                await supabase.from('users').update({ whatsapp_reminder_enabled: newValue }).eq('id', userId);
            } catch (e) {
                console.error("Gagal memperbarui preferensi WhatsApp:", e);
            }
        }
    };

    const handleTogglePush = async () => {
        const newValue = !pushNotif;
        setPushNotif(newValue);
        if (userId) {
            try {
                await supabase.from('users').update({ push_reminder_enabled: newValue }).eq('id', userId);
            } catch (e) {
                console.error("Gagal memperbarui preferensi Push:", e);
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            style={{ paddingBottom: '100px' }}
        >
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', cursor: 'pointer' }}>
                <ChevronLeft size={24} /> Kembali ke Profil
            </button>
            <SectionHeader title="Notifikasi" subtitle="Pilih preferensi pengingat Anda." />

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#888', fontSize: '14px' }}>Memuat pengaturan...</div>
            ) : (
                <>
                    <div className="glass-card" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>Pengingat Harian (Email)</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#AAA' }}>Dapatkan laporan kedisiplinan dan pengingat via email.</p>
                        </div>
                        <div 
                            onClick={() => setEmailNotif(!emailNotif)}
                            style={{ width: '40px', height: '24px', background: emailNotif ? '#00E676' : 'rgba(255,255,255,0.2)', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}
                        >
                            <div style={{ width: '20px', height: '20px', background: '#FFF', borderRadius: '50%', position: 'absolute', top: '2px', left: emailNotif ? '18px' : '2px', transition: '0.3s' }} />
                        </div>
                    </div>

                    <div className="glass-card" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>Pengingat WhatsApp</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#AAA' }}>Terima notifikasi di WhatsApp saat jadwal protocol tiba.</p>
                        </div>
                        <div 
                            onClick={handleToggleWa}
                            style={{ width: '40px', height: '24px', background: waNotif ? '#00E676' : 'rgba(255,255,255,0.2)', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}
                        >
                            <div style={{ width: '20px', height: '20px', background: '#FFF', borderRadius: '50%', position: 'absolute', top: '2px', left: waNotif ? '18px' : '2px', transition: '0.3s' }} />
                        </div>
                    </div>

                    <div className="glass-card" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>Notifikasi Push (OneSignal)</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#AAA' }}>Dapatkan notifikasi push di HP/Browser Anda untuk pengingat.</p>
                        </div>
                        <div 
                            onClick={handleTogglePush}
                            style={{ width: '40px', height: '24px', background: pushNotif ? '#00E676' : 'rgba(255,255,255,0.2)', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}
                        >
                            <div style={{ width: '20px', height: '20px', background: '#FFF', borderRadius: '50%', position: 'absolute', top: '2px', left: pushNotif ? '18px' : '2px', transition: '0.3s' }} />
                        </div>
                    </div>

                    <div className="glass-card" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>Alarm Dalam Aplikasi</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#AAA' }}>Bunyi suara saat aplikasi terbuka untuk pengingat.</p>
                        </div>
                        <div 
                            onClick={() => toggleAlarm()}
                            style={{ width: '40px', height: '24px', background: isAlarmActive ? '#00E676' : 'rgba(255,255,255,0.2)', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}
                        >
                            <div style={{ width: '20px', height: '20px', background: '#FFF', borderRadius: '50%', position: 'absolute', top: '2px', left: isAlarmActive ? '18px' : '2px', transition: '0.3s' }} />
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
};

const ProgressView = ({ rituals, streak, history }) => {
    const completionRate = rituals.length > 0 ? Math.round((rituals.filter(r => r.completed).length / rituals.length) * 100) : 0;
    const consistentDaysCount = history.filter(h => h.percentage > 0).slice(-7).length;

    const days = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];
    const weekData = days.map((day, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const hist = history.find(h => h.date === d.toDateString());
        return { day, value: hist ? hist.percentage : 0 };
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ paddingBottom: '100px' }}
        >
            <SectionHeader title="Laporan Mingguan" subtitle="Data tidak pernah bohong." />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div className="glass-card" style={{ padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>{completionRate}%</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>Rata-rata Penyelesaian</div>
                </div>
                <div className="glass-card" style={{ padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>{consistentDaysCount}/7</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>Hari Disiplin</div>
                </div>
            </div>

            <div className="glass-card" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '24px' }}>Aktivitas 7 Hari Terakhir</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '140px', padding: '0 10px' }}>
                    {weekData.map((data, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flex: 1 }}>
                            <div style={{
                                width: '16px',
                                height: `${(data.value / 100) * 100 || 2}px`,
                                background: data.value === 100 ? '#FFF' : (data.value > 0 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.05)'),
                                borderRadius: '8px',
                                transition: 'height 1s ease'
                            }} />
                            <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>{data.day}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="glass-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Analisis Sistem</h3>
                <p style={{ fontSize: '13px', color: '#AAA', lineHeight: '1.6' }}>
                    Tingkat kedisiplinan Anda stabil. Pastikan Anda tidak melupakan asupan nutrisi dan pola tidur untuk mempertahankan energi optimal minggu depan. 
                </p>
            </div>
        </motion.div>
    );
};

const ProfilView = ({ streak, bestStreak, onReset, setActiveTab, userId, onCheckTracking, onShowDetail }) => {
    const navigate = useNavigate();
    let level = 'Pria Pemula';
    if (streak >= 7 && streak < 21) level = 'Pria Disiplin';
    else if (streak >= 21 && streak < 60) level = 'Disiplin Elit';
    else if (streak >= 60) level = 'Sang Raja';

    const testosteronScore = "Optimal"; // Mocked score for UI
    
    // Delivery Progress Tracker State
    const [transactions, setTransactions] = useState([]);
    const [userName, setUserName] = useState('Memuat nama...');
    
    useEffect(() => {
        if (!navigator.onLine) return;
        
        supabase.from('users').select('name').eq('id', userId).single().then(({ data }) => {
            if (data && data.name) setUserName(data.name);
        });

        supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(3).then(({ data }) => {
            if (data) setTransactions(data);
        });

        const trxChannel = supabase.channel('realtime_trx_user')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, payload => {
                if (payload.new) {
                    setTransactions(prev => {
                        const existing = prev.find(t => t.id === payload.new.id);
                        if (existing) return prev.map(t => t.id === payload.new.id ? payload.new : t);
                        return [payload.new, ...prev].slice(0, 3);
                    });
                }
            }).subscribe();

        return () => supabase.removeChannel(trxChannel);
    }, [userId]);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ paddingBottom: '100px' }}
        >
            <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '32px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#1E1E1E', margin: '0 auto 16px', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={32} color="#888" />
                </div>
                <h1 style={{ fontSize: '24px', margin: '0 0 4px 0' }}>{userName}</h1>
                <p style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px' }}>{level}</p>
            </div>

            {/* Testosteron Score Card */}
            <div className="glass-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(30,30,30,1) 0%, rgba(10,10,10,1) 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={18} color="#00E676" /> Testosterone Score
                    </h3>
                    <div style={{ padding: '4px 12px', background: 'rgba(0, 230, 118, 0.1)', color: '#00E676', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                        {testosteronScore}
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
                    <span>Tidur: Baik</span>
                    <span>Stres: Rendah</span>
                    <span>Aktivitas: Tinggi</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div className="glass-card" style={{ textAlign: 'center', padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{streak}</div>
                    <p style={{ fontSize: '12px', color: '#888' }}>Hari Beruntun</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center', padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{bestStreak}</div>
                    <p style={{ fontSize: '12px', color: '#888' }}>Rekor Terbaik</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div onClick={() => {
                    const el = document.getElementById('my-orders');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'linear-gradient(90deg, #FFF, #E0E0E0)', cursor: 'pointer' }}>
                    <span style={{ fontWeight: 'bold', color: '#000', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ShoppingCart size={18} /> Pesanan Saya (Cek Pengiriman)
                    </span>
                    <ChevronRight size={18} color="#000" />
                </div>

                <div id="my-orders" style={{ marginBottom: '16px', marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h2 style={{ fontSize: '16px', color: '#AAA', textTransform: 'uppercase', letterSpacing: '1px' }}>Daftar Pesanan & Pengiriman</h2>
                        {transactions.length > 0 && <span style={{ fontSize: '11px', color: '#666' }}>Klik untuk detail</span>}
                    </div>
                    {transactions.length > 0 ? transactions.map(trx => (
                        <div 
                            key={trx.id} 
                            onClick={() => onShowDetail(trx)}
                            className="glass-card" 
                            style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', marginBottom: '8px' }}
                        >
                            <div>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 'bold' }}>{trx.id}</h4>
                                <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Metode: {trx.method || 'Pakasir.com'}</p>
                                {trx.shipping_receipt && (
                                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onCheckTracking(trx.shipping_receipt, trx.shipping_courier); }}
                                            style={{ padding: '6px 12px', background: 'rgba(0,230,118,0.1)', border: '1px solid #00E676', color: '#00E676', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            Cek Resi
                                        </button>
                                        <div style={{ fontSize: '10px', color: '#AAA', alignSelf: 'center' }}>{trx.shipping_receipt}</div>
                                    </div>
                                )}
                            </div>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                 <div style={{ width: '8px', height: '8px', background: trx.delivery_status === 'Delivered' ? '#00E676' : '#FFD700', borderRadius: '50%' }}></div>
                                 <span style={{ fontSize: '11px', fontWeight: 'bold', color: trx.delivery_status === 'Delivered' ? '#00E676' : '#FFD700' }}>
                                     {trx.delivery_status === 'Processing' ? '📦 Dikemas' : 
                                      trx.delivery_status === 'Shipped' ? '🚚 Dikirim' : 
                                      trx.delivery_status === 'Delivered' ? '✅ Selesai' : trx.delivery_status || 'Diproses'}
                                 </span>
                             </div>
                        </div>
                    )) : (
                        <div className="glass-card" style={{ padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                            <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Belum ada pesanan aktif saat ini.</p>
                        </div>
                    )}
                </div>

                <div onClick={() => setActiveTab('notifications')} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer' }}>
                    <span style={{ fontWeight: '500' }}>Pengaturan Notifikasi</span>
                    <ChevronRight size={18} color="#444" />
                </div>

                <div
                    onClick={onReset}
                    className="glass-card"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 20px',
                        cursor: 'pointer',
                        border: '1px solid rgba(255, 59, 48, 0.2)'
                    }}
                >
                    <span style={{ fontWeight: '500', color: '#FF3B30' }}>Reset Semua Data</span>
                    <ChevronRight size={18} color="#FF3B30" />
                </div>

                <div 
                    onClick={() => navigate('/privacy-policy')}
                    className="glass-card" 
                    style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '16px 20px', 
                        cursor: 'pointer',
                        marginTop: '8px'
                    }}
                >
                    <span style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Shield size={18} color="#888" /> Kebijakan Privasi
                    </span>
                    <ChevronRight size={18} color="#444" />
                </div>

                <div 
                    onClick={() => { localStorage.removeItem('youman_is_logged_in'); window.location.reload(); }} 
                    className="glass-card" 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer', marginTop: '12px', background: 'rgba(255, 59, 48, 0.1)' }}
                >
                    <span style={{ fontWeight: 'bold', color: '#ff6b6b' }}>Keluar (Logout)</span>
                </div>
            </div>
        </motion.div>
    );
};

// --- Main App Component ---

class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ color: 'white', padding: '20px', background: 'red' }}>
                    <h1>Something went wrong.</h1>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error.toString()}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

// --- AUTHENTICATION COMPONENT ---
const AuthView = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const [onboardingStep, setOnboardingStep] = useState('welcome'); // 'welcome', 'profile', 'rhythm', 'login', 'forgot_password_verify', 'forgot_password_otp', 'forgot_password_reset'
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ 
        name: '', email: '', phone: '', password: '',
        age: '', profession: '',
        wake_up_time: '', workout_time: '', focus_work_time: '', sleep_time: ''
    });
    const [errorMsg, setErrorMsg] = useState('');
    const [resetUserId, setResetUserId] = useState(null);
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [userOtpInput, setUserOtpInput] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const { data, error } = await supabase.from('users')
                .select('*')
                .eq('email', formData.email)
                .eq('password', formData.password)
                .maybeSingle();

            if (error || !data) throw new Error('Email atau password salah!');
            
            if (!data.phone_verified) {
                throw new Error('Akun Anda belum diberifikasi oleh Admin. Harap tunggu persetujuan.');
            }

            onLoginSuccess(data);
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            // Basic validation
            if (!formData.name || !formData.email || !formData.phone || !formData.password) {
                throw new Error('Harap isi semua field utama (Nama, Email, WhatsApp, Password)!');
            }

            const { data: existingUser } = await supabase.from('users').select('id').eq('email', formData.email).maybeSingle();
            if (existingUser) throw new Error('Email sudah terdaftar!');

            const { data: existingPhone } = await supabase.from('users').select('id').eq('phone', formData.phone).maybeSingle();
            if (existingPhone) throw new Error('Nomor WhatsApp sudah terdaftar!');

            const ageValue = parseInt(formData.age);
            if (isNaN(ageValue)) throw new Error('Usia harus berupa angka!');

            // Generate 6 digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(otp);
            setUserOtpInput('');

            // Normalize phone number to international format (starting with 62 instead of 0)
            let formattedPhone = formData.phone.replace(/[^0-9]/g, '');
            if (formattedPhone.startsWith('0')) {
                formattedPhone = '62' + formattedPhone.slice(1);
            }

            // Send OTP via Fonnte
            const token = 'x8RfS97xn1sUzdVk5mmP';
            const message = `Kode OTP Pendaftaran YOUMAN Anda adalah: *${otp}*. Gunakan kode ini untuk memverifikasi pendaftaran akun Anda. Jangan sebarkan kode ini kepada siapapun.`;
            
            const response = await fetch('https://api.fonnte.com/send', {
                method: 'POST',
                headers: { 'Authorization': token },
                body: new URLSearchParams({ 'target': formattedPhone, 'message': message })
            });
            const result = await response.json();
            
            if (!result.status) {
                throw new Error(`Gagal mengirim WhatsApp OTP pendaftaran: ${result.reason || 'Koneksi API bermasalah'}. Silakan coba lagi.`);
            }

            setOnboardingStep('register_otp');
        } catch (err) {
            console.error('Registration OTP Error:', err);
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyRegisterOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            if (userOtpInput !== generatedOtp) {
                throw new Error('Kode OTP salah. Silakan periksa kembali WhatsApp Anda.');
            }

            const ageValue = parseInt(formData.age);
            if (isNaN(ageValue)) throw new Error('Usia harus berupa angka!');

            const { error } = await supabase.from('users').insert([{
                name: formData.name, 
                age: ageValue, 
                profession: formData.profession || '-',
                email: formData.email, 
                phone: formData.phone, 
                password: formData.password,
                wake_up_time: formData.wake_up_time || '05:00', 
                workout_time: formData.workout_time || '06:00',
                focus_work_time: formData.focus_work_time || '09:00', 
                sleep_time: formData.sleep_time || '22:00',
                phone_verified: true, 
                role: 'User'
            }]);

            if (error) {
                console.error('Supabase Insert Error:', error);
                throw new Error(`Gagal mendaftar: ${error.message}`);
            }
            
            alert('Pendaftaran dan verifikasi WhatsApp berhasil! Silakan login.');
            setGeneratedOtp('');
            setUserOtpInput('');
            setOnboardingStep('login');
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };


    const handleVerifyReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        try {
            const { data, error } = await supabase.from('users')
                .select('id, phone')
                .eq('email', formData.email)
                .eq('phone', formData.phone)
                .maybeSingle();

            if (error || !data) throw new Error('Data Email dan Nomor WhatsApp tidak cocok/ditemukan.');
            
            // Generate 6 digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(otp);
            setResetUserId(data.id);

            // Normalize phone number to international format (starting with 62 instead of 0)
            let formattedPhone = data.phone.replace(/[^0-9]/g, '');
            if (formattedPhone.startsWith('0')) {
                formattedPhone = '62' + formattedPhone.slice(1);
            }

            // Send OTP via Fonnte
            const token = 'x8RfS97xn1sUzdVk5mmP';
            const message = `Kode OTP YOUMAN Anda adalah: *${otp}*. Gunakan kode ini untuk mereset password Anda. Jangan sebarkan kode ini kepada siapapun.`;
            
            const response = await fetch('https://api.fonnte.com/send', {
                method: 'POST',
                headers: { 'Authorization': token },
                body: new URLSearchParams({ 'target': formattedPhone, 'message': message })
            });
            const result = await response.json();
            
            if (!result.status) {
                throw new Error(`Gagal mengirim WhatsApp OTP: ${result.reason || 'Koneksi API bermasalah'}. Silakan coba lagi.`);
            }

            setOnboardingStep('forgot_password_otp');
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        if (userOtpInput === generatedOtp) {
            setFormData({ ...formData, password: '' });
            setOnboardingStep('forgot_password_reset');
        } else {
            setErrorMsg('Kode OTP salah. Silakan periksa kembali WhatsApp Anda.');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        try {
            if (!formData.password) throw new Error('Password baru tidak boleh kosong.');
            
            const { error } = await supabase.from('users')
                .update({ password: formData.password })
                .eq('id', resetUserId);

            if (error) throw new Error('Gagal mereset password.');
            
            alert('Password berhasil diperbarui. Silakan login kembali.');
            setOnboardingStep('login');
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container" style={{ background: '#050505', color: '#FFF', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px' }}>
            <AnimatePresence mode="wait">
                {onboardingStep === 'welcome' && (
                    <motion.div key="welcome" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="glass-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
                        <div style={{ width: '120px', height: '120px', background: '#FFF', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px auto', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
                            <img src="/Logo Youman (Hitam).png" alt="Logo YOUMAN" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }} />
                        </div>
                        <h1 style={{ margin: '0 0 12px 0', fontSize: '32px', fontWeight: '800', letterSpacing: '2px' }}>WELCOME</h1>
                        <p style={{ color: '#888', marginBottom: '48px', fontSize: '16px', lineHeight: '1.5' }}>Optimalkan performa puncak Anda bersama YOUMAN.</p>
                        
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <button onClick={() => setOnboardingStep('profile')} className="btn-primary" style={{ width: '100%', fontSize: '16px', fontWeight: 'bold' }}>Mulai Perjalanan Baru</button>
                            <button onClick={() => setOnboardingStep('login')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px' }}>Sudah Punya Akun</button>
                        </div>
                        
                        <div style={{ marginTop: '32px' }}>
                            <button 
                                onClick={() => navigate('/privacy-policy')}
                                style={{ background: 'none', border: 'none', color: '#666', fontSize: '13px', textDecoration: 'underline', cursor: 'pointer' }}
                            >
                                Kebijakan Privasi
                            </button>
                        </div>
                    </motion.div>
                )}

                {onboardingStep === 'profile' && (
                    <motion.div key="profile" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="glass-card" style={{ padding: '32px 24px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Setup Profil</h2>
                        <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px' }}>Bantu kami mengenal Anda lebih baik.</p>
                        <form onSubmit={(e) => { e.preventDefault(); setOnboardingStep('rhythm'); }} style={{ display: 'grid', gap: '16px' }}>
                            <input type="text" placeholder="Nama Lengkap" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px' }}>
                                <input type="number" placeholder="Usia" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} required style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
                                <input type="text" placeholder="Profesi / Pekerjaan" value={formData.profession} onChange={e => setFormData({...formData, profession: e.target.value})} required style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
                            </div>
                            <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
                            <input type="tel" placeholder="Nomor WhatsApp" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
                            
                            <button type="submit" className="btn-primary" style={{ marginTop: '12px' }}>Lanjutkan</button>
                            <button type="button" onClick={() => setOnboardingStep('welcome')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '13px' }}>Kembali</button>
                        </form>
                    </motion.div>
                )}

                {onboardingStep === 'rhythm' && (
                    <motion.div key="rhythm" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="glass-card" style={{ padding: '32px 24px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Ritme Harian</h2>
                        <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px' }}>Rangkai jadwal kedisiplinan Anda.</p>
                        <form onSubmit={handleRegister} style={{ display: 'grid', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '6px' }}>Bangun Pagi</label>
                                    <input type="time" value={formData.wake_up_time} onChange={e => setFormData({...formData, wake_up_time: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '6px' }}>Waktu Olahraga</label>
                                    <input type="time" value={formData.workout_time} onChange={e => setFormData({...formData, workout_time: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '6px' }}>Kerja Fokus</label>
                                    <input type="time" value={formData.focus_work_time} onChange={e => setFormData({...formData, focus_work_time: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '6px' }}>Waktu Tidur</label>
                                    <input type="time" value={formData.sleep_time} onChange={e => setFormData({...formData, sleep_time: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
                                </div>
                            </div>
                            <div style={{ marginTop: '8px' }}>
                                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '6px' }}>Password Baru</label>
                                <input type="password" placeholder="Atur password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
                            </div>
                            
                            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '12px' }}>
                                {loading ? 'Memproses...' : 'Daftar Sekarang'}
                            </button>
                            <button type="button" onClick={() => setOnboardingStep('profile')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '13px' }}>Kembali</button>
                        </form>
                    </motion.div>
                )}

                {onboardingStep === 'register_otp' && (
                    <motion.div key="register_otp" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="glass-card" style={{ padding: '32px 24px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>Verifikasi OTP Pendaftaran</h2>
                        <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px', textAlign: 'center' }}>Kode OTP pendaftaran telah dikirim ke WhatsApp Anda. Masukkan kode di bawah ini.</p>
                        
                        {errorMsg && (
                            <div style={{ background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', textAlign: 'center' }}>
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleVerifyRegisterOtp} style={{ display: 'grid', gap: '16px' }}>
                            <input type="text" placeholder="Masukkan 6 Digit Kode OTP" value={userOtpInput} onChange={e => setUserOtpInput(e.target.value)} required style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', textAlign: 'center', fontSize: '20px', letterSpacing: '4px', fontWeight: 'bold' }} maxLength="6" />
                            
                            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '8px' }}>
                                {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
                            </button>
                            
                            <button type="button" onClick={() => setOnboardingStep('rhythm')} style={{ background: 'none', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px' }}>Kirim Ulang / Kembali</button>
                        </form>
                    </motion.div>
                )}

                {onboardingStep === 'login' && (
                    <motion.div key="login" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="glass-card" style={{ padding: '32px 24px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>Masuk (Log In)</h2>
                        <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px', textAlign: 'center' }}>Lanjutkan rutinitas disiplin Anda.</p>
                        
                        {errorMsg && (
                            <div style={{ background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', textAlign: 'center' }}>
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '16px' }}>
                            <input type="email" placeholder="Alamat Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
                            <input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
                            
                            <div style={{ textAlign: 'right' }}>
                                <button type="button" onClick={() => setOnboardingStep('forgot_password_verify')} style={{ background: 'none', border: 'none', color: '#00E676', fontSize: '13px', cursor: 'pointer', padding: 0 }}>Lupa Password?</button>
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '8px' }}>
                                {loading ? 'Memproses...' : 'Masuk Sekarang'}
                            </button>
                            
                            <button type="button" onClick={() => setOnboardingStep('welcome')} style={{ background: 'none', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px' }}>Ganti ke Pendaftaran</button>
                        </form>
                    </motion.div>
                )}

                {onboardingStep === 'forgot_password_verify' && (
                    <motion.div key="forgot_password_verify" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="glass-card" style={{ padding: '32px 24px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>Lupa Password</h2>
                        <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px', textAlign: 'center' }}>Masukkan Email dan Nomor WhatsApp terdaftar Anda untuk verifikasi.</p>
                        
                        {errorMsg && (
                            <div style={{ background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', textAlign: 'center' }}>
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleVerifyReset} style={{ display: 'grid', gap: '16px' }}>
                            <input type="email" placeholder="Alamat Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
                            <input type="tel" placeholder="Nomor WhatsApp" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
                            
                            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '8px' }}>
                                {loading ? 'Memverifikasi...' : 'Verifikasi Data'}
                            </button>
                            
                            <button type="button" onClick={() => setOnboardingStep('login')} style={{ background: 'none', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px' }}>Kembali ke Login</button>
                        </form>
                    </motion.div>
                )}

                {onboardingStep === 'forgot_password_otp' && (
                    <motion.div key="forgot_password_otp" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="glass-card" style={{ padding: '32px 24px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>Verifikasi OTP</h2>
                        <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px', textAlign: 'center' }}>Kode OTP telah dikirim ke WhatsApp Anda. Masukkan kode di bawah ini.</p>
                        
                        {errorMsg && (
                            <div style={{ background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', textAlign: 'center' }}>
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleVerifyOtp} style={{ display: 'grid', gap: '16px' }}>
                            <input type="text" placeholder="Masukkan 6 Digit Kode OTP" value={userOtpInput} onChange={e => setUserOtpInput(e.target.value)} required style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', textAlign: 'center', fontSize: '20px', letterSpacing: '4px', fontWeight: 'bold' }} maxLength="6" />
                            
                            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '8px' }}>
                                Verifikasi OTP
                            </button>
                            
                            <button type="button" onClick={() => setOnboardingStep('forgot_password_verify')} style={{ background: 'none', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px' }}>Kirim Ulang / Ganti Nomor</button>
                        </form>
                    </motion.div>
                )}

                {onboardingStep === 'forgot_password_reset' && (
                    <motion.div key="forgot_password_reset" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="glass-card" style={{ padding: '32px 24px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>Reset Password</h2>
                        <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px', textAlign: 'center' }}>Masukkan password baru Anda.</p>
                        
                        {errorMsg && (
                            <div style={{ background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', textAlign: 'center' }}>
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleResetPassword} style={{ display: 'grid', gap: '16px' }}>
                            <input type="password" placeholder="Password Baru" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
                            
                            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '8px' }}>
                                {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TransactionDetailModal = ({ isOpen, onClose, trx, onCheckTracking }) => {
    if (!isOpen || !trx) return null;
    const items = trx.items || [];
    
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Detail Pesanan</h3>
                        <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>ID: {trx.id}</div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#FFF' }}><X size={24} /></button>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '13px' }}>
                        <span style={{ color: '#888' }}>Status Pembayaran</span>
                        <span style={{ fontWeight: 'bold', color: trx.status === 'Success' ? '#00E676' : '#FFD700' }}>{trx.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '13px' }}>
                        <span style={{ color: '#888' }}>Status Pengiriman</span>
                        <span style={{ fontWeight: 'bold', color: '#FFF' }}>
                            {trx.delivery_status === 'Processing' ? '📦 Sedang Dikemas' : 
                             trx.delivery_status === 'Shipped' ? '🚚 Dalam Pengiriman' : 
                             trx.delivery_status === 'Delivered' ? '✅ Sudah Diterima' : trx.delivery_status}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: '#888' }}>Metode</span>
                        <span style={{ fontWeight: 'bold' }}>{trx.method}</span>
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '14px', color: '#AAA', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Produk Diorder</h4>
                    {items.length > 0 ? items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Package size={20} color="#666" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.name}</div>
                                    <div style={{ fontSize: '11px', color: '#666' }}>x{item.quantity}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '600' }}>Rp {item.price?.toLocaleString()}</div>
                        </div>
                    )) : (
                        <div style={{ padding: '12px', textAlign: 'center', color: '#444', fontSize: '13px' }}>Data produk tidak tersedia</div>
                    )}
                    
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '16px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>Total Bayar</span>
                        <span style={{ fontSize: '18px', fontWeight: '900', color: '#00E676' }}>Rp {trx.amount?.toLocaleString()}</span>
                    </div>
                </div>

                {trx.shipping_address && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '13px', color: '#888', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Informasi Pengiriman</h4>
                        <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#FFF', fontWeight: 'bold' }}>{trx.user_name} {trx.user_phone ? `(${trx.user_phone})` : ''}</p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#AAA', lineHeight: '1.5' }}>{trx.shipping_address}</p>
                    </div>
                )}

                {trx.shipping_receipt && (
                    <div style={{ background: 'rgba(0, 230, 118, 0.05)', border: '1px solid rgba(0, 230, 118, 0.1)', borderRadius: '12px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>No. Resi ({trx.shipping_courier?.toUpperCase()})</span>
                            <span style={{ fontSize: '13px', color: '#00E676', fontWeight: '900' }}>{trx.shipping_receipt}</span>
                        </div>
                        <button 
                            onClick={() => { onClose(); onCheckTracking(trx.shipping_receipt, trx.shipping_courier); }}
                            style={{ width: '100%', padding: '14px', background: '#00E676', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <Truck size={18} /> Lacak Status Pengiriman
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

const TrackingModal = ({ isOpen, onClose, info, loading, resi, courier }) => {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><Truck size={20} /> Lacak Pengiriman</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#FFF' }}><X size={24} /></button>
                </div>

                <div style={{ marginBottom: '24px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#888' }}>Nomor Resi ({courier?.toUpperCase()})</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px' }}>{resi}</div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#00E676', borderRadius: '50%', margin: '0 auto 16px' }}></div>
                        <p style={{ color: '#888' }}>Mencari data pengiriman...</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {info && info.history ? (
                            info.history.map((m, idx) => (
                                <div key={idx} style={{ borderLeft: idx === 0 ? '2px solid #00E676' : '2px solid rgba(255,255,255,0.1)', paddingLeft: '16px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-6px', top: 0, width: '10px', height: '10px', background: idx === 0 ? '#00E676' : '#666', borderRadius: '50%' }}></div>
                                    <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '2px', color: idx === 0 ? '#FFF' : '#AAA' }}>{m.note || m.status}</div>
                                    <div style={{ fontSize: '11px', color: '#666' }}>{m.updated_at || m.time}</div>
                                </div>
                            ))
                        ) : (
                            <>
                                <div style={{ borderLeft: '2px solid #00E676', paddingLeft: '16px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-6px', top: 0, width: '10px', height: '10px', background: '#00E676', borderRadius: '50%' }}></div>
                                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Pesanan Sedang Diproses</div>
                                    <div style={{ fontSize: '11px', color: '#666' }}>Kurir sedang menyiapkan paket Anda untuk dikirim.</div>
                                </div>
                                <div style={{ borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '16px', minHeight: '40px' }}>
                                    <div style={{ color: '#888', fontSize: '14px' }}>Menunggu Update Perjalanan...</div>
                                </div>
                            </>
                        )}
                        
                        <div style={{ marginTop: '12px' }}>
                            <a 
                                href={`https://cekresi.com/?noresi=${resi}`} 
                                target="_blank" 
                                rel="noreferrer"
                                style={{ display: 'block', padding: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', textAlign: 'center', textDecoration: 'none', color: '#FFF', fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                Lihat Tracking Lengkap (External)
                            </a>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('youman_is_logged_in'));

    const handleLoginSuccess = (userData) => {
        localStorage.setItem('youman_is_logged_in', 'true');
        localStorage.setItem('youman_user_id', userData.id);
        localStorage.setItem('youman_user_name', userData.name || 'User YOUMAN');
        localStorage.setItem('youman_user_phone', userData.phone || '');
        localStorage.setItem('youman_whatsapp_reminder_enabled', String(!!userData.whatsapp_reminder_enabled));
        localStorage.setItem('youman_push_reminder_enabled', String(!!userData.push_reminder_enabled));
        localStorage.setItem('youman_wake_up_time', userData.wake_up_time || '');
        localStorage.setItem('youman_workout_time', userData.workout_time || '');
        localStorage.setItem('youman_sleep_time', userData.sleep_time || '');
        setIsLoggedIn(true);
    };


    const [trackingResi, setTrackingResi] = useState('');
    const [trackingCourier, setTrackingCourier] = useState('');
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [trackingInfo, setTrackingInfo] = useState(null);

    const handleCheckTracking = async (waybill, courier) => {
        setTrackingResi(waybill);
        setTrackingCourier(courier);
        setIsTrackingModalOpen(true);
        setTrackingLoading(true);
        setTrackingInfo(null);
        
        try {
            // Priority: Biteship Detailed Tracking
            const response = await fetch(`/api/biteship-tracking?waybill=${waybill}&courier=${courier}`);
            const data = await response.json();
            
            if (response.ok && data.success) {
                setTrackingInfo(data);
            } else {
                // Fallback to RajaOngkir if Biteship fails
                const roRes = await fetch(`/api/rajaongkir-tracking?waybill=${waybill}&courier=${courier}`);
                const roData = await roRes.json();
                if (roRes.ok && roData.rajaongkir && roData.rajaongkir.status.code === 200) {
                    setTrackingInfo({ 
                        history: roData.rajaongkir.result.manifest.map(m => ({
                            note: m.manifest_description,
                            updated_at: `${m.manifest_date} ${m.manifest_time}`
                        })),
                        status: roData.rajaongkir.result.delivery_status.status
                    });
                } else {
                    setTrackingInfo({ fallback: true });
                }
            }
        } catch(e) {
            console.error("Tracking API error:", e);
            setTrackingInfo({ fallback: true });
        } finally {
            setTrackingLoading(false);
        }
    };

    const [selectedTrx, setSelectedTrx] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const handleShowDetail = (trx) => {
        setSelectedTrx(trx);
        setIsDetailModalOpen(true);
    };

    if (!isLoggedIn) {
        return <AuthView onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <AppErrorBoundary>
            <AppContent onCheckTracking={handleCheckTracking} onShowDetail={handleShowDetail} />
            <TransactionDetailModal 
                isOpen={isDetailModalOpen} 
                onClose={() => setIsDetailModalOpen(false)} 
                trx={selectedTrx} 
                onCheckTracking={handleCheckTracking}
            />
            <TrackingModal 
                isOpen={isTrackingModalOpen} 
                onClose={() => setIsTrackingModalOpen(false)} 
                info={trackingInfo} 
                loading={trackingLoading} 
                resi={trackingResi} 
                courier={trackingCourier}
            />
        </AppErrorBoundary>
    );
}

function AppContent({ onCheckTracking, onShowDetail }) {
    const [activeTab, setActiveTab] = useState('home');
    const [streak, setStreak] = useState(getStreak());
    const [bestStreak, setBestStreak] = useState(() => parseInt(localStorage.getItem('youman_best_streak') || "0"));
    const [history, setHistory] = useState(getHistory());
    const [rituals, setRituals] = useState(() => {
        const saved = getRituals();
        const defaults = [
            { id: 1, title: 'Bangun Pagi', subtitle: 'Mulai hari dengan disiplin penuh', time: localStorage.getItem('youman_wake_up_time') || '05:00', completed: false },
            { id: 2, title: 'Olahraga', subtitle: 'Bangun otot dan bakar lemak harian', time: localStorage.getItem('youman_workout_time') || '06:00', completed: false },
            { id: 3, title: 'Minum Youman', subtitle: 'Optimalkan testosteron harian Anda', time: '08:00', completed: false },
            { id: 4, title: 'Fokus Kerja', subtitle: 'Deep Work selama 2 jam produktif', time: '09:00', completed: false },
            { id: 5, title: 'Waktunya Tidur', subtitle: 'Istirahat total untuk recovery hormon', time: localStorage.getItem('youman_sleep_time') || '22:00', completed: false }
        ];

        if (!saved || saved.length === 0) return defaults;
        
        // MIGRATION: Ensure old data has new fields
        return saved.map(item => {
            const def = defaults.find(d => d.title === item.title || item.title.includes(d.title));
            return {
                ...item,
                subtitle: item.subtitle || (def ? def.subtitle : 'Atur deskripsi ritual ini'),
                time: item.time || (def ? def.time : '12:00')
            };
        });
    });

    const [isAlarmActive, setIsAlarmActive] = useState(() => localStorage.getItem('youman_alarm_active') === 'true');

    useEffect(() => {
        // Fetch and sync user details on app load
        const userId = localStorage.getItem('youman_user_id');
        if (userId) {
            supabase.from('users').select('name, phone, whatsapp_reminder_enabled, push_reminder_enabled').eq('id', userId).single().then(({ data }) => {
                if (data) {
                    if (data.name) localStorage.setItem('youman_user_name', data.name);
                    if (data.phone) localStorage.setItem('youman_user_phone', data.phone);
                    localStorage.setItem('youman_whatsapp_reminder_enabled', String(!!data.whatsapp_reminder_enabled));
                    localStorage.setItem('youman_push_reminder_enabled', String(!!data.push_reminder_enabled));
                }
            });
        }

        // Register Service Worker for PWA/Background support
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(reg => {
                console.log('SW Registered:', reg.scope);
            }).catch(err => console.log('SW failed:', err));
        }

        // Initialize OneSignal
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        OneSignalDeferred.push(async function(OneSignal) {
            await OneSignal.init({
                appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
                allowLocalhostAsSecureOrigin: true, // For development
            });
            // Link user ID to OneSignal for targeted push
            if (userId) {
                OneSignal.login(userId);
            }
        });

        // Auto request permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('youman_alarm_active', isAlarmActive.toString());
    }, [isAlarmActive]);

    const sendSystemNotification = (title, body) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then(reg => {
                    reg.showNotification(title, {
                        body: body,
                        icon: 'https://cdn-icons-png.flaticon.com/512/3039/3039430.png',
                        vibrate: [200, 100, 200, 100, 200],
                        requireInteraction: true,
                        tag: 'youman-alarm'
                    });
                });
            } else {
                new Notification(title, { body, icon: 'https://cdn-icons-png.flaticon.com/512/3039/3039430.png' });
            }
        }
    };

    // Background Alarm Checker
    useEffect(() => {
        const checkScheduledTimes = () => {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            rituals.forEach(ritual => {
                const lastNotifiedKey = `notified_${ritual.id}_${now.getDate()}_${now.getHours()}_${now.getMinutes()}`;
                
                if (ritual.time === timeStr && !ritual.completed && !localStorage.getItem(lastNotifiedKey)) {
                    // Kirim Notifikasi Sistem
                    sendSystemNotification(
                        `Waktunya ${ritual.title.toUpperCase()}!`, 
                        ritual.subtitle || 'Laksanakan protokol kedisiplinan Anda sekarang.'
                    );

                    // Tandai sudah dinotifikasi untuk menit ini agar tidak double
                    localStorage.setItem(lastNotifiedKey, 'true');

                    // WhatsApp via Fonnte (Instant Send)
                    const waEnabled = localStorage.getItem('youman_whatsapp_reminder_enabled') === 'true';
                    const userPhone = localStorage.getItem('youman_user_phone');
                    if (waEnabled && userPhone) {
                        try {
                            let formattedPhone = userPhone.replace(/[^0-9]/g, '');
                            if (formattedPhone.startsWith('0')) {
                                formattedPhone = '62' + formattedPhone.slice(1);
                            }
                            
                            const token = 'x8RfS97xn1sUzdVk5mmP';
                            const userName = localStorage.getItem('youman_user_name') || 'User YOUMAN';
                            const message = `Halo *${userName}*, ini pengingat ritual harian Anda:\n\n*${ritual.title.toUpperCase()}*\n⏰ Jam: ${ritual.time} WIB\n\n_${ritual.subtitle || 'Laksanakan protokol kedisiplinan Anda sekarang!'}_`;

                            fetch('https://api.fonnte.com/send', {
                                method: 'POST',
                                headers: { 'Authorization': token },
                                body: new URLSearchParams({
                                    'target': formattedPhone,
                                    'message': message,
                                    'countryCode': '62'
                                })
                            }).then(res => res.json()).then(data => {
                                console.log("WhatsApp sent instantly:", data);
                            }).catch(err => console.error("Error sending instant WhatsApp:", err));
                        } catch (e) {
                            console.error("Instant WhatsApp trigger failed", e);
                        }
                    }

                    // OneSignal Push Notification (Instant Send via Serverless Backend)
                    const pushEnabled = localStorage.getItem('youman_push_reminder_enabled') === 'true';
                    const userIdForPush = localStorage.getItem('youman_user_id');
                    if (pushEnabled && userIdForPush) {
                        fetch('/api/send-instant-notification', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: userIdForPush,
                                title: `Pengingat YOUMAN: ${ritual.title.toUpperCase()}`,
                                body: ritual.subtitle || `⏰ Jam: ${ritual.time} WIB. Laksanakan protokol kedisiplinan Anda sekarang!`
                            })
                        }).then(res => res.json()).then(data => {
                            console.log("OneSignal push sent instantly:", data);
                        }).catch(err => console.error("Error sending instant OneSignal:", err));
                    }
                    
                    // Efek suara dan getar hanya jika alarm diaktifkan oleh user
                    if (isAlarmActive) {
                        try { 
                            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                            audio.volume = 1.0;
                            audio.play().catch(e => console.log("Audio play blocked", e)); 

                            if (navigator.vibrate) {
                                navigator.vibrate([500, 200, 500, 200, 500]);
                            }
                        } catch(e) { console.log("Alarm trigger failed", e); }
                    }
                }
            });
        };

        const interval = setInterval(checkScheduledTimes, 15000); // Cek setiap 15 detik untuk akurasi
        return () => clearInterval(interval);
    }, [rituals, isAlarmActive]);

    // Real-time Supabase Data Syncing Hook
    useEffect(() => {
        if (!navigator.onLine) return;
        const userId = getUserId();

        const ritualChannel = supabase.channel('realtime_rituals')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'user_rituals', filter: `user_id=eq.${userId}` }, payload => {
                const dateToday = new Date().toDateString();
                // Jika payload masuk dan dari hari ini (bisa data update dari user sama di HP lain)
                if (payload.new && payload.new.date === dateToday) {
                    const newIdStr = payload.new.id.split('_').pop(); 
                    const ritualId = parseInt(newIdStr);
                    
                    setRituals(prev => {
                        const updated = prev.map(item => item.id == ritualId ? { ...item, completed: payload.new.completed } : item);
                        // Update local cache too so offline logic matches DB
                        localStorage.setItem('youman_rituals', JSON.stringify(updated));
                        return updated;
                    });
                }
            }).subscribe();

        const streakChannel = supabase.channel('realtime_streaks')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'user_streaks', filter: `user_id=eq.${userId}` }, payload => {
                if (payload.new) {
                    setStreak(payload.new.current_streak);
                    setBestStreak(payload.new.best_streak);
                    localStorage.setItem('youman_streak', payload.new.current_streak.toString());
                    localStorage.setItem('youman_best_streak', payload.new.best_streak.toString());
                }
            }).subscribe();

        return () => {
            supabase.removeChannel(ritualChannel);
            supabase.removeChannel(streakChannel);
        };
    }, []);

    useEffect(() => {
        saveRituals(rituals);

        // Turn off alarm if the drinking ritual is completed manually
        if (rituals.find(r => r.title === 'Minum Youman')?.completed) {
            setIsAlarmActive(false);
        }

        if (rituals.length > 0) {
            const allCompleted = rituals.every(r => r.completed);
            const today = new Date().toDateString();
            const percentage = Math.round((rituals.filter(r => r.completed).length / rituals.length) * 100);
            saveToHistory(today, percentage);
            setHistory(getHistory());

            if (allCompleted) {
                // simple streak update check - actual prod logic would need robust date checking
                const currentStreak = getStreak();
                // We're just mocking for UI right now. The util usually handles the robust check.
                const newStreak = updateStreak(true);
                if (newStreak !== currentStreak) {
                    setStreak(newStreak);
                    const currentBest = parseInt(localStorage.getItem('youman_best_streak') || "0");
                    if (newStreak > currentBest) {
                        localStorage.setItem('youman_best_streak', newStreak.toString());
                        setBestStreak(newStreak);
                    }
                }
            }
        }
    }, [rituals]);

    const toggleRitual = (id) => {
        setRituals(prev => prev.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };

    const toggleAlarm = (forceValue) => {
        const newValue = forceValue !== undefined ? forceValue : !isAlarmActive;
        setIsAlarmActive(newValue);
        
        if (newValue) {
            if ('Notification' in window) {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        sendSystemNotification('Alarm Aktif', 'Notifikasi sistem akan muncul saat jadwal tiba.');
                        // Unlock audio context
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                        audio.volume = 0;
                        audio.play().catch(() => {});
                    }
                });
            }
        }

        // Automate ritual completion when alarm is turned OFF
        if (!newValue) {
            const drinkingRitual = rituals.find(r => r.title === 'Minum Youman');
            if (drinkingRitual && !drinkingRitual.completed) {
                toggleRitual(drinkingRitual.id);
            }
        }
    };

    const handleResetData = () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus semua data pribadi? Tindakan ini tidak dapat dibatalkan.')) {
            clearAllData();
            setStreak(0);
            setBestStreak(0);
            setHistory([]);
            setRituals([
                { id: 1, title: 'Bangun Pagi', subtitle: 'Mulai hari dengan disiplin penuh', time: localStorage.getItem('youman_wake_up_time') || '05:00', completed: false },
                { id: 2, title: 'Olahraga', subtitle: 'Bangun otot dan bakar lemak harian', time: localStorage.getItem('youman_workout_time') || '06:00', completed: false },
                { id: 3, title: 'Minum Youman', subtitle: 'Optimalkan testosteron harian Anda', time: '08:00', completed: false },
                { id: 4, title: 'Fokus Kerja', subtitle: 'Deep Work selama 2 jam produktif', time: '09:00', completed: false },
                { id: 5, title: 'Waktunya Tidur', subtitle: 'Istirahat total untuk recovery hormon', time: localStorage.getItem('youman_sleep_time') || '22:00', completed: false }
            ]);
            setActiveTab('home');
            window.location.reload();
        }
    };

    return (
        <div className="app-container" style={{ 
            background: '#050505', 
            color: '#FFFFFF',
            minHeight: '100vh',
            minHeight: '100dvh',
            paddingTop: 'env(safe-area-inset-top)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
            <main className="content" style={{ maxWidth: '480px', margin: '0 auto' }}>
                <AnimatePresence mode="wait">
                    {activeTab === 'home' && (
                        <HomeView
                            key="home"
                            rituals={rituals}
                            toggleRitual={toggleRitual}
                            streak={streak}
                            isAlarmActive={isAlarmActive}
                            toggleAlarm={toggleAlarm}
                        />
                    )}
                    {activeTab === 'protocol' && (
                        <ProtocolView
                            key="protocol"
                            rituals={rituals}
                            setRituals={setRituals}
                        />
                    )}
                    {activeTab === 'knowledge' && (
                        <KnowledgeView key="knowledge" streak={streak} />
                    )}
                    {activeTab === 'store' && (
                        <StoreView 
                            key="store" 
                            onBack={() => setActiveTab('profile')} 
                            userId={getUserId()} 
                        />
                    )}
                    {activeTab === 'notifications' && (
                        <NotificationView 
                            key="notifications" 
                            onBack={() => setActiveTab('profile')} 
                            isAlarmActive={isAlarmActive}
                            toggleAlarm={toggleAlarm}
                            userId={getUserId()}
                        />
                    )}
                    {activeTab === 'progress' && (
                        <ProgressView
                            key="progress"
                            rituals={rituals}
                            streak={streak}
                            history={history}
                        />
                    )}
                    {activeTab === 'profile' && (
                        <ProfilView 
                            key="profile" 
                            streak={streak} 
                            bestStreak={bestStreak} 
                            onReset={handleResetData}
                            setActiveTab={setActiveTab}
                            userId={getUserId()}
                            onCheckTracking={onCheckTracking}
                            onShowDetail={onShowDetail}
                        />
                    )}
                </AnimatePresence>
            </main>

            {/* Global style overrides */}
            <style dangerouslySetInnerHTML={{__html: `
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);
                }
                .btn-primary {
                    background: #FFF;
                    color: #000;
                    border: none;
                    padding: 14px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 16px;
                    cursor: pointer;
                    transition: transform 0.2s ease, opacity 0.2s ease;
                }
                .btn-primary:active {
                    transform: scale(0.98);
                    opacity: 0.9;
                }
            `}} />

            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    );
}
