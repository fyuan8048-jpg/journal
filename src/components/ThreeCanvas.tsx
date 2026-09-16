import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeCanvasProps {
  accentColorHex?: string;
  is3dEnabled?: boolean;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  accentColorHex = '#00ff88',
  is3dEnabled = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    if (!containerRef.current || !is3dEnabled) return;

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent to blend over artwork
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const accentColor = new THREE.Color(accentColorHex);

    // 1. Floating 3D Artwork Embers & Mystic Doom Sparks
    // (Cinematic embers drifting forward through depth from the artwork)
    const emberCount = 350;
    const emberGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(emberCount * 3);
    const colors = new Float32Array(emberCount * 3);
    const velocities = new Float32Array(emberCount * 3);

    const baseColor = new THREE.Color(accentColorHex);
    const goldColor = new THREE.Color('#fbbf24');

    for (let i = 0; i < emberCount; i++) {
      // Spread across camera view plane
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 35;

      // Velocities: drifting upward and toward the viewer
      velocities[i * 3] = (Math.random() - 0.5) * 0.04;
      velocities[i * 3 + 1] = Math.random() * 0.08 + 0.02; // Upward drift
      velocities[i * 3 + 2] = Math.random() * 0.05 + 0.01; // Forward drift

      // Color variation: Emerald green & glowing gold sparks
      const isGold = Math.random() > 0.8;
      const emberColor = isGold ? goldColor : baseColor;
      colors[i * 3] = emberColor.r;
      colors[i * 3 + 1] = emberColor.g;
      colors[i * 3 + 2] = emberColor.b;
    }

    emberGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    emberGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Glow sprite texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.2, 'rgba(0,255,136,0.9)');
      grad.addColorStop(0.5, 'rgba(0,255,136,0.3)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const emberTexture = new THREE.CanvasTexture(canvas);

    const emberMaterial = new THREE.PointsMaterial({
      size: 1.6,
      vertexColors: true,
      map: emberTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const embers = new THREE.Points(emberGeometry, emberMaterial);
    scene.add(embers);

    // 2. Interactive 3D Lighting (Reacts to cursor movement over artwork)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const cursorLight = new THREE.PointLight(accentColor, 4, 50);
    cursorLight.position.set(0, 0, 15);
    scene.add(cursorLight);

    // 3. Mouse Parallax
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseRef.current.targetX = (e.clientX / innerWidth - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize
    const handleResize = () => {
      if (!container) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Parallax camera movement over artwork
      camera.position.x = mouseRef.current.x * 4;
      camera.position.y = -mouseRef.current.y * 3;
      camera.lookAt(0, 0, 0);

      // Cursor light movement
      cursorLight.position.x = mouseRef.current.x * 20;
      cursorLight.position.y = -mouseRef.current.y * 15;
      cursorLight.intensity = 3.5 + Math.sin(time * 2) * 0.8;

      // Animate embers floating through space
      const posAttr = emberGeometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < emberCount; i++) {
        posArray[i * 3] += velocities[i * 3] + Math.sin(time + i) * 0.01;
        posArray[i * 3 + 1] += velocities[i * 3 + 1];
        posArray[i * 3 + 2] += velocities[i * 3 + 2];

        // Wrap around bounds
        if (posArray[i * 3 + 1] > 25) posArray[i * 3 + 1] = -25;
        if (posArray[i * 3 + 2] > 20) posArray[i * 3 + 2] = -20;
        if (posArray[i * 3] > 32) posArray[i * 3] = -32;
        if (posArray[i * 3] < -32) posArray[i * 3] = 32;
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      emberGeometry.dispose();
      emberMaterial.dispose();
      emberTexture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [accentColorHex, is3dEnabled]);

  if (!is3dEnabled) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.9 }}
    />
  );
};
