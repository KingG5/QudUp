import { useEffect } from 'react';

interface SeoHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  twitterCard?: string;
}

const SeoHead: React.FC<SeoHeadProps> = ({
  title = "QudUP - GARDE UNE LONGUEUR D'AVANCE ET GAGNE DES RÉCOMPENSES | Application Exclusive",
  description = "QudUP vous permet de garder une longueur d'avance et de gagner des récompenses. Rejoignez notre liste d'attente pour être parmi les premiers à découvrir cette application exclusive.",
  image = "https://qud.up/og-image.jpg",
  url = "https://qud.up/",
  type = "website",
  twitterCard = "summary_large_image",
}) => {
  useEffect(() => {
    // Update metadata dynamically
    document.title = title;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
    
    // Update OG metadata
    const metaTags = {
      'og:title': title,
      'og:description': description,
      'og:image': image,
      'og:url': url,
      'og:type': type,
      'twitter:card': twitterCard,
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image,
    };
    
    Object.entries(metaTags).forEach(([property, content]) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`);
      if (metaTag) {
        metaTag.setAttribute('content', content);
      }
    });

    // Add structured data for better SEO
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'QudUP',
      url: url,
      description: description,
      potentialAction: {
        '@type': 'RegisterAction',
        target: url,
        name: 'Rejoindre la liste d\'attente'
      }
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData);

    return () => {
      // Clean up structured data
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, [title, description, image, url, type, twitterCard]);

  return null; // This component doesn't render anything visually
};

export default SeoHead;