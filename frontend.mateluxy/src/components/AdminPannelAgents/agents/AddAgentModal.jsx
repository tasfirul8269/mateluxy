import React, { useState, useRef } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { useAgents } from '../context/AgentContext';
import Button from '../ui/Button';

const initialFormData = {
  username: '',
  fullName: '',
  email: '',
  password: '',
};

const AddAgentModal = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAddAgentModalOpen, closeAddAgentModal, addAgent } = useAgents();
  const [formData, setFormData] = useState(initialFormData);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  const usernameCheckTimeout = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for username
    if (name === 'username') {
      // Convert to lowercase and remove spaces
      const cleanUsername = value.toLowerCase().replace(/\s+/g, '');
      if (!/^[a-z0-9_-]*$/.test(cleanUsername)) {
        setError('Username can only contain lowercase letters, numbers, underscores, and hyphens');
        return;
      }
      
      setFormData(prev => ({ ...prev, username: cleanUsername }));
      
      // Clear any existing timeout
      if (usernameCheckTimeout.current) {
        clearTimeout(usernameCheckTimeout.current);
      }
      
      // Check username availability if valid length
      if (cleanUsername.length >= 3) {
        setIsCheckingUsername(true);
        usernameCheckTimeout.current = setTimeout(async () => {
          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_URL}/api/check-username?username=${encodeURIComponent(cleanUsername)}`,
              {
                credentials: 'include'
              }
            );
            
            if (!response.ok) {
              throw new Error('Failed to check username');
            }
            
            const data = await response.json();
            setIsUsernameAvailable(data.available);
            setError(data.message || (data.available ? null : 'Username is already taken'));
          } catch (err) {
            console.error('Error checking username:', err);
            setError('Failed to check username availability');
          } finally {
            setIsCheckingUsername(false);
          }
        }, 500);
      } else {
        setIsUsernameAvailable(null);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (name !== 'username') {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate username
    if (!formData.username || formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    if (isUsernameAvailable === false) {
      setError('Username is already taken');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/agents/add-agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success == false) {
        setLoading(false);
        setError(data.message || "An error occurred while adding the agent. Please try again.");
        return;
      }
      setLoading(false);
      setFormData(initialFormData); // clear form
      closeAddAgentModal();

    } catch (error) {
      setLoading(false);
      setError('An error occurred while adding the agent. Please try again.');
    }
  };

  return (
    <Modal isOpen={isAddAgentModalOpen} onClose={closeAddAgentModal} title="Add Agent">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            id="username"
            required
            placeholder="Lowercase letters, numbers, _ or -"
            pattern="[a-z0-9_-]*"
            className={isCheckingUsername ? 'pr-10' : ''}
          />
          {isCheckingUsername && (
            <div className="absolute right-2 top-9">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            </div>
          )}
          {!isCheckingUsername && isUsernameAvailable !== null && (
            <div className="absolute right-2 top-9">
              {isUsernameAvailable ? (
                <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          )}
        </div>
        <Input
          label="Full Name"
          name="fullName"
          placeholder="eg. John Doe"
          value={formData.fullName}
          onChange={handleChange}
          id="fullName"
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="example@gmail.com"
          value={formData.email}
          onChange={handleChange}
          id="email"
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          id="password"
          required
        />
        <div className="pt-2">
          <Button type="submit" variant="primary" fullWidth className="bg-blue-100 hover:bg-blue-200 text-blue-600">
            {loading ? 'Adding...' : 'Add Agent'}
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </Modal>
  );
};

export default AddAgentModal;