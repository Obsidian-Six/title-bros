/*
 * 3D MODEL ATTRIBUTION
 *
 * "2010 Mercedes SLS AMG"
 * https://skfb.ly/pMsSH
 *
 * by Dave Love SketchFab
 *
 * Licensed under Creative Commons Attribution 4.0 International (CC BY 4.0)
 * https://creativecommons.org/licenses/by/4.0/
 */

// "use client";

// import { Suspense, useEffect, useMemo, useRef } from "react";

// import { Canvas, useFrame } from "@react-three/fiber";

// import {
//   Float,
//   PerspectiveCamera,
//   Text,
//   useGLTF,
//   useTexture,
// } from "@react-three/drei";

// import * as THREE from "three";
// import { SkeletonUtils } from "three-stdlib";

// import gsap from "gsap";
// import ScrollTrigger from "gsap/dist/ScrollTrigger";

// gsap.registerPlugin(ScrollTrigger);

// // =====================================================
// // TITLE BROS CAR LOGOS
// // =====================================================

// function CarLogo({ position, rotation = [0, 0, 0], scale = [0.6, 0.32, 1] }) {
//   const texture = useTexture("/images/title-bros-logo-car-decal.png");

//   return (
//     <mesh
//       position={position}
//       rotation={rotation}
//       scale={scale}
//       renderOrder={100}
//     >
//       <planeGeometry args={[1, 1]} />

//       <meshBasicMaterial
//         map={texture}
//         transparent
//         alphaTest={0.01}
//         depthTest={true}
//         depthWrite={false}
//         side={THREE.DoubleSide}
//         toneMapped={false}
//       />
//     </mesh>
//   );
// }

// // =====================================================
// // CAR
// // =====================================================

// function Car({ progressRef, mouseRef }) {
//   const group = useRef();

//   const { scene } = useGLTF("/models/car.glb");

//   // Clone GLTF scene
//   const clonedScene = useMemo(() => {
//     return SkeletonUtils.clone(scene);
//   }, [scene]);

//   useEffect(() => {
//     clonedScene.traverse((child) => {
//       if (child.isMesh) {
//         child.castShadow = true;
//         child.receiveShadow = true;
//       }
//     });
//   }, [clonedScene]);

//   useFrame((state, delta) => {
//     if (!group.current) return;

//     const p = progressRef.current;
//     const mouseX = mouseRef.current.x;
//     const mouseY = mouseRef.current.y;

//     const isMobile = window.innerWidth < 768;

//     // --------------------------------
//     // CAR TRANSFORMATION
//     // --------------------------------

//     const carProgress = THREE.MathUtils.clamp(p / 0.65, 0, 1);

//     // --------------------------------
//     // START
//     // --------------------------------

//     const carStartX = isMobile ? 0.65 : 1.35;

//     const carStartY = isMobile ? -0.35 : -0.15;

//     // --------------------------------
//     // DOLLAR POSITION
//     // --------------------------------

//     const dollarX = isMobile ? 0.5 : 1.65;

//     const dollarY = isMobile ? 0 : 0.65;

//     // --------------------------------
//     // POSITION
//     // --------------------------------

//     const targetX = THREE.MathUtils.lerp(carStartX, dollarX, carProgress);

//     const targetY = THREE.MathUtils.lerp(carStartY, dollarY, carProgress);

//     const mouseTargetX = targetX + mouseX * 0.28;
//     const mouseTargetY = targetY + mouseY * 0.16;

//     group.current.position.x = THREE.MathUtils.damp(
//       group.current.position.x,
//       mouseTargetX,
//       6,
//       delta,
//     );

//     group.current.position.y = THREE.MathUtils.damp(
//       group.current.position.y,
//       mouseTargetY,
//       6,
//       delta,
//     );

//     // --------------------------------
//     // SCALE
//     // --------------------------------

//     const targetScale = THREE.MathUtils.lerp(
//       isMobile ? 0.5 : 1.15,
//       0,
//       carProgress,
//     );

//     group.current.scale.setScalar(
//       THREE.MathUtils.damp(group.current.scale.x, targetScale, 7, delta),
//     );

//     // --------------------------------
//     // ROTATION
//     // --------------------------------
//     const targetRotationY = carProgress * Math.PI * 2;

//     const mouseRotationY = targetRotationY + mouseX * 0.22;

//     const mouseRotationX = mouseY * 0.08;

//     group.current.rotation.y = THREE.MathUtils.damp(
//       group.current.rotation.y,
//       mouseRotationY,
//       8,
//       delta,
//     );

//     group.current.rotation.x = THREE.MathUtils.damp(
//       group.current.rotation.x,
//       mouseRotationX,
//       8,
//       delta,
//     );
//   });

//   return (
//     <group ref={group}>
//       <primitive object={clonedScene} />

//       {/* ================================================= */}
//       {/* 1. FRONT MERCEDES STAR */}
//       {/* ================================================= */}

//       <CarLogo
//         position={[0, 0.5, 2.32]}
//         rotation={[0, 0, 0]}
//         scale={[0.6, 0.32, 1]}
//       />

//       {/* ================================================= */}
//       {/* 2. REAR MERCEDES STAR */}
//       {/* ================================================= */}

//       <CarLogo
//         position={[0, 0.5, -2.32]}
//         rotation={[0, Math.PI, 0]}
//         scale={[0.6, 0.32, 1]}
//       />

//       {/* ================================================= */}
//       {/* 3. DECK / TRUNK STAR */}
//       {/* ================================================= */}

//       <CarLogo
//         position={[0, 0.75, -2.25]}
//         rotation={[0, Math.PI, 0]}
//         scale={[0.25, 0.2, 1]}
//       />
//     </group>
//   );
// }

// // =====================================================
// // DOLLAR
// // =====================================================
// function Dollar({ progressRef, mouseRef }) {
//   const group = useRef();

//   const { scene } = useGLTF("/models/dollar.glb");

//   const clonedScene = useMemo(() => {
//     return SkeletonUtils.clone(scene);
//   }, [scene]);

// useEffect(() => {
//   clonedScene.traverse((child) => {
//     if (!child.isMesh) return;

//     child.castShadow = true;
//     child.receiveShadow = true;

