import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../utils/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'

// react-icons
import { MdFastfood, MdCategory, MdLocationOn, MdDescription, MdEdit, MdDelete, MdClose, MdCheck, MdWarning } from 'react-icons/md'
import { IoAddCircle, IoLeaf, IoTime } from 'react-icons/io5'
import { BsHash, BsCalendarEvent, BsBoxSeam } from 'react-icons/bs'
import { FiLoader } from 'react-icons/fi'
import { RiMapPin2Fill } from 'react-icons/ri'
import { HiOutlineClipboardList } from 'react-icons/hi'

// ─── palette tokens ───────────────────────────────────────────────────────────
// Forest:   #1a5c38  (deep green - primary)
// Canopy:   #22804f  (mid green - hover)
// Sprout:   #e6f4ec  (very light green - bg tint)
// Mango:    #f59e0b  (amber - accent for warnings/expiry)
// Sky:      #0ea5e9  (blue - claimed status)
// Ash:      #f1f5f4  (page background, slightly green-tinged)
// Coal:     #1c2b22  (near-black text)

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    available: { cls: 'bg-emerald-100 text-emerald-700 ring-emerald-200', label: 'Available' },
    claimed:   { cls: 'bg-sky-100 text-sky-700 ring-sky-200',             label: 'Claimed'   },
    expired:   { cls: 'bg-red-100 text-red-600 ring-red-200',             label: 'Expired'   },
    completed: { cls: 'bg-slate-100 text-slate-500 ring-slate-200',       label: 'Completed' },
  }
  const s = map[status] ?? map.available
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${s.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {s.label}
    </span>
  )
}

// ─── SPINNER ──────────────────────────────────────────────────────────────────
const Spin = ({ size = 16 }) => (
  <FiLoader size={size} className="animate-spin" />
)

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title, sub }) => (
  <div className="flex items-center gap-3 mb-6">
    <div style={{ background: 'linear-gradient(135deg,#1a5c38,#22804f)' }}
      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200 flex-shrink-0">
      <span className="text-white">{icon}</span>
    </div>
    <div>
      <h2 className="text-lg font-bold" style={{ color: '#1c2b22' }}>{title}</h2>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  </div>
)

// ─── FIELD WRAPPER ────────────────────────────────────────────────────────────
const FieldWrap = ({ error, touched, children }) => (
  <div className={`
    flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 bg-white border transition-all duration-150
    ${error && touched
      ? 'border-red-400 bg-red-50 ring-1 ring-red-300'
      : 'border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100'}
  `}>
    {children}
  </div>
)

const FieldIcon = ({ error, touched, children }) => (
  <span className={`flex-shrink-0 ${error && touched ? 'text-red-400' : 'text-slate-400'}`}>
    {children}
  </span>
)

const FieldError = ({ msg }) => msg ? (
  <p className="flex items-center gap-1 text-red-500 text-xs mt-1 ml-1">
    <MdWarning size={11} /> {msg}
  </p>
) : null

