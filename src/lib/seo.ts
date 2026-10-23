import {
  SITE, HOME, FUTURE, EXAMPLES, PMS, AGENTS, REFERENCE, ABOUT, HOME_FAQ, FUTURE_FAQ, EXAMPLES_FAQ, PMS_FAQ, AGENTS_FAQ, REFERENCE_FAQ, ABOUT_FAQ, type PageMeta, type Faq,
} from "./data";

export const PAGES: PageMeta[] = [HOME, FUTURE, EXAMPLES, PMS, AGENTS, REFERENCE, ABOUT];

const FAQS: Record<string, Faq[]> = { "/": HOME_FAQ, "/future": FUTURE_FAQ, "/examples": EXAMPLES_FAQ, "/product-managers": PMS_FAQ, "/agents": AGENTS_FAQ, "/reference": REFERENCE_FAQ, "/about": ABOUT_FAQ };

export function metaFor(path: string): PageMeta | undefined {
  return PAGES.find((p) => p.path === path);
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export function jsonLdFor(page: PageMeta) {
  const url = SITE.url + (page.path === "/" ? "/" : page.path);
  const org = { "@type": "Organization", name: SITE.network.name, url: SITE.network.url };
  const author = { "@type": "Person", name: SITE.author, url: SITE.network.url + "/about", worksFor: org };
  const graph: object[] = [
    { "@type": "WebSite", "@id": SITE.url + "/#site", name: SITE.name, url: SITE.url + "/" },
    {
      "@type": page.path === "/about" ? "AboutPage" : "Article", headline: page.title, name: page.title, description: page.description,
      author, publisher: org,
      datePublished: SITE.published, dateModified: SITE.modified, mainEntityOfPage: url,
      isPartOf: { "@id": SITE.url + "/#site" },
    },
    {
      "@type": "FAQPage",
      mainEntity: (FAQS[page.path] ?? []).map((f) => ({
        "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
  if (page.path !== "/") {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE.name, item: SITE.url + "/" },
        { "@type": "ListItem", position: 2, name: page.crumb ?? page.label, item: url },
      ],
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

/** Full <head> block injected by the prerender script. */
export function headHtml(page: PageMeta): string {
  const url = SITE.url + (page.path === "/" ? "/" : page.path);
  return [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<link rel="alternate" type="text/markdown" href="${SITE.url}${page.md}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:site_name" content="${SITE.name}" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${esc(page.title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    `<script type="application/ld+json">${JSON.stringify(jsonLdFor(page)).replace(/</g, "\\u003c")}</script>`,
  ].join("\n");
}
