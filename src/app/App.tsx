import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import {
  ChevronRight,
  Layers,
  ShieldAlert,
  Cpu,
  Anchor,
  Activity,
  CheckCircle2,
  TrendingDown,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  AlertTriangle,
  Sliders,
  Radio,
  Share2,
  Compass
} from 'lucide-react';
import Navbar from './components/Navbar';
import SupplierIllusionExplorer from './components/SupplierIllusionExplorer';
import SupplyChainBackdrop from './components/SupplyChainBackdrop';
import TrueTierLogo from './components/TrueTierLogo';
import RiskMapSection from './components/RiskMapSection';
import { setLenis, getLenis, scrollToTarget } from './utils/lenis';
import { motion, AnimatePresence } from 'framer-motion';

interface TelemetryStat {
  title: string;
  value: string;
  subtext: string;
  tone: 'danger' | 'warning' | 'info' | 'neutral';
}

interface NodeTelemetryInfo {
  name: string;
  tag: string;
  tier: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  stats: TelemetryStat[];
  highlightNote: string;
}

const NODE_TELEMETRY: Record<string, NodeTelemetryInfo> = {
  hww: {
    name: 'Hsinchu Wafer Works (HWW)',
    tag: 'Shared Single Point of Failure',
    tier: 'Tier-2 Sub-Tier Semiconductor Fab · Taiwan',
    badgeBg: 'bg-amber-100/90 text-amber-900 border-amber-300',
    badgeText: 'Chokepoint Bottleneck',
    description: 'Sole tier-2 semiconductor fab manufacturing 40nm MCU dies for all 3 contracted direct vendors. A single incident halts downstream OEM assembly.',
    stats: [
      { title: 'Upstream Exposure', value: '92.4%', subtext: 'Critical Concentration', tone: 'danger' },
      { title: 'True Independence', value: '1.1 / 3.0', subtext: 'Statistical Illusion', tone: 'danger' },
      { title: 'Cleanroom Utilization', value: '98.5%', subtext: 'Zero Burst Buffer', tone: 'warning' },
      { title: 'Lead Time to Replace', value: '18 Months', subtext: 'Foundry Re-tooling Lag', tone: 'neutral' },
    ],
    highlightNote: 'Critical Finding: 100% of your direct microcontroller suppliers share this exact same physical fab cleanroom.'
  },
  kaohsiung: {
    name: 'Port of Kaohsiung (Terminal 4)',
    tag: 'Maritime Logistics Chokepoint',
    tier: 'Outbound Maritime Export Gateway · Taiwan',
    badgeBg: 'bg-blue-100/90 text-blue-900 border-blue-300',
    badgeText: 'Logistics Chokepoint',
    description: 'Single maritime container export port utilized for 94% of outbound wafer carrier volume from Taiwan to Chennai assembly lines.',
    stats: [
      { title: 'Port Volume Share', value: '94.2%', subtext: 'Extreme Hub Dependency', tone: 'danger' },
      { title: 'Weather Vulnerability', value: 'Typhoon Belt', subtext: 'Seasonal High Hazard', tone: 'danger' },
      { title: 'Alternate Port Re-route', value: '+14 Days', subtext: 'Keelung Land Freight', tone: 'warning' },
      { title: 'Berth Congestion Lag', value: '6.4 Days', subtext: 'Average Port Dwell', tone: 'neutral' },
    ],
    highlightNote: 'Logistics Chokepoint: Severe weather or regional naval blockades trap all three suppliers simultaneously before departure.'
  },
  nexa: {
    name: 'Nexa Semiconductor Ltd.',
    tag: 'Primary Direct Vendor',
    tier: 'Tier-1 Direct Supplier · Hsinchu Science Park',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    badgeText: '40% Contract Share',
    description: 'Contracted as your primary ECU supplier. Procurement audits mark them fully compliant, unaware their raw wafers originate at HWW.',
    stats: [
      { title: 'Contract Allocation', value: '40.0%', subtext: 'Primary Tier-1 Share', tone: 'info' },
      { title: 'Upstream Silicon Source', value: 'HWW Fab', subtext: '100% Shared Bottleneck', tone: 'danger' },
      { title: 'Direct Safety Buffer', value: '14 Days', subtext: 'Finished Component Stock', tone: 'warning' },
      { title: 'Alternate Foundry Tooling', value: 'None', subtext: 'Zero Qualified Failover', tone: 'danger' },
    ],
    highlightNote: 'Illusion Alert: Procurement assumes Nexa hedges against Orion Micro, but both share identical fab wafer runs.'
  },
  orion: {
    name: 'Orion Microelectronics',
    tag: 'Secondary Direct Vendor',
    tier: 'Tier-1 Direct Supplier · Hsinchu Science Park',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    badgeText: '35% Contract Share',
    description: 'Secondary MCU partner brought in specifically to avoid sole-source supplier risk. Uses distinct packaging, but identical upstream dies.',
    stats: [
      { title: 'Contract Allocation', value: '35.0%', subtext: 'Secondary Tier-1 Share', tone: 'info' },
      { title: 'Upstream Silicon Source', value: 'HWW Fab', subtext: '100% Shared Bottleneck', tone: 'danger' },
      { title: 'Direct Safety Buffer', value: '9 Days', subtext: 'Depletes on Day 9 of Halt', tone: 'danger' },
      { title: 'Effective Independence', value: '1.1 / 3.0', subtext: 'True Redundancy Score', tone: 'warning' },
    ],
    highlightNote: 'Redundancy Deficit: Orion fails within hours of any HWW cleanroom stoppage, triggering immediate line starvation.'
  },
  helix: {
    name: 'Helix Devices Corp.',
    tag: 'Tertiary Direct Vendor',
    tier: 'Tier-1 Direct Supplier · Taichung',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    badgeText: '25% Contract Share',
    description: 'Telematics controller supplier. Completes the tripartite supplier diversification strategy on paper while inheriting the identical hidden chokepoint.',
    stats: [
      { title: 'Contract Allocation', value: '25.0%', subtext: 'Tertiary Tier-1 Share', tone: 'info' },
      { title: 'Upstream Silicon Source', value: 'HWW Fab', subtext: '100% Shared Bottleneck', tone: 'danger' },
      { title: 'Direct Safety Buffer', value: '11 Days', subtext: 'Depletes on Day 11', tone: 'warning' },
      { title: 'Switching Cost', value: '$850K', subtext: '6-Month Recertification', tone: 'neutral' },
    ],
    highlightNote: 'Concentration Warning: Despite three independent vendor contracts, upstream Herfindahl Index is 10,000 (absolute monopoly).'
  },
  aurora: {
    name: 'Aurora Motors (Assembly Plant)',
    tag: 'OEM Manufacturing Hub',
    tier: 'Buyer / Final Integrator · Chennai',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    badgeText: 'Automotive OEM',
    description: 'High-throughput assembly plant producing 1,400 vehicles per day. Operates on lean Just-In-Time buffer schedules highly vulnerable to unmapped sub-tier shocks.',
    stats: [
      { title: 'Daily Output At Risk', value: '1,400 Units', subtext: 'Vehicles / Production Day', tone: 'danger' },
      { title: 'Total Plant Buffer', value: '12 Days', subtext: 'Average JIT Stock', tone: 'warning' },
      { title: 'Daily Line Stoppage Cost', value: '$1.4M / Day', subtext: 'Direct Idled Labor & Overhead', tone: 'danger' },
      { title: 'Discovered Overlap', value: '3 in 1 Fab', subtext: 'TrueTier Multi-Hop Graph', tone: 'info' },
    ],
    highlightNote: 'Vulnerability Summary: Without multi-tier mapping, OEM executives assume 3-way supply redundancy.'
  }
};

