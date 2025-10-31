// src/components/Teacher/Formations/SearchBar.jsx

import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa"; // icône de loupe

const SearchBar = ({ searchQuery, onSearch, placeholder, suggestions = [] }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  // Fermer le dropdown si clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Charger l'historique depuis localStorage
    const saved = localStorage.getItem('searchHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    // Filtrer les suggestions selon la saisie
    const filtered = searchQuery && suggestions.length > 0 && isFocused
      ? suggestions.filter(s =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 8)
      : [];
    if (JSON.stringify(filtered) !== JSON.stringify(filteredSuggestions)) {
      setFilteredSuggestions(filtered);
    }
    const shouldShow = searchQuery && suggestions.length > 0 && isFocused && filtered.length > 0;
    if (showDropdown !== shouldShow) {
      setShowDropdown(shouldShow);
    }
  }, [searchQuery, suggestions, isFocused, filteredSuggestions, showDropdown]);

  const handleSearch = (event) => {
    const value = event.target.value;
    onSearch(value);
    setIsFocused(true);
    setShowDropdown(!!value);
  };

  const handleSuggestionClick = (suggestion) => {
    onSearch(suggestion);
    setShowDropdown(false);
    inputRef.current.blur();
    // Sauvegarder dans l'historique
    if (suggestion && !history.includes(suggestion)) {
      const newHistory = [suggestion, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
      setIsFocused(false);
    }, 150);
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder || "Rechercher..."}
        value={searchQuery}
        onChange={handleSearch}
        onFocus={() => setIsFocused(true)}
        onBlur={handleInputBlur}
        className="w-full p-2 pl-4 pr-10 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        autoComplete="off"
      />
      <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-500" />
      {showDropdown && (filteredSuggestions.length > 0 || history.length > 0) && (
        <div ref={dropdownRef} className="absolute left-0 right-0 mt-2 bg-white border border-indigo-200 rounded-lg shadow-lg z-10 max-h-64 overflow-auto">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((s, idx) => (
              <div
                key={s + idx}
                className="px-4 py-2 cursor-pointer hover:bg-indigo-50 text-gray-700"
                onMouseDown={() => handleSuggestionClick(s)}
              >
                {s}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-400">Aucune suggestion</div>
          )}
          {history.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs text-indigo-400 border-t">Historique</div>
              {history.map((h, idx) => (
                <div
                  key={h + idx}
                  className="px-4 py-2 cursor-pointer hover:bg-indigo-50 text-gray-500"
                  onMouseDown={() => handleSuggestionClick(h)}
                >
                  {h}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
