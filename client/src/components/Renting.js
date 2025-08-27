
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const propertyTypeImages = {
  Apartment: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  Penthouse: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  Villa: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  Bunglow: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwa90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
};

const cities = [
  "Chennai", "Delhi", "Ahmedabad", "Pune", "Mumbai",
  "Jaipur", "Hyderabad", "Kolkata", "Surat", "Bangalore"
];

const locations = {
  Chennai: ["Anna Nagar", "Adyar", "Velachery", "T Nagar"],
  Delhi: ["Rohini", "Vasant Kunj", "Saket", "Dwarka"],
  Ahmedabad: ["Maninagar", "Navrangpura", "Vastrapur", "Satellite"],
  Pune: ["Viman Nagar", "Hinjewadi", "Kothrud", "Baner"],
  Mumbai: ["Juhu", "Andheri", "Bandra", "Powai"],
  Jaipur: ["Mansarovar", "Malviya Nagar", "C-Scheme", "Vaishali Nagar"],
  Hyderabad: ["Banjara Hills", "Kondapur", "Madhapur", "Gachibowli"],
  Kolkata: ["Ballygunge", "Howrah", "Salt Lake", "Park Street"],
  Surat: ["Katargam", "Athwa", "Vesu", "Adajan"],
  Bangalore: ["Indiranagar", "Koramangala", "Whitefield", "Jayanagar"],
};

const amenitiesOptions = [
  "24x7 Water Supply", "Electricity Backup", "Car Parking", "Security / CCTV", "Lift / Elevator",
  "Waste Disposal", "Fire Safety", "Luxury", "Rooftop Lounge / Terrace Garden", "Smart Home Automation",
  "Concierge Services", "Private Theatre / Entertainment Room", "Spa / Sauna / Jacuzzi", "Valet Parking",
  "Business Center / Co-working Space", "Lifestyle", "Gym / Fitness Center", "Children’s Play Area",
  "Indoor Games Room", "Swimming Pool", "Clubhouse / Community Hall", "Garden / Park", "Jogging / Cycling Track"
];

const propertyTypes = ["Apartment", "Penthouse", "Villa", "Bungalow"];

