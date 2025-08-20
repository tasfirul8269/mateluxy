import React, { useState, useRef } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { useAgents } from '../context/AgentContext';
import Button from '../ui/Button';

const initialFormData = {
  username: '',
  role: 'agent',
  fullName: '',
  email: '',
  password: '',
};

const AddAgentModal = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAddAgentModalOpen, closeAddAgentModal } = useAgents();
  const [formData, setFormData] = useState(initialFormData);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  const usernameCheckTimeout = useRef(null);

  // Wizard step management
  const [step, setStep] = useState(1); // 1: Identity, 2: Role & Review

  const resetState = () => {
    setFormData(initialFormData);
    setIsCheckingUsername(false);
    setIsUsernameAvailable(null);
    setError(null);
    setStep(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'username') {
      const cleanUsername = value.toLowerCase().replace(/\s+/g, '');
      if (!/^[a-z0-9_-]*$/.test(cleanUsername)) {
        setError('Username can only contain lowercase letters, numbers, underscores, and hyphens');
        return;
      }
      setFormData(prev => ({ ...prev, username: cleanUsername }));

      if (usernameCheckTimeout.current) {
        clearTimeout(usernameCheckTimeout.current);
      }
      if (cleanUsername.length >= 3) {
        setIsCheckingUsername(true);
        usernameCheckTimeout.current = setTimeout(async () => {
          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_URL}/api/check-username?username=${encodeURIComponent(cleanUsername)}`,
              { credentials: 'include' }
            );
            if (!response.ok) throw new Error('Failed to check username');
            const data = await response.json();
            setIsUsernameAvailable(data.available);
            setError(data.message || (data.available ? null : 'Username is already taken'));
          } catch (err) {
            console.error('Error checking username:', err);
            setError('Failed to check username availability');
          } finally {
            setIsCheckingUsername(false);
          }
        }, 400);
      } else {
        setIsUsernameAvailable(null);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (name !== 'username') setError(null);
  };

  const canProceedIdentity = () => {
    return (
      formData.fullName.trim().length >= 2 &&
      formData.email.trim().length > 0 &&
      /.+@.+\..+/.test(formData.email) &&
      formData.username.trim().length >= 3 &&
      /^[a-z0-9_-]+$/.test(formData.username) &&
      isUsernameAvailable !== false &&
      formData.password.trim().length >= 8
    );
  };

  const handleCreate = async () => {
    // Final validation
    if (!canProceedIdentity()) {
      setError('Please complete the required fields correctly.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/agents/add-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success == false) {
        setError(data.message || 'An error occurred while adding the agent. Please try again.');
        return;
      }
      // Success
      resetState();
      closeAddAgentModal();
    } catch (err) {
      console.error(err);
      setError('An error occurred while adding the agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step UIs
  const StepIdentity = () => (
    <div className="space-y-4">
      {/* Username */}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          id="password"
          required
        />
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="agent">Agent</option>
            <option value="team">Team Member</option>
          </select>
        </div>
      </div>
    </div>
  );

  const StepReview = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-md p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Review Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Full Name:</span> <span className="font-medium">{formData.fullName || '-'}</span></div>
          <div><span className="text-gray-500">Username:</span> <span className="font-medium">{formData.username || '-'}</span></div>
          <div><span className="text-gray-500">Email:</span> <span className="font-medium">{formData.email || '-'}</span></div>
          <div><span className="text-gray-500">Account Type:</span> <span className="font-medium capitalize">{formData.role}</span></div>
        </div>
      </div>
      <div className="text-xs text-gray-500">
        You can change any details by going back. Click Create Agent to finish.
      </div>
    </div>
  );

  // Progress header
  const Progress = () => (
    <div className="flex items-center mb-4">
      <div className={`flex-1 h-1 rounded ${step >= 1 ? 'bg-red-500' : 'bg-gray-200'}`}></div>
      <div className="mx-2 text-xs text-gray-600">Step {step} of 2</div>
      <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-red-500' : 'bg-gray-200'}`}></div>
    </div>
  );

  return (
    <Modal isOpen={isAddAgentModalOpen} onClose={() => { resetState(); closeAddAgentModal(); }} title="Add Agent">
      <div className="space-y-3">
        <Progress />
        {step === 1 ? <StepIdentity /> : <StepReview />}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Sticky footer actions */}
        <div className="sticky bottom-0 bg-white pt-2">
          <div className="flex items-center gap-2 justify-between">
            <Button
              type="button"
              variant="secondary"
              className="min-w-[100px]"
              onClick={() => {
                if (step === 1) { resetState(); closeAddAgentModal(); } else { setStep(step - 1); }
              }}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>

            {step === 1 && (
              <Button
                type="button"
                variant="primary"
                className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]"
                onClick={() => setStep(2)}
                disabled={!canProceedIdentity()}
              >
                Next
              </Button>
            )}

            {step === 2 && (
              <Button
                type="button"
                variant="primary"
                className="bg-red-600 hover:bg-red-700 text-white min-w-[140px]"
                onClick={handleCreate}
              >
                {loading ? 'Creating...' : 'Create Agent'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddAgentModal;
