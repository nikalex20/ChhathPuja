'use client';

import React, { useEffect, useRef } from 'react';

interface FloatingDiya {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  flameFlicker: number;
  alpha: number;
  phase: number;
}

interface GoldParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface WaterRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
  aspectRatio: number;
  hue: 'gold' | 'cyan' | 'amber';
}

interface RiverCanvasProps {
  interactive?: boolean;
  spawnDiyaTrigger?: number;
  className?: string;
}

export default function RiverCanvas({
  interactive = true,
  spawnDiyaTrigger = 0,
  className = '',
}: RiverCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const diyasRef = useRef<FloatingDiya[]>([]);
  const particlesRef = useRef<GoldParticle[]>([]);
  const ripplesRef = useRef<WaterRipple[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const prevTriggerRef = useRef(spawnDiyaTrigger);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Initialize floating diyas
    const diyaCount = Math.min(18, Math.max(8, Math.floor(width / 110)));
    diyasRef.current = Array.from({ length: diyaCount }, () => ({
      x: Math.random() * width,
      y: height * 0.45 + Math.random() * (height * 0.52),
      vx: 0.15 + Math.random() * 0.35,
      vy: Math.sin(Math.random() * Math.PI * 2) * 0.08,
      size: 14 + Math.random() * 12,
      flameFlicker: Math.random() * Math.PI,
      alpha: 0.8 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
    }));

    // Initialize golden aura particles
    const particleCount = Math.min(45, Math.max(20, Math.floor(width / 35)));
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.3 - Math.random() * 0.6,
      size: 1.2 + Math.random() * 2.5,
      alpha: 0.2 + Math.random() * 0.6,
      life: Math.random() * 150,
      maxLife: 150 + Math.random() * 100,
    }));

    let time = 0;
    let lastMoveTime = 0;
    let lastMoveX = 0;
    let lastMoveY = 0;

    const render = () => {
      time += prefersReducedMotion ? 0.002 : 0.015;
      ctx.clearRect(0, 0, width, height);

      // 1. River Water Base Gradient
      const riverGradient = ctx.createLinearGradient(0, height * 0.35, 0, height);
      riverGradient.addColorStop(0, 'rgba(6, 12, 30, 0.4)');
      riverGradient.addColorStop(0.3, 'rgba(10, 20, 50, 0.7)');
      riverGradient.addColorStop(0.7, 'rgba(13, 26, 62, 0.85)');
      riverGradient.addColorStop(1, 'rgba(4, 8, 22, 0.95)');
      ctx.fillStyle = riverGradient;
      ctx.fillRect(0, height * 0.35, width, height * 0.65);

      // 2. Ambient Natural River Water Ripples
      if (!prefersReducedMotion && ripplesRef.current.length < 28 && Math.random() < 0.03) {
        ripplesRef.current.push({
          x: Math.random() * width,
          y: height * 0.4 + Math.random() * (height * 0.58),
          radius: 4,
          maxRadius: 80 + Math.random() * 70,
          alpha: 0.55 + Math.random() * 0.3,
          speed: 1.0 + Math.random() * 0.8,
          aspectRatio: 0.38,
          hue: Math.random() > 0.45 ? 'gold' : 'cyan',
        });
      }

      // 3. Render and Update Water Ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const r = ripplesRef.current[i];
        r.radius += r.speed;
        r.alpha *= 0.965;

        if (r.alpha < 0.015 || r.radius >= r.maxRadius) {
          ripplesRef.current.splice(i, 1);
          continue;
        }

        const ry = r.radius * r.aspectRatio;

        // Primary outer crest wave
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius, ry, 0, 0, Math.PI * 2);
        if (r.hue === 'cyan') {
          ctx.strokeStyle = `rgba(56, 189, 248, ${r.alpha * 0.55})`;
        } else if (r.hue === 'amber') {
          ctx.strokeStyle = `rgba(251, 146, 60, ${r.alpha * 0.6})`;
        } else {
          ctx.strokeStyle = `rgba(255, 183, 3, ${r.alpha * 0.55})`;
        }
        ctx.lineWidth = Math.max(0.75, 2.2 * (1 - r.radius / r.maxRadius));
        ctx.stroke();

        // Secondary inner echo ring
        if (r.radius > 12) {
          const innerRadius = r.radius * 0.65;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, innerRadius, innerRadius * r.aspectRatio, 0, 0, Math.PI * 2);
          ctx.strokeStyle =
            r.hue === 'cyan'
              ? `rgba(125, 211, 252, ${r.alpha * 0.35})`
              : `rgba(251, 191, 36, ${r.alpha * 0.35})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Central soft reflection glow
        if (r.radius > 25) {
          const centerRadius = r.radius * 0.32;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, centerRadius, centerRadius * r.aspectRatio, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 245, 210, ${r.alpha * 0.22})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // 4. Gentle Sinusoidal Water Waves & Shimmer
      const rippleLines = 6;
      for (let i = 0; i < rippleLines; i++) {
        const yBase = height * 0.48 + i * (height * 0.09);
        const amplitude = 3 + i * 1.5;
        const wavelength = 120 + i * 35;
        const speed = time * (0.6 + i * 0.15);

        ctx.beginPath();
        for (let x = 0; x <= width; x += 15) {
          const yWave = yBase + Math.sin(x / wavelength + speed) * amplitude;
          if (x === 0) ctx.moveTo(x, yWave);
          else ctx.lineTo(x, yWave);
        }
        ctx.strokeStyle = `rgba(255, 183, 3, ${0.04 + i * 0.015})`;
        ctx.lineWidth = 1.2 + i * 0.4;
        ctx.stroke();
      }

      // 5. Ascending Sacred Golden Dust / Embers
      for (const p of particlesRef.current) {
        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          p.life++;

          if (p.life > p.maxLife || p.y < -10) {
            p.x = Math.random() * width;
            p.y = height + 10;
            p.life = 0;
            p.alpha = 0.2 + Math.random() * 0.6;
          }
        }

        const progress = p.life / p.maxLife;
        const currentAlpha = Math.sin(progress * Math.PI) * p.alpha;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 195, 30, ${currentAlpha})`;
        ctx.shadowColor = 'rgba(251, 133, 0, 0.8)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 6. Floating Illuminated Clay Diyas
      for (const diya of diyasRef.current) {
        if (!prefersReducedMotion) {
          diya.x += diya.vx;
          diya.y += Math.sin(time + diya.phase) * 0.35;
          diya.flameFlicker += 0.08;

          // Subtle diya wake ripple
          if (Math.random() < 0.035 && ripplesRef.current.length < 32) {
            ripplesRef.current.push({
              x: diya.x,
              y: diya.y + diya.size * 0.4,
              radius: 2,
              maxRadius: diya.size * 3.8,
              alpha: 0.5,
              speed: 0.8,
              aspectRatio: 0.38,
              hue: 'gold',
            });
          }

          if (diya.x > width + 50) {
            diya.x = -50;
            diya.y = height * 0.45 + Math.random() * (height * 0.52);
          }
        }

        const flicker = Math.sin(diya.flameFlicker) * 0.15;
        const currentSize = diya.size;

        // Water Reflection underneath Diya
        const reflGrad = ctx.createRadialGradient(
          diya.x,
          diya.y + currentSize * 0.5,
          1,
          diya.x,
          diya.y + currentSize * 0.8,
          currentSize * 2.5
        );
        reflGrad.addColorStop(0, `rgba(255, 183, 3, ${0.4 + flicker * 0.3})`);
        reflGrad.addColorStop(0.5, `rgba(251, 133, 0, ${0.2 + flicker * 0.2})`);
        reflGrad.addColorStop(1, 'rgba(251, 133, 0, 0)');
        ctx.fillStyle = reflGrad;
        ctx.beginPath();
        ctx.ellipse(diya.x, diya.y + currentSize * 0.6, currentSize * 2.2, currentSize * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Earthen Clay Diya Base
        ctx.beginPath();
        ctx.ellipse(diya.x, diya.y, currentSize, currentSize * 0.45, 0, 0, Math.PI);
        ctx.fillStyle = '#8d3b14';
        ctx.fill();
        ctx.strokeStyle = '#5a220a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Diya Rim
        ctx.beginPath();
        ctx.ellipse(diya.x, diya.y, currentSize, currentSize * 0.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#b44e1c';
        ctx.fill();

        // Golden Ghee pool
        ctx.beginPath();
        ctx.ellipse(diya.x, diya.y - 1, currentSize * 0.65, currentSize * 0.15, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#ffc83b';
        ctx.fill();

        // Sacred Radiant Flame Aura
        const flameAura = ctx.createRadialGradient(
          diya.x,
          diya.y - currentSize * 0.7,
          0,
          diya.x,
          diya.y - currentSize * 0.7,
          currentSize * 2.2
        );
        flameAura.addColorStop(0, `rgba(255, 245, 210, ${0.9 + flicker})`);
        flameAura.addColorStop(0.25, `rgba(255, 183, 3, ${0.65 + flicker})`);
        flameAura.addColorStop(0.6, `rgba(251, 133, 0, ${0.25 + flicker * 0.5})`);
        flameAura.addColorStop(1, 'rgba(251, 133, 0, 0)');
        ctx.fillStyle = flameAura;
        ctx.beginPath();
        ctx.arc(diya.x, diya.y - currentSize * 0.7, currentSize * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Teardrop Flame Core
        ctx.beginPath();
        const flameHeight = currentSize * (0.9 + flicker * 0.25);
        const flameWidth = currentSize * 0.35;
        ctx.moveTo(diya.x, diya.y - currentSize * 0.2);
        ctx.bezierCurveTo(
          diya.x - flameWidth,
          diya.y - currentSize * 0.4,
          diya.x - flameWidth * 0.5,
          diya.y - flameHeight,
          diya.x,
          diya.y - flameHeight
        );
        ctx.bezierCurveTo(
          diya.x + flameWidth * 0.5,
          diya.y - flameHeight,
          diya.x + flameWidth,
          diya.y - currentSize * 0.4,
          diya.x,
          diya.y - currentSize * 0.2
        );
        ctx.closePath();
        ctx.fillStyle = '#fffbeb';
        ctx.shadowColor = '#fb8500';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    // Universal Interactive Water Ripple Trigger on Pointer Down (Click / Tap)
    const handlePointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      const x = e.clientX;
      const y = e.clientY;

      ripplesRef.current.push({
        x,
        y,
        radius: 4,
        maxRadius: 150 + Math.random() * 50,
        alpha: 0.85,
        speed: 2.2,
        aspectRatio: 0.38,
        hue: 'gold',
      });

      ripplesRef.current.push({
        x,
        y,
        radius: 2,
        maxRadius: 100 + Math.random() * 40,
        alpha: 0.65,
        speed: 1.5,
        aspectRatio: 0.38,
        hue: 'cyan',
      });

      // Spawn a drifting diya if clicking directly on the water area
      if (y > height * 0.38 && Math.random() < 0.35 && diyasRef.current.length < 25) {
        diyasRef.current.push({
          x,
          y,
          vx: 0.2 + Math.random() * 0.3,
          vy: 0,
          size: 16 + Math.random() * 8,
          flameFlicker: Math.random() * Math.PI,
          alpha: 1,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    // Gentle motion ripples on pointer move
    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive || prefersReducedMotion) return;
      const now = performance.now();
      if (now - lastMoveTime < 90) return;

      const dx = e.clientX - lastMoveX;
      const dy = e.clientY - lastMoveY;
      const dist = Math.hypot(dx, dy);

      if (dist > 35 && ripplesRef.current.length < 24) {
        lastMoveTime = now;
        lastMoveX = e.clientX;
        lastMoveY = e.clientY;

        ripplesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          radius: 3,
          maxRadius: 65 + Math.random() * 30,
          alpha: 0.4,
          speed: 1.3,
          aspectRatio: 0.38,
          hue: Math.random() > 0.5 ? 'cyan' : 'gold',
        });
      }
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [interactive]);

  // Handle external trigger to spawn a diya (e.g. from "Light a Diya" button)
  useEffect(() => {
    if (spawnDiyaTrigger > prevTriggerRef.current) {
      prevTriggerRef.current = spawnDiyaTrigger;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const spawnX = width * 0.5 + (Math.random() - 0.5) * (width * 0.3);
      const spawnY = height * 0.65 + (Math.random() - 0.5) * (height * 0.15);

      diyasRef.current.push({
        x: spawnX,
        y: spawnY,
        vx: 0.25 + Math.random() * 0.2,
        vy: 0,
        size: 22,
        flameFlicker: 0,
        alpha: 1,
        phase: 0,
      });

      if (diyasRef.current.length > 35) {
        diyasRef.current.shift();
      }

      // Celebratory multi-ring water ripples
      ripplesRef.current.push({
        x: spawnX,
        y: spawnY + 10,
        radius: 6,
        maxRadius: 220,
        alpha: 0.95,
        speed: 2.5,
        aspectRatio: 0.38,
        hue: 'gold',
      });
      ripplesRef.current.push({
        x: spawnX,
        y: spawnY + 10,
        radius: 3,
        maxRadius: 160,
        alpha: 0.75,
        speed: 1.8,
        aspectRatio: 0.38,
        hue: 'amber',
      });
      ripplesRef.current.push({
        x: spawnX,
        y: spawnY + 10,
        radius: 1,
        maxRadius: 120,
        alpha: 0.6,
        speed: 1.2,
        aspectRatio: 0.38,
        hue: 'cyan',
      });
    }
  }, [spawnDiyaTrigger]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ display: 'block' }}
      aria-hidden="true"
    />
  );
}
