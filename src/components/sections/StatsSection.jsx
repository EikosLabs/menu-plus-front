import React from "react";

const StatsSection = () => {
	return (
		<section className="mb-6 animate-fadeIn rounded-xl bg-white p-6 shadow-lg">
			<div className="mb-4 flex items-center">
				<div className="mr-4 rounded-full bg-blue-100 p-3">
					<svg
						className="h-6 w-6 text-blue-600"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
				</div>
				<h2 className="font-bold text-[#1A3A54] text-xl md:text-2xl">Estadísticas</h2>
			</div>
			<p className="mb-6 text-gray-600">
				Esta función estará disponible próximamente. ¡Mantente atento a las actualizaciones!
			</p>
			<div className="mb-4 rounded-lg border-blue-400 border-l-4 bg-blue-50 p-4">
				<p className="text-blue-700 text-sm">
					Aquí podrás ver estadísticas sobre las visitas a tu menú, platos populares y más.
				</p>
			</div>
		</section>
	);
};

export default StatsSection;