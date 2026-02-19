import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Building2, Save, Plus, Trash2, Check, Edit3, Briefcase, Camera, Loader2, Phone, Mail } from 'lucide-react';

const SECTORS = ['Manufacturing', 'Service', 'Retail', 'Agriculture', 'Technology', 'Healthcare', 'Education', 'Finance', 'IT/Software', 'Construction', 'Logistics', 'Food & Beverage'];
const BUSINESS_TYPES = ['Proprietorship', 'Partnership', 'Private Limited', 'LLP', 'OPC (One Person Company)', 'Hindu Undivided Family', 'Trust'];
const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

const emptyBusiness = { business_name: '', sector: '', business_type: '', state: '', gstin: '', udyam: '' };

export default function Profile() {
    const { user, profile, setProfile, saveProfile } = useAppContext();
    const photoInputRef = useRef(null);

    // User info editing
    const [editingUser, setEditingUser] = useState(false);
    const [userForm, setUserForm] = useState({
        display_name: profile?.display_name || user?.displayName || '',
        phone: profile?.phone || '',
    });
    const [savingUser, setSavingUser] = useState(false);

    // Multi-business state
    const [businesses, setBusinesses] = useState(() => {
        if (profile?.businesses && profile.businesses.length > 0) return profile.businesses;
        if (profile?.business_name) return [{ business_name: profile.business_name, sector: profile.sector || '', business_type: profile.business_type || '', state: profile.state || '', gstin: profile.gstin || '', udyam: profile.udyam || '' }];
        return [{ ...emptyBusiness }];
    });
    const [activeBizIndex, setActiveBizIndex] = useState(0);
    const [editingIndex, setEditingIndex] = useState(null);
    const [formData, setFormData] = useState({ ...emptyBusiness });
    const [showAddForm, setShowAddForm] = useState(false);
    const [savingBiz, setSavingBiz] = useState(false);

    if (!user) return <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>Please sign in to view profile.</div>;

    // ─── User Info Handlers ───
    const handleSaveUser = async () => {
        setSavingUser(true);
        try {
            await saveProfile({
                display_name: userForm.display_name,
                phone: userForm.phone,
            });
            setEditingUser(false);
        } catch (e) {
            console.error(e);
        } finally {
            setSavingUser(false);
        }
    };

    const handlePhotoClick = () => {
        photoInputRef.current?.click();
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Convert to base64 for storage (small profile photos)
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const base64 = ev.target.result;
            try {
                await saveProfile({ photo_url: base64 });
            } catch (err) {
                console.error(err);
            }
        };
        reader.readAsDataURL(file);
    };

    // ─── Business Handlers ───
    const handleEdit = (index) => {
        setEditingIndex(index);
        setFormData({ ...businesses[index] });
        setShowAddForm(false);
    };

    const handleSave = async () => {
        if (editingIndex === null) return;
        setSavingBiz(true);
        const updated = [...businesses];
        updated[editingIndex] = { ...formData };
        setBusinesses(updated);
        try {
            await saveProfile({ businesses: updated, business_name: updated[activeBizIndex]?.business_name || '' });
        } catch (e) {
            console.error(e);
        }
        setEditingIndex(null);
        setSavingBiz(false);
    };

    const handleAddNew = () => {
        setShowAddForm(true);
        setEditingIndex(null);
        setFormData({ ...emptyBusiness });
    };

    const handleSaveNew = async () => {
        setSavingBiz(true);
        const updated = [...businesses, { ...formData }];
        setBusinesses(updated);
        try {
            await saveProfile({ businesses: updated, business_name: updated[activeBizIndex]?.business_name || '' });
        } catch (e) {
            console.error(e);
        }
        setShowAddForm(false);
        setFormData({ ...emptyBusiness });
        setSavingBiz(false);
    };

    const handleDelete = async (index) => {
        if (businesses.length <= 1) return;
        const updated = businesses.filter((_, i) => i !== index);
        setBusinesses(updated);
        const newActive = activeBizIndex >= updated.length ? updated.length - 1 : activeBizIndex;
        setActiveBizIndex(newActive);
        try {
            await saveProfile({ businesses: updated, business_name: updated[newActive]?.business_name || '' });
        } catch (e) {
            console.error(e);
        }
        if (editingIndex === index) setEditingIndex(null);
    };

    const switchBusiness = async (index) => {
        setActiveBizIndex(index);
        try {
            await saveProfile({ business_name: businesses[index]?.business_name || '' });
        } catch (e) {
            console.error(e);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const profilePhoto = profile?.photo_url || null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* ═══ USER INFO CARD ═══ */}
            <div className="card p-6" style={{ border: '1px solid var(--border)' }}>
                <div className="flex items-start gap-5">
                    {/* Photo */}
                    <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                        {profilePhoto ? (
                            <img src={profilePhoto} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2"
                                style={{ borderColor: 'var(--accent)' }} />
                        ) : (
                            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                                style={{ background: 'linear-gradient(135deg, var(--accent), var(--purple))' }}>
                                {user.displayName ? user.displayName[0] : 'U'}
                            </div>
                        )}
                        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={20} className="text-white" />
                        </div>
                        <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        {editingUser ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Display Name</label>
                                    <input type="text" className="input w-full" value={userForm.display_name}
                                        onChange={e => setUserForm({ ...userForm, display_name: e.target.value })}
                                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Phone Number</label>
                                    <input type="tel" className="input w-full" value={userForm.phone} placeholder="+91 XXXXX XXXXX"
                                        onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
                                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingUser(false)} className="btn btn-secondary btn-sm">Cancel</button>
                                    <button onClick={handleSaveUser} disabled={savingUser} className="btn btn-primary btn-sm gap-1.5">
                                        {savingUser ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-2xl font-bold truncate" style={{ color: 'var(--text)' }}>
                                        {profile?.display_name || user.displayName}
                                    </h1>
                                    <button onClick={() => setEditingUser(true)} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--text-tertiary)' }}>
                                        <Edit3 size={14} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                    <span className="flex items-center gap-1.5"><Mail size={14} /> {user.email}</span>
                                    {profile?.phone && <span className="flex items-center gap-1.5"><Phone size={14} /> {profile.phone}</span>}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ ACTIVE BUSINESS BANNER ═══ */}
            <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: 'var(--accent-light)' }}>
                <div className="flex items-center gap-3">
                    <Building2 size={20} style={{ color: 'var(--accent)' }} />
                    <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>Active Business</p>
                        <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                            {businesses[activeBizIndex]?.business_name || 'No business selected'}
                        </p>
                    </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'var(--accent)', color: 'white' }}>
                    {businesses.length} {businesses.length === 1 ? 'Business' : 'Businesses'}
                </span>
            </div>

            {/* ═══ BUSINESS CARDS ═══ */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                        <Briefcase size={20} style={{ color: 'var(--accent)' }} /> Your Businesses
                    </h2>
                    <button onClick={handleAddNew} className="btn btn-primary btn-sm gap-1.5">
                        <Plus size={14} /> Add Business
                    </button>
                </div>

                {businesses.map((biz, idx) => (
                    <div key={idx} className="card p-5 transition-all"
                        style={{
                            border: activeBizIndex === idx ? '2px solid var(--accent)' : '1px solid var(--border)',
                            background: activeBizIndex === idx ? 'var(--accent-light)' : 'var(--bg-secondary)'
                        }}>
                        {editingIndex === idx ? (
                            <div>
                                <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--text)' }}>Editing: {biz.business_name || 'New Business'}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Business Name *</label>
                                        <input type="text" name="business_name" className="input w-full" value={formData.business_name} onChange={handleChange}
                                            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Sector</label>
                                        <select name="sector" className="input w-full" value={formData.sector} onChange={handleChange}
                                            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                                            <option value="">Select Sector</option>
                                            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Business Type</label>
                                        <select name="business_type" className="input w-full" value={formData.business_type} onChange={handleChange}
                                            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                                            <option value="">Select Type</option>
                                            {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>State</label>
                                        <select name="state" className="input w-full" value={formData.state} onChange={handleChange}
                                            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                                            <option value="">Select State</option>
                                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>GSTIN (optional)</label>
                                        <input type="text" name="gstin" className="input w-full" value={formData.gstin} onChange={handleChange} placeholder="e.g. 36AABCU9603R1ZM"
                                            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Udyam No (optional)</label>
                                        <input type="text" name="udyam" className="input w-full" value={formData.udyam} onChange={handleChange} placeholder="e.g. UDYAM-XX-00-0000000"
                                            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4 justify-end">
                                    <button onClick={() => setEditingIndex(null)} className="btn btn-secondary btn-sm">Cancel</button>
                                    <button onClick={handleSave} disabled={savingBiz} className="btn btn-primary btn-sm gap-1.5">
                                        {savingBiz ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ background: activeBizIndex === idx ? 'var(--accent)' : 'var(--bg-tertiary)', color: activeBizIndex === idx ? 'white' : 'var(--text-secondary)' }}>
                                        <Building2 size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-sm truncate" style={{ color: 'var(--text)' }}>
                                            {biz.business_name || 'Unnamed Business'}
                                        </h3>
                                        <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                                            {[biz.sector, biz.business_type, biz.state].filter(Boolean).join(' • ') || 'No details yet'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                    {activeBizIndex !== idx && (
                                        <button onClick={() => switchBusiness(idx)} className="btn btn-ghost btn-sm text-xs gap-1" style={{ color: 'var(--accent)' }}>
                                            <Check size={12} /> Switch
                                        </button>
                                    )}
                                    {activeBizIndex === idx && (
                                        <span className="text-xs px-2 py-1 rounded font-medium" style={{ background: 'var(--accent)', color: 'white' }}>Active</span>
                                    )}
                                    <button onClick={() => handleEdit(idx)} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--text-secondary)' }}>
                                        <Edit3 size={14} />
                                    </button>
                                    {businesses.length > 1 && (
                                        <button onClick={() => handleDelete(idx)} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--red)' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ═══ ADD NEW BUSINESS FORM ═══ */}
            {showAddForm && (
                <div className="card p-6" style={{ border: '2px dashed var(--accent)', background: 'var(--bg-secondary)' }}>
                    <h3 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                        <Plus size={16} style={{ color: 'var(--accent)' }} /> Add New Business
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Business Name *</label>
                            <input type="text" name="business_name" className="input w-full" value={formData.business_name} onChange={handleChange} placeholder="Enter business name"
                                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Sector</label>
                            <select name="sector" className="input w-full" value={formData.sector} onChange={handleChange}
                                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                                <option value="">Select Sector</option>
                                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Business Type</label>
                            <select name="business_type" className="input w-full" value={formData.business_type} onChange={handleChange}
                                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                                <option value="">Select Type</option>
                                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>State</label>
                            <select name="state" className="input w-full" value={formData.state} onChange={handleChange}
                                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                                <option value="">Select State</option>
                                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4 justify-end">
                        <button onClick={() => setShowAddForm(false)} className="btn btn-secondary btn-sm">Cancel</button>
                        <button onClick={handleSaveNew} disabled={!formData.business_name || savingBiz} className="btn btn-primary btn-sm gap-1.5">
                            {savingBiz ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add Business
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
