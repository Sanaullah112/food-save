import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import API from '../utils/api'
import ActiveGuidelines from '../components/ActiveGuidelines'

export default function Home() {
  const [listings, setListings] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedFood, setSelectedFood] = useState(null)
  const [pickupOption, setPickupOption] = useState('self')
  const [claimingId, setClaimingId] = useState(null)
  const [requested, setRequested] = useState({})
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const getDashboardPath = () => {
    if (!user) return null
    const role = user.role?.toLowerCase()
    if (role === 'donor') return '/donor'
    if (role === 'ngo') return '/ngo'
    if (role === 'driver') return '/driver'
    if (role === 'admin') return '/admin'
    return null
  }

  const demoFoods = [
    { _id:'d1', foodName:'Fresh Biryani',     category:'cooked',   quantity:15, unit:'plates',   pickupAddress:'Mingora, Swat',  donor:{name:'Hotel Serena'},       expiryDate:new Date(Date.now()+4*3600000) },
    { _id:'d2', foodName:'Whole Wheat Bread', category:'bakery',   quantity:12, unit:'loaves',   pickupAddress:'Saidu Sharif',   donor:{name:'Ahmad Bakery'},       expiryDate:new Date(Date.now()+18*3600000) },
    { _id:'d3', foodName:'Fresh Vegetables',  category:'raw',      quantity:8,  unit:'kg',       pickupAddress:'Matta, Swat',    donor:{name:'Matta Market'},       expiryDate:new Date(Date.now()+12*3600000) },
    { _id:'d4', foodName:'Pasteurised Milk',  category:'dairy',    quantity:20, unit:'liters',   pickupAddress:'Kabal, Swat',    donor:{name:'Kabal Dairy'},        expiryDate:new Date(Date.now()+6*3600000) },
    { _id:'d5', foodName:'Cooked Daal',       category:'cooked',   quantity:10, unit:'portions', pickupAddress:'Khwazakhela',    donor:{name:'Community Kitchen'},  expiryDate:new Date(Date.now()+3*3600000) },
    { _id:'d6', foodName:'Packaged Biscuits', category:'packaged', quantity:30, unit:'packs',    pickupAddress:'Fizagat',        donor:{name:'Al-Noor Store'},      expiryDate:new Date(Date.now()+72*3600000) },
    { _id:'d7', foodName:'Mixed Salad',       category:'raw',      quantity:6,  unit:'portions', pickupAddress:'Mingora, Swat',  donor:{name:'Green Garden'},       expiryDate:new Date(Date.now()+8*3600000) },
    { _id:'d8', foodName:'Chicken Karahi',    category:'cooked',   quantity:8,  unit:'plates',   pickupAddress:'Saidu Sharif',   donor:{name:'Taste of Swat'},      expiryDate:new Date(Date.now()+5*3600000) },
    { _id:'d9', foodName:'Fresh Yogurt',      category:'dairy',    quantity:5,  unit:'kg',       pickupAddress:'Mingora, Swat',  donor:{name:'Local Dairy Farm'},   expiryDate:new Date(Date.now()+24*3600000) },
  ]

  useEffect(() => {
    const fetchPublic = async () => {
      try {
        const { data } = await API.get('/food')
        if (data && data.length > 0) { setListings(data); setFiltered(data) }
        else { setListings(demoFoods); setFiltered(demoFoods) }
      } catch { setListings(demoFoods); setFiltered(demoFoods) }
      setLoading(false)
    }
    fetchPublic()
  }, [])

  useEffect(() => {
    let r = listings
    if (activeFilter !== 'all') r = r.filter(f => (f.category||f.cat) === activeFilter)
    if (search) r = r.filter(f =>
      (f.foodName||f.name||'').toLowerCase().includes(search.toLowerCase()) ||
      (f.pickupAddress||f.loc||'').toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(r)
  }, [search, activeFilter, listings])

  const getHrs = (d) => d ? Math.ceil((new Date(d)-new Date())/(1000*60*60)) : null
  const getChip = (h) => {
    if (h===null) return null
    if (h<=4)  return { label:`⚡ ${h}h left`, bg:'#FEE2E2', color:'#DC2626' }
    if (h<=12) return { label:`⏰ ${h}h left`, bg:'#FEF9C3', color:'#A16207' }
    return { label:`✅ ${h}h left`, bg:'#DBEAFE', color:'#1D4ED8' }
  }

  const handleClaim = async (food) => {
    if (!food?._id) return
    if (!user) {
      toast.error('Please sign in to claim food.')
      navigate('/login')
      return
    }
    const allowedRoles = ['ngo', 'user']
    if (!allowedRoles.includes(user.role?.toLowerCase())) {
      toast.error('Only NGO and regular user accounts can claim donations.')
      return
    }
    if (requested[food._id]) {
      toast('Request already sent for this donation.')
      return
    }

    try {
      setClaimingId(food._id)
      await API.post('/food/requests', {
        foodId: food._id,
        requesterId: user._id,
        requesterRole: user.role,
      })
      setRequested((prev) => ({ ...prev, [food._id]: true }))
      setListings((prev) => prev.filter((item) => item._id !== food._id))
      setFiltered((prev) => prev.filter((item) => item._id !== food._id))
      setSelectedFood(null)
      toast.success(`Request sent to ${food.donor?.name || 'donor'} successfully.`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send pickup request.')
    } finally {
      setClaimingId(null)
    }
  }

  const cat = {
    cooked:   { label:'🍳 Cooked',     bg:'#FEF3E2', c:'#B45309', ib:'linear-gradient(135deg,#FFF7ED,#FEE0B0)', e:'🍛' },
    raw:      { label:'🥦 Vegetables', bg:'#DCFCE7', c:'#15803D', ib:'linear-gradient(135deg,#F0FDF4,#BBF7D0)', e:'🥦' },
    bakery:   { label:'🥖 Bakery',     bg:'#FEF9C3', c:'#A16207', ib:'linear-gradient(135deg,#FEFCE8,#FDE68A)', e:'🥖' },
    dairy:    { label:'🥛 Dairy',      bg:'#EDE9FE', c:'#7C3AED', ib:'linear-gradient(135deg,#F5F3FF,#DDD6FE)', e:'🥛' },
    packaged: { label:'📦 Packaged',   bg:'#DBEAFE', c:'#1D4ED8', ib:'linear-gradient(135deg,#EFF6FF,#BFDBFE)', e:'📦' },
    other:    { label:'🍽️ Other',     bg:'#F4F4F0', c:'#4A4A46', ib:'linear-gradient(135deg,#FAFAF8,#E8E8E4)', e:'🍽️' },
  }

  const ticker = ['🍛 Biryani — 15 plates · Mingora','🥖 Fresh Bread — 8 loaves · Saidu Sharif','🥦 Vegetables — 5kg · Matta','🍰 Bakery Items — 20 pieces · Khwazakhela','🥛 Milk — 10 liters · Kabal','🍚 Cooked Rice — 12 plates · Mingora','🥗 Mixed Salad — 6 portions · Fizagat']

  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:'#F4F6FB',color:'#0F1C35',overflowX:'hidden'}}>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,800;1,9..144,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes blobMove{0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%}}
        @keyframes pulseDot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:0.6}}
        @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
        .au{animation:fadeUp 0.65s cubic-bezier(.22,1,.36,1) both;opacity:0}
        .d1{animation-delay:.05s}.d2{animation-delay:.12s}.d3{animation-delay:.2s}.d4{animation-delay:.28s}.d5{animation-delay:.36s}.d6{animation-delay:.44s}
        .skel{background:linear-gradient(90deg,#E8EEF8 25%,#D8E2F0 50%,#E8EEF8 75%);background-size:600px 100%;animation:shimmer 1.4s infinite;border-radius:10px}
        .food-card{background:white;border-radius:20px;overflow:hidden;border:1px solid #D8E2F0;transition:all 0.35s cubic-bezier(.34,1.56,.64,1);cursor:pointer;position:relative}
        .food-card:hover{transform:translateY(-10px) scale(1.015);box-shadow:0 24px 60px rgba(27,58,107,0.18);border-color:#1B3A6B}
        .food-card:hover .femoji{transform:scale(1.15) rotate(6deg)}
        .food-card:hover .cbtn{background:linear-gradient(135deg,#112850,#1B3A6B)!important;transform:translateY(-2px);box-shadow:0 8px 24px rgba(27,58,107,0.4)!important}
        .food-card:hover .gold-bar{width:100%!important}
        .femoji{transition:transform 0.35s ease;display:block;font-size:72px}
        .cbtn{transition:all 0.25s ease}
        .gold-bar{transition:width 0.4s ease}
        .fpill{padding:9px 20px;border-radius:24px;font-size:13px;font-weight:600;border:2px solid #D8E2F0;background:white;color:#4A5568;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.25s cubic-bezier(.34,1.56,.64,1)}
        .fpill:hover{border-color:#1B3A6B;color:#1B3A6B;background:#EEF3FB;transform:translateY(-2px);box-shadow:0 4px 12px rgba(27,58,107,0.12)}
        .fpill.active{background:linear-gradient(135deg,#1B3A6B,#2A52A0);color:white;border-color:#1B3A6B;transform:translateY(-2px);box-shadow:0 6px 18px rgba(27,58,107,0.3)}
        .sbox{transition:all 0.3s ease;cursor:default}
        .sbox:hover{transform:translateY(-4px);background:linear-gradient(135deg,#1B3A6B,#2A52A0)!important}
        .sbox:hover .snum{color:#F0C040!important}
        .sbox:hover .slbl{color:rgba(255,255,255,0.8)!important}
        .step-c{transition:all 0.3s ease}
        .step-c:hover{transform:translateY(-6px)}
        .step-c:hover .sicon{background:linear-gradient(135deg,#D4A017,#F0C040)!important;transform:scale(1.1) rotate(-6deg);box-shadow:0 8px 24px rgba(212,160,23,0.5)!important}
        .sicon{transition:all 0.3s ease}
        .hbp{background:linear-gradient(135deg,#D4A017,#F0C040);color:#0F1C35;border:none;padding:15px 32px;border-radius:14px;font-size:16px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;display:inline-flex;align-items:center;gap:9px;transition:all 0.25s cubic-bezier(.34,1.56,.64,1);box-shadow:0 4px 18px rgba(212,160,23,0.4)}
        .hbp:hover{transform:translateY(-3px) scale(1.04);box-shadow:0 10px 32px rgba(212,160,23,0.55)}
        .hbs{background:rgba(255,255,255,0.1);color:white;border:2px solid rgba(255,255,255,0.4);padding:15px 32px;border-radius:14px;font-size:16px;font-weight:600;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;display:inline-flex;align-items:center;gap:9px;transition:all 0.25s ease;backdrop-filter:blur(8px);text-decoration:none}
        .hbs:hover{background:rgba(255,255,255,0.2);border-color:white;transform:translateY(-3px)}
        .ctap{background:linear-gradient(135deg,#D4A017,#F0C040);color:#0F1C35;padding:15px 32px;border-radius:14px;font-size:15px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:all 0.25s cubic-bezier(.34,1.56,.64,1);box-shadow:0 4px 18px rgba(212,160,23,0.4)}
        .ctap:hover{transform:translateY(-3px) scale(1.04);box-shadow:0 10px 32px rgba(212,160,23,0.55)}
        .ctas{background:white;color:#1B3A6B;border:2px solid #1B3A6B;padding:15px 32px;border-radius:14px;font-size:15px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:all 0.25s cubic-bezier(.34,1.56,.64,1)}
        .ctas:hover{background:#1B3A6B;color:white;transform:translateY(-3px);box-shadow:0 8px 24px rgba(27,58,107,0.3)}
        .ncta{background:linear-gradient(135deg,#D4A017,#F0C040);color:#0F1C35;border:none;padding:10px 22px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.25s cubic-bezier(.34,1.56,.64,1);box-shadow:0 3px 12px rgba(212,160,23,0.35);text-decoration:none;display:inline-flex;align-items:center;gap:7px}
        .ncta:hover{transform:translateY(-2px) scale(1.05);box-shadow:0 8px 22px rgba(212,160,23,0.5)}
        .nlnk{padding:8px 16px;border-radius:8px;font-size:14px;font-weight:500;color:#4A5568;background:none;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.2s ease;text-decoration:none;display:inline-block}
        .nlnk:hover{background:#EEF3FB;color:#1B3A6B;transform:translateY(-1px)}
        .mopt{border:2px solid #D8E2F0;border-radius:14px;padding:16px;text-align:center;cursor:pointer;transition:all 0.25s cubic-bezier(.34,1.56,.64,1)}
        .mopt:hover{border-color:#1B3A6B;background:#EEF3FB;transform:translateY(-3px);box-shadow:0 6px 18px rgba(27,58,107,0.12)}
        .mopt.sel{border-color:#D4A017;background:linear-gradient(135deg,#FFFBEB,#FEF3C7);transform:translateY(-3px);box-shadow:0 6px 18px rgba(212,160,23,0.2)}
        .hfc{transition:transform 0.3s ease,box-shadow 0.3s ease}
        .hfc:hover{box-shadow:0 16px 40px rgba(27,58,107,0.25)!important;animation:none!important}
        .srch:focus-within{border-color:#1B3A6B!important;box-shadow:0 0 0 4px rgba(27,58,107,0.1)!important}
      `}</style>

      {/* NAV */}
      <nav style={{background:'rgba(255,255,255,0.95)',backdropFilter:'blur(20px)',borderBottom:'1px solid #D8E2F0',position:'sticky',top:0,zIndex:100,padding:'0 32px',boxShadow:'0 2px 20px rgba(27,58,107,0.06)'}}>
        <div style={{maxWidth:1140,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',height:66}}>
          <Link to="/" style={{display:'flex',alignItems:'center',gap:11,textDecoration:'none'}}>
            <div style={{width:38,height:38,background:'linear-gradient(135deg,#1B3A6B,#2A52A0)',borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,boxShadow:'0 4px 12px rgba(27,58,107,0.3)'}}>🌾</div>
            <span style={{fontFamily:'Fraunces,serif',fontSize:22,fontWeight:800,background:'linear-gradient(135deg,#1B3A6B,#D4A017)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>FoodSave</span>
          </Link>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button className="nlnk" onClick={()=>document.getElementById('ls').scrollIntoView({behavior:'smooth'})}>Browse Food</button>
            <button className="nlnk" onClick={()=>document.getElementById('hw').scrollIntoView({behavior:'smooth'})}>How it works</button>
            {user ? (
              <>
                <button onClick={() => navigate(getDashboardPath() || '/')} className="ncta">Dashboard</button>
                <button onClick={() => { logout(); navigate('/login') }} className="nb-ghost" style={{ padding:'8px 16px' }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nlnk">Sign in</Link>
                <Link to="/register" className="ncta">🌾 Donate Food</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{background:'linear-gradient(145deg,#0F1C35 0%,#1B3A6B 55%,#162D58 100%)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-120,right:-120,width:480,height:480,borderRadius:'50%',background:'radial-gradient(circle,rgba(212,160,23,0.15),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:-80,left:-80,width:360,height:360,borderRadius:'50%',background:'radial-gradient(circle,rgba(42,82,160,0.3),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{maxWidth:1140,margin:'0 auto',padding:'90px 32px 80px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:72,alignItems:'center',position:'relative',zIndex:1}}>
          <div className="au d1">
            <div style={{display:'inline-flex',alignItems:'center',gap:9,background:'rgba(212,160,23,0.15)',border:'1px solid rgba(212,160,23,0.35)',color:'#F0C040',padding:'7px 16px',borderRadius:24,fontSize:13,fontWeight:600,marginBottom:24,backdropFilter:'blur(8px)'}}>
              <span style={{width:8,height:8,background:'#F0C040',borderRadius:'50%',animation:'pulseDot 2s infinite',display:'inline-block'}}/>
              Live donations in your area
            </div>
            <h1 style={{fontFamily:'Fraunces,serif',fontSize:58,fontWeight:800,lineHeight:1.06,color:'white',marginBottom:22}}>
              Good food<br/>
              <em style={{fontStyle:'italic',background:'linear-gradient(135deg,#D4A017,#F0C040)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>deserves a</em><br/>
              second chance.
            </h1>
            <p style={{fontSize:17,color:'rgba(255,255,255,0.72)',lineHeight:1.75,marginBottom:36,maxWidth:460}}>
              FoodSave connects surplus food from restaurants, stores, and homes to communities that need it. Browse freely — no account needed.
            </p>
            <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
              <button className="hbp" onClick={()=>document.getElementById('ls').scrollIntoView({behavior:'smooth'})}>🍱 Browse Food Now</button>
              <Link to="/register" className="hbs">➕ Donate Food</Link>
            </div>
            <div style={{display:'flex',gap:28,marginTop:36,flexWrap:'wrap'}}>
              {[['500+','Donations'],['50+','NGOs'],['2,000+','Meals saved']].map(([n,l])=>(
                <div key={l}>
                  <div style={{fontFamily:'Fraunces,serif',fontSize:24,fontWeight:800,color:'#F0C040'}}>{n}</div>
                  <div style={{fontSize:13,color:'rgba(255,255,255,0.55)',marginTop:1}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="au d3" style={{position:'relative',height:420}}>
            <div style={{position:'absolute',width:340,height:340,background:'linear-gradient(135deg,rgba(212,160,23,0.1),rgba(27,58,107,0.2))',top:'50%',left:'50%',transform:'translate(-50%,-50%)',animation:'blobMove 9s ease-in-out infinite',borderRadius:'60% 40% 30% 70%/60% 30% 70% 40%',border:'1px solid rgba(212,160,23,0.12)'}}/>
            <div className="hfc" style={{position:'absolute',top:10,right:0,width:248,background:'rgba(255,255,255,0.97)',borderRadius:22,padding:20,boxShadow:'0 12px 40px rgba(0,0,0,0.25)',border:'1px solid rgba(212,160,23,0.3)',animation:'float 3s ease-in-out infinite',backdropFilter:'blur(12px)'}}>
              <div style={{fontSize:40,marginBottom:10}}>🍛</div>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'#8A96A8',marginBottom:5}}>Just listed</div>
              <div style={{fontFamily:'Fraunces,serif',fontSize:17,fontWeight:700,color:'#0F1C35'}}>Fresh Biryani</div>
              <div style={{fontSize:13,color:'#4A5568',marginTop:3}}>15 plates · Mingora, Swat</div>
              <div style={{display:'flex',gap:6,marginTop:12}}>
                <span style={{background:'#DBEAFE',color:'#1D4ED8',fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:7}}>🔵 Available</span>
                <span style={{background:'#FEF3E2',color:'#B45309',fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:7}}>⏰ 4h left</span>
              </div>
              <div style={{marginTop:12,height:3,borderRadius:4,background:'linear-gradient(90deg,#1B3A6B,#D4A017)'}}/>
            </div>
            <div className="hfc" style={{position:'absolute',bottom:55,left:0,background:'rgba(255,255,255,0.97)',borderRadius:18,padding:'13px 17px',boxShadow:'0 8px 28px rgba(0,0,0,0.2)',border:'1px solid rgba(27,58,107,0.15)',animation:'float 3.8s ease-in-out infinite 0.6s',display:'flex',alignItems:'center',gap:13,backdropFilter:'blur(12px)'}}>
              <div style={{width:40,height:40,background:'linear-gradient(135deg,#FEF9C3,#FDE68A)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>🥖</div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:'#0F1C35'}}>Fresh Bread — 8 loaves</div>
                <div style={{fontSize:11,color:'#8A96A8',marginTop:1}}>Ahmad Bakery · 2 min ago</div>
              </div>
            </div>
            <div style={{position:'absolute',top:'42%',left:18,background:'linear-gradient(135deg,#D4A017,#F0C040)',color:'#0F1C35',padding:'9px 16px',borderRadius:14,fontSize:13,fontWeight:800,animation:'float 4.2s ease-in-out infinite 1s',whiteSpace:'nowrap',boxShadow:'0 6px 20px rgba(212,160,23,0.55)'}}>
              🚀 3 new listings today
            </div>
          </div>
        </div>
      </div>

      {/* TICKER */}
      <div style={{background:'linear-gradient(90deg,#D4A017,#E8B820,#D4A017)',padding:'12px 0',overflow:'hidden'}}>
        <div style={{display:'flex',animation:'marquee 22s linear infinite',width:'max-content'}}>
          {[...ticker,...ticker].map((t,i)=>(
            <span key={i} style={{display:'inline-flex',alignItems:'center',gap:10,padding:'0 30px',color:'#0F1C35',fontSize:13,fontWeight:700,whiteSpace:'nowrap'}}>
              {t} <span style={{width:5,height:5,background:'rgba(15,28,53,0.35)',borderRadius:'50%',display:'inline-block'}}/>
            </span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div style={{background:'white',borderBottom:'1px solid #D8E2F0',padding:'0 32px'}}>
        <div style={{maxWidth:1140,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(4,1fr)'}}>
          {[['500+','Donations made'],['50+','NGOs registered'],['2,000+','Meals saved'],['200+','Active donors']].map(([n,l],i)=>(
            <div key={i} className={`sbox au d${i+1}`} style={{padding:'26px 22px',textAlign:'center',borderRight:i<3?'1px solid #D8E2F0':'none',borderRadius:0}}>
              <div className="snum" style={{fontFamily:'Fraunces,serif',fontSize:34,fontWeight:800,color:'#1B3A6B',transition:'color 0.3s'}}>{n}</div>
              <div className="slbl" style={{fontSize:13,color:'#8A96A8',marginTop:3,transition:'color 0.3s'}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    {/* <div className="au d4" style={{ opacity: 1 }}>
      <ActiveGuidelines />
    </div> */}

      {/* LISTINGS */}
      <div style={{maxWidth:1140,margin:'0 auto',padding:'72px 32px'}} id="ls">
        <div className="au d1" style={{marginBottom:8}}>
          <span style={{display:'inline-block',background:'linear-gradient(135deg,#EEF3FB,#DBEAFE)',color:'#1B3A6B',fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.09em',padding:'5px 14px',borderRadius:7,marginBottom:18,border:'1px solid #BFDBFE'}}>🔵 Live Now</span>
          <h2 style={{fontFamily:'Fraunces,serif',fontSize:42,fontWeight:800,color:'#0F1C35',marginBottom:12,lineHeight:1.12}}>Available Food Near You</h2>
          <p style={{fontSize:16,color:'#4A5568',maxWidth:520,lineHeight:1.65}}>Everything below is free — browse without an account. Create a free account to claim or donate.</p>
        </div>

        {/* Filters */}
        <div className="au d2" style={{display:'flex',alignItems:'center',gap:10,margin:'32px 0 28px',flexWrap:'wrap'}}>
          <div className="srch" style={{display:'flex',alignItems:'center',gap:10,background:'white',border:'2px solid #D8E2F0',borderRadius:12,padding:'10px 16px',minWidth:240,flex:1,maxWidth:300,transition:'all 0.2s'}}>
            <span style={{fontSize:16}}>🔍</span>
            <input placeholder="Search food or location..." value={search} onChange={e=>setSearch(e.target.value)}
              style={{border:'none',outline:'none',fontFamily:'inherit',fontSize:14,color:'#0F1C35',background:'transparent',width:'100%'}}/>
          </div>
          {[['all','All'],['cooked','🍳 Cooked'],['raw','🥦 Vegetables'],['bakery','🥖 Bakery'],['dairy','🥛 Dairy'],['packaged','📦 Packaged']].map(([v,l])=>(
            <button key={v} className={`fpill ${activeFilter===v?'active':''}`} onClick={()=>setActiveFilter(v)}>{l}</button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:22}}>
            {[1,2,3,4,5,6].map(i=>(
              <div key={i} style={{background:'white',borderRadius:20,overflow:'hidden',border:'1px solid #D8E2F0'}}>
                <div className="skel" style={{height:164,borderRadius:0}}/>
                <div style={{padding:18}}>
                  <div className="skel" style={{height:18,width:'70%',marginBottom:12}}/>
                  <div className="skel" style={{height:14,width:'90%',marginBottom:8}}/>
                  <div className="skel" style={{height:14,width:'55%',marginBottom:14}}/>
                  <div className="skel" style={{height:40}}/>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length===0 ? (
          <div style={{textAlign:'center',padding:'90px 20px'}}>
            <div style={{fontSize:60,marginBottom:16}}>🔍</div>
            <p style={{fontSize:20,fontWeight:700,color:'#4A5568',marginBottom:8,fontFamily:'Fraunces,serif'}}>No results found</p>
            <p style={{fontSize:15,color:'#8A96A8'}}>Try a different category or search term</p>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:22}}>
            {filtered.map((food,i)=>{
              const name=food.foodName||food.name
              const c=food.category||food.cat||'other'
              const qty=`${food.quantity||''} ${food.unit||''}`.trim()
              const addr=food.pickupAddress||food.loc||''
              const dn=food.donor?.name||'Anonymous'
              const hrs=food.expiryDate?getHrs(food.expiryDate):null
              const chip=getChip(hrs)
              const cf=cat[c]||cat.other
              return (
                <div key={food._id} className={`food-card au d${Math.min(i+1,6)}`} onClick={()=>setSelectedFood(food)}>
                  <div className="gold-bar" style={{position:'absolute',bottom:0,left:0,height:3,width:0,background:'linear-gradient(90deg,#1B3A6B,#D4A017)',zIndex:2}}/>
                  <div style={{height:164,background:cf.ib,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
                    <span className="femoji">{cf.e}</span>
                    <div style={{position:'absolute',top:12,right:12}}>
                      <span style={{background:cf.bg,color:cf.c,fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:20}}>{cf.label}</span>
                    </div>
                  </div>
                  <div style={{padding:18}}>
                    <h3 style={{fontFamily:'Fraunces,serif',fontSize:18,fontWeight:700,color:'#0F1C35',marginBottom:10,lineHeight:1.2}}>{name}</h3>
                    <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:12}}>
                      <div style={{display:'flex',alignItems:'center',gap:7,fontSize:13,color:'#4A5568'}}>
                        <span>📦</span><strong style={{color:'#0F1C35'}}>{qty}</strong>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:7,fontSize:13,color:'#4A5568'}}>
                        <span>📍</span>{addr}
                      </div>
                      {chip&&<span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:12,fontWeight:700,padding:'4px 10px',borderRadius:7,background:chip.bg,color:chip.color,width:'fit-content'}}>{chip.label}</span>}
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:9,paddingTop:12,borderTop:'1px solid #EEF3FB',marginBottom:14}}>
                      <div style={{width:30,height:30,borderRadius:9,background:'linear-gradient(135deg,#1B3A6B,#2A52A0)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'white',flexShrink:0}}>
                        {dn.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:'#0F1C35'}}>{dn}</div>
                        <div style={{fontSize:11,color:'#8A96A8'}}>✓ Verified donor</div>
                      </div>
                    </div>
                    <button className="cbtn" onClick={e=>{e.stopPropagation();handleClaim(food)}}
                      disabled={claimingId===food._id || requested[food._id]}
                      style={{width:'100%',background:'linear-gradient(135deg,#1B3A6B,#2A52A0)',color:'white',border:'none',padding:'12px',borderRadius:11,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:7,boxShadow:'0 4px 16px rgba(27,58,107,0.3)'}}>
                      {claimingId===food._id ? 'Requesting…' : requested[food._id] ? 'Requested' : '👆 Claim this food'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="au" style={{textAlign:'center',marginTop:52}}>
          <p style={{fontSize:14,color:'#8A96A8',marginBottom:18}}>Want to get notified of new listings? Create a free account.</p>
          <Link to="/register" className="ctap">Create Free Account →</Link>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{background:'linear-gradient(145deg,#0F1C35,#1B3A6B)',padding:'80px 32px',position:'relative',overflow:'hidden'}} id="hw">
        <div style={{position:'absolute',top:-100,right:-100,width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(212,160,23,0.1),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{maxWidth:1140,margin:'0 auto',position:'relative',zIndex:1}}>
          <div className="au d1" style={{marginBottom:52}}>
            <span style={{display:'inline-block',background:'rgba(212,160,23,0.15)',border:'1px solid rgba(212,160,23,0.3)',color:'#F0C040',fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.09em',padding:'5px 14px',borderRadius:7,marginBottom:18}}>Simple process</span>
            <h2 style={{fontFamily:'Fraunces,serif',fontSize:42,fontWeight:800,color:'white',marginBottom:10,lineHeight:1.12}}>How FoodSave works</h2>
            <p style={{fontSize:16,color:'rgba(255,255,255,0.6)',maxWidth:480}}>Three simple steps — from donation to delivery</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:36}}>
            {[
              {num:'01',e:'🍱',t:'Donor lists food',d:'Restaurants, stores, and individuals post surplus food with quantity, category, and expiry details.'},
              {num:'02',e:'🏢',t:'NGO requests pickup',d:'Registered NGOs or individuals browse listings and send a pickup request to the donor instantly.'},
              {num:'03',e:'🚗',t:'Food gets delivered',d:'A driver is assigned or you self-collect. Real-time tracking ensures food arrives safely.'},
            ].map((s,i)=>(
              <div key={i} className={`step-c au d${i+2}`} style={{position:'relative'}}>
                <div style={{fontFamily:'Fraunces,serif',fontSize:72,fontWeight:800,color:'rgba(255,255,255,0.07)',lineHeight:1,marginBottom:-20}}>{s.num}</div>
                <div className="sicon" style={{width:58,height:58,background:'rgba(255,255,255,0.1)',borderRadius:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,marginBottom:18,border:'1px solid rgba(255,255,255,0.1)'}}>{s.e}</div>
                <h3 style={{fontFamily:'Fraunces,serif',fontSize:21,fontWeight:700,color:'white',marginBottom:10}}>{s.t}</h3>
                <p style={{fontSize:14,color:'rgba(255,255,255,0.65)',lineHeight:1.65}}>{s.d}</p>
                {i<2&&<div style={{position:'absolute',top:72,right:-18,color:'rgba(212,160,23,0.4)',fontSize:26}}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{padding:'88px 32px',textAlign:'center',background:'white'}}>
        <div style={{maxWidth:640,margin:'0 auto'}} className="au">
          <div style={{width:84,height:84,background:'linear-gradient(135deg,#EEF3FB,#DBEAFE)',borderRadius:26,display:'flex',alignItems:'center',justifyContent:'center',fontSize:42,margin:'0 auto 28px',animation:'float 3.5s ease-in-out infinite',boxShadow:'0 8px 28px rgba(27,58,107,0.12)',border:'2px solid #BFDBFE'}}>🌍</div>
          <h2 style={{fontFamily:'Fraunces,serif',fontSize:44,fontWeight:800,color:'#0F1C35',marginBottom:16,lineHeight:1.12}}>Ready to make a difference?</h2>
          <p style={{fontSize:17,color:'#4A5568',marginBottom:36,lineHeight:1.65}}>Join hundreds of donors, NGOs, and volunteers already fighting food waste in Swat and beyond.</p>
          <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
            <Link to="/register" className="ctap">🌾 Start Donating</Link>
            <Link to="/register" className="ctas">🏢 Register as NGO</Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{background:'#0F1C35',padding:'44px 32px',textAlign:'center',borderTop:'3px solid #D4A017'}}>
        <div style={{fontFamily:'Fraunces,serif',fontSize:24,fontWeight:800,background:'linear-gradient(135deg,#FFFFFF,#F0C040)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:12}}>🌾 FoodSave</div>
        <p style={{fontSize:13,color:'rgba(255,255,255,0.45)',lineHeight:1.8}}>
          Final Year Project — BS Computer Science<br/>
          Jahanzeb College, Saidu Sharif, Swat · Session 2022–2026<br/>
          Mansoor Ali & Ahmad Fawad · Supervised by Asst Prof Mr.Shah Faisal
        </p>
      </footer>

      {/* MODAL */}
      {selectedFood&&(()=>{
        const name=selectedFood.foodName||selectedFood.name
        const qty=`${selectedFood.quantity||''} ${selectedFood.unit||''}`.trim()
        const c=selectedFood.category||selectedFood.cat||'other'
        const cf=cat[c]||cat.other
        const hrs=selectedFood.expiryDate?getHrs(selectedFood.expiryDate):null
        const chip=getChip(hrs)
        return(
          <div onClick={e=>{if(e.target===e.currentTarget)setSelectedFood(null)}}
            style={{position:'fixed',inset:0,background:'rgba(10,20,50,0.65)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16,backdropFilter:'blur(8px)',animation:'scaleIn 0.2s ease'}}>
            <div style={{background:'white',borderRadius:26,width:'100%',maxWidth:460,overflow:'hidden',boxShadow:'0 32px 80px rgba(10,20,50,0.4)',animation:'slideUp 0.3s cubic-bezier(.34,1.56,.64,1)'}}>
              <div style={{background:'linear-gradient(135deg,#0F1C35,#1B3A6B)',padding:'26px 28px',position:'relative'}}>
                <div style={{position:'absolute',top:0,right:0,width:120,height:120,borderRadius:'50%',background:'radial-gradient(circle,rgba(212,160,23,0.2),transparent 70%)',pointerEvents:'none'}}/>
                <h3 style={{fontFamily:'Fraunces,serif',fontSize:24,fontWeight:800,color:'white',marginBottom:5}}>Claim this donation</h3>
                <p style={{fontSize:14,color:'rgba(255,255,255,0.65)'}}>How would you like to get this food?</p>
              </div>
              <div style={{padding:26}}>
                <div style={{background:'linear-gradient(135deg,#EEF3FB,#DBEAFE)',borderRadius:14,padding:16,marginBottom:22,display:'flex',alignItems:'center',gap:16,border:'1px solid #BFDBFE'}}>
                  <span style={{fontSize:40}}>{cf.e}</span>
                  <div>
                    <div style={{fontFamily:'Fraunces,serif',fontSize:17,fontWeight:800,color:'#0F1C35'}}>{name}</div>
                    <div style={{fontSize:13,color:'#4A5568',marginTop:4,display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                      {qty} · {selectedFood.pickupAddress||selectedFood.loc||''}
                      {chip&&<span style={{background:chip.bg,color:chip.color,fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:6}}>{chip.label}</span>}
                    </div>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:22}}>
                  {[{k:'self',e:'🚶',t:'Self Pickup',s:"I'll go collect it"},{k:'driver',e:'🚗',t:'Request Driver',s:'Assign a driver'}].map(o=>(
                    <div key={o.k} className={`mopt ${pickupOption===o.k?'sel':''}`} onClick={()=>setPickupOption(o.k)}>
                      <div style={{fontSize:30,marginBottom:8}}>{o.e}</div>
                      <div style={{fontSize:14,fontWeight:700,color:'#0F1C35'}}>{o.t}</div>
                      <div style={{fontSize:12,color:'#8A96A8',marginTop:3}}>{o.s}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:'linear-gradient(135deg,#FFFBEB,#FEF3C7)',border:'1px solid #FDE68A',borderRadius:12,padding:'13px 16px',fontSize:13,color:'#A16207',marginBottom:22,lineHeight:1.55}}>
                  🔐 <strong>Account required to claim.</strong> Browsing is free — to claim food or donate, create a free account in 30 seconds.
                </div>
                <div style={{display:'flex',gap:10}}>
                  <Link to="/register" style={{flex:1,background:'linear-gradient(135deg,#D4A017,#F0C040)',color:'#0F1C35',border:'none',padding:14,borderRadius:11,fontSize:14,fontWeight:800,cursor:'pointer',fontFamily:'inherit',textAlign:'center',textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(212,160,23,0.4)'}}>
                    Create Free Account →
                  </Link>
                  <button onClick={()=>setSelectedFood(null)}
                    style={{background:'#F4F6FB',color:'#4A5568',border:'2px solid #D8E2F0',padding:'14px 20px',borderRadius:11,fontSize:14,cursor:'pointer',fontFamily:'inherit',fontWeight:600,transition:'all 0.2s'}}
                    onMouseEnter={e=>{e.target.style.background='#E8EEF8';e.target.style.color='#1B3A6B'}}
                    onMouseLeave={e=>{e.target.style.background='#F4F6FB';e.target.style.color='#4A5568'}}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
