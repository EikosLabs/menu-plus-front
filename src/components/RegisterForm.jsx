import React, { useState } from 'react';
import authService from '../services/authService';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    userName: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Si el campo userName está vacío, usamos el email como userName
      const userData = {
        ...formData,
        userName: formData.userName || formData.email.split('@')[0]
      };

      await authService.register(
        userData.fullName,
        userData.email,
        userData.userName,
        userData.password
      );
      
      setSuccess(true);
      // Esperar 2 segundos antes de redirigir al login
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError('Error en el registro. Por favor, verifica tus datos e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
        ¡Registro exitoso! Serás redirigido a la página de inicio de sesión en unos momentos...
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-[#0A3342] mb-1">
          Nombre Completo
        </label>
        <input
          type="text"
          name="fullName"
          id="fullName"
          required
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-[#E05C33] focus:border-[#E05C33] placeholder-slate-400"
          placeholder="Tu Nombre Completo"
          value={formData.fullName}
          onChange={handleChange}
        />
      </div>
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
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="userName" className="block text-sm font-medium text-[#0A3342] mb-1">
          Nombre de Usuario (opcional)
        </label>
        <input
          type="text"
          name="userName"
          id="userName"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-[#E05C33] focus:border-[#E05C33] placeholder-slate-400"
          placeholder="Si no lo ingresas, usaremos tu email"
          value={formData.userName}
          onChange={handleChange}
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
          placeholder="Crea una contraseña segura"
          value={formData.password}
          onChange={handleChange}
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#E05C33] hover:bg-[#FF9B54] text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#E05C33] focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Procesando...' : 'Registrarme'}
        </button>
      </div>
    </form>
  );
} 