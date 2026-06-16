import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, Bell, ChevronLeft, ChevronRight, Home } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const isActive = (p) => location.pathname === p

  const linkCls = (p) => ({
    fontSize: 14, 
    fontWeight: 600, 
    textDecoration: 'none', 
    paddingBottom: 3,
    borderBottom: isActive(p) ? '2px solid #D4A017' : '2px solid transparent',
    color: isActive(p) ? '#D4A017' : '#4A5568',
    transition: 'all 0.2s',
  })

  const currentUserRole = user?.role?.toLowerCase()

  return (
    <nav style={{ background: 'white', borderBottom: '1px solid #D8E2F0', position: 'sticky', top: 0, zIndex: 100, padding: '0 24px', boxShadow: '0 2px 16px rgba(27,58,107,0.07)' }}>
      <style>{`
        .nb-link:hover{color:#1B3A6B!important;border-bottom-color:#1B3A6B!important}
        .nb-ghost{padding:8px 14px;border-radius:8px;font-size:13px;font-weight:600;color:#4A5568;background:none;border:none;cursor:pointer;font-family:inherit;transition:all 0.2s;display:inline-flex;align-items:center;gap:6px;text-decoration:none}
        .nb-ghost:hover{background:#EEF3FB;color:#1B3A6B;transform:translateY(-1px)}
        .nb-icon{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:#F4F6FB;border:1px solid #D8E2F0;cursor:pointer;transition:all 0.2s;color:#4A5568;flex-shrink:0}
        .nb-icon:hover{background:#EEF3FB;color:#1B3A6B;border-color:#1B3A6B;transform:translateY(-1px)}
        .nb-cta{background:linear-gradient(135deg,#D4A017,#F0C040);color:#0F1C35;border:none;padding:9px 20px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.25s;box-shadow:0 3px 10px rgba(212,160,23,0.35);text-decoration:none;display:inline-flex;align-items:center;gap:6px}
        .nb-cta:hover{transform:translateY(-2px) scale(1.04);box-shadow:0 6px 18px rgba(212,160,23,0.5)}
        
        /* Fixed Toggle Display Property */
        .nb-toggle{display:none;width:40px;height:40px;border-radius:12px;border:1px solid #D8E2F0;background:#F4F6FB;color:#1B3A6B;font-size:20px;font-weight:700;cursor:pointer;align-items:center;justify-content:center;flex-shrink:0;pointer-events:auto;position:relative;z-index:101}
        .nb-links{display:flex;align-items:center;gap:22px}
        
        /* Absolute positioned mobile drawer menu */
        .nb-menu{display:none;position:absolute;left:0;right:0;top:100%;flex-direction:column;gap:16px;padding:20px 24px 24px;background:white;border-top:1px solid #E5E7EB;box-shadow:0 16px 40px rgba(15,28,53,0.08);z-index:99;border-radius:0 0 16px 16px;pointer-events:auto}
        .nb-menu.open{display:flex!important;pointer-events:auto}
        .nb-menu .nb-link{display:block;padding:12px 0;border-bottom:1px solid #F3F4F6;color:#4A5568;text-decoration:none;font-size:15px;font-weight:600}
        .nb-mobile-actions{display:flex;flex-direction:column;gap:10px;margin-top:12px}
        
        /* Medium Screens - Hide regular layout and show toggle */
        @media(max-width: 1024px){
          .nb-links { display: none !important; }
          .nb-right { display: none !important; }
          .nb-toggle { display: flex !important; }
        }
        
        /* Small Screens - Optimize spacing and alignment */
        @media(max-width: 640px) {
          nav { padding: 0 16px !important; overflow: visible !important; }
          .nb-left .nb-icon, 
          .nb-left div[style*="width:1"] { 
            display: none !important; 
          }
          .nb-left { 
            width: 100% !important; 
            justify-content: space-between !important;
            pointer-events: auto !important;
          }
          .nb-toggle { pointer-events: auto !important; }
          .nb-menu { padding: 16px 16px 20px; pointer-events: auto !important; }
          .nb-cta, .nb-ghost { width: 100%; justify-content: center; }
        }
      `}</style>
      
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62 }}>

        {/* Left Section containing branding and control elements */}
        <div className="nb-left" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button className="nb-icon" onClick={() => navigate(-1)} title="Back"><ChevronLeft size={16}/></button>
          <button className="nb-icon" onClick={() => navigate(1)} title="Forward"><ChevronRight size={16}/></button>
          <Link to="/" className="nb-icon" title="Home" style={{ textDecoration: 'none' }}><Home size={16}/></Link>
          <div style={{ width: 1, height: 22, background: '#D8E2F0', margin: '0 6px' }}/>
          <Link to="/" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#1B3A6B,#2A52A0)', borderRadius: 9, display: 'flex', alignItems: 'center', justify: 'center', fontSize: 17, boxShadow: '0 3px 10px rgba(27,58,107,0.3)', flexShrink: 0 }}>🌾</div>
            <span style={{ fontFamily: 'Fraunces,serif', fontSize: 19, fontWeight: 800, background: 'linear-gradient(135deg,#1B3A6B,#D4A017)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FoodSave</span>
          </Link>
          <button className="nb-toggle" onClick={() => setMenuOpen((prev) => !prev)} aria-label="Toggle menu">{menuOpen ? '✕' : '☰'}</button>
        </div>

        {/* Desktop Links (Hidden on small viewports) */}
        <div className="nb-links">
          {/* General routes visible when no dashboard role is active */}
          {!currentUserRole && <>
            <Link to="/browse" className="nb-link" style={linkCls('/browse')}>Browse Food</Link>
            <Link to="/how-it-works" className="nb-link" style={linkCls('/how-it-works')}>How it works</Link>
          </>}

          {currentUserRole === 'donor' && <>
            <Link to="/donor" className="nb-link" style={linkCls('/donor')}>Dashboard</Link>
            <Link to="/donor/add" className="nb-link" style={linkCls('/donor/add')}>Add Food</Link>
            <Link to="/donor/requests" className="nb-link" style={linkCls('/donor/requests')}>Requests</Link>
            <Link to="/donor/gdl" className="nb-link" style={linkCls('/donor/gdl')}>Admin GDL</Link>
          </>}
          {currentUserRole === 'ngo' && <>
            <Link to="/ngo" className="nb-link" style={linkCls('/ngo')}>Browse Food</Link>
            <Link to="/ngo/requests" className="nb-link" style={linkCls('/ngo/requests')}>My Requests</Link>
            <Link to="/ngo/feedback" className="nb-link" style={linkCls('/ngo/feedback')}>Feedback</Link>
            <Link to="/ngo/register-driver" className="nb-link" style={linkCls('/ngo/register-driver')}>DriverRG</Link>
            <Link to="/ngo/assign-pickups" className="nb-link" style={linkCls('/ngo/assign-pickups')}>Delivery</Link>
          </>}
          {currentUserRole === 'driver' && <Link to="/driver" className="nb-link" style={linkCls('/driver')}>My Deliveries</Link>}
          {currentUserRole === 'admin' && <>
            <Link to="/admin" className="nb-link" style={linkCls('/admin')}>Dashboard</Link>
            <Link to="/admin/users" className="nb-link" style={linkCls('/admin/users')}>Users</Link>
            <Link to="/admin/requests" className="nb-link" style={linkCls('/admin/requests')}>Requests</Link>
            <Link to="/admin/reports" className="nb-link" style={linkCls('/admin/reports')}>Reports</Link>
            <Link to="/admin/settings" className="nb-link" style={linkCls('/admin/settings')}>Settings</Link>
          </>}
        </div>

        {/* Desktop Profile Status (Hidden on small viewports) */}
        <div className="nb-right" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user && <Link to="/notifications" style={{ position: 'relative', textDecoration: 'none' }} className="nb-icon">
            <Bell size={16}/>
            <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, background: '#EF4444', borderRadius: '50%', border: '1.5px solid white' }}/>
          </Link>}
          {user && <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F4F6FB', border: '1px solid #D8E2F0', padding: '5px 12px 5px 6px', borderRadius: 10 }}>
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#1B3A6B,#2A52A0)', borderRadius: 8, display: 'flex', alignItems: 'center', justify: 'center', fontSize: 12, fontWeight: 800, color: 'white' }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0F1C35' }}>{user.name?.split(' ')[0]}</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#EEF3FB', color: '#1B3A6B' }}>{user.role}</span>
          </div>}
          {user
            ? <button onClick={() => { logout(); navigate('/login') }} className="nb-ghost"><LogOut size={14}/>Logout</button>
            : <Link to="/login" className="nb-cta">Login</Link>
          }
        </div>
      </div>

      {/* Mobile Context-Aware Dropdown Menu */}
      <div className={`nb-menu ${menuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Default view on Home page when no roles match */}
          {!currentUserRole && <>
            <Link to="/browse" className="nb-link" onClick={() => setMenuOpen(false)}>Browse Food</Link>
            <Link to="/how-it-works" className="nb-link" onClick={() => setMenuOpen(false)}>How it works</Link>
          </>}

          {currentUserRole === 'donor' && <>
            <Link to="/donor" className="nb-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/donor/add" className="nb-link" onClick={() => setMenuOpen(false)}>Add Food</Link>
            <Link to="/donor/requests" className="nb-link" onClick={() => setMenuOpen(false)}>Requests</Link>
            <Link to="/donor/gdl" className="nb-link" onClick={() => setMenuOpen(false)}>Admin GDL</Link>
          </>}
          {currentUserRole === 'ngo' && <>
            <Link to="/ngo" className="nb-link" onClick={() => setMenuOpen(false)}>Browse Food</Link>
            <Link to="/ngo/requests" className="nb-link" onClick={() => setMenuOpen(false)}>My Requests</Link>
            <Link to="/ngo/feedback" className="nb-link" onClick={() => setMenuOpen(false)}>Feedback</Link>
            <Link to="/ngo/register-driver" className="nb-link" onClick={() => setMenuOpen(false)}>DriverRG</Link>
            <Link to="/ngo/assign-pickups" className="nb-link" onClick={() => setMenuOpen(false)}>Delivery</Link>
          </>}
          {currentUserRole === 'driver' && <Link to="/driver" className="nb-link" onClick={() => setMenuOpen(false)}>My Deliveries</Link>}
          {currentUserRole === 'admin' && <>
            <Link to="/admin" className="nb-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/admin/users" className="nb-link" onClick={() => setMenuOpen(false)}>Users</Link>
            <Link to="/admin/requests" className="nb-link" onClick={() => setMenuOpen(false)}>Requests</Link>
            <Link to="/admin/reports" className="nb-link" onClick={() => setMenuOpen(false)}>Reports</Link>
            <Link to="/admin/settings" className="nb-link" onClick={() => setMenuOpen(false)}>Settings</Link>
          </>}
        </div>
        <div className="nb-mobile-actions">
          {user ? (
            <> 
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F4F6FB', border: '1px solid #D8E2F0', padding: '12px', borderRadius: 12 }}>
                <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#1B3A6B,#2A52A0)', borderRadius: 8, display: 'flex', alignItems: 'center', justify: 'center', fontSize: 12, fontWeight: 800, color: 'white' }}>{user.name?.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F1C35' }}>{user.name?.split(' ')[0]}</div>
                  <div style={{ fontSize: 12, color: '#4A5568' }}>{user.role}</div>
                </div>
              </div>
              <button onClick={() => { logout(); setMenuOpen(false); navigate('/login') }} className="nb-ghost"><LogOut size={14}/>Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="nb-cta">Login</Link>
          )}
        </div>
      </div>
    </nav>
  )
}