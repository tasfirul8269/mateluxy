import React from 'react';
import { Search, Users, Globe, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const FilterBar = ({
  searchTerm,
  setSearchTerm,
  selectedDepartment,
  setSelectedDepartment,
  selectedLanguage,
  setSelectedLanguage,
  departments,
  languages
}) => {
  return (
    <motion.div 
      className="mb-8 relative z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Glass-like container with subtle gradient */}
      <div className="bg-gradient-to-r from-white to-gray-50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-red-50/30 rounded-full -mr-20 -mt-20 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-50/30 rounded-full -ml-20 -mb-20 blur-2xl"></div>
        
        <div className="md:flex md:items-center md:space-x-6 relative z-10">
          {/* Search input with premium design */}
          <div className="flex-1 mb-5 md:mb-0">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center">
                <Search className="h-5 w-5 text-red-500" />
              </div>
              <motion.input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search team members..."
                className="w-full h-14 pl-14 pr-12 py-4 bg-white border border-gray-100 rounded-xl focus:outline-none focus:border-red-300 shadow-sm transition-all duration-200"
                whileHover={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
                whileFocus={{ boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)' }}
              />
              {searchTerm ? (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : null}
            </div>
          </div>

          {/* Filter controls with premium design */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 md:w-auto">
            {/* Department select */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Users className="h-4 w-4 text-red-400" />
              </div>
              <motion.select 
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full h-14 pl-10 pr-10 py-3 bg-white border border-gray-100 rounded-xl appearance-none focus:outline-none focus:border-red-300 shadow-sm transition-all duration-200"
                whileHover={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
              >
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department === 'All' ? 'All Departments' : department}
                  </option>
                ))}
              </motion.select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-red-400" />
              </div>
            </div>

            {/* Language select */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Globe className="h-4 w-4 text-red-400" />
              </div>
              <motion.select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full h-14 pl-10 pr-10 py-3 bg-white border border-gray-100 rounded-xl appearance-none focus:outline-none focus:border-red-300 shadow-sm transition-all duration-200"
                whileHover={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
              >
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {language === 'All' ? 'All Languages' : language}
                  </option>
                ))}
              </motion.select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-red-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterBar;