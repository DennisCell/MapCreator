import React, { useState } from 'react';
import UserIcon from './icons/UserIcon';
import LockIcon from './icons/LockIcon';
import { supabase } from '../services/supabaseClient';

// No props needed as App.tsx now listens to auth changes globally.
const LoginScreen: React.FC<{}> = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Registratie succesvol! Controleer uw e-mail voor de bevestigingslink.');
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Ongeldige e-mail of wachtwoord.');
    }
    // No onLoginSuccess callback needed; App component will detect the auth state change.
    setLoading(false);
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError('');
    setMessage('');
    setEmail('');
    setPassword('');
  };
  
  const InputField: React.FC<{ type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string; icon: React.ReactNode }> = 
    ({ type, value, onChange, placeholder, icon }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        {icon}
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-slate-100 font-sans">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">MapCreator Pro</h1>
          <p className="text-slate-500 mt-2">{isLoginView ? 'Log in om door te gaan' : 'Maak een nieuw account aan'}</p>
        </div>
        
        <form onSubmit={isLoginView ? handleLogin : handleSignUp} className="space-y-6">
          <InputField
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mailadres"
            icon={<UserIcon />}
          />
          <InputField
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Wachtwoord"
            icon={<LockIcon />}
          />
          
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          {message && <p className="text-sm text-green-600 text-center">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Bezig...' : (isLoginView ? 'Inloggen' : 'Registreren')}
          </button>
        </form>

        <p className="text-sm text-center text-slate-500">
          {isLoginView ? 'Nog geen account?' : 'Heeft u al een account?'}
          <button onClick={toggleView} className="ml-1 font-semibold text-blue-600 hover:underline">
            {isLoginView ? 'Registreer hier' : 'Log hier in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
