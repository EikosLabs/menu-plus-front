import React from "react";

const LoadingSpinner = ({ message = "Cargando información..." }) => {
	return (
		<div className="flex h-screen items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
			<div className="flex flex-col items-center rounded-xl bg-white p-8 shadow-xl">
				<div className="h-16 w-16 animate-spin rounded-full border-[#1a1a1a] border-t-4 border-b-4" />
				<p className="mt-4 font-medium text-[#004E71] text-lg">{message}</p>
			</div>
		</div>
	);
};

export default LoadingSpinner;