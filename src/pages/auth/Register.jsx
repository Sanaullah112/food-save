import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../utils/api'
import toast from 'react-hot-toast'
import { Leaf, User, Lock, Phone, MapPin, ArrowRight, Check } from 'lucide-react'

// Field component sits outside to prevent input focus loss issues
const Field = ({ label, name, icon: Icon, type = 'text', placeholder, form, errors, touched, handleChange, handleBlur }) => (
  <div>
    <label className="block text-sm font-medium text-[#1A1A18] mb-1.5">{label}</label>
    <div className={`fs-input-wrapper ${errors[name] && touched[name] ? 'error' : ''}`}>
      <Icon size={15} className={errors[name] && touched[name] ? 'text-red-400 shrink-0' : 'text-[#AEAEA8] shrink-0'} />
      <input 
        name={name} 
        type={type}
        autoComplete={type === 'password' ? 'new-password' : 'off'}
        placeholder={placeholder}
        value={form[name]} 
        onChange={handleChange} 
        onBlur={handleBlur}
        className="fs-input" 
      />
      {form[name] && !errors[name] && touched[name] && (
        <Check size={14} className="text-green-500 shrink-0" />
      )}
    </div>
    {errors[name] && touched[name] && <p className="text-red-500 text-xs mt-1.5">⚠ {errors[name]}</p>}
  </div>
)

export default function Register() {
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirmPassword: '', role: 'donor', address: '' })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, user } = useAuth()

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const validateField = (name, value) => {
    switch (name) {
      case 'name': return !value.trim() ? 'Full name is required' : value.trim().length < 3 ? 'Minimum 3 characters' : ''
      case 'password': return !value ? 'Password is required' : value.length < 6 ? 'Minimum 6 characters' : ''
      case 'confirmPassword': return !value ? 'Please confirm password' : value !== form.password ? 'Passwords do not match' : ''
      case 'phone': return !value.trim() ? 'Phone is required' : !/^[0-9]{10,11}$/.test(value.replace(/\s/g, '')) ? 'Enter valid 10-11 digit number' : ''
      case 'address': return !value.trim() ? 'Address is required' : value.trim().length < 5 ? 'Please enter complete address' : ''
      default: return ''
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (touched[name]) setErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fields = ['name', 'password', 'confirmPassword', 'phone', 'address']
    const newErrors = {}
    const newTouched = {}
    fields.forEach(f => {
      newTouched[f] = true
      const err = validateField(f, form[f])
      if (err) newErrors[f] = err
    })
    setTouched(newTouched)
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    setLoading(true)
    
    try {
      const { data } = await API.post('/auth/register', { 
        name: form.name, 
        password: form.password, 
        role: form.role, 
        phone: form.phone, 
        address: form.address 
      })
      login(data)
      toast.success('Account created! Welcome.')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
    setLoading(false)
  }

  const fieldProps = { form, errors, touched, handleChange, handleBlur }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[40%] bg-[#0A5C36] p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #F4A535 0%, transparent 50%), radial-gradient(circle at 80% 20%, #22C55E 0%, transparent 50%)' }} />
        <div className="relative flex items-center gap-2">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Leaf size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl" style={{ fontFamily: 'Syne, sans-serif' }}>FoodSave</span>
        </div>
        <div className="relative space-y-6">
          <h1 className="text-white text-3xl font-bold leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            Join thousands helping reduce food waste
          </h1>
          {[
            'List surplus food in under 2 minutes',
            'Connect directly with local NGOs',
            'Track every donation in real time',
            'Make a measurable impact today',
          ].map(item => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-5 h-5 bg-[#F4A535] rounded-full flex items-center justify-center shrink-0">
                <Check size={11} className="text-white" strokeWidth={3} />
              </div>
              <p className="text-green-100 text-sm">{item}</p>
            </div>
          ))}
        </div>
        <p className="relative text-green-300 text-xs">Department of Computer Science · Jahanzeb College, Swat · 2022–2026</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-[#FAFAF8] overflow-y-auto">
        <div className="w-full max-w-[440px] animate-fade-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#0A5C36] rounded-lg flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="text-[#0A5C36] font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>FoodSave</span>
          </div>

          <h2 className="text-3xl font-bold text-[#1A1A18] mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Create account</h2>
          <p className="text-[#6B6B67] text-sm mb-7">Join FoodSave and start making a difference</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate autoComplete="off">
            <Field label="Full Name" name="name" icon={User} placeholder="e.g. Ahmad Khan" {...fieldProps} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Password" name="password" icon={Lock} type="password" placeholder="Min. 6 characters" {...fieldProps} />
              <Field label="Confirm Password" name="confirmPassword" icon={Lock} type="password" placeholder="Re-enter password" {...fieldProps} />
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A18] mb-2">I am registering as</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'donor', label: 'Food Donor', desc: 'Store/Indiv.' },
                  { value: 'ngo', label: 'NGO', desc: 'Charity' },
                  { value: 'user', label: 'User', desc: 'Recipient' }
                ].map(opt => (
                  <button type="button" key={opt.value}
                    onClick={() => setForm(prev => ({ ...prev, role: opt.value }))}
                    className={`p-2.5 rounded-xl border-2 text-left transition-all duration-200 ${
                      form.role === opt.value
                        ? 'border-[#0A5C36] bg-[#E8F5EE]'
                        : 'border-[#E8E8E4] hover:border-[#C8E6D8] bg-white'
                    }`}>
                    <p className={`text-xs font-semibold ${form.role === opt.value ? 'text-[#0A5C36]' : 'text-[#1A1A18]'}`}>{opt.label}</p>
                    <p className="text-[10px] text-[#6B6B67] mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <Field label="Phone Number" name="phone" icon={Phone} type="tel" placeholder="e.g. 03001234567" {...fieldProps} />
            <Field label="Full Address" name="address" icon={MapPin} placeholder="e.g. Main Bazaar, Mingora, Swat" {...fieldProps} />

            <button type="submit" disabled={loading}
              className="w-full fs-btn-primary justify-center py-3 mt-2 text-base">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">Create Account <ArrowRight size={16} /></span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B6B67] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0A5C36] font-medium hover:underline">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}