import { Users, GraduationCap, Briefcase, TrendingUp, Star, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Statistics = () => {
  const stats = [
    {
      icon: GraduationCap,
      value: "5,200+",
      label: "Diplômés",
      description: "Lauréats formés depuis 2010",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Briefcase,
      value: "89%",
      label: "Taux d'employabilité",
      description: "Dans les 6 mois après la formation",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Users,
      value: "1,800+",
      label: "Étudiants actifs",
      description: "Actuellement en formation",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Award,
      value: "120+",
      label: "Certifications",
      description: "Programmes certifiants disponibles",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: TrendingUp,
      value: "94%",
      label: "Taux de satisfaction",
      description: "Moyenne des évaluations étudiants",
      color: "bg-red-100 text-red-600"
    },
    {
      icon: Star,
      value: "25+",
      label: "Partenaires entreprises",
      description: "Recruteurs partenaires actifs",
      color: "bg-indigo-100 text-indigo-600"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Notre Impact en Chiffres
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Des résultats concrets qui témoignent de notre engagement envers l'excellence éducative
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  
                  <div className="text-xl font-semibold text-gray-700 mb-2">
                    {stat.label}
                  </div>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Achievement Highlights */}
        <div className="mt-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Nos Distinctions et Reconnaissances
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Prix d'Excellence 2023</h4>
                <p className="text-gray-600 text-sm">Meilleure école privée de formation professionnelle</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <Star className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Certification ISO 9001</h4>
                <p className="text-gray-600 text-sm">Qualité des processus pédagogiques certifiée</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Top 5 National</h4>
                <p className="text-gray-600 text-sm">Classement des écoles de technologie 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Statistics;