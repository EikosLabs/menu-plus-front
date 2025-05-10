import React, { useState } from 'react';
import authService from '../services/authService';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      
      // Guardar token en localStorage
      localStorage.setItem('token', response.token);
      
      // Guardar token en cookie para SSR
      document.cookie = `auth_token=${response.token}; path=/; max-age=7200; SameSite=Strict`;
      
      window.location.href = '/dashboard'; // Redirige al dashboard tras inicio de sesión exitoso
    } catch (err) {
      setError('Credenciales incorrectas. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#0A3342] mb-1">
          Correo Electrónico
        </label>
        <input
          type="email"
          name="email"
          id="email"
          required
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-[#E05C33] focus:border-[#E05C33] placeholder-slate-400"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#0A3342] mb-1">
          Contraseña
        </label>
        <input
          type="password"
          name="password"
          id="password"
          required
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-[#E05C33] focus:border-[#E05C33] placeholder-slate-400"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="text-right">
        <a href="#" className="text-sm text-[#E05C33] hover:underline">
          ¿Olvidaste tu contraseña?
        </a>
      </div>
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#E05C33] hover:bg-[#FF9B54] text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#E05C33] focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Procesando...' : 'Ingresar'}
        </button>
      </div>
    </form>
  );
} 