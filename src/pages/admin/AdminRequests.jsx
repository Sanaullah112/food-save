import { useEffect, useState } from 'react'
import API from '../../utils/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'
import { TruckIcon } from 'lucide-react'

export default function AdminRequests() {
  const [requests, setRequests] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(null)
  const [selectedDriver, setSelectedDriver] = useState({})

  useEffect(()=>{
    const go = async () => {
      try {
        const [ur, rr] = await Promise.all([API.get('/admin/users'), API.get('/admin/requests')])
        setDrivers(ur.data.filter(u=>u.role==='driver'))
        setRequests(rr.data)
      } catch { toast.error('Failed to load') }
      setLoading(false)
    }; go()
  },[])

  const assignDriver = async (reqId) => {
    if (!selectedDriver[reqId]) return toast.error('Select a driver first')
    setAssigning(reqId)
    try {
      await API.put(`/admin/assign-driver/${reqId}`,{driverId:selectedDriver[reqId]})
      toast.success('Driver assigned!')
      setRequests(prev=>prev.map(r=>r._id===reqId?{...r,driver:drivers.find(d=>d._id===selectedDriver[reqId])}:r))
    } catch { toast.error('Failed to assign') }
    setAssigning(null)
  }

  const badge = (s) => {
    const m={pending:{bg:'#FEF9C3',c:'#A16207'},accepted:{bg:'#DCFCE7',c:'#15803D'},rejected:{bg:'#FEE2E2',c:'#DC2626'},delivered:{bg:'#DBEAFE',c:'#1D4ED8'},collected:{bg:'#EDE9FE',c:'#7C3AED'}}
    const x=m[s]||m.pending
    return <span style={{background:x.bg,color:x.c,fontSize:11,fontWeight:700,padding:'4px 12px',borderRadius:20}}>{s.charAt(0).toUpperCase()+s.slice(1)}</span>
  }

  return (
    <div style={{minHeight:'100vh',background:'#F4F6FB',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .au{animation:fadeUp 0.5s ease both;opacity:0}.d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}
        .rcard{background:white;border-radius:18px;border:1px solid #D8E2F0;padding:22px;transition:all 0.3s ease;position:relative;overflow:hidden}
        .rcard::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(135deg,#1B3A6B,#2A52A0);border-radius:18px 0 0 18px}
        .rcard:hover{transform:translateY(-3px);box-shadow:0 10px 32px rgba(27,58,107,0.1);border-color:#1B3A6B}
        .asgn-btn{background:linear-gradient(135deg,#D4A017,#F0C040);color:#0F1C35;border:none;padding:9px 18px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.25s;box-shadow:0 3px 10px rgba(212,160,23,0.3)}
        .asgn-btn:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(212,160,23,0.5)}
        .asgn-btn:disabled{opacity:0.6;cursor:not-allowed}
        .drv-sel{border:2px solid #D8E2F0;border-radius:10px;padding:8px 12px;font-size:13px;font-family:inherit;outline:none;color:#0F1C35;background:white;transition:border-color 0.2s;cursor:pointer}
        .drv-sel:focus{border-color:#1B3A6B}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>
      <Navbar/>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'36px 28px'}}>
        <div className="au d1" style={{marginBottom:28}}>
          <h1 style={{fontFamily:'Fraunces,serif',fontSize:30,fontWeight:800,color:'#0F1C35',marginBottom:4}}>Manage Pickup Requests</h1>
          <p style={{fontSize:14,color:'#8A96A8'}}>Assign drivers to accepted pickup requests</p>
        </div>

        {loading ? (
          <div style={{textAlign:'center',padding:60,color:'#8A96A8'}}>Loading requests...</div>
        ) : requests.length===0 ? (
          <div style={{background:'white',borderRadius:20,border:'1px solid #D8E2F0',padding:'72px 32px',textAlign:'center'}}>
            <TruckIcon size={52} style={{color:'#D8E2F0',margin:'0 auto 16px',display:'block'}}/>
            <h3 style={{fontFamily:'Fraunces,serif',fontSize:20,fontWeight:700,color:'#4A5568'}}>No requests found</h3>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {requests.map((req,i)=>(
              <div key={req._id} className={`rcard au d${Math.min(i+1,3)}`}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:14}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                      <div style={{width:42,height:42,background:'linear-gradient(135deg,#EEF3FB,#DBEAFE)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🍱</div>
                      <div>
                        <h3 style={{fontFamily:'Fraunces,serif',fontSize:17,fontWeight:700,color:'#0F1C35'}}>{req.listing?.foodName}</h3>
                        <p style={{fontSize:13,color:'#8A96A8'}}>{req.listing?.quantity} {req.listing?.unit} · {req.listing?.category}</p>
                      </div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:5}}>
                      <p style={{fontSize:13,color:'#4A5568'}}>📍 {req.listing?.pickupAddress}</p>
                      <p style={{fontSize:13,color:'#4A5568'}}>🏢 NGO: <strong style={{color:'#0F1C35'}}>{req.ngo?.name}</strong></p>
                      <p style={{fontSize:13,color:'#8A96A8'}}>📞 {req.ngo?.phone}</p>
                      <p style={{fontSize:13,color:'#8A96A8'}}>🕐 {new Date(req.requestedAt).toLocaleString()}</p>
                      {req.driver&&<p style={{fontSize:13,color:'#15803D',fontWeight:600}}>🚗 Driver: {req.driver?.name}</p>}
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:10}}>
                    {badge(req.status)}
                    {req.status==='accepted'&&!req.driver&&(
                      <div style={{display:'flex',gap:8,alignItems:'center'}}>
                        <select className="drv-sel" value={selectedDriver[req._id]||''} onChange={e=>setSelectedDriver(p=>({...p,[req._id]:e.target.value}))}>
                          <option value="">Select Driver</option>
                          {drivers.map(d=><option key={d._id} value={d._id}>{d.name} — {d.phone||'No phone'}</option>)}
                        </select>
                        <button className="asgn-btn" disabled={assigning===req._id} onClick={()=>assignDriver(req._id)}>
                          {assigning===req._id?<span style={{width:14,height:14,border:'2px solid rgba(15,28,53,0.3)',borderTop:'2px solid #0F1C35',borderRadius:'50%',animation:'spin 1s linear infinite',display:'inline-block'}}/>:'Assign'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}