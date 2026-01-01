import { useState } from 'react'
import { leadsAPI } from '../services/api'
import toast from 'react-hot-toast'

interface AILeadDiscoveryProps {
    onLeadsDiscovered?: (leads: any[]) => void
}

export default function AILeadDiscovery({ onLeadsDiscovered }: AILeadDiscoveryProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        product: '',
        targetMarkets: [] as string[],
        industry: '',
        count: 20
    })

    const markets = ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman', 'Bahrain', 'Egypt', 'Turkey']

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.product || !formData.industry || formData.targetMarkets.length === 0) {
            toast.error('Please fill all required fields')
            return
        }

        setLoading(true)

        try {
            const response = await leadsAPI.discoverLeads({
                product: formData.product,
                targetMarkets: formData.targetMarkets,
                industry: formData.industry
            })

            toast.success(`Discovered ${response.data.leads.length} leads!`)

            if (onLeadsDiscovered) {
                onLeadsDiscovered(response.data.leads)
            }

            setIsOpen(false)
            setFormData({
                product: '',
                targetMarkets: [],
                industry: '',
                count: 20
            })
        } catch (error: any) {
            toast.error(error.message || 'Failed to discover leads')
        } finally {
            setLoading(false)
        }
    }

    const toggleMarket = (market: string) => {
        setFormData(prev => ({
            ...prev,
            targetMarkets: prev.targetMarkets.includes(market)
                ? prev.targetMarkets.filter(m => m !== market)
                : [...prev.targetMarkets, market]
        }))
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Discover Leads with AI
            </button>
        )
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">🔍 AI Lead Discovery</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Product */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            What are you selling? *
                        </label>
                        <input
                            type="text"
                            value={formData.product}
                            onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                            placeholder="e.g., Turkish Marble and Natural Stone"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Industry */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target Industry *
                        </label>
                        <input
                            type="text"
                            value={formData.industry}
                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                            placeholder="e.g., Construction Materials"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Target Markets */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target Markets * (Select at least one)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {markets.map((market) => (
                                <button
                                    key={market}
                                    type="button"
                                    onClick={() => toggleMarket(market)}
                                    className={`px-3 py-2 rounded-lg border transition-all ${formData.targetMarkets.includes(market)
                                            ? 'bg-blue-100 border-blue-500 text-blue-700'
                                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                                        }`}
                                >
                                    {market}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Selected: {formData.targetMarkets.join(', ') || 'None'}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <p className="text-sm text-gray-500">
                            🤖 AI will discover ~20 potential companies for you
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Discovering...' : 'Discover Leads'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
