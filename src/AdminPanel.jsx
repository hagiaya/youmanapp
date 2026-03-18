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

// REMOVED INITIAL MOCK DATA - ONLY USING REAL SUPABASE DATA

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

const DashboardView = ({ products }) => {
    const [revenue, setRevenue] = useState(0);
    const [activeUsers, setActiveUsers] = useState(0);
    const [newOrders, setNewOrders] = useState(0);
    const [recentOrders, setRecentOrders] = useState([]);
    const [chartData, setChartData] = useState([
        { name: 'Sen', total: 0 }, { name: 'Sel', total: 0 }, { name: 'Rab', total: 0 },
        { name: 'Kam', total: 0 }, { name: 'Jum', total: 0 }, { name: 'Sab', total: 0 }, { name: 'Min', total: 0 }
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Count Users
                const { count: userCount, error: userError } = await supabase.from('users').select('*', { count: 'exact', head: true });
                if (!userError && userCount !== null) setActiveUsers(userCount);

                // Fetch transactions for revenue and recent array
                const { data: trx, error: trxError } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
                if (!trxError && trx) {
                    const total = trx.filter(t => t.status === 'Success').reduce((acc, curr) => acc + curr.amount, 0);
                    setRevenue(total);
                    setNewOrders(trx.length);
                    setRecentOrders(trx.slice(0, 5));

                    // Generate Dynamic Weekly Chart (Sen-Min)
                    let newChart = [
                        { name: 'Sen', total: 0 }, { name: 'Sel', total: 0 }, { name: 'Rab', total: 0 },
                        { name: 'Kam', total: 0 }, { name: 'Jum', total: 0 }, { name: 'Sab', total: 0 }, { name: 'Min', total: 0 }
                    ];
                    trx.forEach(t => {
                        if (t.status === 'Success') {
                            const dayIndex = new Date(t.created_at).getDay(); // 0 is Sun
                            const mapIdx = dayIndex === 0 ? 6 : dayIndex - 1; // 0 for Sen, 6 for Min
                            newChart[mapIdx].total += t.amount;
                        }
                    });
                    setChartData(newChart);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <div className="admin-fade-in">
            <h1 className="admin-page-title">Dashboard Overview</h1>

            <div className="admin-grid">
                <div className="admin-card">
                    <div className="admin-card-header">
                        <span className="admin-card-title">Pendapatan (Total)</span>
                        <CreditCard size={20} color="var(--admin-primary)" />
                    </div>
                    <div className="admin-card-value">
                        {loading ? <Loader className="animate-spin" size={20} /> : `Rp ${revenue.toLocaleString()}`}
                    </div>
                    <div className="admin-card-trend trend-up">
                        <ArrowUpRight size={16} /> Berdasarkan transaksi sukses
                    </div>
                </div>
                <div className="admin-card">
                    <div className="admin-card-header">
                        <span className="admin-card-title">Total Pengguna</span>
                        <Users size={20} color="var(--admin-primary)" />
                    </div>
                    <div className="admin-card-value">
                        {loading ? <Loader className="animate-spin" size={20} /> : activeUsers}
                    </div>
                    <div className="admin-card-trend trend-up">
                        <ArrowUpRight size={16} /> Data riil Supabase
                    </div>
                </div>
                <div className="admin-card">
                    <div className="admin-card-header">
                        <span className="admin-card-title">Total Pemesanan</span>
                        <Package size={20} color="var(--admin-primary)" />
                    </div>
                    <div className="admin-card-value">
                        {loading ? <Loader className="animate-spin" size={20} /> : newOrders}
                    </div>
                    <div className="admin-card-trend trend-up">
                        <ArrowUpRight size={16} /> Seluruh transaksi masuk
                    </div>
                </div>
            </div>

            <div className="admin-dashboard-split">
                {/* Chart */}
                <div className="admin-card" style={{ padding: '24px 24px 0 24px' }}>
                    <h3 className="admin-card-title" style={{ marginBottom: '24px' }}>Grafik Pendapatan Mingguan</h3>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer>
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--admin-primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--admin-primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(value) => `Rp ${value >= 1000 ? value / 1000 + 'k' : value}`} />
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
                        {products.length === 0 ? (
                        <div style={{ color: '#888', fontSize: '14px', textAlign: 'center', padding: '16px' }}>Belum ada produk dirilis.</div>
                    ) : (
                        [...products].sort((a, b) => b.sales - a.sales).slice(0, 5).map((prod, idx) => (
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
                        ))
                    )}
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
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '16px' }}><Loader className="animate-spin" /> Fetching data...</td></tr>
                            ) : recentOrders.length > 0 ? recentOrders.map((trx, idx) => (
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
                            )) : (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '16px' }}>Belum ada transaksi sama sekali.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const UsersView = ({ showToast }) => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'User' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setUsers(data && data.length > 0 ? data : []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
            showToast('Gagal memuat pengguna dari Supabase', 'error');
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
            showToast('Semua kolom penting harus diisi!', 'error');
            return;
        }

        try {
            if (editingId) {
                const { error } = await supabase.from('users').update({ ...formData }).eq('id', editingId);
                if (error) throw error;
                setUsers(users.map(u => u.id === editingId ? { ...u, ...formData } : u));
                showToast('Data user berhasil diperbarui!', 'success');
            } else {
                const { data, error } = await supabase.from('users').insert([
                    { ...formData, phone_verified: false }
                ]).select();
                if (error) throw error;
                setUsers([data[0], ...users]);
                showToast('Berhasil menambahkan user baru ke Supabase!', 'success');
            }
        } catch (error) {
            console.error(error);
            showToast('Gagal menyimpan ke Supabase', 'error');
        }
        setFormData({ name: '', email: '', phone: '', password: '', role: 'User' });
        setEditingId(null);
        setIsModalOpen(false);
    };

    const handleEdit = (user) => {
        setFormData({ name: user.name, email: user.email, phone: user.phone, password: user.password || '', role: user.role });
        setEditingId(user.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Yakin ingin menghapus user ini?")) {
            try {
                const { error } = await supabase.from('users').delete().eq('id', id);
                if (error) throw error;
                setUsers(users.filter(u => u.id !== id));
                showToast('User berhasil dihapus!', 'success');
            } catch (error) {
                showToast('Gagal menghapus user', 'error');
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
                <button className="admin-btn admin-btn-primary" onClick={() => {
                    setFormData({ name: '', email: '', phone: '', password: '', role: 'User' });
                    setEditingId(null);
                    setIsModalOpen(true);
                }}>
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
                                            <button className="admin-btn admin-btn-outline" style={{ padding: '6px' }} title="Edit" onClick={() => handleEdit(user)}>
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
                                <label>Password (Untuk Login)</label>
                                <input type="text" className="admin-form-control" placeholder="Biarkan kosong jika tidak diubah" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
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
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ name: '', price: '', stock: '', status: 'Active' });

    const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSave = async () => {
        if (!formData.name || !formData.price || formData.stock === '') {
            showToast('Mohon lengkapi data produk!', 'error');
            return;
        }

        const newProdData = {
            name: formData.name, price: Number(formData.price), stock: Number(formData.stock), status: formData.stock <= 0 ? 'Out of Stock' : formData.status
        };

        try {
            if (editingId) {
                const { error } = await supabase.from('products').update(newProdData).eq('id', editingId);
                if (error) throw error;
                setProducts(products.map(p => p.id === editingId ? { ...p, ...newProdData } : p));
                showToast('Produk berhasil diperbarui!', 'success');
            } else {
                newProdData.sales = 0;
                const { data, error } = await supabase.from('products').insert([newProdData]).select();
                if (error) throw error;
                setProducts([data[0], ...products]);
                showToast('Produk berhasil ditambahkan!', 'success');
            }
        } catch (error) {
            console.error(error);
            showToast('Gagal menyimpan produk', 'error');
        }

        setFormData({ name: '', price: '', stock: '', status: 'Active' });
        setEditingId(null);
        setIsModalOpen(false);
    };

    const handleEdit = (prod) => {
        setFormData({ name: prod.name, price: prod.price, stock: prod.stock, status: prod.status });
        setEditingId(prod.id);
        setIsModalOpen(true);
    };

    const handleVerifyStatus = async (prod) => {
        const nextStatus = prod.status === 'Active' ? 'Draft' : 'Active';
        try {
            const { error } = await supabase.from('products').update({ status: nextStatus }).eq('id', prod.id);
            if (error) throw error;
            setProducts(products.map(p => p.id === prod.id ? { ...p, status: nextStatus } : p));
            showToast(`Status produk diubah menjadi ${nextStatus}`, 'success');
        } catch (error) {
            showToast('Gagal merubah status produk', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Yakin ingin menghapus produk ini?")) {
            try {
                const { error } = await supabase.from('products').delete().eq('id', id);
                if (error) throw error;
                setProducts(products.filter(p => p.id !== id));
                showToast('Produk berhasil dihapus!', 'success');
            } catch (error) {
                showToast('Gagal menghapus produk', 'error');
            }
        }
    };

    return (
        <div className="admin-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="admin-page-title" style={{ margin: 0 }}>Manajemen Produk</h1>
                <button className="admin-btn admin-btn-primary" onClick={() => {
                    setFormData({ name: '', price: '', stock: '', status: 'Active' });
                    setEditingId(null);
                    setIsModalOpen(true);
                }}>
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
                                            <button className="admin-btn admin-btn-outline" style={{ padding: '6px' }} title="Toggle Verifikasi (Aktif/Draft)" onClick={() => handleVerifyStatus(prod)}>
                                                {prod.status === 'Active' ? <CheckCircle size={16} color="#10b981" /> : <Clock size={16} color="#f59e0b" />}
                                            </button>
                                            <button className="admin-btn admin-btn-outline" style={{ padding: '6px' }} title="Edit" onClick={() => handleEdit(prod)}>
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
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ user_name: '', amount: '', status: 'Pending', delivery_status: 'Processing', method: 'Manual' });

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setTransactions(data && data.length > 0 ? data : []);
        } catch (error) {
            setTransactions([]);
            showToast('Sistem kesulitan mengambil data secara live dari Supabase', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(t =>
        t.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = async () => {
        if (!formData.user_name || !formData.amount) {
            showToast('Nama pelanggan dan jumlah nilai wajib diisi!', 'error');
            return;
        }

        const newTrxData = {
            user_name: formData.user_name,
            amount: Number(formData.amount),
            status: formData.status,
            delivery_status: formData.delivery_status,
            method: formData.method
        };

        try {
            if (editingId) {
                const { error } = await supabase.from('transactions').update(newTrxData).eq('id', editingId);
                if (error) throw error;
                setTransactions(transactions.map(t => t.id === editingId ? { ...t, ...newTrxData } : t));
                showToast('Transaksi berhasil diperbarui!', 'success');
            } else {
                const idGen = 'TRX-' + Math.floor(Math.random() * 100000);
                const { data, error } = await supabase.from('transactions').insert([{ id: idGen, ...newTrxData }]).select();
                if (error) throw error;
                setTransactions([data[0], ...transactions]);
                showToast('Transaksi manual berhasil ditambahkan!', 'success');
            }
        } catch (error) {
            showToast('Gagal menyimpan transaksi', 'error');
        }

        setFormData({ user_name: '', amount: '', status: 'Pending', delivery_status: 'Processing', method: 'Manual' });
        setEditingId(null);
        setIsModalOpen(false);
    };

    const handleEdit = (trx) => {
        setFormData({ user_name: trx.user_name, amount: trx.amount, status: trx.status, delivery_status: trx.delivery_status, method: trx.method || 'Manual' });
        setEditingId(trx.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Yakin ingin menghapus transaksi ini?")) {
            try {
                const { error } = await supabase.from('transactions').delete().eq('id', id);
                if (error) throw error;
                setTransactions(transactions.filter(t => t.id !== id));
                showToast('Transaksi berhasil dihapus!', 'success');
            } catch (error) {
                showToast('Gagal menghapus transaksi', 'error');
            }
        }
    };

    return (
        <div className="admin-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="admin-page-title" style={{ margin: 0 }}>Manajemen Transaksi</h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="admin-btn admin-btn-outline" onClick={() => showToast('Mengekspor laporan...', 'success')}>Export CSV</button>
                    <button className="admin-btn admin-btn-primary" onClick={() => {
                        setFormData({ user_name: '', amount: '', status: 'Pending', delivery_status: 'Processing', method: 'Manual' });
                        setEditingId(null);
                        setIsModalOpen(true);
                    }}>
                        <Plus size={18} /> Tambah Manual
                    </button>
                </div>
            </div>

            {/* Midtrans Summary */}
            <div className="admin-grid" style={{ marginBottom: '32px' }}>
                <div className="admin-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <div className="admin-card-title">Transaksi Sukses (Midtrans)</div>
                    <div className="admin-card-value" style={{ fontSize: '24px', marginTop: '8px' }}>
                        {isLoading ? <Loader className="animate-spin" size={20} /> : transactions.filter(t => t.status === 'Success').length}
                    </div>
                </div>
                <div className="admin-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div className="admin-card-title">Menunggu Pembayaran</div>
                    <div className="admin-card-value" style={{ fontSize: '24px', marginTop: '8px' }}>
                        {isLoading ? <Loader className="animate-spin" size={20} /> : transactions.filter(t => t.status !== 'Success' && t.status !== 'Failed').length}
                    </div>
                </div>
                <div className="admin-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="admin-card-title">Dalam Pengiriman</div>
                    <div className="admin-card-value" style={{ fontSize: '24px', marginTop: '8px' }}>
                        {isLoading ? <Loader className="animate-spin" size={20} /> : transactions.filter(t => t.delivery_status === 'Shipped').length}
                    </div>
                </div>
            </div>

            <div className="admin-table-container">
                <div className="admin-table-header-row" style={{ padding: '16px 24px' }}>
                    <div className="admin-search" style={{ width: '250px', backgroundColor: '#f8fafc', border: '1px solid var(--admin-border)' }}>
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Cari transaksi (ID, Nama)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
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
                            ) : filteredTransactions.length > 0 ? filteredTransactions.map((trx, idx) => (
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
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="admin-btn admin-btn-outline" style={{ padding: '6px' }} title="Edit Transaksi" onClick={() => handleEdit(trx)}>
                                                <Edit size={16} />
                                            </button>
                                            <button className="admin-btn admin-btn-danger" style={{ padding: '6px' }} title="Hapus Transaksi" onClick={() => handleDelete(trx.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px' }}>Tidak ada transaksi ditemukan.</td>
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
                            <h2 className="admin-modal-title">{editingId ? 'Edit Transaksi' : 'Tambah Transaksi'}</h2>
                            <button className="admin-btn-outline" style={{ padding: '4px', border: 'none', borderRadius: '50%' }} onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-form-group">
                                <label>Nama Pelanggan</label>
                                <input type="text" className="admin-form-control" placeholder="Nama Pelanggan" value={formData.user_name} onChange={e => setFormData({ ...formData, user_name: e.target.value })} />
                            </div>
                            <div className="admin-form-group">
                                <label>Total Nilai (Rp)</label>
                                <input type="number" className="admin-form-control" placeholder="Contoh: 250000" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                            </div>
                            <div className="admin-form-group">
                                <label>Status Pembayaran</label>
                                <select className="admin-form-control" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="Pending">Pending</option>
                                    <option value="Success">Success</option>
                                    <option value="Failed">Failed</option>
                                </select>
                            </div>
                            <div className="admin-form-group">
                                <label>Progress Pengiriman</label>
                                <select className="admin-form-control" value={formData.delivery_status} onChange={e => setFormData({ ...formData, delivery_status: e.target.value })}>
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                </select>
                            </div>
                            <div className="admin-form-group">
                                <label>Metode Pembayaran</label>
                                <input type="text" className="admin-form-control" placeholder="Manual, Transfer BCA, dll" value={formData.method} onChange={e => setFormData({ ...formData, method: e.target.value })} />
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
                .maybeSingle();

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
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchInitial = async () => {
            const { data } = await supabase.from('products').select('*');
            if (data) setProducts(data);
        };
        fetchInitial();
    }, []);

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
