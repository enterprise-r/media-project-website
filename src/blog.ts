export const feed = {
  title: "enterprise-R blog",
  description: "Blog",
  href: "/blog/rss.xml",
};

export const posts = [
  {
    title: "R-log issue one 202611.24",
    slug: "r-log-issue-one-202611-24",
    date: new Date("2026-11-24T00:00:00Z"),
    description: "R-log issue one 202611.24",
  },
  {
    title: "Hello world",
    slug: "hello-world",
    date: new Date("2026-11-24T12:51:13+01:00"),
    description: "hello world",
  },
];

export function postHref(post: { slug: string }) {
  return `/blog/${post.slug}/`;
}

export function postBySlug(slug: string) {
  const post = posts.find((p) => p.slug === slug);
  if (!post) throw new Error(`Unknown post: ${slug}`);
  return post;
}
