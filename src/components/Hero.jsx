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

  // prepare smoke particles metadata - more particles for better trail
  const smokeCount = 50;
  const smokeMeta = useMemo(() => {
    return new Array(smokeCount).fill(0).map((_, i) => ({
      id: i,
      z: -i * 0.3,
      rot: Math.random() * Math.PI * 2,
      offsetY: -0.2 - Math.random() * 0.4,
      offsetX: (Math.random() - 0.5) * 0.25,
      size: 0.7 + Math.random() * 1.0,
      initialOpacity: 0.6 + Math.random() * 0.3,
    }));
  }, []);

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
          const t = (p - 0.90) / 0.10;
          // At right corner: turn back and begin exiting to the right
          const from = { x: rightSide.x, y: cornerBL.y + 0.08 * s };
          const outRight = { x: halfW + 0.3 * halfW, y: from.y + 0.04 * s };
          groupRef.current.position.x = THREE.MathUtils.lerp(from.x, outRight.x, t);
          groupRef.current.position.y = THREE.MathUtils.lerp(from.y, outRight.y, t);
          groupRef.current.rotation.y = THREE.MathUtils.lerp(Math.PI, Math.PI * 2.0, t); // turn back
          groupRef.current.rotation.z = 0.0;
          groupRef.current.rotation.x = -0.04;
        }

        // Keep scale
        groupRef.current.scale.set(s, s, s);
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

  useFrame((state, delta) => {
    // Animate smoke particles - more realistic and visible
    smokeRefs.current.forEach((m, i) => {
      if (!m) return;
      // Smoke rises and disperses naturally
      m.position.y += 0.02 + (i % 4) * 0.005;
      m.position.x += (Math.sin(state.clock.elapsedTime * 0.3 + i * 0.5) * 0.004);
      // Fade out gradually with variation
      m.material.opacity -= 0.005 + (i % 7) * 0.0008;
      // Rotate for natural dispersion
      m.rotation.z += 0.005 * (i % 5 + 1);
      // Scale up as it disperses (more visible)
      m.scale.x += 0.002;
      m.scale.y += 0.002;
      
      // Reset when faded - create continuous trail
      if (m.material.opacity <= 0) {
        m.position.y = smokeMeta[i].offsetY;
        m.position.x = smokeMeta[i].offsetX;
        m.material.opacity = smokeMeta[i].initialOpacity;
        m.scale.set(1, 1, 1);
        m.rotation.z = Math.random() * Math.PI * 2;
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
        <Canvas>
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
            className="text-5xl sm:text-6xl md:text-8xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-2xl"
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