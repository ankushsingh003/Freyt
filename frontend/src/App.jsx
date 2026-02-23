import React, { useState } from 'react'
import { Search, Shield, Cloud, MapPin, Navigation, Bot, CheckCircle, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
    const [trackingId, setTrackingId] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)

    const handleAnalyze = async (e) => {
        e.preventDefault()
        if (!trackingId) return

        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/analyze-shipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tracking_id: trackingId })
            })
            const data = await response.json()
            setResult(data)
        } catch (error) {
            console.error("Analysis failed:", error)
            alert("Failed to connect to Backend Server. Make sure it is running!")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen font-sans">
            {/* Header */}
            <nav className="border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg agent-gradient flex items-center justify-center">
                                <Navigation className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-display font-bold text-xl tracking-tight">FREY<span className="text-accent-blue">T</span></span>
                        </div>
                        <div className="hidden md:block">
                            <div className="flex items-baseline space-x-4 text-sm font-medium text-gray-400">
                                <a href="#" className="hover:text-white transition-colors">Dashboard</a>
                                <a href="#" className="hover:text-white transition-colors">Agents</a>
                                <a href="#" className="hover:text-white transition-colors">Handbook</a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Freyt: Multi-Agent RAG Logistics
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Autonomous AI agents collaborating to track, analyze, and optimize your global logistics network using professional-grade RAG.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto mb-16">
                    <form onSubmit={handleAnalyze} className="relative group mb-6">
                        <div className="absolute -inset-1 bg-gradient-to-r from-accent-blue to-accent-purple rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative flex items-center bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden focus-within:border-accent-blue/50 transition-all">
                            <div className="pl-4 pointer-events-none">
                                <Search className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Enter Tracking ID (e.g. SHIP-2024-001)"
                                className="block w-full py-4 px-4 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 font-medium"
                                value={trackingId}
                                onChange={(e) => setTrackingId(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="mr-2 px-6 py-2 bg-accent-blue hover:bg-blue-600 text-white font-bold rounded-lg transition-all transform active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Analyzing...' : 'Analyze'}
                            </button>
                        </div>
                    </form>

                    {/* Suggestions */}
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-2">Try these:</span>
                        <button
                            onClick={() => setTrackingId('DEMO-LONDON-001')}
                            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-400 hover:border-accent-blue/50 hover:text-white transition-all"
                        >
                            DEMO-LONDON-001
                        </button>
                        <button
                            onClick={() => setTrackingId('DEMO-BERLIN-002')}
                            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-400 hover:border-accent-blue/50 hover:text-white transition-all"
                        >
                            DEMO-BERLIN-002
                        </button>
                        <button
                            onClick={() => setTrackingId('DEMO-TOKYO-003')}
                            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-400 hover:border-accent-blue/50 hover:text-white transition-all"
                        >
                            DEMO-TOKYO-003
                        </button>
                    </div>
                </div>

                {/* Loading State or Results */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center p-12 glass-panel rounded-3xl"
                        >
                            <div className="w-16 h-16 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mb-6"></div>
                            <p className="font-medium text-gray-300">Agents are coordinating...</p>
                        </motion.div>
                    )}

                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {/* Agent Cards will go here */}
                            <div className="glass-panel p-6 rounded-2xl border-t-2 border-accent-blue">
                                <div className="flex items-center gap-3 mb-4">
                                    <Navigation className="w-5 h-5 text-accent-blue" />
                                    <h3 className="font-bold text-sm uppercase tracking-wider text-accent-blue">Orchestrator</h3>
                                </div>
                                <p className="text-sm text-gray-400 mb-2">Shipment Status:</p>
                                <div className="text-xl font-bold text-white mb-4 capitalize">{result.shipment?.status || 'Unknown'}</div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <MapPin className="w-3 h-3" />
                                    <span>{result.shipment?.location || 'Processing...'}</span>
                                </div>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl border-t-2 border-accent-cyan">
                                <div className="flex items-center gap-3 mb-4">
                                    <Cloud className="w-5 h-5 text-accent-cyan" />
                                    <h3 className="font-bold text-sm uppercase tracking-wider text-accent-cyan">Weather Agent</h3>
                                </div>
                                <p className="text-sm text-gray-400 mb-2">Condition:</p>
                                <div className="text-xl font-bold text-white mb-4">{result.weather?.condition || 'Clear'}</div>
                                <div className="flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded bg-white/5 w-fit">
                                    Risk Level: <span className={result.weather?.risk_level === 'HIGH' ? 'text-red-400' : 'text-green-400'}>{result.weather?.risk_level || 'LOW'}</span>
                                </div>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl col-span-1 md:col-span-2 border-t-2 border-accent-purple">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-accent-purple" />
                                        <h3 className="font-bold text-sm uppercase tracking-wider text-accent-purple">RAG Diagnosis</h3>
                                    </div>
                                    <span className="text-[10px] bg-white/5 py-1 px-2 rounded-full text-gray-400">DHL Handbook v2025</span>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed italic">
                                    "{result.rag_diagnosis?.diagnosis || 'No risks identified by the knowledge base.'}"
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}

export default App
