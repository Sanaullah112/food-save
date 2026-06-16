import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../utils/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'
import { TruckIcon, CheckCircle, MapPin, Package, Eye, Map, X } from 'lucide-react'

export default function DriverDashboard() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const navigate = useNavigate()

  const fetchRequests = async () => {
    try { const {data} = await API.get('/pickup/driver'); setRequests(data) }
    catch { toast.error('Failed to load') }
    setLoading(false)
  }

  const markCollected = async (id) => {
    try { await API.put(`/pickup/${id}`,{status:'collected'}); toast.success('Marked collected!'); fetchRequests(); setSelectedRequest(null) }
    catch { toast.error('Failed') }
  }

  const markDelivered = async (id) => {
    try { await API.put(`/pickup/${id}`,{status:'delivered'}); toast.success('Delivered! 🎉'); fetchRequests(); setSelectedRequest(null) }
    catch { toast.error('Failed') }
  }

  useEffect(()=>{fetchRequests()},[])

  const badge = (s) => {
    const m={accepted:{bg:'#FEF9C3',c:'#A16207'},collected:{bg:'#DBEAFE',c:'#1D4ED8'},delivered:{bg:'#DCFCE7',c:'#15803D'}}
    const x=m[s]||{bg:'#F4F4F0',c:'#4A4A46'}
    return <span style={{background:x.bg,color:x.c,fontSize:11,fontWeight:700,padding:'4px 12px',borderRadius:20}}>{s.charAt(0).toUpperCase()+s.slice(1)}</span>
  }

  const total=requests.length
  const pending=requests.filter(r=>r.status==='accepted').length
  const collected=requests.filter(r=>r.status==='collected').length
  const delivered=requests.filter(r=>r.status==='delivered').length

  return (
    <div style={{minHeight:'100vh',background:'#F4F6FB',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
        .au{animation:fadeUp 0.5s ease both;opacity:0}.d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}
        .scard{background:white;border-radius:16px;border:1px solid #D8E2F0;padding:20px;transition:all 0.3s ease;position:relative;overflow:hidden;cursor:default}
        .scard::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;transform:scaleX(0);transition:transform 0.3s ease;border-radius:16px 16px 0 0}
        .scard:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(27,58,107,0.1)}
        .scard:hover::before{transform:scaleX(1)}
        .rcard{background:white;border-radius:18px;border:1px solid #D8E2F0;padding:22px;transition:all 0.3s ease;position:relative;overflow:hidden}
        .rcard::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(135deg,#D4A017,#F0C040);border-radius:18px 0 0 18px}
        .rcard:hover{transform:translateY(-3px);box-shadow:0 10px 32px rgba(27,58,107,0.1);border-color:#D4A017}
        .view-btn{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;padding:8px 14px;border-radius:9px;background:#EEF3FB;color:#1B3A6B;border:1.5px solid #BFDBFE;cursor:pointer;font-family:inherit;transition:all 0.2s}
        .view-btn:hover{background:#1B3A6B;color:white;border-color:#1B3A6B;transform:translateY(-1px)}
        .map-btn{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;padding:8px 14px;border-radius:9px;background:linear-gradient(135deg,#EEF3FB,#DBEAFE);color:#1B3A6B;border:1.5px solid #BFDBFE;cursor:pointer;font-family:inherit;transition:all 0.2s}
        .map-btn:hover{background:linear-gradient(135deg,#1B3A6B,#2A52A0);color:white;border-color:#1B3A6B;transform:translateY(-1px)}
        .col-btn{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;padding:8px 14px;border-radius:9px;background:linear-gradient(135deg,#FEF9C3,#FDE68A);color:#A16207;border:1px solid #FDE68A;cursor:pointer;font-family:inherit;transition:all 0.2s}
        .col-btn:hover{background:linear-gradient(135deg,#D4A017,#F0C040);color:#0F1C35;border-color:#D4A017;transform:translateY(-1px)}
        .del-btn{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;padding:8px 14px;border-radius:9px;background:linear-gradient(135deg,#DCFCE7,#BBF7D0);color:#15803D;border:1px solid #86EFAC;cursor:pointer;font-family:inherit;transition:all 0.2s}
        .del-btn:hover{background:linear-gradient(135deg,#15803D,#16A34A);color:white;border-color:#15803D;transform:translateY(-1px)}
        .modal-overlay{position:fixed;inset:0;background:rgba(10,20,50,0.6);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(8px);animation:scaleIn 0.2s ease}
        .modal-inner{background:white;border-radius:24px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;animation:fadeUp 0.3s ease;box-shadow:0 32px 80px rgba(10,20,50,0.35)}
      `}</style>
      <Navbar/>
      <div style={{maxWidth:1000,margin:'0 auto',padding:'36px 28px'}}>
        {/* Header */}
        <div className="au d1" style={{background:'linear-gradient(135deg,#0F1C35,#1B3A6B)',borderRadius:20,padding:'26px 28px',marginBottom:28,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-40,right:-40,width:160,height:160,borderRadius:'50%',background:'radial-gradient(circle,rgba(212,160,23,0.2),transparent 70%)'}}/>
          <div style={{display:'flex',alignItems:'center',gap:14,position:'relative',zIndex:1}}>
            <div style={{width:50,height:50,background:'rgba(255,255,255,0.12)',borderRadius:15,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,border:'1px solid rgba(255,255,255,0.15)'}}>🚗</div>
            <div>
              <h1 style={{fontFamily:'Fraunces,serif',fontSize:24,fontWeight:800,color:'white',marginBottom:3}}>Driver Dashboard</h1>
              <p style={{fontSize:13,color:'rgba(255,255,255,0.6)'}}>Your assigned food pickup and delivery tasks</p>
            </div>
          </div>
          <div style={{height:3,background:'linear-gradient(90deg,#D4A017,#F0C040)',borderRadius:4,marginTop:18,position:'relative',zIndex:1}}/>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
          {[
            {label:'Total Assigned',value:total,color:'#7C3AED',bar:'#7C3AED'},
            {label:'Pending Pickup',value:pending,color:'#A16207',bar:'#D4A017'},
            {label:'Collected',value:collected,color:'#1D4ED8',bar:'#1D4ED8'},
            {label:'Delivered',value:delivered,color:'#15803D',bar:'#22C55E'},
          ].map(({label,value,color,bar},i)=>(
            <div key={label} className={`scard au d${i+1}`}>
              <style>{`.scard:nth-child(${i+1})::before{background:${bar}}`}</style>
              <div style={{fontFamily:'Fraunces,serif',fontSize:32,fontWeight:800,color,marginBottom:2}}>{value}</div>
              <div style={{fontSize:13,color:'#8A96A8'}}>{label}</div>
            </div>
          ))}
        </div>

        {/* Requests */}
        {loading ? <div style={{textAlign:'center',padding:60,color:'#8A96A8'}}>Loading assignments...</div>
        : requests.length===0 ? (
          <div style={{background:'white',borderRadius:20,border:'1px solid #D8E2F0',padding:'72px 32px',textAlign:'center'}}>
            <div style={{fontSize:56,marginBottom:16,animation:'float 3s ease-in-out infinite',display:'inline-block'}}>🚗</div>
            <h3 style={{fontFamily:'Fraunces,serif',fontSize:20,fontWeight:700,color:'#4A5568',marginBottom:8}}>No assignments yet</h3>
            <p style={{fontSize:14,color:'#8A96A8'}}>Admin will assign pickups to you soon</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {requests.map((req,i)=>(
              <div key={req._id} className={`rcard au d${Math.min(i+1,3)}`}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                      <div style={{width:44,height:44,background:'linear-gradient(135deg,#FFFBEB,#FEF3C7)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,border:'1px solid #FDE68A'}}>🍱</div>
                      <div>
                        <h3 style={{fontFamily:'Fraunces,serif',fontSize:17,fontWeight:700,color:'#0F1C35'}}>{req.listing?.foodName}</h3>
                        <p style={{fontSize:13,color:'#8A96A8'}}>{req.listing?.quantity} {req.listing?.unit} · {req.listing?.category}</p>
                      </div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:4}}>
                      <p style={{fontSize:13,color:'#4A5568',display:'flex',alignItems:'center',gap:5}}><MapPin size={12}/> {req.listing?.pickupAddress}</p>
                      <p style={{fontSize:13,color:'#4A5568'}}>🏢 <strong style={{color:'#0F1C35'}}>{req.ngo?.name}</strong></p>
                      <p style={{fontSize:12,color:'#8A96A8'}}>📞 {req.ngo?.phone}</p>
                      <p style={{fontSize:12,color:'#8A96A8'}}>🕐 {new Date(req.requestedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8}}>
                    {badge(req.status)}
                    <button className="view-btn" onClick={()=>setSelectedRequest(req)}><Eye size={13}/>Details</button>
                    <button className="map-btn" onClick={()=>navigate(`/driver/map/${req._id}`)}><Map size={13}/>Open Map</button>
                    {req.status==='accepted'&&<button className="col-btn" onClick={()=>markCollected(req._id)}><Package size={13}/>Collected</button>}
                    {req.status==='collected'&&<button className="del-btn" onClick={()=>markDelivered(req._id)}><CheckCircle size={13}/>Delivered</button>}
                    {req.status==='delivered'&&<span style={{fontSize:12,color:'#15803D',fontWeight:700,display:'flex',alignItems:'center',gap:4}}><CheckCircle size={13}/>Done</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRequest&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setSelectedRequest(null)}}>
          <div className="modal-inner">
            <div style={{background:'linear-gradient(135deg,#0F1C35,#1B3A6B)',padding:'22px 24px',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:-30,right:-30,width:100,height:100,borderRadius:'50%',background:'radial-gradient(circle,rgba(212,160,23,0.2),transparent 70%)'}}/>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',position:'relative',zIndex:1}}>
                <h3 style={{fontFamily:'Fraunces,serif',fontSize:20,fontWeight:800,color:'white',display:'flex',alignItems:'center',gap:9}}>
                  <Package size={18}/> Donation Details
                </h3>
                <button onClick={()=>setSelectedRequest(null)} style={{background:'rgba(255,255,255,0.1)',border:'none',color:'white',width:32,height:32,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                  <X size={16}/>
                </button>
              </div>
            </div>
            <div style={{height:3,background:'linear-gradient(90deg,#D4A017,#F0C040)'}}/>
            <div style={{padding:24,display:'flex',flexDirection:'column',gap:16}}>
              {/* Food Info */}
              <div style={{background:'linear-gradient(135deg,#FFFBEB,#FEF3C7)',borderRadius:14,padding:16,border:'1px solid #FDE68A'}}>
                <p style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'#A16207',marginBottom:10}}>🍱 Food Information</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {[['Name',selectedRequest.listing?.foodName],['Category',selectedRequest.listing?.category],['Quantity',`${selectedRequest.listing?.quantity} ${selectedRequest.listing?.unit}`],['Expiry',new Date(selectedRequest.listing?.expiryDate).toLocaleString()],['Address',selectedRequest.listing?.pickupAddress]].map(([l,v])=>(
                    <div key={l} style={{gridColumn:l==='Address'?'1/-1':'auto'}}>
                      <p style={{fontSize:11,color:'#A16207',fontWeight:700,marginBottom:2}}>{l}</p>
                      <p style={{fontSize:13,color:'#0F1C35',fontWeight:600}}>{v||'—'}</p>
                    </div>
                  ))}
                </div>
                {selectedRequest.listing?.description&&<p style={{fontSize:13,color:'#4A5568',marginTop:8,background:'rgba(255,255,255,0.5)',padding:'8px 10px',borderRadius:8}}>📝 {selectedRequest.listing.description}</p>}
              </div>
              {/* NGO Info */}
              <div style={{background:'linear-gradient(135deg,#EEF3FB,#DBEAFE)',borderRadius:14,padding:16,border:'1px solid #BFDBFE'}}>
                <p style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'#1B3A6B',marginBottom:10}}>🏢 Deliver To (NGO)</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {[['Name',selectedRequest.ngo?.name],['Phone',selectedRequest.ngo?.phone],['Email',selectedRequest.ngo?.email],['Address',selectedRequest.ngo?.address]].map(([l,v])=>(
                    <div key={l}><p style={{fontSize:11,color:'#1B3A6B',fontWeight:700,marginBottom:2}}>{l}</p><p style={{fontSize:13,color:'#0F1C35',fontWeight:600}}>{v||'—'}</p></div>
                  ))}
                </div>
              </div>
              {/* Actions */}
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>navigate(`/driver/map/${selectedRequest._id}`)} style={{flex:1,background:'linear-gradient(135deg,#1B3A6B,#2A52A0)',color:'white',border:'none',padding:13,borderRadius:11,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:7,boxShadow:'0 4px 14px rgba(27,58,107,0.3)'}}>
                  <Map size={15}/> Open Map
                </button>
                {selectedRequest.status==='accepted'&&<button onClick={()=>markCollected(selectedRequest._id)} style={{flex:1,background:'linear-gradient(135deg,#D4A017,#F0C040)',color:'#0F1C35',border:'none',padding:13,borderRadius:11,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Mark Collected</button>}
                {selectedRequest.status==='collected'&&<button onClick={()=>markDelivered(selectedRequest._id)} style={{flex:1,background:'linear-gradient(135deg,#15803D,#16A34A)',color:'white',border:'none',padding:13,borderRadius:11,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Mark Delivered</button>}
                <button onClick={()=>setSelectedRequest(null)} style={{background:'#F4F6FB',color:'#4A5568',border:'2px solid #D8E2F0',padding:'13px 18px',borderRadius:11,fontSize:14,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}