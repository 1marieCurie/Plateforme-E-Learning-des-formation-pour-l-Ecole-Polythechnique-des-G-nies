import { useState } from "react";
import Course_Enrollments from "@/components/Admin/Suivis_Cours/Course_Enrollments";
import Enrollment_Stats from "@/components/Admin/Suivis_Cours/Enrollment_Stats";
import Student_Distribution from "@/components/Admin/Suivis_Cours/Student_Distribution";  
import Enrollment_Management from "@/components/Admin/Suivis_Cours/Enrollment_Management";
import { Plus, BarChart3, Users, BookOpen, Settings } from "lucide-react";

const Suivi_Cours = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const tabs = [
    { key: "overview", label: "Vue d'ensemble", icon: BarChart3 },
    { key: "courses", label: "Cours", icon: BookOpen },
    { key: "students", label: "Répartition", icon: Users },
    { key: "management", label: "Gestion", icon: Settings }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-4">
        <span className="bg-blue-200 rounded p-2">Suivi des cours et inscriptions</span>
      </h1>

      <p className="text-gray-700 mb-8">
        Gérez les inscriptions aux cours, visualisez la répartition des étudiants par formation et effectuez des actions sur les comptes étudiants.
      </p>

      {/* Bouton pour les actions d'inscription */}
      {/* Navigation par onglets */}
      <div className="flex space-x-1 mb-8 border-b border-gray-200">
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors flex items-center space-x-2 ${
                activeTab === tab.key
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenu des onglets */}
      <div className="space-y-8">
        {activeTab === "overview" && <Enrollment_Stats />}
        
        {activeTab === "students" && <Student_Distribution />}
        
        {activeTab === "courses" && (
          <Course_Enrollments 
            onCourseSelect={setSelectedCourse}
            selectedCourse={selectedCourse}
          />
        )}
        
        {activeTab === "management" && <Enrollment_Management />}
      </div>

    </div>
  );
};

export default Suivi_Cours;
