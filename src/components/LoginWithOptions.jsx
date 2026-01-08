import React, { useState } from "react";
import LoginForm from "./LoginForm";
import MagicLinkLogin from "./MagicLinkLogin";

/**
 * Login component with option to switch between password and magic link
 * Magic link is shown first for less friction
 */
export default function LoginWithOptions() {
    const [useMagicLink, setUseMagicLink] = useState(true);

    return (
        <div>
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

            {/* Login Forms */}
            {useMagicLink ? (
                <MagicLinkLogin onSwitchToPassword={() => setUseMagicLink(false)} />
            ) : (
                <LoginForm />
            )}
        </div>
    );
}
