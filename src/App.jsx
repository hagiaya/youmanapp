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
    AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
        { id: 'home', icon: HomeIcon, label: 'Dashboard' },
        { id: 'protocol', icon: Clock, label: 'Protocol' },
        { id: 'knowledge', icon: Brain, label: 'Knowledge' },
        { id: 'progress', icon: TrendingUp, label: 'Progress' },
        { id: 'profile', icon: User, label: 'Profile' }
    ];

    return (
        <nav className="glass-nav" style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            padding: '12px 0 24px', 
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

const SectionHeader = ({ title, subtitle }) => (
    <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', color: '#FFF', fontWeight: 'bold', letterSpacing: '-0.5px' }}>{title}</h1>
        {subtitle && <p style={{ color: '#888', marginTop: '4px', fontSize: '14px' }}>{subtitle}</p>}
    </div>
);

// --- Pages ---

const HomeView = ({ rituals, toggleRitual, streak }) => {
    const completedCount = rituals.filter(r => r.completed).length;
    const progressPercent = rituals.length > 0 ? (completedCount / rituals.length) * 100 : 0;
    
    // Determine level dynamically based on streak
    let level = 'Unstructured Man';
    if (streak >= 7 && streak < 21) level = 'Disciplined Man';
    else if (streak >= 21 && streak < 60) level = 'Elite Discipline';
    else if (streak >= 60) level = 'Self-Made King';

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

            {/* Product Reminder */}
            {!rituals.find(r => r.title === 'Minum Youman')?.completed && (
                <div className="glass-card" style={{ 
                    padding: '16px', 
                    marginBottom: '24px',
                    background: 'linear-gradient(45deg, rgba(20,20,20,1) 0%, rgba(40,40,40,1) 100%)',
                    borderLeft: '4px solid #FFF'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Waktunya Minum YOUMAN</h3>
                            <p style={{ fontSize: '12px', color: '#AAA' }}>Optimalkan testosteron harian Anda</p>
                        </div>
                        <Droplet size={24} color="#FFF" />
                    </div>
                </div>
            )}

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
                            <div className={`checkbox ${item.completed ? 'checked' : ''}`} style={{ marginRight: '16px' }}>
                                {item.completed && <CheckCircle2 size={16} />}
                            </div>
                            <div style={{ flex: 1, opacity: item.completed ? 0.5 : 1 }}>
                                <div style={{ fontWeight: '600', fontSize: '15px' }}>{item.title}</div>
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
        </motion.div>
    );
};

const ProtocolView = ({ rituals, setRituals }) => {
    // Phase for 30 Day Program
    const [activePhase] = useState('Phase 1: Discipline');

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

            <div className="glass-card" style={{ marginBottom: '24px', overflow: 'hidden', padding: 0 }}>
                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Current Program</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>{activePhase}</div>
                    <p style={{ fontSize: '13px', color: '#AAA' }}>Fokus pada pembentukan kebiasaan dasar. Jangan lewatkan satu hari pun.</p>
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
                    <span style={{ fontWeight: '500' }}>{item.title}</span>
                    <button 
                        onClick={() => setRituals(rituals.filter(r => r.id !== item.id))}
                        style={{ background: 'none', border: 'none', color: '#FF3B30', fontSize: '12px' }}
                    >Hapus</button>
                </div>
            ))}
            
            <button 
                className="btn-primary" 
                style={{ width: '100%', marginTop: '12px', background: 'rgba(255,255,255,0.1)', color: '#FFF' }}
                onClick={() => {
                    const title = prompt("Nama Ritual Baru:");
                    if (title) setRituals([...rituals, { id: Date.now(), title, completed: false }]);
                }}
            >
                + Tambah Ritual
            </button>
        </motion.div>
    );
};

