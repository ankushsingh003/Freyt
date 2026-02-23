import React, { useState } from 'react'
import { Search, Shield, Cloud, MapPin, Navigation, Bot, CheckCircle, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
    const [trackingId, setTrackingId] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [showDropdown, setShowDropdown] = useState(false)

    const demoItems = {
        indian: [
            { id: 'DEMO-MUMBAI-001', label: 'Mumbai Hub (JNPT)' },
            { id: 'DEMO-DELHI-002', label: 'Delhi Cargo (IGI)' },
            { id: 'DEMO-BLR-003', label: 'Bengaluru Cargo (KIAL)' },
            { id: 'DEMO-KOLKATA-004', label: 'Kolkata Port (Haldia)' },
            { id: 'DEMO-CHENNAI-005', label: 'Chennai Hub' },
            { id: 'DEMO-HYD-006', label: 'Hyderabad Cargo' },
        ],
        global: [
            { id: 'DEMO-LONDON-007', label: 'London Hub (LHR)' },
            { id: 'DEMO-NYC-008', label: 'New York Cargo (JFK)' },
        ]
    }

    const handleAnalyze = async (e) => {
        e.preventDefault()
        if (!trackingId) return

        setLoading(true)
        setResult(null)
        setShowDropdown(false)

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

    const selectDemo = (id) => {
        setTrackingId(id)
        setShowDropdown(false)
    }

    return (
        <div className="min-h-screen font-sans flex flex-col" onClick={() => setShowDropdown(false)}>
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
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Freyt: Multi-Agent RAG Logistics
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Autonomous AI agents collaborating to track, analyze, and optimize your logistics network using live tracking data and professional-grade RAG.
                    </p>
                </div>

                <div className="max-w-xl mx-auto mb-16 relative">
                    <form onSubmit={handleAnalyze} className="relative group mb-4" onClick={(e) => e.stopPropagation()}>
                        <div className="absolute -inset-1 bg-gradient-to-r from-accent-blue to-accent-purple rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative flex items-center bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden focus-within:border-accent-blue/50 transition-all">
                            <div className="pl-4 pointer-events-none">
                                <Search className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Enter Tracking ID..."
                                className="block w-full py-4 px-4 bg-transparent border-0 focus:ring-0 outline-none focus:outline-none text-white placeholder-gray-500 font-medium"
                                value={trackingId}
                                onChange={(e) => setTrackingId(e.target.value)}
                                onFocus={(e) => {
                                    e.stopPropagation()
                                    setShowDropdown(true)
                                }}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="mr-2 px-6 py-2 bg-accent-blue hover:bg-blue-600 text-white font-bold rounded-lg transition-all transform active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Analyzing...' : 'Analyze'}
                            </button>
                        </div>

                        <AnimatePresence>
                            {showDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className="absolute top-full left-0 right-0 mt-2 p-4 bg-[#0d1117]/95 backdrop-blur-xl border border-white/10 rounded-2xl z-[100] shadow-2xl overflow-hidden"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">Indian Hubs</div>
                                            <div className="space-y-1">
                                                {demoItems.indian.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => selectDemo(item.id)}
                                                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                                                    >
                                                        <div className="text-xs font-semibold text-gray-300 group-hover:text-accent-blue">{item.label}</div>
                                                        <div className="text-[10px] text-gray-500">{item.id}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="border-l border-white/5 pl-4">
                                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">Global Hubs</div>
                                            <div className="space-y-1">
                                                {demoItems.global.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => selectDemo(item.id)}
                                                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                                                    >
                                                        <div className="text-xs font-semibold text-gray-300 group-hover:text-accent-purple">{item.label}</div>
                                                        <div className="text-[10px] text-gray-500">{item.id}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                    <p className="text-[10px] text-center text-gray-600 italic">Click input to see all demo hubs</p>
                </div>

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

            <footer className="mt-auto py-8 border-t border-white/5 text-center px-4">
                <p className="text-gray-500 text-sm font-medium tracking-wide">
                    Engineered with ❤️ by <span className="text-accent-blue hover:text-accent-purple transition-colors cursor-default">Ankush Singh</span>
                </p>
                <p className="text-gray-600 text-xs mt-1">© 2026 Freyt Logistics AI. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default App;
