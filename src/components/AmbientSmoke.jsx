import React, { useEffect, useRef } from 'react';

// Site-wide subtle drifting smoke using a lightweight 2D canvas
// - fixed overlay, below navbar and plane canvas, above content
// - low opacity, soft textured sprites, slow movement
export default function AmbientSmoke() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const particlesRef = useRef([]);
  const imgRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const DPR = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    const rand = (a, b) => a + Math.random() * (b - a);

    const makeParticles = () => {
      const count = Math.max(18, Math.floor(window.innerWidth / 110));
      particlesRef.current = new Array(count).fill(0).map(() => ({
        x: rand(-0.2 * window.innerWidth, 1.2 * window.innerWidth),
        y: rand(-0.2 * window.innerHeight, 1.2 * window.innerHeight),
        r: rand(140, 260), // base size
        a: rand(0.22, 0.36), // higher base alpha for visibility
        rot: rand(0, Math.PI * 2),
        rotSpeed: rand(-0.0006, 0.0006),
        vx: rand(-0.10, 0.10),
        vy: rand(-0.06, 0.08),
        drift: rand(0.0009, 0.0018),
        t: rand(0, Math.PI * 2),
      }));
    };

    const step = () => {
      const w = canvas.width / DPR;
      const h = canvas.height / DPR;
      ctx.clearRect(0, 0, w, h);

      // Screen blending so smoke is visible on dark Hero gradient and mid-tones
      ctx.globalCompositeOperation = 'screen';

      particlesRef.current.forEach(p => {
        p.t += p.drift;
        p.x += p.vx + Math.cos(p.t) * 0.12;
        p.y += p.vy + Math.sin(p.t * 0.7) * 0.10;
        p.rot += p.rotSpeed;

        // wrap around edges (with margin) for continuous motion
        const margin = 200;
        if (p.x < -margin) p.x = w + margin;
        if (p.x > w + margin) p.x = -margin;
        if (p.y < -margin) p.y = h + margin;
        if (p.y > h + margin) p.y = -margin;
        const img = imgRef.current;
        const pulse = 0.95 + Math.sin(p.t * 0.9) * 0.2; // stronger breathing
        const alpha = p.a * pulse;
        if (img && img.complete) {
          const wImg = p.r * 2;
          const hImg = p.r * 1.6;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = alpha;
          ctx.drawImage(img, -wImg / 2, -hImg / 2, wImg, hImg);
          ctx.restore();
        } else {
          // fallback radial gradient
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          grad.addColorStop(0.0, `rgba(200,200,200,${alpha})`);
          grad.addColorStop(1.0, 'rgba(200,200,200,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      rafRef.current = requestAnimationFrame(step);
    };

    const init = () => {
      resize();
      makeParticles();
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(step);
    };

    // load texture once
    const img = new Image();
    imgRef.current = img;
    img.src = '/smoke.png';
    if (img.complete) {
      init();
    } else {
      img.onload = init;
      img.onerror = init; // fallback to gradients
    }
    window.addEventListener('resize', init);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', init);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none select-none" style={{ zIndex: 45 }} aria-hidden>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
