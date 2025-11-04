import React from 'react';
import PropTypes from 'prop-types';

/**
 * ContactSection - Reusable form section for contact information
 */
const ContactSection = ({ formData, onChange, t }) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-md">
      <h3 className="mb-5 flex items-center font-semibold text-[#004E71] text-lg">
        <svg className="mr-2 h-5 w-5 text-[#1a1a1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        {t("business.contact")}
      </h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="address" className="mb-2 block font-medium text-gray-700 text-sm">
            {t("business.address")}
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="phoneNumber" className="mb-2 block font-medium text-gray-700 text-sm">
            {t("business.phone")}
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block font-medium text-gray-700 text-sm">
            {t("business.email")}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="whatsAppNumber" className="mb-2 block font-medium text-gray-700 text-sm">
            {t("business.whatsapp")}
          </label>
          <input
            type="tel"
            id="whatsAppNumber"
            name="whatsAppNumber"
            value={formData.whatsAppNumber}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

ContactSection.propTypes = {
  formData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default ContactSection;
