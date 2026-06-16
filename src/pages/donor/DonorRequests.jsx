import { useEffect, useState } from 'react'
import API from '../../utils/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Clock, TruckIcon } from 'lucide-react'

export default function DonorRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    try { const {data} = await API.get('/food/requests/donor'); setRequests(data) }
    catch { toast.error('Failed to load') }
    setLoading(false)
  }

  const update = async (id, status) => {
    try { await API.put(`/food/requests/${id}`,{status}); toast.success(`Request ${status}!`); fetch() }
    catch { toast.error('Failed to update') }
  }

  useEffect(()=>{fetch()},[])

  const badge = (s) => {
    const m={pending:{bg:'#FEF9C3',c:'#A16207'},accepted:{bg:'#DCFCE7',c:'#15803D'},rejected:{bg:'#FEE2E2',c:'#DC2626'},delivered:{bg:'#DBEAFE',c:'#1D4ED8'},collected:{bg:'#EDE9FE',c:'#7C3AED'}}
    const x=m[s]||m.pending
    return <span style={{background:x.bg,color:x.c,fontSize:12,fontWeight:700,padding:'4px 12px',borderRadius:20}}>{s.charAt(0).toUpperCase()+s.slice(1)}</span>
  }

  return (
    <div style={{minHeight:'100vh',background:'#F4F6FB',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .au{animation:fadeUp 0.5s ease both;opacity:0}.d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}
        .rcard{background:white;border-radius:18px;border:1px solid #D8E2F0;padding:24px;transition:all 0.3s ease;position:relative;overflow:hidden}
        .rcard::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(135deg,#1B3A6B,#D4A017);border-radius:18px 0 0 18px}
        .rcard:hover{transform:translateY(-3px);box-shadow:0 12px 36px rgba(27,58,107,0.1);border-color:#1B3A6B}
        .acc-btn{background:linear-gradient(135deg,#1B3A6B,#2A52A0);color:white;border:none;padding:9px 18px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:6px;transition:all 0.2s;box-shadow:0 3px 10px rgba(27,58,107,0.3)}
        .acc-btn:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(27,58,107,0.4)}
        .rej-btn{background:#FEE2E2;color:#DC2626;border:1px solid #FECACA;padding:9px 18px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:6px;transition:all 0.2s}
        .rej-btn:hover{background:#DC2626;color:white}
        .del-btn{background:linear-gradient(135deg,#D4A017,#F0C040);color:#0F1C35;border:none;padding:9px 18px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.2s;box-shadow:0 3px 10px rgba(212,160,23,0.3)}
        .del-btn:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(212,160,23,0.5)}
      `}</style>
      <Navbar/>
      <div style={{maxWidth:900,margin:'0 auto',padding:'36px 28px'}}>
        <div className="au d1" style={{marginBottom:32}}>
          <h1 style={{fontFamily:'Fraunces,serif',fontSize:30,fontWeight:800,color:'#0F1C35',marginBottom:4}}>Incoming Requests</h1>
          <p style={{fontSize:14,color:'#8A96A8'}}>NGOs requesting your food donations</p>
        </div>

        {loading ? (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {[1,2,3].map(i=><div key={i} style={{background:'white',borderRadius:18,padding:24,border:'1px solid #D8E2F0',height:120}}/>)}
          </div>
        ) : requests.length===0 ? (
          <div style={{background:'white',borderRadius:20,border:'1px solid #D8E2F0',padding:'72px 32px',textAlign:'center'}}>
            <Clock size={52} style={{color:'#D8E2F0',margin:'0 auto 16px',display:'block'}}/>
            <h3 style={{fontFamily:'Fraunces,serif',fontSize:20,fontWeight:700,color:'#4A5568',marginBottom:8}}>No requests yet</h3>
            <p style={{fontSize:14,color:'#8A96A8'}}>NGOs will appear here once they request your listings</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {requests.map((req,i)=>(
              <div key={req._id} className={`rcard au d${Math.min(i+1,3)}`}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                      <div style={{width:42,height:42,background:'linear-gradient(135deg,#EEF3FB,#DBEAFE)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🍱</div>
                      <div>
                        <h3 style={{fontFamily:'Fraunces,serif',fontSize:18,fontWeight:700,color:'#0F1C35'}}>{req.listing?.foodName}</h3>
                        <p style={{fontSize:13,color:'#8A96A8'}}>{req.listing?.quantity} {req.listing?.unit} · {req.listing?.category}</p>
                      </div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                      <p style={{fontSize:13,color:'#4A5568',display:'flex',alignItems:'center',gap:5}}>🏢 <strong style={{color:'#0F1C35'}}>{req.ngo?.name}</strong></p>
                      <p style={{fontSize:13,color:'#4A5568',display:'flex',alignItems:'center',gap:5}}>📞 {req.ngo?.phone}</p>
                      <p style={{fontSize:13,color:'#8A96A8',display:'flex',alignItems:'center',gap:5}}>🕐 {new Date(req.requestedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:10}}>
                    {badge(req.status)}
                    {req.status==='pending'&&(
                      <div style={{display:'flex',gap:8}}>
                        <button className="acc-btn" onClick={()=>update(req._id,'accepted')}><CheckCircle size={14}/>Accept</button>
                        <button className="rej-btn" onClick={()=>update(req._id,'rejected')}><XCircle size={14}/>Reject</button>
                      </div>
                    )}
                    {req.status==='accepted'&&(
                      <button className="del-btn" onClick={()=>update(req._id,'delivered')}><TruckIcon size={14}/>Mark Delivered</button>
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