//     if (Array.isArray(child.material)) {
//       child.material = child.material.map((material) => {
//         const newMaterial = material.clone();
//         newMaterial.color.set("#ff0000");
//         return newMaterial;
//       });
//     } else if (child.material) {
//       child.material = child.material.clone();
//       child.material.color.set("#48fd96");
//     }
//   });
// }, [clonedScene]);

//   useFrame((state, delta) => {
//     if (!group.current) return;

//     const mouseX = mouseRef.current.x;
//     const mouseY = mouseRef.current.y;

//     const p = progressRef.current;

//     const isMobile = window.innerWidth < 768;

//     // --------------------------------
//     // POSITION
//     // --------------------------------

//     const targetX = isMobile ? 0.5 : 1.65;
//     const targetY = isMobile ? 0 : 0.65;

//     // --------------------------------
//     // PROGRESS
//     // --------------------------------

//     const dollarProgress = THREE.MathUtils.clamp((p - 0.45) / 0.35, 0, 1);

//     // --------------------------------
//     // SCALE
//     // --------------------------------

//     const targetScale = THREE.MathUtils.lerp(
//       0.01,
//       isMobile ? 0.5 : 1.15,
//       dollarProgress,
//     );

//     // --------------------------------
//     // POSITION
//     // --------------------------------

//     group.current.position.x = THREE.MathUtils.damp(
//       group.current.position.x,
//       targetX + mouseX * 0.1,
//       6,
//       delta,
//     );

//     group.current.position.y = THREE.MathUtils.damp(
//       group.current.position.y,
//       targetY + mouseY * 0.07,
//       6,
//       delta,
//     );

//     // --------------------------------
//     // SCALE
//     // --------------------------------

//     group.current.scale.setScalar(
//       THREE.MathUtils.damp(group.current.scale.x, targetScale, 7, delta),
//     );

//     // --------------------------------
//     // ROTATION
//     // --------------------------------

//     const targetRotationY = dollarProgress * Math.PI * 2;

//     group.current.rotation.y = THREE.MathUtils.damp(
//       group.current.rotation.y,
//       targetRotationY + mouseX * 0.2,
//       6,
//       delta,
//     );

//     group.current.rotation.x = THREE.MathUtils.damp(
//       group.current.rotation.x,
//       mouseY * 0.08,
//       6,
//       delta,
//     );
//   });

//   return (
//     <group ref={group}>
//       <primitive object={clonedScene} />
//     </group>
//   );
// }

// useGLTF.preload("/models/dollar.glb");

// // =====================================================
// // SCENE
// // =====================================================

// function SceneContent({ progressRef, mouseRef }) {
//   return (
//     <>
//       <PerspectiveCamera makeDefault position={[0, 0.5, 6]} fov={42} />

//       <ambientLight intensity={1.8} />

//       <directionalLight position={[4, 5, 4]} intensity={3.4} />

//       <directionalLight position={[-4, 1, 2]} intensity={1.2} />

//       <Float speed={0.8} rotationIntensity={0.02} floatIntensity={0.08}>
//         <Car progressRef={progressRef} mouseRef={mouseRef} />
//       </Float>

//       <Dollar progressRef={progressRef} mouseRef={mouseRef} />
//     </>
//   );
// }

// // =====================================================
// // MAIN
// // =====================================================

// export default function CarScene() {
//   const progressRef = useRef(0);
//   const mouseRef = useRef({
//     x: 0,
//     y: 0,
//   });

//   useEffect(() => {
//     const hero = document.querySelector("[data-car-hero]");

//     if (!hero) return;

//     let trigger;

//     // IMPORTANT:
//     // ScrollTrigger is ONLY calculating scroll progress.
//     // It is NOT pinning/modifying the React DOM.

//     trigger = ScrollTrigger.create({
//       trigger: hero,

//       start: "top top",

//       end: "bottom bottom",

//       scrub: true,

//       pin: false,

//       onUpdate: (self) => {
//         progressRef.current = self.progress;
//       },
//     });
//     const handleMouseMove = (event) => {
//       mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;

//       mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
//     };

//     window.addEventListener("mousemove", handleMouseMove);

//     return () => {
//       window.removeEventListener("mousemove", handleMouseMove);

//       if (trigger) {
//         trigger.kill();
//         trigger = null;
//       }

//       progressRef.current = 0;
//     };

//     // return () => {
//     //   if (trigger) {
//     //     trigger.kill();
//     //     trigger = null;
//     //   }

//     //   progressRef.current = 0;
//     // };
//   }, []);

//   return (
//     <div
//       className="
//         absolute 
//         inset-0
//         z-10
//         pointer-events-none
//       "
//     >
//       <Canvas
//         dpr={[1, 1.5]}
//         gl={{
//           antialias: true,
//           alpha: true,
//         }}
//       >
//         <Suspense fallback={null}>
//           <SceneContent progressRef={progressRef} mouseRef={mouseRef} />
//         </Suspense>
//       </Canvas>
//     </div>
//   );
// }

// "use client";

// import { Suspense, useEffect, useMemo, useRef } from "react";

// import { Canvas, useFrame } from "@react-three/fiber";

// import {
//   Float,
//   PerspectiveCamera,
//   Text,
//   useGLTF,
//   useTexture,
// } from "@react-three/drei";

// import * as THREE from "three";
// import { SkeletonUtils } from "three-stdlib";

// import gsap from "gsap";
// import ScrollTrigger from "gsap/dist/ScrollTrigger";

// gsap.registerPlugin(ScrollTrigger);

// // =====================================================
// // TITLE BROS CAR LOGOS
// // =====================================================

// function CarLogo({
//   position,
//   rotation = [0, 0, 0],
//   scale = [0.6, 0.32, 1],
//   src = "/images/TB FULL.png",
// }) {
//   const texture = useTexture(src);

//   return (
//     <mesh
//       position={position}
//       rotation={rotation}
//       scale={scale}
//       renderOrder={100}
//     >
//       <planeGeometry args={[1, 1]} />

//       <meshBasicMaterial
//         map={texture}
//         transparent
//         alphaTest={0.01}
//         depthTest={true}
//         depthWrite={false}
//         side={THREE.DoubleSide}
//         toneMapped={false}
//       />
//     </mesh>
//   );
// }

// // =====================================================
// // CAR
// // =====================================================

// function Car({ progressRef, mouseRef }) {
//   const group = useRef();

