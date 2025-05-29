import React, { useState, useEffect, useRef } from 'react';
import { Search, Users, Globe, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const departmentRef = useRef(null);
  const languageRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentRef.current && !departmentRef.current.contains(event.target)) {
        setIsDepartmentOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter departments based on search
  const filteredDepartments = departments.filter(department =>
    department.toLowerCase().includes(departmentSearch.toLowerCase())
  );

  // Filter languages based on search
  const filteredLanguages = languages.filter(language =>
    language.toLowerCase().includes(languageSearch.toLowerCase())
  );

  return (
    <motion.div 
      className="mb-8 relative z-[100]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Glass-like container with subtle gradient */}
      <div className="bg-gradient-to-r from-white to-gray-50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 relative overflow-visible">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-red-50/30 rounded-full -mr-20 -mt-20 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-50/30 rounded-full -ml-20 -mb-20 blur-2xl"></div>
        
        <div className="md:flex md:items-center md:space-x-6 relative">
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
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter controls with premium design */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 md:w-auto">
            {/* Department dropdown */}
            <div className="relative group" ref={departmentRef}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Users className="h-4 w-4 text-red-400" />
              </div>
              <button
                onClick={() => {
                  setIsDepartmentOpen(!isDepartmentOpen);
                  setIsLanguageOpen(false);
                }}
                className="w-full h-14 pl-10 pr-10 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:border-red-300 shadow-sm transition-all duration-200 text-left"
              >
                {selectedDepartment === 'All' ? 'All Departments' : selectedDepartment}
              </button>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <ChevronDown className={`h-4 w-4 text-red-400 transition-transform duration-200 ${isDepartmentOpen ? 'transform rotate-180' : ''}`} />
              </div>

              {/* Department dropdown menu */}
              <AnimatePresence>
                {isDepartmentOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-[1000]"
                  >
                    <div className="p-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={departmentSearch}
                          onChange={(e) => setDepartmentSearch(e.target.value)}
                          placeholder="Search departments..."
                          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-100 rounded-lg focus:outline-none focus:border-red-300"
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-auto">
                      {filteredDepartments.map((department) => (
                        <button
                          key={department}
                          onClick={() => {
                            setSelectedDepartment(department);
                            setIsDepartmentOpen(false);
                            setDepartmentSearch('');
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-red-50 transition-colors ${
                            selectedDepartment === department ? 'bg-red-50 text-red-600' : 'text-gray-700'
                          }`}
                        >
                          {department === 'All' ? 'All Departments' : department}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language dropdown */}
            <div className="relative group" ref={languageRef}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Globe className="h-4 w-4 text-red-400" />
              </div>
              <button
                onClick={() => {
                  setIsLanguageOpen(!isLanguageOpen);
                  setIsDepartmentOpen(false);
                }}
                className="w-full h-14 pl-10 pr-10 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:border-red-300 shadow-sm transition-all duration-200 text-left"
              >
                {selectedLanguage === 'All' ? 'All Languages' : selectedLanguage}
              </button>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <ChevronDown className={`h-4 w-4 text-red-400 transition-transform duration-200 ${isLanguageOpen ? 'transform rotate-180' : ''}`} />
              </div>

              {/* Language dropdown menu */}
              <AnimatePresence>
                {isLanguageOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-[1000]"
                  >
                    <div className="p-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={languageSearch}
                          onChange={(e) => setLanguageSearch(e.target.value)}
                          placeholder="Search languages..."
                          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-100 rounded-lg focus:outline-none focus:border-red-300"
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-auto">
                      {filteredLanguages.map((language) => (
                        <button
                          key={language}
                          onClick={() => {
                            setSelectedLanguage(language);
                            setIsLanguageOpen(false);
                            setLanguageSearch('');
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-red-50 transition-colors ${
                            selectedLanguage === language ? 'bg-red-50 text-red-600' : 'text-gray-700'
                          }`}
                        >
                          {language === 'All' ? 'All Languages' : language}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterBar;