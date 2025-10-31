import { Link } from "react-router-dom";
import { ArrowRight, Clock, Users, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FormationGrid = ({ formations }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {formations.map((formation, index) => (
        <Card
          key={index}
          className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden"
        >
          <div className="relative">
            {/* Category Badge */}
            <div className="absolute top-4 left-4 z-10">
              <span
                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: formation.color }}
              >
                {formation.category}
              </span>
            </div>

            {/* Image with overlay */}
            <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
              <div
                className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
                style={{ backgroundColor: formation.color }}
              ></div>

              {/* Placeholder for image - replace with actual images */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: formation.color }}
                >
                  <Award className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <Button
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                  style={{ backgroundColor: formation.color }}
                >
                  En savoir plus
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
              {formation.title}
            </h3>

            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
              {formation.description}
            </p>

            {/* Formation details */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>6-12 mois</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  <span>Max 25</span>
                </div>
              </div>
              <div className="flex items-center">
                <Award className="w-3 h-3 mr-1" />
                <span>Certifiant</span>
              </div>
            </div>

            <Link href={formation.link}>
              <Button
                variant="outline"
                className="w-full group-hover:border-blue-600 group-hover:text-blue-600 transition-colors"
              >
                Découvrir le programme
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FormationGrid;
