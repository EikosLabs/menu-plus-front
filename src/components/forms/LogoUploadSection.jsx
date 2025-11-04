import React from 'react';
import PropTypes from 'prop-types';

/**
 * LogoUploadSection - Reusable component for logo upload
 */
const LogoUploadSection = ({ preview, onImageChange, onRemove, t }) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-md">
      <h3 className="mb-5 flex items-center font-semibold text-[#004E71] text-lg">
        <svg className="mr-2 h-5 w-5 text-[#1a1a1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {t("business.logo")}
      </h3>

      <div className="space-y-4">
        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt="Logo preview"
              className="mx-auto h-32 w-32 rounded-lg border-2 border-gray-200 object-cover"
            />
            <button
              type="button"
              onClick={onRemove}
              className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              aria-label={t("business.removeLogo")}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div>
          <label htmlFor="logo" className="mb-2 block font-medium text-gray-700 text-sm">
            {preview ? t("business.changeLogo") : t("business.uploadLogo")}
          </label>
          <input
            type="file"
            id="logo"
            accept="image/*"
            onChange={onImageChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-2 text-gray-500 text-xs">
            {t("business.logoHint")}
          </p>
        </div>
      </div>
    </div>
  );
};

LogoUploadSection.propTypes = {
  preview: PropTypes.string,
  onImageChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default LogoUploadSection;
