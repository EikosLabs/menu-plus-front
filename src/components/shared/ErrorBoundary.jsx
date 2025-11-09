import React from 'react';

/**
 * ErrorBoundary para capturar errores de React no manejados
 * Evita que la app se rompa completamente
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log del error (en producción enviar a servicio de logging)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Opcional: recargar la página o navegar a home
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Renderizar UI de fallback personalizada
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-neo-lavender flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="neo-card-3d p-6 md:p-8 text-center">
              {/* Icon */}
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-neo-flame"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h1 className="neo-heading neo-h3 mb-2">
                ¡Ups! Algo salió mal
              </h1>

              {/* Description */}
              <p className="neo-text text-neo-gray mb-6">
                Ocurrió un error inesperado. No te preocupes, estamos trabajando para solucionarlo.
              </p>

              {/* Error details (solo en desarrollo) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                  <p className="text-sm font-mono text-red-800 break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={this.handleReset}
                  className="neo-btn neo-btn-primary w-full"
                >
                  Intentar Nuevamente
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="neo-btn neo-btn-secondary w-full"
                >
                  Ir al Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
