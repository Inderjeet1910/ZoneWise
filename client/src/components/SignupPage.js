import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignupPage = ({ setUser }) => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({ username: '', email: '', password: '' });
  const [touched, setTouched] = useState({ username: false, email: false, password: false });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const patterns = {
    username: /^[a-zA-Z0-9_]{3,20}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/,
  };

  const validateField = (name, value) => {
    if (!value) return 'This field is required.';
    if (name === 'username' && !patterns.username.test(value)) {
      return '3–20 chars; letters, numbers, underscores only.';
    }
    if (name === 'email' && !patterns.email.test(value)) {
      return 'Enter a valid email address.';
    }
    if (name === 'password' && !patterns.password.test(value)) {
      return 'Min 8 chars incl. upper, lower, number, special.';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validateAll = () => {
    const nextErrors = {
      username: validateField('username', formData.username),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
    };
    setFieldErrors(nextErrors);
    return Object.values(nextErrors).every((v) => v === '');
  };

  const canSubmit =
    formData.username &&
    formData.email &&
    formData.password &&
    Object.values(fieldErrors).every((v) => v === '');

  const getInputClass = (name) => {
    const base = 'w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition';
    const hasError = touched[name] && fieldErrors[name];
    return hasError
      ? base + ' border-red-500 focus:ring-red-300'
      : base + ' border-gray-300 focus:ring-blue-300';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const isValid = validateAll();
    if (!isValid) return;
    try {
      const response = await axios.post('http://localhost:8000/api/signup/', formData, { withCredentials: true });
      setUser(response.data.user);
      setMessage('Signup successful!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-2">Create Account</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Join us to continue</p>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && <p className="text-blue-600 text-center mb-4">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              autoComplete="username"
              pattern="[A-Za-z0-9_]{3,20}"
              title="3–20 characters. Letters, numbers, underscores only."
              className={getInputClass('username')}
            />
            {touched.username && fieldErrors.username && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.username}</p>
            )}
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              autoComplete="email"
              className={getInputClass('email')}
            />
            {touched.email && fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              autoComplete="new-password"
              title="Min 8 chars with upper, lower, number and special character."
              className={getInputClass('password')}
            />
            {touched.password && fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
            )}
            {!fieldErrors.password && touched.password && (
              <p className="mt-1 text-xs text-gray-500">Strong password ✓</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={
              'w-full font-semibold py-2 rounded-md transition ' +
              (canSubmit
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed')
            }
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
