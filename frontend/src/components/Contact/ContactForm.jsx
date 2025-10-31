// src/components/Contact/ContactForm.jsx
import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulation d'envoi - Ici vous pourrez ajouter l'appel API
      console.log('Données du formulaire:', formData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Erreur lors de l\'envoi:', err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      
      // Reset status après 5 secondes
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  const subjectOptions = [
    { value: '', label: 'Sélectionnez un sujet' },
    { value: 'information', label: 'Demande d\'information' },
    { value: 'inscription', label: 'Inscription' },
    { value: 'formation', label: 'Questions sur les formations' },
    { value: 'technique', label: 'Support technique' },
    { value: 'partenariat', label: 'Partenariat' },
    { value: 'autre', label: 'Autre' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Envoyez-nous un message
        </h2>
        <p className="text-gray-600">
          Une question ? Un projet ? Nous sommes là pour vous écouter
        </p>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mt-4"></div>
      </div>

      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800">Message envoyé avec succès ! Nous vous répondrons rapidement.</p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">Erreur lors de l'envoi. Veuillez réessayer.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Votre nom complet"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="votre.email@exemple.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Sujet *
          </label>
          <select
            id="subject"
            name="subject"
            required
            value={formData.subject}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            {subjectOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            value={formData.message}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            placeholder="Décrivez votre demande en détail..."
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Envoi en cours...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Send className="w-5 h-5" />
              <span>Envoyer le message</span>
            </div>
          )}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Nous nous engageons à vous répondre dans les 24h ouvrées</span>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
