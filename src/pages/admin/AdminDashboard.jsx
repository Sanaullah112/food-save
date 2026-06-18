import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../../utils/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'
import { Users, Package, TruckIcon, CheckCircle, BarChart3, Settings, ArrowRight } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const go = async () => {
      try {
        const [sr, ur] = await Promise.all([API.get('/admin/stats'), API.get('/admin/users')])
        setStats(sr.data); setDrivers(ur.data.filter(u=>u.role==='driver'))
      } catch { toast.error('Failed to load') }
      setLoading(false)
    }; go()
  },[])

  const rate = stats?.totalRequests>0 ? Math.round((stats.delivered/stats.totalRequests)*100) : 0

  return (
    <div style={{minHeight:'100vh',background:'#F4F6FB',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes barGrow{from{width:0}to{width:var(--w)}}
        .au{animation:fadeUp 0.5s ease both;opacity:0}.d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}.d4{animation-delay:.2s}
        .scard{background:white;border-radius:16px;border:1px solid #D8E2F0;padding:22px;transition:all 0.3s ease;position:relative;overflow:hidden;cursor:default;min-width:0}
        .scard::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:16px 16px 0 0;transform:scaleX(0);transition:transform 0.3s ease}
        .scard:hover{transform:translateY(-4px);box-shadow:0 10px 32px rgba(27,58,107,0.1)}
        .scard:hover::before{transform:scaleX(1)}
        .qacard{background:white;border-radius:16px;border:1px solid #D8E2F0;padding:20px;transition:all 0.3s cubic-bezier(.34,1.56,.64,1);text-decoration:none;display:block;position:relative;overflow:hidden;min-width:0}
        .qacard::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(27,58,107,0.03),rgba(212,160,23,0.05));opacity:0;transition:opacity 0.3s}
        .qacard:hover{transform:translateY(-5px);box-shadow:0 14px 40px rgba(27,58,107,0.13);border-color:#1B3A6B}
        .qacard:hover::after{opacity:1}
        .qacard:hover .qa-arrow{transform:translateX(5px)}
        .qa-arrow{transition:transform 0.2s ease}

        @media (max-width: 900px){
          .stats-grid,.quick-grid{grid-template-columns:repeat(2, minmax(0, 1fr)) !important}
        }
        @media (max-width: 640px){
          .page-shell{padding:24px 14px !important}
          .header-panel{padding:22px 18px !important; border-radius:16px !important}
          .header-row{align-items:flex-start !important; gap:12px !important}
          .header-title{font-size:22px !important; line-height:1.2 !important}
          .header-subtitle{font-size:12px !important}
          .stats-grid,.quick-grid,.loading-grid{grid-template-columns:1fr !important; gap:12px !important}
          .rate-row{flex-direction:column !important; align-items:flex-start !important; gap:10px !important}
          .rate-value{font-size:32px !important}
          .success-panel{padding:18px !important}
          .qacard{padding:18px !important}
        }
      `}</style>
      <Navbar/>
      <div className="page-shell" style={{maxWidth:1200,margin:'0 auto',padding:'36px 28px'}}>
        {/* Header */}
        <div className="au d1 header-panel" style={{background:'linear-gradient(135deg,#0F1C35,#1B3A6B)',borderRadius:20,padding:'28px 32px',marginBottom:28,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-40,right:-40,width:160,height:160,borderRadius:'50%',background:'radial-gradient(circle,rgba(212,160,23,0.2),transparent 70%)'}}/>
          <div className="header-row" style={{display:'flex',alignItems:'center',gap:14,position:'relative',zIndex:1}}>
            <div style={{width:52,height:52,background:'rgba(255,255,255,0.1)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,border:'1px solid rgba(255,255,255,0.15)'}}>⚙️</div>
            <div>
              <h1 className="header-title" style={{fontFamily:'Fraunces,serif',fontSize:26,fontWeight:800,color:'white',marginBottom:3}}>Admin Dashboard</h1>
              <p className="header-subtitle" style={{fontSize:13,color:'rgba(255,255,255,0.6)'}}>System overview and platform management</p>
            </div>
          </div>
          <div style={{height:3,background:'linear-gradient(90deg,#D4A017,#F0C040)',borderRadius:4,marginTop:20,position:'relative',zIndex:1}}/>
        </div>

        {loading ? (
          <div className="loading-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
            {[1,2,3,4].map(i=><div key={i} style={{background:'white',borderRadius:16,height:110,border:'1px solid #D8E2F0'}}/>)}
          </div>
        ) : stats && <>
          {/* Stats */}
          <div className="stats-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
            {[
              {label:'Total Users',value:stats.totalUsers,icon:Users,color:'#7C3AED',bg:'#EDE9FE',bar:'#7C3AED'},
              {label:'Food Listings',value:stats.totalListings,icon:Package,color:'#1B3A6B',bg:'#EEF3FB',bar:'#1B3A6B'},
              {label:'Available Now',value:stats.available,icon:TruckIcon,color:'#B45309',bg:'#FEF9C3',bar:'#D4A017'},
              {label:'Delivered',value:stats.delivered,icon:CheckCircle,color:'#15803D',bg:'#DCFCE7',bar:'#22C55E'},
            ].map(({label,value,icon:Icon,color,bg,bar},i)=>(
              <div key={label} className={`scard au d${i+1}`} style={{'--bar':bar}}>
                <style>{`.scard:nth-child(${i+1})::before{background:${bar}}`}</style>
                <div style={{width:42,height:42,background:bg,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12}}>
                  <Icon size={18} style={{color}}/>
                </div>
                <div style={{fontFamily:'Fraunces,serif',fontSize:32,fontWeight:800,color,marginBottom:2}}>{value}</div>
                <div style={{fontSize:13,color:'#8A96A8'}}>{label}</div>
              </div>
            ))}
          </div>

          {/* Success Rate */}
          <div className="au d2 success-panel" style={{background:'white',borderRadius:18,border:'1px solid #D8E2F0',padding:24,marginBottom:28}}>
            <div className="rate-row" style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,gap:12}}>
              <div>
                <h3 style={{fontFamily:'Fraunces,serif',fontSize:18,fontWeight:700,color:'#0F1C35',marginBottom:3}}>Delivery Success Rate</h3>
                <p style={{fontSize:13,color:'#8A96A8'}}>{stats.delivered} of {stats.totalRequests} requests delivered successfully</p>
              </div>
              <div className="rate-value" style={{fontFamily:'Fraunces,serif',fontSize:40,fontWeight:800,background:'linear-gradient(135deg,#1B3A6B,#D4A017)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{rate}%</div>
            </div>
            <div style={{background:'#F4F6FB',borderRadius:8,height:12,overflow:'hidden',border:'1px solid #D8E2F0'}}>
              <div style={{height:'100%',background:'linear-gradient(90deg,#1B3A6B,#D4A017)',borderRadius:8,width:`${rate}%`,transition:'width 1.2s cubic-bezier(.22,1,.36,1)'}}/>
            </div>
          </div>
        </>}

        {/* Quick Actions */}
        <div className="au d3">
          <h2 style={{fontFamily:'Fraunces,serif',fontSize:20,fontWeight:700,color:'#0F1C35',marginBottom:16}}>Quick Actions</h2>
          <div className="quick-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
            {[
              {to:'/admin/users',icon:Users,label:'Manage Users',desc:'View all accounts',color:'#7C3AED',bg:'#EDE9FE'},
              {to:'/admin/requests',icon:TruckIcon,label:'Pickup Requests',desc:'Assign drivers',color:'#1B3A6B',bg:'#EEF3FB'},
              {to:'/admin/reports',icon:BarChart3,label:'View Reports',desc:'Analytics & stats',color:'#B45309',bg:'#FEF9C3'},
              {to:'/admin/guide',icon:BarChart3,label:'Safety guidleines',desc:'For Donors',color:'#B45309',bg:'#FEF9C3'},
              {to:'/admin/settings',icon:Settings,label:'Settings',desc:`${drivers.length} drivers`,color:'#15803D',bg:'#DCFCE7'},
            ].map(({to,icon:Icon,label,desc,color,bg},i)=>(
              <Link key={to} to={to} className={`qacard au d${i+1}`}>
                <div style={{width:44,height:44,background:bg,borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14,transition:'transform 0.3s ease'}}>
                  <Icon size={20} style={{color}}/>
                </div>
                <div style={{fontFamily:'Fraunces,serif',fontSize:16,fontWeight:700,color:'#0F1C35',marginBottom:4}}>{label}</div>
                <div style={{fontSize:13,color:'#8A96A8',marginBottom:14}}>{desc}</div>
                <div style={{display:'flex',alignItems:'center',gap:5,fontSize:13,fontWeight:700,color}}>
                  Open <ArrowRight size={13} className="qa-arrow"/>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}