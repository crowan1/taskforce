import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = process.env.REACT_APP_SITE_URL || 'https://taskforce-app.com';
const DEFAULT_TITLE = 'TaskForce - Gestion de Projets Intelligente';
const DEFAULT_DESCRIPTION =
  "TaskForce - Plateforme intelligente de gestion de projets avec assignation automatique des tâches selon les compétences.";
const DEFAULT_KEYWORDS =
  'gestion projet, kanban, collaboration, assignation tâches, productivité équipe, répartition automatique, compétences, organisation, workflow, teamwork';

const buildUrl = (path) => {
  if (!path) {
    return SITE_URL;
  }
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

const Seo = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  path = '/',
  image,
  type = 'website',
  noIndex = false,
  jsonLd
}) => {
  const canonicalUrl = buildUrl(path);
  const imageUrl = image || `${SITE_URL}/logo512.png`;

  return (
    <Helmet>
      <title>{title}</title>
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="fr-FR" href={canonicalUrl} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="TaskForce" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:locale" content="fr_FR" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  );
};

export default Seo;

