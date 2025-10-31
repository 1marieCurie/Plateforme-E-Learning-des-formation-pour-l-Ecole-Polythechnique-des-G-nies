import React from "react";
import { MessageSquare } from "lucide-react";
import DirectorCard from "../components/Contact/DirectorCard";
import ContactForm from "../components/Contact/ContactForm";
import ContactDetails_Div from "../components/Contact/ContactDetails_Div";

const ContactUs = () => {
  const faqs = [
    {
      question: "Comment puis-je m'inscrire à une formation ?",
      answer: "Vous pouvez vous inscrire directement via notre plateforme en créant un compte étudiant. Parcourez nos cours disponibles et cliquez sur 'S'inscrire' pour le cours qui vous intéresse."
    },
    {
      question: "Les formations sont-elles certifiantes ?",
      answer: "Oui, toutes nos formations délivrent un certificat de réussite une fois que vous avez complété tous les modules et validé les évaluations."
    },
    {
      question: "Puis-je suivre les cours à mon rythme ?",
      answer: "Absolument ! Notre plateforme est conçue pour l'apprentissage flexible. Vous pouvez progresser à votre rythme et accéder aux contenus 24h/24."
    },
    {
      question: "Y a-t-il un support technique disponible ?",
      answer: "Oui, notre équipe technique est disponible pour vous aider. Vous pouvez nous contacter via le formulaire ci-dessous ou par email."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 p-4 rounded-full">
              <MessageSquare className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Contactez-Nous
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Nous sommes là pour répondre à toutes vos questions et vous accompagner dans votre parcours d'apprentissage
          </p>
        </div>
      </div>

      {/* Section Director & Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <DirectorCard />
          </div>
          <div>
            <ContactForm />
          </div>
        </div>
      </div>

      {/* Section pleine largeur pour ContactDetails_Div */}
      <ContactDetails_Div />

      {/* Container pour FAQ et Call to Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trouvez rapidement les réponses aux questions les plus courantes
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Prêt à commencer votre formation ?
            </h2>
            <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
              Rejoignez des milliers d'étudiants qui font confiance à notre plateforme pour développer leurs compétences
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/formationPublique"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300 text-center"
              >
                Voir nos formations
              </a>
              <a
                href="/register"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300 text-center"
              >
                Créer un compte
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
