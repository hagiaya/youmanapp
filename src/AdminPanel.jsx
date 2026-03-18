import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Users, CreditCard, Package, Search, Bell,
    Edit, Trash2, CheckCircle, Clock, Truck, Plus, X, ArrowUpRight, ArrowDownRight,
    LogOut, MoreHorizontal, UserCheck, UserX, Loader, AlertTriangle
} from 'lucide-react';
import {
    AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { supabase } from './utils/supabase';

// --- INITIAL MOCK DATA ---
const REVENUE_DATA = [
    { name: 'Sen', total: 1200000 },
    { name: 'Sel', total: 1800000 },
    { name: 'Rab', total: 1400000 },
    { name: 'Kam', total: 2200000 },
    { name: 'Jum', total: 2800000 },
    { name: 'Sab', total: 3500000 },
    { name: 'Min', total: 3100000 }
];

const INITIAL_USERS = [
    { id: '1', name: 'Budi Santoso', email: 'budi@example.com', phone: '08123456789', phone_verified: true, role: 'User', created_at: '2026-03-10' },
    { id: '2', name: 'Siti Aminah', email: 'siti@example.com', phone: '08198765432', phone_verified: false, role: 'User', created_at: '2026-03-11' },
    { id: '3', name: 'Reza Latandrang', email: 'reza@youman.com', phone: '08122334455', phone_verified: true, role: 'Admin', created_at: '2026-03-01' },
];

const INITIAL_PRODUCTS = [
    { id: '101', name: 'YOUMAN Premium Kit', price: 299000, stock: 45, status: 'Active', sales: 128 },
    { id: '102', name: 'Basic Fitness Band', price: 89000, stock: 12, status: 'Active', sales: 340 },
    { id: '103', name: 'Protein Shake 1kg', price: 350000, stock: 0, status: 'Out of Stock', sales: 89 },
];

const INITIAL_TRANSACTIONS = [
    { id: 'TRX-10029', user_name: 'Budi Santoso', amount: 299000, status: 'Success', method: 'Midtrans (GoPay)', delivery_status: 'Delivered', created_at: '2026-03-14 10:23' },
    { id: 'TRX-10030', user_name: 'Siti Aminah', amount: 89000, status: 'Pending', method: 'Midtrans (BCA VA)', delivery_status: 'Processing', created_at: '2026-03-14 11:45' },
    { id: 'TRX-10031', user_name: 'Andi Kusuma', amount: 439000, status: 'Success', method: 'Midtrans (Credit Card)', delivery_status: 'Shipped', created_at: '2026-03-14 14:10' },
];

// --- TOAST COMPONENT ---
const Toast = ({ message, type, onClose }) => (
    <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
        color: '#fff', padding: '12px 24px', borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px',
        animation: 'modalIn 0.3s ease-out'
    }}>
        {type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
        <span style={{ fontWeight: 500 }}>{message}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
    </div>
);

// --- VIEWS ---

