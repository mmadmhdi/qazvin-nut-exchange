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

/** canonical + hreflang alternates for a route path. */
export function seoLinks(path: string) {
  const u = localizedUrls(path);
  return [
    { rel: "canonical", href: u.fa },
    { rel: "alternate", hreflang: "fa-IR", href: u.fa },
    { rel: "alternate", hreflang: "en", href: u.en },
    { rel: "alternate", hreflang: "ar", href: u.ar },
    { rel: "alternate", hreflang: "x-default", href: u.fa },
  ];
}
