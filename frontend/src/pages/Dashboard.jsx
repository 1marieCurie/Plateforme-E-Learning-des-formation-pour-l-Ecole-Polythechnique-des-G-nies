/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Award, 
  TrendingUp, 
  Building,
  Phone,
  Mail,
  MapPin,
  Star,
  Quote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FormationGrid from "@/components/public/FormationGrid";
import Statistics from "@/components/public/Statistics";
import TestimonialSection from "@/components/public/TestimonialSection";
import SchoolPresentation from "@/components/public/SchoolPresentation";
import NewsletterSection from "@/components/public/NewsletterSection";

const Dashboard = () => {
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      /* Hero Section */
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
              École Polytechnique
              <br />
              <span className="text-orange-500">des Génies</span>
            </h1>
            
            <div className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-700 flex flex-col sm:flex-row items-center justify-center gap-3">
              <span>Une formation qui</span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-bold transform hover:scale-105 transition-transform">
                Transforme
              </span>
            </div>

            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Formez-vous aux métiers d'avenir avec nos programmes d'excellence en informatique, 
              digital et nouvelles technologies.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link to="/formationPublique">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                  Découvrir nos formations
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  Demander des infos
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        </div>
      </section>

      {/* Statistics Section */}
      <Statistics />

      {/* School Presentation */}
      <SchoolPresentation />


      {/* Testimonials */}
      <TestimonialSection />

 
    </div>
  );
};

export default Dashboard;