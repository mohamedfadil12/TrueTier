import React, { useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { scrollToTarget } from '../utils/lenis';
import TrueTierLogo from './TrueTierLogo';

interface NavbarProps {
  onOpenExplorer?: () => void;
  activeMode?: 'agency' | 'supply_chain';
  onToggleMode?: (mode: 'agency' | 'supply_chain') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenExplorer,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex justify-center pt-3 sm:pt-6 px-2 sm:px-4 w-full relative z-30">
      <nav
        className="bg-white/95 backdrop-blur-md rounded-full shadow-sm border border-neutral-200/90 pl-3.5 pr-2.5 py-1.5 sm:py-2 w-full max-w-[760px] relative flex items-center justify-between transition-all"
        aria-label="Main Navigation"
      >
        {/* Left: TrueTier Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget(0, { duration: 1.2 });
            }}
            className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f09e26] rounded-full cursor-pointer py-0.5"
            aria-label="TrueTier Home"
          >
            <TrueTierLogo className="h-6 sm:h-7" />
          </a>
        </div>

        {/* Center: Desktop navigation links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-7 text-[13.5px] font-medium text-neutral-600">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget(0, { duration: 1.2 });
            }}
            className="text-neutral-900 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer hover:text-[#f09e26]"
          >
            Home
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#f09e26] inline-block"
              aria-hidden="true"
            />
          </a>
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget('#features', { offset: -30, duration: 1.2 });
            }}
            className="hover:text-neutral-900 transition-colors cursor-pointer"
          >
            Features
          </a>
          <a
            href="#interactive-visual"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget('#interactive-visual', { offset: -30, duration: 1.2 });
            }}
            className="hover:text-neutral-900 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Sandbox</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          </a>
          <a
            href="#risk-map"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget('#risk-map', { offset: -30, duration: 1.2 });
            }}
            className="hover:text-neutral-900 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Risk Map</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#f09e26]"></span>
          </a>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget('#about', { offset: -30, duration: 1.2 });
            }}
            className="hover:text-neutral-900 transition-colors cursor-pointer"
          >
            Case Study
          </a>
        </div>

        {/* Right Action: Deep Graph Trigger (desktop) & Mobile Hamburger */}
        <div className="flex items-center gap-2">
          {onOpenExplorer && (
            <button
              type="button"
              onClick={onOpenExplorer}
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0b0f1a] hover:bg-[#1a233a] active:scale-95 text-white text-xs font-semibold shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f09e26] group cursor-pointer"
            >
              <span>Deep Graph</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#f09e26] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f09e26]"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile Dropdown Panel */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-1 right-1 mt-2 bg-white rounded-2xl shadow-xl border border-neutral-200 p-3 z-40 flex flex-col gap-1 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                scrollToTarget(0, { duration: 1.2 });
              }}
              className="px-3 py-2.5 rounded-xl font-medium text-neutral-900 hover:bg-neutral-50 flex items-center justify-between cursor-pointer"
            >
              <span>Home</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#f09e26]"></span>
            </a>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                scrollToTarget('#features', { offset: -30, duration: 1.2 });
              }}
              className="px-3 py-2.5 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            >
              Features & Architecture
            </a>
            <a
              href="#interactive-visual"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                scrollToTarget('#interactive-visual', { offset: -30, duration: 1.2 });
              }}
              className="px-3 py-2.5 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50 cursor-pointer flex items-center justify-between"
            >
              <span>Interactive Sandbox</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-[#b45309] font-semibold font-mono">Live</span>
            </a>
            <a
              href="#risk-map"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                scrollToTarget('#risk-map', { offset: -30, duration: 1.2 });
              }}
              className="px-3 py-2.5 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50 cursor-pointer flex items-center justify-between"
            >
              <span>D3 Risk Heatmap</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-semibold font-mono">D3 Heat</span>
            </a>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                scrollToTarget('#about', { offset: -30, duration: 1.2 });
              }}
              className="px-3 py-2.5 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            >
              Case Study (Aurora Motors)
            </a>

            {onOpenExplorer && (
              <div className="pt-2 mt-1 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenExplorer();
                  }}
                  className="w-full text-center px-4 py-2.5 rounded-xl bg-[#0b0f1a] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Open Deep Graph Explorer</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#f09e26]" />
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
