import { useEffect } from 'react';

/**
 * Custom hook to dynamically update document title and description for SEO.
 * @param {string} title - The title of the page
 * @param {string} description - The meta description of the page
 */
export const useDocumentMetadata = (title, description) => {
  useEffect(() => {
    const baseTitle = 'Sistem Informasi Pramuka SMPN 2 Katapang';
    document.title = title ? `${title} | ${baseTitle}` : baseTitle;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    
    metaDescription.setAttribute(
      'content',
      description || 'Website resmi Gugus Depan Pramuka SMP Negeri 2 Katapang. Wadah pembinaan karakter, kedisiplinan, dan kepemimpinan kepanduan.'
    );
  }, [title, description]);
};
