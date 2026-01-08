import React, { useState } from "react";
import RegisterForm from "./RegisterForm";
import MagicLinkForm from "./MagicLinkForm";
import GoogleLoginButton from "./auth/GoogleLoginButton";

/**
 * Register component with option to switch between password and magic link
 * Magic link is shown first for less friction
 */
export default function RegisterWithOptions() {
    const [useMagicLink, setUseMagicLink] = useState(true);

    return (
        <div>
            {/* Google Sign Up Button */}
            <div className="mb-4">
                <GoogleLoginButton />
            </div>

            {/* Divider with "or" */}
            <div className="flex items-center my-4">
                <div className="flex-1 h-px bg-gray-400"></div>
                <span className="px-4 text-sm text-gray-600 font-medium">o regístrate con email</span>
                <div className="flex-1 h-px bg-gray-400"></div>
            </div>

            {/* Toggle Tabs */}
            <div className="flex mb-6 bg-white border-neo border-neo-black rounded-lg overflow-hidden">
                <button
                    type="button"
                    onClick={() => setUseMagicLink(true)}
                    className={`flex-1 py-3 px-4 font-bold text-sm transition-all ${useMagicLink
                        ? 'bg-neo-flame text-white'
                        : 'bg-white text-neo-black hover:bg-gray-100'
                        }`}
                >
                    🔮 Enlace Mágico
                </button>
                <button
                    type="button"
                    onClick={() => setUseMagicLink(false)}
                    className={`flex-1 py-3 px-4 font-bold text-sm transition-all ${!useMagicLink
                        ? 'bg-neo-flame text-white'
                        : 'bg-white text-neo-black hover:bg-gray-100'
                        }`}
                >
                    🔐 Contraseña
                </button>
            </div>

            {/* Register Forms */}
            {useMagicLink ? (
                <MagicLinkForm onSwitchToPassword={() => setUseMagicLink(false)} />
            ) : (
                <RegisterForm />
            )}
        </div>
    );
}
