import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { partnersApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { GlassCard } from '@/components/ui/glass-card';
import {
  Trash2,
  Edit2,
  Plus,
  X,
  Upload,
  AlertCircle,
  Check,
  Loader2,
} from 'lucide-react';

const MAX_PARTNERS = 10;
const MAX_IMAGES_PER_PARTNER = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB per image
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export default function PartnersSection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    images: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const dragRef = useRef(null);

  // Load partners on mount
  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await partnersApi.list();
      setPartners(data);
    } catch (err) {
      setError(err.message || 'Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = t('dashboard.partners.validation.nameRequired');
    }

    if (!formData.description.trim()) {
      errors.description = t('dashboard.partners.validation.descriptionRequired');
    } else if (formData.description.length < 10) {
      errors.description = t('dashboard.partners.validation.descriptionMinLength');
    }

    if (!formData.images || formData.images.length === 0) {
      errors.images = t('dashboard.partners.validation.imageRequired');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageSelect = async (file) => {
    if (!file) return;

    // Validate file type
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Only JPG, PNG, and WebP formats are supported',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      toast({
        title: 'File too large',
        description: `Maximum file size is ${MAX_IMAGE_SIZE / (1024 * 1024)}MB per image`,
        variant: 'destructive',
      });
      return;
    }

    // Check max images
    if (formData.images.length >= MAX_IMAGES_PER_PARTNER) {
      toast({
        title: 'Maximum images reached',
        description: `You can upload up to ${MAX_IMAGES_PER_PARTNER} images per partner`,
        variant: 'destructive',
      });
      return;
    }

    // Convert to Base64
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData({
        ...formData,
        images: [...formData.images, e.target.result],
      });
      setFormErrors({
        ...formErrors,
        images: '',
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current) {
      dragRef.current.classList.add('border-blue-500', 'bg-blue-50');
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current) {
      dragRef.current.classList.remove('border-blue-500', 'bg-blue-50');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current) {
      dragRef.current.classList.remove('border-blue-500', 'bg-blue-50');
    }

    const file = e.dataTransfer.files?.[0];
    if (file) handleImageSelect(file);
  };

  const openDialog = (partner = null) => {
    if (partner) {
      setIsEditing(true);
      setEditingId(partner.id);
      setFormData({
        name: partner.name,
        description: partner.description,
        images: partner.images || [],
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        images: [],
      });
    }
    setFormErrors({});
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setFormData({
      name: '',
      description: '',
      images: [],
    });
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (isEditing && editingId) {
        await partnersApi.update(editingId, formData);
        toast({
          title: t('dashboard.partners.messages.successUpdated'),
          variant: 'default',
        });
      } else {
        await partnersApi.create(formData);
        toast({
          title: t('dashboard.partners.messages.successAdded'),
          variant: 'default',
        });
      }
      await loadPartners();
      closeDialog();
    } catch (err) {
      const message = isEditing
        ? t('dashboard.partners.messages.errorUpdating')
        : t('dashboard.partners.messages.errorAdding');
      toast({
        title: message,
        variant: 'destructive',
      });
      console.error('Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setSubmitting(true);
    try {
      await partnersApi.delete(id);
      toast({
        title: t('dashboard.partners.messages.successDeleted'),
        variant: 'default',
      });
      await loadPartners();
      setDeleteConfirm(null);
    } catch (err) {
      toast({
        title: t('dashboard.partners.messages.errorDeleting'),
        variant: 'destructive',
      });
      console.error('Error:', err);
    } finally {
      setSubmitting(false);
    }
  };


  const canAddMore = partners.length < MAX_PARTNERS;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.partners.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('dashboard.partners.subtitle')}
          </p>
        </div>
        <button
          onClick={() => openDialog()}
          disabled={!canAddMore || submitting}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
            canAddMore
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus size={20} />
          {t('dashboard.partners.addPartner')}
        </button>
      </div>

      {/* Max partners warning */}
      {!canAddMore && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
          <div>
            <p className="text-yellow-800 font-medium">
              {t('dashboard.partners.messages.maxPartnersWarning')}
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={loadPartners}
              className="flex items-center gap-2 mt-2 px-3 py-1.5 text-sm font-medium text-red-700 hover:text-red-900 hover:bg-red-100 rounded transition"
            >
              <Loader2 size={14} />
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Partners grid */}
      {partners.length === 0 ? (
        <GlassCard className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            {t('dashboard.partners.messages.noPartners')}
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((partner) => (
            <GlassCard key={partner.id} className="p-4 hover:shadow-lg transition">
              {/* Images Grid */}
              {partner.images && partner.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {partner.images.slice(0, 3).map((image, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={image}
                        alt={`${partner.name} - ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400">No images</span>
                </div>
              )}

              {/* Info */}
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                {partner.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {partner.description}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openDialog(partner)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <Edit2 size={16} />
                  {t('dashboard.partners.editPartner')}
                </button>
                <button
                  onClick={() => setDeleteConfirm(partner.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                >
                  <Trash2 size={16} />
                  {t('dashboard.partners.deletePartner')}
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <GlassCard className="max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditing
                  ? t('dashboard.partners.editPartner')
                  : t('dashboard.partners.addPartner')}
              </h2>
              <button
                onClick={closeDialog}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {t('dashboard.partners.form.name')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                    formErrors.name
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder={t('dashboard.partners.form.name')}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {t('dashboard.partners.form.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="3"
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                    formErrors.description
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder={t('dashboard.partners.form.description')}
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Images Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Images (Up to {MAX_IMAGES_PER_PARTNER}, {MAX_IMAGE_SIZE / (1024 * 1024)}MB each)
                </label>

                {/* Images Preview Grid */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {formData.images.map((image, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={image}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drag and drop area - only show if can add more */}
                {formData.images.length < MAX_IMAGES_PER_PARTNER && (
                  <div
                    ref={dragRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition border-gray-300 dark:border-gray-600 hover:border-blue-500"
                  >
                    <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {t('dashboard.partners.form.dragDrop')}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </div>
                )}

                {formErrors.images && (
                  <p className="text-red-500 text-sm mt-2">
                    {formErrors.images}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {t('dashboard.partners.form.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {t('dashboard.partners.form.save')}
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      {t('dashboard.partners.form.save')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <GlassCard className="max-w-sm w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t('dashboard.partners.deletePartner')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('dashboard.partners.messages.confirmDelete')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
              >
                {t('dashboard.partners.form.cancel')}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {t('dashboard.partners.deletePartner')}
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    {t('dashboard.partners.deletePartner')}
                  </>
                )}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

    </div>
  );
}
