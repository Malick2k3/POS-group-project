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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.06),_transparent_34%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-stretch overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/60 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden overflow-hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.12),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.96)_0%,_rgba(15,23,42,1)_100%)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight">Modern POS</p>
                <p className="text-sm text-slate-300">Retail operations workspace</p>
              </div>
            </div>

            <div className="mt-16 max-w-md">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-slate-400">Store operations</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
                Run checkout, inventory, and reporting from one workspace.
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-300">
                Built for retail teams that need a clean register flow, stronger stock visibility, and reliable staff
                account controls.
              </p>
            </div>
          </div>

          <div className="relative grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Checkout</p>
              <p className="mt-2 text-sm text-white">Barcode-friendly and stock-aware.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Inventory</p>
              <p className="mt-2 text-sm text-white">Status, pricing, and low-stock visibility.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Access</p>
              <p className="mt-2 text-sm text-white">Role-aware staff management.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">Modern POS</p>
                  <p className="text-sm text-slate-500">Retail operations workspace</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">
                {isRegistering ? 'Initial setup' : 'Sign in'}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                {isRegistering ? 'Create the store admin account' : 'Sign in to the register'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {isRegistering
                  ? 'Set up the first account that will manage staff access, inventory, and reporting.'
                  : 'Use your staff email and 4-digit PIN to access the workspace.'}
              </p>
            </div>

            {!isCheckingSetup && !registrationOpen && !isRegistering && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Store setup is complete. New staff accounts must be created by an administrator.
              </div>
            )}

            {(error || authError) && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error || authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-2">
              {isRegistering && (
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  icon={<User className="h-5 w-5" />}
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
                icon={<Mail className="h-5 w-5" />}
                placeholder="john@example.com"
                required
              />

              <Input
                label="PIN"
                type="password"
                name="pin"
                value={formData.pin}
                onChange={handleChange}
                icon={<Lock className="h-5 w-5" />}
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
                  icon={<Lock className="h-5 w-5" />}
                  placeholder="Confirm 4-digit PIN"
                  maxLength={4}
                  required
                />
              )}

              <Button type="submit" variant="primary" className="mt-4 w-full" disabled={isLoading}>
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
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                >
                  {isRegistering ? 'Already have an account? Log in' : 'Set up the first store account'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
