export const SITE_URL = "https://peste.es";

/** Locale variants are query-param based: /path, /path?lang=en, /path?lang=ar */
export function localizedUrls(path: string) {
  const base = `${SITE_URL}${path === "/" ? "/" : path}`;
  const sep = base.includes("?") ? "&" : "?";
  return {
    fa: base,
    en: `${base}${sep}lang=en`,
    ar: `${base}${sep}lang=ar`,
  };
}

/**
 * canonical + hreflang alternates for a route path.
 * English/Arabic variants are noindexed (see RootShell), so they must NOT
 * be advertised as hreflang alternates — only fa (default) is listed.
 */
export function seoLinks(path: string) {
  const u = localizedUrls(path);
  return [
    { rel: "canonical", href: u.fa },
    { rel: "alternate", hrefLang: "fa-IR", href: u.fa },
    { rel: "alternate", hrefLang: "x-default", href: u.fa },
  ];
}