export default function App() {
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'supply_chain' | 'agency'>('supply_chain');

  // Interactive on-page Disruption Simulation state
  const [activeDisruption, setActiveDisruption] = useState<'none' | 'typhoon' | 'fab'>('none');
  const [activeHoverNode, setActiveHoverNode] = useState<string | null>('hww');
  const [flowAnimKey, setFlowAnimKey] = useState<number>(0);

  // Interactive Decoupling Slider state
  const [puneShare, setPuneShare] = useState<number>(25);
  const [bufferDays, setBufferDays] = useState<number>(12);

  // Dynamic Scroll Depth Tracker (Lenis-linked)
  const [scrollTier, setScrollTier] = useState<string>('Tier 1 · Direct Suppliers');

  // Initialize Lenis smooth scrolling dynamics
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    setLenis(lenis);

    // Track scroll position to update topic-relevant dynamic tier telemetry
    const onScroll = ({ scroll }: { scroll: number }) => {
      if (scroll < 550) {
        setScrollTier('Tier 1 · Direct Suppliers (3 Mapped)');
      } else if (scroll < 1250) {
        setScrollTier('Tier 2 · Semiconductor Processing (HWW Fab)');
      } else if (scroll < 2000) {
        setScrollTier('D3 Spatial Risk Heatmap · Chokepoints');
      } else if (scroll < 2800) {
        setScrollTier('Tier 3 · Maritime Logistics (Kaohsiung Port)');
      } else {
        setScrollTier('Tier 0 · Assembly Optimization & Decoupling');
      }
    };
    lenis.on('scroll', onScroll);

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off('scroll', onScroll);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Pause Lenis when modal dialog is open to avoid background movement
  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;
    if (explorerOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [explorerOpen]);

  // Derived calculations for the interactive Decoupling Slider
  const simulatedFDS = Math.max(0.18, 0.68 - (puneShare / 100) * 0.7 - (bufferDays / 30) * 0.15);
  const simulatedLossAvoided = Math.min(32.4, (puneShare * 0.85 + bufferDays * 0.45)).toFixed(1);

  return (
    <main
      className="min-h-screen w-full bg-[#ededed] p-2 sm:p-4 font-sans select-none flex flex-col relative"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* =========================================================================
          CONTINUOUS FULL-PAGE SCENERY (Follows whole page, zero butterflies)
          ========================================================================= */}
      <SupplyChainBackdrop />

      {/* =========================================================================
          HERO SECTION (Clips inside container, scenic backdrop flows through)
          ========================================================================= */}
      <div
        id="home"
        className="relative z-10 w-full min-h-[580px] h-[calc(100dvh-16px)] sm:h-[calc(100vh-32px)] overflow-hidden bg-[#e5e5e5]/80 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-sm flex flex-col justify-between border border-neutral-300/40"
      >
        {/* Subtle geometric light scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/20 pointer-events-none" />

        {/* Foreground content wrapper */}
        <div className="relative z-10 flex flex-col h-full justify-between overflow-y-auto sm:overflow-hidden no-scrollbar">
          {/* Navbar (floating pill) */}
          <Navbar
            onOpenExplorer={() => setExplorerOpen(true)}
            activeMode={activeMode}
            onToggleMode={(mode) => setActiveMode(mode)}
          />

          {/* Hero Content (centered) */}
          <section className="my-auto flex flex-col items-center px-4 py-6 sm:py-10 text-center shrink-0">
            {/* Badge with TrueTier Logo icon */}
            <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-sm text-[13px] font-medium text-neutral-800 border border-neutral-200/90">
              <TrueTierLogo iconOnly className="h-4 w-4" />
              <span className="font-semibold text-neutral-900">TrueTier</span>
              <span className="text-neutral-300">·</span>
              <span className="text-neutral-600">See the source behind your suppliers</span>
            </div>

            {/* Headline <h1> with Instrument Serif italic accent */}
            <h1
              className="mt-4 sm:mt-6 max-w-4xl text-neutral-900 tracking-tight"
              style={{
                fontSize: 'clamp(34px, 7vw, 72px)',
                lineHeight: 1.05,
                fontWeight: 500,
                letterSpacing: '-0.02em',
              }}
            >
              Shaping{' '}
              <span
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: 'italic',
                  fontWeight: 400,
                }}
              >
                Supply Chains
              </span>
              <br />
              of tomorrow
            </h1>

            {/* Subtitle <p> */}
            <p
              className="mt-3 sm:mt-5 text-neutral-700 px-2 max-w-2xl font-normal leading-relaxed"
              style={{
                fontSize: 'clamp(14px, 3.2vw, 16.5px)',
              }}
            >
              Can a company discover that several suppliers actually depend on the same hidden source? TrueTier maps multi-tier networks to reveal the single factory, port, or raw material behind the illusion.
            </p>

            {/* CTA buttons */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-3.5">
              <button
                type="button"
                onClick={() => setExplorerOpen(true)}
                className="inline-flex items-center gap-3 bg-[#0b0f1a] hover:bg-[#1a2133] active:scale-[0.98] text-white rounded-full pl-6 sm:pl-7 pr-2 py-2.5 sm:py-3 text-[14px] font-medium shadow-md transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f09e26] cursor-pointer"
              >
                <span>Reveal Dependency Graph</span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/15 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                  <ChevronRight className="w-4 h-4 text-white" />
                </div>
              </button>
              <button
                type="button"
                onClick={() => scrollToTarget('#risk-map', { offset: -30, duration: 1.2 })}
                className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-neutral-800 rounded-full px-5 py-2.5 sm:py-3 text-[13.5px] font-medium border border-neutral-300/80 shadow-xs transition-all hover:border-[#f09e26]/60 cursor-pointer"
              >
                <span>Explore D3 Spatial Risk Map</span>
                <ArrowUpRight className="w-4 h-4 text-[#f09e26]" />
              </button>
            </div>
          </section>

          <div className="pb-3" />
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: The Three Axioms of The Supplier Illusion (#features)
          ========================================================================= */}
      <section
        id="features"
        className="max-w-[1180px] w-full mx-auto mt-16 sm:mt-24 px-3 sm:px-4 space-y-8 relative z-10"
      >
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-[#b45309]">
            <Compass className="w-3.5 h-3.5 text-[#f09e26]" />
            <span>Foundational Intelligence</span>
            <span>·</span>
            <span>The Supplier Illusion Solution</span>
          </div>
          <h2
            className="text-3xl sm:text-5xl font-medium text-neutral-900 tracking-tight"
            style={{ lineHeight: 1.1 }}
          >
            The Anatomy of a{' '}
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              Supplier Illusion
            </span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 font-normal max-w-2xl mx-auto">
            Traditional enterprise procurement stops at Tier-1 vendors. TrueTier traces the multi-tier graph down to physical silicon cleanrooms, rare-earth flotation basins, and container ports.
          </p>
        </div>

        {/* 3 Pillar Cards with TrueTier Gold styling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-4">
          {/* Card 1 */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-sm flex flex-col justify-between hover:border-[#f09e26]/40 hover:shadow-md transition-all group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#f09e26] group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">
                01. Multi-Tier Graph Synthesis
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Aggregates internal ERP purchase histories with international bill-of-lading shipping manifests, 10-K regulatory filings, and geospatial industrial coordinates.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-medium">
              <span>Depth Mapped</span>
              <span className="text-neutral-900 font-semibold font-mono">Tiers 1, 2 & 3</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-sm flex flex-col justify-between hover:border-[#f09e26]/40 hover:shadow-md transition-all group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">
                02. 3-Stop Confidence Lens
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Separates audited contracts (Verified: solid teal), voluntary disclosures (Reported: dashed amber), and probabilistic machine inference (Inferred: dotted violet with ?).
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-medium">
              <span>Provenance Model</span>
              <span className="text-neutral-900 font-semibold font-mono">Noisy-OR Multi-Signal</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-sm flex flex-col justify-between hover:border-[#f09e26]/40 hover:shadow-md transition-all group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#f09e26] group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">
                03. EIC & False Diversification Score
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Calculates Effective Independence Count (EIC) vs Nominal Suppliers. When multiple vendors rely on one node, FDS rises to flag pure illusion.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-medium">
              <span>Metric Formula</span>
              <span className="text-neutral-900 font-semibold font-mono">EIC = min(N, 1/MaxExp)</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE GRAPHICAL SECTION: Multi-Tier Convergence & Disruption Shock
          ========================================================================= */}
      <section
        id="interactive-visual"
        className="max-w-[1180px] w-full mx-auto mt-20 sm:mt-28 px-3 sm:px-4 relative z-10"
      >
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-neutral-200 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#b45309] uppercase tracking-wider mb-1">
                <Radio className="w-3.5 h-3.5 text-[#f09e26] animate-pulse" />
                <span>Interactive Visual Sandbox</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900 tracking-tight">
                Live Dependency Flow & Single Point of Failure Shock
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Click a disruption scenario or hover on supply chain nodes to inspect real-time bottleneck propagation.
              </p>
            </div>

            {/* Interactive Disruption Triggers */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-neutral-500 mr-1">Simulate Shock:</span>
              <button
                type="button"
                onClick={() => setActiveDisruption('none')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeDisruption === 'none'
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Normal Flow
              </button>
              <button
                type="button"
                onClick={() => setActiveDisruption('typhoon')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeDisruption === 'typhoon'
                    ? 'bg-red-600 text-white shadow-sm font-semibold'
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                }`}
              >
                <span>Typhoon Kaohsiung</span>
                {activeDisruption === 'typhoon' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
              </button>
              <button
                type="button"
                onClick={() => setActiveDisruption('fab')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeDisruption === 'fab'
                    ? 'bg-red-600 text-white shadow-sm font-semibold'
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                }`}
              >
                <span>HWW Cleanroom Fault</span>
                {activeDisruption === 'fab' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
              </button>
            </div>
          </div>

          {/* Interactive Graphical Canvas Diagram mirroring the TrueTier Logo Convergence */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual SVG Flow Diagram */}
            <div className="lg:col-span-8 bg-[#f8f7f5] rounded-2xl p-6 border border-neutral-200/90 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-2 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-700">Multi-Tier Convergence Architecture</span>
                  <button
                    type="button"
                    onClick={() => setFlowAnimKey((k) => k + 1)}
                    className="inline-flex items-center gap-1 text-[11px] text-[#b45309] hover:text-[#92400e] bg-amber-50 hover:bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-200/70 transition-colors cursor-pointer"
                    title="Re-run flow draw animation"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Redraw Flow</span>
                  </button>
                </div>
                <span className="text-[11px] font-mono">
                  {activeDisruption === 'none'
                    ? 'Status: Nominal (All 3 vendors active)'
                    : 'Hazard Alert: Shock Wave Propagating'}
                </span>
              </div>

              {/* Responsive SVG Graphic */}
              <div className="w-full aspect-[16/9] max-h-[340px] flex items-center justify-center">
                <svg viewBox="0 0 500 280" className="w-full h-full overflow-visible">
                  {/* Background grid lines animated with Framer Motion pathLength */}
                  <motion.line
                    key={`grid-1-${flowAnimKey}`}
                    x1="50"
                    y1="50"
                    x2="450"
                    y2="50"
                    stroke="#e5e5e5"
                    strokeDasharray="3 3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                  <motion.line
                    key={`grid-2-${flowAnimKey}`}
                    x1="50"
                    y1="160"
                    x2="450"
                    y2="160"
                    stroke="#e5e5e5"
                    strokeDasharray="3 3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
                  />

                  {/* Flow Streams from Tier-1 nodes to HWW Fab animated via Framer Motion pathLength */}
                  {/* Left Stream: Nexa -> HWW */}
                  <motion.path
                    key={`stream-nexa-${flowAnimKey}`}
                    d="M 110 60 C 110 130, 240 135, 250 160"
                    fill="none"
                    stroke={activeDisruption !== 'none' ? '#ef4444' : '#f09e26'}
                    strokeWidth={activeDisruption !== 'none' ? '3' : '2.5'}
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0.15 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                    className={activeDisruption !== 'none' ? 'animate-pulse' : ''}
                  />

                  {/* Middle Stream: Orion -> HWW */}
                  <motion.path
                    key={`stream-orion-${flowAnimKey}`}
                    d="M 250 60 L 250 160"
                    fill="none"
                    stroke={activeDisruption !== 'none' ? '#ef4444' : '#f09e26'}
                    strokeWidth={activeDisruption !== 'none' ? '3' : '2.5'}
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0.15 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    className={activeDisruption !== 'none' ? 'animate-pulse' : ''}
                  />

                  {/* Right Stream: Helix -> HWW */}
                  <motion.path
                    key={`stream-helix-${flowAnimKey}`}
                    d="M 390 60 C 390 130, 260 135, 250 160"
                    fill="none"
                    stroke={activeDisruption !== 'none' ? '#ef4444' : '#f09e26'}
                    strokeWidth={activeDisruption !== 'none' ? '3' : '2.5'}
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0.15 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                    className={activeDisruption !== 'none' ? 'animate-pulse' : ''}
                  />

                  {/* Stream from HWW Fab down to Port of Kaohsiung */}
                  <motion.path
                    key={`stream-port-${flowAnimKey}`}
                    d="M 250 160 L 250 225"
                    fill="none"
                    stroke={activeDisruption !== 'none' ? '#dc2626' : '#0d172a'}
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0.15 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.75 }}
                  />

                  {/* Stream to Buyer Assembly */}
                  <motion.path
                    key={`stream-buyer-${flowAnimKey}`}
                    d="M 250 225 C 250 250, 410 240, 440 240"
                    fill="none"
                    stroke={activeDisruption !== 'none' ? '#ef4444' : '#64748b'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0.15 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 1.1 }}
                  />

                  {/* TOP NODES (Tier 1 Suppliers) */}
                  {/* Nexa Semi */}
                  <g
                    className="cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setActiveHoverNode('nexa')}
                  >
                    {activeHoverNode === 'nexa' && (
                      <circle cx="110" cy="50" r="22" fill="none" stroke="#f09e26" strokeWidth="2.5" strokeDasharray="3 3" className="animate-spin origin-[110px_50px]" />
                    )}
                    <circle
                      cx="110"
                      cy="50"
                      r={activeHoverNode === 'nexa' ? '16' : '14'}
                      fill={activeHoverNode === 'nexa' ? '#f09e26' : '#0d172a'}
                      className="transition-all duration-200"
                    />
                    <text x="110" y="54" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">
                      T1
                    </text>
                    <text
                      x="110"
                      y="28"
                      fill={activeHoverNode === 'nexa' ? '#b45309' : '#334155'}
                      fontSize="11"
                      fontWeight={activeHoverNode === 'nexa' ? '700' : '600'}
                      textAnchor="middle"
                    >
                      Nexa Semi (40%)
                    </text>
                  </g>

                  {/* Orion Micro */}
                  <g
                    className="cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setActiveHoverNode('orion')}
                  >
                    {activeHoverNode === 'orion' && (
                      <circle cx="250" cy="50" r="22" fill="none" stroke="#f09e26" strokeWidth="2.5" strokeDasharray="3 3" className="animate-spin origin-[250px_50px]" />
                    )}
                    <circle
                      cx="250"
                      cy="50"
                      r={activeHoverNode === 'orion' ? '16' : '14'}
                      fill={activeHoverNode === 'orion' ? '#f09e26' : '#0d172a'}
                      className="transition-all duration-200"
                    />
                    <text x="250" y="54" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">
                      T1
                    </text>
                    <text
                      x="250"
                      y="28"
                      fill={activeHoverNode === 'orion' ? '#b45309' : '#334155'}
                      fontSize="11"
                      fontWeight={activeHoverNode === 'orion' ? '700' : '600'}
                      textAnchor="middle"
                    >
                      Orion Micro (35%)
                    </text>
                  </g>

                  {/* Helix Devices */}
                  <g
                    className="cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setActiveHoverNode('helix')}
                  >
                    {activeHoverNode === 'helix' && (
                      <circle cx="390" cy="50" r="22" fill="none" stroke="#f09e26" strokeWidth="2.5" strokeDasharray="3 3" className="animate-spin origin-[390px_50px]" />
                    )}
                    <circle
                      cx="390"
                      cy="50"
                      r={activeHoverNode === 'helix' ? '16' : '14'}
                      fill={activeHoverNode === 'helix' ? '#f09e26' : '#0d172a'}
                      className="transition-all duration-200"
                    />
                    <text x="390" y="54" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">
                      T1
                    </text>
                    <text
                      x="390"
                      y="28"
                      fill={activeHoverNode === 'helix' ? '#b45309' : '#334155'}
                      fontSize="11"
                      fontWeight={activeHoverNode === 'helix' ? '700' : '600'}
                      textAnchor="middle"
                    >
                      Helix Devices (25%)
                    </text>
                  </g>

                  {/* MIDDLE CHOKEPOINT NODE: Hsinchu Wafer Works */}
                  <g
                    className="cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setActiveHoverNode('hww')}
                  >
                    {/* Pulsing ring if active hazard */}
                    {activeDisruption === 'fab' && (
                      <circle cx="250" cy="160" r="30" fill="none" stroke="#ef4444" strokeWidth="2.5" className="animate-ping" />
                    )}
                    {activeHoverNode === 'hww' && (
                      <circle cx="250" cy="160" r="26" fill="none" stroke="#f09e26" strokeWidth="2.5" strokeDasharray="3 3" className="animate-spin origin-[250px_160px]" />
                    )}
                    <circle
                      cx="250"
                      cy="160"
                      r={activeHoverNode === 'hww' ? '20' : '18'}
                      fill={activeDisruption === 'fab' ? '#ef4444' : '#f09e26'}
                      stroke="#0d172a"
                      strokeWidth={activeHoverNode === 'hww' ? '4.5' : '4'}
                      className="transition-all duration-200"
                    />
                    <text x="250" y="164" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">
                      FAB
                    </text>
                    <text
                      x="250"
                      y="195"
                      fill={activeHoverNode === 'hww' ? '#b45309' : '#0d172a'}
                      fontSize="11"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      Hsinchu Wafer Works (Shared Bottleneck)
                    </text>
                  </g>

                  {/* LOWER CHOKEPOINT NODE: Port of Kaohsiung */}
                  <g
                    className="cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setActiveHoverNode('kaohsiung')}
                  >
                    {activeDisruption === 'typhoon' && (
                      <circle cx="250" cy="225" r="28" fill="none" stroke="#ef4444" strokeWidth="2.5" className="animate-ping" />
                    )}
                    {activeHoverNode === 'kaohsiung' && (
                      <circle cx="250" cy="225" r="23" fill="none" stroke="#f09e26" strokeWidth="2.5" strokeDasharray="3 3" className="animate-spin origin-[250px_225px]" />
                    )}
                    <circle
                      cx="250"
                      cy="225"
                      r={activeHoverNode === 'kaohsiung' ? '17' : '15'}
                      fill={activeDisruption === 'typhoon' ? '#ef4444' : (activeHoverNode === 'kaohsiung' ? '#f09e26' : '#d97706')}
                      stroke="#0d172a"
                      strokeWidth={activeHoverNode === 'kaohsiung' ? '4' : '3.5'}
                      className="transition-all duration-200"
                    />
                    <text x="250" y="229" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle">
                      PORT
                    </text>
                    <text
                      x="250"
                      y="254"
                      fill={activeHoverNode === 'kaohsiung' ? '#b45309' : '#0d172a'}
                      fontSize="10"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      Port of Kaohsiung (Outbound Shipping)
                    </text>
                  </g>

                  {/* BUYER NODE: Aurora Motors */}
                  <g
                    className="cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setActiveHoverNode('aurora')}
                  >
                    {activeHoverNode === 'aurora' && (
                      <rect x="415" y="217" width="80" height="45" rx="14" fill="none" stroke="#f09e26" strokeWidth="2.5" strokeDasharray="3 3" />
                    )}
                    <rect
                      x="420"
                      y="222"
                      width="70"
                      height="35"
                      rx="10"
                      fill="#0b0f1a"
                      stroke={activeHoverNode === 'aurora' ? '#f09e26' : 'none'}
                      strokeWidth={activeHoverNode === 'aurora' ? '2.5' : '0'}
                      className="transition-all duration-200"
                    />
                    <text x="455" y="238" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle">
                      Aurora Motors
                    </text>
                    <text x="455" y="250" fill="#f09e26" fontSize="8" textAnchor="middle">
                      Chennai Plant
                    </text>
                  </g>
                </svg>
              </div>
            </div>

            {/* Live Telemetry Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-[#f8f7f5] rounded-2xl p-5 border border-neutral-200/90 space-y-3.5 shadow-xs overflow-hidden">
                <div className="flex items-center justify-between text-xs border-b border-neutral-200/70 pb-2">
                  <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                    <Activity className="w-3.5 h-3.5 text-[#f09e26]" />
                    <span>Node Telemetry Inspector</span>
                  </div>
                  <span className="text-[10px] bg-amber-50 text-[#b45309] font-mono px-2 py-0.5 rounded-full border border-amber-200/60">
                    Live Reactive
                  </span>
                </div>

                {/* Quick Interactive Node Selector Pills */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                      Select Diagram Node:
                    </span>
                    <span className="text-[10.5px] text-[#f09e26] font-medium">
                      {activeHoverNode?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {[
                      { id: 'hww', label: 'HWW Fab' },
                      { id: 'kaohsiung', label: 'Port Kaohsiung' },
                      { id: 'nexa', label: 'Nexa (T1)' },
                      { id: 'orion', label: 'Orion (T1)' },
                      { id: 'helix', label: 'Helix (T1)' },
                      { id: 'aurora', label: 'Aurora OEM' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveHoverNode(item.id)}
                        className={`px-2 py-1 text-[10.5px] rounded-lg font-medium transition-all cursor-pointer ${
                          activeHoverNode === item.id
                            ? 'bg-[#f09e26] text-white shadow-xs font-semibold scale-105'
                            : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Framer Motion Animated Telemetry Content with smooth fade and shift */}
                <AnimatePresence mode="wait">
                  {(() => {
                    const activeKey = activeHoverNode || 'hww';
                    const nodeData = NODE_TELEMETRY[activeKey] || NODE_TELEMETRY.hww;
                    return (
                      <motion.div
                        key={activeKey}
                        initial={{ opacity: 0, y: 14, filter: 'blur(3px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -12, filter: 'blur(2px)' }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-3"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${nodeData.badgeBg}`}>
                              {nodeData.badgeText}
                            </span>
                            <span className="text-[10.5px] text-neutral-500 font-mono">
                              {nodeData.tier}
                            </span>
                          </div>
                          <h4 className="font-bold text-neutral-900 text-sm mt-1.5 flex items-center gap-1.5">
                            {nodeData.name}
                          </h4>
                        </div>

                        <p className="text-neutral-600 text-xs leading-relaxed">
                          {nodeData.description}
                        </p>

                        {/* Staggered Telemetry Stat Cards */}
                        <div className="grid grid-cols-2 gap-2 pt-0.5">
                          {nodeData.stats.map((stat, idx) => (
                            <motion.div
                              key={stat.title}
                              initial={{ opacity: 0, y: 8, scale: 0.97 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ delay: idx * 0.04 + 0.05, duration: 0.22, ease: "easeOut" }}
                              className="bg-white p-2.5 rounded-xl border border-neutral-200/90 shadow-2xs hover:border-[#f09e26]/50 transition-colors"
                            >
                              <span className="text-[10px] text-neutral-500 font-medium block leading-tight">
                                {stat.title}
                              </span>
                              <span className={`text-[13px] font-bold block mt-0.5 ${
                                stat.tone === 'danger' ? 'text-red-600' :
                                stat.tone === 'warning' ? 'text-[#b45309]' :
                                stat.tone === 'info' ? 'text-[#0b0f1a]' : 'text-neutral-700'
                              }`}>
                                {stat.value}
                              </span>
                              <span className="text-[9.5px] text-neutral-400 block mt-0.5 leading-tight">
                                {stat.subtext}
                              </span>
                            </motion.div>
                          ))}
                        </div>

                        {/* Highlight Note Card */}
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.22, duration: 0.22 }}
                          className="text-[11px] p-2.5 rounded-xl border bg-amber-50/80 border-amber-200/80 text-amber-950 flex items-start gap-2 shadow-2xs"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-[#f09e26] shrink-0 mt-0.5" />
                          <span className="leading-snug">{nodeData.highlightNote}</span>
                        </motion.div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>

              {/* Shock Status Box with Framer Motion transitions */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDisruption}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                  className={`rounded-2xl p-4 border text-xs space-y-2 transition-colors ${
                    activeDisruption !== 'none'
                      ? 'bg-red-50 border-red-300 text-red-900 shadow-xs'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {activeDisruption !== 'none' ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-red-600 animate-bounce" />
                        <span>Single Point of Failure Triggered!</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Nominal Sourcing Stream Steady</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {activeDisruption === 'typhoon' &&
                      'Super Typhoon halts Kaohsiung port for 14 days. Zero alternate shipping routes exist. Automotive assembly line runs out of buffer inventory on Day 9.'}
                    {activeDisruption === 'fab' &&
                      'Cleanroom contamination halts HWW 40nm line for 30 days. All three suppliers fail at the exact same moment.'}
                    {activeDisruption === 'none' &&
                      'All three suppliers delivering on schedule. Hidden chokepoint remains invisible to legacy ERP systems.'}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2.5: D3-SVG Geographic Risk Heatmap & Scenario Matrix (#risk-map)
          ========================================================================= */}
      <RiskMapSection />

      {/* =========================================================================
          SECTION 3: Case Study & Interactive Decoupling Slider (#about)
          ========================================================================= */}
      <section
        id="about"
        className="max-w-[1180px] w-full mx-auto mt-20 sm:mt-28 px-3 sm:px-4 relative z-10"
      >
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-neutral-200 shadow-sm space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left text */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 bg-amber-50 text-[#b45309] px-3 py-1 rounded-full text-xs font-semibold border border-amber-200/80">
                <span>Empirical Case Study</span>
                <span>·</span>
                <span>Aurora Motors Chennai EV Plant</span>
              </div>
              <h2
                className="text-2xl sm:text-4xl font-medium text-neutral-900 tracking-tight"
                style={{ lineHeight: 1.15 }}
              >
                Three suppliers on paper.{' '}
                <span
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontStyle: 'italic',
                    fontWeight: 400,
                  }}
                >
                  One point of failure
                </span>{' '}
                in reality.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Aurora Motors purchases Power Microcontrollers (MCU) from Nexa Semi, Orion Micro, and Helix Devices. On standard corporate dashboards, procurement celebrates a diversified 3-vendor strategy.
              </p>
              <div className="bg-neutral-50 border border-neutral-200/90 rounded-2xl p-4 text-xs space-y-2">
                <div className="font-semibold text-neutral-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  The Planted Chokepoint Trap
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  All three tier-1 vendors rely exclusively on <strong>Hsinchu Wafer Works (HWW)</strong> in Taiwan for 40nm automotive silicon fabrication, shipping 94% of finished goods via the <strong>Port of Kaohsiung</strong>.
                </p>
                <div className="pt-2 flex items-center gap-3 text-[11px] text-neutral-500 border-t border-neutral-200/60 font-medium">
                  <span className="text-red-600 font-semibold">Super Typhoon Simulation:</span>
                  <span>Kaohsiung port closes 14 days → EV Assembly halts on Day 9.</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={() => setExplorerOpen(true)}
                  className="bg-[#0b0f1a] hover:bg-[#1a2133] text-white rounded-full px-5 py-2.5 text-xs font-medium transition-all flex items-center gap-2 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f09e26]"
                >
                  <span>Test Confidence Lens Live</span>
                  <ArrowUpRight className="w-4 h-4 text-[#f09e26]" />
                </button>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Copper Control Group validated (Zero false alarms)</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Decoupling Slider Simulator */}
            <div className="lg:col-span-6 bg-[#f8f7f5] rounded-3xl p-6 border border-neutral-200 space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-200/70 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#f09e26]" />
                  <span className="text-xs font-bold text-neutral-900">Interactive Decoupling Simulator</span>
                </div>
                <span className="text-[10px] font-semibold text-[#b45309] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Autonomous ROI
                </span>
              </div>

              {/* Slider 1: Allocation to Pune Micro */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-neutral-700">Domestic Supplier Allocation (Pune Micro)</span>
                  <span className="font-bold text-neutral-900 font-mono text-sm">{puneShare}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={puneShare}
                  onChange={(e) => setPuneShare(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#f09e26]"
                />
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>0% (100% HWW Taiwan)</span>
                  <span>60% (Deep Decoupling)</span>
                </div>
              </div>

              {/* Slider 2: Safety Buffer Days */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-neutral-700">Safety Buffer Stock Inventory</span>
                  <span className="font-bold text-neutral-900 font-mono text-sm">{bufferDays} Days</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={bufferDays}
                  onChange={(e) => setBufferDays(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#f09e26]"
                />
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>5 Days (Lean JIT)</span>
                  <span>30 Days (High Resilience)</span>
                </div>
              </div>

              {/* Dynamically Recalculated Metric Output */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-200/70">
                <div className="bg-white p-3 rounded-2xl border border-neutral-200">
                  <span className="text-[11px] text-neutral-400 block font-medium">Simulated FDS Score:</span>
                  <div className="text-xl font-bold text-neutral-900 mt-0.5 font-mono">
                    {(simulatedFDS * 100).toFixed(0)}%
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600">
                    {simulatedFDS < 0.35 ? 'Diversified Decoupled' : 'Partial Decoupling'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-neutral-200">
                  <span className="text-[11px] text-neutral-400 block font-medium">P90 Loss Avoided:</span>
                  <div className="text-xl font-bold text-[#b45309] mt-0.5 font-mono">
                    ₹{simulatedLossAvoided} Cr
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-500">
                    Estimated ROI 4.2x
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: Autonomous Decoupling Engine
          ========================================================================= */}
      <section className="max-w-[1180px] w-full mx-auto mt-20 sm:mt-28 px-3 sm:px-4 space-y-6 relative z-10">
        <div className="bg-[#0b0f1a] text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
          {/* Subtle TrueTier Gold ambient glow aura */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#f09e26]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#f09e26] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#f09e26]" />
              <span>Prescriptive Action Engine</span>
            </div>
            <h2
              className="text-2xl sm:text-4xl font-medium tracking-tight"
              style={{ lineHeight: 1.15 }}
            >
              Do not just detect illusions.{' '}
              <span
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: 'italic',
                  fontWeight: 400,
                }}
              >
                Dismantle them.
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
              TrueTier models targeted decoupling scenarios. By onboarding alternative domestic suppliers and sizing strategic inventory buffers, operations leaders protect continuous assembly lines with positive ROI.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-neutral-800">
            <div className="space-y-1">
              <span className="text-[11px] text-neutral-400 font-medium">Recommended Decoupling</span>
              <div className="text-sm font-semibold text-white">Pune Micro Devices</div>
              <p className="text-[11px] text-neutral-400">Domestic Maharashtra silicon line with direct road transit</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-neutral-400 font-medium">FDS Risk Reduction</span>
              <div className="text-sm font-semibold text-emerald-400">0.68 → 0.28 (-58%)</div>
              <p className="text-[11px] text-neutral-400">Restores true multi-tier independence</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-neutral-400 font-medium">P90 Financial Exposure Avoided</span>
              <div className="text-sm font-semibold text-[#f09e26]">₹24.8 Crore Saved</div>
              <p className="text-[11px] text-neutral-400">Measured at 4.2x capital allocation ROI</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER
          ========================================================================= */}
      <footer className="max-w-[1180px] w-full mx-auto mt-20 sm:mt-24 pb-8 px-4 border-t border-neutral-200/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 relative z-10">
        <div className="flex items-center gap-3">
          <TrueTierLogo className="h-6" showTagline={true} />
        </div>

        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => scrollToTarget('#features', { offset: -30 })}
            className="hover:text-neutral-800 transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => scrollToTarget('#interactive-visual', { offset: -30 })}
            className="hover:text-neutral-800 transition-colors cursor-pointer"
          >
            Interactive Sandbox
          </button>
          <button
            type="button"
            onClick={() => scrollToTarget('#risk-map', { offset: -30 })}
            className="hover:text-neutral-800 transition-colors cursor-pointer"
          >
            Risk Map
          </button>
          <button
            type="button"
            onClick={() => scrollToTarget('#about', { offset: -30 })}
            className="hover:text-neutral-800 transition-colors cursor-pointer"
          >
            Case Study
          </button>
          <button
            type="button"
            onClick={() => setExplorerOpen(true)}
            className="hover:text-neutral-800 transition-colors cursor-pointer"
          >
            Deep Graph
          </button>
          <button
            type="button"
            onClick={() => scrollToTarget(0, { duration: 1.2 })}
            className="text-[#f09e26] hover:underline font-semibold cursor-pointer"
          >
            Back to Top ↑
          </button>
        </div>
      </footer>

      {/* Supplier Illusion Deep Analysis & Disruption Simulator Modal */}
      <SupplierIllusionExplorer
        isOpen={explorerOpen}
        onClose={() => setExplorerOpen(false)}
      />
    </main>
  );
}
