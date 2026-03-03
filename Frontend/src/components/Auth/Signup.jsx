import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Signup = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    organization: '', role: '', agreeToTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateStep1 = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required'
    if (!formData.password || formData.password.length < 8) newErrors.password = 'Min 8 characters required'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    if (!formData.role) newErrors.role = 'Please select a role'
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must accept terms'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step === 1 && validateStep1()) { setStep(2); setErrors({}); return }
    if (!validateStep2()) return
    setIsLoading(true)
    setTimeout(() => { setIsLoading(false); navigate('/dashboard') }, 1500)
  }

  const roles = [
    { id: 'researcher', label: 'Researcher', icon: '🔬', desc: 'Publishing & Analysis' },
    { id: 'developer', label: 'Developer', icon: '💻', desc: 'API Integration & Apps' },
    { id: 'data-scientist', label: 'Scientist', icon: '📊', desc: 'Model Training' },
    { id: 'student', label: 'Student', icon: '📚', desc: 'Academic Learning' },
  ]

  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    return [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(pass)).length;
  }
  const strength = getPasswordStrength(formData.password);

  return (
    // LAYOUT FIX: h-screen desktop, min-h-screen mobile
    <div className="flex flex-col lg:flex-row lg:h-screen bg-slate-950">
      
      {/* LEFT PANEL - Static */}
      <div className="hidden lg:flex lg:w-5/12 bg-slate-900 border-r border-slate-800 flex-col justify-between p-12 relative overflow-hidden h-full">
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <span className="text-xl font-bold text-white tracking-wide">LLM DataHub</span>
            </Link>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Join the future of <br/> AI Development
            </h2>
            <p className="text-slate-400 text-lg">Create an account to start curating, training, and deploying models.</p>
        </div>

        {/* Stats Card */}
        <div className="relative z-10 glass-panel p-6 rounded-2xl animate-float-delayed">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                </div>
                <div>
                    <div className="flex gap-1 mb-1 text-yellow-400 text-sm">★★★★★</div>
                    <p className="text-slate-300 italic mb-3">"This platform reduced our data preprocessing time by 80%. The API is incredibly robust."</p>
                    <p className="text-sm font-bold text-white">Sarah Chen</p>
                    <p className="text-xs text-slate-500">Lead AI Engineer @ TechFlow</p>
                </div>
            </div>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
            © 2024 LLM DataHub Inc.
        </div>
      </div>

      {/* RIGHT PANEL - Scrollable Form */}
      {/* LAYOUT FIX: h-full + overflow-y-auto handles scrolling internally */}
      <div className="w-full lg:w-7/12 lg:h-full lg:overflow-y-auto bg-slate-950">
        
        {/* LAYOUT FIX: min-h-full ensures vertical centering for short content, py-12 handles tall content */}
        <div className="min-h-full flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-lg">
                
                {/* Stepper */}
                <div className="flex items-center justify-between mb-10 px-2">
                    <div className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${step >= 1 ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-slate-700 text-slate-500'}`}>1</div>
                        <span className={`text-xs font-medium ${step >= 1 ? 'text-purple-400' : 'text-slate-600'}`}>Account</span>
                    </div>
                    <div className={`flex-1 h-0.5 mx-4 transition-colors ${step >= 2 ? 'bg-purple-500' : 'bg-slate-800'}`}></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${step >= 2 ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-slate-700 bg-slate-900 text-slate-500'}`}>2</div>
                        <span className={`text-xs font-medium ${step >= 2 ? 'text-purple-400' : 'text-slate-600'}`}>Profile</span>
                    </div>
                </div>

                <div className="mb-8 text-center lg:text-left">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {step === 1 ? 'Create your account' : 'Tell us about yourself'}
                    </h1>
                    <p className="text-slate-400">
                        {step === 1 ? 'Start your 14-day free trial. No credit card required.' : 'Customize your feed and dataset recommendations.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {step === 1 ? (
                        <div className="space-y-5">
                            <div className="input-group">
                                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                                <input
                                    type="text" name="fullName"
                                    value={formData.fullName} onChange={handleChange}
                                    className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${errors.fullName ? 'border-red-500' : 'border-slate-800'}`}
                                    placeholder="John Doe"
                                />
                                {errors.fullName && <p className="text-sm text-red-400 mt-1">{errors.fullName}</p>}
                            </div>

                            <div className="input-group">
                                <label className="block text-sm font-medium text-slate-300 mb-2">Work Email</label>
                                <input
                                    type="email" name="email"
                                    value={formData.email} onChange={handleChange}
                                    className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${errors.email ? 'border-red-500' : 'border-slate-800'}`}
                                    placeholder="name@company.com"
                                />
                                {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email}</p>}
                            </div>

                            <div className="input-group">
                                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'} name="password"
                                        value={formData.password} onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${errors.password ? 'border-red-500' : 'border-slate-800'}`}
                                        placeholder="••••••••"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-500">
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                
                                {/* Strength Meter */}
                                <div className="mt-3 flex gap-1 h-1">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i <= strength ? (strength < 2 ? 'bg-red-500' : strength < 4 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-slate-800'}`}></div>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500 mt-2 text-right">{strength < 2 ? 'Weak' : strength < 4 ? 'Medium' : 'Strong'} password</p>
                            </div>

                            <div className="input-group">
                                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                                <input
                                    type="password" name="confirmPassword"
                                    value={formData.confirmPassword} onChange={handleChange}
                                    className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${errors.confirmPassword ? 'border-red-500' : 'border-slate-800'}`}
                                    placeholder="••••••••"
                                />
                                {errors.confirmPassword && <p className="text-sm text-red-400 mt-1">{errors.confirmPassword}</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Organization</label>
                                <input
                                    type="text" name="organization"
                                    value={formData.organization} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    placeholder="e.g. Stanford University"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-4">Select your primary role</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {roles.map((role) => (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, role: role.id }))
                                                if(errors.role) setErrors(prev => ({ ...prev, role: '' }))
                                            }}
                                            className={`p-4 rounded-xl border text-left transition-all duration-200 group hover:border-purple-500/50 ${formData.role === role.id ? 'bg-purple-600/10 border-purple-500 ring-1 ring-purple-500' : 'bg-slate-900 border-slate-800'}`}
                                        >
                                            <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">{role.icon}</span>
                                            <span className={`block font-semibold ${formData.role === role.id ? 'text-purple-400' : 'text-slate-200'}`}>{role.label}</span>
                                            <span className="text-xs text-slate-500 mt-1 block">{role.desc}</span>
                                        </button>
                                    ))}
                                </div>
                                {errors.role && <p className="text-sm text-red-400 mt-2">{errors.role}</p>}
                            </div>

                            <div className="pt-4">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox" name="agreeToTerms"
                                            checked={formData.agreeToTerms} onChange={handleChange}
                                            className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                        />
                                    </div>
                                    <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                                        I agree to the <a href="#" className="text-purple-400 hover:underline">Terms of Service</a> and <a href="#" className="text-purple-400 hover:underline">Privacy Policy</a>.
                                    </span>
                                </label>
                                {errors.agreeToTerms && <p className="text-sm text-red-400 mt-1 ml-8">{errors.agreeToTerms}</p>}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        {step === 2 && (
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 py-3.5 px-6 border border-slate-700 bg-transparent text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                            >
                                Back
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-3.5 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : step === 1 ? 'Continue' : 'Create Account'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center pb-8">
                    <p className="text-slate-500 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-purple-400 font-medium hover:text-purple-300">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Signup