//   const { scene } = useGLTF("/models/car.glb");

//   // Clone GLTF scene
//   const clonedScene = useMemo(() => {
//     return SkeletonUtils.clone(scene);
//   }, [scene]);

//   useEffect(() => {
//     clonedScene.traverse((child) => {
//       if (child.isMesh) {
//         child.castShadow = true;
//         child.receiveShadow = true;
//       }
//     });
//   }, [clonedScene]);

//   useFrame((state, delta) => {
//     if (!group.current) return;

//     const p = progressRef.current;
//     const mouseX = mouseRef.current.x;
//     const mouseY = mouseRef.current.y;

//     const isMobile = window.innerWidth < 768;

//     // --------------------------------
//     // CAR TRANSFORMATION
//     // --------------------------------

//     const carProgress = THREE.MathUtils.clamp(p / 0.65, 0, 1);

//     // --------------------------------
//     // START
//     // --------------------------------

//     const carStartX = isMobile ? 0.65 : 1.35;

//     const carStartY = isMobile ? -0.35 : -0.15;

//     // --------------------------------
//     // DOLLAR POSITION
//     // --------------------------------

//     const dollarX = isMobile ? 0.5 : 1.65;

//     const dollarY = isMobile ? 0 : 0.65;

//     // --------------------------------
//     // POSITION
//     // --------------------------------

//     const targetX = THREE.MathUtils.lerp(carStartX, dollarX, carProgress);

//     const targetY = THREE.MathUtils.lerp(carStartY, dollarY, carProgress);

//     const mouseTargetX = targetX + mouseX * 0.28;
//     const mouseTargetY = targetY + mouseY * 0.16;

//     group.current.position.x = THREE.MathUtils.damp(
//       group.current.position.x,
//       mouseTargetX,
//       6,
//       delta,
//     );

//     group.current.position.y = THREE.MathUtils.damp(
//       group.current.position.y,
//       mouseTargetY,
//       6,
//       delta,
//     );

//     // --------------------------------
//     // SCALE
//     // --------------------------------

//     const targetScale = THREE.MathUtils.lerp(
//       isMobile ? 0.5 : 1.15,
//       0,
//       carProgress,
//     );

//     group.current.scale.setScalar(
//       THREE.MathUtils.damp(group.current.scale.x, targetScale, 7, delta),
//     );

//     // --------------------------------
//     // ROTATION
//     // --------------------------------
//     const targetRotationY = carProgress * Math.PI * 2;

//     const mouseRotationY = targetRotationY + mouseX * 0.22;

//     const mouseRotationX = mouseY * 0.08;

//     group.current.rotation.y = THREE.MathUtils.damp(
//       group.current.rotation.y,
//       mouseRotationY,
//       8,
//       delta,
//     );

//     group.current.rotation.x = THREE.MathUtils.damp(
//       group.current.rotation.x,
//       mouseRotationX,
//       8,
//       delta,
//     );
//   });

//   return (
//     <group ref={group}>
//       <primitive object={clonedScene} />

//       {/* ================================================= */}
//       {/* 1. FRONT MERCEDES STAR */}
//       {/* ================================================= */}

//       <CarLogo
//         position={[0, 0.5, 2.32]}
//         rotation={[0, 0, 0]}
//         scale={[0.6, 0.32, 1]}
//       />

//       {/* ================================================= */}
//       {/* 2. REAR MERCEDES STAR */}
//       {/* ================================================= */}

//       {/* <CarLogo
//         position={[0, 0.5, -2.32]}
//         rotation={[0, Math.PI, 0]}
//         scale={[0.6, 0.32, 1]}
//       /> */}

//       {/* ================================================= */}
//       {/* 3. DECK / TRUNK STAR */}
//       {/* ================================================= */}

//       <CarLogo
//         position={[0, 0.75, -2.25]}
//         rotation={[0, Math.PI, 0]}
//         scale={[0.25, 0.2, 1]}
//         src="/images/TB.png"
//       />
//     </group>
//   );
// }

// // =====================================================
// // DOLLAR
// // =====================================================
// function Dollar({ progressRef, mouseRef }) {
//   const group = useRef();

//   const { scene } = useGLTF("/models/dollar.glb");

//   const clonedScene = useMemo(() => {
//     return SkeletonUtils.clone(scene);
//   }, [scene]);

// useEffect(() => {
//   clonedScene.traverse((child) => {
//     if (!child.isMesh) return;

//     child.castShadow = true;
//     child.receiveShadow = true;

//     if (Array.isArray(child.material)) {
//       child.material = child.material.map((material) => {
//         const newMaterial = material.clone();
//         newMaterial.color.set("#ff0000");
//         return newMaterial;
//       });
//     } else if (child.material) {
//       child.material = child.material.clone();
//       child.material.color.set("#48fd96");
//     }
//   });
// }, [clonedScene]);

//   useFrame((state, delta) => {
//     if (!group.current) return;

//     const mouseX = mouseRef.current.x;
//     const mouseY = mouseRef.current.y;

//     const p = progressRef.current;

//     const isMobile = window.innerWidth < 768;

//     // --------------------------------
//     // POSITION
//     // --------------------------------

//     const targetX = isMobile ? 0.5 : 1.65;
//     const targetY = isMobile ? 0 : 0.65;

//     // --------------------------------
//     // PROGRESS
//     // --------------------------------

//     const dollarProgress = THREE.MathUtils.clamp((p - 0.45) / 0.35, 0, 1);

//     // --------------------------------
//     // SCALE
//     // --------------------------------

//     const targetScale = THREE.MathUtils.lerp(
//       0.01,
//       isMobile ? 0.5 : 1.15,
//       dollarProgress,
//     );

//     // --------------------------------
//     // POSITION
//     // --------------------------------

//     group.current.position.x = THREE.MathUtils.damp(
//       group.current.position.x,
//       targetX + mouseX * 0.1,
//       6,
//       delta,
//     );

//     group.current.position.y = THREE.MathUtils.damp(
//       group.current.position.y,
//       targetY + mouseY * 0.07,
//       6,
//       delta,
//     );

//     // --------------------------------
//     // SCALE
//     // --------------------------------

//     group.current.scale.setScalar(
//       THREE.MathUtils.damp(group.current.scale.x, targetScale, 7, delta),
//     );