const KnowledgeView = () => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ paddingBottom: '100px' }}
        >
            <SectionHeader title="Knowledge" subtitle="Pahami mesin penggerak maskulinitas Anda." />

            <div className="glass-card" style={{ marginBottom: '24px', padding: '0', overflow: 'hidden' }}>
                <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1000" alt="Testosterone" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                <div style={{ padding: '20px' }}>
                    <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Testosteron 101</h2>
                    <p style={{ fontSize: '14px', color: '#AAA', lineHeight: '1.6', marginBottom: '16px' }}>
                        Testosteron bukan sekadar hormon otot. Ia adalah fondasi penggerak untuk energi, fokus mental, dan kedisiplinan seorang pria.
                    </p>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>⚠️ Bahaya T-Rendah</div>
                            <div style={{ fontSize: '12px', color: '#888' }}>Kabut otak, energi lemah, motivasi menurun.</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>⚡ Cara Meningkatkan</div>
                            <div style={{ fontSize: '12px', color: '#888' }}>Angkat beban berat, tidur 7-8 jam, diet kaya protein & lemak sehat.</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ background: 'linear-gradient(180deg, rgba(20,20,20,1) 0%, rgba(30,30,30,1) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <Shield size={24} color="#FFF" />
                    <h2 style={{ fontSize: '18px', margin: 0 }}>Peran Produk YOUMAN</h2>
                </div>
                <p style={{ fontSize: '14px', color: '#AAA', lineHeight: '1.6', marginBottom: '16px' }}>
                    Suplemen YOUMAN dirancang khusus dengan bahan aktif yang diakui secara ilmiah dapat membantu menyeimbangkan hormon dan mempercepat pemulihan energi, memberikan Anda keuntungan tak adil dalam kedisiplinan harian.
                </p>
                <a href="https://youman.id/products" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <button className="btn-primary" style={{ width: '100%', background: '#FFF', color: '#000', fontWeight: 'bold' }}>
                        Pelajari Produk
                    </button>
                </a>
            </div>
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

const ProfilView = ({ streak, bestStreak, onReset }) => {
    let level = 'Unstructured Man';
    if (streak >= 7 && streak < 21) level = 'Disciplined Man';
    else if (streak >= 21 && streak < 60) level = 'Elite Discipline';
    else if (streak >= 60) level = 'Self-Made King';

    const testosteronScore = "Optimal"; // Mocked score for UI
    
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
                <h1 style={{ fontSize: '24px', margin: '0 0 4px 0' }}>John Doe</h1>
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
                <a href="https://youman.id/products" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#FFF' }}>
                        <span style={{ fontWeight: 'bold', color: '#000', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <ShoppingCart size={18} /> Restock YOUMAN
                        </span>
                        <ChevronRight size={18} color="#000" />
                    </div>
                </a>

                <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer' }}>
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

export default function App() {
    return (
        <AppErrorBoundary>
            <AppContent />
        </AppErrorBoundary>
    );
}

function AppContent() {
    const [activeTab, setActiveTab] = useState('home');
    const [streak, setStreak] = useState(getStreak());
    const [bestStreak, setBestStreak] = useState(() => parseInt(localStorage.getItem('youman_best_streak') || "0"));
    const [history, setHistory] = useState(getHistory());
    const [rituals, setRituals] = useState(() => {
        const saved = getRituals();
        if (!saved || saved.length === 0) {
            return [
                { id: 1, title: 'Bangun Pagi (Sebelum 06:00)', completed: false },
                { id: 2, title: 'Olahraga (Min 30 Menit)', completed: false },
                { id: 3, title: 'Minum Youman', completed: false },
                { id: 4, title: 'Fokus Kerja (Deep Work 2 Jam)', completed: false }
            ];
        }
        return saved;
    });

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

    const handleResetData = () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus semua data pribadi? Tindakan ini tidak dapat dibatalkan.')) {
            clearAllData();
            setStreak(0);
            setBestStreak(0);
            setHistory([]);
            setRituals([
                { id: 1, title: 'Bangun Pagi (Sebelum 06:00)', completed: false },
                { id: 2, title: 'Olahraga (Min 30 Menit)', completed: false },
                { id: 3, title: 'Minum Youman', completed: false },
                { id: 4, title: 'Fokus Kerja (Deep Work 2 Jam)', completed: false }
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
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
            <main className="content" style={{ padding: '24px', maxWidth: '480px', margin: '0 auto' }}>
                <AnimatePresence mode="wait">
                    {activeTab === 'home' && (
                        <HomeView
                            key="home"
                            rituals={rituals}
                            toggleRitual={toggleRitual}
                            streak={streak}
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
                        <KnowledgeView key="knowledge" />
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
