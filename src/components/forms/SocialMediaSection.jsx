import React from 'react';
import PropTypes from 'prop-types';

/**
 * SocialMediaSection - Reusable form section for social media links
 */
const SocialMediaSection = ({ formData, onChange, t }) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-md">
      <h3 className="mb-5 flex items-center font-semibold text-[#004E71] text-lg">
        <svg className="mr-2 h-5 w-5 text-[#1a1a1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
        {t("business.socialMedia")}
      </h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="facebookUrl" className="mb-2 block font-medium text-gray-700 text-sm">
            Facebook
          </label>
          <input
            type="url"
            id="facebookUrl"
            name="facebookUrl"
            value={formData.facebookUrl}
            onChange={onChange}
            placeholder="https://facebook.com/tu-negocio"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="instagramUrl" className="mb-2 block font-medium text-gray-700 text-sm">
            Instagram
          </label>
          <input
            type="url"
            id="instagramUrl"
            name="instagramUrl"
            value={formData.instagramUrl}
            onChange={onChange}
            placeholder="https://instagram.com/tu-negocio"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="twitterUrl" className="mb-2 block font-medium text-gray-700 text-sm">
            Twitter/X
          </label>
          <input
            type="url"
            id="twitterUrl"
            name="twitterUrl"
            value={formData.twitterUrl}
            onChange={onChange}
            placeholder="https://twitter.com/tu-negocio"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

SocialMediaSection.propTypes = {
  formData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default SocialMediaSection;
