import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import Input from '../../AdminSignIn/ui/Input';
import Button from '../../AdminSignIn/ui/Button';
import Checkbox from '../../AdminSignIn/ui/Checkbox';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SignInForm = () => {
  const navigate = useNavigate();
  const initialFormData = {
    email: '',
    password: '',
    rememberMe: false,
  };
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for forgot password flow
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetEmailError, setResetEmailError] = useState(null);
  
  // Load saved rememberMe preference from localStorage when component mounts
  useEffect(() => {
    const savedRememberMe = localStorage.getItem('agentRememberMe') === 'true';
    if (savedRememberMe) {
      setFormData(prev => ({
        ...prev,
        rememberMe: true
      }));
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
    setLoading(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        setLoading(true);
        setIsSubmitting(true);
        setError(null);

        // Log the rememberMe value for debugging
        console.log('Remember Me:', formData.rememberMe);

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        });
  
        const data = await res.json();

        if (!res.ok || data.success === false) {
          setLoading(false);
          setIsSubmitting(false);
          setError(data.message || "Invalid credentials. Please try again.");
          return;
        }

        // Success - store rememberMe preference in localStorage for future reference
        if (formData.rememberMe) {
          localStorage.setItem('agentRememberMe', 'true');
        } else {
          localStorage.removeItem('agentRememberMe');
        }

        setLoading(false);
        setIsSubmitting(false);
        setError(null);
        
        // Show success message
        toast.success('Signed in successfully!');
        
        // Navigate to agent panel
        navigate('/agent-pannel');
      } catch (error) {
        setLoading(false);
        setIsSubmitting(false);
        setError('An error occurred. Please try again.');
      }
    }
  };

  // Handle forgot password submit
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    // Validate email
    if (!resetEmail) {
      setResetEmailError('Email is required');
      return;
    } else if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      setResetEmailError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setResetEmailError(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        setResetEmailError(data.message || 'Failed to send reset email');
        setIsSubmitting(false);
        return;
      }

      setResetEmailSent(true);
      setIsSubmitting(false);
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error) {
      setResetEmailError('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Reset the forgot password form
  const resetForgotPasswordForm = () => {
    setShowForgotPassword(false);
    setResetEmail('');
    setResetEmailSent(false);
    setResetEmailError(null);
  };

  return (
    <div className="w-full animate-fadeIn">
      {showForgotPassword ? (
        <div className="space-y-5">
          <div className="flex items-center mb-4">
            <button
              type="button"
              onClick={resetForgotPasswordForm}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" />
              <span>Back to login</span>
            </button>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">Reset your password</h3>
          <p className="text-gray-600 text-sm mb-4">
            Enter your email address and we'll send you instructions to reset your password.
          </p>

          {resetEmailSent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
              <p className="font-medium">Reset email sent!</p>
              <p className="text-sm mt-1">Please check your inbox and follow the instructions to reset your password.</p>
              <button
                type="button"
                onClick={resetForgotPasswordForm}
                className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Return to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <Input
                label="Email address"
                type="email"
                name="resetEmail"
                id="resetEmail"
                autoComplete="email"
                placeholder="you@example.com"
                value={resetEmail}
                onChange={(e) => {
                  setResetEmail(e.target.value);
                  setResetEmailError(null);
                }}
                error={resetEmailError}
                icon={<Mail size={18} />}
                required
              />

              {resetEmailError && (
                <div className="flex items-start text-red-500 text-sm">
                  <AlertCircle size={16} className="mr-1 mt-0.5 flex-shrink-0" />
                  <span>{resetEmailError}</span>
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isSubmitting}
                className="mt-6 bg-blue-600 hover:bg-blue-700"
              >
                Send reset instructions
              </Button>
            </form>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email address"
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={<Mail size={18} />}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={<Lock size={18} />}
            required
          />

          <div className="flex items-center justify-between">
            <Checkbox
              id="rememberMe"
              name="rememberMe"
              label="Remember me"
              checked={formData.rememberMe}
              onChange={handleChange}
            />

            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <Button 
            type="submit" 
            fullWidth 
            size="lg" 
            isLoading={isSubmitting} 
            className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-100 hover:shadow-blue-200 transform transition-all duration-300 hover:-translate-y-1"
          >
            Sign in
          </Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      )}
    </div>
  );
};

export default SignInForm; 