
import React from "react";
import { FaSearch } from "react-icons/fa"; // icône de loupe

const SearchBar = ({ searchQuery, onSearch }) => {
  const handleSearch = (event) => {
    onSearch(event.target.value);
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="relative w-full md:w-2/3">
        <input
          type="text"
          placeholder="Rechercher un cours..."
          value={searchQuery}
          onChange={handleSearch}
          className="p-2 pl-4 pr-10 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
};

export default SearchBar;
