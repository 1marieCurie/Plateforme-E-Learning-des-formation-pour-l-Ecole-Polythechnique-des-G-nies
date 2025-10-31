/* eslint-disable no-unused-vars */
// src/components/HoverCard.jsx
import React, { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { directorImg } from "../assets";

const ROTATION_RANGE = 8; // ↓ Plus petit = plus discret
const HALF_ROTATION_RANGE = ROTATION_RANGE / 2;

export default function HoverCard() {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Transition plus douce et pro
  const xSpring = useSpring(x, { stiffness: 80, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 80, damping: 20 });

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;

    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / width - HALF_ROTATION_RANGE;

    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transformStyle: "preserve-3d" }}
      className="relative w-[320px] h-[420px] rounded-3xl bg-gradient-to-br from-[#94bef4] to-[#3f89ec] shadow-xl transition-shadow duration-300 hover:shadow-2xl"
    >
      <div
        style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}
        className="absolute inset-4 bg-white rounded-2xl shadow-md flex flex-col items-center justify-start p-6"
      >
        <img
          src={directorImg}
          alt="Directeur de l'école"
          style={{ transform: "translateZ(30px)" }}
          className="w-32 h-32 rounded-full border-4 border-[#3f89ec] object-cover shadow-sm mb-4"
        />
        <h3
          className="text-xl font-semibold text-[#3f89ec]"
          style={{ transform: "translateZ(20px)" }}
        >
          Alaeeddine Lazrak
        </h3>
        <p
          className="text-gray-600 text-sm mt-2 text-center"
          style={{ transform: "translateZ(10px)" }}
        >
          Directeur du Centre de Compétence Média – Ingénieur en Informatique avec plus de 11 ans d’expérience. Expert en SEO, développement logiciel, gestion de projets, et coaching technique. Capable de vulgariser les systèmes complexes et de motiver les équipes.
        </p>
      </div>
    </motion.div>
  );
}
