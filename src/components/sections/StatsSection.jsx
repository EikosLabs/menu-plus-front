import React from "react";

const StatsSection = ({ businesses }) => {
	console.log('StatsSection businesses:', businesses);
	if (businesses && businesses.length > 0) {
		businesses.forEach(b => {
			console.log(`Business ${b.name} menus:`, b.menus);
		});
	}

	// Calcular total de escaneos
	const totalScans = businesses?.reduce((acc, business) => {
		const businessScans = business.menus?.reduce((menuAcc, menu) => {
            // Support both camelCase and PascalCase just in case
            const count = menu.scanCount || menu.ScanCount || 0;
            return menuAcc + count;
        }, 0) || 0;
		return acc + businessScans;
	}, 0) || 0;

	return (
		<div className="animate-fadeIn space-y-6">
			{/* Resumen General */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Total Scans Card */}
				<div className="neo-card-3d p-6 relative overflow-hidden group">
					<div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
						<svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
							<path d="M11 11a1 1 0 100 2h2a1 1 0 100-2h-2z" />
							<path d="M11 15a1 1 0 100 2h2a1 1 0 100-2h-2z" />
							<path d="M15 11a1 1 0 100 2h2a1 1 0 100-2h-2z" />
							<path d="M15 15a1 1 0 100 2h2a1 1 0 100-2h-2z" />
						</svg>
					</div>
					
					<div className="relative z-10">
						<h3 className="neo-heading neo-h5 text-gray-600 mb-2">Total Escaneos QR</h3>
						<div className="flex items-baseline gap-2">
							<span className="text-4xl sm:text-5xl font-black text-neo-flame">
								{totalScans.toLocaleString()}
							</span>
							<span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
								Total histórico
							</span>
						</div>
						<p className="mt-4 text-sm text-gray-500 font-medium">
							Veces que tus menús han sido visualizados
						</p>
					</div>
				</div>

				{/* Active Menus Card */}
				<div className="neo-card-3d p-6 relative overflow-hidden">
					<div className="relative z-10">
						<h3 className="neo-heading neo-h5 text-gray-600 mb-2">Menús Activos</h3>
						<div className="text-4xl sm:text-5xl font-black text-neo-blue">
							{businesses?.reduce((acc, b) => acc + (b.menus?.length || 0), 0) || 0}
						</div>
						<p className="mt-4 text-sm text-gray-500 font-medium">
							Menús digitales publicados
						</p>
					</div>
				</div>

				{/* Businesses Card */}
				<div className="neo-card-3d p-6 relative overflow-hidden">
					<div className="relative z-10">
						<h3 className="neo-heading neo-h5 text-gray-600 mb-2">Negocios</h3>
						<div className="text-4xl sm:text-5xl font-black text-neo-yellow">
							{businesses?.length || 0}
						</div>
						<p className="mt-4 text-sm text-gray-500 font-medium">
							Establecimientos registrados
						</p>
					</div>
				</div>
			</div>

			{/* Detalle por Negocio */}
			<div className="mt-8">
				<h3 className="neo-heading neo-h3 mb-6 flex items-center gap-2">
					<span className="text-neo-flame">📊</span> Desglose por Negocio
				</h3>
				
				<div className="grid gap-6">
					{businesses?.map((business) => (
						<div key={business.id} className="neo-surface neo-border rounded-xl overflow-hidden">
							<div className="bg-gray-50 p-4 border-b-neo-thick border-black flex justify-between items-center">
								<div className="flex items-center gap-3">
									{business.imageKey ? (
										<img 
											src={`/api/images/${business.imageKey}`} 
											alt={business.name}
											className="w-10 h-10 rounded-full object-cover border-2 border-black"
										/>
									) : (
										<div className="w-10 h-10 rounded-full bg-neo-yellow border-2 border-black flex items-center justify-center text-xl">
											🏢
										</div>
									)}
									<h4 className="neo-heading neo-h4 m-0">{business.name}</h4>
								</div>
								<div className="text-sm font-bold bg-black text-white px-3 py-1 rounded-full">
									{business.menus?.reduce((acc, m) => acc + (m.scanCount || m.ScanCount || 0), 0) || 0} visitas
								</div>
							</div>
							
							<div className="p-4">
								{business.menus && business.menus.length > 0 ? (
									<div className="space-y-4">
										{business.menus.map((menu) => (
											<div key={menu.id} className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-gray-100 hover:border-neo-blue transition-colors">
												<div>
													<p className="font-bold text-lg">{menu.name}</p>
													<p className="text-sm text-gray-500">{menu.description || 'Sin descripción'}</p>
												</div>
												<div className="text-right">
													<p className="text-2xl font-black text-neo-flame">{menu.scanCount || menu.ScanCount || 0}</p>
													<p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Escaneos</p>
												</div>
											</div>
										))}
									</div>
								) : (
									<p className="text-center text-gray-500 py-4 italic">
										Este negocio aún no tiene menús creados.
									</p>
								)}
							</div>
						</div>
					))}

					{(!businesses || businesses.length === 0) && (
						<div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
							<p className="text-xl text-gray-400 font-bold">No hay datos para mostrar</p>
							<p className="text-gray-500 mt-2">Crea tu primer negocio para ver estadísticas.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default StatsSection;
