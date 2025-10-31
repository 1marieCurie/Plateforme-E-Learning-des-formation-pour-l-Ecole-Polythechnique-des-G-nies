/* eslint-disable no-unused-vars */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, LogIn } from 'lucide-react';
import { HiOutlineBadgeCheck } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const SignupModal = ({ isOpen, onClose, selectedFormation = null }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop avec effet de flou */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-white/30 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-200"
          >
            {/* Bouton fermer */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Contenu du modal */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineBadgeCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Rejoignez-nous !
              </h2>
              <p className="text-gray-600">
                {selectedFormation 
                  ? `Connectez-vous ou créez un compte pour accéder à "${selectedFormation.title}"`
                  : 'Connectez-vous ou créez un compte pour accéder à nos formations'
                }
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/register')}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Créer un compte
              </button>

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-white border-2 border-indigo-600 text-indigo-600 py-3 px-6 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Se connecter
              </button>
            </div>

            {/* Note */}
            <p className="text-xs text-gray-500 text-center mt-6">
              L'inscription est gratuite et ne prend que quelques minutes
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SignupModal;