'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeProvider';

export const InteractiveBackground: React.FC = () => {
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const smoothRef = useRef({ x: -1000, y: -1000 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (smoothRef.current.x === -1000) {
        smoothRef.current = { x: e.clientX, y: e.clientY };
      }
    };
    window.addEventListener('mousemove', handleMouse);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const draw = () => {
      if (!ctx || !canvas) return;
      smoothRef.current.x = lerp(smoothRef.current.x, mouseRef.current.x, 0.05);
      smoothRef.current.y = lerp(smoothRef.current.y, mouseRef.current.y, 0.05);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isLight = themeRef.current === 'light';

      // Subtle fixed ambient glow top right
      const fixedGradient1 = ctx.createRadialGradient(
        canvas.width * 0.85, canvas.height * 0.15, 0,
        canvas.width * 0.85, canvas.height * 0.15, 480
      );
      if (isLight) {
        fixedGradient1.addColorStop(0, 'rgba(5, 150, 105, 0.045)');
        fixedGradient1.addColorStop(0.6, 'rgba(16, 185, 129, 0.015)');
        fixedGradient1.addColorStop(1, 'rgba(247, 250, 248, 0)');
      } else {
        fixedGradient1.addColorStop(0, 'rgba(245, 185, 66, 0.055)');
        fixedGradient1.addColorStop(0.6, 'rgba(229, 168, 50, 0.02)');
        fixedGradient1.addColorStop(1, 'rgba(14, 13, 11, 0)');
      }
      ctx.fillStyle = fixedGradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle fixed ambient glow bottom left
      const fixedGradient2 = ctx.createRadialGradient(
        canvas.width * 0.15, canvas.height * 0.8, 0,
        canvas.width * 0.15, canvas.height * 0.8, 520
      );
      if (isLight) {
        fixedGradient2.addColorStop(0, 'rgba(16, 185, 129, 0.035)');
        fixedGradient2.addColorStop(0.6, 'rgba(5, 150, 105, 0.01)');
        fixedGradient2.addColorStop(1, 'rgba(247, 250, 248, 0)');
      } else {
        fixedGradient2.addColorStop(0, 'rgba(217, 155, 38, 0.045)');
        fixedGradient2.addColorStop(0.6, 'rgba(245, 185, 66, 0.015)');
        fixedGradient2.addColorStop(1, 'rgba(14, 13, 11, 0)');
      }
      ctx.fillStyle = fixedGradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Interactive cursor-following spotlight
      if (smoothRef.current.x > 0 && smoothRef.current.y > 0) {
        const mouseGrad = ctx.createRadialGradient(
          smoothRef.current.x, smoothRef.current.y, 0,
          smoothRef.current.x, smoothRef.current.y, 460
        );
        if (isLight) {
          mouseGrad.addColorStop(0, 'rgba(5, 150, 105, 0.12)');
          mouseGrad.addColorStop(0.3, 'rgba(5, 150, 105, 0.06)');
          mouseGrad.addColorStop(0.6, 'rgba(16, 185, 129, 0.02)');
          mouseGrad.addColorStop(1, 'rgba(247, 250, 248, 0)');
        } else {
          mouseGrad.addColorStop(0, 'rgba(245, 185, 66, 0.22)');
          mouseGrad.addColorStop(0.3, 'rgba(245, 185, 66, 0.13)');
          mouseGrad.addColorStop(0.6, 'rgba(217, 155, 38, 0.05)');
          mouseGrad.addColorStop(1, 'rgba(14, 13, 11, 0)');
        }

        ctx.fillStyle = mouseGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
