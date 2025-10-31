import { Quote, Star, Briefcase, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TestimonialSection = () => {
  const testimonials = [
    {
      name: "Youssef El Amrani",
      role: "Développeur Full Stack",
      company: "TechCorp Maroc",
      location: "Casablanca",
      image: "/avatars/avatar1.jpg",
      rating: 5,
      text: "Grâce à la formation en développement web à l'EPG, j'ai pu décrocher mon poste de rêve. L'accompagnement était exceptionnel et les projets pratiques m'ont vraiment préparé au monde professionnel.",
      achievement: "Embauché 2 mois après la formation"
    },
    {
      name: "Fatima Zahra Benali",
      role: "Spécialiste Cybersécurité",
      company: "SecureNet Solutions",
      location: "Rabat",
      image: "/avatars/avatar2.jpg",
      rating: 5,
      text: "La formation cybersécurité m'a ouvert de nombreuses portes. Les formateurs sont des experts du domaine et m'ont transmis les compétences techniques et stratégiques indispensables.",
      achievement: "Promotion en Chef de projet sécurité"
    },
    {
      name: "Omar Hajji",
      role: "Digital Marketing Manager",
      company: "MediaPlus Agency",
      location: "Marrakech",
      image: "/avatars/avatar3.jpg",
      rating: 5,
      text: "Le programme marketing digital était parfaitement adapté aux besoins actuels du marché. J'ai pu créer ma propre agence digitale et accompagner des entreprises dans leur transformation numérique.",
      achievement: "Créateur d'entreprise à succès"
    }
  ];

  const successStories = [
    {
      metric: "127",
      label: "Créateurs d'entreprise",
      description: "Anciens étudiants qui ont lancé leur startup"
    },
    {
      metric: "89%",
      label: "Promotion rapide",
      description: "Obtiennent une promotion dans les 18 mois"
    },
    {
      metric: "94%",
      label: "Recommandent l'école",
      description: "Taux de recommandation des diplômés"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Témoignages de Nos Diplômés
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez les parcours inspirants de nos anciens étudiants qui excellent 
            aujourd'hui dans leurs domaines respectifs
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                {/* Quote icon */}
                <div className="text-blue-600 mb-4">
                  <Quote className="w-8 h-8" />
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Testimonial text */}
                <p className="text-gray-600 leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>

                {/* Achievement badge */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                  <div className="flex items-center text-green-700">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">{testimonial.achievement}</span>
                  </div>
                </div>

                {/* Profile */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-gray-500">{testimonial.company}</div>
                    <div className="flex items-center text-xs text-gray-400 mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Success Metrics */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Succès de Nos Diplômés
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Des chiffres qui parlent de l'excellence de notre accompagnement et de la qualité de notre formation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="text-center">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {story.metric}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    {story.label}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {story.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Call to action for testimonials */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Vous aussi, rejoignez nos success stories !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/formationPublique"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
              >
                Découvrir nos formations
              </a>
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;