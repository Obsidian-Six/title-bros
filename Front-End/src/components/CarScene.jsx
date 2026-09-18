"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";

import { Canvas, useFrame } from "@react-three/fiber";

import {
  Float,
  PerspectiveCamera,
  Text,
  useGLTF,
  useTexture,
} from "@react-three/drei";

import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// =====================================================
// TITLE BROS CAR LOGOS
// =====================================================

function CarLogo({ position, rotation = [0, 0, 0], scale = [0.6, 0.32, 1] }) {
  const texture = useTexture("/images/title-bros-logo-car-decal.png");

  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={scale}
      renderOrder={100}
    >
      <planeGeometry args={[1, 1]} />

      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.01}
        depthTest={true}
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

// =====================================================
// CAR
// =====================================================

function Car({ progressRef, mouseRef }) {
  const group = useRef();

  const { scene } = useGLTF("/models/car.glb");

  // Clone GLTF scene
  const clonedScene = useMemo(() => {
    return SkeletonUtils.clone(scene);
  }, [scene]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  useFrame((state, delta) => {
    if (!group.current) return;

    const p = progressRef.current;
    const mouseX = mouseRef.current.x;
    const mouseY = mouseRef.current.y;

    const isMobile = window.innerWidth < 768;

    // --------------------------------
    // CAR TRANSFORMATION
    // --------------------------------

    const carProgress = THREE.MathUtils.clamp(p / 0.65, 0, 1);

    // --------------------------------
    // START
    // --------------------------------

    const carStartX = isMobile ? 0.65 : 1.35;

    const carStartY = isMobile ? -0.35 : -0.15;

    // --------------------------------
    // DOLLAR POSITION
    // --------------------------------

    const dollarX = isMobile ? 0.5 : 1.65;

    const dollarY = isMobile ? 0 : 0.65;

    // --------------------------------
    // POSITION
    // --------------------------------

    const targetX = THREE.MathUtils.lerp(carStartX, dollarX, carProgress);

    const targetY = THREE.MathUtils.lerp(carStartY, dollarY, carProgress);

    const mouseTargetX = targetX + mouseX * 0.28;
    const mouseTargetY = targetY + mouseY * 0.16;

    group.current.position.x = THREE.MathUtils.damp(
      group.current.position.x,
      mouseTargetX,
      6,
      delta,
    );

    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      mouseTargetY,
      6,
      delta,
    );

    // --------------------------------
    // SCALE
    // --------------------------------

    const targetScale = THREE.MathUtils.lerp(
      isMobile ? 0.5 : 1.15,
      0,
      carProgress,
    );

    group.current.scale.setScalar(
      THREE.MathUtils.damp(group.current.scale.x, targetScale, 7, delta),
    );

    // --------------------------------
    // ROTATION
    // --------------------------------
    const targetRotationY = carProgress * Math.PI * 2;

    const mouseRotationY = targetRotationY + mouseX * 0.22;

    const mouseRotationX = mouseY * 0.08;

    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      mouseRotationY,
      8,
      delta,
    );

    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      mouseRotationX,
      8,
      delta,
    );
  });

  return (
    <group ref={group}>
      <primitive object={clonedScene} />

      {/* ================================================= */}
      {/* 1. FRONT MERCEDES STAR */}
      {/* ================================================= */}

      <CarLogo
        position={[0, 0.5, 2.32]}
        rotation={[0, 0, 0]}
        scale={[0.6, 0.32, 1]}
      />

      {/* ================================================= */}
      {/* 2. REAR MERCEDES STAR */}
      {/* ================================================= */}

      <CarLogo
        position={[0, 0.5, -2.32]}
        rotation={[0, Math.PI, 0]}
        scale={[0.6, 0.32, 1]}
      />

      {/* ================================================= */}
      {/* 3. DECK / TRUNK STAR */}
      {/* ================================================= */}

      <CarLogo
        position={[0, 0.75, -2.25]}
        rotation={[0, Math.PI, 0]}
        scale={[0.25, 0.2, 1]}
      />
    </group>
  );
}

