import React, { useState, useEffect } from 'react';
import { Users, Award, UserCheck, Clock, Building, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterBar from './FilterBar';
import TeamMember from './TeamMember';

const ITEMS_PER_PAGE = 6;

const TeamPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [teamData, setTeamData] = useState([]);

  // These can be hardcoded since they're not in the API
  const departments = ["All", "Sales", "Marketing", "Management", "Finance", "IT"];
  const languages = ["All", "English", "Arabic", "French", "German", "Spanish", "Russian", "Chinese", "Korean", "Japanese", "Portuguese"];

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agents`); // Replace with your actual API endpoint
        const data = await response.json();
        console.log(data)
        setTeamData(data);
        setFilteredMembers(data);
      } catch (error) {
        console.error('Error fetching team data:', error);
      }
    };

    fetchTeamData();
  }, []);

  useEffect(() => {
    let filtered = teamData;

    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(
        (member) => member.department === selectedDepartment
      );
    }

    if (selectedLanguage !== 'All') {
      filtered = filtered.filter(
        (member) => member.languages && member.languages.includes(selectedLanguage)
      );
    }

    setFilteredMembers(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedDepartment, selectedLanguage, teamData]);

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-white min-h-screen pb-12">
      <header className="relative">
        {/* Modern split design with image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          {/* Left content section */}
          <div className="relative z-10 flex items-center px-8 py-20 lg:py-0 lg:pl-16 xl:pl-24 2xl:pl-32">
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <div className="inline-block bg-red-50 px-4 py-1 rounded-full text-red-600 text-sm font-medium tracking-wide mb-4">
                  MEET OUR PROFESSIONALS
                </div>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  The Experts <br/>
                  <span className="text-red-600">Behind Our Success</span>
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Our team of dedicated professionals combines years of industry experience with innovative thinking to deliver exceptional results for our clients.
                </p>
              </motion.div>
              
              {/* Stats in horizontal layout with dividers */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex items-center space-x-6 lg:space-x-10 text-gray-800"
              >
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-red-600">{teamData.length || '20'}+</div>
                  <div className="text-sm mt-1">Team Members</div>
                </div>
                
                <div className="h-12 w-px bg-gray-200"></div>
                
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-red-600">{departments.length - 1}</div>
                  <div className="text-sm mt-1">Departments</div>
                </div>
                
                <div className="h-12 w-px bg-gray-200"></div>
                
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-red-600">{languages.length - 1}</div>
                  <div className="text-sm mt-1">Languages</div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Right image section with overlay */}
          <div className="relative h-full lg:h-auto overflow-hidden">
            {/* Main image */}
            <div className="absolute inset-0 bg-red-100 lg:bg-transparent">
              <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent lg:hidden z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" 
                alt="Professional team" 
                className="w-full h-full object-cover opacity-20 lg:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-red-600/20 to-red-900/40 mix-blend-multiply"></div>
            </div>
            
            {/* Floating card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="absolute bottom-10 right-10 bg-white rounded-xl shadow-xl p-6 max-w-xs z-20 hidden lg:block"
            >
              <div className="flex items-start mb-4">
                <div className="text-red-500 mr-3 mt-1">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Industry Leaders</h3>
                  <p className="text-sm text-gray-600">Our team members are recognized experts in their respective fields.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-red-500 mr-3 mt-1">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Dedicated Support</h3>
                  <p className="text-sm text-gray-600">We're committed to providing exceptional service to every client.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-0 w-24 h-24 bg-red-50 rounded-full -translate-x-1/2 hidden lg:block"></div>
        <div className="absolute bottom-20 left-1/3 w-10 h-10 bg-red-100 rounded-full hidden lg:block"></div>
        <div className="absolute top-40 right-10 w-16 h-16 bg-red-50 rounded-full hidden lg:block"></div>
      </header>

      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            departments={departments}
            languages={languages}
          />

          {paginatedMembers.length > 0 ? (
            <>
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentPage}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  {paginatedMembers.map((member, index) => (
                    <motion.div
                      key={member._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                      <TeamMember 
                        member={{
                          id: member._id,
                          name: member.fullName,
                          position: member.position,
                          department: member.department || '',
                          languages: member.languages || [],
                          email: member.email,
                          phone: member.contactNumber,
                          profileImage: member.profileImage,
                          bio: member.aboutMe || ''
                        }} 
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
              
              {/* Pagination */}
              <motion.div 
                className="flex justify-center items-center gap-4 mt-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed hover:border-red-500 hover:text-red-500 transition-colors shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft size={18} />
                </motion.button>
                
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <motion.button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-200'
                          : 'bg-white text-gray-700 border border-gray-200 hover:border-red-300 hover:text-red-500'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {page}
                    </motion.button>
                  ))}
                </div>
                
                <motion.button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed hover:border-red-500 hover:text-red-500 transition-colors shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronRight size={18} />
                </motion.button>
              </motion.div>
            </>
          ) : (
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-10 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Users className="h-20 w-20 text-red-400 mx-auto mb-6" />
              </motion.div>
              <h3 className="text-2xl font-medium text-gray-800 mb-3">No team members found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Try adjusting your search or filter criteria to find team members.
              </p>
            </motion.div>
          )}

          {/* Why Choose Us Section */}
          <div className="mt-12 bg-white rounded-[20px] border border-[#e6e6e6] p-8">
            <h2 className="text-3xl font-bold text-center mb-10">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center hover:shadow-sm transition-all duration-300 p-4 rounded-lg">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Industry Leaders</h3>
                <p className="text-gray-600">Recognized excellence in real estate with years of market expertise.</p>
              </div>
              <div className="text-center hover:shadow-sm transition-all duration-300 p-4 rounded-lg">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Team</h3>
                <p className="text-gray-600">Highly qualified professionals dedicated to your success.</p>
              </div>
              <div className="text-center hover:shadow-sm transition-all duration-300 p-4 rounded-lg">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                <p className="text-gray-600">Round-the-clock assistance for all your needs.</p>
              </div>
              <div className="text-center hover:shadow-sm transition-all duration-300 p-4 rounded-lg">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <Building className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Global Reach</h3>
                <p className="text-gray-600">International presence with local market knowledge.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Add CSS for the background pattern */}
      <style jsx>{`
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
};

export default TeamPage;