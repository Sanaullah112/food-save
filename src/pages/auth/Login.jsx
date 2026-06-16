import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../utils/api'
import toast from 'react-hot-toast'
import { Leaf, Mail, Lock, ArrowRight } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ phone: '', password: '' })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const validateField = (name, value) => {
    if (name === 'phone') {
      if (!value) return 'phone is required'
    }
    if (name === 'password') {
      if (!value) return 'Password is required'
    }
    return ''
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
    const newErrors = {}
    const newTouched = {}
    ;['phone', 'password'].forEach(f => {
      newTouched[f] = true
      const err = validateField(f, form[f])
      if (err) newErrors[f] = err
    })
    setTouched(newTouched)
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    setLoading(true)
    try {
      const { data } = await API.post('/auth/login', form)
      login(data)
      toast.success(`Welcome back, ${data.name}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid phone or password')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-[#0A5C36] p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #F4A535 0%, transparent 50%), radial-gradient(circle at 80% 20%, #22C55E 0%, transparent 50%)' }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Leaf size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl" style={{ fontFamily: 'Syne, sans-serif' }}>FoodSave</span>
          </div>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Fighting food waste,<br />one donation at a time.
          </h1>
          <p className="text-green-200 text-base leading-relaxed">
            Connect surplus food with communities that need it most. Together we can make a difference.
          </p>
        </div>
        <div className="relative grid grid-cols-2 gap-4">
          {[
            { value: '500+', label: 'Donations made' },
            { value: '50+', label: 'NGOs registered' },
            { value: '200+', label: 'Active donors' },
            { value: '2,000+', label: 'Meals saved' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-white text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</p>
              <p className="text-green-200 text-sm mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#FAFAF8]">
        <div className="w-full max-w-[400px] animate-fade-up">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-[#0A5C36] rounded-lg flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="text-[#0A5C36] font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>FoodSave</span>
          </div>

          <h2 className="text-3xl font-bold text-[#1A1A18] mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Welcome back</h2>
          <p className="text-[#6B6B67] text-sm mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate autoComplete="off">
            <div>
              <label className="block text-sm font-medium text-[#1A1A18] mb-1.5">phone address</label>
              <div className={`fs-input-wrapper ${errors.phone && touched.phone ? 'error' : ''}`}>
                <Mail size={16} className={errors.phone && touched.phone ? 'text-red-400' : 'text-[#AEAEA8]'} />
                <input name="phone" type="number" autoComplete="off"
                  placeholder="+92 33333..."
                  value={form.phone} onChange={handleChange} onBlur={handleBlur}
                  className="fs-input" />
              </div>
              {errors.phone && touched.phone && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">⚠ {errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A18] mb-1.5">Password</label>
              <div className={`fs-input-wrapper ${errors.password && touched.password ? 'error' : ''}`}>
                <Lock size={16} className={errors.password && touched.password ? 'text-red-400' : 'text-[#AEAEA8]'} />
                <input name="password" type="password" autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password} onChange={handleChange} onBlur={handleBlur}
                  className="fs-input" />
              </div>
              {errors.password && touched.password && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">⚠ {errors.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full fs-btn-primary justify-center py-3 mt-2 text-base">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">Sign In <ArrowRight size={16} /></span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B6B67] mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#0A5C36] font-medium hover:underline">Create one here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
