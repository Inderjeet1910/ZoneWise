import React, { useState, useEffect } from "react";

// City locations data for rent and sale
const rentCityLocations = {
  Ahmedabad: ["Maninagar", "Navrangpura", "Vastrapur", "Satellite"],
  Bangalore: ["Indiranagar", "Koramangala", "Whitefield", "Jayanagar"],
  Chennai: ["Anna Nagar", "Adyar", "Velachery", "T Nagar"],
  Delhi: ["Rohini", "Vasant Kunj", "Saket", "Dwarka"],
  Hyderabad: ["Banjara Hills", "Kondapur", "Madhapur", "Gachibowli"],
  Jaipur: ["Mansarovar", "Malviya Nagar", "C-Scheme", "Vaishali Nagar"],
  Kolkata: ["Ballygunge", "Howrah", "Salt Lake", "Park Street"],
  Mumbai: ["Juhu", "Andheri", "Bandra", "Powai"],
  Pune: ["Viman Nagar", "Hinjewadi", "Kothrud", "Baner"],
  Surat: ["Katargam", "Athwa", "Vesu", "Adajan"]
};

const saleCityLocations = {
  Ahmedabad: ["Satellite", "Maninagar", "Navrangpura", "Vastrapur"],
  Bangalore: ["Koramangala", "Whitefield", "Jayanagar", "Indiranagar"],
  Chennai: ["Adyar", "Anna Nagar", "T Nagar", "Velachery"],
  Delhi: ["Rohini", "Saket", "Vasant Kunj", "Dwarka"],
  Hyderabad: ["Madhapur", "Banjara Hills", "Kondapur", "Gachibowli"],
  Jaipur: ["Vaishali Nagar", "Malviya Nagar", "Mansarovar", "C-Scheme"],
  Kolkata: ["Salt Lake", "Howrah", "Park Street", "Ballygunge"],
  Mumbai: ["Bandra", "Juhu", "Powai", "Andheri"],
  Pune: ["Hinjewadi", "Viman Nagar", "Baner", "Kothrud"],
  Surat: ["Katargam", "Vesu", "Adajan", "Athwa"]
};

// Property types for rent and sale
const rentPropertyTypes = ["Bungalow", "Villa", "Penthouse", "Apartment"];
const salePropertyTypes = ["Bungalow", "Penthouse", "Villa", "Apartment"];

const amenity_categories = {
  'Basic': ['24x7 Water Supply', 'Electricity Backup', 'Car Parking', 'Security / CCTV', 'Lift / Elevator', 'Waste Disposal', 'Fire Safety'],
  'Lifestyle': ['Gym / Fitness Center', 'Swimming Pool', 'Children\'s Play Area', 'Clubhouse / Community Hall', 'Garden / Park', 'Indoor Games Room', 'Jogging / Cycling Track'],
  'Luxury': ['Smart Home Automation', 'Concierge Services', 'Spa / Sauna / Jacuzzi', 'Private Theatre / Entertainment Room', 'Rooftop Lounge / Terrace Garden', 'Business Center / Co-working Space', 'Valet Parking']
};

