import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const cities = [
  "Ahmedabad", "Bangalore", "Chennai", "Delhi", "Hyderabad", "Jaipur",
  "Kolkata", "Mumbai", "Pune", "Surat"
];

const propertyTypes = ["Apartment", "Penthouse", "Villa", "Bunglow"];

// High-quality property images for each property type
const propertyTypeImages = {
  Apartment: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  Penthouse: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  Villa: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  Bunglow: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwa90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
};

const amenitiesList = [
  "clubhouse", "garden", "gym", "lift", "parking", "pool", "security"
];

const cityLocations = {
  Ahmedabad: ["Maninagar", "Vastrapur", "Satellite", "Navrangpura"],
  Bangalore: ["Koramangala", "Whitefield", "Indiranagar", "Jayanagar"],
  Chennai: ["Adyar", "T Nagar", "Velachery", "Anna Nagar"],
  Delhi: ["Vasant Kunj", "Dwarka", "Rohini", "Saket"],
  Hyderabad: ["Madhapur", "Gachibowli", "Banjara Hills", "Kondapur"],
  Jaipur: ["Vaishali Nagar", "C-Scheme", "Mansarovar", "Malviya Nagar"],
  Kolkata: ["Park Street", "Ballygunge", "Salt Lake", "Howrah"],
  Mumbai: ["Andheri", "Powai", "Juhu", "Bandra"],
  Pune: ["Kothrud", "Viman Nagar", "Baner", "Hinjewadi"],
  Surat: ["Athwa", "Katargam", "Vesu", "Adajan"]
};

// Placeholder image for properties without images
const placeholderImage = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80";