// ─── DELETE MODAL ─────────────────────────────────────────────────────────────
const DeleteModal = ({ item, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-red-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
          <MdDelete size={20} className="text-red-600" />
        </div>
        <h3 className="font-bold text-slate-800 text-base">Remove this listing?</h3>
      </div>
      <p className="text-sm text-slate-500 mb-5 ml-13">
        <span className="font-semibold text-slate-700">"{item?.foodName}"</span> will be permanently deleted and can't be recovered.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
          Keep it
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2">
          {loading ? <Spin size={14} /> : <MdDelete size={14} />}
          Yes, delete
        </button>
      </div>
    </div>
  </div>
)

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────
const EditModal = ({ item, onSave, onCancel }) => {
  const [form, setForm] = useState({ ...item })
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const inputCls = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition bg-white text-slate-800"
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-emerald-100">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div style={{ background: 'linear-gradient(135deg,#1a5c38,#22804f)' }}
              className="w-8 h-8 rounded-lg flex items-center justify-center">
              <MdEdit size={15} className="text-white" />
            </div>
            <h3 className="font-bold text-slate-800">Edit Listing</h3>
          </div>
          <button onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <MdClose size={18} />
          </button>
        </div>

        <div className="space-y-3.5">
          {[['foodName','Food Name','text'],['quantity','Quantity','number'],['pickupAddress','Pickup Address','text']].map(([n,l,t]) => (
            <div key={n}>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{l}</label>
              <input type={t} name={n} value={form[n] || ''} onChange={handle} className={inputCls} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Unit</label>
              <select name="unit" value={form.unit} onChange={handle} className={inputCls}>
                {['kg','liters','pieces','boxes','plates'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Category</label>
              <select name="category" value={form.category} onChange={handle} className={inputCls}>
                <option value="cooked">Cooked</option>
                <option value="raw">Raw/Veg</option>
                <option value="packaged">Packaged</option>
                <option value="bakery">Bakery</option>
                <option value="dairy">Dairy</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Expiry Date & Time</label>
            <input type="datetime-local" name="expiryDate" value={form.expiryDate || ''} onChange={handle} className={inputCls} />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onCancel}
            className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
            Cancel
          </button>
          <button onClick={() => onSave(form)}
            style={{ background: 'linear-gradient(135deg,#1a5c38,#22804f)' }}
            className="flex-1 text-white py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90 flex items-center justify-center gap-2 shadow-md shadow-emerald-200">
            <MdCheck size={16} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MAP PICKER ───────────────────────────────────────────────────────────────
const MapPicker = ({ value, onChange }) => {
  const mapRef = useRef(null)
  const leafletMap = useRef(null)
  const markerRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const loadLeaflet = () => {
      if (window.L) { initMap(); return }
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = initMap
      document.head.appendChild(script)
    }
    const initMap = () => {
      if (!mapRef.current || leafletMap.current) return
      const L = window.L
      const defaultPos = value?.lat ? [value.lat, value.lng] : [33.6007, 73.0679]
      const map = L.map(mapRef.current, { zoomControl: true }).setView(defaultPos, 13)
      leafletMap.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map)
      const greenIcon = L.divIcon({
        className: '',
        html: `<div style="background:linear-gradient(135deg,#1a5c38,#22804f);width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 10px rgba(26,92,56,0.5)"></div>`,
        iconSize: [26, 26], iconAnchor: [13, 26]
      })
      if (value?.lat) markerRef.current = L.marker([value.lat, value.lng], { icon: greenIcon }).addTo(map)
      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        if (markerRef.current) markerRef.current.remove()
        markerRef.current = L.marker([lat, lng], { icon: greenIcon }).addTo(map)
        onChange({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` })
        reverseGeocode(lat, lng)
      })
      setReady(true)
    }
    loadLeaflet()
    return () => { if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null } }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      const data = await res.json()
      if (data.display_name) onChange({ lat, lng, address: data.display_name })
    } catch { /* silent */ }
  }

  return (
    <div>
      <div ref={mapRef} className="w-full rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner"
        style={{ height: 260 }} />
      {!ready && (
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
          <Spin size={12} /> Loading map…
        </div>
      )}
      {value?.address && (
        <div className="flex items-start gap-2 mt-2.5 text-xs font-medium"
          style={{ background: '#e6f4ec', color: '#1a5c38', borderRadius: 10, padding: '8px 12px', border: '1px solid #b6dfc5' }}>
          <RiMapPin2Fill size={13} className="mt-0.5 flex-shrink-0" />
          <span className="leading-relaxed">{value.address}</span>
        </div>
      )}
      {!value?.lat && ready && (
        <p className="text-xs text-slate-400 mt-1.5 ml-1">Tap on the map to drop a pin and set pickup location</p>
      )}
    </div>
  )
}

// ─── CATEGORY LABELS ─────────────────────────────────────────────────────────
const categoryLabel = { cooked:'Cooked', raw:'Raw/Veg', packaged:'Packaged', bakery:'Bakery', dairy:'Dairy', other:'Other' }
const fmt = (iso) => iso ? new Date(iso).toLocaleDateString('en-PK', { day:'2-digit', month:'short', year:'numeric' }) : '—'

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AddListing() {
  const [form, setForm] = useState({
    foodName: '', category: '', quantity: '', unit: 'kg',
    expiryDate: '', pickupAddress: '', description: '',
    pickupLocation: null, pickupStart: '', pickupEnd: ''
  })
  const [errors, setErrors]   = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const [donations, setDonations]         = useState([])
  const [listingsLoading, setListingsLoading] = useState(true)
  const [deleteTarget, setDeleteTarget]   = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [editTarget, setEditTarget]       = useState(null)

  const fetchListings = async () => {
    try {
      const { data } = await API.get('/food/my')
      setDonations(data)
    } catch {
      toast.error('Failed to load listings')
    }
    setListingsLoading(false)
  }
  useEffect(() => { fetchListings() }, [])

  const validateField = (name, value) => {
    switch (name) {
      case 'foodName':     return !value.trim() ? 'Food name is required' : value.trim().length < 2 ? 'At least 2 characters' : ''
      case 'category':     return !value ? 'Please select a category' : ''
      case 'quantity':     return !value ? 'Quantity is required' : isNaN(value)||Number(value)<=0 ? 'Enter a valid quantity > 0' : ''
      case 'expiryDate':   return !value ? 'Expiry date is required' : new Date(value)<=new Date() ? 'Date must be in the future' : ''
      case 'pickupAddress':return !value.trim() ? 'Pickup address is required' : value.trim().length < 5 ? 'Enter a full address' : ''
      default: return ''
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (touched[name]) setErrors(p => ({ ...p, [name]: validateField(name, value) }))
  }
  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(p => ({ ...p, [name]: true }))
    setErrors(p => ({ ...p, [name]: validateField(name, value) }))
  }
  const validateAll = () => {
    const fields = ['foodName','category','quantity','expiryDate','pickupAddress']
    const newErrors={}, newTouched={}
    fields.forEach(f => { newTouched[f]=true; const e=validateField(f,form[f]); if(e) newErrors[f]=e })
    setTouched(newTouched); setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateAll()) return
    setLoading(true)
    try {
      await API.post('/food', form)
      toast.success('Food listing created!')
      setForm({ foodName:'', category:'', quantity:'', unit:'kg', expiryDate:'', pickupAddress:'', description:'', pickupLocation:null, pickupStart:'', pickupEnd:'' })
      await fetchListings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing')
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await API.delete(`/food/${deleteTarget._id}`)
      setDonations(p => p.filter(d => d._id !== deleteTarget._id))
      toast.success('Listing deleted')
    } catch { toast.error('Failed to delete') }
    setDeleteLoading(false)
    setDeleteTarget(null)
  }

  const handleEditSave = async (updated) => {
    try {
      await API.put(`/food/${updated._id}`, updated)
      setDonations(p => p.map(d => d._id === updated._id ? updated : d))
      toast.success('Listing updated')
    } catch { toast.error('Failed to update') }
    setEditTarget(null)
  }

  const inputBase = "flex-1 outline-none text-sm bg-transparent text-slate-800 placeholder:text-slate-400"

  return (
    <div className="min-h-screen" style={{ background: '#f1f5f4' }}>
      <Navbar />

      {deleteTarget && <DeleteModal item={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
      {editTarget   && <EditModal   item={editTarget}   onSave={handleEditSave}  onCancel={() => setEditTarget(null)} />}

      <div className="mx-4 sm:mx-6 lg:mx-16 px-0 sm:px-4 py-10 space-y-8 max-w-6xl mx-auto">

        {/* ── PAGE TITLE STRIP ── */}
        <div className="flex items-center gap-3">
          <IoLeaf size={22} style={{ color: '#1a5c38' }} />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#1c2b22' }}>FoodSave Donor</h1>
            <p className="text-xs text-slate-500">Share surplus food with those who need it</p>
          </div>
        </div>

        {/* ── ADD LISTING CARD ── */}
        <div className="bg-white rounded-3xl shadow-lg shadow-emerald-100 border border-emerald-50 p-7">
          <SectionHeader
            icon={<IoAddCircle size={20} />}
            title="Add Food Listing"
            sub="Fill in the details to list your surplus food"
          />

          <form onSubmit={handleSubmit} className="space-y-5" noValidate autoComplete="off">

            {/* Food Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Food Name</label>
              <FieldWrap error={errors.foodName} touched={touched.foodName}>
                <FieldIcon error={errors.foodName} touched={touched.foodName}><MdFastfood size={17} /></FieldIcon>
                <input type="text" name="foodName" autoComplete="off" placeholder="e.g. Cooked Rice, Fresh Bread…"
                  value={form.foodName} onChange={handleChange} onBlur={handleBlur} className={inputBase} />
              </FieldWrap>
              <FieldError msg={touched.foodName && errors.foodName} />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Category</label>
              <FieldWrap error={errors.category} touched={touched.category}>
                <FieldIcon error={errors.category} touched={touched.category}><MdCategory size={17} /></FieldIcon>
                <select name="category" value={form.category} onChange={handleChange} onBlur={handleBlur} className={inputBase}>
                  <option value="">-- Select a category --</option>
                  <option value="cooked">🍛 Cooked Food</option>
                  <option value="raw">🥦 Raw / Vegetables</option>
                  <option value="packaged">📦 Packaged / Sealed</option>
                  <option value="bakery">🍞 Bakery Items</option>
                  <option value="dairy">🥛 Dairy Products</option>
                  <option value="other">🍽️ Other</option>
                </select>
              </FieldWrap>
              <FieldError msg={touched.category && errors.category} />
            </div>

            {/* Qty + Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Quantity</label>
                <FieldWrap error={errors.quantity} touched={touched.quantity}>
                  <FieldIcon error={errors.quantity} touched={touched.quantity}><BsHash size={16} /></FieldIcon>
                  <input type="number" name="quantity" min="1" placeholder="e.g. 10"
                    value={form.quantity} onChange={handleChange} onBlur={handleBlur} className={inputBase} />
                </FieldWrap>
                <FieldError msg={touched.quantity && errors.quantity} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Unit</label>
                <div className="flex items-center border border-slate-200 rounded-xl px-3.5 py-2.5 gap-2 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition">
                  <BsBoxSeam size={15} className="text-slate-400 flex-shrink-0" />
                  <select name="unit" value={form.unit} onChange={handleChange} className={inputBase}>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="liters">Liters (L)</option>
                    <option value="pieces">Pieces</option>
                    <option value="boxes">Boxes</option>
                    <option value="plates">Plates</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Expiry Date & Time</label>
              <FieldWrap error={errors.expiryDate} touched={touched.expiryDate}>
                <FieldIcon error={errors.expiryDate} touched={touched.expiryDate}><BsCalendarEvent size={15} /></FieldIcon>
                <input type="datetime-local" name="expiryDate" value={form.expiryDate}
                  onChange={handleChange} onBlur={handleBlur} className={inputBase} />
              </FieldWrap>
              <FieldError msg={touched.expiryDate && errors.expiryDate} />
            </div>

            {/* Pickup Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Pickup Address</label>
              <FieldWrap error={errors.pickupAddress} touched={touched.pickupAddress}>
                <FieldIcon error={errors.pickupAddress} touched={touched.pickupAddress}><MdLocationOn size={17} /></FieldIcon>
                <input type="text" name="pickupAddress" autoComplete="off"
                  placeholder="e.g. Shop 5, Main Bazaar, Mingora, Swat"
                  value={form.pickupAddress} onChange={handleChange} onBlur={handleBlur} className={inputBase} />
              </FieldWrap>
              <FieldError msg={touched.pickupAddress && errors.pickupAddress} />
            </div>

            {/* Map */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Pin on Map <span className="text-slate-300 font-normal normal-case">(optional)</span>
              </label>
              <MapPicker value={form.pickupLocation}
                onChange={(loc) => setForm(p => ({ ...p, pickupLocation: loc, pickupAddress: p.pickupAddress || loc.address }))} />
            </div>

            {/* Pickup Window */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Pickup Window <span className="text-slate-300 font-normal normal-case">(optional)</span>
              </label>
              <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4">
                {[['pickupStart','From'],['pickupEnd','Until']].map(([n,l]) => (
                  <div key={n}>
                    <p className="text-xs text-slate-400 mb-1">{l}</p>
                    <div className="flex items-center border border-slate-200 rounded-xl px-3.5 py-2.5 gap-2 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition">
                      <IoTime size={15} className="text-slate-400 flex-shrink-0" />
                      <input type="datetime-local" name={n} value={form[n]} onChange={handleChange} className={inputBase} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Additional Notes <span className="text-slate-300 font-normal normal-case">(optional)</span>
              </label>
              <div className="flex items-start border border-slate-200 rounded-xl px-3.5 py-2.5 gap-2.5 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition">
                <MdDescription size={17} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <textarea name="description" rows={3} autoComplete="off"
                  placeholder="Special instructions, allergen info, or any other details…"
                  value={form.description} onChange={handleChange}
                  className="flex-1 outline-none text-sm bg-transparent text-slate-800 placeholder:text-slate-400 resize-none" />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button type="button" onClick={() => navigate('/donor')}
                className="w-full sm:flex-1 border-2 border-slate-200 text-slate-600 py-3 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition text-sm">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                style={{ background: loading ? undefined : 'linear-gradient(135deg,#1a5c38,#22804f)' }}
                className="w-full sm:flex-2 px-8 disabled:bg-emerald-400 text-white py-3 rounded-xl font-semibold transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:opacity-90">
                {loading ? <><Spin size={15} /> Creating…</> : <><IoAddCircle size={17} /> Create Listing</>}
              </button>
            </div>
          </form>
        </div>
      </div>

     {/* ── MY DONATIONS ── */}
        <div className="bg-white  sm:mx-1 lg:mx-16 rounded-3xl shadow-lg shadow-emerald-100 border border-emerald-50 p-7">
          <div className="flex items-center justify-between mb-6">
            <SectionHeader
              icon={<HiOutlineClipboardList size={20} />}
              title="My Donations"
              sub={listingsLoading ? 'Loading…' : `${donations.length} listing${donations.length !== 1 ? 's' : ''}`}
            />
          </div>

          {listingsLoading ? (
            <div className="flex items-center justify-center py-14 gap-3" style={{ color: '#1a5c38' }}>
              <Spin size={22} />
              <span className="text-sm font-medium">Loading your donations…</span>
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: '#e6f4ec' }}>
                <MdFastfood size={28} style={{ color: '#1a5c38', opacity: 0.5 }} />
              </div>
              <p className="text-sm font-medium text-slate-500">No donations yet</p>
              <p className="text-xs text-slate-400 mt-1">Create your first listing above to get started</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 lg:hidden">
                {donations.map((d) => (
                  <div key={d._id} className="bg-slate-50 border border-slate-200 rounded-3xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 truncate" title={d.foodName}>{d.foodName}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: '#e6f4ec', color: '#1a5c38' }}>{categoryLabel[d.category] ?? d.category}</span>
                          <StatusBadge status={d.status} />
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        {fmt(d.createdAt)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-1">Qty / Unit</p>
                        <p className="font-semibold text-slate-800">{d.quantity} {d.unit}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-1">Expires</p>
                        <p className="font-semibold text-slate-800">{fmt(d.expiryDate)}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <button onClick={() => setEditTarget(d)}
                        className="flex-1 h-11 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700 transition flex items-center justify-center gap-2 text-sm">
                        <MdEdit size={16} /> Edit
                      </button>
                      <button onClick={() => setDeleteTarget(d)}
                        className="flex-1 h-11 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-600 transition flex items-center justify-center gap-2 text-sm">
                        <MdDelete size={16} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden lg:block overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#f1f5f4' }}>
                      {['Title','Category','Qty / Unit','Expires','Status','Created','Actions'].map((h, i) => (
                        <th key={h} className={`py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide first:rounded-l-xl last:rounded-r-xl ${i === 2 ? 'text-center' : i === 6 ? 'text-right' : 'text-left'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((d, idx) => (
                      <tr key={d._id}
                        className="border-b border-slate-50 hover:bg-emerald-50/40 transition-colors group"
                        style={{ borderBottom: idx === donations.length - 1 ? 'none' : undefined }}>
                        <td className="py-3.5 px-3">
                          <span className="font-semibold text-slate-800 max-w-[130px] truncate block" title={d.foodName}>{d.foodName}</span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: '#e6f4ec', color: '#1a5c38' }}>
                            {categoryLabel[d.category] ?? d.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="font-bold text-slate-700">{d.quantity}</span>
                          <span className="text-slate-400 text-xs ml-1">{d.unit}</span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 text-xs whitespace-nowrap font-medium">{fmt(d.expiryDate)}</td>
                        <td className="py-3.5 px-3"><StatusBadge status={d.status} /></td>
                        <td className="py-3.5 px-3 text-slate-400 text-xs whitespace-nowrap">{fmt(d.createdAt)}</td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setEditTarget(d)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-emerald-700 transition"
                              title="Edit listing">
                              <MdEdit size={16} />
                            </button>
                            <button onClick={() => setDeleteTarget(d)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 transition"
                              title="Delete listing">
                              <MdDelete size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

    </div>
  )
}