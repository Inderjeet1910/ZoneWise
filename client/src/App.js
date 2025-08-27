import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import SignupPage from './components/SignupPage';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Buy from './components/Buy';
import Residential from './components/Residential';
import PropertyDetails from './components/PropertyDetail';
import UserProfile  from './components/UserProfile';
import Estimate  from './components/Estimate';
import UserListings from './components/UserListings';
import Renting from './components/Renting';
import ZoneMeter from './components/ZoneMeter';
import ScrollManager from './components/ScrollManager';
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/me/', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data); 
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <ScrollManager />
      <Routes>
        <Route path="/" element={<MainPage user={user} />} />
        <Route path="/signup" element={<SignupPage setUser={setUser} />} />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/buy" element={<Buy />} />
        <Route path="/buy/residential" element={<Residential />} />
        <Route path="/property-details" element={<PropertyDetails />} />
        <Route path='/profile' element={<UserProfile/>}/>
        <Route path='/estimate' element={<Estimate/>}/>
        <Route path='/listings' element={<UserListings/>}/>
        <Route path='/renting' element={<Renting/>}/>
        <Route path='/compare' element={<ZoneMeter/>}/>
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;