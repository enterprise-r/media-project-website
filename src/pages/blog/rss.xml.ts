import type { APIRoute } from "astro";
import rss from "@astrojs/rss";
import { feed, postHref, posts } from "../../blog";

export const GET: APIRoute = (context) => {
  const self = new URL(feed.href, context.site).href;
  return rss({
    title: feed.title,
    description: feed.description,
    site: context.site,
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    items: posts.map((post) => ({
      title: post.title,
      description: post.description,
      pubDate: post.date,
      link: postHref(post),
    })),
    customData: `<language>en</language><atom:link href="${self}" rel="self" type="application/rss+xml"/>`,
  });
};
