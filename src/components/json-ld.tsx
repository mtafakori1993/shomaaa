export function JsonLd({ data }: { data: unknown }) {
  // JSON.stringify output is escaped for "<" to prevent script-tag breakout.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
