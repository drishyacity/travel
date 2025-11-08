import React, { useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, PerspectiveCamera } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from './ui/button';
import { Plane, Send } from 'lucide-react';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

// Simple 3D Airplane component
import { TextureLoader } from 'three';

// Animated Camera that follows the plane smoothly
function AnimatedCamera({ scrollTarget }) {
  const { camera } = useThree();

  useEffect(() => {
    // Camera starts close
    camera.position.set(0, 0, 5);

    // Camera stays at same distance - no zoom
    const cam1 = ScrollTrigger.create({
      trigger: scrollTarget?.current || document.body,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.04,
      // camera does not pin; airplane trigger will handle pinning
      onUpdate: (self) => {
        const p = self.progress;
        // Slight zoom to follow plane forward movement
        camera.position.z = 5 + p * 0.4; // tighter frustum to help exit visually
      }
    });

    return () => {
      // cam1.kill(); // Removed this line to keep the canvas visible
    };
  }, [camera]);

  return null;
}

function Airplane({ scrollTarget }) {
  const groupRef = useRef();
  const smokeGroupRef = useRef();
  const { camera } = useThree();
  // load glb from public folder
  const gltf = useGLTF('/aeroplane.glb');
  const smokeTex = useLoader(TextureLoader, '/smoke.png');

  // prepare smoke particles metadata for a straight-line trail
  const smokeCount = 0; // disable plane smoke
  const smokeMeta = useMemo(() => {
    return new Array(smokeCount).fill(0).map((_, i) => ({
      id: i,
      offset: i, // index along the line
      size: 0.7, // base size
      opacity: Math.max(0.2, 1 - i / smokeCount),
    }));
  }, []);

  // Phase 2: After Hero ends, keep animating with page scroll, bouncing between corners along the bottom
  useEffect(() => {
    if (!scrollTarget?.current || !groupRef.current) return;

    const st2 = ScrollTrigger.create({
      trigger: scrollTarget.current,
      start: 'bottom top',
      end: 'bottom+=4000 top',
      scrub: 0.2,
      onUpdate: (self) => {
        const p2 = self.progress; // 0..1 over extended page scroll
        if (!groupRef.current) return;

        // Keep roughly same depth
        const currentZ = -12;
        groupRef.current.position.z = currentZ;

        // Frustum at this depth
        const camZ = camera.position.z;
        const distance = Math.max(0.001, camZ - currentZ);
        const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * distance;
        const halfW = halfH * camera.aspect;

        // Margins and baseline at bottom
        const s = groupRef.current.scale.x; // keep last scale
        const margin = 0.4 * s;
        const leftX = -halfW + margin;
        const rightX = halfW - margin;
        const baseY = -halfH + margin + 0.10 * s;

        // Triangle-wave progression for ping-pong between left and right
        const cycles = 3; // number of back-and-forths
        // Start from right edge moving left: add a half-cycle (1) phase offset
        const cyc = p2 * cycles + 1;
        const k = Math.floor(cyc);
        const frac = cyc - k; // 0..1 within a half-path
        const forward = k % 2 === 0; // even: left->right, odd: right->left

        // Use cosine ease to smooth speed near edges and avoid teleport feel
        const eased = 0.5 - 0.5 * Math.cos(Math.PI * frac); // 0..1 easeInOut

        const x = forward
          ? THREE.MathUtils.lerp(leftX, rightX, eased)
          : THREE.MathUtils.lerp(rightX, leftX, eased);

        // Slight arc: rise near mid, then return (use eased for symmetry)
        const climb = 0.20 * s; // arc height
        const parabola = 1 - 4 * (eased - 0.5) * (eased - 0.5); // 0 at ends, 1 at middle
        const y = baseY + climb * parabola;

        groupRef.current.position.x = x;
        groupRef.current.position.y = y;
        // Smooth the yaw near each edge so it doesn't "teleport" orientation
        const edgeW = 0.2; // portion of half-cycle used for turning (wider smoothing)
        let ry = forward ? Math.PI : 0; // base facing
        if (frac < edgeW) {
          // starting near left (or right) edge: rotate into travel direction
          const tt = frac / edgeW;
          ry = THREE.MathUtils.lerp(forward ? 0 : Math.PI, forward ? Math.PI : 0, tt);
        } else if (frac > 1 - edgeW) {
          // approaching next edge: pre-rotate toward next travel direction
          const tt = (frac - (1 - edgeW)) / edgeW;
          ry = THREE.MathUtils.lerp(forward ? Math.PI : 0, forward ? 0 : Math.PI, tt);
        }
        groupRef.current.rotation.y = ry;
        groupRef.current.rotation.z = 0.0;
        groupRef.current.rotation.x = -0.04;
      }
    });

    return () => st2.kill();
  }, [camera, scrollTarget]);

  // refs to smoke meshes
  const smokeRefs = useRef([]);

  useEffect(() => {
    if (!groupRef.current) return;

    // Initial state: plane is large and centered
    groupRef.current.scale.set(3, 3, 3);
    groupRef.current.position.set(0, 0, 0);
    groupRef.current.rotation.set(0, 0, 0);

    // Animation: move to top-left corner and gradually shrink by the end
    const st1 = ScrollTrigger.create({
      trigger: scrollTarget?.current || document.body,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.05,
      // no pin so Hero scrolls with the animation
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        if (!groupRef.current) return;

        // Move forward (negative Z) throughout
        const endZ = -12;
        const currentZ = -p * Math.abs(endZ);
        groupRef.current.position.z = currentZ;

        // Camera frustum at current depth
        const camZ = camera.position.z;
        const distance = Math.max(0.001, camZ - currentZ);
        const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * distance;
        const halfW = halfH * camera.aspect;

        // Base scale and margins
        const s = 3 + (2.6 - 3) * Math.min(p, 1); // grow to ~2.6 by end of phase 1 and keep
        const margin = 0.4 * s;

        // Corner targets (bottom-left and right side)
        const cornerBL = {
          x: -halfW + margin,
          y: -halfH + margin + 0.15 * s,
        };
        const outsideLeft = {
          x: -halfW - 0.5 * margin,
          y: cornerBL.y + 0.1 * s,
        };
        const rightSide = {
          x: halfW - margin,
          y: cornerBL.y + 0.05 * s,
        };

        // Phases:
        // 0-0.15 approach, 0.15-0.30 quick U-turn just past left edge,
        // 0.30-0.55 re-enter to center-bottom,
        // 0.55-0.75 slight climb while heading right (center upward arc),
        // 0.75-0.90 descend toward right corner,
        // 0.90-1.0 turn back at right corner and begin exiting (keeps animating with page scroll)
        if (p < 0.15) {
          const t = p / 0.15;
          groupRef.current.position.x = THREE.MathUtils.lerp(0, cornerBL.x, t);
          groupRef.current.position.y = THREE.MathUtils.lerp(0, cornerBL.y, t);
          groupRef.current.rotation.z = t * 0.02; // slight roll
          groupRef.current.rotation.x = -t * 0.10; // nose-down
        } else if (p < 0.30) {
          const t = (p - 0.15) / 0.15; // quick U-turn
          const exitX = -halfW - 0.2 * halfW; // ~20% beyond left edge
          const exitY = cornerBL.y + 0.18 * s;
          groupRef.current.position.x = THREE.MathUtils.lerp(cornerBL.x, exitX, t);
          groupRef.current.position.y = THREE.MathUtils.lerp(cornerBL.y, exitY, t);
          groupRef.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI, t); // yaw 180°
          groupRef.current.rotation.z = THREE.MathUtils.lerp(0.02, 0.0, t);
          groupRef.current.rotation.x = THREE.MathUtils.lerp(-0.10, -0.07, t);
        } else if (p < 0.55) {
          const t = (p - 0.30) / 0.25;
          // Re-enter to center-bottom
          const startX = -halfW - 0.2 * halfW;
          const startY = cornerBL.y + 0.18 * s;
          const centerBottom = { x: 0, y: cornerBL.y + 0.10 * s };
          groupRef.current.position.x = THREE.MathUtils.lerp(startX, centerBottom.x, t);
          groupRef.current.position.y = THREE.MathUtils.lerp(startY, centerBottom.y, t);
          groupRef.current.rotation.y = Math.PI;
          groupRef.current.rotation.z = 0.0;
          groupRef.current.rotation.x = -0.06;
        } else if (p < 0.75) {
          const t = (p - 0.55) / 0.20;
          // Slight climb near center while continuing right
          const from = { x: 0, y: cornerBL.y + 0.10 * s };
          const to = { x: halfW * 0.6, y: from.y + 0.25 * s };
          groupRef.current.position.x = THREE.MathUtils.lerp(from.x, to.x, t);
          groupRef.current.position.y = THREE.MathUtils.lerp(from.y, to.y, t);
          groupRef.current.rotation.y = Math.PI;
          groupRef.current.rotation.z = 0.0;
          groupRef.current.rotation.x = -0.04; // reduce pitch while climbing
        } else if (p < 0.90) {
          const t = (p - 0.75) / 0.15;
          // Descend toward right corner
          const from = { x: halfW * 0.6, y: cornerBL.y + 0.35 * s };
          const rightCorner = { x: rightSide.x, y: cornerBL.y + 0.08 * s };
          groupRef.current.position.x = THREE.MathUtils.lerp(from.x, rightCorner.x, t);
          groupRef.current.position.y = THREE.MathUtils.lerp(from.y, rightCorner.y, t);
          groupRef.current.rotation.y = Math.PI;
          groupRef.current.rotation.z = 0.0;
          groupRef.current.rotation.x = -0.05;
        } else {
          // Hold at right corner until phase 2 takes over (no exit here)
          groupRef.current.position.x = rightSide.x;
          groupRef.current.position.y = cornerBL.y + 0.08 * s;
          groupRef.current.rotation.y = Math.PI;
          groupRef.current.rotation.z = 0.0;
          groupRef.current.rotation.x = -0.04;
        }

        // Keep scale (lock after first U-turn so it doesn't get smaller)
        const sLocked = 3 + (2.6 - 3) * Math.min(p, 0.30);
        groupRef.current.scale.set(sLocked, sLocked, sLocked);
      }
    });

    return () => {
      st1.kill();
    };
  }, []);

  // After model load, compute tail position and place smoke at the tail so it follows the plane
  useEffect(() => {
    if (!gltf?.scene || !smokeGroupRef.current) return;
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    // Assuming forward is -Z, tail should be at +Z side of the model
    const tailZ = center.z + size.z / 2;
    // Slight downward offset to avoid clipping body; adjust X if needed
    smokeGroupRef.current.position.set(0, center.y - size.y * 0.1, tailZ + 0.05);
  }, [gltf]);

  // Track plane world position to compute motion direction
  const prevPlaneWorldPos = useRef(new THREE.Vector3());
  const dirWorldRef = useRef(new THREE.Vector3(0, 0, -1)); // default forward -Z
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.getWorldPosition(prevPlaneWorldPos.current);
    }
  }, []);

  useFrame((state) => {
    if (smokeCount === 0) return; // skip when disabled
    if (!groupRef.current || !smokeGroupRef.current) return;
    // Compute plane velocity direction in world space
    const curr = new THREE.Vector3();
    groupRef.current.getWorldPosition(curr);
    const vel = curr.clone().sub(prevPlaneWorldPos.current);
    const speed = vel.length();
    if (speed > 1e-6) {
      const norm = vel.clone().multiplyScalar(1 / speed);
      // Smooth the direction to avoid jitter in the smoke line
      dirWorldRef.current.lerp(norm, 0.22).normalize();
    }
    prevPlaneWorldPos.current.copy(curr);

    // Opposite direction for smoke
    const smokeDirWorld = dirWorldRef.current.clone().negate();
    const tailWorld = new THREE.Vector3();
    smokeGroupRef.current.getWorldPosition(tailWorld);

    // Place sprites along a straight line from tail backward
    // Trail length scales slightly with plane speed
    const spacingBase = 0.32;
    const spacing = spacingBase * (1 + Math.min(2.0, speed) * 0.5);
    const cam = state.camera;

    smokeRefs.current.forEach((m, i) => {
      if (!m) return;
      const dist = i * spacing;
      const targetWorld = tailWorld.clone().addScaledVector(smokeDirWorld, dist);
      // convert to local space of smoke group so child meshes follow plane
      const local = targetWorld.clone();
      smokeGroupRef.current.worldToLocal(local);
      m.position.copy(local);
      // face the camera for billboard effect
      m.lookAt(cam.position);
      // adjust opacity/scale for smooth effect (soft exponential falloff)
      const meta = smokeMeta[i];
      if (meta) {
        const t = i / (smokeCount - 1);
        const fade = Math.max(0.12, Math.pow(1 - t, 1.8));
        m.material.opacity = 0.32 * fade;
        const s = meta.size * (0.8 + 0.2 * fade);
        m.scale.set(s, s * 0.8, 1);
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={gltf.scene} />

      {/* Smoke trail group positioned at the tail of the plane */}
      <group ref={smokeGroupRef} position={[0, 0, 0]}>
        {smokeMeta.map((s, i) => (
          <mesh
            key={s.id}
            ref={(el) => (smokeRefs.current[i] = el)}
            position={[s.offsetX, s.offsetY, s.z]}
            rotation={[0, 0, s.rot]}
          >
            <planeGeometry args={[s.size, s.size * 0.75]} />
            <meshBasicMaterial
              map={smokeTex}
              transparent
              depthWrite={false}
              depthTest={false}
              opacity={s.initialOpacity}
              side={THREE.DoubleSide}
              blending={THREE.NormalBlending}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Hero() {
  const heroRef = useRef();
  const canvasWrapRef = useRef();
  const titleRef = useRef();
  const subtitleRef = useRef();

  useEffect(() => {
    // Hero text animations
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top center',
          end: 'bottom center',
          toggleActions: 'play none none reverse'
        }
      }
    );

    gsap.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.3,
        ease: 'power3.out'
      }
    );
  }, []);

  const scrollToDestinations = () => {
    document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100svh] md:h-screen w-full overflow-visible bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-500 pt-16 md:pt-20"
    >
      {/* 3D Canvas with Airplane */}
      <div ref={canvasWrapRef} className="fixed inset-0 z-40 pointer-events-none" style={{opacity: 1}}>
        <Canvas style={{ pointerEvents: 'none' }}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <AnimatedCamera scrollTarget={heroRef} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#60a5fa" />
          <Suspense fallback={null}>
            <Airplane scrollTarget={heroRef} />
          </Suspense>
        </Canvas>
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 z-10" />

      {/* Hero Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
        <div className="w-full max-w-4xl">
          <h1
            ref={titleRef}
            className="text-6xl sm:text-7xl md:text-9xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-2xl"
            style={{ fontFamily: '"Caveat", cursive' }}
          >
            Explore The World
          </h1>
          <p
            ref={subtitleRef}
            className="text-base sm:text-lg md:text-2xl text-white/90 mb-6 sm:mb-8 drop-shadow-lg"
          >
            Discover breathtaking destinations and create unforgettable memories with our curated travel experiences
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
            <Button
              size="lg"
              onClick={scrollToDestinations}
              className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-5 sm:py-6 shadow-xl transition-transform hover:scale-105"
            >
              <Plane className="mr-2 h-5 w-5" />
              Explore Destinations
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-5 sm:py-6 shadow-xl transition-transform hover:scale-105"
            >
              <Send className="mr-2 h-5 w-5" />
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}

export default Hero;