//     // --------------------------------
//     // ROTATION
//     // --------------------------------

//     const targetRotationY = dollarProgress * Math.PI * 2;

//     group.current.rotation.y = THREE.MathUtils.damp(
//       group.current.rotation.y,
//       targetRotationY + mouseX * 0.2,
//       6,
//       delta,
//     );

//     group.current.rotation.x = THREE.MathUtils.damp(
//       group.current.rotation.x,
//       mouseY * 0.08,
//       6,
//       delta,
//     );
//   });

//   return (
//     <group ref={group}>
//       <primitive object={clonedScene} />
//     </group>
//   );
// }

// useGLTF.preload("/models/dollar.glb");

// // =====================================================
// // SCENE
// // =====================================================

// function SceneContent({ progressRef, mouseRef }) {
//   return (
//     <>
//       <PerspectiveCamera makeDefault position={[0, 0.5, 6]} fov={42} />

//       <ambientLight intensity={1.8} />

//       <directionalLight position={[4, 5, 4]} intensity={3.4} />

//       <directionalLight position={[-4, 1, 2]} intensity={1.2} />

//       <Float speed={0.8} rotationIntensity={0.02} floatIntensity={0.08}>
//         <Car progressRef={progressRef} mouseRef={mouseRef} />
//       </Float>

//       <Dollar progressRef={progressRef} mouseRef={mouseRef} />
//     </>
//   );
// }

// // =====================================================
// // MAIN
// // =====================================================

// export default function CarScene() {
//   const progressRef = useRef(0);
//   const mouseRef = useRef({
//     x: 0,
//     y: 0,
//   });

//   useEffect(() => {
//     const hero = document.querySelector("[data-car-hero]");

//     if (!hero) return;

//     let trigger;

//     // IMPORTANT:
//     // ScrollTrigger is ONLY calculating scroll progress.
//     // It is NOT pinning/modifying the React DOM.

//     trigger = ScrollTrigger.create({
//       trigger: hero,

//       start: "top top",

//       end: "bottom bottom",

//       scrub: true,

//       pin: false,

//       onUpdate: (self) => {
//         progressRef.current = self.progress;
//       },
//     });
//     const handleMouseMove = (event) => {
//       mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;

//       mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
//     };

//     window.addEventListener("mousemove", handleMouseMove);

//     return () => {
//       window.removeEventListener("mousemove", handleMouseMove);

//       if (trigger) {
//         trigger.kill();
//         trigger = null;
//       }

//       progressRef.current = 0;
//     };

//     // return () => {
//     //   if (trigger) {
//     //     trigger.kill();
//     //     trigger = null;
//     //   }

//     //   progressRef.current = 0;
//     // };
//   }, []);

//   return (
//     <div
//       className="
//         absolute 
//         inset-0
//         z-10
//         pointer-events-none
//       "
//     >
//       <Canvas
//         dpr={[1, 1.5]}
//         gl={{
//           antialias: true,
//           alpha: true,
//         }}
//       >
//         <Suspense fallback={null}>
//           <SceneContent progressRef={progressRef} mouseRef={mouseRef} />
//         </Suspense>
//       </Canvas>
//     </div>
//   );
// }


// "use client";

// import { Suspense, useEffect, useMemo, useRef } from "react";

// import { Canvas, useFrame } from "@react-three/fiber";

// import {
//   Float,
//   PerspectiveCamera,
//   Text,
//   useGLTF,
//   useTexture,
// } from "@react-three/drei";

// import * as THREE from "three";
// import { SkeletonUtils } from "three-stdlib";

// import gsap from "gsap";
// import ScrollTrigger from "gsap/dist/ScrollTrigger";

// gsap.registerPlugin(ScrollTrigger);

// // =====================================================
// // TITLE BROS CAR LOGOS
// // =====================================================

// function CarLogo({
//   position,
//   rotation = [0, 0, 0],
//   scale = [0.6, 0.32, 1],
//   src = "/images/TB FULL.png",
// }) {
//   const texture = useTexture(src);

//   return (
//     <mesh
//       position={position}
//       rotation={rotation}
//       scale={scale}
//       renderOrder={100}
//     >
//       <planeGeometry args={[1, 1]} />

//       <meshBasicMaterial
//         map={texture}
//         transparent
//         alphaTest={0.01}
//         depthTest={true}
//         depthWrite={false}
//         side={THREE.DoubleSide}
//         toneMapped={false}
//       />
//     </mesh>
//   );
// }

// // =====================================================
// // TITLE BROS BACK NUMBER PLATE
// // =====================================================


// // =====================================================
// // CAR
// // =====================================================

// function Car({ progressRef, mouseRef }) {
//   const group = useRef();

//   const { scene } = useGLTF("/models/car6.glb");

//   // Clone GLTF scene
//   const clonedScene = useMemo(() => {
//     return SkeletonUtils.clone(scene);
//   }, [scene]);

//   useEffect(() => {
//     clonedScene.traverse((child) => {
//       if (child.isMesh) {
//         child.castShadow = true;
//         child.receiveShadow = true;
//       }
//     });
//   }, [clonedScene]);

//   useFrame((state, delta) => {
//     if (!group.current) return;

//     const p = progressRef.current;

//     const mouseX = mouseRef.current.x;
//     const mouseY = mouseRef.current.y;

//     const isMobile = window.innerWidth < 768;

//     // --------------------------------
//     // CAR TRANSFORMATION
//     // --------------------------------

//     const carProgress = THREE.MathUtils.clamp(p / 0.65, 0, 1);

//     // --------------------------------
//     // START
//     // --------------------------------

//     const carStartX = isMobile ? 0.65 : 1.35;

//     const carStartY = isMobile ? -0.35 : -0.15;

//     // --------------------------------
//     // DOLLAR POSITION
//     // --------------------------------

//     const dollarX = isMobile ? 0.5 : 1.65;

//     const dollarY = isMobile ? 0 : 0.65;

//     // --------------------------------
//     // POSITION
//     // --------------------------------

//     const targetX = THREE.MathUtils.lerp(
//       carStartX,
//       dollarX,
//       carProgress
//     );

//     const targetY = THREE.MathUtils.lerp(
//       carStartY,
//       dollarY,
//       carProgress
//     );

