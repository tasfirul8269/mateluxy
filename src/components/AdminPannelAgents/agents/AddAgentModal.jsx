import React, { useState } from 'react';
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLoading(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        setError("An error occurred while adding the agent. Please try again.");
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
        <Input
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          id="username"
          required
        />
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