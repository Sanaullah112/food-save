import { useState, useEffect } from 'react'
import API from '../../utils/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'
import { UserPlus, Trash2, Settings, User, Mail, Lock, Phone, MapPin, Check } from 'lucide-react'

export default function AdminSettings() {
  const [drivers, setDrivers] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({name:'',email:'',password:'',phone:'',address:''})
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [creating, setCreating] = useState(false)

  const fetchData = async () => {
    try { const {data} = await API.get('/admin/users'); setDrivers(data.filter(u=>u.role==='driver')); setUsers(data.filter(u=>u.role!=='driver'&&u.role!=='admin')) }
    catch { toast.error('Failed to load') }
    setLoading(false)
  }

  const validate = (n,v) => {
    if(n==='name'){ return !v.trim()?'Name is required':v.trim().length<3?'Min 3 characters':'' }
    if(n==='email'){ return !v.trim()?'Email is required':!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)?'Invalid email':'' }
    if(n==='password'){ return !v?'Password is required':v.length<6?'Min 6 characters':'' }
    if(n==='phone'){ return !v.trim()?'Phone is required':!/^[0-9]{10,11}$/.test(v.replace(/\s/g,''))?'Enter valid number':'' }
    if(n==='address'){ return !v.trim()?'Address is required':'' }
    return ''
  }

  const handleChange = (e) => {
    const {name,value}=e.target
    setForm(p=>({...p,[name]:value}))
    if(touched[name]) setErrors(p=>({...p,[name]:validate(name,value)}))
  }

  const handleBlur = (e) => {
    const {name,value}=e.target
    setTouched(p=>({...p,[name]:true}))
    setErrors(p=>({...p,[name]:validate(name,value)}))
  }

  const createDriver = async (e) => {
    e.preventDefault()
    const fields=['name','email','password','phone','address']
    const newE={},newT={}
    fields.forEach(f=>{newT[f]=true;const err=validate(f,form[f]);if(err)newE[f]=err})
    setTouched(newT);setErrors(newE)
    if(Object.keys(newE).length>0) return
    setCreating(true)
    try {
      await API.post('/auth/register',{...form,role:'driver'})
      toast.success('Driver created!')
      setForm({name:'',email:'',password:'',phone:'',address:''})
      setErrors({});setTouched({})
      fetchData()
    } catch(err) { toast.error(err.response?.data?.message||'Failed') }
    setCreating(false)
  }

  const promoteToDriver = async (id) => {
    if(!window.confirm('Promote this user to driver?')) return
    try { await API.put(`/admin/users/${id}/role`,{role:'driver'}); toast.success('Promoted to driver!'); fetchData() }
    catch { toast.error('Failed') }
  }

  const deleteDriver = async (id) => {
    if(!window.confirm('Delete this driver?')) return
    try { await API.delete(`/admin/users/${id}`); toast.success('Driver deleted'); fetchData() }
    catch { toast.error('Failed') }
  }

  useEffect(()=>{fetchData()},[])

  const inp = {border:'none',outline:'none',fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:14,color:'#0F1C35',background:'transparent',flex:1}

  const Field = ({label,name,icon:Icon,type='text',placeholder}) => (
    <div>
      <label style={{display:'block',fontSize:13,fontWeight:600,color:'#0F1C35',marginBottom:6}}>{label}</label>
      <div style={{display:'flex',alignItems:'center',gap:9,border:`2px solid ${errors[name]&&touched[name]?'#DC2626':form[name]&&!errors[name]&&touched[name]?'#1B3A6B':'#D8E2F0'}`,borderRadius:10,padding:'9px 13px',background:errors[name]&&touched[name]?'#FEF2F2':'white',transition:'all 0.2s'}}>
        <Icon size={14} style={{color:errors[name]&&touched[name]?'#DC2626':form[name]&&!errors[name]&&touched[name]?'#1B3A6B':'#8A96A8',flexShrink:0}}/>
        <input name={name} type={type} autoComplete={type==='password'?'new-password':'off'}
          placeholder={placeholder} value={form[name]} onChange={handleChange} onBlur={handleBlur} style={inp}/>
        {form[name]&&!errors[name]&&touched[name]&&<Check size={13} style={{color:'#1B3A6B',flexShrink:0}}/>}
      </div>
      {errors[name]&&touched[name]&&<p style={{fontSize:12,color:'#DC2626',marginTop:4}}>⚠ {errors[name]}</p>}
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#F4F6FB',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .au{animation:fadeUp 0.5s ease both;opacity:0}.d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}
        .dcard{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:#F4F6FB;border-radius:12px;border:1px solid #D8E2F0;transition:all 0.2s}
        .dcard:hover{background:#EEF3FB;border-color:#1B3A6B}
        .del-ic{color:#DC2626;background:#FEF2F2;border:1px solid #FECACA;padding:7px;border-radius:9px;cursor:pointer;transition:all 0.2s;display:inline-flex}
        .del-ic:hover{background:#DC2626;color:white}
        .promo-btn{font-size:12px;background:linear-gradient(135deg,#FEF9C3,#FDE68A);color:#A16207;border:1px solid #FDE68A;padding:7px 13px;border-radius:8px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.2s}
        .promo-btn:hover{background:linear-gradient(135deg,#D4A017,#F0C040);color:#0F1C35;border-color:#D4A017}
        .sub-btn{background:linear-gradient(135deg,#D4A017,#F0C040);color:#0F1C35;border:none;padding:12px;border-radius:11px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;width:100%;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.25s;box-shadow:0 4px 14px rgba(212,160,23,0.3);margin-top:6px}
        .sub-btn:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(212,160,23,0.5)}
        .sub-btn:disabled{opacity:0.6;cursor:not-allowed}
      `}</style>
      <Navbar/>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'36px 28px'}}>
        <div className="au d1" style={{marginBottom:28}}>
          <h1 style={{fontFamily:'Fraunces,serif',fontSize:30,fontWeight:800,color:'#0F1C35',marginBottom:4,display:'flex',alignItems:'center',gap:10}}>
            <Settings size={26} style={{color:'#1B3A6B'}}/> Admin Settings
          </h1>
          <p style={{fontSize:14,color:'#8A96A8'}}>Create driver accounts and manage roles</p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,marginBottom:24}}>
          {/* Create Driver Form */}
          <div className="au d2" style={{background:'white',borderRadius:20,border:'1px solid #D8E2F0',overflow:'hidden',boxShadow:'0 4px 20px rgba(27,58,107,0.05)'}}>
            <div style={{background:'linear-gradient(135deg,#0F1C35,#1B3A6B)',padding:'20px 24px',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:-30,right:-30,width:100,height:100,borderRadius:'50%',background:'radial-gradient(circle,rgba(212,160,23,0.2),transparent 70%)'}}/>
              <h2 style={{fontFamily:'Fraunces,serif',fontSize:18,fontWeight:700,color:'white',display:'flex',alignItems:'center',gap:9,position:'relative',zIndex:1}}>
                <UserPlus size={18}/> Add New Driver
              </h2>
            </div>
            <div style={{height:3,background:'linear-gradient(90deg,#D4A017,#F0C040)'}}/>
            <div style={{padding:24}}>
              <form onSubmit={createDriver} noValidate autoComplete="off" style={{display:'flex',flexDirection:'column',gap:14}}>
                <Field label="Full Name" name="name" icon={User} placeholder="e.g. Ali Hassan"/>
                <Field label="Email Address" name="email" icon={Mail} type="email" placeholder="e.g. driver@gmail.com"/>
                <Field label="Password" name="password" icon={Lock} type="password" placeholder="Min. 6 characters"/>
                <Field label="Phone Number" name="phone" icon={Phone} placeholder="e.g. 03001234567"/>
                <Field label="Home Address" name="address" icon={MapPin} placeholder="e.g. Kabal, Swat"/>
                <button type="submit" className="sub-btn" disabled={creating}>
                  {creating?<><span style={{width:15,height:15,border:'2px solid rgba(15,28,53,0.3)',borderTop:'2px solid #0F1C35',borderRadius:'50%',animation:'spin 1s linear infinite',display:'inline-block'}}/>Creating...</>:<><UserPlus size={15}/>Create Driver Account</>}
                </button>
              </form>
            </div>
          </div>

          {/* Drivers List */}
          <div className="au d2" style={{background:'white',borderRadius:20,border:'1px solid #D8E2F0',overflow:'hidden',boxShadow:'0 4px 20px rgba(27,58,107,0.05)'}}>
            <div style={{background:'linear-gradient(135deg,#0F1C35,#1B3A6B)',padding:'20px 24px'}}>
              <h2 style={{fontFamily:'Fraunces,serif',fontSize:18,fontWeight:700,color:'white',display:'flex',alignItems:'center',gap:9}}>
                🚗 Registered Drivers
                <span style={{background:'rgba(212,160,23,0.25)',color:'#F0C040',fontSize:12,fontWeight:700,padding:'2px 10px',borderRadius:20}}>{drivers.length}</span>
              </h2>
            </div>
            <div style={{height:3,background:'linear-gradient(90deg,#D4A017,#F0C040)'}}/>
            <div style={{padding:20,display:'flex',flexDirection:'column',gap:10,maxHeight:380,overflowY:'auto'}}>
              {loading ? <p style={{textAlign:'center',color:'#8A96A8',padding:20}}>Loading...</p>
              : drivers.length===0 ? (
                <div style={{textAlign:'center',padding:'40px 20px'}}>
                  <div style={{fontSize:40,marginBottom:10}}>🚗</div>
                  <p style={{fontSize:14,color:'#8A96A8'}}>No drivers yet</p>
                  <p style={{fontSize:12,color:'#AEAEA8',marginTop:4}}>Use the form to add drivers</p>
                </div>
              ) : drivers.map(d=>(
                <div key={d._id} className="dcard">
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:36,height:36,background:'linear-gradient(135deg,#1B3A6B,#2A52A0)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:'white',flexShrink:0}}>{d.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#0F1C35'}}>{d.name}</div>
                      <div style={{fontSize:11,color:'#8A96A8'}}>{d.email}</div>
                      <div style={{fontSize:11,color:'#8A96A8'}}>{d.phone||'No phone'}</div>
                    </div>
                  </div>
                  <button className="del-ic" onClick={()=>deleteDriver(d._id)}><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Promote Users */}
        <div className="au d3" style={{background:'white',borderRadius:20,border:'1px solid #D8E2F0',overflow:'hidden',boxShadow:'0 4px 20px rgba(27,58,107,0.05)'}}>
          <div style={{background:'linear-gradient(135deg,#0F1C35,#1B3A6B)',padding:'20px 24px'}}>
            <h2 style={{fontFamily:'Fraunces,serif',fontSize:18,fontWeight:700,color:'white'}}>⬆️ Promote Existing User to Driver</h2>
            <p style={{fontSize:13,color:'rgba(255,255,255,0.6)',marginTop:3}}>Promote any donor or NGO account to driver role</p>
          </div>
          <div style={{height:3,background:'linear-gradient(90deg,#D4A017,#F0C040)'}}/>
          <div style={{padding:20}}>
            {loading ? <p style={{color:'#8A96A8'}}>Loading...</p>
            : users.length===0 ? <p style={{color:'#8A96A8',textAlign:'center',padding:20}}>No users available</p>
            : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
                {users.map(u=>(
                  <div key={u._id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:'#F4F6FB',borderRadius:12,border:'1px solid #D8E2F0',transition:'all 0.2s'}}
                    onMouseEnter={e=>{e.currentTarget.style.background='#EEF3FB';e.currentTarget.style.borderColor='#1B3A6B'}}
                    onMouseLeave={e=>{e.currentTarget.style.background='#F4F6FB';e.currentTarget.style.borderColor='#D8E2F0'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:32,height:32,background:'linear-gradient(135deg,#1B3A6B,#2A52A0)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'white'}}>{u.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:'#0F1C35'}}>{u.name}</div>
                        <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:10,background:u.role==='donor'?'#DCFCE7':'#DBEAFE',color:u.role==='donor'?'#15803D':'#1D4ED8'}}>{u.role}</span>
                      </div>
                    </div>
                    <button className="promo-btn" onClick={()=>promoteToDriver(u._id)}>Make Driver</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}