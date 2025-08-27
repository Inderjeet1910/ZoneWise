import React, { useState, useEffect } from "react";
import axios from "axios";

const UserListings = () => {
  const [formData, setFormData] = useState({
    listing_type: "Sell",
    category: "Residential",
    property_type: "",
    city: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    price: "",
    image: "",
    description: "",
    phone_number: "",
  });

  const [listings, setListings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("listings");
  const [formErrors, setFormErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user + listings
  useEffect(() => {
    fetchUserAndProperties();
  }, []);

  const fetchUserAndProperties = async () => {
    try {
      // Fetch user profile
      const resUser = await axios.get("http://localhost:8000/api/me/", {
        withCredentials: true,
      });
      setUser(resUser.data);

      // Fetch listings
      const resListings = await axios.get(
        "http://localhost:8000/api/properties_listings_get/",
        { withCredentials: true }
      );
      setListings(resListings.data);
    } catch (err) {
      console.error("Error fetching user or properties:", err);
      if (err.response?.status === 401) {
        // Handle authentication error
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
    
    // Generate image preview if image URL changes
    if (name === "image" && value) {
      setImagePreview(value);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    const requiredFields = ['property_type', 'city', 'location', 'price'];
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        errors[field] = "This field is required";
      }
    });
    
    // Validate price is positive number
    if (formData.price && (isNaN(formData.price) || parseFloat(formData.price) <= 0)) {
      errors.price = "Please enter a valid positive price";
    }
    
    // Validate phone number (10 digits, optional +91 prefix)
    if (formData.phone_number) {
      const phoneRegex = /^(\+91\s?)?[6-9]\d{9}$/;
      if (!phoneRegex.test(formData.phone_number)) {
        errors.phone_number = "Please enter a valid 10-digit phone number";
      }
    }
    
    // Validate area if provided
    if (formData.area && (isNaN(formData.area) || parseFloat(formData.area) <= 0)) {
      errors.area = "Please enter a valid positive area";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const payload = {
        ...formData,
        // Only include user_id and owner_name if backend expects them
        // user_id: user?.id,
        // owner_name: user?.full_name,
      };

      const response = await axios.post("http://localhost:8000/api/properties_listings/", payload, {
        withCredentials: true,
      });

      // Show success message
      alert("Property listing created successfully!");

      setFormData({
        listing_type: "Sell",
        category: "Residential",
        property_type: "",
        city: "",
        location: "",
        bedrooms: "",
        bathrooms: "",
        area: "",
        price: "",
        image: "",
        description: "",
        phone_number: "",
      });
      
      setImagePreview(null);
      setFormErrors({});

      fetchUserAndProperties(); // refresh
      setActiveTab("listings");
    } catch (err) {
      console.error("Error saving listing:", err);
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert("Failed to create listing. Please try again.");
      }
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:8000/api/properties_listings/${id}/`, {
        withCredentials: true,
      });
      setListings(listings.filter((listing) => listing.id !== id));
      alert("Listing deleted successfully!");
    } catch (err) {
      console.error("Error deleting listing:", err);
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert("Failed to delete listing. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-600 p-6 pt-20">
      <div className="max-w-7xl mx-auto pt-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-white">Property Listings</h1>
          <p className="text-lg text-white">Manage your property Listing portfolio</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-10">
          <div className="bg-white rounded-xl shadow-sm p-1 inline-flex">
            <button
              onClick={() => setActiveTab("listings")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "listings"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Your Listings
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "add"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Add New Listing
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "add" ? (
          /* Add Listing Form */
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center mb-8">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Add New Property</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-blue-50 rounded-xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Listing Type
                    </label>
                    <div className="flex rounded-md shadow-sm">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, listing_type: "Sell"})}
                        className={`flex-1 py-3 px-4 rounded-l-md text-sm font-medium ${
                          formData.listing_type === "Sell" 
                            ? "bg-blue-600 text-white" 
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Sell
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, listing_type: "Rent"})}
                        className={`flex-1 py-3 px-4 rounded-r-md text-sm font-medium ${
                          formData.listing_type === "Rent" 
                            ? "bg-blue-600 text-white" 
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Rent
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <div className="flex rounded-md shadow-sm">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, category: "Residential"})}
                        className={`flex-1 py-3 px-4 rounded-l-md text-sm font-medium ${
                          formData.category === "Residential" 
                            ? "bg-blue-600 text-white" 
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Residential
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, category: "Commercial"})}
                        className={`flex-1 py-3 px-4 rounded-r-md text-sm font-medium ${
                          formData.category === "Commercial" 
                            ? "bg-blue-600 text-white" 
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Commercial
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <input
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleChange}
                    placeholder="e.g. Apartment, Villa, Office"
                    className={`w-full border ${
                      formErrors.property_type ? "border-red-400" : "border-gray-300"
                    } rounded-lg shadow-sm px-4 py-3 focus:border-blue-500 focus:ring-blue-500`}
                  />
                  {formErrors.property_type && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.property_type}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className={`w-full border ${
                      formErrors.city ? "border-red-400" : "border-gray-300"
                    } rounded-lg shadow-sm px-4 py-3 focus:border-blue-500 focus:ring-blue-500`}
                  />
                  {formErrors.city && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Full address"
                    className={`w-full border ${
                      formErrors.location ? "border-red-400" : "border-gray-300"
                    } rounded-lg shadow-sm px-4 py-3 focus:border-blue-500 focus:ring-blue-500`}
                  />
                  {formErrors.location && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.location}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <div className="relative">
                    <select
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      className="w-full border-gray-300 rounded-lg shadow-sm px-4 py-3 focus:border-blue-500 focus:ring-blue-500 appearance-none"
                    >
                      <option value="">Select bedrooms</option>
                      <option value="1">1 Bedroom</option>
                      <option value="2">2 Bedrooms</option>
                      <option value="3">3 Bedrooms</option>
                      <option value="4">4 Bedrooms</option>
                      <option value="5+">5+ Bedrooms</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms
                  </label>
                  <div className="relative">
                    <select
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      className="w-full border-gray-300 rounded-lg shadow-sm px-4 py-3 focus:border-blue-500 focus:ring-blue-500 appearance-none"
                    >
                      <option value="">Select bathrooms</option>
                      <option value="1">1 Bathroom</option>
                      <option value="2">2 Bathrooms</option>
                      <option value="3">3 Bathrooms</option>
                      <option value="4+">4+ Bathrooms</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area (sqft)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      placeholder="0"
                      type="number"
                      min="0"
                      className="w-full border-gray-300 rounded-lg shadow-sm pl-4 pr-12 py-3 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">sqft</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      type="number"
                      min="0"
                      className={`w-full border ${
                        formErrors.price ? "border-red-400" : "border-gray-300"
                      } rounded-lg shadow-sm pl-7 pr-12 py-3 focus:border-blue-500 focus:ring-blue-500`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">INR</span>
                    </div>
                  </div>
                  {formErrors.price && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500">+91</span>
                    </div>
                    <input
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className={`w-full border ${
                        formErrors.phone_number ? "border-red-400" : "border-gray-300"
                      } rounded-lg shadow-sm pl-12 py-3 focus:border-blue-500 focus:ring-blue-500`}
                    />
                  </div>
                  {formErrors.phone_number && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.phone_number}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full border-gray-300 rounded-lg shadow-sm px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                  />
                  
                  {imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Image Preview</p>
                      <div className="border rounded-lg overflow-hidden max-w-xs">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d1d5db' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cpath d='M21 15l-5-5-5 5'%3E%3C/path%3E%3Cpath d='M12 15l5-5'%3E%3C/path%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your property in detail..."
                    rows="4"
                    className="w-full border-gray-300 rounded-lg shadow-sm px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("listings")}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Save Listing
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Listings Table */
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Your Property Listings</h2>
                <p className="text-gray-600">
                  {listings.length} property listing(s)
                </p>
              </div>
              <button
                onClick={() => setActiveTab("add")}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New
              </button>
            </div>
            
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Loading your listings...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center rounded-full bg-blue-100 p-4 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No listings yet</h3>
                <p className="text-gray-500 mb-6">
                  Get started by adding your first property listing.
                </p>
                <button
                  onClick={() => setActiveTab("add")}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create Listing
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-8 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {listings.map((listing) => (
                      <tr key={listing.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-lg overflow-hidden">
                              {listing.image ? (
                                <img className="h-12 w-12 object-cover" src={listing.image} alt={listing.property_type} />
                              ) : (
                                <div className="h-12 w-12 flex items-center justify-center text-blue-600">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{listing.property_type}</div>
                              <div className="text-sm text-gray-500">{listing.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            "bg-blue-100 text-blue-800"
                          }`}>
                            {listing.listing_type}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{listing.city}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{listing.location}</div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {listing.bedrooms && `${listing.bedrooms} bed`}{listing.bathrooms && ` • ${listing.bathrooms} bath`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {listing.area && `${listing.area} sqft`}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{listing.price.toLocaleString()}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDelete(listing.id)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200 flex items-center justify-end w-full"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListings;