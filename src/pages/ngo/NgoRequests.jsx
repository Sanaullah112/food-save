import { useEffect, useState } from 'react'
import API from '../../utils/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'
import { Clock } from 'lucide-react'

export default function NgoRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const go = async () => {
      try { const {data} = await API.get('/pickup/my'); setRequests(data) }
      catch { toast.error('Failed to load') }
      setLoading(false)
    }; go()
  },[])

  const badge = (s) => {
    const m={pending:{bg:'#FEF9C3',c:'#A16207'},accepted:{bg:'#DCFCE7',c:'#15803D'},rejected:{bg:'#FEE2E2',c:'#DC2626'},delivered:{bg:'#DBEAFE',c:'#1D4ED8'},collected:{bg:'#EDE9FE',c:'#7C3AED'}}
    const x=m[s]||m.pending
    return <span style={{background:x.bg,color:x.c,fontSize:12,fontWeight:700,padding:'5px 14px',borderRadius:20}}>{s.charAt(0).toUpperCase()+s.slice(1)}</span>
  }

  return (
    <div style={{minHeight:'100vh',background:'#F4F6FB',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.au{animation:fadeUp 0.5s ease both;opacity:0}.d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}.rcard{background:white;border-radius:18px;border:1px solid #D8E2F0;padding:24px;transition:all 0.3s ease;position:relative;overflow:hidden}.rcard::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(135deg,#D4A017,#F0C040);border-radius:18px 0 0 18px}.rcard:hover{transform:translateY(-3px);box-shadow:0 12px 36px rgba(27,58,107,0.1);border-color:#D4A017}`}</style>
      <Navbar/>  
      <div style={{maxWidth:900,margin:'0 auto',padding:'36px 28px'}}>
        <div className="au d1" style={{marginBottom:32}}>
          <h1 style={{fontFamily:'Fraunces,serif',fontSize:30,fontWeight:800,color:'#0F1C35',marginBottom:4}}>My Pickup Requests</h1>
          <p style={{fontSize:14,color:'#8A96A8'}}>Track the status of all your food requests</p>
        </div>
        {loading ? <div style={{textAlign:'center',padding:40,color:'#8A96A8'}}>Loading...</div>
        : requests.length===0 ? (
          <div style={{background:'white',borderRadius:20,border:'1px solid #D8E2F0',padding:'72px 32px',textAlign:'center'}}>
            <Clock size={52} style={{color:'#D8E2F0',margin:'0 auto 16px',display:'block'}}/>
            <h3 style={{fontFamily:'Fraunces,serif',fontSize:20,fontWeight:700,color:'#4A5568',marginBottom:8}}>No requests yet</h3>
            <p style={{fontSize:14,color:'#8A96A8'}}>Browse food listings and send your first request</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {requests.map((req,i)=>(
              <div key={req._id} className={`rcard au d${Math.min(i+1,3)}`}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                      <div style={{width:44,height:44,background:'linear-gradient(135deg,#FFFBEB,#FEF3C7)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,border:'1px solid #FDE68A'}}>🍱</div>
                      <div>
                        <h3 style={{fontFamily:'Fraunces,serif',fontSize:18,fontWeight:700,color:'#0F1C35'}}>{req.listing?.foodName}</h3>
                        <p style={{fontSize:13,color:'#8A96A8'}}>{req.listing?.quantity} {req.listing?.unit}</p>
                      </div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6}}>
                      <p style={{fontSize:13,color:'#4A5568'}}>📍 {req.listing?.pickupAddress}</p>
                      <p style={{fontSize:13,color:'#4A5568'}}>⏰ Exp: {req.listing?.expiryDate?new Date(req.listing.expiryDate).toLocaleDateString():'-'}</p>
                      <p style={{fontSize:13,color:'#8A96A8'}}>🕐 Requested: {new Date(req.requestedAt).toLocaleString()}</p>
                      {req.driver&&<p style={{fontSize:13,color:'#4A5568'}}>🚗 Driver: {req.driver?.name}</p>}
                      {req.fulfilledAt&&<p style={{fontSize:13,color:'#15803D'}}>✅ Delivered: {new Date(req.fulfilledAt).toLocaleString()}</p>}
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8}}>
                    {badge(req.status)}
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