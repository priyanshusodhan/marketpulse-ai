"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function Globe3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const loadGlobe = async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(300, 300);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.innerHTML = "";
      container.appendChild(renderer.domElement);

      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: 0xf5c518,
        transparent: true,
        opacity: 0.15,
        wireframe: true,
      });
      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);

      const light = new THREE.PointLight(0xf5c518, 1, 100);
      light.position.set(5, 5, 5);
      scene.add(light);
      scene.add(new THREE.AmbientLight(0x404040));

      camera.position.z = 2.5;
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;

      const animate = () => {
        requestAnimationFrame(animate);
        sphere.rotation.y += 0.002;
        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        renderer.dispose();
        geometry.dispose();
        material.dispose();
      };
    };

    loadGlobe();
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="w-[300px] h-[300px] rounded-full overflow-hidden opacity-40"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 0.4, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.8 }}
    />
  );
}
