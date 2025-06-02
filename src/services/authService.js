const API_URL = 'http://localhost:5000/api';

export const authService = {
  async login(email, password) {
    try {
      console.log(`Intentando iniciar sesión con: ${email}, URL: ${API_URL}/auth/login`);
      
      // Validar parámetros de entrada
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }
      
      if (!email.includes('@')) {
        throw new Error('Formato de email inválido');
      }
      
      const requestBody = { email: email.trim(), password };
      console.log('Datos de la petición:', { email: email.trim(), password: '***' });
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      });

      console.log('Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        let errorMessage = 'Error en la autenticación';
        let responseText = '';
        
        try {
          responseText = await response.text();
          console.log('Texto de respuesta del error:', responseText);
          
          // Intentar parsear como JSON
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorData.title || errorMessage;
          
          // Si hay errores de validación específicos
          if (errorData.errors) {
            const validationErrors = Object.values(errorData.errors).flat();
            errorMessage = validationErrors.join(', ');
          }
        } catch (parseError) {
          // Si no es JSON válido, usar el texto como está
          errorMessage = responseText || errorMessage;
        }
        
        console.error('Error de autenticación detallado:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          responseText
        });
        
        throw new Error(`Error de autenticación (${response.status}): ${errorMessage}`);
      }

      // El backend puede devolver el token directamente como texto o como objeto JSON
      const contentType = response.headers.get('content-type');
      let token;
      
      if (contentType && contentType.includes('application/json')) {
        // Si es JSON, puede ser un objeto con propiedad token o el token directo
        const data = await response.json();
        console.log('Respuesta JSON del login:', data);
        token = typeof data === 'object' ? (data.token || data.accessToken || data.access_token) : data;
      } else {
        // Si es texto plano, es el token directamente
        token = await response.text();
        console.log('Token recibido como texto:', token ? 'Token válido' : 'Token vacío');
      }

      if (!token || token.trim() === '') {
        throw new Error('El servidor no devolvió un token válido');
      }

      // Limpiar el token de posibles espacios en blanco
      token = token.trim();

      localStorage.setItem('token', token);
      document.cookie = `auth_token=${token}; path=/; max-age=7200; SameSite=Strict`;
      
      console.log('Login exitoso, token guardado');
      return { token }; // Devolvemos un objeto con token para mantener compatibilidad
    } catch (error) {
      console.error('Error de login:', error);
      throw error;
    }
  },

  async register(fullName, email, userName, password) {
    try {
      console.log(`Intentando registrar usuario: ${email}`);
      
      // Validar parámetros de entrada
      if (!fullName || !email || !password) {
        throw new Error('Nombre completo, email y contraseña son requeridos');
      }
      
      if (!email.includes('@')) {
        throw new Error('Formato de email inválido');
      }
      
      const requestBody = { 
        fullName: fullName.trim(), 
        email: email.trim(), 
        userName: userName ? userName.trim() : email.split('@')[0], 
        password 
      };
      
      console.log('Datos de registro:', { ...requestBody, password: '***' });
      
      const response = await fetch(`${API_URL}/users/owner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      });

      console.log('Respuesta del registro:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        let errorMessage = 'Error en el registro';
        let responseText = '';
        
        try {
          responseText = await response.text();
          console.log('Texto de respuesta del error:', responseText);
          
          // Intentar parsear como JSON
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorData.title || errorMessage;
          
          // Si hay errores de validación específicos
          if (errorData.errors) {
            const validationErrors = Object.values(errorData.errors).flat();
            errorMessage = validationErrors.join(', ');
          }
        } catch (parseError) {
          // Si no es JSON válido, usar el texto como está
          errorMessage = responseText || errorMessage;
      }

        throw new Error(`Error de registro (${response.status}): ${errorMessage}`);
      }

      const userData = await response.json();
      console.log('Registro exitoso:', userData);
      return userData;
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