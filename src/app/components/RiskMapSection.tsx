import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  AlertTriangle,
  Radio,
  MapPin,
  Anchor,
  Cpu,
  Layers,
  RotateCcw,
  ShieldAlert,
  Info,
  Maximize2
} from 'lucide-react';

interface SupplierRegion {
  id: string;
  name: string;
  subhead: string;
  country: string;
  coordinates: [number, number]; // [longitude, latitude]
  tier: 1 | 2 | 3 | 'buyer';
  facilities: string[];
  materials: string[];
  baselineRisk: number; // 0 to 1
  riskByScenario: {
    nominal: number;
    kaohsiung_typhoon: number;
    hww_contamination: number;
    rare_earth_ban: number;
    compound_shock: number;
  };
  notes: string;
  chokepointType: 'port' | 'fab' | 'refinery' | 'buyer' | 'vendor';
}

const REGIONS: SupplierRegion[] = [
  {
    id: 'hsinchu',
    name: 'Hsinchu Science Park',
    subhead: 'HWW Cleanroom 40nm Fab',
    country: 'Taiwan',
    coordinates: [120.99, 24.78],
    tier: 2,
    facilities: ['Hsinchu Wafer Works Fab 3'],
    materials: ['Power MCU Silicon (100% share)'],
    baselineRisk: 0.15,
    riskByScenario: {
      nominal: 0.15,
      kaohsiung_typhoon: 0.88, // Inflow/outflow chokepoint blocked
      hww_contamination: 0.98, // Direct catastrophic cleanroom shutdown
      rare_earth_ban: 0.18,
      compound_shock: 0.98,
    },
    notes: 'Single point of failure for Nexa, Orion, and Helix wafer supply.',
    chokepointType: 'fab',
  },
  {
    id: 'kaohsiung',
    name: 'Port of Kaohsiung',
    subhead: 'Container Pier 4-6',
    country: 'Taiwan',
    coordinates: [120.30, 22.61],
    tier: 3,
    facilities: ['Kaohsiung Harbor Terminal'],
    materials: ['Maritime freight route (94% volume)'],
    baselineRisk: 0.12,
    riskByScenario: {
      nominal: 0.12,
      kaohsiung_typhoon: 0.96, // Direct typhoon closure
      hww_contamination: 0.45,
      rare_earth_ban: 0.15,
      compound_shock: 0.96,
    },
    notes: 'Sole maritime port route for finished automotive wafer packs to India.',
    chokepointType: 'port',
  },
  {
    id: 'chennai',
    name: 'Chennai Automotive Hub',
    subhead: 'Aurora Motors Assembly Plant',
    country: 'India',
    coordinates: [80.27, 13.08],
    tier: 'buyer',
    facilities: ['Aurora Motors Plant 1'],
    materials: ['EV Assembly Finished Line'],
    baselineRisk: 0.05,
    riskByScenario: {
      nominal: 0.05,
      kaohsiung_typhoon: 0.92, // Secondary stockout risk (Day 9 halt)
      hww_contamination: 0.95, // Assembly stoppage
      rare_earth_ban: 0.82, // Magnet shortage
      compound_shock: 0.99, // Complete stoppage
    },
    notes: 'Target automotive factory with 10 days buffer stock.',
    chokepointType: 'buyer',
  },
  {
    id: 'pune',
    name: 'Maharashtra Industrial Corridor',
    subhead: 'Pune Micro Devices (Alternative)',
    country: 'India',
    coordinates: [73.85, 18.52],
    tier: 1,
    facilities: ['Pune Silicon Line (Decoupling Option)'],
    materials: ['Domestic Alternative MCU (25% share)'],
    baselineRisk: 0.08,
    riskByScenario: {
      nominal: 0.08,
      kaohsiung_typhoon: 0.10, // Domestic route remains healthy!
      hww_contamination: 0.12, // Independent domestic fab
      rare_earth_ban: 0.10,
      compound_shock: 0.12,
    },
    notes: 'Strategic decoupling alternative with direct domestic road transit.',
    chokepointType: 'vendor',
  },
  {
    id: 'sichuan',
    name: 'Sichuan Basin & Yibin',
    subhead: 'Cathode Precursors & Lithium Refining',
    country: 'China',
    coordinates: [104.64, 28.77],
    tier: 2,
    facilities: ['Sichuan Cathode Refining Co.'],
    materials: ['Li-ion Cell Precursors'],
    baselineRisk: 0.20,
    riskByScenario: {
      nominal: 0.20,
      kaohsiung_typhoon: 0.20,
      hww_contamination: 0.20,
      rare_earth_ban: 0.35,
      compound_shock: 0.92, // Hit in compound shock
    },
    notes: 'Supplies VoltaCell and Ampere Dynamics for EV traction batteries.',
    chokepointType: 'refinery',
  },
  {
    id: 'baotou',
    name: 'Inner Mongolia Mining Hub',
    subhead: 'Bayan Obo Rare-Earth Separation',
    country: 'China',
    coordinates: [109.84, 40.65],
    tier: 3,
    facilities: ['Baotou Flotation & Magnetic Oxides Hub'],
    materials: ['Neodymium & Dysprosium Magnets'],
    baselineRisk: 0.25,
    riskByScenario: {
      nominal: 0.25,
      kaohsiung_typhoon: 0.25,
      hww_contamination: 0.25,
      rare_earth_ban: 0.94, // Targeted export restriction
      compound_shock: 0.88,
    },
    notes: 'Bottleneck for Magnetix and Polaris Magnetics motor drive units.',
    chokepointType: 'refinery',
  },
  {
    id: 'nordic',
    name: 'Nordic Smelting District',
    subhead: 'Cuprum Nordic (Control Group)',
    country: 'Sweden',
    coordinates: [18.06, 59.32],
    tier: 1,
    facilities: ['Skellefteå Smelter & Hydro Lines'],
    materials: ['Copper Busbars (Control)'],
    baselineRisk: 0.04,
    riskByScenario: {
      nominal: 0.04,
      kaohsiung_typhoon: 0.04,
      hww_contamination: 0.04,
      rare_earth_ban: 0.04,
      compound_shock: 0.05,
    },
    notes: 'Control group: 100% independent upstream chain, proves TrueTier does not cry wolf.',
    chokepointType: 'vendor',
  },
  {
    id: 'chile',
    name: 'Atacama Mining Corridor',
    subhead: 'Andes Metalworks (Control Group)',
    country: 'Chile',
    coordinates: [-69.85, -23.65],
    tier: 1,
    facilities: ['Antofagasta Open Pit & Port'],
    materials: ['Copper Cathodes (Control)'],
    baselineRisk: 0.05,
    riskByScenario: {
      nominal: 0.05,
      kaohsiung_typhoon: 0.05,
      hww_contamination: 0.05,
      rare_earth_ban: 0.05,
      compound_shock: 0.05,
    },
    notes: 'Independent copper extraction with separate Pacific routing.',
    chokepointType: 'vendor',
  },
];

