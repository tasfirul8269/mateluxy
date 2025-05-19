import { useState, useEffect } from 'react';

// Mock data
const mockProperties = [
  {
    id: '1',
    name: 'Azure Beachfront Residences',
    price: 3500000,
    developer: 'Bloom Properties',
    location: 'Saadiyat Island, Abu Dhabi',
    image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    beds: '3',
    completion: 'ready',
    details: [
      { label: 'Type', value: '3 Bedroom Apartment' },
      { label: 'Size', value: '2,400 sq ft' },
      { label: 'Handover', value: 'Ready to Move' },
      { label: 'Payment Plan', value: '20/80' }
    ],
    tags: [
      { text: 'Premium', type: 'primary' },
      { text: 'Beachfront', type: 'secondary' }
    ]
  },
  {
    id: '2',
    name: 'Sky Gardens Tower',
    price: 1800000,
    developer: 'ALDAR Properties',
    location: 'Al Reem Island, Abu Dhabi',
    image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    beds: '2',
    completion: '2024',
    details: [
      { label: 'Type', value: '2 Bedroom Apartment' },
      { label: 'Size', value: '1,650 sq ft' },
      { label: 'Handover', value: 'Q4 2024' },
      { label: 'Payment Plan', value: '40/60' }
    ],
    tags: [
      { text: 'Off-Plan', type: 'primary' },
      { text: 'Sea View', type: 'tertiary' }
    ]
  },
  {
    id: '3',
    name: 'Dune Residences',
    price: 5200000,
    developer: 'IMKAN Properties',
    location: 'Yas Island, Abu Dhabi',
    image: 'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    beds: '4',
    completion: '2025',
    details: [
      { label: 'Type', value: '4 Bedroom Villa' },
      { label: 'Size', value: '4,200 sq ft' },
      { label: 'Handover', value: 'Q2 2025' },
      { label: 'Payment Plan', value: '30/70' }
    ],
    tags: [
      { text: 'Luxury', type: 'primary' },
      { text: 'Waterfront', type: 'secondary' }
    ]
  },
  {
    id: '4',
    name: 'Oasis Gardens',
    price: 1200000,
    developer: 'Eagle Hills',
    location: 'Al Ghadeer, Abu Dhabi',
    image: 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    beds: '1',
    completion: 'ready',
    details: [
      { label: 'Type', value: '1 Bedroom Apartment' },
      { label: 'Size', value: '950 sq ft' },
      { label: 'Handover', value: 'Ready to Move' },
      { label: 'Payment Plan', value: 'Full Payment' }
    ],
    tags: [
      { text: 'Ready', type: 'primary' },
      { text: 'Garden View', type: 'tertiary' }
    ]
  },
  {
    id: '5',
    name: 'Marina Heights',
    price: 2700000,
    developer: 'ALDAR Properties',
    location: 'Al Raha Beach, Abu Dhabi',
    image: 'https://images.pexels.com/photos/2462015/pexels-photo-2462015.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    beds: '2',
    completion: '2024',
    details: [
      { label: 'Type', value: '2 Bedroom Apartment' },
      { label: 'Size', value: '1,850 sq ft' },
      { label: 'Handover', value: 'Q3 2024' },
      { label: 'Payment Plan', value: '50/50' }
    ],
    tags: [
      { text: 'Premium', type: 'primary' },
      { text: 'Marina View', type: 'secondary' }
    ]
  },
  {
    id: '6',
    name: 'Desert Bloom Villas',
    price: 7500000,
    developer: 'Bloom Properties',
    location: 'Saadiyat Island, Abu Dhabi',
    image: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    beds: '5+',
    completion: '2025',
    details: [
      { label: 'Type', value: '5 Bedroom Villa' },
      { label: 'Size', value: '6,500 sq ft' },
      { label: 'Handover', value: 'Q1 2025' },
      { label: 'Payment Plan', value: '25/75' }
    ],
    tags: [
      { text: 'Luxury', type: 'primary' },
      { text: 'Private Pool', type: 'tertiary' }
    ]
  }
];

// Categories for filtering
const categories = ['All', 'Ready to Move', 'Off-Plan', 'Apartment', 'Villa', 'Penthouse'];

export const useProperties = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [displayedProperties, setDisplayedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const propertiesPerPage = 6;

  // Simulating data fetching
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProperties(mockProperties);
      setFilteredProperties(mockProperties);
      setDisplayedProperties(mockProperties.slice(0, propertiesPerPage));
      setLoading(false);
    };

    fetchProperties();
  }, []);

  // Filter properties based on category and search term
  useEffect(() => {
    let result = [...properties];
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      result = result.filter(property => {
        const propertyType = property.details.find(detail => detail.label === 'Type')?.value || '';
        
        if (selectedCategory === 'Ready to Move') {
          return property.completion === 'ready';
        } else if (selectedCategory === 'Off-Plan') {
          return property.completion !== 'ready';
        } else {
          return propertyType.toLowerCase().includes(selectedCategory.toLowerCase());
        }
      });
    }
    
    // Apply search filters
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(
        property => 
          property.name.toLowerCase().includes(searchLower) ||
          property.location.toLowerCase().includes(searchLower) ||
          property.developer.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply price filters
    if (filters.minPrice) {
      result = result.filter(property => property.price >= filters.minPrice);
    }
    
    if (filters.maxPrice) {
      result = result.filter(property => property.price <= filters.maxPrice);
    }
    
    // Apply beds filter
    if (filters.beds) {
      result = result.filter(property => property.beds === filters.beds);
    }
    
    // Apply completion filter
    if (filters.completion) {
      result = result.filter(property => property.completion === filters.completion);
    }
    
    setFilteredProperties(result);
    setDisplayedProperties(result.slice(0, propertiesPerPage));
    setPage(1);
  }, [selectedCategory, filters, properties]);

  // Load more properties
  const handleLoadMore = () => {
    const nextPage = page + 1;
    const newProperties = filteredProperties.slice(0, nextPage * propertiesPerPage);
    setDisplayedProperties(newProperties);
    setPage(nextPage);
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Handle search
  const handleSearch = (params) => {
    setFilters(params);
  };

  // Check if there are more properties to load
  const hasMore = displayedProperties.length < filteredProperties.length;

  return {
    properties: displayedProperties,
    loading,
    selectedCategory,
    handleCategoryChange,
    handleSearch,
    handleLoadMore,
    hasMore,
    categories
  };
};