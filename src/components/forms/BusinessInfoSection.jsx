import React from 'react';
import PropTypes from 'prop-types';

/**
 * BusinessInfoSection - Reusable form section for basic business information
 */
const BusinessInfoSection = ({ formData, onChange, categories, loadingCategories, t }) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-md">
      <h3 className="mb-5 flex items-center font-semibold text-[#004E71] text-lg">
        <svg className="mr-2 h-5 w-5 text-[#1a1a1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {t("business.basicInfo")}
      </h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-2 block font-medium text-gray-700 text-sm">
            {t("business.name")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={onChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="businessCategoryId" className="mb-2 block font-medium text-gray-700 text-sm">
            {t("business.category")} <span className="text-red-500">*</span>
          </label>
          {loadingCategories ? (
            <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-500">
              {t("business.loadingCategories")}
            </div>
          ) : categories.length > 0 ? (
            <select
              id="businessCategoryId"
              name="businessCategoryId"
              value={formData.businessCategoryId}
              onChange={onChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-600">
              {t("business.noCategoriesAvailable")}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="slogan" className="mb-2 block font-medium text-gray-700 text-sm">
            {t("business.slogan")}
          </label>
          <input
            type="text"
            id="slogan"
            name="slogan"
            value={formData.slogan}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block font-medium text-gray-700 text-sm">
            {t("business.description")}
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={onChange}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

BusinessInfoSection.propTypes = {
  formData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
  loadingCategories: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
};

export default BusinessInfoSection;