type ScenarioKey =
  | 'nominal'
  | 'kaohsiung_typhoon'
  | 'hww_contamination'
  | 'rare_earth_ban'
  | 'compound_shock';

const SCENARIOS: { key: ScenarioKey; label: string; desc: string }[] = [
  {
    key: 'nominal',
    label: 'Nominal Baseline',
    desc: 'Uncompromised baseline operations across all regional trade lanes.',
  },
  {
    key: 'kaohsiung_typhoon',
    label: 'Typhoon Kaohsiung (14d)',
    desc: 'Severe tropical cyclone closes Port of Kaohsiung; maritime wafer export halts.',
  },
  {
    key: 'hww_contamination',
    label: 'HWW Fab Contamination (30d)',
    desc: 'Cleanroom chemical fault shuts down 40nm MCU line for all 3 vendors.',
  },
  {
    key: 'rare_earth_ban',
    label: 'Rare-Earth Export Ban (60d)',
    desc: 'Geopolitical export tariffs choke Inner Mongolia neodymium oxide transit.',
  },
  {
    key: 'compound_shock',
    label: 'Compound Dual Shock',
    desc: 'Simultaneous Kaohsiung typhoon and Sichuan lithium refinery flooding.',
  },
];

export const RiskMapSection: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('kaohsiung_typhoon');
  const [selectedRegion, setSelectedRegion] = useState<SupplierRegion>(REGIONS[0]);
  const [hoveredRegion, setHoveredRegion] = useState<SupplierRegion | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Render D3 SVG Map & Heatmap Visualizations
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const width = 940;
    const height = 480;

    // D3 projection centered on Indo-Pacific and Global trade routes
    const projection = d3
      .geoNaturalEarth1()
      .scale(210)
      .translate([width / 2 + 10, height / 2 + 20]);

    const pathGenerator = d3.geoPath().projection(projection);

    // Defs for filters and gradients
    const defs = svg.append('defs');

    // Blur filter for heatmap effect
    const blurFilter = defs
      .append('filter')
      .attr('id', 'heatmap-blur')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    blurFilter
      .append('feGaussianBlur')
      .attr('stdDeviation', 14)
      .attr('result', 'blur');

    // Color interpolation scale: Low Risk (emerald) -> Moderate (amber/gold) -> High Risk (crimson red)
    const riskColorScale = (val: number) => {
      if (val < 0.25) {
        return d3.interpolateRgb('#10b981', '#3b82f6')(val / 0.25);
      } else if (val < 0.6) {
        return d3.interpolateRgb('#f09e26', '#ea580c')((val - 0.25) / 0.35);
      } else {
        return d3.interpolateRgb('#ef4444', '#991b1b')((val - 0.6) / 0.4);
      }
    };

    // Global Simplified Landmass outlines for world map rendering
    // High-fidelity polygon shapes approximating continental masses
    const landmassGeoJson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        // Eurasia
        {
          type: 'Feature',
          properties: { name: 'Eurasia' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-10, 36], [0, 45], [15, 55], [30, 70], [60, 72], [100, 76], [140, 72],
                [170, 65], [140, 50], [130, 35], [122, 25], [115, 20], [105, 10], [98, 8],
                [80, 8], [75, 25], [60, 25], [50, 15], [35, 30], [25, 40], [10, 36], [-10, 36]
              ]
            ]
          }
        },
        // Indian Subcontinent
        {
          type: 'Feature',
          properties: { name: 'India' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [68, 24], [72, 32], [77, 35], [88, 28], [92, 22], [88, 20],
                [80, 12], [77, 8], [74, 15], [68, 24]
              ]
            ]
          }
        },
        // East Asia & Taiwan Coast
        {
          type: 'Feature',
          properties: { name: 'EastAsia' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [100, 22], [108, 18], [115, 22], [121, 25], [122, 32], [125, 38],
                [130, 42], [125, 48], [110, 42], [100, 32], [100, 22]
              ]
            ]
          }
        },
        // Taiwan Island (Accurate Chokepoint Island)
        {
          type: 'Feature',
          properties: { name: 'Taiwan' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [120.0, 22.0], [121.8, 22.0], [122.0, 25.3], [120.8, 25.3], [120.0, 22.0]
              ]
            ]
          }
        },
        // Africa
        {
          type: 'Feature',
          properties: { name: 'Africa' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-17, 30], [10, 37], [32, 31], [43, 12], [51, 12], [42, -5],
                [35, -25], [20, -35], [15, -25], [8, 5], [-15, 12], [-17, 30]
              ]
            ]
          }
        },
        // Australia
        {
          type: 'Feature',
          properties: { name: 'Australia' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [113, -22], [125, -15], [138, -12], [148, -20], [152, -32],
                [140, -38], [125, -35], [115, -32], [113, -22]
              ]
            ]
          }
        },
        // Americas (North & South)
        {
          type: 'Feature',
          properties: { name: 'Americas' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-125, 50], [-90, 52], [-70, 45], [-60, 48], [-75, 30], [-82, 24],
                [-80, 10], [-50, -2], [-38, -10], [-55, -35], [-72, -45], [-75, -20],
                [-78, 2], [-105, 20], [-120, 35], [-125, 50]
              ]
            ]
          }
        }
      ]
    };

    // Draw Map Background
    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#f5f4f0')
      .attr('rx', 20);

    // Draw Graticule Lines (Latitude / Longitude grid)
    const graticule = d3.geoGraticule();
    svg
      .append('path')
      .datum(graticule)
      .attr('d', pathGenerator)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(212, 212, 216, 0.45)')
      .attr('stroke-width', 0.8)
      .attr('stroke-dasharray', '2 6');

    // Draw Base Landmasses
    svg
      .append('g')
      .selectAll('path')
      .data(landmassGeoJson.features)
      .enter()
      .append('path')
      .attr('d', pathGenerator)
      .attr('fill', '#e6e4dc')
      .attr('stroke', '#d4d0c5')
      .attr('stroke-width', 1.2)
      .attr('opacity', 0.95);

    // Draw Shipping Maritime Trade Corridors connecting Kaohsiung to Chennai
    const shippingRouteCoordinates: [number, number][] = [
      [120.30, 22.61], // Port of Kaohsiung
      [115.0, 15.0],  // South China Sea
      [104.0, 2.0],   // Singapore / Malacca Strait
      [95.0, 6.0],    // Andaman Sea
      [80.27, 13.08],  // Chennai Port
    ];

    const projectedRoute = shippingRouteCoordinates.map((coord) => projection(coord)!);
    const lineGenerator = d3.line().curve(d3.curveBasis);

    const isTaiwanDisrupted =
      activeScenario === 'kaohsiung_typhoon' ||
      activeScenario === 'hww_contamination' ||
      activeScenario === 'compound_shock';

    // Draw Maritime Route track
    svg
      .append('path')
      .attr('d', lineGenerator(projectedRoute))
      .attr('fill', 'none')
      .attr('stroke', isTaiwanDisrupted ? '#ef4444' : '#f09e26')
      .attr('stroke-width', isTaiwanDisrupted ? 2.8 : 1.8)
      .attr('stroke-dasharray', isTaiwanDisrupted ? '6 4' : '4 4')
      .attr('opacity', 0.85);

    // ==========================================
    // D3 SVG HEATMAP LAYER (Radial Gradient Heat)
    // ==========================================
    const heatmapGroup = svg.append('g').attr('class', 'heatmap-layer');

    REGIONS.forEach((region) => {
      const pos = projection(region.coordinates);
      if (!pos) return;

      const risk = region.riskByScenario[activeScenario];
      const heatRadius = Math.max(24, risk * 75);
      const gradientId = `heat-grad-${region.id}`;

      // Create radial gradient for each supplier region
      const radGrad = defs
        .append('radialGradient')
        .attr('id', gradientId)
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');

      radGrad
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', riskColorScale(risk))
        .attr('stop-opacity', Math.max(0.25, risk * 0.75));

      radGrad
        .append('stop')
        .attr('offset', '50%')
        .attr('stop-color', riskColorScale(risk))
        .attr('stop-opacity', Math.max(0.1, risk * 0.35));

      radGrad
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', riskColorScale(risk))
        .attr('stop-opacity', 0);

      // Render Heatmap glow circle with filter
      heatmapGroup
        .append('circle')
        .attr('cx', pos[0])
        .attr('cy', pos[1])
        .attr('r', heatRadius)
        .attr('fill', `url(#${gradientId})`)
        .attr('filter', 'url(#heatmap-blur)')
        .attr('pointer-events', 'none');
    });

    // ==========================================
    // D3 REGION PINS & INTERACTION LAYER
    // ==========================================
    const pinsGroup = svg.append('g').attr('class', 'pins-layer');

    REGIONS.forEach((region) => {
      const pos = projection(region.coordinates);
      if (!pos) return;

      const risk = region.riskByScenario[activeScenario];
      const isCritical = risk >= 0.7;
      const isSelected = selectedRegion.id === region.id;

      const nodeGroup = pinsGroup
        .append('g')
        .attr('transform', `translate(${pos[0]}, ${pos[1]})`)
        .attr('class', 'cursor-pointer group')
        .on('click', () => {
          setSelectedRegion(region);
        })
        .on('mouseenter', () => {
          setHoveredRegion(region);
        })
        .on('mouseleave', () => {
          setHoveredRegion(null);
        });

      // Pulsing alert ring for high-risk chokepoint regions
      if (isCritical) {
        nodeGroup
          .append('circle')
          .attr('r', 16)
          .attr('fill', 'none')
          .attr('stroke', '#ef4444')
          .attr('stroke-width', 1.8)
          .attr('opacity', 0.6)
          .append('animate')
          .attr('attributeName', 'r')
          .attr('values', '8;22;8')
          .attr('dur', '2.2s')
          .attr('repeatCount', 'indefinite');
      }

      // Outer ring
      nodeGroup
        .append('circle')
        .attr('r', isSelected ? 8.5 : 6)
        .attr('fill', riskColorScale(risk))
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .attr('filter', 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))');

      // Center core indicator
      nodeGroup
        .append('circle')
        .attr('r', isSelected ? 3.5 : 2.5)
        .attr('fill', '#ffffff');

      // Region label (East Asia & India prominently labeled)
      const labelOffsetX = pos[0] > width * 0.7 ? -10 : 10;
      const textAnchor = pos[0] > width * 0.7 ? 'end' : 'start';

      const label = nodeGroup
        .append('text')
        .attr('x', labelOffsetX)
        .attr('y', 4)
        .attr('text-anchor', textAnchor)
        .attr('font-size', '10px')
        .attr('font-family', 'Inter, sans-serif')
        .attr('font-weight', isSelected || isCritical ? '700' : '500')
        .attr('fill', isCritical ? '#991b1b' : '#1e293b')
        .text(region.name);

      // Subtle label background for legibility
      const bbox = (label.node() as SVGTextContentElement | null)?.getBBox();
      if (bbox) {
        nodeGroup
          .insert('rect', 'text')
          .attr('x', bbox.x - 3)
          .attr('y', bbox.y - 1)
          .attr('width', bbox.width + 6)
          .attr('height', bbox.height + 2)
          .attr('fill', 'rgba(255, 255, 255, 0.88)')
          .attr('rx', 4);
      }
    });

    // ==========================================
    // D3 COLOR GRADIENT LEGEND BAR (Bottom Left)
    // ==========================================
    const legendGroup = svg
      .append('g')
      .attr('transform', `translate(24, ${height - 40})`);

    const legendWidth = 140;
    const legendHeight = 8;

    const legendGradient = defs
      .append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%');

    legendGradient.append('stop').attr('offset', '0%').attr('stop-color', '#10b981');
    legendGradient.append('stop').attr('offset', '45%').attr('stop-color', '#f09e26');
    legendGradient.append('stop').attr('offset', '100%').attr('stop-color', '#ef4444');

    legendGroup
      .append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', 'url(#legend-gradient)')
      .attr('rx', 4);

    legendGroup
      .append('text')
      .attr('x', 0)
      .attr('y', -4)
      .attr('font-size', '9px')
      .attr('font-weight', '600')
      .attr('fill', '#64748b')
      .text('Disruption Heat Level:');

    legendGroup
      .append('text')
      .attr('x', 0)
      .attr('y', 19)
      .attr('font-size', '9px')
      .attr('font-weight', '500')
      .attr('fill', '#10b981')
      .text('Low (0%)');

    legendGroup
      .append('text')
      .attr('x', legendWidth / 2)
      .attr('y', 19)
      .attr('font-size', '9px')
      .attr('text-anchor', 'middle')
      .attr('font-weight', '500')
      .attr('fill', '#f09e26')
      .text('50%');

    legendGroup
      .append('text')
      .attr('x', legendWidth)
      .attr('y', 19)
      .attr('font-size', '9px')
      .attr('text-anchor', 'end')
      .attr('font-weight', '600')
      .attr('fill', '#ef4444')
      .text('High (100%)');

  }, [activeScenario, selectedRegion]);

  const activeRisk = selectedRegion.riskByScenario[activeScenario];

  return (
    <section
      id="risk-map"
      className="max-w-[1180px] w-full mx-auto mt-20 sm:mt-28 px-3 sm:px-4 space-y-6 relative z-10"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-[#b45309]">
            <Radio className="w-3.5 h-3.5 text-[#f09e26] animate-pulse" />
            <span>D3 Geopolitical Heatmap</span>
            <span>·</span>
            <span>Spatial Vulnerability Analysis</span>
          </div>
          <h2
            className="text-2xl sm:text-4xl font-medium text-neutral-900 tracking-tight"
            style={{ lineHeight: 1.15 }}
          >
            Regional{' '}
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              Risk Heatmap
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl font-normal leading-relaxed">
            Real-time heat distribution across global supplier clusters. Watch upstream semiconductor cleanrooms and maritime hubs illuminate in crimson red during disruption shocks.
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-neutral-200/80 shadow-sm text-xs self-start md:self-auto">
          <span className="text-neutral-500 font-medium">Active Chokepoint:</span>
          <span className="font-bold text-neutral-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            Taiwan Straits Corridor
          </span>
        </div>
      </div>

      {/* Scenario Selector Pills */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-2 border border-neutral-200/80 shadow-sm flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {SCENARIOS.map((sc) => (
          <button
            key={sc.key}
            type="button"
            onClick={() => setActiveScenario(sc.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeScenario === sc.key
                ? 'bg-[#0b0f1a] text-white shadow-sm font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <span>{sc.label}</span>
            {activeScenario === sc.key && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#f09e26]" />
            )}
          </button>
        ))}
      </div>

      {/* Active Scenario Context Banner */}
      <div className="px-4 py-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#f09e26] shrink-0" />
          <span className="font-medium text-amber-950">
            {SCENARIOS.find((s) => s.key === activeScenario)?.desc}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setActiveScenario('nominal')}
          className="text-[11px] font-semibold text-[#b45309] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Baseline</span>
        </button>
      </div>

      {/* Main Map & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* D3-SVG Map Container */}
        <div className="lg:col-span-8 bg-white/95 backdrop-blur-md rounded-3xl p-3 sm:p-5 border border-neutral-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between px-2 pb-3 border-b border-neutral-100 text-xs">
            <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#f09e26]" />
              <span>D3 Interactive Projection Map</span>
            </span>
            <span className="text-[11px] text-neutral-500 font-mono">
              Projection: Natural Earth I · Tap pins to inspect
            </span>
          </div>

          {/* SVG Canvas */}
          <div className="w-full overflow-x-auto py-2">
            <svg
              ref={svgRef}
              viewBox="0 0 940 480"
              className="w-full h-auto min-w-[680px] max-h-[480px] rounded-2xl select-none"
            />
          </div>

          <div className="px-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
            <span>D3 Real-time SVG Gradient Heatmap Layer</span>
            <span className="text-neutral-400">Heat radius scaled by scenario shock amplitude</span>
          </div>
        </div>

        {/* Selected Region Telemetry Inspector Card */}
        <div className="lg:col-span-4 bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Region Intelligence Inspector
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                activeRisk >= 0.7
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : activeRisk >= 0.3
                  ? 'bg-amber-50 text-[#b45309] border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              Risk: {(activeRisk * 100).toFixed(0)}%
            </span>
          </div>

          {/* Region Identity */}
          <div className="space-y-1">
            <div className="text-xs text-neutral-400 font-medium">
              {selectedRegion.country} · Tier {selectedRegion.tier}
            </div>
            <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
              {selectedRegion.name}
            </h3>
            <p className="text-xs text-[#b45309] font-medium">
              {selectedRegion.subhead}
            </p>
          </div>

          {/* Metric Meters */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200/80">
              <span className="text-neutral-400 block text-[11px]">Disruption Index:</span>
              <div
                className={`text-xl font-bold font-mono mt-0.5 ${
                  activeRisk >= 0.7
                    ? 'text-red-600'
                    : activeRisk >= 0.3
                    ? 'text-[#b45309]'
                    : 'text-emerald-600'
                }`}
              >
                {(activeRisk * 100).toFixed(0)} / 100
              </div>
              <span className="text-[10px] text-neutral-500">
                {activeRisk >= 0.7 ? 'Severe Hazard' : activeRisk >= 0.3 ? 'Elevated Heat' : 'Operational'}
              </span>
            </div>

            <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200/80">
              <span className="text-neutral-400 block text-[11px]">Chokepoint Type:</span>
              <div className="text-sm font-bold text-neutral-800 capitalize mt-1 flex items-center gap-1.5">
                {selectedRegion.chokepointType === 'fab' && <Cpu className="w-3.5 h-3.5 text-[#f09e26]" />}
                {selectedRegion.chokepointType === 'port' && <Anchor className="w-3.5 h-3.5 text-[#f09e26]" />}
                {selectedRegion.chokepointType === 'buyer' && <MapPin className="w-3.5 h-3.5 text-neutral-900" />}
                {selectedRegion.chokepointType === 'refinery' && <Layers className="w-3.5 h-3.5 text-amber-700" />}
                {selectedRegion.chokepointType === 'vendor' && <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{selectedRegion.chokepointType}</span>
              </div>
              <span className="text-[10px] text-neutral-500">Single Source Hub</span>
            </div>
          </div>

          {/* Materials Dependent */}
          <div className="space-y-1.5 pt-1 text-xs">
            <span className="text-neutral-400 font-medium text-[11px] block">
              Materials Flowing Through Hub:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedRegion.materials.map((mat, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 text-[11px] font-medium"
                >
                  {mat}
                </span>
              ))}
            </div>
          </div>

          {/* Operational Notes */}
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs text-neutral-600 space-y-1 leading-relaxed">
            <div className="font-semibold text-neutral-800 text-[11px]">Audit Assessment:</div>
            <p className="text-[11px] text-neutral-600">{selectedRegion.notes}</p>
          </div>

          {/* Direct Region Selector Pills */}
          <div className="pt-2 border-t border-neutral-100 space-y-1.5">
            <span className="text-[11px] font-medium text-neutral-400 block">
              Quick Inspect Other Regions:
            </span>
            <div className="flex flex-wrap gap-1">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRegion(r)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                    selectedRegion.id === r.id
                      ? 'bg-[#0b0f1a] text-white font-semibold'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {r.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RiskMapSection;
