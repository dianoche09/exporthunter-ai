
import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Mail, Users, Sparkles, AlertCircle, Wand2, Languages, Linkedin, MessageCircle, CheckCircle2 } from 'lucide-react'
import { campaignsAPI, aiAPI, authAPI } from '../services/api'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  selectedLeads?: any[]
}

const LANGUAGES = [
  'English', 'Turkish', 'German', 'French', 'Spanish', 'Russian', 'Arabic', 'Chinese', 'Italian', 'Portuguese'
];

export default function CreateCampaignModal({
  isOpen,
  onClose,
  selectedLeads = []
}: CreateCampaignModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    leadIds: selectedLeads.map(l => l._id),
    product: '',
    tone: 'professional' as 'professional' | 'friendly' | 'casual',
    language: 'English',
    channels: ['email'] as string[]
  })

  // Load user's products
  useEffect(() => {
    if (isOpen) {
      authAPI.getCurrentUser().then(res => {
        const user = (res as any).data.user;
        if (user?.productGroups?.length > 0) {
          const firstProduct = user.productGroups[0];
          setFormData(prev => ({
            ...prev,
            product: typeof firstProduct === 'object' ? firstProduct.name : firstProduct
          }))
        }
      }).catch(() => { });
      setStep(1);
    }
  }, [isOpen]);

  // Update leadIds if selectedLeads changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, leadIds: selectedLeads.map(l => l._id) }));
  }, [selectedLeads]);

  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: campaignsAPI.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Omni-Channel Campaign Launched!')
      onClose()
      resetForm()
    },
    onError: () => {
      toast.error('Failed to create campaign')
    }
  })

  const generateEmailMutation = useMutation({
    mutationFn: (vals: any) => aiAPI.generateEmail(vals),
    onSuccess: (response: any) => {
      setFormData(prev => ({
        ...prev,
        subject: response.data.subject,
        body: response.data.body
      }))
      toast.success('AI Generated Campaign Content!')
      setStep(3)
    },
    onError: () => toast.error('AI generation failed')
  })

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      body: '',
      leadIds: selectedLeads.map(l => l._id),
      product: '',
      tone: 'professional',
      language: 'English',
      channels: ['email']
    })
    setStep(1)
  }

  const handleCreate = () => {
    if (!formData.name || !formData.subject || !formData.body) {
      toast.error('Please fill all fields')
      return
    }
    // Pass everything including channels
    createMutation.mutate({
      ...formData
    })
  }

  const handleGenerateAI = () => {
    if (!formData.product) {
      toast.error('Please enter the product you want to sell first.');
      return;
    }

    generateEmailMutation.mutate({
      companyName: selectedLeads.length === 1 ? selectedLeads[0].companyName : '',
      product: formData.product,
      tone: formData.tone,
      language: formData.language,
      isTemplate: selectedLeads.length !== 1
    })
  }

  const toggleChannel = (channel: string) => {
    if (channel === 'email') return; // Email is mandatory
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-outfit">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Campaign Wizard</h2>
              <div className="flex items-center gap-2 mt-1">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className={`h-1.5 w-12 rounded-full transition-colors ${step >= s ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                ))}
                <span className="text-xs text-gray-400 ml-2 font-bold uppercase tracking-wider">
                  {step === 1 && 'Strategy & Channels'}
                  {step === 2 && 'AI Configuration'}
                  {step === 3 && 'Content Studio'}
                  {step === 4 && 'Launch Review'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">

          {/* STEP 1: CHANNELS & SETUP */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Basic Info */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Campaign Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Summer Outreach 2025"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">What are you selling?</label>
                    <input
                      type="text"
                      value={formData.product}
                      onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                      placeholder="e.g. Solar Panels Type-C"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Right: Channel Selection */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-4">Select Outreach Channels</label>
                  <div className="space-y-3">
                    {/* Email (Mandatory) */}
                    <div className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-not-allowed bg-blue-50 border-blue-200`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">Email Sequence</div>
                          <div className="text-xs text-slate-500">Primary communication channel</div>
                        </div>
                      </div>
                      <CheckCircle2 className="w-6 h-6 text-blue-600" />
                    </div>

                    {/* LinkedIn */}
                    <div
                      onClick={() => toggleChannel('linkedin')}
                      className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${formData.channels.includes('linkedin')
                          ? 'bg-sky-50 border-sky-500'
                          : 'bg-white border-slate-100 hover:border-sky-200'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${formData.channels.includes('linkedin') ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-400'}`}>
                          <Linkedin className="w-5 h-5" />
                        </div>
                        <div>
                          <div className={`font-bold ${formData.channels.includes('linkedin') ? 'text-slate-900' : 'text-slate-500'}`}>LinkedIn Automation</div>
                          <div className="text-xs text-slate-400">Profile visits & connection requests</div>
                        </div>
                      </div>
                      {formData.channels.includes('linkedin') && <CheckCircle2 className="w-6 h-6 text-sky-600" />}
                    </div>

                    {/* WhatsApp */}
                    <div
                      onClick={() => toggleChannel('whatsapp')}
                      className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${formData.channels.includes('whatsapp')
                          ? 'bg-green-50 border-green-500'
                          : 'bg-white border-slate-100 hover:border-green-200'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${formData.channels.includes('whatsapp') ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                          <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className={`font-bold ${formData.channels.includes('whatsapp') ? 'text-slate-900' : 'text-slate-500'}`}>WhatsApp Business</div>
                          <div className="text-xs text-slate-400">Direct message for high intent</div>
                        </div>
                      </div>
                      {formData.channels.includes('whatsapp') && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Audience Warning */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                {selectedLeads.length > 0 ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
                        {selectedLeads.length}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Targets Selected</div>
                        <div className="text-xs text-slate-500">This campaign will target {selectedLeads.length} companies.</div>
                      </div>
                    </div>
                    <div className="flex -space-x-2">
                      {selectedLeads.slice(0, 5).map(l => (
                        <div key={l._id} className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-700">
                          {l.companyName.substring(0, 2)}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-amber-600">
                    <AlertCircle size={20} />
                    <span className="text-sm font-medium">No leads selected. Creating a reusable template.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: AI CONFIG */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-4 animate-bounce">
                  <Wand2 size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">AI Content Strategist</h3>
                <p className="text-slate-500 mt-2 max-w-md mx-auto font-medium">
                  We'll generate personalized content for <span className="text-indigo-600 font-bold">{formData.channels.length} channels</span> based on your goals.
                </p>
              </div>

              <div className="max-w-xl mx-auto space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Language</label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white font-medium"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tone</label>
                    <select
                      value={formData.tone}
                      onChange={(e: any) => setFormData({ ...formData, tone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white font-medium"
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="casual">Casual</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateAI}
                  disabled={generateEmailMutation.isPending}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  {generateEmailMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" color="text-white" />
                      Designing Omni-Channel Content...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Generate Content with AI
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONTENT EDIT */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                {/* Tabs for channels (Visual Only for now, everything edits the main Body) */}
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-md flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </button>
                {formData.channels.includes('linkedin') && (
                  <button className="px-4 py-2 bg-slate-100 text-slate-500 hover:bg-white hover:text-sky-600 rounded-lg font-bold text-sm flex items-center gap-2">
                    <Linkedin className="w-4 h-4" /> LinkedIn <span className="text-[10px] bg-sky-100 text-sky-600 px-1 rounded ml-1">AI</span>
                  </button>
                )}
                {formData.channels.includes('whatsapp') && (
                  <button className="px-4 py-2 bg-slate-100 text-slate-500 hover:bg-white hover:text-green-600 rounded-lg font-bold text-sm flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> WhatsApp <span className="text-[10px] bg-green-100 text-green-600 px-1 rounded ml-1">AI</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Subject Line</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Message Body</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium leading-relaxed resize-y text-slate-600"
                />
              </div>
            </div>
          )}

          {/* STEP 4: PREVIEW */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-[2rem] text-center shadow-xl">
                <h3 className="text-2xl font-black mb-2">Ready for Launch 🚀</h3>
                <p className="text-slate-400">Your Omni-Channel campaign is set to blast off.</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                  <Mail className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-bold text-blue-900">Email</div>
                  <div className="text-xs text-blue-600">Active Sequence</div>
                </div>
                {formData.channels.includes('linkedin') ? (
                  <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 text-center">
                    <Linkedin className="w-8 h-8 text-sky-600 mx-auto mb-2" />
                    <div className="font-bold text-sky-900">LinkedIn</div>
                    <div className="text-xs text-sky-600">Auto-Connect</div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center opacity-50">
                    <Linkedin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <div className="font-bold text-slate-500">LinkedIn</div>
                    <div className="text-xs text-slate-400">Skipped</div>
                  </div>
                )}
                {formData.channels.includes('whatsapp') ? (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                    <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="font-bold text-green-900">WhatsApp</div>
                    <div className="text-xs text-green-600">Ready to Send</div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center opacity-50">
                    <MessageCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <div className="font-bold text-slate-500">WhatsApp</div>
                    <div className="text-xs text-slate-400">Skipped</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-slate-50">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 text-slate-600 hover:bg-slate-200 rounded-xl font-bold transition-colors"
                disabled={generateEmailMutation.isPending}
              >
                Back
              </button>
            )}
          </div>
          <div className="flex gap-3">
            {step === 4 ? (
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold shadow-lg shadow-slate-900/20 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" color="text-white" />
                    Launching...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Launch Omni-Channel Campaign
                  </>
                )}
              </button>
            ) : (
              step !== 2 && (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && (!formData.name || !formData.product)}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
                >
                  {step === 3 ? 'Review Launch' : 'Continue'}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