//     const mouseTargetX = targetX + mouseX * 0.28;
//     const mouseTargetY = targetY + mouseY * 0.16;

//     group.current.position.x = THREE.MathUtils.damp(
//       group.current.position.x,
//       mouseTargetX,
//       6,
//       delta
//     );

//     group.current.position.y = THREE.MathUtils.damp(
//       group.current.position.y,
//       mouseTargetY,
//       6,
//       delta
//     );

//     // --------------------------------
//     // SCALE
//     // --------------------------------

//     const targetScale = THREE.MathUtils.lerp(
//       isMobile ? 0.5 : 1.15,
//       0,
//       carProgress
//     );

//     group.current.scale.setScalar(
//       THREE.MathUtils.damp(
//         group.current.scale.x,
//         targetScale,
//         7,
//         delta
//       )
//     );

//     // --------------------------------
//     // ROTATION
//     // --------------------------------

//     const targetRotationY = carProgress * Math.PI * 2;

//     const mouseRotationY =
//       targetRotationY + mouseX * 0.22;

//     const mouseRotationX = mouseY * 0.08;

//     group.current.rotation.y = THREE.MathUtils.damp(
//       group.current.rotation.y,
//       mouseRotationY,
//       8,
//       delta
//     );

//     group.current.rotation.x = THREE.MathUtils.damp(
//       group.current.rotation.x,
//       mouseRotationX,
//       8,
//       delta
//     );
//   });

//   return (
//     <group ref={group}>
//       <primitive object={clonedScene} />

//       {/* ================================================= */}
//       {/* 1. FRONT MERCEDES STAR */}
//       {/* ================================================= */}

//       <CarLogo
//         position={[0, 0.5, 2.32]}
//         rotation={[0, 0, 0]}
//         scale={[0.6, 0.32, 1]}
//       />

//       {/* ================================================= */}
//       {/* 2. REAR MERCEDES STAR */}
//       {/* ================================================= */}

//       {/*
//       <CarLogo
//         position={[0, 0.5, -2.32]}
//         rotation={[0, Math.PI, 0]}
//         scale={[0.6, 0.32, 1]}
//       />
//       */}

//       {/* ================================================= */}
//       {/* 3. EXISTING TB LOGO - KEPT */}
//       {/* ================================================= */}

//       <CarLogo
//         position={[0, 0.75, -2.25]}
//         rotation={[0, Math.PI, 0]}
//         scale={[0.25, 0.2, 1]}
//         src="/images/TB.png"
//       />

//       {/* ================================================= */}
//       {/* 4. TITLE BROS NUMBER PLATE */}
//       {/* ================================================= */}

//       {/* <TitleBrosPlate /> */}
//     </group>
//   );
// }

// // =====================================================
// // DOLLAR
// // =====================================================

// function Dollar({ progressRef, mouseRef }) {
//   const group = useRef();

//   const { scene } = useGLTF("/models/dollar.glb");

//   const clonedScene = useMemo(() => {
//     return SkeletonUtils.clone(scene);
//   }, [scene]);

//   useEffect(() => {
//     clonedScene.traverse((child) => {
//       if (!child.isMesh) return;

//       child.castShadow = true;
//       child.receiveShadow = true;

//       if (Array.isArray(child.material)) {
//         child.material = child.material.map((material) => {
//           const newMaterial = material.clone();

//           newMaterial.color.set("#ff0000");

//           return newMaterial;
//         });
//       } else if (child.material) {
//         child.material = child.material.clone();

//         child.material.color.set("#48fd96");
//       }
//     });
//   }, [clonedScene]);

//   useFrame((state, delta) => {
//     if (!group.current) return;

//     const mouseX = mouseRef.current.x;
//     const mouseY = mouseRef.current.y;

//     const p = progressRef.current;

//     const isMobile = window.innerWidth < 768;

//     // --------------------------------
//     // POSITION
//     // --------------------------------

//     const targetX = isMobile ? 0.5 : 1.65;

//     const targetY = isMobile ? 0 : 0.65;

//     // --------------------------------
//     // PROGRESS
//     // --------------------------------

//     const dollarProgress = THREE.MathUtils.clamp(
//       (p - 0.45) / 0.35,
//       0,
//       1
//     );

//     // --------------------------------
//     // SCALE
//     // --------------------------------

//     const targetScale = THREE.MathUtils.lerp(
//       0.01,
//       isMobile ? 0.5 : 1.15,
//       dollarProgress
//     );

//     // --------------------------------
//     // POSITION
//     // --------------------------------

//     group.current.position.x = THREE.MathUtils.damp(
//       group.current.position.x,
//       targetX + mouseX * 0.1,
//       6,
//       delta
//     );

//     group.current.position.y = THREE.MathUtils.damp(
//       group.current.position.y,
//       targetY + mouseY * 0.07,
//       6,
//       delta
//     );

//     // --------------------------------
//     // SCALE
//     // --------------------------------

//     group.current.scale.setScalar(
//       THREE.MathUtils.damp(
//         group.current.scale.x,
//         targetScale,
//         7,
//         delta
//       )
//     );

//     // --------------------------------
//     // ROTATION
//     // --------------------------------

//     const targetRotationY =
//       dollarProgress * Math.PI * 2;

//     group.current.rotation.y = THREE.MathUtils.damp(
//       group.current.rotation.y,
//       targetRotationY + mouseX * 0.2,
//       6,
//       delta
//     );

//     group.current.rotation.x = THREE.MathUtils.damp(
//       group.current.rotation.x,
//       mouseY * 0.08,
//       6,
//       delta
//     );
//   });

//   return (
//     <group ref={group}>
//       <primitive object={clonedScene} />
//     </group>
//   );
// }

// useGLTF.preload("/models/dollar.glb");

// // =====================================================
// // SCENE
// // =====================================================

// function SceneContent({ progressRef, mouseRef }) {
//   return (
//     <>
//       <PerspectiveCamera
//         makeDefault
//         position={[0, 0.5, 6]}
//         fov={42}
//       />

//       <ambientLight intensity={1.8} />

//       <directionalLight
//         position={[4, 5, 4]}
//         intensity={3.4}
//       />

//       <directionalLight
//         position={[-4, 1, 2]}
//         intensity={1.2}
//       />

