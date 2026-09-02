import React, { useEffect, useRef } from 'react';

export default function RainCanvas({ enableRain, enableThunder, enableHolyDust }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!enableRain && !enableThunder && !enableHolyDust) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 1. Raindrops
    const drops = [];
    if (enableRain) {
      for (let i = 0; i < 40; i++) {
        drops.push({
          x: Math.random() * width,
          y: Math.random() * height,
          length: Math.random() * 16 + 8,
          speed: Math.random() * 4 + 4
        });
      }
    }

    // 2. Golden Sanctuary Dust Particles
    const dustParticles = [];
    if (enableHolyDust) {
      for (let i = 0; i < 35; i++) {
        dustParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2.2 + 0.8,
          speedX: (Math.random() - 0.5) * 0.4,
          speedY: -(Math.random() * 0.5 + 0.2),
          alpha: Math.random() * 0.5 + 0.2
        });
      }
    }

    let thunderOpacity = 0;
    let lastThunder = Date.now();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Rain rendering
      if (enableRain) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 1;
        drops.forEach(drop => {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x + 1, drop.y + drop.length);
          ctx.stroke();
          drop.y += drop.speed;
          if (drop.y > height) {
            drop.y = -drop.length;
            drop.x = Math.random() * width;
          }
        });
      }

      // Golden Dust rendering
      if (enableHolyDust) {
        dustParticles.forEach(p => {
          ctx.fillStyle = `rgba(250, 204, 21, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.x += p.speedX;
          p.y += p.speedY;

          if (p.y < 0) p.y = height;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
        });
      }

      // Thunder flash
      if (enableThunder) {
        const now = Date.now();
        if (now - lastThunder > 8000 && Math.random() < 0.02) {
          thunderOpacity = 0.16;
          lastThunder = now;
        }
        if (thunderOpacity > 0) {
          ctx.fillStyle = `rgba(56, 189, 248, ${thunderOpacity})`;
          ctx.fillRect(0, 0, width, height);
          thunderOpacity -= 0.01;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [enableRain, enableThunder, enableHolyDust]);

  if (!enableRain && !enableThunder && !enableHolyDust) return null;

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1]" />;
}