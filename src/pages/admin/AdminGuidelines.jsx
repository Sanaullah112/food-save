import { useEffect, useState } from 'react'
import API from '../../utils/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'
import { Trash2, Edit3, ShieldCheck, Search, PlusCircle, XCircle, RefreshCw, Save } from 'lucide-react'

export default function AdminGuidelines() {
  const [guidelines, setGuidelines] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  // Form State (Handles both Add new and Edit update processing blocks)
  const [formData, setFormData] = useState({ title: '', content: '', status: 'active' })
  const [editingId, setEditingId] = useState(null)

  const fetchGuidelines = async () => {
    try {
      const { data } = await API.get('/admin/guidelines')
      setGuidelines(data)
    } catch {
      toast.error('Failed to load safety guidelines')
    }
    setLoading(false)
  }

  useEffect(() => { fetchGuidelines() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await API.put(`/admin/guidelines/${editingId}`, formData)
        toast.success('Guideline updated successfully')
      } else {
        await API.post('/admin/guidelines', formData)
        toast.success('New safety guideline added')
      }
      clearForm()
      fetchGuidelines()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    }
  }

  const handleEditClick = (g) => {
    setEditingId(g._id)
    setFormData({ title: g.title, content: g.content, status: g.status })
  }

  const handleToggleStatus = async (g) => {
    const nextStatus = g.status === 'active' ? 'deactive' : 'active'
    try {
      await API.put(`/admin/guidelines/${g._id}`, { ...g, status: nextStatus })
      toast.success(`Guideline marked ${nextStatus}`)
      fetchGuidelines()
    } catch {
      toast.error('Failed to switch status status')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolute certain you want to remove this guideline entry?')) return
    try {
      await API.delete(`/admin/guidelines/${id}`)
      toast.success('Guideline entry removed')
      fetchGuidelines()
    } catch {
      toast.error('Failed to delete guideline')
    }
  }

  const clearForm = () => {
    setEditingId(null)
    setFormData({ title: '', content: '', status: 'active' })
  }

  // Live filter query matching
  const filteredGuidelines = guidelines.filter(g => 
    g.title.toLowerCase().includes(search.toLowerCase()) || 
    g.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      
      <style>{`
        @keyframes slideIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .anim{animation:slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both}
        .form-card{background:white;border-radius:18px;border:1px solid #D8E2F0;padding:24px;box-shadow:0 10px 25px rgba(27,58,107,0.03)}
        .inp-field{width:100%;padding:11px 14px;border:2px solid #E2E8F0;border-radius:10px;font-family:inherit;font-size:13px;outline:none;transition:all 0.2s;box-sizing:border-box}
        .inp-field:focus{border-color:#1B3A6B;box-shadow:0 0 0 3px rgba(27,58,107,0.05)}
        .action-icon{padding:7px;border-radius:8px;cursor:pointer;transition:all 0.2s;display:inline-flex;border:1px solid transparent}
        .act-edit{color:#1B3A6B;background:#EEF3FB;border-color:#D2E0F5}
        .act-edit:hover{background:#1B3A6B;color:white}
        .act-del{color:#DC2626;background:#FEF2F2;border-color:#FECACA}
        .act-del:hover{background:#DC2626;color:white}
        .badge-status{cursor:pointer;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;display:inline-flex;align-items:center;gap:4px;transition:transform 0.15s ease}
        .badge-status:hover{transform:scale(1.04)}
      `}</style>

      <Navbar />

      <div style={{ maxWidth: 1250, margin: '0 auto', padding: '40px 24px' }}>
        
        {/* Layout Split System */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="anim">
          
          {/* TOP OR LEFT BLOCK: Form Entry Module */}
          <div className="form-card">
            <h1 style={{ fontFamily: 'Fraunces,serif', fontSize: 24, fontWeight: 800, color: '#0F1C35', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck style={{ color: '#1B3A6B' }} /> 
              {editingId ? "Update Food Safety Guidelines" : "Add New Food Safety Guidelines"}
            </h1>
            <p style={{ fontSize: 13, color: '#8A96A8', marginBottom: 20 }}>Publish explicit regulatory safety standards for food source checking and operations.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4A5568', marginBottom: 6 }}>Guideline Main Title</label>
                <input required placeholder="e.g., Temperature storage regulations for fresh dairy" className="inp-field" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4A5568', marginBottom: 6 }}>Content & Instructions Detailed Summary</label>
                <textarea required rows={4} placeholder="Write out all safety rules, packaging methods, and handling laws here..." className="inp-field" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} style={{ resize: 'vertical' }} />
              </div>

              <div style={{ width: '200px' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4A5568', marginBottom: 6 }}>Visibility Status</label>
                <select className="inp-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ background: 'white' }}>
                  <option value="active">Active (Visible on Front Page)</option>
                  <option value="deactive">Deactive (Hidden)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="submit" style={{ background: 'linear-gradient(135deg,#1B3A6B,#2A52A0)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', boxShadow: '0 4px 12px rgba(27,58,107,0.15)' }}>
                  {editingId ? <Save size={15}/> : <PlusCircle size={15}/>} {editingId ? "Update Record" : "Publish Guidelines"}
                </button>
                
                {editingId && (
                  <button type="button" onClick={clearForm} style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* LOWER OR RIGHT BLOCK: Guidelines Dynamic List Grid */}
          <div style={{ background: 'white', borderRadius: 18, border: '1px solid #D8E2F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(27,58,107,0.03)' }}>
            
            {/* Control Filtering System Line */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#0F1C35' }}>Registered Rule Repository ({filteredGuidelines.length})</span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'white', border: '2px solid #E2E8F0', borderRadius: 8, padding: '6px 12px' }}>
                  <Search size={14} style={{ color: '#8A96A8' }} />
                  <input placeholder="Search guidelines title..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 13, width: 200, fontFamily: 'inherit' }} />
                </div>
                {search && (
                  <button onClick={() => setSearch('')} style={{ border: 'none', background: '#E2E8F0', color: '#4A5568', fontSize: 11, fontWeight: 700, padding: '8px 12px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <RefreshCw size={11} /> Clear Filter
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#8A96A8' }}>Loading criteria configuration guidelines...</div>
            ) : filteredGuidelines.length === 0 ? (
              <div style={{ padding: '50px 24px', textAlign: 'center', color: '#8A96A8' }}>
                <XCircle size={36} style={{ margin: '0 auto 10px', color: '#CBD5E1' }} />
                <p style={{ fontWeight: 600, color: '#4A5568' }}>No data records located matching criteria</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#8A96A8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '14px 20px' }}>Guideline Information</th>
                      <th style={{ padding: '14px 20px' }}>Status Toggle</th>
                      <th style={{ padding: '14px 20px' }}>Created Date</th>
                      <th style={{ padding: '14px 20px' }}>Last Updated</th>
                      <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGuidelines.map(g => (
                      <tr key={g._id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'all 0.2s' }}>
                        <td style={{ padding: '16px 20px', maxWidth: '350px' }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#0F1C35', marginBottom: 4 }}>{g.title}</div>
                          <div style={{ fontSize: 12, color: '#64748B', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>{g.content}</div>
                        </td>
                        
                        <td style={{ padding: '16px 20px' }}>
                          {g.status === 'active' ? (
                            <span className="badge-status" onClick={() => handleToggleStatus(g)} style={{ background: '#DCFCE7', color: '#15803D' }}>
                              ● Active
                            </span>
                          ) : (
                            <span className="badge-status" onClick={() => handleToggleStatus(g)} style={{ background: '#F1F5F9', color: '#64748B' }}>
                              ○ Deactive
                            </span>
                          )}
                        </td>
                        
                        <td style={{ padding: '16px 20px', fontSize: 12, color: '#64748B' }}>
                          {new Date(g.createdAt).toLocaleDateString()} <span style={{ fontSize: 10, color: '#94A3B8' }}>{new Date(g.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>

                        <td style={{ padding: '16px 20px', fontSize: 12, color: '#64748B' }}>
                          {new Date(g.updatedAt).toLocaleDateString()} <span style={{ fontSize: 10, color: '#94A3B8' }}>{new Date(g.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>

                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button className="action-icon act-edit" title="Edit Guideline" onClick={() => handleEditClick(g)}><Edit3 size={14} /></button>
                            <button className="action-icon act-del" title="Delete Permanent" onClick={() => handleDelete(g._id)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}