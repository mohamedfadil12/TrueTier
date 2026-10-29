import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingDown,
  Layers,
  FileText,
  Ship,
  Building,
  Anchor,
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import Gauge from './Gauge';
import TrueTierLogo from './TrueTierLogo';

interface SupplierIllusionExplorerProps {
  isOpen: boolean;
  onClose: () => void;
}

type LensType = 'verified' | 'reported' | 'all';
type MaterialType = 'mcu' | 'cells' | 'magnets' | 'copper';

export const SupplierIllusionExplorer: React.FC<SupplierIllusionExplorerProps> = ({
  isOpen,
  onClose,
}) => {
  const [lens, setLens] = useState<LensType>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType>('mcu');
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>('hww');

  if (!isOpen) return null;

  // Material data per lens
  const materialData = {
    mcu: {
      name: 'Power MCU Chips',
      nominal: 3,
      criticality: 0.95,
      verified: { eic: 3.0, fds: 0.05, verdict: 'Diversified (On Paper)' },
      reported: { eic: 1.8, fds: 0.40, verdict: 'Partial Concentration' },
      all: { eic: 1.1, fds: 0.68, verdict: 'Illusion Revealed' },
      suppliers: ['Nexa Semi', 'Orion Micro', 'Helix Devices'],
      bottlenecks: ['Hsinchu Wafer Works (Fab)', 'Port of Kaohsiung'],
    },
    cells: {
      name: 'Li-ion Battery Cells',
      nominal: 2,
      criticality: 0.85,
      verified: { eic: 2.0, fds: 0.08, verdict: 'Diversified (On Paper)' },
      reported: { eic: 1.5, fds: 0.25, verdict: 'Partial' },
      all: { eic: 1.3, fds: 0.58, verdict: 'Illusion Revealed' },
      suppliers: ['VoltaCell', 'Ampere Dynamics'],
      bottlenecks: ['Sichuan Cathode Materials', 'Yibin Lithium Refinery'],
    },
    magnets: {
      name: 'Rare-Earth Magnets',
      nominal: 2,
      criticality: 0.75,
      verified: { eic: 2.0, fds: 0.06, verdict: 'Diversified' },
      reported: { eic: 1.6, fds: 0.20, verdict: 'Partial' },
      all: { eic: 1.2, fds: 0.62, verdict: 'Regional Illusion' },
      suppliers: ['Magnetix', 'Polaris Magnetics'],
      bottlenecks: ['Baotou Separation Basin', 'Inner Mongolia Hub'],
    },
    copper: {
      name: 'Copper Busbars (Control)',
      nominal: 3,
      criticality: 0.5,
      verified: { eic: 3.0, fds: 0.02, verdict: 'Genuinely Diversified' },
      reported: { eic: 2.9, fds: 0.03, verdict: 'Genuinely Diversified' },
      all: { eic: 2.9, fds: 0.04, verdict: 'Genuinely Diversified' },
      suppliers: ['Cuprum Nordic', 'Andes Metalworks', 'Deccan Copper'],
      bottlenecks: ['None (Independent routes & smelters)'],
    },
  };

  const currentMat = materialData[selectedMaterial];
  const currentMetrics = currentMat[lens];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#ededed] w-full max-w-5xl max-h-[92vh] rounded-3xl overflow-hidden shadow-2xl border border-neutral-300 flex flex-col">
        {/* Modal Header */}
        <div className="bg-white px-5 sm:px-7 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrueTierLogo iconOnly className="h-8 w-8" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight">
                  TrueTier · The Supplier Illusion Engine
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-[#b45309]">
                  Aurora Motors Scenario
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                See the source behind your suppliers · Epistemological confidence & disruption simulation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div
          data-lenis-prevent
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5"
        >
          {/* Top Controls: Material Selector & Confidence Lens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Material Selector */}
            <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-2">
                Select Critical Material
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['mcu', 'cells', 'magnets', 'copper'] as MaterialType[]).map((mKey) => (
                  <button
                    key={mKey}
                    onClick={() => setSelectedMaterial(mKey)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all text-left flex flex-col justify-between ${
                      selectedMaterial === mKey
                        ? 'bg-[#0b0f1a] text-white shadow-sm'
                        : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <span className="truncate">{materialData[mKey].name}</span>
                    <span
                      className={`text-[10px] mt-1 ${
                        selectedMaterial === mKey ? 'text-neutral-300' : 'text-neutral-400'
                      }`}
                    >
                      {materialData[mKey].nominal} Tier-1
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Confidence Lens Slider */}
            <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Confidence Lens (Belief Horizon)
                </label>
                <span className="text-[11px] font-medium text-neutral-500">
                  {lens === 'verified' && 'Contracts & ERP only'}
                  {lens === 'reported' && '+ Supplier Disclosures'}
                  {lens === 'all' && '+ Customs Manifests & Inferred links'}
                </span>
              </div>
              <div className="bg-neutral-100 p-1 rounded-xl flex items-center">
                <button
                  type="button"
                  onClick={() => setLens('verified')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                    lens === 'verified'
                      ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  1. Verified Only
                </button>
                <button
                  type="button"
                  onClick={() => setLens('reported')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                    lens === 'reported'
                      ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  2. + Reported
                </button>
                <button
                  type="button"
                  onClick={() => setLens('all')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                    lens === 'all'
                      ? 'bg-[#f09e26] text-white shadow-sm font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  3. All (+ Inferred)
                </button>
              </div>
            </div>
          </div>

          {/* Metric Comparison Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-neutral-400 uppercase">
                  Nominal Tier-1 Suppliers
                </span>
                <div className="text-2xl font-bold text-neutral-900">
                  {currentMat.nominal}
                </div>
                <span className="text-[11px] text-neutral-500">Direct vendors contracted</span>
              </div>
              <Building className="w-8 h-8 text-neutral-300" />
            </div>

            <div className="bg-white rounded-2xl p-4 border border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-neutral-400 uppercase">
                  Effective Independence (EIC)
                </span>
                <div
                  className={`text-2xl font-bold ${
                    currentMetrics.eic < 1.5 ? 'text-[#f09e26]' : 'text-neutral-900'
                  }`}
                >
                  {currentMetrics.eic.toFixed(1)}
                </div>
                <span className="text-[11px] text-neutral-500">True unshared upstream paths</span>
              </div>
              <ShieldCheck
                className={`w-8 h-8 ${
                  currentMetrics.eic < 1.5 ? 'text-[#f09e26]' : 'text-emerald-500'
                }`}
              />
            </div>

            <div className="bg-white rounded-2xl p-4 border border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-neutral-400 uppercase">
                  False Diversification Score
                </span>
                <div
                  className={`text-2xl font-bold ${
                    currentMetrics.fds > 0.5 ? 'text-[#f09e26]' : 'text-emerald-600'
                  }`}
                >
                  {(currentMetrics.fds * 100).toFixed(0)}%
                </div>
                <span
                  className={`text-[11px] font-semibold ${
                    currentMetrics.fds > 0.5 ? 'text-[#f09e26]' : 'text-emerald-600'
                  }`}
                >
                  {currentMetrics.verdict}
                </span>
              </div>
              <AlertTriangle
                className={`w-8 h-8 ${
                  currentMetrics.fds > 0.5 ? 'text-[#f09e26]' : 'text-neutral-300'
                }`}
              />
            </div>
          </div>

          {/* Graph Visualizer Area */}
          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-2">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  Multi-Tier Dependency Graph: {currentMat.name}
                </h3>
                <p className="text-xs text-neutral-500">
                  Left-to-right flow: Tier-3 Raw / Ports → Tier-2 Processing / Fabs → Tier-1 Suppliers → Aurora Motors (Chennai)
                </p>
              </div>

              {/* Edge Legend */}
              <div className="flex items-center gap-4 text-[11px] text-neutral-600 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-0.5 bg-teal-600 inline-block"></span> Verified
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-0.5 border-t-2 border-dashed border-amber-500 inline-block"></span> Reported
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-0.5 border-t-2 border-dotted border-violet-600 inline-block"></span> Inferred (?)
                </span>
              </div>
            </div>

            {/* Interactive Graph Diagram */}
            <div className="py-6 px-2 overflow-x-auto">
              <div className="min-w-[620px] grid grid-cols-4 gap-6 items-center">
                {/* Column 1: Tier 3 Infrastructure / Ports */}
                <div className="flex flex-col gap-4">
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-center">
                    Tier 3: Infras / Ports
                  </div>

                  {selectedMaterial === 'mcu' ? (
                    <button
                      onClick={() => setSelectedNode('kaohsiung')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedNode === 'kaohsiung'
                          ? 'border-[#f09e26] bg-amber-50/70 shadow-sm'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Anchor className="w-4 h-4 text-[#f09e26]" />
                        <span className="text-xs font-bold text-neutral-900">
                          Port of Kaohsiung
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        Handles 94% outbound shipping for HWW
                      </div>
                      <div className="mt-1.5 inline-block text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                        Critical Chokepoint
                      </div>
                    </button>
                  ) : (
                    <div className="p-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-600">
                      Upstream Smelters & Mines
                    </div>
                  )}
                </div>

                {/* Column 2: Tier 2 Processing / Fabs */}
                <div className="flex flex-col gap-4">
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-center">
                    Tier 2: Fabs / Refineries
                  </div>

                  {selectedMaterial === 'mcu' ? (
                    <button
                      onClick={() => setSelectedNode('hww')}
                      className={`p-3 rounded-2xl border text-left transition-all relative ${
                        selectedNode === 'hww'
                          ? 'border-[#f09e26] bg-amber-50/70 shadow-sm ring-2 ring-[#f09e26]/30'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      {lens === 'all' && (
                        <span className="absolute -top-2 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <Building className="w-4 h-4 text-[#f09e26]" />
                        <span className="text-xs font-bold text-neutral-900">
                          Hsinchu Wafer Works
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        Sole wafer fab for all 3 suppliers
                      </div>
                      <div className="mt-1.5 text-[10px] font-semibold text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded inline-block">
                        Taiwan · 40nm MCU Line
                      </div>
                    </button>
                  ) : (
                    <div className="p-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-600">
                      Regional Refineries
                    </div>
                  )}
                </div>

                {/* Column 3: Tier 1 Direct Suppliers */}
                <div className="flex flex-col gap-2.5">
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-center">
                    Tier 1: Direct Vendors
                  </div>

                  {currentMat.suppliers.map((supplier, idx) => {
                    const edgeType =
                      idx === 0
                        ? 'verified (Solid)'
                        : idx === 1
                        ? 'reported (Dashed)'
                        : 'inferred (Dotted)';

                    const isVisible =
                      lens === 'all'
                        ? true
                        : lens === 'reported'
                        ? idx <= 1
                        : idx === 0;

                    return (
                      <button
                        key={supplier}
                        onClick={() => setSelectedNode(supplier.toLowerCase().replace(' ', '_'))}
                        className="p-2.5 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 text-left transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-neutral-900">
                            {supplier}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {idx === 0 ? '40%' : idx === 1 ? '35%' : '25%'}
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-500 mt-1 flex items-center justify-between">
                          <span>Link to HWW:</span>
                          <span
                            className={`font-medium ${
                              isVisible
                                ? idx === 0
                                  ? 'text-teal-600'
                                  : idx === 1
                                  ? 'text-amber-600'
                                  : 'text-violet-600'
                                : 'text-neutral-400 line-through'
                            }`}
                          >
                            {isVisible ? edgeType.split(' ')[0] : 'Hidden'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Column 4: Buyer */}
                <div className="flex flex-col gap-4">
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-center">
                    Buyer
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0b0f1a] text-white text-center shadow-md">
                    <div className="text-xs font-bold tracking-tight">Aurora Motors</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Chennai Assembly Plant</div>
                    <div className="mt-3 pt-2 border-t border-neutral-800 text-[11px] font-medium text-orange-300">
                      EV Production Line
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence & Why it Matters Drawer */}
            <div className="mt-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-[#f09e26]" />
                <span className="text-xs font-semibold text-neutral-900">
                  Epistemological Evidence & Provenance: Helix Devices → Hsinchu Wafer Works
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-neutral-600">
                <div className="bg-white p-2.5 rounded-xl border border-neutral-200">
                  <div className="font-semibold text-neutral-900 text-[11px] mb-1">
                    1. Customs Bill-of-Lading
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    68 shipments in 2025 match HWW Kaohsiung container manifest IDs with 99.2% weight correlation.
                  </p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-neutral-200">
                  <div className="font-semibold text-neutral-900 text-[11px] mb-1">
                    2. Geospatial Co-location
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Helix packaging facility located 2.4km from HWW cleanroom facility in Hsinchu Science Park.
                  </p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-neutral-200">
                  <div className="font-semibold text-neutral-900 text-[11px] mb-1">
                    3. Noisy-OR Confidence Score
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Combined multi-signal confidence: 0.72 (Tagged as Inferred with human-verifiable citation).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Disruption Simulator & Remediation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Disruption Sandbox */}
            <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#f09e26]" />
                    Simulate Disruption Shock
                  </h4>
                  {activeScenario && (
                    <button
                      onClick={() => setActiveScenario(null)}
                      className="text-xs text-neutral-400 hover:text-neutral-700 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mb-3">
                  Select an event to run the Leontief bottleneck production model:
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => setActiveScenario('kaohsiung')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      activeScenario === 'kaohsiung'
                        ? 'border-red-500 bg-red-50 font-semibold text-red-900'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div>Kaohsiung Typhoon</div>
                    <div className="text-[10px] text-neutral-500 font-normal">14 Days · Severity 1.0</div>
                  </button>
                  <button
                    onClick={() => setActiveScenario('hww')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      activeScenario === 'hww'
                        ? 'border-red-500 bg-red-50 font-semibold text-red-900'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div>HWW Fab Contamination</div>
                    <div className="text-[10px] text-neutral-500 font-normal">30 Days · Cleanroom Halt</div>
                  </button>
                </div>

                {activeScenario && (
                  <div className="bg-red-50/70 border border-red-200 rounded-xl p-3 text-xs text-red-800 space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      Production Halts on Day 9
                    </div>
                    <p className="text-[11px] text-red-700">
                      Buffer inventory (10 days) depletes. Zero alternative wafer supply available due to triple-vendor shared fab dependence.
                    </p>
                    <div className="font-semibold text-red-900 pt-1 text-[11px]">
                      Simulated Financial Exposure: ₹38.4 Crore (P90)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Decoupling Remediation Recommendation */}
            <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Recommended Autonomous Decoupling
                </h4>
                <p className="text-xs text-neutral-500 mb-3">
                  ROI-ranked remediation action to dismantle the single point of failure:
                </p>

                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900">
                      Action: Onboard Pune Micro Devices
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      ROI 4.2x
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600">
                    Allocate 25% allocation to domestic fab in Maharashtra with direct road freight to Chennai.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-200/70 text-[11px]">
                    <div>
                      <span className="text-neutral-400 block">FDS Reduction:</span>
                      <span className="font-semibold text-neutral-800">0.68 → 0.28 (-58%)</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block">P90 Loss Avoided:</span>
                      <span className="font-semibold text-emerald-600">₹24.8 Crore</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="mt-4 w-full bg-[#0b0f1a] hover:bg-neutral-800 text-white rounded-xl py-2.5 text-xs font-medium transition-all flex items-center justify-center gap-2"
              >
                <span>Return to Executive Overview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierIllusionExplorer;
