import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeDMedicalCanvas({ height = '220px', interactive = true }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 600;
    const heightPx = mount.clientHeight || 220;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060c1c, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 100);
    camera.position.set(0, 0, 18);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 1.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00f2fe, 3, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x3b82f6, 2.5, 50);
    pointLight2.position.set(-10, -10, -5);
    scene.add(pointLight2);

    // Group for DNA Double Helix
    const dnaGroup = new THREE.Group();
    scene.add(dnaGroup);

    // Materials
    const sphereMaterial1 = new THREE.MeshPhongMaterial({
      color: 0x06b6d4, // Cyan
      emissive: 0x0891b2,
      shininess: 90,
      specular: 0xffffff
    });

    const sphereMaterial2 = new THREE.MeshPhongMaterial({
      color: 0x3b82f6, // Medical Blue
      emissive: 0x2563eb,
      shininess: 90,
      specular: 0xffffff
    });

    const rungMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6
    });

    const sphereGeometry = new THREE.SphereGeometry(0.24, 16, 16);
    const rungGeometry = new THREE.CylinderGeometry(0.04, 0.04, 1, 8);

    // Build Double Helix
    const numPairs = 36;
    const radius = 2.4;
    const heightStep = 0.42;

    for (let i = 0; i < numPairs; i++) {
      const angle = (i * Math.PI) / 6;
      const y = (i - numPairs / 2) * heightStep;

      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;

      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      // Strand 1 node
      const node1 = new THREE.Mesh(sphereGeometry, sphereMaterial1);
      node1.position.set(x1, y, z1);
      dnaGroup.add(node1);

      // Strand 2 node
      const node2 = new THREE.Mesh(sphereGeometry, sphereMaterial2);
      node2.position.set(x2, y, z2);
      dnaGroup.add(node2);

      // Connecting nucleotide base pair bridge
      const rung = new THREE.Mesh(rungGeometry, rungMaterial);
      rung.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);

      // Orient cylinder between node1 and node2
      rung.scale.set(1, radius * 2, 1);
      rung.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(x1 - x2, 0, z1 - z2).normalize()
      );
      dnaGroup.add(rung);
    }

    // Add Glowing Particle Field
    const particleCount = 180;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 26;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 16;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.12,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const particlePoints = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particlePoints);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = mount.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / heightPx - 0.5) * 2;
      targetRotationY = mouseX * 0.8;
      targetRotationX = mouseY * 0.4;
    };

    mount.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous slow DNA rotation
      dnaGroup.rotation.y = elapsedTime * 0.6 + targetRotationY;
      dnaGroup.rotation.z = Math.sin(elapsedTime * 0.3) * 0.15;
      dnaGroup.rotation.x = targetRotationX;

      // Gently float particles
      particlePoints.rotation.y = elapsedTime * 0.08;
      particlePoints.rotation.x = Math.sin(elapsedTime * 0.05) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!mount) return;
      const newWidth = mount.clientWidth;
      const newHeight = mount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      mount.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sphereGeometry.dispose();
      rungGeometry.dispose();
      particleGeometry.dispose();
    };
  }, [interactive]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-950 via-[#061126] to-slate-900 shadow-2xl backdrop-blur-xl">
      <div
        ref={mountRef}
        style={{ height }}
        className="w-full cursor-grab active:cursor-grabbing"
      />
      {/* 3D Environment Badge Overlay */}
      <div className="pointer-events-none absolute bottom-3 left-4 flex items-center space-x-2 rounded-full border border-cyan-500/30 bg-slate-900/80 px-3 py-1 text-xs text-cyan-300 backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
        </span>
        <span className="font-mono text-[11px] tracking-wider uppercase">Interactive 3D Genomic Visualizer</span>
      </div>

      <div className="pointer-events-none absolute top-3 right-4 rounded-lg border border-slate-700/60 bg-slate-900/70 px-2.5 py-1 text-[11px] font-mono text-slate-400">
        Three.js WebGL • 60 FPS
      </div>
    </div>
  );
}
