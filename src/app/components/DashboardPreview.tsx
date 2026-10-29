import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  ChevronDown,
  Check,
  AlertTriangle,
  Layers,
  Network,
  ShieldAlert,
  ArrowUpRight,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Minus,
  Plus
} from 'lucide-react';
import Gauge from './Gauge';

interface DashboardPreviewProps {
  mode?: 'supply_chain' | 'agency';
  onInspectNode?: (nodeId: string) => void;
  onOpenExplorer?: () => void;
}

type ComponentType = 'mcu' | 'battery' | 'copper';
type ViewPerspective = 'deep' | 'nominal';

interface ComponentData {
  name: string;
  subhead: string;
  tier1Vendors: string[];
  hiddenChokepoint: string;
  chokepointLocation: string;
  chokepointShare: number;
  nominalRedundancy: number;
  effectiveCapacity: number;
  falseDiversificationScore: number;
  riskGaugeValue: number;
  nominalGaugeValue: number;
  isControl: boolean;
}

const COMPONENTS: Record<ComponentType, ComponentData> = {
  mcu: {
    name: 'Power MCU (40nm Automotive)',
    subhead: 'Critical Braking & Powertrain Silicon',
    tier1Vendors: ['Nexa Semi (40%)', 'Orion Micro (35%)', 'Helix Devices (25%)'],
    hiddenChokepoint: 'Hsinchu Wafer Works (HWW Fab 3)',
    chokepointLocation: 'Hsinchu Science Park, Taiwan',
    chokepointShare: 94.2,
    nominalRedundancy: 3,
    effectiveCapacity: 1.08,
    falseDiversificationScore: 92,
    riskGaugeValue: 94,
    nominalGaugeValue: 0,
    isControl: false,
  },
  battery: {
    name: 'LFP Battery Cathodes',
    subhead: 'Prismatic Energy Storage Cells',
    tier1Vendors: ['VoltCell India (60%)', 'Apex Lithium (40%)'],
    hiddenChokepoint: 'Sichuan Lithium Refining Corp',
    chokepointLocation: 'Yibin Chemical Complex, China',
    chokepointShare: 86.5,
    nominalRedundancy: 2,
    effectiveCapacity: 1.14,
    falseDiversificationScore: 84,
    riskGaugeValue: 86,
    nominalGaugeValue: 0,
    isControl: false,
  },
  copper: {
    name: 'Copper Busbars (Control Group)',
    subhead: 'High-Voltage Battery Interconnects',
    tier1Vendors: ['Bharat Conductors (55%)', 'Deccan Copper (45%)'],
    hiddenChokepoint: 'Independent Smelting Works',
    chokepointLocation: 'Gujarat / Nordic Smelting (Decoupled)',
    chokepointShare: 12.1,
    nominalRedundancy: 2,
    effectiveCapacity: 1.95,
    falseDiversificationScore: 12,
    riskGaugeValue: 12,
    nominalGaugeValue: 0,
    isControl: true,
  },
};

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({
  onOpenExplorer,
}) => {
  // Selected component to inspect
  const [selectedComponent, setSelectedComponent] = useState<ComponentType>('mcu');

  // Perspective toggle: TrueTier Deep Reality vs Legacy Nominal Illusion
  const [perspective, setPerspective] = useState<ViewPerspective>('deep');

  // Card 2 Disruption Simulator state
  const [scenario, setScenario] = useState<'typhoon' | 'fab' | 'export_ban'>('typhoon');
  const [scenarioDropdownOpen, setScenarioDropdownOpen] = useState(false);
  const [bufferDays, setBufferDays] = useState<number>(10);
  const [decouplingApplied, setDecouplingApplied] = useState<boolean>(false);

  const activeComp = COMPONENTS[selectedComponent];

  // Disruption calculation
  const disruptionDurations = {
    typhoon: 14,
    fab: 30,
    export_ban: 60,
  };

  const disruptionNames = {
    typhoon: 'Typhoon Kaohsiung (14d Port Lockout)',
    fab: 'HWW Fab Cleanroom Contamination (30d)',
    export_ban: 'Critical Mineral Quota Embargo (60d)',
  };

  const duration = disruptionDurations[scenario];
  const effectiveBuffer = decouplingApplied ? bufferDays + 8 : bufferDays;
  const daysToStoppage = Math.max(1, effectiveBuffer - 1); // 1-day safety transit lead
  const isStoppageTriggered = !activeComp.isControl && duration > effectiveBuffer;
  const estimatedLossCr = isStoppageTriggered
    ? ((duration - effectiveBuffer) * 1.84 * (decouplingApplied ? 0.35 : 1.0)).toFixed(1)
    : '0.0';

  return (
    <div className="w-full px-1.5 sm:px-4">
      {/* =======================================================================
          TARGET ELEMENT: Dashboard Tray Wrapper (bg-[#f5f2ee])
          Fully generated multi-tier sourcing intelligence console
          ======================================================================= */}
      <div className="bg-[#f5f2ee] rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-6 w-full max-w-[920px] mx-auto shadow-md border border-neutral-300/80 relative transition-all">
        {/* Top Header Bar & Component Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-neutral-200/90 text-xs text-neutral-600">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f09e26] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f09e26]"></span>
            </span>
            <span className="font-semibold text-neutral-900 tracking-tight">
              TrueTier Sourcing Intelligence Console
            </span>
            <span className="text-neutral-400 hidden sm:inline">·</span>
            <span className="text-neutral-500 hidden md:inline">
              Live Multi-Tier Dependency Telemetry
            </span>
          </div>

          {/* Component Tabs */}
          <div className="flex items-center gap-1.5 bg-neutral-200/60 p-1 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSelectedComponent('mcu')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                selectedComponent === 'mcu'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Power MCU
            </button>
            <button
              type="button"
              onClick={() => setSelectedComponent('battery')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                selectedComponent === 'battery'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              LFP Cells
            </button>
            <button
              type="button"
              onClick={() => setSelectedComponent('copper')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                selectedComponent === 'copper'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Copper (Control)
            </button>
          </div>
        </div>

        {/* 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-left">
          
          {/* ===================================================================
              CARD 1: Sourcing Vulnerability & The Supplier Illusion
              =================================================================== */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-neutral-200/80 flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between text-[12px] mb-2.5">
                <span className="text-[#f09e26] font-semibold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {perspective === 'deep' ? 'Hidden Chokepoint Risk' : 'Commercial Redundancy'}
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                  {perspective === 'deep' ? 'Reality' : 'Illusion'}
                </span>
              </div>

              {/* Big Metric + Trend Indicator */}
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[26px] sm:text-[28px] leading-tight font-semibold text-neutral-900 tracking-tight font-sans">
                  {perspective === 'deep'
                    ? `${activeComp.riskGaugeValue}%`
                    : `${activeComp.nominalRedundancy} Vendors`}
                </span>
                {perspective === 'deep' ? (
                  activeComp.isControl ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-[11px] font-semibold border border-emerald-200/60">
                      <CheckCircle2 className="w-3 h-3" />
                      Decoupled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 rounded-full px-2 py-0.5 text-[11px] font-semibold border border-red-200/60">
                      <TrendingDown className="w-3 h-3" />
                      Critical Chokepoint
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-[11px] font-semibold border border-emerald-200/60">
                    <CheckCircle2 className="w-3 h-3" />
                    Diversified
                  </span>
                )}
              </div>

              {/* Caption */}
              <p className="text-[11px] text-neutral-500 mb-3 leading-snug">
                {perspective === 'deep'
                  ? activeComp.isControl
                    ? 'Verified independent smelters. Zero common upstream single point of failure.'
                    : `All Tier-1 suppliers rely on ${activeComp.hiddenChokepoint}.`
                  : 'Legacy procurement software only tracks Tier-1 legal vendor tax entities.'}
              </p>

              {/* Dynamic Target label & Gauge */}
              <div className="text-center text-[11.5px] font-medium text-neutral-700 mb-1">
                {perspective === 'deep'
                  ? `False Diversification Score: ${activeComp.falseDiversificationScore}%`
                  : 'Nominal Vendor Coverage: 100%'}
              </div>

              <Gauge
                value={perspective === 'deep' ? activeComp.riskGaugeValue : 100}
                color={
                  perspective === 'deep'
                    ? activeComp.isControl
                      ? '#10b981'
                      : activeComp.riskGaugeValue > 70
                      ? '#ef4444'
                      : '#f09e26'
                    : '#10b981'
                }
                showLabels={true}
                min={perspective === 'deep' ? '1.08 EIC' : '0 Risk'}
                max={perspective === 'deep' ? '3.00 Nominal' : '3 Vendors'}
              />
            </div>

            {/* Perspective Toggle: Deep vs Nominal */}
            <div className="mt-4 bg-neutral-100 rounded-full p-1 flex items-center text-[11px]">
              <button
                type="button"
                onClick={() => setPerspective('deep')}
                className={`flex-1 py-1 px-2 text-center rounded-full font-medium transition-all cursor-pointer ${
                  perspective === 'deep'
                    ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                TrueTier Deep Reality
              </button>
              <button
                type="button"
                onClick={() => setPerspective('nominal')}
                className={`flex-1 py-1 px-2 text-center rounded-full font-medium transition-all cursor-pointer ${
                  perspective === 'nominal'
                    ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                ERP Surface Illusion
              </button>
            </div>
          </div>

          {/* ===================================================================
              CARD 2: Interactive Disruption Stress-Test Simulator
              =================================================================== */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-neutral-200/80 flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#f09e26] font-semibold flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" />
                  Disruption Stress Test
                </span>
                <span className="text-[11px] font-medium text-neutral-500">
                  {duration}d event
                </span>
              </div>

              {/* Scenario dropdown selector */}
              <div className="relative">
                <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                  Simulated Catalyst Event
                </label>
                <button
                  type="button"
                  onClick={() => setScenarioDropdownOpen(!scenarioDropdownOpen)}
                  className="w-full flex items-center justify-between text-left text-[12px] text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 hover:bg-neutral-100/70 transition-colors focus:outline-none focus:ring-1 focus:ring-[#f09e26] cursor-pointer"
                >
                  <span className="truncate">{disruptionNames[scenario]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-1" />
                </button>
                {scenarioDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 py-1 text-xs">
                    {(Object.keys(disruptionNames) as Array<keyof typeof disruptionNames>).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setScenario(key);
                          setScenarioDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-amber-50/70 text-neutral-700 transition-colors cursor-pointer text-[11.5px]"
                      >
                        {disruptionNames[key]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Buffer Days Stepper Counter */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-700 mb-1">
                  <span>Assembly Safety Buffer Stock</span>
                  <span className="text-neutral-900 font-mono font-bold text-xs">
                    {bufferDays} Days {decouplingApplied && <span className="text-emerald-600 font-semibold">(+8d Pune)</span>}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setBufferDays(Math.max(3, bufferDays - 2))}
                    className="p-1 hover:bg-white rounded-md text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                    aria-label="Decrease buffer days"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex-1 text-center font-mono text-xs font-semibold text-neutral-800">
                    {effectiveBuffer} Total Days In-Inventory
                  </div>
                  <button
                    type="button"
                    onClick={() => setBufferDays(Math.min(30, bufferDays + 2))}
                    className="p-1 hover:bg-white rounded-md text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                    aria-label="Increase buffer days"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Real-time Calculated Stoppage Prediction Pill */}
              <div
                className={`rounded-xl p-2.5 border text-xs space-y-1 transition-all ${
                  isStoppageTriggered
                    ? 'bg-red-50/90 border-red-200 text-red-900'
                    : 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="font-bold flex items-center justify-between text-[11.5px]">
                  <span className="flex items-center gap-1.5">
                    {isStoppageTriggered ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    )}
                    {isStoppageTriggered ? `Line Stoppage on Day ${daysToStoppage}` : 'Protected Sourcing Flow'}
                  </span>
                  <span className="font-mono text-[11px] font-semibold">
                    {isStoppageTriggered ? `₹${estimatedLossCr} Cr Exposure` : '₹0 Loss'}
                  </span>
                </div>
                <p className="text-[10.5px] leading-tight text-neutral-600">
                  {isStoppageTriggered
                    ? `Duration (${duration}d) exhausts safety buffer on Day ${daysToStoppage}. Automotive assembly shuts down.`
                    : 'Inventory buffer absorbs shock duration. Plant assembly operates uninterrupted.'}
                </p>
              </div>
            </div>

            {/* Decoupling Mitigation Action Button */}
            <div className="pt-3 border-t border-neutral-100 mt-2">
              <button
                type="button"
                onClick={() => setDecouplingApplied(!decouplingApplied)}
                className={`w-full py-1.5 px-3 rounded-lg text-[11.5px] font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  decouplingApplied
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-[#0b0f1a] hover:bg-[#1f283d] text-white shadow-xs'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${decouplingApplied ? 'animate-spin' : ''}`} />
                <span>
                  {decouplingApplied
                    ? 'Decoupling Active (Pune Hub: +35% Volume)'
                    : 'Simulate Dual-Sourcing with Pune Micro'}
                </span>
              </button>
            </div>
          </div>

          {/* ===================================================================
              CARD 3: Multi-Tier BOM & Upstream Traceability
              =================================================================== */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-neutral-200/80 flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between text-[12px] mb-2.5">
                <span className="text-[#f09e26] font-semibold flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  Upstream Dependency Graph
                </span>
                <span className="text-neutral-500 font-mono text-[11px]">
                  EIC: {activeComp.effectiveCapacity}
                </span>
              </div>

              {/* Big Metric: Effective Capacity */}
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[26px] sm:text-[28px] leading-tight font-semibold text-neutral-900 tracking-tight font-sans">
                  {activeComp.effectiveCapacity}
                </span>
                <span className="inline-flex items-center gap-1 bg-amber-50 text-[#b45309] rounded-full px-2 py-0.5 text-[11px] font-semibold border border-amber-200/70">
                  <TrendingUp className="w-3 h-3 text-[#f09e26]" />
                  Real Effective Capacity
                </span>
              </div>

              {/* Caption */}
              <p className="text-[11px] text-neutral-500 mb-3">
                {activeComp.isControl
                  ? 'Two independent smelters guarantee true dual-sourcing.'
                  : `Three Tier-1 invoices collapse to 1.08 actual independent capacity.`}
              </p>

              {/* Upstream Supply Chain Chain Visual */}
              <div className="space-y-1.5 text-[11px] bg-neutral-50/90 rounded-xl p-2.5 border border-neutral-200/70 mb-3 font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium">Tier 1 (Direct Vendors):</span>
                  <span className="font-semibold text-neutral-800">
                    {activeComp.tier1Vendors.length} Contracted
                  </span>
                </div>
                <div className="text-[10px] text-neutral-600 truncate pl-2 border-l-2 border-[#f09e26]">
                  {activeComp.tier1Vendors.join(' · ')}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-neutral-200/50">
                  <span className="text-neutral-500 font-medium">Tier 2 (Hidden Fab):</span>
                  <span className="font-semibold text-red-600">
                    {activeComp.isControl ? 'Decoupled' : 'Single Source (100%)'}
                  </span>
                </div>
                <div className="text-[10px] text-neutral-700 truncate pl-2 border-l-2 border-red-500">
                  {activeComp.hiddenChokepoint}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-neutral-200/50">
                  <span className="text-neutral-500 font-medium">Tier 3 (Maritime Chokepoint):</span>
                  <span className="font-semibold text-neutral-800">
                    {activeComp.isControl ? 'Multiple Ports' : 'Kaohsiung (94%)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Launch Deep Graph Explorer Button */}
            <div className="mt-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={onOpenExplorer}
                className="w-full py-1.5 px-3 rounded-lg text-[11.5px] font-medium bg-[#f09e26] hover:bg-[#df8f1a] active:scale-[0.98] text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Network className="w-3.5 h-3.5" />
                <span>Open Deep Dependency Explorer</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-auto" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