//       <Float
//         speed={0.8}
//         rotationIntensity={0.02}
//         floatIntensity={0.08}
//       >
//         <Car
//           progressRef={progressRef}
//           mouseRef={mouseRef}
//         />
//       </Float>

//       <Dollar
//         progressRef={progressRef}
//         mouseRef={mouseRef}
//       />
//     </>
//   );
// }

// // =====================================================
// // MAIN
// // =====================================================

// export default function CarScene() {
//   const progressRef = useRef(0);

//   const mouseRef = useRef({
//     x: 0,
//     y: 0,
//   });

//   useEffect(() => {
//     const hero = document.querySelector(
//       "[data-car-hero]"
//     );

//     if (!hero) return;

//     let trigger;

//     // IMPORTANT:
//     // ScrollTrigger is ONLY calculating scroll progress.
//     // It is NOT pinning/modifying the React DOM.

//     trigger = ScrollTrigger.create({
//       trigger: hero,

//       start: "top top",

//       end: "bottom bottom",

//       scrub: true,

//       pin: false,

//       onUpdate: (self) => {
//         progressRef.current = self.progress;
//       },
//     });

//     const handleMouseMove = (event) => {
//       mouseRef.current.x =
//         (event.clientX / window.innerWidth) * 2 - 1;

//       mouseRef.current.y =
//         -(event.clientY / window.innerHeight) * 2 + 1;
//     };

//     window.addEventListener(
//       "mousemove",
//       handleMouseMove
//     );

//     return () => {
//       window.removeEventListener(
//         "mousemove",
//         handleMouseMove
//       );

//       if (trigger) {
//         trigger.kill();

//         trigger = null;
//       }

//       progressRef.current = 0;
//     };
//   }, []);

//   return (
//     <div
//       className="
//         absolute
//         inset-0
//         z-10
//         pointer-events-none
//       "
//     >
//       <Canvas
//         dpr={[1, 1.5]}
//         gl={{
//           antialias: true,
//           alpha: true,
//         }}
//       >
//         <Suspense fallback={null}>
//           <SceneContent
//             progressRef={progressRef}
//             mouseRef={mouseRef}
//           />
//         </Suspense>
//       </Canvas>
//     </div>
//   );
// }
"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";

import { Canvas, useFrame } from "@react-three/fiber";

