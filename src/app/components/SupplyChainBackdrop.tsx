import React, { useEffect, useRef } from 'react';
import { getLenis } from '../utils/lenis';

interface NodePoint {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  color: string;
  isChokepoint?: boolean;
  label?: string;
  pulsePhase: number;
  tier: 1 | 2 | 3 | 'buyer';
}

interface SupplyEdge {
  fromIndex: number;
  toIndex: number;
  progress: number;
  speed: number;
  curvature: number;
  isHighRisk?: boolean;
}

export const SupplyChainBackdrop: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNetwork();
    };

    window.addEventListener('resize', handleResize);

    // Track mouse for subtle interactive deflection
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Scroll offset tracking for Lenis dynamic parallax
    let scrollY = window.scrollY;
    let targetScrollY = window.scrollY;

    const lenis = getLenis();
    let unsubscribeLenis: (() => void) | null = null;
    if (lenis) {
      const onScroll = (e: { scroll: number }) => {
        targetScrollY = e.scroll;
      };
      lenis.on('scroll', onScroll);
      unsubscribeLenis = () => lenis.off('scroll', onScroll);
    } else {
      const onNativeScroll = () => {
        targetScrollY = window.scrollY;
      };
      window.addEventListener('scroll', onNativeScroll, { passive: true });
      unsubscribeLenis = () => window.removeEventListener('scroll', onNativeScroll);
    }

    // Nodes representing multi-tier network
    let nodes: NodePoint[] = [];
    let edges: SupplyEdge[] = [];

    const initNetwork = () => {
      nodes = [];
      edges = [];

      // Generate structured clusters representing Tier 3, Tier 2, Tier 1 and Buyer
      const isMobile = width < 768;
      const countScale = isMobile ? 0.6 : 1;

      // 1. Chokepoint cluster: Hsinchu Fab & Kaohsiung Port (Golden Amber)
      nodes.push({
        x: width * 0.28,
        y: height * 0.38,
        baseX: width * 0.28,
        baseY: height * 0.38,
        radius: 6.5,
        color: '#f09e26', // TrueTier Gold
        isChokepoint: true,
        label: 'Hsinchu Wafer Works (Fab)',
        pulsePhase: 0,
        tier: 2,
      });

      nodes.push({
        x: width * 0.22,
        y: height * 0.62,
        baseX: width * 0.22,
        baseY: height * 0.62,
        radius: 7,
        color: '#f09e26',
        isChokepoint: true,
        label: 'Port of Kaohsiung',
        pulsePhase: Math.PI / 2,
        tier: 3,
      });

      // 2. Buyer Node (Chennai Plant)
      nodes.push({
        x: width * 0.78,
        y: height * 0.52,
        baseX: width * 0.78,
        baseY: height * 0.52,
        radius: 7.5,
        color: '#0d172a',
        label: 'Assembly Hub (Chennai)',
        pulsePhase: 0,
        tier: 'buyer',
      });

      // 3. Tier 1 Suppliers (Nexa, Orion, Helix, etc.)
      const t1Count = Math.floor(6 * countScale);
      for (let i = 0; i < t1Count; i++) {
        const spread = (i - (t1Count - 1) / 2) * (height * 0.12);
        nodes.push({
          x: width * (0.5 + (i % 2 === 0 ? 0.04 : -0.02)),
          y: height * 0.5 + spread,
          baseX: width * (0.5 + (i % 2 === 0 ? 0.04 : -0.02)),
          baseY: height * 0.5 + spread,
          radius: 4,
          color: '#334155',
          pulsePhase: Math.random() * Math.PI * 2,
          tier: 1,
        });
      }

      // 4. Ambient upstream nodes (Tier 3 raw sources, smelters, regional transit)
      const ambientCount = Math.floor(18 * countScale);
      for (let i = 0; i < ambientCount; i++) {
        const nx = (Math.random() * 0.85 + 0.08) * width;
        const ny = (Math.random() * 1.6 - 0.3) * height; // distribute beyond viewport for scroll
        nodes.push({
          x: nx,
          y: ny,
          baseX: nx,
          baseY: ny,
          radius: Math.random() * 2.5 + 2,
          color: Math.random() > 0.75 ? '#f09e26' : '#94a3b8',
          pulsePhase: Math.random() * Math.PI * 2,
          tier: 3,
        });
      }

      // Create supply connections
      // Connect Chokepoint Fab (0) to Port (1)
      edges.push({
        fromIndex: 1,
        toIndex: 0,
        progress: 0.1,
        speed: 0.003,
        curvature: 0.15,
        isHighRisk: true,
      });

      // Connect Chokepoint to Tier 1 nodes
      for (let i = 3; i < 3 + t1Count; i++) {
        edges.push({
          fromIndex: 0,
          toIndex: i,
          progress: Math.random(),
          speed: 0.002 + Math.random() * 0.002,
          curvature: (i % 2 === 0 ? 1 : -1) * 0.2,
          isHighRisk: true,
        });

        // Connect Tier 1 nodes to Buyer (2)
        edges.push({
          fromIndex: i,
          toIndex: 2,
          progress: Math.random(),
          speed: 0.002 + Math.random() * 0.002,
          curvature: ((i % 3) - 1) * 0.15,
          isHighRisk: false,
        });
      }

      // Add ambient trade connections
      for (let i = 3 + t1Count; i < nodes.length; i++) {
        const target = Math.floor(Math.random() * (3 + t1Count));
        if (target !== i) {
          edges.push({
            fromIndex: i,
            toIndex: target,
            progress: Math.random(),
            speed: 0.001 + Math.random() * 0.0015,
            curvature: (Math.random() - 0.5) * 0.3,
            isHighRisk: false,
          });
        }
      }
    };

    initNetwork();

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Smooth scroll interpolation
      scrollY += (targetScrollY - scrollY) * 0.08;

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw atmospheric subtle background grids & trade lane markers
      ctx.save();
      ctx.strokeStyle = 'rgba(212, 212, 216, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 12]);

      const gridSize = 90;
      const scrollOffset = (scrollY * 0.25) % gridSize;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = -scrollOffset; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Parallax vertical shift calculation based on scroll
      const parallaxFactor = 0.35;
      const scrollShiftY = scrollY * parallaxFactor;

      // Update node positions with gentle floating and mouse deflection
      nodes.forEach((node, idx) => {
        node.pulsePhase += dt * 2;

        // Base animated drift
        const driftX = Math.sin(time * 0.0008 + idx) * 8;
        const driftY = Math.cos(time * 0.0006 + idx * 1.5) * 6;

        // Position adjusted by scroll
        let curY = node.baseY - scrollShiftY + driftY;
        // Wrap gracefully across long pages
        const pageSpan = height * 2.2;
        curY = ((curY % pageSpan) + pageSpan) % pageSpan - height * 0.4;

        node.x = node.baseX + driftX;
        node.y = curY;

        // Mouse avoidance/attraction
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && dist > 0) {
          const force = (1 - dist / 180) * 16;
          node.x += (dx / dist) * force;
          node.y += (dy / dist) * force;
        }
      });

      // 3. Draw Edges (curved supply chains)
      edges.forEach((edge) => {
        const from = nodes[edge.fromIndex];
        const to = nodes[edge.toIndex];
        if (!from || !to) return;

        // Control point for smooth curved supply line
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const normalX = -dy * edge.curvature;
        const normalY = dx * edge.curvature;
        const cpX = midX + normalX;
        const cpY = midY + normalY;

        // Draw track curve
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.quadraticCurveTo(cpX, cpY, to.x, to.y);

        if (edge.isHighRisk) {
          // Warm gold supply track for chokepoint routes
          ctx.strokeStyle = 'rgba(240, 158, 38, 0.28)';
          ctx.lineWidth = 1.6;
        } else {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
          ctx.lineWidth = 1.0;
        }
        ctx.stroke();

        // Animated cargo/wafer packet traveling along path
        edge.progress = (edge.progress + edge.speed) % 1;
        const t = edge.progress;
        // Quadratic bezier formula
        const px = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * cpX + t * t * to.x;
        const py = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * cpY + t * t * to.y;

        // Draw packet pulse
        ctx.beginPath();
        ctx.arc(px, py, edge.isHighRisk ? 2.8 : 2.0, 0, Math.PI * 2);
        ctx.fillStyle = edge.isHighRisk ? '#f09e26' : '#64748b';
        ctx.shadowColor = edge.isHighRisk ? '#f09e26' : '#94a3b8';
        ctx.shadowBlur = edge.isHighRisk ? 8 : 4;
        ctx.fill();
        ctx.restore();
      });

      // 4. Draw Nodes
      nodes.forEach((node) => {
        // Draw chokepoint pulsing aura
        if (node.isChokepoint) {
          const pulseScale = 1 + Math.sin(node.pulsePhase) * 0.4;
          const auraRadius = node.radius * 2.8 * pulseScale;

          ctx.save();
          ctx.beginPath();
          ctx.arc(node.x, node.y, auraRadius, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(240, 158, 38, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Subtle filled halo
          const gradient = ctx.createRadialGradient(
            node.x,
            node.y,
            node.radius,
            node.x,
            node.y,
            auraRadius
          );
          gradient.addColorStop(0, 'rgba(240, 158, 38, 0.18)');
          gradient.addColorStop(1, 'rgba(240, 158, 38, 0)');
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.restore();
        }

        // Draw core node
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = node.isChokepoint ? 10 : 3;
        ctx.fill();

        // Clean outer ring
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Optional minimal text labels for landmark chokepoints
        if (node.label && width > 768) {
          ctx.save();
          ctx.font = '500 10px Inter, sans-serif';
          ctx.fillStyle = node.isChokepoint ? '#b45309' : '#64748b';
          ctx.fillText(node.label, node.x + node.radius + 6, node.y + 3);
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (unsubscribeLenis) unsubscribeLenis();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Dynamic Network Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Atmospheric Ambient Lighting Gradients in TrueTier Gold & Soft Deep Slate */}
      <div className="absolute top-[-10%] left-[-5%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-[#f09e26]/10 via-[#f09e26]/3 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-[45%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-[#0d172a]/5 via-[#f09e26]/5 to-transparent blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[50vw] rounded-full bg-gradient-to-tr from-[#f09e26]/8 to-transparent blur-[140px] pointer-events-none" />
    </div>
  );
};

export default SupplyChainBackdrop;
