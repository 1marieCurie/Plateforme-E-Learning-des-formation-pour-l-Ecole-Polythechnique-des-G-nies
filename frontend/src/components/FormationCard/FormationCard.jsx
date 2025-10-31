/* eslint-disable no-unused-vars */
// src/components/FormationCard/FormationCard.jsx
import { motion } from "framer-motion";
import { cardFadeIn, hoverScale } from "../../utils/animations";

export default function FormationCard({ title, description, image, color }) {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col h-[420px] border-t-4"
      style={{ borderColor: color }}
      {...cardFadeIn}
      {...hoverScale}
    >
      {/* Image */}
      <div className="h-[60%] w-full">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Titre */}
      <div className="h-[10%] flex items-center justify-center text-center px-3">
        <h2 className="text-lg font-semibold" style={{ color }}>{title}</h2>
      </div>

      {/* Description */}
      <div className="h-[30%] px-4 flex flex-col justify-center items-center text-center">
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <span className="bg-[#3f89ec] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#316dc0] transition">
          En savoir plus
        </span>
      </div>
    </motion.div>
  );
}
