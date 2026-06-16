import { useEffect, useState } from 'react'
import API from '../../utils/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'
import { FileText, Download } from 'lucide-react'

export default function AdminReports() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const go = async () => {
      try {
        const [sr,ur] = await Promise.all([API.get('/admin/stats'),API.get('/admin/users')])
        setStats(sr.data); setUsers(ur.data)
      } catch { toast.error('Failed to load') }
      setLoading(false)
    }; go()
  },[])

  const donors = users.filter(u=>u.role==='donor')
  const ngos = users.filter(u=>u.role==='ngo')
  const drivers = users.filter(u=>u.role==='driver')
  const rate = stats?.totalRequests>0 ? Math.round((stats.delivered/stats.totalRequests)*100) : 0

  const roleBadge = (role) => {
    const m={admin:{bg:'#EDE9FE',c:'#7C3AED'},donor:{bg:'#DCFCE7',c:'#15803D'},ngo:{bg:'#DBEAFE',c:'#1D4ED8'},driver:{bg:'#FEF9C3',c:'#A16207'}}
    const x=m[role]||m.donor
    return <span style={{background:x.bg,color:x.c,fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20}}>{role}</span>
  }

  return (
    <div style={{minHeight:'100vh',background:'#F4F6FB',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .au{animation:fadeUp 0.5s ease both;opacity:0}.d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}.d4{animation-delay:.2s}
        .trow:hover{background:#F4F6FB!important}
        .print-btn{background:linear-gradient(135deg,#D4A017,#F0C040);color:#0F1C35;border:none;padding:11px 22px;border-radius:11px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:8px;transition:all 0.25s;box-shadow:0 4px 14px rgba(212,160,23,0.35)}
        .print-btn:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(212,160,23,0.5)}
        @media print{nav,button{display:none!important}}
      `}</style>
      <Navbar/>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'36px 28px'}} id="report-area">
        {/* Header */}
        <div className="au d1" style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:28,flexWrap:'wrap',gap:12}}>
          <div>
            <h1 style={{fontFamily:'Fraunces,serif',fontSize:30,fontWeight:800,color:'#0F1C35',marginBottom:4,display:'flex',alignItems:'center',gap:10}}>
              <FileText size={26} style={{color:'#1B3A6B'}}/> System Reports
            </h1>
            <p style={{fontSize:14,color:'#8A96A8'}}>Platform activity overview — generated {new Date().toLocaleDateString()}</p>
          </div>
          <button className="print-btn" onClick={()=>window.print()}><Download size={16}/>Print / Export</button>
        </div>

        {loading ? <div style={{textAlign:'center',padding:60,color:'#8A96A8'}}>Loading report data...</div> : <>

          {/* Summary Cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {[
              {label:'Total Users',value:stats?.totalUsers,color:'#7C3AED',bg:'#EDE9FE'},
              {label:'Food Listings',value:stats?.totalListings,color:'#1B3A6B',bg:'#EEF3FB'},
              {label:'Pickup Requests',value:stats?.totalRequests,color:'#A16207',bg:'#FEF9C3'},
              {label:'Delivered',value:stats?.delivered,color:'#15803D',bg:'#DCFCE7'},
            ].map(({label,value,color,bg},i)=>(
              <div key={label} className={`au d${i+1}`} style={{background:'white',borderRadius:16,border:'1px solid #D8E2F0',padding:20,textAlign:'center',borderTop:`4px solid ${color}`}}>
                <div style={{fontFamily:'Fraunces,serif',fontSize:34,fontWeight:800,color,marginBottom:3}}>{value}</div>
                <div style={{fontSize:13,color:'#8A96A8'}}>{label}</div>
              </div>
            ))}
          </div>

          {/* User Breakdown */}
          <div className="au d2" style={{background:'white',borderRadius:18,border:'1px solid #D8E2F0',padding:24,marginBottom:24,overflow:'hidden',position:'relative'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:4,background:'linear-gradient(90deg,#1B3A6B,#D4A017)'}}/>
            <h2 style={{fontFamily:'Fraunces,serif',fontSize:18,fontWeight:700,color:'#0F1C35',marginBottom:18}}>User Breakdown</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,textAlign:'center'}}>
              {[{label:'Donors',count:donors.length,color:'#15803D',bg:'#DCFCE7'},{label:'NGOs',count:ngos.length,color:'#1D4ED8',bg:'#DBEAFE'},{label:'Drivers',count:drivers.length,color:'#A16207',bg:'#FEF9C3'}].map(({label,count,color,bg})=>(
                <div key={label} style={{background:bg,borderRadius:14,padding:'18px 12px'}}>
                  <div style={{fontFamily:'Fraunces,serif',fontSize:28,fontWeight:800,color}}>{count}</div>
                  <div style={{fontSize:13,color:'#4A5568',marginTop:3}}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Success Rate */}
          <div className="au d3" style={{background:'white',borderRadius:18,border:'1px solid #D8E2F0',padding:24,marginBottom:24}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div>
                <h2 style={{fontFamily:'Fraunces,serif',fontSize:18,fontWeight:700,color:'#0F1C35',marginBottom:3}}>Delivery Success Rate</h2>
                <p style={{fontSize:13,color:'#8A96A8'}}>{stats?.delivered} of {stats?.totalRequests} requests successfully delivered</p>
              </div>
              <span style={{fontFamily:'Fraunces,serif',fontSize:42,fontWeight:800,background:'linear-gradient(135deg,#1B3A6B,#D4A017)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{rate}%</span>
            </div>
            <div style={{background:'#F4F6FB',borderRadius:8,height:14,overflow:'hidden',border:'1px solid #D8E2F0'}}>
              <div style={{height:'100%',background:'linear-gradient(90deg,#1B3A6B,#D4A017)',borderRadius:8,width:`${rate}%`,transition:'width 1.2s ease'}}/>
            </div>
          </div>

          {/* Users Table */}
          <div className="au d4" style={{background:'white',borderRadius:18,border:'1px solid #D8E2F0',overflow:'hidden'}}>
            <div style={{height:4,background:'linear-gradient(90deg,#D4A017,#F0C040)'}}/>
            <div style={{padding:'20px 24px',borderBottom:'1px solid #D8E2F0'}}>
              <h2 style={{fontFamily:'Fraunces,serif',fontSize:18,fontWeight:700,color:'#0F1C35'}}>All Registered Users</h2>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#F4F6FB',borderBottom:'1px solid #D8E2F0'}}>
                  {['Name','Email','Role','Joined'].map(h=>(
                    <th key={h} style={{textAlign:'left',padding:'11px 18px',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:'#8A96A8'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u=>(
                  <tr key={u._id} className="trow" style={{borderBottom:'1px solid #F4F6FB'}}>
                    <td style={{padding:'12px 18px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:9}}>
                        <div style={{width:30,height:30,background:'linear-gradient(135deg,#1B3A6B,#2A52A0)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'white'}}>{u.name.charAt(0).toUpperCase()}</div>
                        <span style={{fontSize:14,fontWeight:600,color:'#0F1C35'}}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{padding:'12px 18px',fontSize:13,color:'#4A5568'}}>{u.email}</td>
                    <td style={{padding:'12px 18px'}}>{roleBadge(u.role)}</td>
                    <td style={{padding:'12px 18px',fontSize:13,color:'#8A96A8'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{padding:'14px 24px',textAlign:'center',borderTop:'1px solid #F4F6FB'}}>
              <p style={{fontSize:12,color:'#8A96A8'}}>Report generated on {new Date().toLocaleString()} — FoodSave System</p>
            </div>
          </div>
        </>}
      </div>
    </div>
  )
}