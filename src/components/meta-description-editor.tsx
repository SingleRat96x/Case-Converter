import React, { useState } from 'react';
import type { MetaDescription, PageType } from '@/lib/meta-descriptions';
import { X, Image as ImageIcon } from 'lucide-react';
import styles from './meta-description-editor.module.css';

interface MetaDescriptionEditorProps {
  meta: Partial<MetaDescription>;
  onClose: () => void;
  onSave: (meta: Partial<MetaDescription>) => Promise<void>;
  pageType?: PageType;
  pageId?: string;
}

export function MetaDescriptionEditor({
  meta,
  onClose,
  onSave,
  pageType,
  pageId,
}: MetaDescriptionEditorProps) {
  const [formData, setFormData] = useState<Partial<MetaDescription>>(meta);
  const [isSaving, setIsSaving] = useState(false);

  // URL validation helper function
  const isValidHttpUrl = (string: string | undefined | null): boolean => {
    if (!string) return false;
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving meta description:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getCharacterCountClass = (
    current: number,
    min: number,
    max: number
  ) => {
    if (current < min) return 'text-orange-500';
    if (current > max) return 'text-red-500';
    return 'text-green-500';
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <form onSubmit={handleSubmit}>
        <div className={styles.editorContainer}>
          {/* Column 1: Basic SEO */}
          <div className={styles.column}>
            <div className={styles.columnHeader}>Basic SEO Settings</div>

            <div className={styles.section}>
              <label className={styles.label}>
                Meta Title
                <span className="text-xs text-muted-foreground ml-1">
                  (50-60 characters)
                </span>
              </label>
              <input
                type="text"
                name="meta_title"
                value={formData.meta_title || ''}
                onChange={handleChange}
                className={styles.input}
                maxLength={60}
                required
              />
              <div
                className={`${styles.characterCount} ${getCharacterCountClass((formData.meta_title || '').length, 50, 60)}`}
              >
                {(formData.meta_title || '').length}/60 characters
              </div>

              <label className={`${styles.label} mt-4`}>
                Meta Description
                <span className="text-xs text-muted-foreground ml-1">
                  (150-160 characters)
                </span>
              </label>
              <textarea
                name="meta_description"
                value={formData.meta_description || ''}
                onChange={handleChange}
                className={styles.input}
                rows={3}
                maxLength={160}
                required
              />
              <div
                className={`${styles.characterCount} ${getCharacterCountClass((formData.meta_description || '').length, 150, 160)}`}
              >
                {(formData.meta_description || '').length}/160 characters
              </div>

              <label className={`${styles.label} mt-4`}>
                Meta Keywords
                <span className="text-xs text-muted-foreground ml-1">
                  (comma-separated)
                </span>
              </label>
              <input
                type="text"
                name="meta_keywords"
                value={formData.meta_keywords || ''}
                onChange={handleChange}
                className={styles.input}
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>

            <div className={styles.section}>
              <label className={styles.label}>Canonical URL</label>
              <input
                type="url"
                name="canonical_url"
                value={formData.canonical_url || ''}
                onChange={handleChange}
                className={styles.input}
                placeholder="https://"
              />
            </div>
          </div>

          {/* Column 2: Social Media */}
          <div className={styles.column}>
            <div className={styles.columnHeader}>Social Media Settings</div>

            <div className={styles.section}>
              <h3 className="text-sm font-semibold mb-4">
                Open Graph (Facebook)
              </h3>
              <label className={styles.label}>OG Title</label>
              <input
                type="text"
                name="og_title"
                value={formData.og_title || ''}
                onChange={handleChange}
                className={styles.input}
              />

              <label className={`${styles.label} mt-4`}>OG Description</label>
              <textarea
                name="og_description"
                value={formData.og_description || ''}
                onChange={handleChange}
                className={styles.input}
                rows={2}
              />

              <label className={`${styles.label} mt-4`}>OG Image URL</label>
              <input
                type="url"
                name="og_image"
                value={formData.og_image || ''}
                onChange={handleChange}
                className={styles.input}
                placeholder="https://"
              />
              {formData.og_image && !isValidHttpUrl(formData.og_image) && (
                <p className="text-red-500 text-sm mt-1">
                  Invalid or non-HTTP(S) OG image URL. Please use a valid URL
                  starting with http:// or https://
                </p>
              )}
            </div>

            <div className={styles.section}>
              <h3 className="text-sm font-semibold mb-4">Twitter Card</h3>
              <label className={styles.label}>Card Type</label>
              <select
                name="twitter_card"
                value={formData.twitter_card || 'summary_large_image'}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary Large Image</option>
                <option value="app">App</option>
                <option value="player">Player</option>
              </select>

              <label className={`${styles.label} mt-4`}>Twitter Title</label>
              <input
                type="text"
                name="twitter_title"
                value={formData.twitter_title || ''}
                onChange={handleChange}
                className={styles.input}
              />

              <label className={`${styles.label} mt-4`}>
                Twitter Description
              </label>
              <textarea
                name="twitter_description"
                value={formData.twitter_description || ''}
                onChange={handleChange}
                className={styles.input}
                rows={2}
              />

              <label className={`${styles.label} mt-4`}>
                Twitter Image URL
              </label>
              <input
                type="url"
                name="twitter_image"
                value={formData.twitter_image || ''}
                onChange={handleChange}
                className={styles.input}
                placeholder="https://"
              />
              {formData.twitter_image &&
                !isValidHttpUrl(formData.twitter_image) && (
                  <p className="text-red-500 text-sm mt-1">
                    Invalid or non-HTTP(S) Twitter image URL. Please use a valid
                    URL starting with http:// or https://
                  </p>
                )}
            </div>
          </div>

          {/* Column 3: Live Preview */}
          <div className={styles.column}>
            <div className={styles.columnHeader}>Live Preview</div>

            <div className={styles.section}>
              <h3 className="text-sm font-semibold mb-4">
                Google Search Result
              </h3>
              <div className={`${styles.previewCard} ${styles.googlePreview}`}>
                <div className={styles.googleTitle}>
                  {formData.meta_title || 'Your Page Title'}
                </div>
                <div className={styles.googleUrl}>
                  {formData.canonical_url ||
                    'https://case-converter.vercel.app'}
                </div>
                <div className={styles.googleDescription}>
                  {formData.meta_description ||
                    'Your page description will appear here. Make sure to write a compelling description that accurately describes your page content.'}
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className="text-sm font-semibold mb-4">Facebook Share</h3>
              <div
                className={`${styles.previewCard} ${styles.facebookPreview}`}
              >
                <div className={styles.facebookCard}>
                  <div className={styles.facebookImage}>
                    {formData.og_image && isValidHttpUrl(formData.og_image) ? (
                      <img
                        src={formData.og_image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className={styles.facebookContent}>
                    <div className={styles.facebookTitle}>
                      {formData.og_title ||
                        formData.meta_title ||
                        'Your Page Title'}
                    </div>
                    <div className={styles.facebookDescription}>
                      {formData.og_description ||
                        formData.meta_description ||
                        'Your page description will appear here.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className="text-sm font-semibold mb-4">Twitter Card</h3>
              <div className={`${styles.previewCard} ${styles.twitterPreview}`}>
                <div className={styles.twitterCard}>
                  <div className={styles.twitterImage}>
                    {formData.twitter_image &&
                    isValidHttpUrl(formData.twitter_image) ? (
                      <img
                        src={formData.twitter_image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className={styles.twitterContent}>
                    <div className={styles.twitterTitle}>
                      {formData.twitter_title ||
                        formData.meta_title ||
                        'Your Page Title'}
                    </div>
                    <div className={styles.twitterDescription}>
                      {formData.twitter_description ||
                        formData.meta_description ||
                        'Your page description will appear here.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-accent"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
