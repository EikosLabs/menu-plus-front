import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

/**
 * Interactive map component showing business location
 * @param {Object} props
 * @param {number} props.latitude - Business latitude
 * @param {number} props.longitude - Business longitude
 * @param {string} props.businessName - Business name for marker popup
 * @param {string} props.address - Business address
 */
export default function BusinessMap({ latitude, longitude, businessName, address }) {
	const mapRef = useRef(null);
	const mapInstanceRef = useRef(null);

	useEffect(() => {
		// Only run on client side
		if (typeof window === 'undefined' || !latitude || !longitude) return;

		// Import Leaflet dynamically to avoid SSR issues
		import('leaflet').then((L) => {
			// Clean up previous map instance
			if (mapInstanceRef.current) {
				mapInstanceRef.current.remove();
			}

			// Fix for default marker icon
			delete L.Icon.Default.prototype._getIconUrl;
			L.Icon.Default.mergeOptions({
				iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
				iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
				shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
			});

			// Create map
			const map = L.map(mapRef.current, {
				center: [latitude, longitude],
				zoom: 15,
				scrollWheelZoom: false,
			});

			mapInstanceRef.current = map;

			// Add tile layer (OpenStreetMap)
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				maxZoom: 19,
			}).addTo(map);

			// Add marker
			const marker = L.marker([latitude, longitude]).addTo(map);

			// Add popup
			if (businessName || address) {
				const popupContent = `
					<div style="text-align: center;">
						<strong style="font-size: 16px;">${businessName || ''}</strong>
						${address ? `<p style="margin: 5px 0 0 0;">${address}</p>` : ''}
					</div>
				`;
				marker.bindPopup(popupContent);
			}

			// Enable zoom on click
			map.on('click', () => {
				map.scrollWheelZoom.enable();
			});

			// Disable zoom when mouse leaves
			map.on('mouseout', () => {
				map.scrollWheelZoom.disable();
			});
		});

		// Cleanup on unmount
		return () => {
			if (mapInstanceRef.current) {
				mapInstanceRef.current.remove();
			}
		};
	}, [latitude, longitude, businessName, address]);

	if (!latitude || !longitude) {
		return (
			<div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
				<p className="text-gray-500">Location not available</p>
			</div>
		);
	}

	return (
		<div
			ref={mapRef}
			className="w-full h-96 rounded-lg shadow-lg border-4 border-black"
			style={{ zIndex: 0 }}
		/>
	);
}
