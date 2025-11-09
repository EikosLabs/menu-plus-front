import React from 'react';

/**
 * Componente reutilizable para subir imágenes
 */
export default function ImageUploader({
	preview,
	onFileChange,
	onClearImage,
	fileInputRef,
	disabled = false,
	error = null,
	label = "Imagen",
	acceptedFormats = "PNG, JPG, WebP hasta 5MB"
}) {
	return (
		<div>
			<label className="mb-1 block font-medium text-gray-700 text-sm">
				{label}
			</label>

			<div
				className="group mt-1 flex cursor-pointer justify-center rounded-lg border-2 border-gray-300 border-dashed px-6 pt-5 pb-6 transition-colors hover:bg-gray-50"
				onClick={() => !disabled && fileInputRef.current?.click()}
			>
				<div className="space-y-1 text-center">
					{preview ? (
						<div className="relative">
							<img
								src={preview}
								alt="Vista previa"
								className="mx-auto h-40 rounded-lg object-cover shadow-md transition-transform group-hover:scale-105"
							/>
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onClearImage();
								}}
								className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
								disabled={disabled}
								aria-label="Eliminar imagen"
							>
								<svg
									className="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
					) : (
						<>
							<svg
								className="mx-auto h-12 w-12 text-gray-400 transition-colors group-hover:text-gray-500"
								stroke="currentColor"
								fill="none"
								viewBox="0 0 48 48"
								aria-hidden="true"
							>
								<path
									d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							<div className="flex justify-center text-gray-600 text-sm">
								<span className="relative rounded-md font-medium text-[#1a1a1a] transition-colors hover:text-[#404040] focus:outline-none">
									Subir una imagen
								</span>
								<p className="pl-1">o arrastrar y soltar</p>
							</div>
							<p className="text-gray-500 text-xs">
								{acceptedFormats}
							</p>
						</>
					)}
				</div>
			</div>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={onFileChange}
				className="hidden"
				disabled={disabled}
			/>
			{error && (
				<p className="mt-1 text-red-600 text-sm">{error}</p>
			)}
		</div>
	);
}
