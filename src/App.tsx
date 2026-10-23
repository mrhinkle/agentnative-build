import { Route, Routes } from "react-router";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import ArticlePage from "@/pages/ArticlePage";
import NotFound from "@/pages/NotFound";
import {
  FUTURE, FUTURE_LEDE, FUTURE_BLOCKS, FUTURE_FAQ, FUTURE_SOURCES, FUTURE_SOURCES_NOTE,
  EXAMPLES, EXAMPLES_LEDE, EXAMPLES_FAQ,
  AGENTS, AGENTS_LEDE, AGENTS_BLOCKS, AGENTS_FAQ,
  REFERENCE, REFERENCE_LEDE, REFERENCE_BLOCKS, REFERENCE_FAQ, REFERENCE_SOURCES, REFERENCE_SOURCES_NOTE,
  PMS, PMS_LEDE, PMS_BLOCKS, PMS_FAQ,
  ABOUT, ABOUT_LEDE, ABOUT_BLOCKS, ABOUT_FAQ,
} from "@/lib/data";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/future" element={<ArticlePage meta={FUTURE} lede={FUTURE_LEDE} blocks={FUTURE_BLOCKS} faq={FUTURE_FAQ} sources={FUTURE_SOURCES} sourcesNote={FUTURE_SOURCES_NOTE} />} />
        <Route path="/examples" element={<ArticlePage meta={EXAMPLES} lede={EXAMPLES_LEDE} faq={EXAMPLES_FAQ} projects />} />
        <Route path="/product-managers" element={<ArticlePage meta={PMS} lede={PMS_LEDE} blocks={PMS_BLOCKS} faq={PMS_FAQ} />} />
        <Route path="/reference" element={<ArticlePage meta={REFERENCE} lede={REFERENCE_LEDE} blocks={REFERENCE_BLOCKS} faq={REFERENCE_FAQ} sources={REFERENCE_SOURCES} sourcesNote={REFERENCE_SOURCES_NOTE} />} />
        <Route path="/agents" element={<ArticlePage meta={AGENTS} lede={AGENTS_LEDE} blocks={AGENTS_BLOCKS} faq={AGENTS_FAQ} />} />
        <Route path="/about" element={<ArticlePage meta={ABOUT} lede={ABOUT_LEDE} blocks={ABOUT_BLOCKS} faq={ABOUT_FAQ} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
