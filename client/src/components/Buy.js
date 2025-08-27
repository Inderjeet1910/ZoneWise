import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from "react-router-dom";

const Buy = () => {
  const categories = [
    { name: 'Residential', slug: 'residential', icon: '🏠', count: '12,340' },
    { name: 'Commercial', slug: 'commercial', icon: '🏢', count: '5,670' },
    { name: 'Industrial', slug: 'industrial', icon: '🏭', count: '2,890' },
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {}, [location.pathname]);

  const handleCategoryClick = (categorySlug, e) => {
    if (categorySlug === 'commercial' || categorySlug === 'industrial') {
      e.preventDefault();
      setShowModal(true);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const matchedCategory = categories.find(
        (cat) => cat.slug.toLowerCase() === searchTerm.trim().toLowerCase()
      );

      if (matchedCategory) {
        if (matchedCategory.slug === 'commercial' || matchedCategory.slug === 'industrial') {
          setShowModal(true);
        } else {
          navigate(`/buy/${matchedCategory.slug}`);
        }
      } else {
        alert("Category not found!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-5">
      {/* Coming Soon Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 text-center shadow-2xl">
            <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-3xl mb-6">
              ⏳
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Coming Soon</h3>
            <p className="text-gray-600 mb-6">
              This category is currently under development and will be available soon.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-300"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Hero Section with Search */}
      <div className="relative bg-gradient-to-b from-blue-800 to-blue-600 text-white py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-blue-800/20"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
              Find Your <span className="text-yellow-400">Dream</span> Property
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
              Discover premium homes, apartments, and plots for sale across India's top cities. 
              Verified listings with transparent pricing.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl p-1.5 flex">
              <div className="flex-1 flex">
                <input
                  type="text"
                  placeholder="Search by category"
                  className="w-full px-5 py-4 text-gray-700 placeholder-gray-500 bg-transparent outline-none rounded-l-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto -mt-12 px-4 z-20 relative">
        <div className="bg-white rounded-2xl shadow-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="text-3xl md:text-4xl font-bold text-blue-700 mb-2">10,000+</div>
            <div className="text-gray-600 font-medium">Properties for Sale</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="text-3xl md:text-4xl font-bold text-blue-700 mb-2">150+</div>
            <div className="text-gray-600 font-medium">Cities Covered</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="text-3xl md:text-4xl font-bold text-blue-700 mb-2">24h</div>
            <div className="text-gray-600 font-medium">New Listings Daily</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="text-3xl md:text-4xl font-bold text-blue-700 mb-2">Verified</div>
            <div className="text-gray-600 font-medium">Listings</div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto py-16 px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find properties tailored to your specific needs across diverse categories
          </p>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-6 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredCategories.map((category) => (
            <div 
              key={category.slug}
              className="block"
              onMouseEnter={() => setActiveCategory(category.slug)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              {category.slug === 'commercial' || category.slug === 'industrial' ? (
                <div 
                  onClick={(e) => handleCategoryClick(category.slug, e)}
                  className="cursor-pointer"
                >
                  <div className={`bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 flex flex-col items-center border-2 ${
                    activeCategory === category.slug 
                      ? 'border-blue-500 shadow-xl transform -translate-y-2' 
                      : 'border-transparent'
                  }`}>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-6 text-3xl transition-all duration-500 group-hover:rotate-12">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{category.name}</h3>
                    <div className="text-gray-500 text-sm">{category.count} properties</div>
                    <div className="mt-4 w-12 h-1 bg-blue-400 rounded-full"></div>
                  </div>
                </div>
              ) : (
                <Link to={`/buy/${category.slug}`}>
                  <div className={`bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 flex flex-col items-center border-2 ${
                    activeCategory === category.slug 
                      ? 'border-blue-500 shadow-xl transform -translate-y-2' 
                      : 'border-transparent'
                  }`}>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-6 text-3xl transition-all duration-500 group-hover:rotate-12">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{category.name}</h3>
                    <div className="text-gray-500 text-sm">{category.count} properties</div>
                    <div className="mt-4 w-12 h-1 bg-blue-400 rounded-full"></div>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
        
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-700">No categories found</h3>
            <p className="text-gray-500 mt-2">Try a different search term</p>
          </div>
        )}
      </div>
      
      {/* Featured Cities */}
      <div className="bg-gradient-to-b from-blue-800 to-blue-600 text-white py-16 mb-9">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Properties in Top Cities</h2>
            <p className="text-blue-200 max-w-2xl mx-auto">
              Discover the most popular locations for Property
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'].map((city) => (
              <div key={city} className="bg-white/10 text-white backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-colors duration-300">
                <div className="text-lg font-semibold">{city}</div>
                <div className="text-white text-sm">1,200+ properties</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Buy;