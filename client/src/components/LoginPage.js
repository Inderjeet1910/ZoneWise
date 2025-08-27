import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/,
  };

  const validateField = (name, value) => {
    if (!value) return 'This field is required.';
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
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
    };
    setFieldErrors(nextErrors);
    return Object.values(nextErrors).every((v) => v === '');
  };

  const canSubmit =
    formData.email &&
    formData.password &&
    Object.values(fieldErrors).every((v) => v === '');

  const getInputClass = (name) => {
    const base = 'w-full p-3 border rounded focus:outline-none focus:ring-2 transition';
    const hasError = touched[name] && fieldErrors[name];
    return hasError
      ? base + ' border-red-500 focus:ring-red-300'
      : base + ' border-gray-300 focus:ring-blue-300';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const isValid = validateAll();
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        navigate('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Server error. Try again later.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-blue-700 text-center">
                  <span className="text-blue-600">Zone</span>Wise
        </h2>
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            onBlur={handleBlur}
            value={formData.email}
            required
            autoComplete="email"
            pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
            title="Enter a valid email address."
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
            onChange={handleChange}
            onBlur={handleBlur}
            value={formData.password}
            required
            autoComplete="current-password"
            title="Min 8 chars with upper, lower, number and special character."
            className={getInputClass('password')}
          />
          {touched.password && fieldErrors.password && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className={`w-full py-2 rounded text-white ${
            isSubmitting || !canSubmit ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
