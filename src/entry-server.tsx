import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import App from "@/App";

export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );
}

export { PAGES, headHtml } from "@/lib/seo";
export { markdownFor, llmsTxt, llmsFullTxt } from "@/lib/markdown";
export { SITE } from "@/lib/data";
