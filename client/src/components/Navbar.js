import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 950);
  const [scrolled, setScrolled] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [intendedRoute, setIntendedRoute] = useState(null);

  const handleResize = () => {
    setIsMobileView(window.innerWidth < 950);
    if (window.innerWidth >= 950) setIsMenuOpen(false);
  };

  const handleScroll = () => {
    setScrolled(window.scrollY > 10);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/logout/', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const requireAuth = (route) => {
    if (!user) {
      setIntendedRoute(route);
      setShowAuthPrompt(true);
      return false;
    }
    return true;
  };

  // Navigation handlers
  const handleBuyClick = () => {
    if (requireAuth('/buy')) {
      navigate('/buy');
    }
  };

  const handleSellClick = () => {
    if (requireAuth('/listings')) {
      navigate('/listings');
    }
  };
  const handleProfile=()=>{
    navigate('/profile')
  }

  const handleEstimate = () => {
    if (requireAuth('/estimate')) {
      navigate('/estimate');
    }
  }

  const handleRenting=()=>{
     if (requireAuth('/renting')) {
      navigate('/renting');
    }
  }

  const navLinks = (
    <>
      <button onClick={() => navigate('/')} className="hover:text-blue-700 transition-colors">Home</button>
      <button onClick={handleBuyClick} className="hover:text-blue-700 transition-colors">Buy</button>
      <button onClick={handleSellClick} className="hover:text-blue-700 transition-colors">List Property</button>
      <button onClick={handleRenting} className="hover:text-blue-700 transition-colors">Rent</button>
      <button onClick={() => navigate('/compare')} className="hover:text-blue-700 transition-colors">Communities</button>
      <button onClick={handleEstimate} className="hover:text-blue-700 transition-colors">Estimation</button>
    </>
  );

  return (
    <nav className={`bg-white px-6 py-2 flex justify-between items-center fixed w-full z-50 transition-all duration-300 ${scrolled ? 'shadow-md py-3' : 'py-4'}`}>
      <div className="text-2xl font-bold text-blue-800 cursor-pointer" onClick={() => navigate('/')}>
        <span className="text-blue-600">Zone</span>Wise
      </div>

      {!isMobileView && (
        <div className="flex space-x-8 text-base font-medium text-gray-800">
          {navLinks}
        </div>
      )}

      {!isMobileView && (
        <div className="space-x-4">
          {user ? (
            <>
              <span className="text-blue-700 font-semibold"><button onClick={handleProfile}>My Profile</button></span>
              <button 
                onClick={handleLogout} 
                className="border border-blue-700 text-blue-700 px-4 py-2 rounded hover:bg-blue-50 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')} 
                className="border border-blue-700 text-blue-700 px-4 py-2 rounded hover:bg-blue-50 transition-colors"
              >
                Log In
              </button>
              <button 
                onClick={() => navigate('/signup')} 
                className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      )}

      {isMobileView && (
        <div onClick={() => setIsMenuOpen(!isMenuOpen)} className="cursor-pointer text-blue-800">
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </div>
      )}

      {isMobileView && isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 space-y-3 z-50">
          <div className="flex flex-col items-start space-y-3 text-gray-800 text-base font-medium">
            {navLinks}
          </div>
          <hr className="my-2" />
          {user ? (
            <div className="flex flex-col space-y-3 w-full">
              <span className="text-blue-700 font-semibold pb-2">Welcome, {user.username}</span>
              <button 
                onClick={handleLogout} 
                className="border border-blue-700 text-blue-700 px-4 py-2 rounded hover:bg-blue-50 transition-colors text-left"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-3 w-full">
              <button 
                onClick={() => { navigate('/login'); setIsMenuOpen(false); }} 
                className="border border-blue-700 text-blue-700 px-4 py-2 rounded hover:bg-blue-50 transition-colors text-left"
              >
                Log In
              </button>
              <button 
                onClick={() => { navigate('/signup'); setIsMenuOpen(false); }} 
                className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors text-left"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}

      {showAuthPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAuthPrompt(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold text-gray-900">Authentication required</h3>
              <button onClick={() => setShowAuthPrompt(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-5">Please log in or create an account to continue.</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowAuthPrompt(false); setIsMenuOpen(false); navigate('/login'); }}
                className="flex-1 border border-blue-700 text-blue-700 px-4 py-2 rounded hover:bg-blue-50 transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => { setShowAuthPrompt(false); setIsMenuOpen(false); navigate('/signup'); }}
                className="flex-1 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors"
              >
                Sign Up
              </button>
            </div>
            {intendedRoute && (
              <p className="mt-3 text-xs text-gray-500">After authentication, access to {intendedRoute} will be available.</p>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;