import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { PriceRangeSelector } from './PriceRangeSelector';
import { BedsSelector } from './BedsSelector';
import { CompletionSelector } from './CompletionSelector';
import './SearchBar.css';

const SearchBar = ({ onSearch, priceRange = { minPrice: 500000, maxPrice: 50000000 } }) => {
  const [searchParams, setSearchParams] = useState({
    searchTerm: '',
    minPrice: null,
    maxPrice: null,
    beds: null,
    completion: null,
  });
  
  const [showFilters, setShowFilters] = useState(false);

  const handleInputChange = (e) => {
    setSearchParams({ ...searchParams, searchTerm: e.target.value });
  };

  const handlePriceChange = (min, max) => {
    setSearchParams({ ...searchParams, minPrice: min, maxPrice: max });
  };

  const handleBedsChange = (beds) => {
    setSearchParams({ ...searchParams, beds });
  };

  const handleCompletionChange = (completion) => {
    setSearchParams({ ...searchParams, completion });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchParams);
    setShowFilters(false);
  };

  return (
    <div className="search-bar-container  bg-white rounded-xl shadow-lg p-4 mb-8">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Location, Developer or Project"
              value={searchParams.searchTerm}
              onChange={handleInputChange}
              className="w-full px-4 py-3 pl-12 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle Button (Mobile) */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {showFilters ? (
              <X className="h-5 w-5 text-gray-600" />
            ) : (
              <SlidersHorizontal className="h-5 w-5 text-gray-600" />
            )}
          </button>

          {/* Desktop Filters */}
          <div className="hidden md:flex items-center gap-3 flex-grow">
            <PriceRangeSelector
              minPrice={searchParams.minPrice}
              maxPrice={searchParams.maxPrice}
              onChange={handlePriceChange}
              realPriceRange={priceRange}
            />
            <BedsSelector
              value={searchParams.beds}
              onChange={handleBedsChange}
            />
            <CompletionSelector
              value={searchParams.completion}
              onChange={handleCompletionChange}
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="bg-[#FF2626] hover:bg-[#FF4040] cursor-pointer text-white p-3 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="md:hidden mt-4 space-y-3">
            <PriceRangeSelector
              minPrice={searchParams.minPrice}
              maxPrice={searchParams.maxPrice}
              onChange={handlePriceChange}
              realPriceRange={priceRange}
            />
            <BedsSelector
              value={searchParams.beds}
              onChange={handleBedsChange}
            />
            <CompletionSelector
              value={searchParams.completion}
              onChange={handleCompletionChange}
              className = "border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700"
            />
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;