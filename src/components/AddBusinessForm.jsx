import React, { useState, useEffect } from "react";
import { useTranslation } from "../i18n/utils";
import menuService from "../services/menuService";
import { COLORS, FILE_SIZE } from "../constants";
import { useImageUpload } from "../hooks/useImageUpload";
import ErrorAlert from "./ui/ErrorAlert";
import BusinessInfoSection from "./forms/BusinessInfoSection";
import ContactSection from "./forms/ContactSection";
import SocialMediaSection from "./forms/SocialMediaSection";
import ColorPickerSection from "./forms/ColorPickerSection";
import LogoUploadSection from "./forms/LogoUploadSection";

/**
 * AddBusinessForm - Refactored with extracted components
 * Reduced from 969 lines to ~200 lines
 */
export default function AddBusinessForm({
  userId,
  onBusinessAdded,
  onCancel,
  existingBusiness = null,
  isEditing = false
}) {
  const { t } = useTranslation();
  const { file: logoFile, preview: logoPreview, handleImageChange, clearImage, setPreview } = useImageUpload(FILE_SIZE.LOGO_MAX);

  const [formData, setFormData] = useState({
    name: existingBusiness?.name || "",
    description: existingBusiness?.description || "",
    slogan: existingBusiness?.slogan || "",
    address: existingBusiness?.address || "",
    phoneNumber: existingBusiness?.phoneNumber || "",
    email: existingBusiness?.email || "",
    facebookUrl: existingBusiness?.facebookUrl || "",
    instagramUrl: existingBusiness?.instagramUrl || "",
    twitterUrl: existingBusiness?.twitterUrl || "",
    whatsAppNumber: existingBusiness?.whatsAppNumber || "",
    primaryColor: existingBusiness?.primaryColor || COLORS.PRIMARY,
    secondaryColor: existingBusiness?.secondaryColor || COLORS.SECONDARY,
    accentColor: existingBusiness?.accentColor || COLORS.ACCENT,
    businessCategoryId: existingBusiness?.businessCategoryId?.toString() || "",
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Load existing logo if editing
  useEffect(() => {
    if (existingBusiness?.imageKey) {
      menuService.getImageUrl(existingBusiness.imageKey)
        .then(url => setPreview(url))
        .catch(() => {});
    }
  }, [existingBusiness]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const backendCategories = await menuService.getBusinessCategories();
        setCategories(backendCategories);
        if (backendCategories.length > 0 && !formData.businessCategoryId) {
          setFormData(prev => ({ ...prev, businessCategoryId: backendCategories[0].id.toString() }));
        }
      } catch (error) {
        setError(t("business.categoryLoadError"));
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!userId || !formData.businessCategoryId || categories.length === 0) {
      setError(t("errors.missingFields"));
      return;
    }

    setLoading(true);

    try {
      let imageKey = existingBusiness?.imageKey || null;

      if (logoFile) {
        setUploadingLogo(true);
        imageKey = await menuService.uploadImage(logoFile);
        setUploadingLogo(false);
      }

      const businessData = {
        ...formData,
        businessCategoryId: Number.parseInt(formData.businessCategoryId),
        imageKey,
        ...(isEditing ? {} : { userId: Number.parseInt(userId, 10) }),
      };

      const result = isEditing && existingBusiness
        ? await menuService.updateFoodBusiness(existingBusiness.id, businessData)
        : await menuService.createFoodBusiness(businessData);

      onBusinessAdded(result);
    } catch (err) {
      setError(err.message || t("errors.general"));
    } finally {
      setLoading(false);
      setUploadingLogo(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fadeIn space-y-6">
      <ErrorAlert error={error} />

      <BusinessInfoSection
        formData={formData}
        onChange={handleChange}
        categories={categories}
        loadingCategories={loadingCategories}
        t={t}
      />

      <LogoUploadSection
        preview={logoPreview}
        onImageChange={handleImageChange}
        onRemove={clearImage}
        t={t}
      />

      <ContactSection
        formData={formData}
        onChange={handleChange}
        t={t}
      />

      <SocialMediaSection
        formData={formData}
        onChange={handleChange}
        t={t}
      />

      <ColorPickerSection
        formData={formData}
        onChange={handleChange}
        t={t}
      />

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
        >
          {t("common.cancel")}
        </button>
        <button
          type="submit"
          disabled={loading || uploadingLogo || loadingCategories}
          className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading || uploadingLogo
            ? t("common.saving")
            : isEditing
            ? t("common.update")
            : t("common.create")}
        </button>
      </div>
    </form>
  );
}
