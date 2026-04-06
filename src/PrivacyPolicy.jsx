import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronLeft, Lock, Eye, FileText, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div style={{ 
            background: '#050505', 
            color: '#FFFFFF', 
            minHeight: '100vh',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            padding: '24px 20px 80px'
        }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Header */}
                <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <button 
                        onClick={() => navigate(-1)}
                        style={{ 
                            background: 'rgba(255,255,255,0.05)', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            color: '#FFF', 
                            padding: '12px', 
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Kebijakan Privasi</h1>
                        <p style={{ color: '#888', fontSize: '14px', margin: '4px 0 0' }}>Terakhir diperbarui: 6 April 2026</p>
                    </div>
                </header>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                    style={{ 
                        padding: '24px', 
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '20px',
                        lineHeight: '1.6'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: '#00E676' }}>
                        <Shield size={32} />
                        <h2 style={{ fontSize: '20px', margin: 0 }}>Komitmen Kami</h2>
                    </div>
                    
                    <p style={{ color: '#CCC', fontSize: '15px', marginBottom: '24px' }}>
                        YOUMAN menghargai privasi Anda. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda saat menggunakan aplikasi kami.
                    </p>

                    <section style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <Eye size={20} color="#888" />
                            <h3 style={{ fontSize: '18px', margin: 0 }}>1. Informasi yang Kami Kumpulkan</h3>
                        </div>
                        <ul style={{ color: '#AAA', fontSize: '14px', paddingLeft: '20px' }}>
                            <li style={{ marginBottom: '8px' }}>Informasi Profil: Nama, email, usia, dan profesi yang Anda berikan saat pendaftaran.</li>
                            <li style={{ marginBottom: '8px' }}>Data Rutinitas: Jadwal bangun pagi, olahraga, dan aktivitas harian Anda dalam aplikasi.</li>
                            <li style={{ marginBottom: '8px' }}>Data Transaksi: Riwayat pembelian produk YOUMAN dan bukti pembayaran yang Anda unggah.</li>
                            <li>Informasi Perangkat: Informasi teknis dasar untuk fungsionalitas notifikasi (OneSignal).</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <Lock size={20} color="#888" />
                            <h3 style={{ fontSize: '18px', margin: 0 }}>2. Keamanan Data</h3>
                        </div>
                        <p style={{ color: '#AAA', fontSize: '14px' }}>
                            Data Anda disimpan secara aman menggunakan infrastruktur Supabase dengan enkripsi standar industri. Kami tidak akan pernah menjual data pribadi Anda kepada pihak ketiga manapun.
                        </p>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <Globe size={20} color="#888" />
                            <h3 style={{ fontSize: '18px', margin: 0 }}>3. Penggunaan Layanan Pihak Ketiga</h3>
                        </div>
                        <p style={{ color: '#AAA', fontSize: '14px' }}>
                            Kami menggunakan layanan seperti OneSignal untuk notifikasi push dan RajaOngkir untuk pelacakan pengiriman. Layanan ini hanya menerima data terbatas yang diperlukan untuk fungsionalitas tersebut.
                        </p>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <FileText size={20} color="#888" />
                            <h3 style={{ fontSize: '18px', margin: 0 }}>4. Hak Anda</h3>
                        </div>
                        <p style={{ color: '#AAA', fontSize: '14px' }}>
                            Anda memiliki hak penuh untuk menghapus seluruh data Anda dari sistem kami melalui fitur "Reset Semua Data" di menu profil. Setelah dihapus, data tersebut tidak dapat dikembalikan.
                        </p>
                    </section>

                    <div style={{ 
                        marginTop: '40px', 
                        paddingTop: '24px', 
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        textAlign: 'center'
                    }}>
                        <p style={{ color: '#666', fontSize: '13px' }}>
                            Hubungi kami melalui WhatsApp jika memiliki pertanyaan lebih lanjut mengenai privasi Anda.
                        </p>
                        <p style={{ color: '#00E676', fontWeight: 'bold', fontSize: '14px', marginTop: '12px' }}>
                            YOUMAN © 2026
                        </p>
                    </div>
                </motion.div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                .glass-card {
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                }
            `}} />
        </div>
    );
};

export default PrivacyPolicy;