// =====================================================
// DOLLAR
// =====================================================
function Dollar({ progressRef, mouseRef }) {
  const group = useRef();

  const { scene } = useGLTF("/models/dollar.glb");

  const clonedScene = useMemo(() => {
    return SkeletonUtils.clone(scene);
  }, [scene]);

useEffect(() => {
  clonedScene.traverse((child) => {
    if (!child.isMesh) return;

    child.castShadow = true;
    child.receiveShadow = true;

    if (Array.isArray(child.material)) {
      child.material = child.material.map((material) => {
        const newMaterial = material.clone();
        newMaterial.color.set("#ff0000");
        return newMaterial;
      });
    } else if (child.material) {
      child.material = child.material.clone();
      child.material.color.set("#48fd96");
    }
  });
}, [clonedScene]);

  useFrame((state, delta) => {
    if (!group.current) return;

    const mouseX = mouseRef.current.x;
    const mouseY = mouseRef.current.y;

    const p = progressRef.current;

    const isMobile = window.innerWidth < 768;

    // --------------------------------
    // POSITION
    // --------------------------------

    const targetX = isMobile ? 0.5 : 1.65;
    const targetY = isMobile ? 0 : 0.65;

    // --------------------------------
    // PROGRESS
    // --------------------------------

    const dollarProgress = THREE.MathUtils.clamp((p - 0.45) / 0.35, 0, 1);

    // --------------------------------
    // SCALE
    // --------------------------------

    const targetScale = THREE.MathUtils.lerp(
      0.01,
      isMobile ? 0.5 : 1.15,
      dollarProgress,
    );

    // --------------------------------
    // POSITION
    // --------------------------------

    group.current.position.x = THREE.MathUtils.damp(
      group.current.position.x,
      targetX + mouseX * 0.1,
      6,
      delta,
    );

    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      targetY + mouseY * 0.07,
      6,
      delta,
    );

    // --------------------------------
    // SCALE
    // --------------------------------

    group.current.scale.setScalar(
      THREE.MathUtils.damp(group.current.scale.x, targetScale, 7, delta),
    );

    // --------------------------------
    // ROTATION
    // --------------------------------

    const targetRotationY = dollarProgress * Math.PI * 2;

    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      targetRotationY + mouseX * 0.2,
      6,
      delta,
    );

    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      mouseY * 0.08,
      6,
      delta,
    );
  });

  return (
    <group ref={group}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload("/models/dollar.glb");

// =====================================================
// SCENE
// =====================================================

function SceneContent({ progressRef, mouseRef }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.5, 6]} fov={42} />

      <ambientLight intensity={1.8} />

      <directionalLight position={[4, 5, 4]} intensity={3.4} />

      <directionalLight position={[-4, 1, 2]} intensity={1.2} />

      <Float speed={0.8} rotationIntensity={0.02} floatIntensity={0.08}>
        <Car progressRef={progressRef} mouseRef={mouseRef} />
      </Float>

      <Dollar progressRef={progressRef} mouseRef={mouseRef} />
    </>
  );
}

// =====================================================
// MAIN
// =====================================================

export default function CarScene() {
  const progressRef = useRef(0);
  const mouseRef = useRef({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const hero = document.querySelector("[data-car-hero]");

    if (!hero) return;

    let trigger;

    // IMPORTANT:
    // ScrollTrigger is ONLY calculating scroll progress.
    // It is NOT pinning/modifying the React DOM.

    trigger = ScrollTrigger.create({
      trigger: hero,

      start: "top top",

      end: "bottom bottom",

      scrub: true,

      pin: false,

      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });
    const handleMouseMove = (event) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;

      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);

      if (trigger) {
        trigger.kill();
        trigger = null;
      }

      progressRef.current = 0;
    };

    // return () => {
    //   if (trigger) {
    //     trigger.kill();
    //     trigger = null;
    //   }

    //   progressRef.current = 0;
    // };
  }, []);

  return (
    <div
      className="
        absolute 
        inset-0
        z-10
        pointer-events-none
      "
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
        }}
      >
        <Suspense fallback={null}>
          <SceneContent progressRef={progressRef} mouseRef={mouseRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
