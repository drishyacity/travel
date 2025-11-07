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
function AnimatedCamera() {
  const { camera } = useThree();

  useEffect(() => {
    // Camera starts close
    camera.position.set(0, 0, 5);

    // Camera stays at same distance - no zoom
    const cam1 = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: '+=100vh',
      scrub: 0.5,
      onUpdate: (self) => {
        const p = self.progress;
        // Slight zoom to follow plane forward movement
        camera.position.z = 5 + p * 3;
      }
    });

    return () => {
      cam1.kill();
    };
  }, [camera]);

  return null;
}

function Airplane() {
  const groupRef = useRef();
  const smokeGroupRef = useRef();
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

    // Animation: Just move to left corner, NO size change
    const st1 = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: '+=100vh',
      scrub: 0.5,
      onUpdate: (self) => {
        const p = self.progress;
        if (groupRef.current) {
          // Move forward (negative Z)
          groupRef.current.position.z = -p * 10;
          // Move to left side corner (negative X for left)
          groupRef.current.position.x = -p * 5;
          groupRef.current.position.y = p * 2;
          // Slight tilt as it moves
          groupRef.current.rotation.z = p * 0.3;
          // Size stays the same - NO SHRINKING
          groupRef.current.scale.set(3, 3, 3);
        }
      }
    });

    return () => {
      st1.kill();
    };
  }, []);

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
      <group ref={smokeGroupRef} position={[0, -0.3, -0.7]}>
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
      className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-500"
    >
      {/* 3D Canvas with Airplane */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <AnimatedCamera />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#60a5fa" />
          <Suspense fallback={null}>
            <Airplane />
          </Suspense>
        </Canvas>
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 z-10" />

      {/* Hero Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-4xl">
          <h1
            ref={titleRef}
            className="text-6xl md:text-8xl font-bold text-white mb-6 drop-shadow-2xl"
          >
            Explore The World
          </h1>
          <p
            ref={subtitleRef}
            className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-lg"
          >
            Discover breathtaking destinations and create unforgettable memories with our curated travel experiences
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={scrollToDestinations}
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 shadow-xl transition-transform hover:scale-105"
            >
              <Plane className="mr-2 h-5 w-5" />
              Explore Destinations
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6 shadow-xl transition-transform hover:scale-105"
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