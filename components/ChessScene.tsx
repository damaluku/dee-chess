"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ChessScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current!;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#1a1a1a");

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(ambientLight, directionalLight);

    // Board base
    const tileSize = 2;
    const boardSize = 8;

    // Loop to create 64 tiles
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const color = (row + col) % 2 === 0 ? "#ffffff" : "#000000";
        const tile = new THREE.Mesh(
          new THREE.PlaneGeometry(tileSize, tileSize),
          new THREE.MeshStandardMaterial({ color })
        );
        tile.rotation.x = -Math.PI / 2; // Make it lay flat
        tile.position.set(
          (col - boardSize / 2) * tileSize + tileSize / 2,
          0,
          (row - boardSize / 2) * tileSize + tileSize / 2
        );
        scene.add(tile);
      }
    }

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0" />;
}
