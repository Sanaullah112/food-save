import { useEffect, useState } from 'react'
import API from '../../utils/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'
import { Trash2, Users, Search, UserPlus, X, ChevronDown, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', phone: '', password: '', role: 'donor', status: 'Active' })
  
  // Dropdown states for changing status row-by-row
  const [activeStatusDropdown, setActiveStatusDropdown] = useState(null)

  const fetchUsers = async () => {
    try { 
      const { data } = await API.get('/admin/users')
      setUsers(data) 
    } catch { 
      toast.error('Failed to load users') 
    }
    setLoading(false)
  }

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try { 
      await API.delete(`/admin/users/${id}`)
      toast.success('User deleted')
      fetchUsers() 
    } catch { 
      toast.error('Failed to delete') 
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      await API.post('/admin/users', newUser)
      toast.success('User registered successfully!')
      setShowAddModal(false)
      setNewUser({ name: '', phone: '', password: '', role: 'donor', status: 'Active' })
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user')
    }
  }

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await API.put(`/admin/users/${userId}/status`, { status: newStatus })
      toast.success(`Status updated to ${newStatus}`)
      setActiveStatusDropdown(null)
      fetchUsers()
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const roleBadge = (role) => {
    const m = { admin: { bg: '#EDE9FE', c: '#7C3AED' }, donor: { bg: '#DCFCE7', c: '#15803D' }, ngo: { bg: '#DBEAFE', c: '#1D4ED8' }, driver: { bg: '#FEF9C3', c: '#A16207' } }
    const x = m[role] || m.donor
    return <span style={{ background: x.bg, color: x.c, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{role.toUpperCase()}</span>
  }

  const statusBadge = (status) => {
    const s = {
      Active: { bg: '#E0F2FE', c: '#0369A1', icon: <CheckCircle2 size={12} /> },
      Suspend: { bg: '#FEF3C7', c: '#B45309', icon: <AlertTriangle size={12} /> },
      Reject: { bg: '#FEE2E2', c: '#B91C1C', icon: <XCircle size={12} /> }
    }
    const x = s[status] || s.Active
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: x.bg, color: x.c, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
        {x.icon} {status}
      </span>
    )
  }

  const filtered = users.filter(u => {
    const matchRole = filter ? u.role === filter : true
    const matchSearch = search ? u.name?.toLowerCase().includes(search.toLowerCase()) || u.phone?.toLowerCase().includes(search.toLowerCase()) : true
    return matchRole && matchSearch
  })

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}
        .au{animation:fadeUp 0.4s ease both;opacity:0}.d1{animation-delay:.05s}.d2{animation-delay:.1s}
        .trow{transition:background 0.2s ease}
        .trow:hover{background:#F8FAFC!important}
        .trow:hover td{background:transparent!important}
        .del-ic{color:#DC2626;background:#FEF2F2;border:1px solid #FECACA;padding:6px;border-radius:8px;cursor:pointer;transition:all 0.2s;display:inline-flex}
        .del-ic:hover{background:#DC2626;color:white;transform:scale(1.05)}
        .status-btn{display:inline-flex;alignItems:center;gap:4;background:#F1F5F9;border:1px solid #E2E8F0;padding:5px 10px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;color:#475569;transition:all 0.2s}
        .status-btn:hover{background:#E2E8F0}
        .fpill{padding:7px 16px;border-radius:20px;font-size:13px;font-weight:600;border:2px solid #D8E2F0;background:white;color:#4A5568;cursor:pointer;font-family:inherit;transition:all 0.2s}
        .fpill:hover{border-color:#1B3A6B;color:#1B3A6B;background:#EEF3FB}
        .fpill.active{background:linear-gradient(135deg,#1B3A6B,#2A52A0);color:white;border-color:#1B3A6B}
        .srch:focus-within{border-color:#1B3A6B!important;box-shadow:0 0 0 3px rgba(27,58,107,0.08)!important}
        .add-btn{background:linear-gradient(135deg,#1B3A6B,#2A52A0);color:white;border:none;padding:10px 18px;border-radius:10px;font-weight:600;font-size:13px;display:flex;align-items:center;gap:6px;cursor:pointer;box-shadow:0 4px 12px rgba(27,58,107,0.15);transition:all 0.2s}
        .add-btn:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(27,58,107,0.25)}
        .modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,28,53,0.4);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:1000;animation:fadeUp 0.2s ease}
        .modal-card{background:white;border-radius:20px;width:100%;maxWidth:450px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);overflow:hidden;border:1px solid #E2E8F0}
        .form-input{width:100%;padding:10px 12px;border:2px solid #E2E8F0;border-radius:8px;font-family:inherit;font-size:13px;outline:none;transition:all 0.2s;box-sizing:border-box}
        .form-input:focus{border-color:#1B3A6B}
        .dropdown-menu{position:absolute;right:0;top:100%;marginTop:4px;background:white;border:1px solid #E2E8F0;border-radius:10px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);zIndex:50;width:130px;overflow:hidden;padding:4px}
        .dropdown-item{width:100%;padding:8px 12px;textAlign:left;background:none;border:none;fontSize:12px;fontWeight:600;cursor:pointer;display:flex;alignItems:center;gap:6px;borderRadius:6px;color:#334155}
        .dropdown-item:hover{background:#F1F5F9}
      `}</style>
      
      <Navbar />
      
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 28px' }}>

        {/* Header Block */}
        <div className="au d1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Fraunces,serif', fontSize: 30, fontWeight: 800, color: '#0F1C35', marginBottom: 4 }}>Manage Platform Users</h1>
            <p style={{ fontSize: 14, color: '#8A96A8' }}>{users.length} total system accounts registered</p>
          </div>
          
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            <UserPlus size={16} /> Add Donor / NGO
          </button>
        </div>

        {/* Filter Management Bar */}
        <div className="au d1" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20, justifyContent: 'space-between' }}>
          <div className="srch" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '2px solid #D8E2F0', borderRadius: 10, padding: '8px 14px', transition: 'all 0.2s' }}>
            <Search size={14} style={{ color: '#8A96A8' }} />
            <input placeholder="Search name or phone..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 13, color: '#0F1C35', background: 'transparent', width: 220 }} />
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {['', 'donor', 'ngo', 'driver', 'admin'].map(r => (
              <button key={r} className={`fpill ${filter === r ? 'active' : ''}`} onClick={() => setFilter(r)}>
                {r === '' ? 'All' : r.toUpperCase() + 's'}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table Grid Card */}
        <div className="au d2" style={{ background: 'white', borderRadius: 20, border: '1px solid #D8E2F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(27,58,107,0.05)' }}>
          <div style={{ height: 4, background: 'linear-gradient(90deg,#1B3A6B,#D4A017)' }} />

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#8A96A8' }}>Loading accounts...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px 32px', textAlign: 'center' }}>
              <Users size={48} style={{ color: '#D8E2F0', margin: '0 auto 14px', display: 'block' }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: '#4A5568', marginBottom: 6, fontFamily: 'Fraunces,serif' }}>No accounts matched</p>
              <p style={{ fontSize: 13, color: '#8A96A8' }}>Try adjusting your filters or search keywords</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F4F6FB', borderBottom: '1px solid #D8E2F0' }}>
                    {['User Profile', 'Phone Identity', 'Role Designation', 'System Status', 'Registered Date', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '14px 18px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#8A96A8' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u._id} className="trow" style={{ borderBottom: '1px solid #F4F6FB' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#1B3A6B,#2A52A0)', borderRadius: 10, display: 'flex', alignId: 'center', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                            {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#0F1C35' }}>{u.name}</span>
                        </div>
                      </td>
                      
                      <td style={{ padding: '14px 18px', fontSize: 13, color: '#4A5568' }}>{u.phone || '—'}</td>
                      <td style={{ padding: '14px 18px' }}>{roleBadge(u.role)}</td>
                      <td style={{ padding: '14px 18px' }}>{statusBadge(u.status || 'Active')}</td>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: '#8A96A8' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      
                      <td style={{ padding: '14px 18px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* Status Change Context Menu Trigger */}
                        <div style={{ position: 'relative' }}>
                          <button className="status-btn" onClick={() => setActiveStatusDropdown(activeStatusDropdown === u._id ? null : u._id)}>
                            Status <ChevronDown size={12} />
                          </button>
                          
                          {activeStatusDropdown === u._id && (
                            <div className="dropdown-menu">
                              <button className="dropdown-item" onClick={() => handleStatusChange(u._id, 'Active')} style={{ color: '#0369A1' }}><CheckCircle2 size={12} /> Active</button>
                              <button className="dropdown-item" onClick={() => handleStatusChange(u._id, 'Suspend')} style={{ color: '#B45309' }}><AlertTriangle size={12} /> Suspend</button>
                              <button className="dropdown-item" onClick={() => handleStatusChange(u._id, 'Reject')} style={{ color: '#B91C1C' }}><XCircle size={12} /> Reject</button>
                            </div>
                          )}
                        </div>

                        <button className="del-ic" onClick={() => deleteUser(u._id)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modern Creation Modal Popup */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
              <h3 style={{ margin: 0, fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 800, color: '#0F1C35' }}>Create Platform Account</h3>
              <X size={18} style={{ cursor: 'pointer', color: '#64748B' }} onClick={() => setShowAddModal(false)} />
            </div>

            <form onSubmit={handleCreateUser} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Full Account Name</label>
                <input required placeholder="e.g. Saylani Welfare or John Doe" className="form-input" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Contact Phone Number</label>
                <input required placeholder="e.g. +923xxxxxxxxx" className="form-input" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Secure Access Password</label>
                <input required type="password" placeholder="••••••••" className="form-input" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Platform Role</label>
                  <select className="form-input" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} style={{ appearance: 'none', background: 'white' }}>
                    <option value="donor">Donor</option>
                    <option value="ngo">NGO Node</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Initial Status</label>
                  <select className="form-input" value={newUser.status} onChange={e => setNewUser({ ...newUser, status: e.target.value })} style={{ appearance: 'none', background: 'white' }}>
                    <option value="Active">Active</option>
                    <option value="Suspend">Suspend</option>
                    <option value="Reject">Reject</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="add-btn" style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: 12 }}>
                Register Account Setup
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}