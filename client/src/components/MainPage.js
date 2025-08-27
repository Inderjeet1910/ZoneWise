// src/components/MainPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MainPage = ({ user }) => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);



  // Property type images mapping
  const propertyTypeImages = {
    Apartment: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    Penthouse: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    Villa: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    Bunglow: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    // Default image if property type doesn't match any of the above
    Default: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
  };

  // Function to get the appropriate image based on property type
  const getPropertyImage = (propertyType) => {
    if (!propertyType) return propertyTypeImages.Default;
    
    const normalizedType = propertyType.charAt(0).toUpperCase() + propertyType.slice(1).toLowerCase();
    return propertyTypeImages[normalizedType] || propertyTypeImages.Default;
  };

  const handleStartJourney = () => {
    user ? navigate('/buy') : navigate('/signup');
  };

  useEffect(() => {
    axios.get('http://localhost:8000/api/random-properties/')
      .then(res => {
        const propertiesData = res.data.properties || [];
        setProperties(Array.isArray(propertiesData) ? propertiesData : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching properties:', err);
        setProperties([]);
        setLoading(false);
      });
    
    // Auto-advance carousel every 5 seconds
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev === 4 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Real estate images for carousel
  const carouselImages = [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1605146769289-440113cc3d00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  ];

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleEstimate = () => {
    if (!user) {
      navigate("/signup");
    } else {
      navigate("estimate");
    }
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen flex flex-col">
      {/* Hero Section with Carousel */}
      <div className="relative h-screen overflow-hidden">
        {/* Carousel Container */}
        <div className="absolute inset-0 transition-transform duration-1000 ease-in-out"
             style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {carouselImages.map((image, index) => (
            <div key={index} className="absolute inset-0 w-full h-full" 
                 style={{ 
                   left: `${index * 100}%`,
                   backgroundImage: `url(${image})`,
                   backgroundSize: 'cover',
                   backgroundPosition: 'center'
                 }}>
            </div>
          ))}
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-blue-900/30"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Find Your Perfect Property
          </h1>
          <p className="text-lg sm:text-xl text-white mb-8 max-w-2xl">
            Discover premium homes and investment opportunities with ZoneWise - 
            your trusted partner in real estate excellence
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button
              onClick={handleStartJourney}
              className="bg-blue-700 text-white px-6 py-3 rounded-full hover:bg-blue-800 transition text-lg"
            >
              Start Your Search
            </button>
          </div>
        </div>
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-white w-6' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <main className="flex-grow py-6 pb-6 px-4 sm:px-6 md:px-10 bg-gray-50">
        {/* Our Mission */}
        <section className="mt-12 sm:mt-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 border-b-4 border-blue-600 inline-block pb-2">
              Our Aim
            </h2>
            <div className="bg-blue-50 p-4 sm:p-6 rounded-xl shadow-md mt-4">
              <p className="text-sm sm:text-base text-gray-80 leading-relaxed">
                At ZoneWise, we're revolutionizing real estate by combining cutting-edge technology 
                with personalized service. Our mission is to make property discovery and investment 
                seamless, transparent, and rewarding for everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose ZoneWise - Updated to 3 items */}
        <section className="mt-12 sm:mt-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 border-b-4 border-blue-600 inline-block pb-2">
            Why Choose ZoneWise?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-2">
            {[
              {
                icon: '🏠',
                title: 'Premium Listings & Market Insights',
                desc: 'Access exclusive properties and comprehensive market data on property values, trends, and investment potential.'
              },
              {
                icon: '🤖',
                title: 'AI-Powered Matching',
                desc: 'Our intelligent algorithms find properties matching your preferences, saving you time and effort in your search.'
              },
              {
                icon: '🏠',
                title: 'Estimation',
                desc: 'Help you to get Estimation of your property with the help of our AI model.'
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MoveMeter Section */}
        <section className="mt-12 sm:mt-16 text-center bg-gradient-to-b from-blue-800 to-blue-600 rounded-2xl p-8 max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">MOVEMETER</h2>
          <p className="text-lg sm:text-xl text-white mb-8 max-w-2xl mx-auto">
            Our Move Meter lets you compare locations based on living affordability, average home
            prices, and other important factors.
          </p>
          <button
            onClick={() => navigate('/compare')}
            className="bg-white text-blue-700 px-6 py-3 rounded-full hover:bg-gray-100 transition text-lg font-semibold"
          >
            EXPLORE
          </button>
        </section>

        {/* ZoneEstimate Section */}
        <section className="mt-12 sm:mt-16 text-center bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4"># Z O N E E S T I M A T E *</h2>
          <p className="text-lg sm:text-xl text-gray-700 mb-2">
            Get an instant estimate on your home*
          </p>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Learn your home's value so you can tackle the real estate market with confidence.
          </p>
          
          <button className="text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700" onClick={handleEstimate}>
            Estimate
          </button>
          
          <p className="text-xs text-gray-500 mt-6 max-w-2xl mx-auto">
            *This is an estimate only and is not an appraisal. The Zone Estimate® provides an estimated market value of your home generated by a proprietary algorithm using aggregated data collected from third parties and public records and is intended to provide you with a general value of the property. The actual appraised value of any property may be higher or lower than the estimated market value provided by the Zone Estimate®.
          </p>
        </section>

        {/* Featured Properties */}
        <section className="mt-12 sm:mt-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 border-b-4 border-blue-600 inline-block pb-2">
            Featured Properties
          </h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : properties.length > 0 ? (
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-6 max-w-6xl mx-auto">
              {properties.map((prop, idx) => (
                <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-lg w-full sm:w-[400px]">
                  <div
                    className="h-48 bg-gray-200 border-2 border-dashed rounded-t-xl w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${getPropertyImage(prop.property_type)})` }}
                  ></div>
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">{prop.property_type}</h3>
                        <p className="text-gray-600">{prop.location}, {prop.city}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Rs.{prop.price?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between mt-4 text-gray-600">
                      <span>{prop.bedrooms} Beds</span>
                      <span>{prop.bathrooms} Baths</span>
                      <span>{prop.area_sqft} sqft</span>
                    </div>
                    <button
                      onClick={() => navigate('property-details', { state: { property: prop } })}
                      className="mt-4 w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No properties available
              </h3>
              <p className="mt-1 text-gray-500">
                Check back later for new property listings
              </p>
            </div>
          )}
        </section>

        {/* Testimonials */}
        <section className="mt-12 sm:mt-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 border-b-4 border-blue-600 inline-block pb-2">
            Client Success Stories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto px-2">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
              <p className="italic text-sm sm:text-base text-gray-700 mb-2">
                "ZoneWise helped us find our dream home in just 3 weeks. Their virtual tour feature saved us countless hours of travel!"
              </p>
              <p className="text-blue-700 font-semibold">- Sarah & James T.</p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
              <p className="italic text-sm sm:text-base text-gray-700 mb-2">
                "As an investor, ZoneWise's market insights are invaluable. I've made two profitable purchases using their analytics tools."
              </p>
              <p className="text-blue-700 font-semibold">- Michael R.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 bg-gradient-to-b from-blue-800 to-blue-600 text-white rounded-2xl p-8 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Find Your Dream Property?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied clients who found their perfect home or investment with ZoneWise
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button
              onClick={handleStartJourney}
              className="bg-white text-blue-800 px-6 py-3 rounded-full hover:bg-gray-100 transition text-lg font-semibold"
            >
              Start Your Search
            </button>
           
          </div>
        </section>
      </main>
    </div>
  );
};

export default MainPage;