import {
  Float,
  PerspectiveCamera,
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

function CarLogo({
  position,
  rotation = [0, 0, 0],
  scale = [0.6, 0.32, 1],
  src = "/images/TB FULL.png",
}) {
  const texture = useTexture(src);

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
// FRONT NUMBER PLATE - MANUAL POSITION CONTROLS
// =====================================================
//
// Change these values to manually move the
// existing TITLE BROS front number plate.
//
// X:
// + = RIGHT
// - = LEFT
//
// Y:
// + = UP
// - = DOWN
//
// Z:
// + = FORWARD / OUTSIDE
// - = BACKWARD / INSIDE
//
// =====================================================

const FRONT_PLATE_OFFSET = {
  x: -0.01,
  y: 0.0,
  z: 0.16,
};

// =====================================================
// FRONT PLATE ROTATION
// =====================================================
//
// Values are radians.
//
// x = tilt up/down
// y = rotate left/right
// z = rotate clockwise/counter-clockwise
//
// =====================================================

const FRONT_PLATE_ROTATION_OFFSET = {
  x: 0.0,
  y: 0.0,
  z: 0.0,
};

// =====================================================
// FRONT PLATE SCALE
// =====================================================

const FRONT_PLATE_SCALE = 1.0;

// =====================================================
// FRONT PLATE MESH NAME
// =====================================================
//
// Leave empty to automatically detect.
// If console gives you a mesh name, you can put it here.
//
// Example:
//
// const FRONT_PLATE_MESH_NAME = "Object_15";
//
// =====================================================

const FRONT_PLATE_MESH_NAME = "TitleBrosFrontPlate";

// =====================================================
// DEBUG
// =====================================================
//
// true  = console will show detected plate mesh
// false = disable console logs after positioning
//
// =====================================================

const DEBUG_FRONT_PLATE = true;

// =====================================================
// FIND FRONT PLATE MESH
// =====================================================

function findFrontPlateMesh(root) {
  let frontPlate = null;

  root.traverse((child) => {
    if (!child.isMesh) return;

    if (child.name === FRONT_PLATE_MESH_NAME) {
      frontPlate = child;
    }
  });

  return frontPlate;
}

// =====================================================
// APPLY MANUAL FRONT PLATE POSITION
// =====================================================

function applyFrontPlateOffset(root) {
  const plate = findFrontPlateMesh(root);

  // ---------------------------------------------
  // Plate not found
  // ---------------------------------------------

  if (!plate) {
    if (DEBUG_FRONT_PLATE) {
      console.warn(
        "[TITLE BROS] Front plate mesh not found."
      );

      console.warn(
        "[TITLE BROS] Set FRONT_PLATE_MESH_NAME to the exact mesh name."
      );
    }

    return;
  }

  // ---------------------------------------------
  // Store original position only once
  // ---------------------------------------------

  if (
    !plate.userData.__titleBrosBasePosition
  ) {
    plate.userData.__titleBrosBasePosition =
      plate.position.clone();
  }

  // ---------------------------------------------
  // Store original rotation only once
  // ---------------------------------------------

  if (
    !plate.userData.__titleBrosBaseRotation
  ) {
    plate.userData.__titleBrosBaseRotation =
      plate.rotation.clone();
  }

  // ---------------------------------------------
  // Store original scale only once
  // ---------------------------------------------

  if (
    !plate.userData.__titleBrosBaseScale
  ) {
    plate.userData.__titleBrosBaseScale =
      plate.scale.clone();
  }

  const basePosition =
    plate.userData.__titleBrosBasePosition;

  const baseRotation =
    plate.userData.__titleBrosBaseRotation;

  const baseScale =
    plate.userData.__titleBrosBaseScale;

  // ---------------------------------------------
  // POSITION
  // ---------------------------------------------

  plate.position.set(
    basePosition.x +
      FRONT_PLATE_OFFSET.x,

    basePosition.y +
      FRONT_PLATE_OFFSET.y,

    basePosition.z +
      FRONT_PLATE_OFFSET.z
  );

  // ---------------------------------------------
  // ROTATION
  // ---------------------------------------------

  plate.rotation.set(
    baseRotation.x +
      FRONT_PLATE_ROTATION_OFFSET.x,

    baseRotation.y +
      FRONT_PLATE_ROTATION_OFFSET.y,

    baseRotation.z +
      FRONT_PLATE_ROTATION_OFFSET.z
  );

  // ---------------------------------------------
  // SCALE
  // ---------------------------------------------

  plate.scale.copy(baseScale);

  plate.scale.multiplyScalar(
    FRONT_PLATE_SCALE
  );

  // ---------------------------------------------
  // DEBUG
  // ---------------------------------------------

  if (DEBUG_FRONT_PLATE) {
    // console.log(
    //   "========================================"
    // );

    // console.log(
    //   "[TITLE BROS] FRONT PLATE FOUND"
    // );

    // console.log(
    //   "[TITLE BROS] Mesh:",
    //   plate.name
    // );

    // console.log(
    //   "[TITLE BROS] Material:",
    //   Array.isArray(plate.material)
    //     ? plate.material.map(
    //         (material) =>
    //           material?.name
    //       )
    //     : plate.material?.name
    // );

    // console.log(
    //   "[TITLE BROS] Original Position:",
    //   basePosition
    // );

    // console.log(
    //   "[TITLE BROS] Current Offset:",
    //   FRONT_PLATE_OFFSET
    // );

    // console.log(
    //   "[TITLE BROS] Rotation Offset:",
    //   FRONT_PLATE_ROTATION_OFFSET
    // );

    // console.log(
    //   "[TITLE BROS] Scale:",
    //   FRONT_PLATE_SCALE
    // );

    // console.log(
    //   "========================================"
    // );
  }
}

// =====================================================
// CAR
// =====================================================

function Car({
  progressRef,
  mouseRef,
}) {
  const group = useRef();

  const { scene } =
    useGLTF("/models/car7.glb");

  // Clone GLTF scene
  const clonedScene = useMemo(() => {
    return SkeletonUtils.clone(scene);
  }, [scene]);

  // ===================================================
  // CAR SETUP
  // ===================================================

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // ---------------------------------------------
    // Apply front plate controls
    // ---------------------------------------------

    applyFrontPlateOffset(
      clonedScene
    );
  }, [clonedScene]);

  // ===================================================
  // CAR ANIMATION
  // ===================================================

  useFrame((state, delta) => {
    if (!group.current) return;

    const p =
      progressRef.current;

    const mouseX =
      mouseRef.current.x;

    const mouseY =
      mouseRef.current.y;

    const isMobile =
      window.innerWidth < 768;

    // --------------------------------
    // CAR TRANSFORMATION
    // --------------------------------

    const carProgress =
      THREE.MathUtils.clamp(
        p / 0.65,
        0,
        1
      );

    // --------------------------------
    // START POSITION
    // --------------------------------

    const carStartX =
      isMobile
        ? 0.65
        : 1.35;

    const carStartY =
      isMobile
        ? -0.35
        : -0.15;

    // --------------------------------
    // DOLLAR POSITION
    // --------------------------------

    const dollarX =
      isMobile
        ? 0.5
        : 1.65;

    const dollarY =
      isMobile
        ? 0
        : 0.65;

    // --------------------------------
    // POSITION
    // --------------------------------

    const targetX =
      THREE.MathUtils.lerp(
        carStartX,
        dollarX,
        carProgress
      );

    const targetY =
      THREE.MathUtils.lerp(
        carStartY,
        dollarY,
        carProgress
      );

    const mouseTargetX =
      targetX +
      mouseX * 0.28;

    const mouseTargetY =
      targetY +
      mouseY * 0.16;

    group.current.position.x =
      THREE.MathUtils.damp(
        group.current.position.x,
        mouseTargetX,
        6,
        delta
      );

    group.current.position.y =
      THREE.MathUtils.damp(
        group.current.position.y,
        mouseTargetY,
        6,
        delta
      );

    // --------------------------------
    // SCALE
    // --------------------------------

    const targetScale =
      THREE.MathUtils.lerp(
        isMobile
          ? 0.5
          : 1.15,

        0,

        carProgress
      );

    group.current.scale.setScalar(
      THREE.MathUtils.damp(
        group.current.scale.x,
        targetScale,
        7,
        delta
      )
    );

    // --------------------------------
    // ROTATION
    // --------------------------------

    const targetRotationY =
      carProgress *
      Math.PI *
      2;

    const mouseRotationY =
      targetRotationY +
      mouseX * 0.22;

    const mouseRotationX =
      mouseY * 0.08;

    group.current.rotation.y =
      THREE.MathUtils.damp(
        group.current.rotation.y,
        mouseRotationY,
        8,
        delta
      );

    group.current.rotation.x =
      THREE.MathUtils.damp(
        group.current.rotation.x,
        mouseRotationX,
        8,
        delta
      );
  });

  return (
    <group ref={group}>
      {/* ========================================= */}
      {/* CAR MODEL */}
      {/* ========================================= */}

      <primitive
        object={clonedScene}
      />

      {/* ========================================= */}
      {/* FRONT MERCEDES STAR */}
      {/* ========================================= */}

      <CarLogo
        position={[
          0,
          0.5,
          2.32,
        ]}
        rotation={[
          0,
          0,
          0,
        ]}
        scale={[
          0.6,
          0.32,
          1,
        ]}
      />

      {/* ========================================= */}
      {/* REAR MERCEDES STAR */}
      {/* ========================================= */}

      {/*
      <CarLogo
        position={[
          0,
          0.5,
          -2.32
        ]}
        rotation={[
          0,
          Math.PI,
          0
        ]}
        scale={[
          0.6,
          0.32,
          1
        ]}
      />
      */}

      {/* ========================================= */}
      {/* EXISTING TB LOGO - KEPT */}
      {/* ========================================= */}

      <CarLogo
        position={[
          0,
          0.75,
          -2.25,
        ]}
        rotation={[
          0,
          Math.PI,
          0,
        ]}
        scale={[
          0.25,
          0.2,
          1,
        ]}
        src="/images/TB.png"
      />

      {/* ========================================= */}
      {/* TITLE BROS FRONT PLATE */}
      {/* ========================================= */}

      {/*
        IMPORTANT:

        The TITLE BROS front plate already exists
        inside car6.glb.

        We are NOT creating another plane here.

        Its position is controlled through:

        FRONT_PLATE_OFFSET
      */}
    </group>
  );
}

