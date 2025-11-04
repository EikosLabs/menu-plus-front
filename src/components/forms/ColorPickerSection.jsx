import React from 'react';
import PropTypes from 'prop-types';

/**
 * ColorPickerSection - Reusable form section for color customization
 */
const ColorPickerSection = ({ formData, onChange, t }) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-md">
      <h3 className="mb-5 flex items-center font-semibold text-[#004E71] text-lg">
        <svg className="mr-2 h-5 w-5 text-[#1a1a1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        {t("business.colors")}
      </h3>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label htmlFor="primaryColor" className="mb-2 block font-medium text-gray-700 text-sm">
              {t("business.primaryColor")}
            </label>
            <input
              type="color"
              id="primaryColor"
              name="primaryColor"
              value={formData.primaryColor}
              onChange={onChange}
              className="h-12 w-full cursor-pointer rounded-lg border border-gray-300"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="secondaryColor" className="mb-2 block font-medium text-gray-700 text-sm">
              {t("business.secondaryColor")}
            </label>
            <input
              type="color"
              id="secondaryColor"
              name="secondaryColor"
              value={formData.secondaryColor}
              onChange={onChange}
              className="h-12 w-full cursor-pointer rounded-lg border border-gray-300"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="accentColor" className="mb-2 block font-medium text-gray-700 text-sm">
              {t("business.accentColor")}
            </label>
            <input
              type="color"
              id="accentColor"
              name="accentColor"
              value={formData.accentColor}
              onChange={onChange}
              className="h-12 w-full cursor-pointer rounded-lg border border-gray-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

ColorPickerSection.propTypes = {
  formData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default ColorPickerSection;
