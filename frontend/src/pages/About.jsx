import React from 'react';
import { CheckCircle, Users, Award, Headphones, RefreshCw, Code, Smartphone, Globe } from 'lucide-react';

const AboutPage = () => {
  const features = [
    {
      icon: RefreshCw,
      title: "Satisfait ou remboursé",
      description: "Vous avez suffisamment de temps pour tester nos services. Si vous n'êtes pas satisfaits, L'École Polytechnique des Génies vous rembourse."
    },
    {
      icon: Headphones,
      title: "Support 24/7/365",
      description: "Notre centre de relation clientèle est à votre disposition 24h/24 et 7j/7 et prête pour répondre à toutes vos attentes concernant nos services."
    },
    {
      icon: Users,
      title: "Équipe d'experts",
      description: "Nous avons une équipe passionnée d'experts numériques qui sont dédiés à vous aider à mettre vos idées sur le marché."
    }
  ];

  const services = [
    {
      icon: Globe,
      title: "Développement Web",
      description: "Sites internet bien référencés et optimisés"
    },
    {
      icon: Smartphone,
      title: "Applications Mobiles",
      description: "Applications performantes pour iOS et Android"
    },
    {
      icon: Code,
      title: "Développement Logiciels",
      description: "Solutions logicielles sur mesure"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              École Polytechnique des Génies
            </h1>
            <div className="w-32 h-1 bg-white rounded-full mx-auto"></div>
            <p className="text-xl md:text-2xl font-semibold max-w-4xl mx-auto">
              École et centre de formations et services informatiques
            </p>
            <p className="text-lg md:text-xl max-w-3xl mx-auto">
              Le leader à Fès en formation professionnelle et services informatiques
            </p>
          </div>
        </div>
      </section>

      {/* Qui sommes-nous Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Qui sommes-nous ?
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto"></div>
            </div>
            
            <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
              <p>
                L'École Polytechnique des Génies est une école supérieure d'informatique et métiers professionnels, 
                agence et société de tous services informatiques au Maroc. Ainsi qu'un centre de langues, de formations 
                et soutien professionnelles en toutes matières informatiques.
              </p>
              
              <p>
                Nous sommes une société, entreprise et agence de services informatiques. Ainsi qu'une école, 
                établissement et centre de formations supérieur considéré le leader à Fès. En plus, l'École 
                Polytechnique des Génies offre des cours de soutiens, des certifications qui couvrent une large 
                panoplie de domaines informatiques.
              </p>
              
              <p className="font-semibold text-blue-600">
                Nous sommes là pour atteindre la satisfaction de nos clients et vous garantir le meilleur service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nos Services
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi nous choisir Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi nous choisir ?
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Prêt à commencer votre parcours ?
          </h2>
          <p className="text-lg md:text-xl">
            Rejoignez le leader de la formation professionnelle à Fès
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <a
              href="/contact"
              className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Nous contacter
            </a>
            <a
              href="/formations"
              className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 transform hover:scale-105"
            >
              Découvrir nos formations
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;