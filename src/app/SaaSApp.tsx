import React, { useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Bell,
  Check, ChevronDown, CircleHelp, Clock3, Download, FileUp, Filter, Globe2,
  Layers3, LockKeyhole, MapPin, MoreHorizontal, Plus, Search, Settings2,
  ShieldCheck, SlidersHorizontal, Sparkles, Truck, Waves, X, Zap,
} from 'lucide-react';
import SupplierIllusionExplorer from './components/SupplierIllusionExplorer';

type Page = 'overview' | 'network' | 'scenarios' | 'actions' | 'evidence';
type Supplier = { name: string; tier: string; category: string; region: string; status: string; risk: number; confidence: 'Verified' | 'Reported' | 'Inferred'; };

const initialSuppliers: Supplier[] = [
  { name: 'Nexa Semiconductor', tier: 'Tier 1', category: 'Power MCU', region: 'Taiwan', status: 'High exposure', risk: 92, confidence: 'Verified' },
  { name: 'Orion Microelectronics', tier: 'Tier 1', category: 'Power MCU', region: 'Taiwan', status: 'High exposure', risk: 88, confidence: 'Reported' },
  { name: 'Helix Devices', tier: 'Tier 1', category: 'Power MCU', region: 'Taiwan', status: 'High exposure', risk: 81, confidence: 'Reported' },
  { name: 'Hsinchu Wafer Works', tier: 'Tier 2', category: '40nm silicon', region: 'Hsinchu, Taiwan', status: 'Shared chokepoint', risk: 96, confidence: 'Verified' },
  { name: 'Pune Micro Devices', tier: 'Tier 1', category: 'Power MCU', region: 'Maharashtra, India', status: 'Alternative source', risk: 31, confidence: 'Inferred' },
];
const navItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'network', label: 'Supply network', icon: Layers3 },
  { id: 'scenarios', label: 'Scenarios', icon: Waves },
  { id: 'actions', label: 'Action plan', icon: Zap },
  { id: 'evidence', label: 'Evidence', icon: ShieldCheck },
];
const confidenceTone: Record<Supplier['confidence'], string> = {
  Verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Reported: 'bg-amber-50 text-amber-700 border-amber-200',
  Inferred: 'bg-violet-50 text-violet-700 border-violet-200',
};
const titleFor: Record<Page, string> = {
  overview: 'Good morning, Rayyan', network: 'Your supply network', scenarios: 'Stress-test the plan',
  actions: 'Turn risk into action', evidence: 'Evidence you can stand behind',
};

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'green' | 'amber' | 'red' | 'violet' }) {
  const styles = { neutral: 'bg-slate-100 text-slate-600', green: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700', red: 'bg-rose-50 text-rose-700', violet: 'bg-violet-50 text-violet-700' };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles[tone]}`}>{children}</span>;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,.025)] ${className}`}>{children}</section>;
}

export default function SaaSApp() {
  const [page, setPage] = useState<Page>('overview');
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const [disruption, setDisruption] = useState('Kaohsiung port closure');
  const [days, setDays] = useState(14);
  const [buffer, setBuffer] = useState(12);
  const [supplierRows, setSupplierRows] = useState(initialSuppliers);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const annualPrice = billing === 'annual';
  const stockoutDay = Math.max(1, buffer - Math.floor(days * .22));
  const lossAvoided = Math.round((buffer * 1.8 + days * 1.25) * 10) / 10;
  const filtered = useMemo(() => supplierRows.filter(row => [row.name, row.region, row.category].join(' ').toLowerCase().includes(query.toLowerCase())), [supplierRows, query]);

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2600); };
  const importCsv = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    const parsed = text.split(/\r?\n/).slice(1).map(line => line.split(',')).filter(parts => parts[0]?.trim()).map((parts, i): Supplier => ({
      name: parts[0].trim(), tier: parts[1]?.trim() || 'Tier 1', category: parts[2]?.trim() || 'Unclassified',
      region: parts[3]?.trim() || 'Unknown', status: 'Needs review', risk: 45 + (i % 5) * 7,
      confidence: 'Inferred',
    }));
    if (parsed.length) { setSupplierRows(current => [...parsed, ...current]); notify(`Imported ${parsed.length} suppliers into this demo workspace`); }
    else notify('No supplier rows found. Use columns: name,tier,category,region');
  };
  const exportSummary = () => {
    const csv = ['Supplier,Tier,Category,Region,Risk,Confidence', ...supplierRows.map(s => [s.name,s.tier,s.category,s.region,s.risk,s.confidence].join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'truetier-risk-register.csv'; a.click(); URL.revokeObjectURL(url);
    notify('Risk register exported');
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-900 antialiased selection:bg-amber-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-[248px] shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5 lg:flex">
          <button className="mb-8 flex items-center gap-2.5 px-2 text-left" onClick={() => setPage('overview')}>
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#17212b] text-amber-300"><Layers3 size={17}/></span>
            <span className="text-[17px] font-extrabold tracking-tight">true<span className="text-amber-600">tier</span><small className="ml-2 align-middle text-[9px] font-semibold uppercase tracking-[.15em] text-slate-400">workspace</small></span>
          </button>
          <button className="mb-7 flex items-center gap-3 rounded-xl border border-slate-200 p-2.5 text-left hover:bg-slate-50">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-100 text-xs font-bold text-amber-800">A</span>
            <span className="min-w-0 flex-1"><strong className="block truncate text-xs">Aurora Motors</strong><small className="text-[10px] text-slate-500">Growth workspace</small></span><ChevronDown size={15} className="text-slate-400"/>
          </button>
          <div className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[.16em] text-slate-400">Workspace</div>
          <nav className="space-y-1">{navItems.map(item => { const Icon = item.icon; return <button key={item.id} onClick={() => setPage(item.id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs transition ${page === item.id ? 'bg-[#17212b] font-semibold text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}><Icon size={16}/>{item.label}{item.id === 'actions' && <span className="ml-auto rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">3</span>}</button>})}</nav>
          <div className="mb-2 mt-8 px-2 text-[9px] font-bold uppercase tracking-[.16em] text-slate-400">Manage</div>
          <button onClick={() => notify('Workspace member management is part of the team plan')} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-slate-600 hover:bg-slate-100"><Settings2 size={16}/>Workspace settings</button>
          <div className="mt-auto rounded-xl border border-amber-200/70 bg-gradient-to-br from-[#fffaf0] to-[#fff5e3] p-3.5">
            <Sparkles size={17} className="mb-2 text-amber-600"/><strong className="block text-xs">Resilience, shared.</strong>
            <p className="mt-1.5 text-[10px] leading-relaxed text-slate-600">Bring your team into the same picture and move from alerts to action.</p>
            <button onClick={() => setPlansOpen(true)} className="mt-3 flex w-full items-center justify-between rounded-lg bg-[#17212b] px-3 py-2 text-[10px] font-semibold text-white hover:bg-slate-700">Explore team plans <ArrowUpRight size={13}/></button>
          </div>
          <div className="mt-4 flex items-center gap-2.5 border-t border-slate-100 px-1 pt-4">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e8e9f7] text-[10px] font-bold text-[#595f92]">MR</span>
            <span><strong className="block text-[11px]">Mohamed Rayyan</strong><small className="text-[9px] text-slate-500">Owner</small></span><MoreHorizontal size={16} className="ml-auto text-slate-400"/>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-[62px] items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-7">
            <div className="flex items-center gap-3"><div className="flex items-center gap-2 lg:hidden"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#17212b] text-amber-300"><Layers3 size={15}/></span><strong className="text-sm">true<span className="text-amber-600">tier</span></strong></div><span className="hidden text-[11px] text-slate-400 lg:block">Aurora Motors</span><span className="hidden text-slate-300 lg:block">/</span><span className="hidden text-[11px] font-semibold text-slate-700 lg:block">{navItems.find(n => n.id === page)?.label}</span></div>
            <div className="flex items-center gap-2 sm:gap-4"><span className="hidden items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-semibold text-amber-800 sm:inline-flex"><span className="h-1.5 w-1.5 rounded-full bg-amber-500"/>Illustrative workspace</span><button onClick={() => notify('You’re all caught up')} className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications"><Bell size={17}/><i className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500"/></button><button onClick={() => setPlansOpen(true)} className="rounded-lg bg-amber-500 px-3 py-2 text-[10px] font-bold text-white shadow-sm hover:bg-amber-600 sm:px-4">Talk to sales <ArrowUpRight size={12} className="ml-1 inline"/></button></div>
          </header>
          <div className="mx-auto max-w-[1360px] px-4 py-6 sm:px-7 sm:py-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div><div className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.15em] text-amber-700"><span className="h-px w-5 bg-amber-500"/>Supply intelligence · Thursday, October 30</div><h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">{titleFor[page]}</h1><p className="mt-1.5 text-xs text-slate-500">See the shared dependencies hiding behind your supplier list.</p></div>
              <div className="flex gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-semibold text-slate-700 hover:border-slate-300"><FileUp size={14}/> Import supplier CSV<input type="file" accept=".csv,text/csv" className="hidden" onChange={e => importCsv(e.target.files?.[0])}/></label><button onClick={() => setExplorerOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#17212b] px-3.5 py-2.5 text-[10px] font-semibold text-white shadow-sm hover:bg-slate-700"><Layers3 size={14}/> Open dependency graph</button></div>
            </div>

            <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200/80 bg-[#fffaf0] px-4 py-3 text-[10px] leading-relaxed text-amber-950"><AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600"/><div><strong>Illustrative dataset.</strong> Aurora Motors and supplier data below are synthetic demo records. Import a CSV to explore your own risk register locally; this preview does not upload or persist files.</div></div>

            {page === 'overview' && <Overview onNavigate={setPage} onExplorer={() => setExplorerOpen(true)} stockoutDay={stockoutDay} lossAvoided={lossAvoided} suppliers={supplierRows}/>}
            {page === 'network' && <Network suppliers={filtered} query={query} setQuery={setQuery} onExplorer={() => setExplorerOpen(true)}/>}
            {page === 'scenarios' && <Scenarios disruption={disruption} setDisruption={setDisruption} days={days} setDays={setDays} buffer={buffer} setBuffer={setBuffer} stockoutDay={stockoutDay} lossAvoided={lossAvoided} onUpgrade={() => setPlansOpen(true)}/>}
            {page === 'actions' && <Actions onUpgrade={() => setPlansOpen(true)} onNotify={notify}/>}
            {page === 'evidence' && <Evidence suppliers={supplierRows} onExport={exportSummary}/>}

            <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-[9px] text-slate-400"><span>© 2026 TrueTier · Synthetic demo workspace</span><div className="flex gap-4"><button onClick={() => notify('Security documentation is being prepared')}>Security</button><button onClick={() => notify('Contact: hello@truetier.app')}>Contact</button><button onClick={() => setPlansOpen(true)}>Plans</button></div><span className="inline-flex items-center gap-1"><LockKeyhole size={11}/> Designed for sensitive supplier data</span></footer>
          </div>
        </main>
      </div>

      {explorerOpen && <SupplierIllusionExplorer isOpen={explorerOpen} onClose={() => setExplorerOpen(false)}/>}
      {plansOpen && <PlansModal annual={annualPrice} setBilling={setBilling} onClose={() => setPlansOpen(false)}/>}
      {toast && <div role="status" className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl">{toast}</div>}
    </div>
  );
}

function Overview({ onNavigate, onExplorer, stockoutDay, lossAvoided, suppliers }: { onNavigate: (page: Page) => void; onExplorer: () => void; stockoutDay: number; lossAvoided: number; suppliers: Supplier[] }) {
  const flagged = suppliers.filter(s => s.risk > 75).length;
  return <>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Effective independence" value="1.1" suffix=" / 3 suppliers" icon={<Layers3 size={16}/>} color="text-rose-600" note="Shared upstream fab detected"/>
      <Metric label="False diversification" value="68%" icon={<ShieldCheck size={16}/>} color="text-amber-700" note="High concentration risk"/>
      <Metric label="Production at risk" value="1,400" suffix=" units / day" icon={<Truck size={16}/>} color="text-slate-800" note="Aurora Motors · Chennai plant"/>
      <Metric label="Open risk signals" value={String(flagged + 2)} icon={<Activity size={16}/>} color="text-violet-700" note="2 require a decision this week"/>
    </div>
    <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
      <Card className="overflow-hidden"><div className="flex items-start justify-between p-5"><div><div className="text-[9px] font-bold uppercase tracking-[.15em] text-slate-400">Concentration exposure</div><h2 className="mt-1 text-sm font-semibold">Three direct suppliers. One hidden dependency.</h2></div><button onClick={onExplorer} className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700">Inspect graph <ArrowRight size={13}/></button></div>
        <div className="px-4 pb-3 sm:px-6"><MiniGraph/></div><div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 px-5 py-3 text-[9px] text-slate-500"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-emerald-500"/>Verified</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-amber-500"/>Reported</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-violet-500"/>Inferred</span><span className="ml-auto">5 nodes · 6 relationships</span></div>
      </Card>
      <Card className="p-5"><div className="flex items-start justify-between"><div><div className="text-[9px] font-bold uppercase tracking-[.15em] text-slate-400">What needs attention</div><h2 className="mt-1 text-sm font-semibold">Signals to review</h2></div><button onClick={() => onNavigate('evidence')} className="text-[10px] font-semibold text-amber-700">All signals →</button></div>
        <div className="mt-4 space-y-3"><Signal icon={<AlertTriangle size={15}/>} tone="rose" title="Shared fab concentration" detail="HWW supplies all 3 Power MCU vendors" badge="CRITICAL"/><Signal icon={<MapPin size={15}/>} tone="amber" title="Port route overlap" detail="94% of volume routes through Kaohsiung" badge="HIGH"/><Signal icon={<Clock3 size={15}/>} tone="violet" title="Buffer runs out on day {stockoutDay}" detail="Estimated under a 14-day port disruption" badge="SCENARIO"/></div>
      </Card>
    </div>
    <div className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_1fr]">
      <Card className="p-5"><div className="flex items-center justify-between"><div><div className="text-[9px] font-bold uppercase tracking-[.15em] text-slate-400">Exposure by material</div><h2 className="mt-1 text-sm font-semibold">Where independence breaks down</h2></div><button onClick={() => onNavigate('network')} className="text-[10px] font-semibold text-amber-700">View network →</button></div><div className="mt-5 space-y-4"><RiskBar label="Power MCU" score={68} text="Illusion revealed"/><RiskBar label="Lithium-ion cells" score={42} text="Partial concentration"/><RiskBar label="Rare-earth magnets" score={31} text="Partial concentration"/><RiskBar label="Copper busbars" score={8} text="Diversified control"/></div></Card>
      <Card className="relative overflow-hidden bg-[#17212b] p-5 text-white"><div className="absolute -right-10 -top-14 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl"/><div className="relative"><Badge tone="amber"><Sparkles size={11}/> RECOMMENDED MOVE</Badge><h2 className="mt-3 text-lg font-semibold">Add a qualified second source.</h2><p className="mt-2 max-w-md text-[10px] leading-relaxed text-slate-300">Shifting 25% of Power MCU allocation to an independent fab route could cut concentration and protect production during a Taiwan shock.</p><div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4"><div><span className="text-[9px] text-slate-400">Modeled exposure avoided</span><strong className="mt-1 block text-lg text-amber-300">₹{lossAvoided} Cr</strong></div><div><span className="text-[9px] text-slate-400">Potential stockout</span><strong className="mt-1 block text-lg">Day {stockoutDay}</strong></div></div><button onClick={() => onNavigate('actions')} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2.5 text-[10px] font-bold text-slate-900 hover:bg-amber-100">Review action plan <ArrowRight size={13}/></button></div></Card>
    </div>
    <div className="mt-4"><SupplierTable suppliers={suppliers.slice(0,4)} onView={() => onNavigate('network')}/></div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><div className="flex items-center gap-2 text-[10px] text-slate-500"><span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Check size={14}/></span><span><strong className="text-slate-800">Ready to make this operational?</strong> Invite your team, connect data, and keep the risk picture current.</span></div><button onClick={() => onNavigate('actions')} className="text-[10px] font-bold text-amber-700">See team plans <ArrowRight size={12} className="ml-1 inline"/></button></div>
  </>;
}
function Metric({ label, value, suffix, icon, color, note }: { label: string; value: string; suffix?: string; icon: React.ReactNode; color: string; note: string }) {
  return <Card className="p-4"><div className="flex items-center justify-between text-[10px] text-slate-500"><span>{label}</span><span className={color}>{icon}</span></div><div className="mt-2 flex items-baseline gap-1"><strong className={`text-[26px] font-semibold tracking-tight ${color}`}>{value}</strong>{suffix && <span className="text-[9px] text-slate-400">{suffix}</span>}</div><p className="mt-1 text-[9px] text-slate-400">{note}</p></Card>;
}
function MiniGraph() {
  return <div className="relative overflow-hidden rounded-xl border border-slate-100 bg-[#fafbfc] px-3 py-4 sm:px-5"><div className="absolute left-[14%] top-1/2 h-px w-[67%] bg-slate-200"/><div className="relative grid grid-cols-5 items-center gap-2 sm:gap-4">
    <div className="space-y-3">{['Nexa Semi','Orion Micro','Helix Devices'].map((n,i)=><div key={n} className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 shadow-sm"><span className={`h-2 w-2 shrink-0 rounded-full ${i===0?'bg-emerald-500':i===1?'bg-amber-500':'bg-violet-500'}`}/><span className="truncate text-[8px] font-semibold sm:text-[9px]">{n}</span></div>)}</div>
    <div className="flex justify-center"><ArrowRight size={17} className="text-slate-300"/></div>
    <div className="flex justify-center"><div className="rounded-xl border border-rose-200 bg-rose-50 px-2 py-3 text-center shadow-sm sm:px-4"><MapPin size={17} className="mx-auto text-rose-600"/><strong className="mt-1 block text-[8px] text-rose-900 sm:text-[9px]">HWW Fab</strong><span className="text-[7px] text-rose-700">92% shared</span></div></div>
    <div className="flex justify-center"><ArrowRight size={17} className="text-slate-300"/></div>
    <div className="flex justify-end"><div className="rounded-xl border border-slate-200 bg-white px-2 py-3 text-center shadow-sm sm:px-4"><Truck size={17} className="mx-auto text-slate-600"/><strong className="mt-1 block text-[8px] sm:text-[9px]">Aurora Motors</strong><span className="text-[7px] text-slate-400">Chennai plant</span></div></div>
  </div><div className="mt-3 flex justify-center"><span className="rounded-full bg-rose-100 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wide text-rose-700">Single point of failure</span></div></div>;
}
function Signal({ icon, tone, title, detail, badge }: { icon: React.ReactNode; tone: string; title: string; detail: string; badge: string }) {
  const colors: Record<string,string> = { rose:'bg-rose-50 text-rose-600', amber:'bg-amber-50 text-amber-700', violet:'bg-violet-50 text-violet-600' };
  return <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 last:border-0 last:pb-0"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${colors[tone]}`}>{icon}</span><div className="min-w-0 flex-1"><strong className="block truncate text-[10px]">{title}</strong><span className="mt-0.5 block truncate text-[9px] text-slate-400">{detail}</span></div><Badge tone={tone==='rose'?'red':tone==='amber'?'amber':'violet'}>{badge}</Badge></div>;
}
function RiskBar({ label, score, text }: { label: string; score: number; text: string }) {
  return <div className="grid grid-cols-[115px_1fr_35px] items-center gap-3"><span className="text-[10px] font-medium text-slate-700">{label}</span><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${score>55?'bg-rose-400':score>25?'bg-amber-400':'bg-emerald-400'}`} style={{width:`${score}%`}}/></div><span className="text-right font-mono text-[9px] text-slate-500">{score}%</span><span className="col-start-2 -mt-2 text-[8px] text-slate-400">{text}</span></div>;
}
function SupplierTable({ suppliers, onView }: { suppliers: Supplier[]; onView: () => void }) {
  return <Card className="overflow-hidden"><div className="flex items-center justify-between px-4 py-4"><div><div className="text-[9px] font-bold uppercase tracking-[.15em] text-slate-400">DIRECT + SHARED SOURCES</div><h2 className="mt-1 text-sm font-semibold">Suppliers to keep in view</h2></div><button onClick={onView} className="text-[10px] font-semibold text-amber-700">Open register →</button></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left"><thead className="bg-slate-50 text-[8px] uppercase tracking-wider text-slate-400"><tr>{['Supplier','Tier / input','Region','Confidence','Risk'].map(h=><th key={h} className="px-4 py-2.5 font-semibold">{h}</th>)}</tr></thead><tbody>{suppliers.map(s=><tr key={s.name} className="border-t border-slate-100 text-[9px]"><td className="px-4 py-3 font-semibold text-slate-800">{s.name}</td><td className="px-4 py-3 text-slate-500">{s.tier} · {s.category}</td><td className="px-4 py-3 text-slate-500">{s.region}</td><td className="px-4 py-3"><span className={`rounded-full border px-2 py-1 text-[8px] font-semibold ${confidenceTone[s.confidence]}`}>{s.confidence}</span></td><td className="px-4 py-3"><span className={s.risk>75?'font-bold text-rose-600':'font-semibold text-amber-700'}>{s.risk}%</span></td></tr>)}</tbody></table></div></Card>;
}
function Network({ suppliers, query, setQuery, onExplorer }: { suppliers: Supplier[]; query: string; setQuery: (q:string)=>void; onExplorer:()=>void }) {
  return <><Card className="mb-4 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-semibold">Multi-tier supplier register</h2><p className="mt-1 text-[10px] text-slate-500">Search your sources, review confidence, and inspect the dependency graph.</p></div><div className="flex gap-2"><label className="relative"><Search size={14} className="absolute left-3 top-2.5 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search supplier, input, region" className="h-9 w-56 rounded-lg border border-slate-200 pl-9 pr-3 text-[10px] outline-none focus:border-amber-400"/></label><button onClick={onExplorer} className="rounded-lg bg-[#17212b] px-3 text-[10px] font-semibold text-white">Open graph</button></div></div></Card><SupplierTable suppliers={suppliers} onView={onExplorer}/><Card className="mt-4 grid gap-4 p-5 sm:grid-cols-3"><div><Badge tone="green">Verified</Badge><p className="mt-2 text-[10px] leading-relaxed text-slate-500">Contract or direct system evidence. Highest confidence, traceable to a source record.</p></div><div><Badge tone="amber">Reported</Badge><p className="mt-2 text-[10px] leading-relaxed text-slate-500">Supplier disclosures and public filings. Useful, but not independently audited.</p></div><div><Badge tone="violet">Inferred</Badge><p className="mt-2 text-[10px] leading-relaxed text-slate-500">Pattern-based relationship that needs analyst review before operational use.</p></div></Card></>;
}
function Scenarios({ disruption,setDisruption,days,setDays,buffer,setBuffer,stockoutDay,lossAvoided,onUpgrade }: { disruption:string;setDisruption:(v:string)=>void;days:number;setDays:(v:number)=>void;buffer:number;setBuffer:(v:number)=>void;stockoutDay:number;lossAvoided:number;onUpgrade:()=>void }) {
  return <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]"><Card className="p-5 sm:p-6"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-700"><SlidersHorizontal size={16}/></span><div><h2 className="text-sm font-semibold">Scenario controls</h2><p className="text-[9px] text-slate-500">Change assumptions and see the modeled effect.</p></div></div><label className="mt-6 block text-[9px] font-bold uppercase tracking-wider text-slate-500">Disruption type<select value={disruption} onChange={e=>setDisruption(e.target.value)} className="mt-2 block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none focus:border-amber-400"><option>Kaohsiung port closure</option><option>HWW fab contamination</option><option>Export restriction</option><option>Compound Taiwan shock</option></select></label><Range label="Disruption duration" value={days} min={3} max={45} suffix="days" onChange={setDays}/><Range label="Current safety stock" value={buffer} min={3} max={30} suffix="days" onChange={setBuffer}/><div className="mt-6 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-[9px] leading-relaxed text-slate-500"><CircleHelp size={14} className="mt-0.5 shrink-0 text-slate-400"/>Model outputs are directional estimates using the illustrative case data. Validate assumptions with your operations team before decisions.</div><button onClick={onUpgrade} className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-[9px] font-semibold text-slate-600 hover:bg-slate-50">Save scenario to team library <LockKeyhole size={11} className="ml-1 inline"/></button></Card><Card className="overflow-hidden"><div className="bg-[#17212b] p-5 text-white"><Badge tone="amber"><Activity size={10}/> MODEL PREVIEW</Badge><h2 className="mt-3 text-base font-semibold">{disruption}</h2><p className="mt-1 text-[9px] text-slate-300">Aurora Motors · Power MCU · {days}-day disruption</p></div><div className="grid grid-cols-2 gap-px bg-slate-100"><Outcome label="Projected stockout" value={`Day ${stockoutDay}`} tone="text-rose-600"/><Outcome label="Daily output exposed" value="1,400 units"/><Outcome label="Production at risk" value={`₹${lossAvoided} Cr`} tone="text-amber-700"/><Outcome label="Confidence range" value="P50 / P90"/></div><div className="p-5"><h3 className="text-[10px] font-semibold">Production continuity</h3><div className="mt-3 flex h-20 items-end gap-1">{Array.from({length:14},(_,i)=><div key={i} className={`flex-1 rounded-t ${i<stockoutDay?'bg-emerald-300':'bg-rose-300'}`} style={{height:`${Math.max(12,92-i*5)}%`}}/> )}</div><div className="mt-2 flex justify-between text-[8px] text-slate-400"><span>Day 1</span><span>Buffer exhausted</span><span>Day 14</span></div><button onClick={onUpgrade} className="mt-5 w-full rounded-lg bg-amber-500 py-2.5 text-[10px] font-bold text-white hover:bg-amber-600">Unlock Monte Carlo &amp; saved scenarios <ArrowRight size={13} className="ml-1 inline"/></button></div></Card></div>;
}
function Range({label,value,min,max,suffix,onChange}:{label:string;value:number;min:number;max:number;suffix:string;onChange:(v:number)=>void}) { return <label className="mt-6 block"><span className="flex justify-between text-[10px] font-semibold text-slate-700">{label}<span className="font-mono text-amber-700">{value} {suffix}</span></span><input type="range" min={min} max={max} value={value} onChange={e=>onChange(Number(e.target.value))} className="mt-3 h-1.5 w-full cursor-pointer accent-amber-500"/><span className="mt-1 flex justify-between text-[8px] text-slate-400"><span>{min} {suffix}</span><span>{max} {suffix}</span></span></label> }
function Outcome({label,value,tone='text-slate-900'}:{label:string;value:string;tone?:string}) {return <div className="bg-white p-4"><span className="block text-[9px] text-slate-500">{label}</span><strong className={`mt-1.5 block text-sm font-semibold ${tone}`}>{value}</strong></div>}
function Actions({onUpgrade,onNotify}:{onUpgrade:()=>void;onNotify:(s:string)=>void}) {
  const items=[['01','Qualify a second fab route','Shift 25% of Power MCU volume to an independent supplier.','High impact · 90–180 days','Cut FDS from 68% to ~28%'],['02','Increase strategic MCU buffer','Raise safety stock from 12 to 21 days while the alternate source qualifies.','Medium impact · 2–4 weeks','Move stockout beyond modeled port closure'],['03','Verify tier-2 sourcing with vendors','Request facility-level origin attestations for Nexa, Orion, and Helix.','Fast win · 1–2 weeks','Replace reported links with verified evidence']];
  return <><div className="mb-4 grid gap-3 sm:grid-cols-3"><Metric label="Prioritized actions" value="3" icon={<Zap size={16}/>} color="text-amber-700" note="Ranked by risk reduction"/><Metric label="Modeled annual value" value="₹24.8" suffix=" Cr" icon={<ArrowDownRight size={16}/>} color="text-emerald-700" note="Scenario estimate, not guarantee"/><Metric label="Decision window" value="30" suffix=" days" icon={<Clock3 size={16}/>} color="text-slate-800" note="Before next sourcing review"/></div><Card className="p-5"><div className="mb-4"><h2 className="text-sm font-semibold">Recommended action plan</h2><p className="mt-1 text-[9px] text-slate-500">A practical sequence to reduce shared failure paths.</p></div><div className="space-y-3">{items.map(([num,title,desc,meta,impact])=><div key={num} className="flex flex-wrap items-start gap-3 rounded-xl border border-slate-200 p-4"><span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-50 font-mono text-[10px] font-bold text-amber-700">{num}</span><div className="min-w-[180px] flex-1"><strong className="block text-[11px]">{title}</strong><p className="mt-1 text-[9px] leading-relaxed text-slate-500">{desc}</p><span className="mt-2 inline-block text-[8px] text-slate-400">{meta}</span></div><div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:flex-col sm:items-end"><Badge tone="green">{impact}</Badge><button onClick={()=>onNotify('Action saved to this demo workspace')} className="text-[9px] font-semibold text-amber-700">Add to plan →</button></div></div>)}</div><div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#17212b] p-4 text-white"><div><strong className="text-[11px]">Coordinate the response with your team.</strong><p className="mt-1 text-[9px] text-slate-300">Shared action owners, evidence requests, and decision history are on Team.</p></div><button onClick={onUpgrade} className="rounded-lg bg-amber-500 px-3 py-2 text-[9px] font-bold text-white">Compare plans <ArrowRight size={12} className="ml-1 inline"/></button></div></Card></>;
}
function Evidence({suppliers,onExport}:{suppliers:Supplier[];onExport:()=>void}) { return <><div className="mb-4 grid gap-3 sm:grid-cols-3"><Metric label="Evidence coverage" value="72%" icon={<ShieldCheck size={16}/>} color="text-emerald-700" note="3 of 5 links verified or reported"/><Metric label="Needs verification" value="2" icon={<AlertTriangle size={16}/>} color="text-amber-700" note="Inferred or incomplete source records"/><Metric label="Last evidence review" value="Oct 28" icon={<Clock3 size={16}/>} color="text-slate-800" note="Synthetic example dataset"/></div><Card className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 p-5"><div><h2 className="text-sm font-semibold">Source register</h2><p className="mt-1 text-[9px] text-slate-500">Keep a trail from every dependency claim back to its evidence.</p></div><button onClick={onExport} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[9px] font-semibold hover:bg-slate-50"><Download size={13}/> Export CSV</button></div><div className="divide-y divide-slate-100">{suppliers.map(s=><div key={s.name} className="flex flex-wrap items-center gap-3 px-5 py-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-600"><Globe2 size={15}/></span><div className="min-w-[150px] flex-1"><strong className="block text-[10px]">{s.name}</strong><span className="text-[9px] text-slate-400">{s.category} · {s.region}</span></div><span className={`rounded-full border px-2 py-1 text-[8px] font-semibold ${confidenceTone[s.confidence]}`}>{s.confidence}</span><span className="w-24 text-right text-[9px] text-slate-500">Risk {s.risk}%</span><button className="text-slate-400" onClick={()=>alert(`Evidence record for ${s.name}: illustrative demo item`)} aria-label={`View evidence for ${s.name}`}><ArrowUpRight size={14}/></button></div>)}</div></Card><Card className="mt-4 flex items-start gap-3 bg-violet-50/50 p-4"><ShieldCheck size={16} className="mt-0.5 text-violet-700"/><div><strong className="text-[10px]">Confidence is a product feature.</strong><p className="mt-1 text-[9px] leading-relaxed text-slate-600">Verified, reported, and inferred relationships stay visually distinct so analysts can separate evidence from hypotheses. Never treat an inferred link as a confirmed supplier fact.</p></div></Card></> }
function PlansModal({annual,setBilling,onClose}:{annual:boolean;setBilling:(v:'monthly'|'annual')=>void;onClose:()=>void}) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/55 p-3 backdrop-blur-sm" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="relative my-auto w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl sm:p-7"><button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200" aria-label="Close"><X size={15}/></button><div className="text-[9px] font-bold uppercase tracking-[.16em] text-amber-700">Built for the risks that matter</div><h2 className="mt-2 text-2xl font-semibold tracking-tight">Start with visibility. Scale to resilience.</h2><p className="mt-2 max-w-xl text-[10px] leading-relaxed text-slate-500">Packaging concept for early customer discovery. Billing and accounts need to be connected before accepting payment.</p><div className="mt-5 inline-flex rounded-lg bg-slate-100 p-1"><button onClick={()=>setBilling('monthly')} className={`rounded-md px-3 py-2 text-[9px] font-semibold ${!annual?'bg-white text-slate-900 shadow-sm':'text-slate-500'}`}>Monthly</button><button onClick={()=>setBilling('annual')} className={`rounded-md px-3 py-2 text-[9px] font-semibold ${annual?'bg-white text-slate-900 shadow-sm':'text-slate-500'}`}>Annual · save 20%</button></div><div className="mt-4 grid gap-3 md:grid-cols-3">{[{name:'Explorer',price:'Free',desc:'Validate the risk picture.',features:['1 workspace','CSV preview import','Core dependency graph','Basic scenario preview']},{name:'Team',price:annual?'$399':'$499',desc:'For teams managing exposure.',features:['Up to 10 seats','Unlimited supplier tiers','Saved scenarios & Monte Carlo','Evidence workflows','Weekly risk digest'],featured:true},{name:'Enterprise',price:'Custom',desc:'For complex supplier networks.',features:['Unlimited seats & workspaces','ERP and procurement integrations','Advanced access controls','Dedicated onboarding','Audit-ready exports']}].map(plan=><div key={plan.name} className={`rounded-xl border p-4 ${plan.featured?'border-amber-400 bg-[#fffaf0] shadow-sm':'border-slate-200'}`}><div className="flex items-center justify-between"><strong className="text-xs">{plan.name}</strong>{plan.featured&&<Badge tone="amber">MOST POPULAR</Badge>}</div><div className="mt-3 text-2xl font-semibold tracking-tight">{plan.price}<span className="ml-1 text-[9px] font-normal text-slate-400">{plan.price.startsWith('$')?'/mo':''}</span></div><p className="mt-1 text-[9px] text-slate-500">{plan.desc}</p><ul className="mt-4 space-y-2">{plan.features.map(f=><li key={f} className="flex gap-2 text-[9px] text-slate-600"><Check size={12} className="shrink-0 text-emerald-600"/>{f}</li>)}</ul><button onClick={()=>{onClose();window.location.href='mailto:hello@truetier.app?subject=TrueTier%20early%20access'}} className={`mt-5 w-full rounded-lg py-2.5 text-[9px] font-bold ${plan.featured?'bg-[#17212b] text-white hover:bg-slate-700':'border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>{plan.name==='Explorer'?'Keep exploring':plan.name==='Team'?'Request a pilot':'Talk to sales'}{plan.name!=='Explorer'&&<ArrowUpRight size={12} className="ml-1 inline"/>}</button></div>)}</div><p className="mt-4 text-center text-[8px] text-slate-400">Illustrative pricing for product planning · No payment is collected in this preview</p></div></div>;
}
