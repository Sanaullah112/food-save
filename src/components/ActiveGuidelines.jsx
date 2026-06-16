import { useEffect, useState } from 'react'
import API from '../utils/api'
import Navbar from '../components/Navbar'
import { ShieldCheck, Calendar, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

export default function ActiveGuidelines() {
  const [guidelines, setGuidelines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActiveGuidelines = async () => {
      try {
        const { data } = await API.get('/auth/guidelines')
        setGuidelines(data)
      } catch (err) {
        console.error('Failed to load safety rules:', err)
      }
      setLoading(false)
    }
    fetchActiveGuidelines()
  }, [])

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '80px 20px', textAlign: 'center', color: '#8A96A8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <div style={{ width: 30, height: 30, border: '3px solid #E2E8F0', borderTopColor: '#1B3A6B', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: 14, fontWeight: 500 }}>Loading food safety guidelines...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </>
    )
  }

  if (guidelines.length === 0) return (
    <>
      <Navbar />
      <div style={{ padding: '80px 20px', textAlign: 'center', color: '#94A3B8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <ShieldCheck size={40} style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }} />
        <p style={{ fontSize: 15, fontWeight: 600, color: '#64748B' }}>No active guidelines right now</p>
        <p style={{ fontSize: 13, marginTop: 4 }}>Check back later — the admin will publish safety rules here.</p>
      </div>
    </>
  )

  return (
    <>
      <Navbar />
      <section style={{ padding: '60px 24px', background: '#F8FAFC', fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100vh' }}>
        <style>{`
          .g-card {
            background: white;
            border-radius: 16px;
            border: 1px solid #E2E8F0;
            padding: 24px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
            transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
            position: relative;
            overflow: hidden;
          }
          .g-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 20px -3px rgba(27,58,107,0.08);
            border-color: #D2E0F5;
          }
          .g-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0;
            width: 4px; height: 100%;
            background: linear-gradient(to bottom, #1B3A6B, #2A52A0);
          }
          .g-card.inactive::before {
            background: linear-gradient(to bottom, #94A3B8, #CBD5E1);
          }
          .g-card.inactive {
            opacity: 0.72;
          }
          .grid-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 24px;
            max-width: 1200px;
            margin: 0 auto;
          }
          .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }
          .status-active {
            background: #DCFCE7;
            color: #15803D;
            border: 1px solid #BBF7D0;
          }
          .status-inactive {
            background: #F1F5F9;
            color: #64748B;
            border: 1px solid #E2E8F0;
          }
        `}</style>

        {/* Header */}
        <div style={{ maxWidth: 1200, margin: '0 auto 36px', textAlign: 'center' }}>
          <span style={{ background: '#EEF3FB', color: '#1B3A6B', fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Donor & NGO Standards
          </span>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 800, color: '#0F1C35', marginTop: 12, marginBottom: 8 }}>
            Food Safety & Handling Guidelines
          </h2>
          <p style={{ fontSize: 15, color: '#64748B', maxWidth: 600, margin: '0 auto' }}>
            All platform food donations and rescue routing must follow these quality compliance rules.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid-container">
          {guidelines.map((g) => {
            const isActive = g.isActive !== false // treat missing field as active
            return (
              <div key={g._id} className={`g-card ${isActive ? '' : 'inactive'}`}>

                {/* Top row: icon + title + status badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ background: isActive ? '#EEF3FB' : '#F1F5F9', color: isActive ? '#1B3A6B' : '#94A3B8', padding: 10, borderRadius: 12, display: 'inline-flex', flexShrink: 0 }}>
                      <ShieldCheck size={20} />
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0F1C35', margin: 0, marginTop: 6, lineHeight: 1.3 }}>
                      {g.title}
                    </h3>
                  </div>

                  {/* ── STATUS BADGE ── */}
                  <div className={`status-badge ${isActive ? 'status-active' : 'status-inactive'}`} style={{ flexShrink: 0, marginTop: 4 }}>
                    {isActive
                      ? <><CheckCircle size={11} /> Active</>
                      : <><XCircle size={11} /> Inactive</>
                    }
                  </div>
                </div>

                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: 20 }}>
                  {g.content}
                </p>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderTop: '1px solid #F1F5F9', paddingTop: 14, fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={13} />
                    {new Date(g.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} /> Updated recently
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Notice bar */}
        <div style={{ maxWidth: 1200, margin: '32px auto 0', background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertCircle size={18} style={{ color: '#D97706', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 13, color: '#B45309', fontWeight: 500, lineHeight: 1.4 }}>
            <strong>Notice to Donors:</strong> If your donation requires specialized refrigeration, please check the dashboard settings or contact your designated NGO node driver directly before packaging.
          </p>
        </div>
      </section>
    </>
  )
}