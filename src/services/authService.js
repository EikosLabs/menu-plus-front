const API_URL = 'http://localhost:5000/api';

export const authService = {
  async login(email, password) {
    try {
      console.log(`Intentando iniciar sesión con: ${email}, URL: ${API_URL}/auth/login`);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (!response.ok) {
        let errorMessage = 'Error en la autenticación';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData || errorMessage;
        } catch (e) {
        }
        throw new Error(`Error de autenticación (${response.status}): ${errorMessage}`);
      }

      const data = await response.json();
      if (!data.token) {
        throw new Error('El servidor no devolvió un token válido');
      }

      localStorage.setItem('token', data.token);
      
      document.cookie = `auth_token=${data.token}; path=/; max-age=7200; SameSite=Strict`;
      
      return data;
    } catch (error) {
      console.error('Error de login:', error);
      throw error;
    }
  },

  async register(fullName, email, userName, password) {
    try {
      const response = await fetch(`${API_URL}/users/owner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          fullName, 
          email, 
          userName, 
          password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData || 'Error en el registro');
      }

      return await response.json();
    } catch (error) {
      console.error('Error de registro:', error);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  },

  getToken() {
    // Primero intentar obtener el token de localStorage
    const localToken = localStorage.getItem('token');
    if (localToken) {
      console.log('Token encontrado en localStorage');
      return localToken;
    }

    // Si no está en localStorage, buscar en las cookies
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
    if (authCookie) {
      const token = authCookie.split('=')[1];
      console.log('Token encontrado en cookies');
      // Guardar el token en localStorage para futuras referencias
      localStorage.setItem('token', token);
      return token;
    }
    
    console.warn('No se encontró token ni en localStorage ni en cookies');
    return null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },
  
  getUserId() {
    try {
      const token = this.getToken();
      if (!token) {
        console.warn('No token available. User is not authenticated.');
        return null;
      }
      
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        console.error('Invalid token format: Missing payload.');
        return null;
      }
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      const userIdFromToken = payload.userId || 
                            payload.sub || 
                            payload.nameid ||
                            payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      
      if (userIdFromToken) {
        const numericUserId = parseInt(userIdFromToken, 10);
        if (!isNaN(numericUserId)) {
          return numericUserId;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
};

export default authService; 