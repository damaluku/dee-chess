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

    // Creatinf piece
    const createPiece = (
      type: "pawn" | "rook",
      color: "white" | "black",
      x: number,
      z: number
    ) => {
      let mesh: THREE.Mesh | null = null;

      const material = new THREE.MeshStandardMaterial({
        color: color === "white" ? "#f0f0f0" : "#202020",
      });

      if (type === "pawn") {
        const geometry = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 32);
        mesh = new THREE.Mesh(geometry, material);
      } else if (type === "rook") {
        const geometry = new THREE.ConeGeometry(0.6, 1.5, 16);
        mesh = new THREE.Mesh(geometry, material);
      }

      if (mesh) {
        mesh.castShadow = true;
        mesh.position.set(x, 0.75, z);
        scene.add(mesh);
      }
    };

    // Add white pawns
    for (let col = 0; col < 8; col++) {
      const x = (col - 4) * tileSize + tileSize / 2;
      const z = -3 * tileSize + tileSize / 2;
      createPiece("pawn", "white", x, z);
    }

    // Add black pawns
    for (let col = 0; col < 8; col++) {
      const x = (col - 4) * tileSize + tileSize / 2;
      const z = 2 * tileSize + tileSize / 2;
      createPiece("pawn", "black", x, z);
    }

    // Add rooks
    createPiece(
      "rook",
      "white",
      -4 * tileSize + tileSize / 2,
      -4 * tileSize + tileSize / 2
    );
    createPiece(
      "rook",
      "white",
      3 * tileSize + tileSize / 2,
      -4 * tileSize + tileSize / 2
    );
    createPiece(
      "rook",
      "black",
      -4 * tileSize + tileSize / 2,
      3 * tileSize + tileSize / 2
    );
    createPiece(
      "rook",
      "black",
      3 * tileSize + tileSize / 2,
      3 * tileSize + tileSize / 2
    );

    // Raycaster and mouse event
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let selectedPiece: THREE.Object3D | null = null;

    const onMouseClick = (event: MouseEvent) => {
      // Convert mouse coordinates to normalized device coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const firstHit = intersects[0].object;

        // Check if it's a piece (you can later tag pieces with metadata)
        if (
          (firstHit as THREE.Mesh).geometry instanceof THREE.CylinderGeometry ||
          (firstHit as THREE.Mesh).geometry instanceof THREE.ConeGeometry
        ) {
          if (selectedPiece) {
            // Reset previously selected piece color
            (
              (selectedPiece as THREE.Mesh)
                .material as THREE.MeshStandardMaterial
            ).emissive?.setHex(0x000000);
          }

          if (firstHit instanceof THREE.Mesh) {
            if (selectedPiece) {
              // Reset previously selected piece color
              (
                (selectedPiece as THREE.Mesh)
                  .material as THREE.MeshStandardMaterial
              ).emissive?.setHex(0x000000);
            }

            selectedPiece = firstHit;
            if (selectedPiece instanceof THREE.Mesh) {
              (selectedPiece.material as THREE.MeshStandardMaterial).emissive =
                new THREE.Color(0x3333ff); // blue glow
            }
          }
        }
      }
    };

    window.addEventListener("click", onMouseClick);

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
      window.removeEventListener("click", onMouseClick);
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0" />;
}
