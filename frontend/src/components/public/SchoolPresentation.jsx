import { CheckCircle, Target, Eye, Heart, Users, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const SchoolPresentation = () => {
  const values = [
    {
      icon: Target,
      title: "Excellence Académique",
      description: "Des programmes conçus avec les dernières technologies et méthodologies pédagogiques",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Users,
      title: "Accompagnement Personnalisé",
      description: "Un suivi individuel pour garantir la réussite de chaque étudiant",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Heart,
      title: "Innovation Pédagogique",
      description: "Apprentissage par projets, méthodes agiles et technologies immersives",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: BookOpen,
      title: "Insertion Professionnelle",
      description: "Partenariats entreprises et accompagnement carrière personnalisé",
      color: "bg-orange-100 text-orange-600"
    }
  ];

  const achievements = [
    "Plus de 13 ans d'expérience en formation professionnelle",
    "Équipe pédagogique certifiée et expérimentée",
    "Programmes alignés avec les besoins du marché",
    "Infrastructure technologique de pointe",
    "Partenariats avec des entreprises leaders",
    "Certification qualité ISO 9001:2015"
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            À Propos de l'École Polytechnique des Génies
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Institution d'excellence dédiée à la formation des leaders de demain dans les domaines 
            du numérique, de l'informatique et des nouvelles technologies.
          </p>
        </div>

        {/* Main presentation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left content */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Former les Talents d'Aujourd'hui pour les Défis de Demain
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                L'École Polytechnique des Génies est reconnue comme l'une des institutions 
                de formation les plus prestigieuses du Maroc. Nous proposons un large éventail 
                de programmes allant du technicien spécialisé aux masters professionnels.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Eye className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Notre Vision</h4>
                    <p className="text-gray-600">Être l'école de référence en formation technologique, reconnue pour l'excellence de ses programmes et l'employabilité de ses diplômés.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Target className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Notre Mission</h4>
                    <p className="text-gray-600">Offrir une formation de qualité supérieure, adaptée aux besoins du marché, tout en développant l'esprit d'innovation et d'entrepreneuriat chez nos étudiants.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Nos Atouts</h4>
              <div className="grid grid-cols-1 gap-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right content - Director info */}
                <div className="lg:pl-8">
                <Card className="shadow-xl border-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center">
                  <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full mx-auto mb-6 flex items-center justify-center overflow-hidden">
                    <img
                    src="/Lazrak.jpg"
                    alt="Alaeeddine Lazrak"
                    className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Alaeeddine Lazrak</h3>
                  <p className="text-blue-100 font-medium">Directeur & Fondateur</p>
                  </div>
                  
                  <CardContent className="p-8">
                  <div className="space-y-4">
                    <p className="text-gray-600 leading-relaxed">
                    <strong>Ingénieur en Informatique</strong> avec plus de 13 ans d'expérience 
                    dans le domaine de la formation et du coaching professionnel.
                    </p>
                    
                    <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-600">Expert en SEO et Marketing Digital</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-600">Spécialiste en Gestion de Projets Logiciels</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-600">Formateur et Coach Certifié</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-600">Passionné par l'Innovation Technologique</span>
                    </div>
                    </div>
                    
                    <blockquote className="italic text-gray-600 border-l-4 border-blue-600 pl-4 mt-6">
                    "Notre objectif est de former des professionnels capables de s'adapter 
                    aux évolutions technologiques et de devenir les leaders de demain."
                    </blockquote>
                  </div>
                  </CardContent>
                </Card>
                </div>
              </div>

              {/* Values Grid */}
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            Nos Valeurs Fondamentales
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 ${value.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {value.title}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SchoolPresentation;