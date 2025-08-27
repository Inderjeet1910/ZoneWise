import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaBed, FaBath, FaRulerCombined, FaPhone,
  FaMapMarkerAlt, FaChevronLeft, FaStar,
  FaWifi, FaTree, FaShieldAlt, FaHome,
  FaBookmark, FaRegBookmark
} from "react-icons/fa";

// Utility function to get CSRF token
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Comprehensive rating mapping for all categories
const comprehensiveRatingMap = {
  // Connectivity
  'Excellent': 5,
  'Good': 4,
  'Moderate': 3,
  'Developing': 2,
  'Poor': 1,
  
  // Neighbourhood
  'Premium': 5,
  'Family-friendly': 4,
  'Average': 3,
  'Developing': 2,
  'Poor': 1,
  
  // Safety
  'High': 5,
  'Medium': 3,
  'Low': 1,
  
  // Livability
  'Excellent': 5,
  'Good': 4,
  'Average': 3,
  'Developing': 2,
  'Poor': 1,
  
  // Default
  '': 0
};

const PropertyDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const propertyTypeImages = {
    Apartment: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    Penthouse: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    Villa: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    Bunglow: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwa90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    default: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
  };

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [savedProperties, setSavedProperties] = useState([]);

  // Placeholder image
  const placeholderImage = "https://via.placeholder.com/800x500?text=Property+Image";

  // Fetch current user and saved properties
  useEffect(() => {
    let mounted = true;

    const fetchCurrentUserAndSavedProperties = async () => {
      try {
        const userRes = await fetch('http://localhost:8000/api/me/', {
          credentials: 'include',
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          if (!mounted) return;
          setCurrentUser(userData);

          const savedRes = await fetch('http://localhost:8000/api/saved-properties/', {
            credentials: 'include',
          });

          if (savedRes.ok) {
            const savedData = await savedRes.json();
            if (!mounted) return;
            setSavedProperties(Array.isArray(savedData) ? savedData : []);
          } else {
            if (!mounted) return;
            setSavedProperties([]);
          }
        } else {
          if (!mounted) return;
          setCurrentUser(null);
          setSavedProperties([]);
        }
      } catch (error) {
        console.error('Error:', error);
        if (!mounted) return;
        setCurrentUser(null);
        setSavedProperties([]);
      }
    };

    fetchCurrentUserAndSavedProperties();

    return () => { mounted = false; };
  }, []);

  // Process property data
  useEffect(() => {
    const propertyData = location.state?.property || location.state?.prop;
    
    if (propertyData) {
      // Convert string ratings to numeric values
      const convertRating = (rating) => {
        return comprehensiveRatingMap[rating] || 0;
      };

      // Handle both lowercase and uppercase field names
      const propertyWithDefaults = {
        ...propertyData,
        phone_number: propertyData.phone_number || propertyData.seller_phone || "6465484442",
        contact_no: propertyData.contact_no || "Contact for details",
        seller_name: propertyData.seller_name || "Property Agent",
        price: propertyData.price ?? 0,
        bedrooms: propertyData.bedrooms ?? "N/A",
        bathrooms: propertyData.bathrooms ?? "N/A",
        area_sqft: propertyData.area_sqft ?? propertyData.area ?? "N/A",
        image: propertyData.image ?? propertyData.property_image ?? null,
        amenities: propertyData.amenities ?? propertyData.features ?? "",
        
        // Convert string ratings to numbers using comprehensive mapping
        connectivity: convertRating(propertyData.connectivity ?? propertyData.Connectivity ?? ''),
        neighbourhood: convertRating(propertyData.neighbourhood ?? propertyData.Neighbourhood ?? ''),
        safety: convertRating(propertyData.safety ?? propertyData.Safety ?? ''),
        livability: convertRating(propertyData.livability ?? propertyData.Livability ?? '')
      };
      
      setProperty(propertyWithDefaults);
      setLoading(false);
    } else {
      const timer = setTimeout(() => navigate("/"), 3000);
      setLoading(false);
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  // Check if property is saved
  useEffect(() => {
    if (!property) {
      setIsSaved(false);
      return;
    }

    const match = savedProperties.find(saved => {
      try {
        const savedCity = saved.city ?? saved.city_name ?? saved?.property?.city;
        const savedLocation = saved.location ?? saved.location_name ?? saved?.property?.location;
        const savedType = saved.property_type ?? saved?.property?.property_type;
        const savedPrice = saved.price ?? saved?.property?.price ?? saved?.amount;
        const savedId = saved.id ?? saved.property_id ?? saved.saved_id;

        if (property.id && savedId && String(savedId) === String(property.id)) return true;

        const parsedSavedPrice = savedPrice !== undefined ? Number(savedPrice) : NaN;
        const parsedPropPrice = property.price !== undefined ? Number(property.price) : NaN;

        const cityMatch = (savedCity && property.city) ? 
          String(savedCity).toLowerCase() === String(property.city).toLowerCase() : true;
        const locationMatch = (savedLocation && property.location) ? 
          String(savedLocation).toLowerCase() === String(property.location).toLowerCase() : true;
        const typeMatch = (savedType && property.property_type) ? 
          String(savedType).toLowerCase() === String(property.property_type).toLowerCase() : true;

        const priceMatch = (!isNaN(parsedSavedPrice) && !isNaN(parsedPropPrice))
          ? parsedSavedPrice === parsedPropPrice
          : true;

        return cityMatch && locationMatch && typeMatch && priceMatch;
      } catch (err) {
        return false;
      }
    });

    setIsSaved(Boolean(match));
  }, [property, savedProperties]);

  // Save property
  const saveProperty = async () => {
    if (!property) return;

    if (!currentUser) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (isSaved) return;

    setSaving(true);
    try {
      const csrftoken = getCookie('csrftoken');

      const payload = {
        city: property.city,
        location: property.location,
        property_type: property.property_type,
        bedrooms: Number(property.bedrooms) || null,
        area_sqft: Number(property.area_sqft) || null,
        seller_name: property.seller_name,
        seller_phone: property.phone_number,
        property_image: property.image || placeholderImage,
        price: Number(property.price) || 0,
        Connectivity: Number(property.connectivity) || 0,
        Neighbourhood: Number(property.neighbourhood) || 0,
        Safety: Number(property.safety) || 0,
        Livability: Number(property.livability) || 0
      };

      const response = await fetch('http://localhost:8000/api/save-property/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const responseData = await response.json();

      if (response.ok) {
        setIsSaved(true);
        const savedRecord = (responseData && typeof responseData === 'object' && !Array.isArray(responseData))
          ? responseData
          : { ...payload, id: responseData?.id ?? Date.now() };

        setSavedProperties(prev => {
          const already = prev.some(p => {
            if (savedRecord.id && p.id) return String(p.id) === String(savedRecord.id);
            return (
              String(p.city ?? '').toLowerCase() === String(savedRecord.city ?? '').toLowerCase() &&
              String(p.location ?? '').toLowerCase() === String(savedRecord.location ?? '').toLowerCase() &&
              String(p.property_type ?? '').toLowerCase() === String(savedRecord.property_type ?? '').toLowerCase() &&
              Number(p.price ?? NaN) === Number(savedRecord.price ?? NaN)
            );
          });
          if (already) return prev;
          return [...prev, savedRecord];
        });
      } else {
        console.error('Error saving property:', responseData.error || response.statusText || responseData);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Remove property
  const removeProperty = async () => {
    if (!property || !isSaved) return;
    
    setSaving(true);
    try {
      const csrftoken = getCookie('csrftoken');
      
      const savedProperty = savedProperties.find(saved => {
        const savedCity = saved.city ?? saved.city_name ?? saved?.property?.city;
        const savedLocation = saved.location ?? saved.location_name ?? saved?.property?.location;
        const savedType = saved.property_type ?? saved?.property?.property_type;
        const savedPrice = saved.price ?? saved?.property?.price ?? saved?.amount;
        const savedId = saved.id ?? saved.property_id ?? saved.saved_id;

        if (property.id && savedId && String(savedId) === String(property.id)) return true;

        const parsedSavedPrice = savedPrice !== undefined ? Number(savedPrice) : NaN;
        const parsedPropPrice = property.price !== undefined ? Number(property.price) : NaN;

        const cityMatch = (savedCity && property.city) ? 
          String(savedCity).toLowerCase() === String(property.city).toLowerCase() : true;
        const locationMatch = (savedLocation && property.location) ? 
          String(savedLocation).toLowerCase() === String(property.location).toLowerCase() : true;
        const typeMatch = (savedType && property.property_type) ? 
          String(savedType).toLowerCase() === String(property.property_type).toLowerCase() : true;

        const priceMatch = (!isNaN(parsedSavedPrice) && !isNaN(parsedPropPrice))
          ? parsedSavedPrice === parsedPropPrice
          : true;

        return cityMatch && locationMatch && typeMatch && priceMatch;
      });

      if (!savedProperty) {
        console.error("Property not found");
        return;
      }

      const response = await fetch(`http://localhost:8000/api/remove-property/${savedProperty.id}/`, {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': csrftoken,
        },
        credentials: 'include',
      });

      if (response.ok) {
        setIsSaved(false);
        setSavedProperties(prev => prev.filter(p => p.id !== savedProperty.id));
        // Navigate to saved properties after removal
        navigate('/');
      } else {
        console.error('Error removing property:', response.statusText);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Toggle save state
  const toggleSaveProperty = async () => {
    if (isSaved) {
      await removeProperty();
    } else {
      await saveProperty();
    }
  };

  // Render star ratings
  const renderRatingStars = (value) => {
    const stars = [];
    const rating = Math.min(5, Math.max(0, Number(value) || 0));
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`${i <= rating ? 'text-blue-400' : 'text-gray-300'} inline-block`}
        />
      );
    }
    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-2 text-sm font-medium text-gray-700">
          ({rating}/5)
        </span>
      </div>
    );
  };

  // Format amenities
  const formattedAmenities = property?.amenities
    ? property.amenities.split(',').map(a => a.trim()).filter(Boolean).map(a => a.charAt(0).toUpperCase() + a.slice(1))
    : [];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-blue-800">Loading property details...</p>
        </div>
      </div>
    );
  }

  // Property not found
  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-6">Property Not Found</h2>
          <p className="mt-2 text-gray-600">
            Redirecting you back to the homepage...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 pt-20 pb-8">
      {/* Main Content Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl my-8 overflow-hidden">
        {/* Property Image Header with Action Buttons */}
        <div className="relative">
          <img
            src={propertyTypeImages[property.property_type] || propertyTypeImages.default}
            alt={`${property.property_type} in ${property.location}`}
            className="w-full h-96 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = propertyTypeImages.default;
            }}
          />

          {/* Action Buttons */}
          <div className="absolute top-4 left-4 right-4 flex justify-between">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg shadow-md flex items-center transition-all duration-200 font-medium"
            >
              <FaChevronLeft className="mr-2" /> Back
            </button>

            {/* Save/Remove Button */}
            <button
              onClick={toggleSaveProperty}
              disabled={saving}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                isSaved
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : saving
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isSaved ? "Removing..." : "Saving..."}
                </>
              ) : isSaved ? (
                <>
                  <FaBookmark className="mr-2" />
                  Remove
                </>
              ) : currentUser ? (
                <>
                  <FaRegBookmark className="mr-2" />
                  Save
                </>
              ) : (
                <>
                  <FaRegBookmark className="mr-2" />
                  Login to Save
                </>
              )}
            </button>
          </div>

          {/* Price Tag */}
          <div className="absolute bottom-6 right-6 bg-blue-800 text-white px-6 py-3 rounded-lg shadow-lg">
            <div className="text-2xl font-bold">₹{Number(property.price || 0).toLocaleString("en-IN")}</div>
            <div className="text-sm opacity-80">Price</div>
          </div>
        </div>

        {/* Property Details */}
        <div className="p-8">
          {/* Location and Title */}
          <div className="mb-6">
            <div className="flex items-center text-blue-600 mb-2">
              <FaMapMarkerAlt className="mr-2" />
              <span>{property.city}, {property.location}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{property.property_type} in {property.location}</h1>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-blue-50 rounded-xl">
            <div className="flex flex-col items-center">
              <FaBed className="text-2xl text-blue-600 mb-2" />
              <span className="text-lg font-semibold">{property.bedrooms}</span>
              <span className="text-sm text-gray-600">Bedrooms</span>
            </div>

            <div className="flex flex-col items-center">
              <FaBath className="text-2xl text-blue-600 mb-2" />
              <span className="text-lg font-semibold">{property.bathrooms || "N/A"}</span>
              <span className="text-sm text-gray-600">Bathrooms</span>
            </div>

            <div className="flex flex-col items-center">
              <FaRulerCombined className="text-2xl text-blue-600 mb-2" />
              <span className="text-lg font-semibold">{property.area_sqft} sqft</span>
              <span className="text-sm text-gray-600">Area</span>
            </div>

            <div className="flex flex-col items-center">
              <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-lg font-semibold">{property.property_type}</span>
              <span className="text-sm text-gray-600">Type</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-blue-800 mb-3">Description</h2>
            <p className="text-gray-700">
              Beautiful {property.property_type.toLowerCase()} located in the prime area of {property.location}, {property.city}.
              This property features {property.bedrooms} spacious bedrooms and modern amenities.
              With a total area of {property.area_sqft} sqft, it offers ample space for comfortable living.
            </p>
          </div>

          {/* Neighborhood Ratings */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-blue-800 mb-4">Neighborhood Ratings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <FaWifi className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Connectivity</h3>
                  {renderRatingStars(property.connectivity)}
                </div>
              </div>

              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <FaTree className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Neighbourhood</h3>
                  {renderRatingStars(property.neighbourhood)}
                </div>
              </div>

              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <FaShieldAlt className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Safety</h3>
                  {renderRatingStars(property.safety)}
                </div>
              </div>

              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <FaHome className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Livability</h3>
                  {renderRatingStars(property.livability)}
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-blue-800 mb-3">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {formattedAmenities.length > 0 ? (
                formattedAmenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {amenity}
                  </span>
                ))
              ) : (
                <p className="text-gray-600">No amenities listed</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-blue-800 mb-4">Contact Information</h2>

            <div className="flex items-center mb-6">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-lg">{property.seller_name}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone</label>
                <div className="flex items-center p-3 bg-white rounded-lg border border-blue-200">
                  <FaPhone className="text-blue-600 mr-3" />
                  <span className="text-lg font-medium">{property.phone_number}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Contact</label>
                <div className="flex items-center p-3 bg-white rounded-lg border border-blue-200">
                  <FaPhone className="text-blue-600 mr-3" />
                  <span className="text-lg font-medium">{property.contact_no}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;