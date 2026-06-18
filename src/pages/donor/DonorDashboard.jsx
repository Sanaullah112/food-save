import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../../utils/api'
import Navbar from '../../components/Navbar'
import { PlusCircle, Package, Clock, CheckCircle, Trash2, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

const T = {p:'#1B3A6B',pd:'#112850',pl:'#EEF3FB',g:'#D4A017',gl:'#FFFBEB',s:'#F4F6FB',b:'#D8E2F0',t:'#0F1C35',tm:'#4A5568',tl:'#8A96A8'}

const css = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  .au{animation:fadeUp 0.5s cubic-bezier(.22,1,.36,1) both;opacity:0}
  .d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}.d4{animation-delay:.2s}.d5{animation-delay:.25s}.d6{animation-delay:.3s}
  .fcard{background:white;border-radius:18px;border:1px solid #D8E2F0;transition:all 0.3s cubic-bezier(.34,1.56,.64,1);overflow:hidden;position:relative}
  .fcard:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 16px 48px rgba(27,58,107,0.14);border-color:#1B3A6B}
  .fcard:hover .gold-line{width:100%!important}
  .gold-line{transition:width 0.4s ease}
  .scard{background:white;border-radius:16px;border:1px solid #D8E2F0;padding:20px;transition:all 0.3s ease;position:relative;overflow:hidden}
  .scard::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:16px 16px 0 0;transform:scaleX(0);transition:transform 0.3s ease}
  .scard:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(27,58,107,0.1)}
  .scard:hover::before{transform:scaleX(1)}
  .del-btn{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;padding:6px 12px;border-radius:8px;background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;cursor:pointer;font-family:inherit;transition:all 0.2s}
  .del-btn:hover{background:#DC2626;color:white;transform:translateY(-1px)}
  .add-btn{background:linear-gradient(135deg,#D4A017,#F0C040);color:#0F1C35;border:none;padding:11px 22px;border-radius:11px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:7px;transition:all 0.25s cubic-bezier(.34,1.56,.64,1);box-shadow:0 4px 14px rgba(212,160,23,0.35);text-decoration:none}
  .add-btn:hover{transform:translateY(-2px) scale(1.04);box-shadow:0 8px 24px rgba(212,160,23,0.5)}
  .skel{background:linear-gradient(90deg,#E8EEF8 25%,#D8E2F0 50%,#E8EEF8 75%);background-size:600px 100%;animation:shimmer 1.4s infinite;border-radius:8px}
  @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}

  /* SweetAlert2 theme overrides */
  .swal2-popup.fb-popup{border-radius:20px;font-family:'Plus Jakarta Sans',sans-serif;padding:28px 24px}
  .swal2-popup.fb-popup .swal2-title{font-family:'Fraunces',serif;color:#0F1C35;font-size:22px;font-weight:800}
  .swal2-popup.fb-popup .swal2-html-container{color:#4A5568;font-size:14px}
  .swal2-popup.fb-popup .swal2-icon.swal2-warning{border-color:#D4A017;color:#D4A017}
  .swal2-popup.fb-popup .swal2-icon.swal2-success{border-color:#15803D;color:#15803D}
  .swal2-popup.fb-popup .swal2-icon.swal2-error{border-color:#DC2626;color:#DC2626}
  .fb-confirm-btn{background:linear-gradient(135deg,#DC2626,#EF4444)!important;color:white!important;border:none!important;padding:11px 22px!important;border-radius:11px!important;font-size:14px!important;font-weight:700!important;font-family:inherit!important;box-shadow:0 4px 14px rgba(220,38,38,0.3)!important}
  .fb-cancel-btn{background:#EEF3FB!important;color:#1B3A6B!important;border:none!important;padding:11px 22px!important;border-radius:11px!important;font-size:14px!important;font-weight:700!important;font-family:inherit!important;margin-right:10px!important}
  .swal2-popup.fb-popup .swal2-actions{gap:0}

  /* Responsive Design for Small Screens */
  @media(max-width:768px){
    .donor-header{flex-direction:column!important;align-items:stretch!important}
    .donor-header h1{font-size:24px!important}
    .donor-header .add-btn{width:100%;justify-content:center}
    .stats-grid{grid-template-columns:repeat(2,1fr)!important;gap:12px!important}
    .listings-grid{grid-template-columns:repeat(auto-fill,minmax(260px,1fr))!important;gap:16px!important}
    .scard{padding:16px!important}
    .scard div:first-child{font-size:28px!important}
    .add-btn{padding:10px 18px;font-size:13px}
  }
  
  @media(max-width:640px){
    .donor-container{padding:20px 16px!important}
    .donor-header{margin-bottom:20px!important}
    .donor-header h1{font-size:22px!important;margin-bottom:2px!important}
    .donor-header p{font-size:13px!important}
    .donor-header .add-btn{width:100%;justify-content:center;padding:10px 16px;font-size:13px}
    .stats-grid{grid-template-columns:1fr!important;gap:10px!important;margin-bottom:20px!important}
    .scard{padding:14px!important}
    .scard div:last-child{font-size:12px!important}
    .listings-grid{grid-template-columns:1fr!important;gap:12px!important}
    .fcard{border-radius:14px}
    .fcard div[style*="padding:18"]{padding:14px!important}
    .del-btn{font-size:11px!important;padding:5px 10px!important}
    .empty-state{padding:48px 20px!important}
    .empty-state h3{font-size:18px!important}
    .empty-state p{font-size:13px!important}
  }
`

export default function DonorDashboard() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchListings = async () => {
    try { const {data} = await API.get('/food/my'); setListings(data) }
    catch { toast.error('Failed to load listings') }
    setLoading(false)
  }

  const deleteListing = async (id, foodName) => {
    const result = await Swal.fire({
      title: 'Delete this listing?',
      html: `<b>${foodName || 'This food listing'}</b> will be permanently removed. This can't be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'fb-popup',
        confirmButton: 'fb-confirm-btn',
        cancelButton: 'fb-cancel-btn',
      },
      buttonsStyling: false,
    })

    if (!result.isConfirmed) return

    try {
      await API.delete(`/food/${id}`)
      Swal.fire({
        title: 'Deleted!',
        text: 'Your listing has been removed.',
        icon: 'success',
        timer: 1800,
        showConfirmButton: false,
        customClass: { popup: 'fb-popup' },
      })
      fetchListings()
    } catch {
      Swal.fire({
        title: 'Something went wrong',
        text: "We couldn't delete this listing. Please try again.",
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: { popup: 'fb-popup', confirmButton: 'fb-confirm-btn' },
        buttonsStyling: false,
      })
    }
  }

  useEffect(()=>{fetchListings()},[])

  const stats = {
    total: listings.length,
    available: listings.filter(l=>l.status==='available').length,
    requested: listings.filter(l=>l.status==='requested').length,
    collected: listings.filter(l=>l.status==='collected').length,
  }

  const catCfg = {
    cooked:{e:'🍛',bg:'#FEF3E2',c:'#B45309'},raw:{e:'🥦',bg:'#DCFCE7',c:'#15803D'},
    bakery:{e:'🥖',bg:'#FEF9C3',c:'#A16207'},dairy:{e:'🥛',bg:'#EDE9FE',c:'#7C3AED'},
    packaged:{e:'📦',bg:'#DBEAFE',c:'#1D4ED8'},other:{e:'🍽️',bg:'#F4F4F0',c:'#4A4A46'},
  }

  const statusBadge = (s) => {
    const m = {available:{bg:'#DCFCE7',c:'#15803D'},requested:{bg:'#FEF9C3',c:'#A16207'},collected:{bg:'#DBEAFE',c:'#1D4ED8'},expired:{bg:'#FEE2E2',c:'#DC2626'}}
    const x = m[s]||m.expired
    return <span style={{background:x.bg,color:x.c,fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20}}>{s}</span>
  }

  const statCards = [
    {label:'Total Listed',value:stats.total,color:'#7C3AED',bg:'#EDE9FE',bar:'#7C3AED'},
    {label:'Available',value:stats.available,color:'#1B3A6B',bg:'#EEF3FB',bar:'#1B3A6B'},
    {label:'Requested',value:stats.requested,color:'#A16207',bg:'#FEF9C3',bar:'#D4A017'},
    {label:'Collected',value:stats.collected,color:'#1D4ED8',bg:'#DBEAFE',bar:'#1D4ED8'},
  ]

  return (
    <div style={{minHeight:'100vh',background:T.s,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{css}</style>
      <Navbar/>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'36px 28px'}} className="donor-container">

        {/* Header */}
        <div className="au d1 donor-header" style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:32,flexWrap:'wrap',gap:16}}>
          <div>
            <h1 style={{fontFamily:'Fraunces,serif',fontSize:30,fontWeight:800,color:T.t,marginBottom:4}}>My Food Listings</h1>
            <p style={{fontSize:14,color:T.tl}}>Manage and track your surplus food donations</p>
          </div>
          <Link to="/donor/add" className="add-btn"><PlusCircle size={17}/>Add Food Listing</Link>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:32}} className="stats-grid">
          {statCards.map(({label,value,color,bg,bar},i)=>(
            <div key={label} className={`scard au d${i+1}`} style={{'--bar':bar}}>
              <style>{`.scard:nth-child(${i+1})::before{background:${bar}}`}</style>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                <div style={{width:40,height:40,background:bg,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <TrendingUp size={18} style={{color}}/>
                </div>
              </div>
              <div style={{fontFamily:'Fraunces,serif',fontSize:32,fontWeight:800,color,marginBottom:2}}>{value}</div>
              <div style={{fontSize:13,color:T.tl}}>{label}</div>
            </div>
          ))}
        </div>

        {/* Listings */}
        {loading ? (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:20}} className="listings-grid">
            {[1,2,3].map(i=>(
              <div key={i} style={{background:'white',borderRadius:18,padding:20,border:'1px solid #D8E2F0'}}>
                <div className="skel" style={{height:16,width:'60%',marginBottom:12}}/>
                <div className="skel" style={{height:13,width:'90%',marginBottom:8}}/>
                <div className="skel" style={{height:13,width:'70%',marginBottom:16}}/>
                <div className="skel" style={{height:36}}/>
              </div>
            ))}
          </div>
        ) : listings.length===0 ? (
          <div style={{background:'white',borderRadius:20,border:'1px solid #D8E2F0',padding:'72px 32px',textAlign:'center'}} className="empty-state">
            <div style={{fontSize:56,marginBottom:16,animation:'float 3s ease-in-out infinite',display:'inline-block'}}>🍱</div>
            <h3 style={{fontFamily:'Fraunces,serif',fontSize:22,fontWeight:700,color:T.t,marginBottom:8}}>No listings yet</h3>
            <p style={{fontSize:14,color:T.tl,marginBottom:24}}>Start by adding your first food donation listing</p>
            <Link to="/donor/add" className="add-btn"><PlusCircle size={16}/>Add Food Listing</Link>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:20}} className="listings-grid">
            {listings.map((l,i)=>{
              const c=catCfg[l.category]||catCfg.other
              return (
                <div key={l._id} className={`fcard au d${Math.min(i+1,6)}`}>
                  <div className="gold-line" style={{position:'absolute',bottom:0,left:0,height:3,width:0,background:'linear-gradient(90deg,#1B3A6B,#D4A017)',zIndex:2}}/>
                  {/* Top color strip */}
                  <div style={{height:6,background:`linear-gradient(90deg,${c.c},${c.bg})`}}/>
                  <div style={{padding:18}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:42,height:42,background:c.bg,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{c.e}</div>
                        <h3 style={{fontFamily:'Fraunces,serif',fontSize:17,fontWeight:700,color:T.t,lineHeight:1.2}}>{l.foodName}</h3>
                      </div>
                      {statusBadge(l.status)}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:5,marginBottom:14}}>
                      <div style={{fontSize:13,color:T.tm,display:'flex',alignItems:'center',gap:6}}>
                        <span style={{background:c.bg,color:c.c,fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:6}}>{l.category}</span>
                        <span style={{fontWeight:600,color:T.t}}>{l.quantity} {l.unit}</span>
                      </div>
                      <div style={{fontSize:13,color:T.tm,display:'flex',alignItems:'center',gap:5}}>📍 {l.pickupAddress}</div>
                      <div style={{fontSize:13,color:T.tm,display:'flex',alignItems:'center',gap:5}}>⏰ Expires: {new Date(l.expiryDate).toLocaleDateString()}</div>
                      {l.description&&<div style={{fontSize:12,color:T.tl,background:T.s,padding:'6px 10px',borderRadius:8,marginTop:4}}>{l.description}</div>}
                    </div>
                    <div style={{display:'flex',justifyContent:'flex-end',paddingTop:10,borderTop:'1px solid #F0F4FA'}}>
                      <button className="del-btn" onClick={()=>deleteListing(l._id, l.foodName)}><Trash2 size={13}/>Delete</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}