// =====================================================
// DOLLAR
// =====================================================

function Dollar({
  progressRef,
  mouseRef,
}) {
  const group = useRef();

  const { scene } =
    useGLTF("/models/dollar.glb");

  const clonedScene = useMemo(() => {
    return SkeletonUtils.clone(scene);
  }, [scene]);

  // ===================================================
  // DOLLAR MATERIAL
  // ===================================================

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (!child.isMesh) return;

      child.castShadow = true;
      child.receiveShadow = true;

      if (
        Array.isArray(
          child.material
        )
      ) {
        child.material =
          child.material.map(
            (material) => {
              const newMaterial =
                material.clone();

              newMaterial.color.set(
                "#ff0000"
              );

              return newMaterial;
            }
          );
      } else if (
        child.material
      ) {
        child.material =
          child.material.clone();

        child.material.color.set(
          "#48fd96"
        );
      }
    });
  }, [clonedScene]);

  // ===================================================
  // DOLLAR ANIMATION
  // ===================================================

  useFrame((state, delta) => {
    if (!group.current) return;

    const mouseX =
      mouseRef.current.x;

    const mouseY =
      mouseRef.current.y;

    const p =
      progressRef.current;

    const isMobile =
      window.innerWidth < 768;

    // --------------------------------
    // POSITION
    // --------------------------------

    const targetX =
      isMobile
        ? 0.5
        : 1.65;

    const targetY =
      isMobile
        ? 0
        : 0.65;

    // --------------------------------
    // PROGRESS
    // --------------------------------

    const dollarProgress =
      THREE.MathUtils.clamp(
        (p - 0.45) /
          0.35,

        0,
        1
      );

    // --------------------------------
    // SCALE
    // --------------------------------

    const targetScale =
      THREE.MathUtils.lerp(
        0.01,

        isMobile
          ? 0.5
          : 1.15,

        dollarProgress
      );

    // --------------------------------
    // POSITION
    // --------------------------------

    group.current.position.x =
      THREE.MathUtils.damp(
        group.current.position.x,

        targetX +
          mouseX * 0.1,

        6,
        delta
      );

    group.current.position.y =
      THREE.MathUtils.damp(
        group.current.position.y,

        targetY +
          mouseY * 0.07,

        6,
        delta
      );

    // --------------------------------
    // SCALE
    // --------------------------------

    group.current.scale.setScalar(
      THREE.MathUtils.damp(
        group.current.scale.x,

        targetScale,

        7,
        delta
      )
    );

    // --------------------------------
    // ROTATION
    // --------------------------------

    const targetRotationY =
      dollarProgress *
      Math.PI *
      2;

    group.current.rotation.y =
      THREE.MathUtils.damp(
        group.current.rotation.y,

        targetRotationY +
          mouseX * 0.2,

        6,
        delta
      );

    group.current.rotation.x =
      THREE.MathUtils.damp(
        group.current.rotation.x,

        mouseY * 0.08,

        6,
        delta
      );
  });

  return (
    <group ref={group}>
      <primitive
        object={clonedScene}
      />
    </group>
  );
}

useGLTF.preload(
  "/models/dollar.glb"
);

// =====================================================
// SCENE
// =====================================================

function SceneContent({
  progressRef,
  mouseRef,
}) {
  return (
    <>
      {/* ========================================= */}
      {/* CAMERA */}
      {/* ========================================= */}

      <PerspectiveCamera
        makeDefault
        position={[
          0,
          0.5,
          6,
        ]}
        fov={42}
      />

      {/* ========================================= */}
      {/* LIGHTS */}
      {/* ========================================= */}

      <ambientLight
        intensity={1.8}
      />

      <directionalLight
        position={[
          4,
          5,
          4,
        ]}
        intensity={3.4}
      />

      <directionalLight
        position={[
          -4,
          1,
          2,
        ]}
        intensity={1.2}
      />

      {/* ========================================= */}
      {/* CAR */}
      {/* ========================================= */}

      <Float
        speed={0.8}
        rotationIntensity={0.02}
        floatIntensity={0.08}
      >
        <Car
          progressRef={
            progressRef
          }
          mouseRef={
            mouseRef
          }
        />
      </Float>

      {/* ========================================= */}
      {/* DOLLAR */}
      {/* ========================================= */}

      <Dollar
        progressRef={
          progressRef
        }
        mouseRef={
          mouseRef
        }
      />
    </>
  );
}

// =====================================================
// MAIN
// =====================================================

export default function CarScene() {
  const progressRef =
    useRef(0);

  const mouseRef =
    useRef({
      x: 0,
      y: 0,
    });

  // ===================================================
  // SCROLL + MOUSE
  // ===================================================

  useEffect(() => {
    const hero =
      document.querySelector(
        "[data-car-hero]"
      );

    if (!hero) return;

    let trigger;

    // ================================================
    // SCROLLTRIGGER
    // ================================================

    trigger =
      ScrollTrigger.create({
        trigger: hero,

        start: "top top",

        end: "bottom bottom",

        scrub: true,

        pin: false,

        onUpdate: (
          self
        ) => {
          progressRef.current =
            self.progress;
        },
      });

    // ================================================
    // MOUSE
    // ================================================

    const handleMouseMove =
      (event) => {
        mouseRef.current.x =
          (event.clientX /
            window.innerWidth) *
            2 -
          1;

        mouseRef.current.y =
          -(
            event.clientY /
            window.innerHeight
          ) *
            2 +
          1;
      };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    // ================================================
    // CLEANUP
    // ================================================

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      if (trigger) {
        trigger.kill();
        trigger = null;
      }

      progressRef.current = 0;
    };
  }, []);

  // ===================================================
  // CANVAS
  // ===================================================

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
        dpr={[
          1,
          1.5,
        ]}
        gl={{
          antialias: true,
          alpha: true,
        }}
      >
        <Suspense
          fallback={null}
        >
          <SceneContent
            progressRef={
              progressRef
            }
            mouseRef={
              mouseRef
            }
          />
        </Suspense>
      </Canvas>
    </div>
  );
}