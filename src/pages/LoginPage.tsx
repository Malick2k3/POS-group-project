import React, { useEffect, useState } from 'react';
import { Lock, Mail, ShoppingCart, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAppContext } from '../context/AppContext';
import { api } from '../lib/api';

const LoginPage: React.FC = () => {
  const { login, register, isLoading, authError } = useAppContext();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    pin: '',
    confirmPin: ''
  });
  const [error, setError] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSetupStatus() {
      try {
        const status = await api.getSetupStatus();

        if (isMounted) {
          setRegistrationOpen(status.registration_open);
        }
      } catch (setupError) {
        if (isMounted) {
          setRegistrationOpen(false);
        }
      } finally {
        if (isMounted) {
          setIsCheckingSetup(false);
        }
      }
    }

    loadSetupStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (isRegistering) {
      if (formData.pin !== formData.confirmPin) {
        setError('PINs do not match');
        return;
      }

      if (!/^\d{4}$/.test(formData.pin)) {
        setError('PIN must be exactly 4 digits');
        return;
      }

      const success = await register(formData.name, formData.email, formData.pin);
      if (success) {
        navigate('/');
      }
      return;
    }

    const success = await login(formData.email, formData.pin);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md rounded-lg shadow-lg overflow-hidden bg-white border border-gray-200">
        <div className="p-8">
          <div className="flex items-center justify-center mb-8">
            <ShoppingCart className="h-10 w-10 text-gray-600" />
            <h1 className="text-2xl font-bold ml-2 text-gray-800">Modern POS</h1>
          </div>

          <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
            {isRegistering ? 'Create the Store Admin Account' : 'Sign in to the register'}
          </h2>

          {!isCheckingSetup && !registrationOpen && !isRegistering && (
            <div className="mb-4 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
              Store setup is complete. New staff accounts must be created by an administrator.
            </div>
          )}

          {(error || authError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error || authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                icon={<User className="h-5 w-5 text-gray-400" />}
                placeholder="John Doe"
                required
              />
            )}

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              icon={<Mail className="h-5 w-5 text-gray-400" />}
              placeholder="john@example.com"
              required
            />

            <Input
              label="PIN"
              type="password"
              name="pin"
              value={formData.pin}
              onChange={handleChange}
              icon={<Lock className="h-5 w-5 text-gray-400" />}
              placeholder="Enter 4-digit PIN"
              maxLength={4}
              required
            />

            {isRegistering && (
              <Input
                label="Confirm PIN"
                type="password"
                name="confirmPin"
                value={formData.confirmPin}
                onChange={handleChange}
                icon={<Lock className="h-5 w-5 text-gray-400" />}
                placeholder="Confirm 4-digit PIN"
                maxLength={4}
                required
              />
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-gray-800 hover:bg-gray-700"
              disabled={isLoading}
            >
              {isLoading ? 'Working...' : isRegistering ? 'Create Store Account' : 'Log In'}
            </Button>
          </form>

          {registrationOpen && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsRegistering((current) => !current);
                  setError('');
                  setFormData({ name: '', email: '', pin: '', confirmPin: '' });
                }}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                {isRegistering ? 'Already have an account? Log in' : 'Set up the first store account'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