function Estimate() {
  const [formData, setFormData] = useState({
    listing_type: "Sale",
    city: "",
    location: "",
    property_type: "",
    bedrooms: "",
    area_sqft: "",
  });
  
  const [amenities, setAmenities] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("basic");

  // Get current locations based on listing type
  const currentLocations = formData.listing_type === "Sale" ? saleCityLocations : rentCityLocations;
  
  // Get current property types based on listing type
  const currentPropertyTypes = formData.listing_type === "Sale" ? salePropertyTypes : rentPropertyTypes;

  // Initialize amenities state
  useEffect(() => {
    const initialAmenities = {};
    Object.keys(amenity_categories).forEach(category => {
      amenity_categories[category].forEach(amenity => {
        initialAmenities[amenity] = false;
      });
    });
    setAmenities(initialAmenities);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "city" && { location: "" }),
      ...(name === "listing_type" && { city: "", location: "", property_type: "" }),
    }));
  };

  const handleAmenityChange = (amenity) => {
    setAmenities(prev => ({
      ...prev,
      [amenity]: !prev[amenity]
    }));
  };

  const handleReset = () => {
    setFormData({
      listing_type: "Sale",
      city: "",
      location: "",
      property_type: "",
      bedrooms: "",
      area_sqft: "",
    });
    
    // Reset amenities
    const resetAmenities = {};
    Object.keys(amenities).forEach(amenity => {
      resetAmenities[amenity] = false;
    });
    setAmenities(resetAmenities);
    
    setResult(null);
    setError(null);
    setActiveSection("basic");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    if (!formData.city || !formData.location || !formData.area_sqft || !formData.property_type) {
      setError("Please fill in all required fields (City, Location, Property Type, Area)");
      setLoading(false);
      return;
    }
    
    if (!formData.bedrooms) {
      setError("Please provide number of bedrooms");
      setLoading(false);
      return;
    }
    
    if (parseFloat(formData.area_sqft) <= 0) {
      setError("Area must be greater than 0");
      setLoading(false);
      return;
    }

    try {
      const selectedAmenities = Object.keys(amenities).filter(amenity => amenities[amenity]);
      
      const payload = {
        listing_type: formData.listing_type.toLowerCase(),
        city: formData.city,
        location: formData.location,
        property_type: formData.property_type,
        bedrooms: parseInt(formData.bedrooms) || 0,
        area_sqft: parseInt(formData.area_sqft),
        amenities: selectedAmenities.join(", ")
      };

      const response = await fetch("http://localhost:8000/api/estimate-price/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch estimate");
      }

      // Calculate ±10% range
      const estimatedPrice = data.estimated_price;
      const priceRange = estimatedPrice * 0.1;
      const minEstimate = estimatedPrice - priceRange;
      const maxEstimate = estimatedPrice + priceRange;

      setResult({
        estimated_price: estimatedPrice,
        minEstimate: minEstimate,
        maxEstimate: maxEstimate,
        price_basis: data.price_basis || "estimate"
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-10xl mx-auto pt-16">
        <div className=" text-white text-center py-8 mb-8 rounded-xl  animate-fade-in-down">
          <h1 className="text-4xl font-extrabold mb-2">Property Price Estimator</h1>
          <p className="text-lg">Discover the market value of your residential property instantly</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-500 ease-in-out">
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 ${
                  activeSection === "basic"
                    ? "bg-blue-600 text-white border-b-4 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setActiveSection("basic")}
              >
                Basic Details
              </button>
              <button
                className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 ${
                  activeSection === "property"
                    ? "bg-blue-600 text-white border-b-4 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setActiveSection("property")}
              >
                Property Details
              </button>
              <button
                className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 ${
                  activeSection === "amenities"
                    ? "bg-blue-600 text-white border-b-4 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setActiveSection("amenities")}
              >
                Amenities
              </button>
            </div>

            <div className="p-6 transition-opacity duration-500 ease-in-out">
              {/* Basic Details Section */}
              <div className={`space-y-6 ${activeSection !== "basic" ? "hidden" : "animate-slide-in-left"}`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type</label>
                  <div className="flex rounded-lg shadow-sm overflow-hidden">
                    <button
                      type="button"
                      className={`flex-1 py-3 px-4 transition-all duration-200 ${
                        formData.listing_type === "Sale"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-blue-50"
                      } border border-gray-300`}
                      onClick={() => setFormData({ ...formData, listing_type: "Sale", city: "", location: "", property_type: "" })}
                    >
                      Sale
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-3 px-4 transition-all duration-200 ${
                        formData.listing_type === "Rent"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-blue-50"
                      } border border-gray-300`}
                      onClick={() => setFormData({ ...formData, listing_type: "Rent", city: "", location: "", property_type: "" })}
                    >
                      Rent
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <option value="">Select City</option>
                    {Object.keys(currentLocations).map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:shadow-md"
                    disabled={!formData.city}
                  >
                    <option value="">Select Location</option>
                    {formData.city &&
                      currentLocations[formData.city].map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSection("property")}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Next: Property Details
                </button>
              </div>

              {/* Property Details Section */}
              <div className={`space-y-6 ${activeSection !== "property" ? "hidden" : "animate-slide-in-right"}`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <option value="">Select Property Type</option>
                    {currentPropertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                  <div className="flex rounded-lg shadow-sm overflow-hidden">
                    <button
                      type="button"
                      aria-label="Decrement bedrooms"
                      className="px-4 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all duration-200"
                      onClick={() =>
                        setFormData({ ...formData, bedrooms: Math.max(0, parseInt(formData.bedrooms || 0) - 1) })
                      }
                    >
                      -
                    </button>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 text-center focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      min="0"
                      placeholder="0"
                    />
                    <button
                      type="button"
                      aria-label="Increment bedrooms"
                      className="px-4 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all duration-200"
                      onClick={() => setFormData({ ...formData, bedrooms: parseInt(formData.bedrooms || 0) + 1 })}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area (sqft)</label>
                  <input
                    type="number"
                    name="area_sqft"
                    value={formData.area_sqft}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:shadow-md"
                    min="0"
                    placeholder="Enter area in square feet"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setActiveSection("basic")}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all duration-200 shadow-md"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection("amenities")}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Next: Amenities
                  </button>
                </div>
              </div>

              {/* Amenities Section */}
              <div className={`space-y-6 ${activeSection !== "amenities" ? "hidden" : "animate-slide-in-right"}`}>
                <h3 className="text-lg font-medium text-gray-800">Select Amenities</h3>
                
                {Object.entries(amenity_categories).map(([category, amenityList]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3">{category}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {amenityList.map(amenity => (
                        <label key={amenity} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={amenities[amenity] || false}
                            onChange={() => handleAmenityChange(amenity)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setActiveSection("property")}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all duration-200 shadow-md"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-blue-300 disabled:to-blue-400 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Estimating...
                      </span>
                    ) : (
                      "Get Estimate"
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estimation Section (Right Side) */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Your Property Estimate</h2>
            {result ? (
              <div className="animate-fade-in">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">ZoneWise ESTIMATE®</h3>
                  <p className="text-4xl font-bold text-gray-900 mb-4 animate-pulse-slow">
                    ₹ {Math.round(result.estimated_price).toLocaleString("en-IN")}
                  </p>
                  <div className="text-sm text-gray-600 mb-4 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7m-7-7v18"
                      ></path>
                    </svg>
                    Residential for {formData.listing_type === "Sale" ? "Sale" : "Rent"}
                  </div>
                  
                  {/* Price Range Display */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-700">ESTIMATE RANGE (±10%)</h4>
                    <div className="flex justify-between mt-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Low Estimate</p>
                        <p className="text-lg font-semibold text-blue-700">
                          ₹ {Math.round(result.minEstimate).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Your Estimate</p>
                        <p className="text-lg font-semibold text-green-700">
                          ₹ {Math.round(result.estimated_price).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-gray-600">High Estimate</p>
                        <p className="text-lg font-semibold text-red-700">
                          ₹ {Math.round(result.maxEstimate).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500">This estimate is based on current market trends and comparable properties in your area.</p>
                </div>
                <button
                  onClick={handleReset}
                  className="mt-6 w-full bg-gradient-to-r from-gray-500 to-gray-700 text-white py-3 px-4 rounded-lg hover:from-gray-600 hover:to-gray-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Start New Estimate
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>Enter property details to see the estimated value.</p>
                {formData.city && (
                  <button
                    onClick={handleReset}
                    className="mt-4 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-all duration-200 shadow-md"
                  >
                    Reset Form
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-white-500">
          <p>© {new Date().getFullYear()} PropertyValue Estimator. All estimates are approximations.</p>
        </div>
      </div>
    </div>
  );
}

export default Estimate;