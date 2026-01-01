import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Mail, Users, Sparkles } from 'lucide-react'
import { campaignsAPI, aiAPI } from '../services/api'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  selectedLeads?: any[]
}

export default function CreateCampaignModal({ 
  isOpen, 
  onClose, 
  selectedLeads = [] 
}: CreateCampaignModalProps) {
  const [step, setStep] = useState(1) // 1: Details, 2: Content, 3: Preview
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    leadIds: selectedLeads.map(l => l._id)
  })
  
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: campaignsAPI.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campaign created successfully!')
      onClose()
      resetForm()
    },
    onError: () => {
      toast.error('Failed to create campaign')
    }
  })

  const generateEmailMutation = useMutation({
    mutationFn: aiAPI.generateEmail,
    onSuccess: (response: any) => {
      setFormData({
        ...formData,
        subject: response.data.subject,
        body: response.data.body
      })
      toast.success('Email generated with AI!')
      setStep(2)
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      body: '',
      leadIds: []
    })
    setStep(1)
  }

  const handleCreate = () => {
    if (!formData.name || !formData.subject || !formData.body) {
      toast.error('Please fill all fields')
      return
    }
    createMutation.mutate(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Campaign</h2>
              <p className="text-sm text-gray-500">
                Step {step} of 3 • {selectedLeads.length} leads selected
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Q1 Product Launch"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">{selectedLeads.length} leads selected</span>
                  </div>
                  {selectedLeads.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedLeads.slice(0, 5).map((lead) => (
                        <span key={lead._id} className="text-xs bg-white px-2 py-1 rounded border">
                          {lead.companyName}
                        </span>
                      ))}
                      {selectedLeads.length > 5 && (
                        <span className="text-xs text-gray-500">
                          +{selectedLeads.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 mb-2">
                      Generate email content with AI for faster creation
                    </p>
                    <button
                      onClick={() => {
                        if (selectedLeads.length > 0) {
                          generateEmailMutation.mutate({
                            companyName: selectedLeads[0].companyName,
                            product: 'your product',
                            tone: 'professional'
                          })
                        }
                      }}
                      disabled={generateEmailMutation.isPending}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm disabled:opacity-50"
                    >
                      {generateEmailMutation.isPending ? 'Generating...' : 'Generate with AI'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Partnership Opportunity"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Body
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Write your email content..."
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Tip: Keep it concise (150-200 words) and focus on value
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">Preview</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Subject:</p>
                    <p className="font-medium text-gray-900">{formData.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Body:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{formData.body}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-700">
                  📊 This campaign will be sent to <strong>{selectedLeads.length} leads</strong>.
                  You can track opens and clicks after sending.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !formData.name}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Creating...
                  </>
                ) : (
                  'Create Campaign'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
