/**
 * @copyright 2024 Abdulkerim Erdurun
 * @license Apache-2.0
 */

import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEOHead = ({ 
  title = "Abdulkerim Erdurun - Frontend Developer Portfolio",
  description = "Modern web siteleri ve aplikasyonlar geliştiren deneyimli React.js, Node.js ve TypeScript uzmanı. Portfolio ve projelerimi keşfedin.",
  keywords = "frontend developer, react developer, web developer, abdulkerim erdurun, kerimoski, javascript, typescript, nodejs, portfolio",
  image = "/images/og-image.jpg",
  url = "https://abdulkerimerdurun.com/",
  type = "website"
}) => {
  const siteName = "Abdulkerim Erdurun Portfolio";
  const twitterHandle = "@Kerimoskii";

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:site" content={twitterHandle} />
      <meta property="twitter:creator" content={twitterHandle} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Language and Region */}
      <meta name="language" content="Turkish" />
      <meta property="og:locale" content="tr_TR" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Abdulkerim Erdurun",
          "alternateName": "Kerimoski",
          "jobTitle": "Frontend Developer",
          "description": description,
          "url": url,
          "image": "https://abdulkerimerdurun.com/images/avatar-1.jpg",
          "sameAs": [
            "https://github.com/kerimerdurun",
            "https://www.linkedin.com/in/abdulkerim-erdurun-b5ba73239/",
            "https://twitter.com/Kerimoskii",
            "https://www.instagram.com/kerimerdurun"
          ],
          "knowsAbout": [
            "React.js",
            "Node.js",
            "TypeScript",
            "JavaScript",
            "HTML5",
            "CSS3",
            "Tailwind CSS",
            "Express.js",
            "Frontend Development",
            "Web Development"
          ],
          "worksFor": {
            "@type": "Organization",
            "name": "Freelance"
          }
        })}
      </script>
    </Helmet>
  );
};

SEOHead.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.string
};

export default SEOHead; 