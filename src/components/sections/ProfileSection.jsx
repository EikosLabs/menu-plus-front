import React from "react";

const ProfileSection = () => {
	return (
		<section className="mb-6 animate-fadeIn rounded-xl bg-white p-6 shadow-lg">
			<div className="mb-4 flex items-center">
				<div className="mr-4 rounded-full bg-purple-100 p-3">
					<svg
						className="h-6 w-6 text-purple-600"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						/>
					</svg>
				</div>
				<h2 className="font-bold text-[#1A3A54] text-xl md:text-2xl">Mi Perfil</h2>
			</div>
			<p className="mb-6 text-gray-600">
				Esta función estará disponible próximamente. ¡Mantente atento a las actualizaciones!
			</p>
			<div className="mb-4 rounded-lg border-purple-400 border-l-4 bg-purple-50 p-4">
				<p className="text-purple-700 text-sm">
					Aquí podrás actualizar tus datos personales, cambiar tu contraseña y configurar preferencias.
				</p>
			</div>
		</section>
	);
};

export default ProfileSection;