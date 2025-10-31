// src/components/Admin/ManageUsers/UserFilters.jsx
import React from "react";
import { Search, Filter, SortAsc } from "lucide-react";

const UserFilters = ({ filters, onFilterChange, userType }) => {
  const [suggestions, setSuggestions] = React.useState([]);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [allNames, setAllNames] = React.useState([]);

  // Récupérer tous les noms des utilisateurs pour suggestions
  React.useEffect(() => {
    async function fetchNames() {
      const endpoint = userType === "students" ? "/api/student-profiles" : "/api/teacher-profiles";
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(endpoint, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          }
        });
        const data = await res.json();
        const names = Array.isArray(data)
          ? data.map(profile => (profile.user?.name || profile.user?.nom || profile.name || profile.nom || "")).filter(Boolean)
          : [];
        setAllNames(names);
      } catch {
        setAllNames([]);
      }
    }
    fetchNames();
  }, [userType]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    onFilterChange({ search: value });
    if (value.trim() === "") {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const lower = value.toLowerCase();
    const filtered = allNames.filter(n => n.toLowerCase().includes(lower)).slice(0, 8);
    setSuggestions(filtered);
    setShowDropdown(filtered.length > 0);
  };

  const handleSuggestionClick = (name) => {
    onFilterChange({ search: name });
    setShowDropdown(false);
  };

  const handleStatusChange = (e) => {
    onFilterChange({ status: e.target.value });
  };

  const handleSortChange = (e) => {
    onFilterChange({ sortBy: e.target.value });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Barre de recherche par nom avec suggestions */}
        <div className="flex-1">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoComplete="off"
              onFocus={() => setShowDropdown(suggestions.length > 0)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            />
            {showDropdown && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-auto">
                {suggestions.map((name, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-50"
                    onMouseDown={() => handleSuggestionClick(name)}
                  >
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filtre par statut */}
        <div className="min-w-[200px]">
          <div className="relative">
            <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filters.status}
              onChange={handleStatusChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Comptes actifs</option>
              <option value="inactive">Comptes inactifs</option>
            </select>
          </div>
        </div>

        {/* Tri */}
        <div className="min-w-[200px]">
          <div className="relative">
            <SortAsc className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="name">Trier par nom</option>
              <option value="lastAccess">Dernier accès</option>
              <option value="createdAt">Date d'inscription</option>
              {userType === "trainers" && <option value="studentsCount">Nombre d'étudiants</option>}
            </select>
          </div>
        </div>
      </div>

      {/* Nombre de résultats */}
      <div className="mt-4 text-sm text-gray-600">
        Affichage des résultats filtrés pour "{userType === "students" ? "étudiants" : "formateurs"}"
      </div>
    </div>
  );
};

export default UserFilters;