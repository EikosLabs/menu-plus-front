import React from "react";
import { useTranslation } from "../../i18n/utils";

// Icons as components to reduce repetition
const LocationIcon = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
	</svg>
);

const PhoneIcon = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
	</svg>
);

const EmailIcon = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
	</svg>
);

const BuildingIcon = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
	</svg>
);

// Social media icons
const FacebookIcon = () => (
	<svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
		<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
	</svg>
);

const InstagramIcon = () => (
	<svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
		<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
	</svg>
);

const TwitterIcon = () => (
	<svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
		<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
	</svg>
);

const WhatsAppIcon = () => (
	<svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
		<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
	</svg>
);

// Contact badge component
function ContactBadge({ icon: Icon, children }) {
	if (!children) return null;
	return (
		<span className="bg-white bg-opacity-10 py-1 px-2 sm:px-3 rounded-full text-xs flex items-center">
			<Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 flex-shrink-0" />
			{children}
		</span>
	);
}

// Social link component
function SocialLink({ href, icon: Icon, label }) {
	if (!href) return null;
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="bg-white bg-opacity-20 hover:bg-opacity-30 py-1 sm:py-1.5 px-2 sm:px-3 rounded-full text-xs flex items-center transition-all"
		>
			<Icon />
			{label}
		</a>
	);
}

export default function BusinessHeader({ business }) {
	const { t } = useTranslation();
	const hasSocialLinks = business.facebookUrl || business.instagramUrl || business.twitterUrl || business.whatsAppNumber;

	return (
		<div className="lg:col-span-8">
			{/* Logo and Title */}
			<div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
				{(business.imageUrl || business.imageKey) && (
					<div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white rounded-lg overflow-hidden border-2 border-white/20">
						<img
							src={business.imageUrl || business.imageKey}
							alt={business.name}
							className="w-full h-full object-cover"
							onError={(e) => {
								e.target.style.display = 'none';
								e.target.nextElementSibling.style.display = 'flex';
							}}
						/>
						<div className="w-full h-full bg-white/10 flex items-center justify-center" style={{ display: 'none' }}>
							<BuildingIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white/50" />
						</div>
					</div>
				)}
				<div className="min-w-0 flex-1">
					<h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 lg:mb-2 truncate">{business.name}</h2>
					<p className="text-white text-opacity-90 text-sm sm:text-base lg:text-lg">
						{business.businessCategory?.name || t("businessInfo.noCategory")}
					</p>
				</div>
			</div>

			{/* Contact Info */}
			<div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
				<ContactBadge icon={LocationIcon}>{business.address}</ContactBadge>
				<ContactBadge icon={PhoneIcon}>{business.phoneNumber}</ContactBadge>
				<ContactBadge icon={EmailIcon}>{business.email}</ContactBadge>
			</div>

			{/* Social Links */}
			{hasSocialLinks && (
				<div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
					<SocialLink href={business.facebookUrl} icon={FacebookIcon} label="Facebook" />
					<SocialLink href={business.instagramUrl} icon={InstagramIcon} label="Instagram" />
					<SocialLink href={business.twitterUrl} icon={TwitterIcon} label="Twitter" />
					{business.whatsAppNumber && (
						<SocialLink
							href={`https://wa.me/${business.whatsAppNumber.replace(/[^0-9]/g, '')}`}
							icon={WhatsAppIcon}
							label="WhatsApp"
						/>
					)}
				</div>
			)}
		</div>
	);
}
