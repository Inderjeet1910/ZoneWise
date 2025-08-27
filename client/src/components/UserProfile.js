import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Property type to image mapping
const propertyTypeImages = {
  Apartment: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  Penthouse: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  Villa: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  Bungalow: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  default: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
};

const PropertyImage = ({ propertyType, alt }) => {
  const [hasError, setHasError] = useState(false);
  const imageUrl = propertyTypeImages[propertyType] || propertyTypeImages.default;

  if (hasError || !imageUrl) {
    return (
      <div className="bg-gray-200 border-2 border-dashed rounded-t-xl w-full h-48 flex items-center justify-center">
        <span className="text-gray-500">No Image Available</span>
      </div>
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt={alt}
      className="w-full h-48 object-cover rounded-t-xl"
      onError={() => setHasError(true)}
    />
  );
};

const RatingBar = ({ value, label }) => {
  // Convert value to percentage (assuming value is out of 5)
  const percentage = Math.min(100, Math.max(0, (value / 5) * 100));
  
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-800 font-medium">{value}/5</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProperty, setExpandedProperty] = useState(null);

  // Fetch user data and saved properties
  useEffect(() => {
    const fetchUserAndProperties = async () => {
      try {
        // Fetch user profile
        const resUser = await fetch("http://localhost:8000/api/me/", {
          method: "GET",
          credentials: "include",
        });

        if (!resUser.ok) throw new Error("Not authenticated");
        const userData = await resUser.json();
        setUser(userData);

        // Fetch saved properties
        const resProps = await fetch("http://localhost:8000/api/saved-properties/", {
          method: "GET",
          credentials: "include",
        });

        if (resProps.ok) {
          const propsData = await resProps.json();
          setSavedProperties(propsData);
        }

      } catch (error) {
        console.error("Error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProperties();
  }, []);
  
  const toggleExpandProperty = (propertyId) => {
    if (expandedProperty === propertyId) {
      setExpandedProperty(null);
    } else {
      setExpandedProperty(propertyId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md mt-8">
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Please log in to view your profile</h2>
          <p className="text-gray-600 mt-2">You need to be signed in to access this page</p>
          <button 
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            onClick={() => navigate("/login")}
          >
            Login to Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 pt-20">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0 bg-gradient-to-r from-blue-500 to-blue-700 w-full md:w-1/3 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold text-gray-500">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-white">{user.username}</h1>
                <p className="text-blue-100 mt-1">{user.email}</p>
              </div>
            </div>
            
            <div className="p-8 w-full">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
                <button className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition duration-300">
                  Edit Profile
                </button>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                  <p className="mt-1 text-gray-900">{user.email}</p>
                  <p className="mt-1 text-gray-600">+1 (555) 123-4567</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Account Status</h3>
                  <p className="mt-1 text-blue-600 font-medium">Verified Account</p>
                  <p className="mt-1 text-gray-600">Member since 2023</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Notification Preferences</h3>
                  <p className="mt-1 text-gray-900">Email & App Notifications</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Subscription</h3>
                  <p className="mt-1 text-gray-900">Premium Membership</p>
                  <p className="mt-1 text-gray-600">Expires: Dec 12, 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Saved Properties Section */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Saved Properties</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {savedProperties.length} {savedProperties.length === 1 ? 'property' : 'properties'}
            </span>
          </div>
          
          {savedProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProperties.map((prop) => (
                <div key={prop.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <PropertyImage 
                    propertyType={prop.property_type}
                    alt={`${prop.property_type} in ${prop.city}`} 
                  />
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{prop.property_type}</h3>
                        <p className="text-gray-600 mt-1">{prop.city}, {prop.location}</p>
                      </div>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        For Sale
                      </span>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>{prop.bedrooms} BHK</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                        </svg>
                        <span>{prop.area_sqft} sqft</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{prop.location}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Rs.{prop.price?.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {/* Expandable detailed information */}
                    <div className="mt-4">
                      <button 
                        className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium py-2 border-t border-gray-200"
                        onClick={() => toggleExpandProperty(prop.id)}
                      >
                        {expandedProperty === prop.id ? 'Show Less' : 'Show All Details'}
                      </button>
                      
                      {expandedProperty === prop.id && (
                        <div className="pt-4 animate-fadeIn">
                          <h4 className="font-medium text-gray-800 mb-2">Property Ratings</h4>
                          <div className="mb-4">
                            <RatingBar value={prop.Connectivity} label="Connectivity" />
                            <RatingBar value={prop.Neighbourhood} label="Neighbourhood" />
                            <RatingBar value={prop.Safety} label="Safety" />
                            <RatingBar value={prop.Livability} label="Livability" />
                          </div>
                          
                          <h4 className="font-medium text-gray-800 mb-2">Seller Information</h4>
                          <div className="flex items-center mb-4">
                            <div className="bg-gray-200 border-2 border-dashed rounded-full w-8 h-8 mr-2 flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-500">
                                {prop.seller_name?.charAt(0) || 'S'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">{prop.seller_name}</p>
                              <p className="text-xs text-gray-600">{prop.seller_phone}</p>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Listed on: {new Date(prop.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No saved properties</h3>
              <p className="mt-2 text-gray-500">You haven't saved any properties yet. Start browsing to save your favorites!</p>
              <div className="mt-6">
                <button 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate("/properties")}
                >
                  Browse Properties
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;