const Residential = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  const [formData, setFormData] = useState({
    city: queryParams.get('city') || "",
    location: queryParams.get('locality') || "",
    property_type: "",
    bedrooms: "",
    area_sqft: "",
    amenities: [],
    max_price: ""
  });

  const [locations, setLocations] = useState([]);
  const [showAmenities, setShowAmenities] = useState(false);
  const [regressionPrice, setRegressionPrice] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Persist and restore filters/results so navigating away and back retains state
  const STORAGE_KEY = 'residentialState';

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === 'object') {
          if (saved.formData && typeof saved.formData === 'object') {
            setFormData((prev) => ({ ...prev, ...saved.formData }));
          }
          if (Array.isArray(saved.recommendations)) {
            setRecommendations(saved.recommendations);
          }
          if (typeof saved.regressionPrice === 'number') {
            setRegressionPrice(saved.regressionPrice);
          }
        }
      }
    } catch (err) {
      console.error("Error restoring state:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      const toSave = JSON.stringify({ formData, recommendations, regressionPrice });
      sessionStorage.setItem(STORAGE_KEY, toSave);
    } catch (err) {
      console.error("Error saving state:", err);
    }
  }, [formData, recommendations, regressionPrice]);

  useEffect(() => {
    if (formData.city) {
      setLocations(cityLocations[formData.city] || []);
      if (!formData.location || !cityLocations[formData.city]?.includes(formData.location)) {
        setFormData(prev => ({ ...prev, location: cityLocations[formData.city]?.[0] || "" }));
      }
    } else {
      setLocations([]);
      setFormData(prev => ({ ...prev, location: "" }));
    }
  }, [formData.city]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRegressionPrice(null);
    setRecommendations([]);
    setError(null);

    try {
      const res = await axios.post("http://localhost:8000/api/recommend_properties/", {
        ...formData,
        amenities: formData.amenities.join(",")
      }, {
        timeout: 10000
      });
      
      setRegressionPrice(res.data.regression_price);
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || "Error fetching recommendations");
      } else if (err.code === "ECONNABORTED") {
        setError("Request timed out. Please try again.");
      } else {
        setError("Network error. Please check your connection.");
      }
      setRecommendations([]);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setFormData({
      city: "",
      location: "",
      property_type: "",
      bedrooms: "",
      area_sqft: "",
      amenities: [],
      max_price: ""
    });
    setRegressionPrice(null);
    setRecommendations([]);
    setError(null);
  };

  const handleViewDetails = (property) => {
    navigate("/property-details", { state: { property } });
  };

  // Safely check if recommendations exist and have length
  const hasRecommendations = Array.isArray(recommendations) && recommendations.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-10">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 py-12 text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Dream Home</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Discover premium homes, apartments, and plots for sale across India's top cities.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-5 sticky top-6 border border-gray-200" style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
              <div className="flex justify-between items-center mb-5 pb-2 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">
                  Filter Properties
                </h3>
                <button
                  onClick={handleReset}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Reset
                </button>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select City</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Location</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {propertyTypes.map((pt) => (
                      <div key={pt} className="flex items-center">
                        <input
                          type="radio"
                          name="property_type"
                          id={pt}
                          value={pt}
                          checked={formData.property_type === pt}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          required
                        />
                        <label htmlFor={pt} className="ml-2 text-gray-700 text-sm">
                          {pt}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      BHK <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      min="1"
                      max="10"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Area (sqft) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="area_sqft"
                      min="100"
                      value={formData.area_sqft}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Budget (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="max_price"
                      min="0"
                      value={formData.max_price}
                      onChange={handleChange}
                      className="w-full pl-8 pr-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="No limit"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">
                      Amenities
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAmenities(!showAmenities)}
                      className="text-blue-600 text-xs hover:text-blue-800"
                    >
                      {showAmenities ? "Hide" : "Show"}
                    </button>
                  </div>
                  
                  {showAmenities && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {amenitiesList.map((a) => (
                        <div
                          key={a}
                          onClick={() => handleAmenityToggle(a)}
                          className={`flex items-center p-2 rounded cursor-pointer transition-colors text-sm ${
                            formData.amenities.includes(a)
                              ? "bg-blue-100 border border-blue-300"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          <div className={`h-4 w-4 rounded flex items-center justify-center mr-2 ${
                            formData.amenities.includes(a)
                              ? "bg-blue-600"
                              : "border border-gray-300"
                          }`}>
                            {formData.amenities.includes(a) && (
                              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-gray-700 capitalize">{a}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 py-2 px-4 rounded font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 shadow transition-all text-sm"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-2 px-4 rounded font-bold text-white shadow transition-all text-sm ${
                      loading
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {loading ? "Searching..." : "Find Properties"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Properties Listing */}
          <div className="w-full lg:w-3/4" style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
            {(regressionPrice || hasRecommendations) && (
              <div className="bg-blue-50 rounded-lg shadow p-5 mb-6 border border-blue-100">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-blue-800 mb-1">
                      Estimated Property Value
                    </h3>
                    <p className="text-blue-600 text-sm">
                      Based on your search criteria
                    </p>
                  </div>
                  <div className="mt-3 md:mt-0">
                    <div className="text-2xl md:text-3xl font-bold text-blue-800">
                      ₹{regressionPrice ? regressionPrice.toLocaleString("en-IN") : '0'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Properties For Sale
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {hasRecommendations ? `${recommendations.length} properties found` : "No filters applied"}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {/* Sort dropdown would go here */}
                </div>
              </div>

              {hasRecommendations ? (
                <div className="space-y-5">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg overflow-hidden transition-shadow hover:shadow-md"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Property Image - Using property type image */}
                        <div className="md:w-2/5">
                          <img 
                            src={propertyTypeImages[rec.property_type] || placeholderImage} 
                            alt={`${rec.property_type} in ${rec.location}`}
                            className="w-full h-56 object-cover"
                          />
                        </div>
                        
                        {/* Property Details */}
                        <div className="p-5 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-lg text-gray-900">
                                {rec.location}
                              </h4>
                              <p className="text-gray-600 text-sm mt-1">
                                {rec.city}
                              </p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {rec.property_type}
                            </span>
                          </div>
                          
                          <div className="mt-4 flex items-center text-gray-700 text-sm">
                            <div className="flex items-center mr-4">
                              <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                              </svg>
                              <span>{rec.bedrooms} Beds</span>
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                              </svg>
                              <span>{rec.area_sqft} sqft</span>
                            </div>
                          </div>
                          
                          <div className="mt-5 flex justify-between items-center">
                            <div className="text-xl font-bold text-gray-900">
                              ₹{rec.price ? rec.price.toLocaleString("en-IN") : '0'}
                            </div>
                            <button 
                              onClick={() => handleViewDetails({
                                ...rec,
                                contact_no: rec.contact_no || "Contact for details"
                              })}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded transition-colors text-sm flex items-center"
                            >
                              View Details
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No properties found
                  </h3>
                  <p className="mt-1 text-gray-500">
                    Try adjusting your search filters to find matching properties
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Residential;