const DashboardView = ({ products }) => (
    <div className="admin-fade-in">
        <h1 className="admin-page-title">Dashboard Overview</h1>

        <div className="admin-grid">
            <div className="admin-card">
                <div className="admin-card-header">
                    <span className="admin-card-title">Pendapatan (Hari Ini)</span>
                    <CreditCard size={20} color="var(--admin-primary)" />
                </div>
                <div className="admin-card-value">Rp 3.100.000</div>
                <div className="admin-card-trend trend-up">
                    <ArrowUpRight size={16} /> +12.5% vs kemarin
                </div>
            </div>
            <div className="admin-card">
                <div className="admin-card-header">
                    <span className="admin-card-title">Pengguna Aktif</span>
                    <Users size={20} color="var(--admin-primary)" />
                </div>
                <div className="admin-card-value">1,204</div>
                <div className="admin-card-trend trend-up">
                    <ArrowUpRight size={16} /> +4.2% minggu ini
                </div>
            </div>
            <div className="admin-card">
                <div className="admin-card-header">
                    <span className="admin-card-title">Pesanan Baru</span>
                    <Package size={20} color="var(--admin-primary)" />
                </div>
                <div className="admin-card-value">48</div>
                <div className="admin-card-trend trend-down">
                    <ArrowDownRight size={16} /> -2.1% dari minggu lalu
                </div>
            </div>
        </div>

        <div className="admin-dashboard-split">
            {/* Chart */}
            <div className="admin-card" style={{ padding: '24px 24px 0 24px' }}>
                <h3 className="admin-card-title" style={{ marginBottom: '24px' }}>Grafik Pendapatan Mingguan</h3>
                <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer>
                        <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--admin-primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--admin-primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(value) => `Rp ${value / 1000}k`} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => [`Rp ${value.toLocaleString()}`, 'Pendapatan']}
                            />
                            <Area type="monotone" dataKey="total" stroke="var(--admin-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Best Sellers */}
            <div className="admin-card">
                <h3 className="admin-card-title" style={{ marginBottom: '24px' }}>Produk Terlaris</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[...products].sort((a, b) => b.sales - a.sales).slice(0, 5).map((prod, idx) => (
                        <div key={prod.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: 'var(--admin-primary)' }}>
                                #{idx + 1}
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{prod.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>Terjual: {prod.sales}</div>
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>
                                Rp {prod.price.toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Latest Transactions Table */}
        <div className="admin-table-container">
            <div className="admin-table-header-row">
                <h3 className="admin-card-title" style={{ margin: 0 }}>Transaksi Terbaru</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Pelanggan</th>
                            <th>Tanggal</th>
                            <th>Jumlah</th>
                            <th>Metode (Midtrans)</th>
                            <th>Status Pembayaran</th>
                        </tr>
                    </thead>
                    <tbody>
                        {INITIAL_TRANSACTIONS.map((trx, idx) => (
                            <tr key={trx.id || idx}>
                                <td style={{ fontWeight: 500 }}>{trx.id}</td>
                                <td>{trx.user_name}</td>
                                <td style={{ color: 'var(--admin-text-muted)' }}>{trx.created_at}</td>
                                <td style={{ fontWeight: 600 }}>Rp {trx.amount.toLocaleString()}</td>
                                <td>{trx.method}</td>
                                <td>
                                    <span className={`admin-badge ${trx.status === 'Success' ? 'badge-success' : 'badge-warning'}`}>
                                        {trx.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const UsersView = ({ showToast }) => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'User' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setUsers(data && data.length > 0 ? data : INITIAL_USERS);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers(INITIAL_USERS); // fallback to mock data if no table yet
            showToast('Menggunakan data User simulasi (Supabase Belum Terhubung)', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.includes(searchTerm)
    );

    const handleSave = async () => {
        if (!formData.name || !formData.email || !formData.phone) {
            showToast('Semua kolom harus diisi!', 'error');
            return;
        }

        try {
            const { data, error } = await supabase.from('users').insert([
                { ...formData, phone_verified: false }
            ]).select();
            if (error) throw error;
            setUsers([data[0], ...users]);
            showToast('Berhasil menambahkan user baru ke Supabase!', 'success');
        } catch (error) {
            console.error(error);
            // Fallback Local 
            setUsers([{ id: Date.now().toString(), ...formData, phone_verified: false, created_at: new Date().toISOString() }, ...users]);
            showToast('Berhasil disimpan di Local (Supabase Error)', 'success');
        }
        setFormData({ name: '', email: '', phone: '', role: 'User' });
        setIsModalOpen(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Yakin ingin menghapus user ini?")) {
            try {
                const { error } = await supabase.from('users').delete().eq('id', id);
                if (error) throw error;
                setUsers(users.filter(u => u.id !== id));
                showToast('User berhasil dihapus!', 'success');
            } catch (error) {
                setUsers(users.filter(u => u.id !== id));
                showToast('User dihapus secara lokal (Supabase Error)', 'success');
            }
        }
    };

    const handleVerify = async (user) => {
        const newStatus = !user.phone_verified;
        try {
            const { error } = await supabase.from('users').update({ phone_verified: newStatus }).eq('id', user.id);
            if (error) throw error;
            setUsers(users.map(u => u.id === user.id ? { ...u, phone_verified: newStatus } : u));
            showToast(`Status user diubah menjadi ${newStatus ? 'Terverifikasi' : 'Belum Diverifikasi'}.`, 'success');
        } catch (err) {
            console.error(err);
            setUsers(users.map(u => u.id === user.id ? { ...u, phone_verified: newStatus } : u));
            showToast(`Local Update: Status diubah menjadi ${newStatus}.`, 'success');
        }
    };

    return (
        <div className="admin-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="admin-page-title" style={{ margin: 0 }}>Manajemen User</h1>
                <button className="admin-btn admin-btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Tambah User
                </button>
            </div>

            <div className="admin-table-container">
                <div className="admin-table-header-row" style={{ padding: '16px 24px' }}>
                    <div className="admin-search" style={{ width: '250px', backgroundColor: '#f8fafc', border: '1px solid var(--admin-border)' }}>
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Cari user (nama, email, hp)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Nama Lengkap</th>
                                <th>Email</th>
                                <th>No. WhatsApp</th>
                                <th>Verifikasi HP</th>
                                <th>Role</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}><Loader className="animate-spin" /> Memuat data...</td></tr>
                            ) : filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td style={{ fontWeight: 500 }}>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone}</td>
                                    <td>
                                        {user.phone_verified ?
                                            <span className="admin-badge badge-success"><UserCheck size={14} style={{ marginRight: '4px' }} /> Terverifikasi</span> :
                                            <span className="admin-badge badge-warning"><UserX size={14} style={{ marginRight: '4px' }} /> Belum</span>
                                        }
                                    </td>
                                    <td><span className={`admin-badge ${user.role === 'Admin' ? 'badge-primary' : 'badge-gray'}`}>{user.role}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="admin-btn admin-btn-outline" style={{ padding: '6px' }} title={user.phone_verified ? "Batalkan Verifikasi" : "Verifikasi (Approve)"} onClick={() => handleVerify(user)}>
                                                {user.phone_verified ? <UserX size={16} color="#ef4444" /> : <UserCheck size={16} color="#10b981" />}
                                            </button>
                                            <button className="admin-btn admin-btn-outline" style={{ padding: '6px' }} title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button className="admin-btn admin-btn-danger" style={{ padding: '6px' }} title="Hapus" onClick={() => handleDelete(user.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>Tidak ada pengguna ditemukan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <h2 className="admin-modal-title">Tambah User Baru</h2>
                            <button className="admin-btn-outline" style={{ padding: '4px', border: 'none', borderRadius: '50%' }} onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-form-group">
                                <label>Nama Lengkap</label>
                                <input type="text" className="admin-form-control" placeholder="Masukkan nama" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="admin-form-group">
                                <label>Email</label>
                                <input type="email" className="admin-form-control" placeholder="Masukkan email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="admin-form-group">
                                <label>No. WhatsApp</label>
                                <input type="text" className="admin-form-control" placeholder="Contoh: 08123456789" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div className="admin-form-group">
                                <label>Role</label>
                                <select className="admin-form-control" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="User">User</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn admin-btn-outline" onClick={() => setIsModalOpen(false)}>Batal</button>
                            <button className="admin-btn admin-btn-primary" onClick={handleSave}>Simpan Data</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ProductsView = ({ products, setProducts, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ name: '', price: '', stock: '', status: 'Active' });

    const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSave = async () => {
        if (!formData.name || !formData.price || formData.stock === '') {
            showToast('Mohon lengkapi data produk!', 'error');
            return;
        }

        const newProdData = {
            name: formData.name, price: Number(formData.price), stock: Number(formData.stock), sales: 0, status: formData.stock == 0 ? 'Out of Stock' : formData.status
        };

        try {
            const { data, error } = await supabase.from('products').insert([newProdData]).select();
            if (error) throw error;
            setProducts([data[0], ...products]);
            showToast('Produk berhasil ditambahkan ke Supabase!', 'success');
        } catch (error) {
            setProducts([{ id: Date.now().toString(), ...newProdData }, ...products]);
            showToast('Produk disimpan ke Local (Supabase Error)', 'success');
        }

        setFormData({ name: '', price: '', stock: '', status: 'Active' });
        setIsModalOpen(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Yakin ingin menghapus produk ini?")) {
            try {
                const { error } = await supabase.from('products').delete().eq('id', id);
                if (error) throw error;
                setProducts(products.filter(p => p.id !== id));
                showToast('Produk berhasil dihapus!', 'success');
            } catch (error) {
                setProducts(products.filter(p => p.id !== id));
                showToast('Terhapus di Lokal (Supabase Error)', 'success');
            }
        }
    };

    return (
        <div className="admin-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="admin-page-title" style={{ margin: 0 }}>Manajemen Produk</h1>
                <button className="admin-btn admin-btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Tambah Produk
                </button>
            </div>

            <div className="admin-table-container">
                <div className="admin-table-header-row" style={{ padding: '16px 24px' }}>
                    <div className="admin-search" style={{ width: '250px', backgroundColor: '#f8fafc', border: '1px solid var(--admin-border)' }}>
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nama Produk</th>
                                <th>Harga</th>
                                <th>Stok</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length > 0 ? filteredProducts.map((prod, idx) => (
                                <tr key={prod.id || idx}>
                                    <td style={{ color: 'var(--admin-text-muted)', fontSize: '11px', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.id}</td>
                                    <td style={{ fontWeight: 500 }}>{prod.name}</td>
                                    <td style={{ fontWeight: 600 }}>Rp {prod.price.toLocaleString()}</td>
                                    <td>{prod.stock} unit</td>
                                    <td>
                                        <span className={`admin-badge ${prod.status === 'Active' ? 'badge-success' : 'badge-danger'}`} style={{ backgroundColor: prod.status === 'Active' ? '#d1fae5' : '#fee2e2', color: prod.status === 'Active' ? '#065f46' : '#b91c1c' }}>
                                            {prod.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="admin-btn admin-btn-outline" style={{ padding: '6px' }} title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button className="admin-btn admin-btn-danger" style={{ padding: '6px' }} title="Hapus" onClick={() => handleDelete(prod.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>Tidak ada produk yang cocok.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <h2 className="admin-modal-title">Tambah Produk Baru</h2>
                            <button className="admin-btn-outline" style={{ padding: '4px', border: 'none', borderRadius: '50%' }} onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-form-group">
                                <label>Nama Produk</label>
                                <input type="text" className="admin-form-control" placeholder="Masukkan nama produk" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="admin-form-group">
                                <label>Harga (Rp)</label>
                                <input type="number" className="admin-form-control" placeholder="Contoh: 150000" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                            </div>
                            <div className="admin-form-group">
                                <label>Stok Awal</label>
                                <input type="number" className="admin-form-control" placeholder="100" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                            </div>
                            <div className="admin-form-group">
                                <label>Status</label>
                                <select className="admin-form-control" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="Active">Active</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Out of Stock">Out of Stock</option>
                                </select>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn admin-btn-outline" onClick={() => setIsModalOpen(false)}>Batal</button>
                            <button className="admin-btn admin-btn-primary" onClick={handleSave}>Simpan Produk</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const TransactionsView = ({ showToast }) => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setTransactions(data && data.length > 0 ? data : INITIAL_TRANSACTIONS);
        } catch (error) {
            setTransactions(INITIAL_TRANSACTIONS);
            showToast('Memakai data transaksi manual...', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="admin-page-title" style={{ margin: 0 }}>Manajemen Transaksi</h1>
                <button className="admin-btn admin-btn-primary" onClick={() => showToast('Mengekspor laporan...', 'success')}>Export Data (CSV)</button>
            </div>

            {/* Midtrans Summary */}
            <div className="admin-grid" style={{ marginBottom: '32px' }}>
                <div className="admin-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <div className="admin-card-title">Transaksi Sukses (Midtrans)</div>
                    <div className="admin-card-value" style={{ fontSize: '24px', marginTop: '8px' }}>1,240</div>
                </div>
                <div className="admin-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div className="admin-card-title">Menunggu Pembayaran</div>
                    <div className="admin-card-value" style={{ fontSize: '24px', marginTop: '8px' }}>15</div>
                </div>
                <div className="admin-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="admin-card-title">Dalam Pengiriman</div>
                    <div className="admin-card-value" style={{ fontSize: '24px', marginTop: '8px' }}>42</div>
                </div>
            </div>

            <div className="admin-table-container">
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Pelanggan</th>
                                <th>Tanggal & Waktu</th>
                                <th>Total Nilai</th>
                                <th>Metode (Midtrans)</th>
                                <th>Status Pembayaran</th>
                                <th>Progress Deliveri</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '32px' }}><Loader className="animate-spin" /> </td></tr>
                            ) : transactions.map((trx, idx) => (
                                <tr key={trx.id || idx}>
                                    <td style={{ fontWeight: 500, fontSize: '12px' }}>{trx.id}</td>
                                    <td>{trx.user_name}</td>
                                    <td style={{ color: 'var(--admin-text-muted)', fontSize: '13px' }}>{trx.created_at}</td>
                                    <td style={{ fontWeight: 600 }}>Rp {trx.amount.toLocaleString()}</td>
                                    <td style={{ fontSize: '13px' }}>{trx.method}</td>
                                    <td>
                                        <span className={`admin-badge ${trx.status === 'Success' ? 'badge-success' : 'badge-warning'}`}>
                                            {trx.status === 'Success' ? <CheckCircle size={12} style={{ marginRight: '4px' }} /> : <Clock size={12} style={{ marginRight: '4px' }} />}
                                            {trx.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`admin-badge ${trx.delivery_status === 'Delivered' ? 'badge-success' : trx.delivery_status === 'Shipped' ? 'badge-primary' : 'badge-gray'}`}>
                                            <Truck size={12} style={{ marginRight: '4px' }} /> {trx.delivery_status}
                                        </span>
                                    </td>
                                    <td>
                                            <button className="admin-btn admin-btn-outline" style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }} onClick={async () => {
                                            const statuses = ['Processing', 'Shipped', 'Delivered'];
                                            const currentIndex = statuses.indexOf(trx.delivery_status);
                                            const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                                            try {
                                                const { error } = await supabase.from('transactions').update({ delivery_status: nextStatus }).eq('id', trx.id);
                                                if (error) throw error;
                                                setTransactions(transactions.map(t => t.id === trx.id ? { ...t, delivery_status: nextStatus } : t));
                                                showToast(`Status pengiriman diubah ke ${nextStatus}`, 'success');
                                            } catch (err) {
                                                console.error(err);
                                                // Fallback for mock array
                                                setTransactions(transactions.map(t => t.id === trx.id ? { ...t, delivery_status: nextStatus } : t));
                                                showToast(`Local Update: Status diubah ke ${nextStatus}`, 'success');
                                            }
                                        }}>
                                            Update Status ({trx.delivery_status})
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- ADMIN AUTH COMPONENT ---

const AdminAuthView = ({ onLoginSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const { data, error } = await supabase.from('users')
                .select('*')
                .eq('email', email)
                .eq('password', password)
                .single();

            if (error || !data) throw new Error('Email atau password salah!');
            if (data.role !== 'Admin') throw new Error('Akses Ditolak: Anda bukan Admin!');

            onLoginSuccess(data);
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif' }}>
            <div style={{ background: '#1e293b', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '64px', height: '64px', background: '#3b82f6', color: '#FFF', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', margin: '0 auto 16px auto' }}>Y</div>
                    <h1 style={{ color: '#FFF', fontSize: '24px', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>YOUMAN Admin</h1>
                    <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Silakan masuk untuk mengelola sistem</p>
                </div>

                {errorMsg && (
                    <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', border: '1px solid #b91c1c' }}>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '6px', fontWeight: '500' }}>Email Admin</label>
                        <input type="email" placeholder="admin@youman.com" required value={email} onChange={e => setEmail(e.target.value)} style={{ boxSizing: 'border-box', width: '100%', padding: '12px 16px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#FFF', outline: 'none', fontSize: '14px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '6px', fontWeight: '500' }}>Password</label>
                        <input type="password" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} style={{ boxSizing: 'border-box', width: '100%', padding: '12px 16px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#FFF', outline: 'none', fontSize: '14px' }} />
                    </div>
                    <button className="admin-btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', marginTop: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '15px' }}>
                        {loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- MAIN LAYOUT ---

export default function AdminPanel() {
    const [adminUser, setAdminUser] = useState(() => {
        const saved = localStorage.getItem('youman_admin_user');
        return saved ? JSON.parse(saved) : null;
    });

    const handleLogin = (user) => {
        localStorage.setItem('youman_admin_user', JSON.stringify(user));
        setAdminUser(user);
    };

    const handleLogout = () => {
        localStorage.removeItem('youman_admin_user');
        setAdminUser(null);
    };

    if (!adminUser) return <AdminAuthView onLoginSuccess={handleLogin} />;

    return <AdminDashboard adminUser={adminUser} onLogout={handleLogout} />;
}

function AdminDashboard({ adminUser, onLogout }) {
    const [view, setView] = useState('dashboard');
    const [toast, setToast] = useState(null);

    // Lifted state for Dashboard access
    const [products, setProducts] = useState(INITIAL_PRODUCTS);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const NAV_ITEMS = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'Manajemen User', icon: Users },
        { id: 'transactions', label: 'Transaksi (Midtrans)', icon: CreditCard },
        { id: 'products', label: 'Manajemen Produk', icon: Package },
    ];

    const renderView = () => {
        switch (view) {
            case 'dashboard': return <DashboardView products={products} />;
            case 'users': return <UsersView showToast={showToast} />;
            case 'transactions': return <TransactionsView showToast={showToast} />;
            case 'products': return <ProductsView products={products} setProducts={setProducts} showToast={showToast} />;
            default: return <DashboardView products={products} />;
        }
    };

    return (
        <div className="admin-layout">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <div className="admin-logo-icon">Y</div>
                    <div>
                        <div style={{ color: 'white', fontWeight: 700, fontSize: '18px', letterSpacing: '0.5px' }}>YOUMAN</div>
                        <div style={{ fontSize: '12px', color: 'var(--admin-sidebar-text)' }}>Admin Panel v2.0</div>
                    </div>
                </div>

                <div className="admin-sidebar-nav">
                    {NAV_ITEMS.map((item) => (
                        <div
                            key={item.id}
                            className={`admin-nav-item ${view === item.id ? 'active' : ''}`}
                            onClick={() => setView(item.id)}
                        >
                            <item.icon size={20} strokeWidth={view === item.id ? 2.5 : 2} />
                            {item.label}
                        </div>
                    ))}
                </div>

                <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="admin-nav-item" style={{ color: '#ef4444' }} onClick={onLogout}>
                        <LogOut size={20} />
                        Logout System
                    </div>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="admin-search">
                        <Search size={18} />
                        <input type="text" placeholder="Pencarian global (TRX ID, Nama, Email)..." />
                    </div>

                    <div className="admin-user-profile">
                        <div style={{ position: 'relative', cursor: 'pointer', padding: '8px' }} onClick={() => showToast('Tidak ada notifikasi baru', 'success')}>
                            <Bell size={20} color="var(--admin-text-muted)" />
                            <div style={{ position: 'absolute', top: 5, right: 8, width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
                        </div>
                        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--admin-border)', margin: '0 8px' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-text-main)' }}>{adminUser.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>{adminUser.role}</div>
                            </div>
                            <div className="admin-user-avatar">{adminUser.name.charAt(0).toUpperCase()}</div>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    {renderView()}
                </div>
            </main>
        </div>
    );
}
