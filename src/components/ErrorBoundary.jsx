import React from "react";
import PropTypes from "prop-types";

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null, errorInfo: null };
	}

	static getDerivedStateFromError(error) {
		// Update state so the next render will show the fallback UI
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		// Log the error to an error reporting service
		console.error("ErrorBoundary caught an error:", error, errorInfo);
		this.setState({
			error,
			errorInfo,
		});
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null, errorInfo: null });
	};

	render() {
		if (this.state.hasError) {
			// Fallback UI
			return (
				<div className="flex min-h-screen items-center justify-center bg-neo-lavender p-4">
					<div className="neo-card-3d max-w-2xl w-full p-8">
						<div className="text-center">
							<svg
								className="mx-auto h-16 w-16 text-red-500 mb-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
							<h1 className="neo-text-h1 text-neo-flame mb-4">
								Algo salió mal
							</h1>
							<p className="neo-text-body text-gray-700 mb-6">
								Lo sentimos, ocurrió un error inesperado. Por favor, intenta recargar la página.
							</p>

							{this.props.showDetails && this.state.error && (
								<details className="text-left mb-6 bg-gray-100 p-4 rounded-lg">
									<summary className="cursor-pointer font-semibold text-gray-800 mb-2">
										Detalles del error
									</summary>
									<pre className="text-xs text-red-600 overflow-auto max-h-64">
										{this.state.error.toString()}
										{"\n\n"}
										{this.state.errorInfo?.componentStack}
									</pre>
								</details>
							)}

							<div className="flex gap-4 justify-center">
								<button
									onClick={() => window.location.reload()}
									className="neo-btn neo-btn-primary"
									type="button"
								>
									Recargar página
								</button>
								<button
									onClick={this.handleReset}
									className="neo-btn neo-btn-outline"
									type="button"
								>
									Intentar de nuevo
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

ErrorBoundary.propTypes = {
	children: PropTypes.node.isRequired,
	showDetails: PropTypes.bool,
};

ErrorBoundary.defaultProps = {
	showDetails: false,
};

export default ErrorBoundary;