const Renting = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    City: "",
    Location: "",
    "Property Type": "",
    Bedrooms: "",
    "Area (sqft)": "",
    "Price (INR)": "",
    amenities: [],
  });

  const [locationsList, setLocationsList] = useState([]);
  const [showAmenities, setShowAmenities] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Validate numeric inputs
    if (["Bedrooms", "Area (sqft)", "Price (INR)"].includes(name)) {
      if (value && (isNaN(value) || parseFloat(value) < 0)) {
        setError(`Invalid value for ${name}. Please enter a positive number.`);
        return;
      }
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "City" && { Location: "" }),
    }));
    setError(null);
  };

  const handleAmenitiesChange = (amenity) => {
    setFormData((prev) => {
      const updatedAmenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities: updatedAmenities };
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRecommendations([]);
    setError(null);

    // Validate form data
    if (!formData.City || !formData.Location || !formData["Property Type"]) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (!formData.Bedrooms) {
      setError("Please specify the number of bedrooms.");
      setLoading(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch("http://localhost:8000/api/recommend/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amenities: formData.amenities.join(","),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("API Response:", data);

      if (!Array.isArray(data)) {
        throw new Error("Invalid API response: Expected an array of recommendations.");
      }

      setRecommendations(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        err.name === "AbortError"
          ? "Request timed out. Please try again."
          : "Failed to fetch data. Check your network or API endpoint."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.City) {
      setLocationsList(locations[formData.City] || []);
      if (!formData.Location || !locations[formData.City]?.includes(formData.Location)) {
        setFormData((prev) => ({ ...prev, Location: locations[formData.City]?.[0] || "" }));
      }
    } else {
      setLocationsList([]);
      setFormData((prev) => ({ ...prev, Location: "" }));
    }
  }, [formData.City]);

  return (
    <div className="min-h-screen bg-gray-50 pt-10">
      <div className="bg-gradient-to-b from-blue-800 to-blue-600 py-12 text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Dream Rental</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Discover premium rental homes across India's top cities.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-5 sticky top-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-5 pb-2 border-b border-gray-200">
                Filter Properties
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="city">
                    City
                  </label>
                  <select
                    id="city"
                    name="City"
                    value={formData.City}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    aria-required="true"
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="location">
                    Location
                  </label>
                  <select
                    id="location"
                    name="Location"
                    value={formData.Location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    aria-required="true"
                  >
                    <option value="">Select Location</option>
                    {locationsList.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <div className="space-y-2">
                    {propertyTypes.map((pt) => (
                      <div key={pt} className="flex items-center">
                        <input
                          type="radio"
                          name="Property Type"
                          id={`property-type-${pt}`}
                          value={pt}
                          checked={formData["Property Type"] === pt}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          required
                          aria-required="true"
                        />
                        <label htmlFor={`property-type-${pt}`} className="ml-2 text-gray-700 text-sm">
                          {pt}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="bedrooms">
                    Bedrooms (BHK)
                  </label>
                  <input
                    type="number"
                    id="bedrooms"
                    name="Bedrooms"
                    min="1"
                    max="10"
                    value={formData.Bedrooms}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    aria-required="true"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="area">
                      Area (sqft)
                    </label>
                    <input
                      type="number"
                      id="area"
                      name="Area (sqft)"
                      min="100"
                      value={formData["Area (sqft)"]}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="price">
                      Price (INR)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
                        ₹
                      </span>
                      <input
                        type="number"
                        id="price"
                        name="Price (INR)"
                        value={formData["Price (INR)"]}
                        onChange={handleChange}
                        className="w-full pl-8 pr-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="No limit"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">Amenities</label>
                    <button
                      type="button"
                      onClick={() => setShowAmenities(!showAmenities)}
                      className="text-blue-600 text-xs hover:text-blue-800"
                      aria-expanded={showAmenities}
                    >
                      {showAmenities ? "Hide" : "Show"}
                    </button>
                  </div>
                  {showAmenities && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {amenitiesOptions.map((amenity) => (
                        <div key={amenity} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`amenity-${amenity}`}
                            value={amenity}
                            checked={formData.amenities.includes(amenity)}
                            onChange={() => handleAmenitiesChange(amenity)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`amenity-${amenity}`} className="ml-2 text-gray-700 text-sm capitalize">
                            {amenity}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 px-4 rounded font-bold text-white shadow transition-all text-sm ${
                    loading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Searching..." : "Find Properties"}
                </button>
              </form>
            </div>
          </div>

          <div className="w-full lg:w-3/4">
            {recommendations.length > 0 && recommendations[0] && (
              <div className="bg-blue-50 rounded-lg shadow p-5 mb-6 border border-blue-100">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-blue-800 mb-1">
                      Estimated Rental Value
                    </h3>
                    <p className="text-blue-600 text-sm">
                      Based on your search criteria
                    </p>
                  </div>
                  <div className="mt-3 md:mt-0">
                    <div className="text-2xl md:text-3xl font-bold text-blue-800">
                      ₹{recommendations[0]["Price (INR)"] ? recommendations[0]["Price (INR)"].toLocaleString("en-IN") : '0'} Per Month
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Rentals For You
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {recommendations.length > 0 ? `${recommendations.length} rentals found` : "No filters applied"}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {/* Sort dropdown would go here */}
                </div>
              </div>

              {recommendations.length > 0 ? (
                <div className="space-y-5">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id || `${rec.City}-${rec.Location}-${Math.random()}`}
                      className="border border-gray-200 rounded-lg overflow-hidden transition-shadow hover:shadow-md"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-2/5">
                          <img
                            src={propertyTypeImages[rec["Property Type"]] || propertyTypeImages.default}
                            alt={`${rec["Property Type"] || 'Property'} in ${rec.Location}`}
                            className="w-full h-56 object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = propertyTypeImages.default;
                            }}
                          />
                        </div>
                        <div className="p-5 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-lg text-gray-900">
                                {rec.Location}, {rec.City}
                              </h4>
                              <p className="text-gray-600 text-sm mt-1">
                                {rec["Property Type"]}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-sm">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                              </svg>
                              <span>{rec.Bedrooms || 'N/A'} Beds</span>
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5 3a2 2 0 00-2 2h8a2 2 0 012 2v2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                              </svg>
                              <span>{rec["Area (sqft)"] || 'N/A'} sqft</span>
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.106-.057.27-.418.447-.418h2.24c.177 0 .34.36.447.418l4.86 2.718A2 2 0 0116 12v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a2 2 0 01.573-1.864l4.86-2.718zM6 4a2 2 0 012-2h4a2 2 0 012 2v2H6V4z" />
                              </svg>
                              <span>₹{rec["Price (INR)"] ? rec["Price (INR)"].toLocaleString("en-IN") : '0'} Per Month</span>
                            </div>
                            {rec.amenities && (
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 2a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                                <span>{rec.amenities.split(",").map(a => a.trim()).join(", ") || 'N/A'}</span>
                              </div>
                            )}
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
                  <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No rentals found
                  </h3>
                  <p className="mt-1 text-gray-500">
                    Try adjusting your search filters to find matching rentals
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

export default Renting;