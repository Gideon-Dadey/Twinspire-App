import type { BlogAuthor, BlogPost, BlogTag } from '@twinspire/types';

const now = '2026-01-01T00:00:00.000Z';

function makeAuthor(input: Omit<BlogAuthor, 'createdAt' | 'updatedAt' | 'id'> & { id: string }): BlogAuthor {
  return { ...input, createdAt: now, updatedAt: now };
}

export const authors: BlogAuthor[] = [
  makeAuthor({
    id: 'a-mai',
    name: 'Mai Chen',
    slug: 'mai-chen',
    bio: 'Reviews editor. Photography, displays, and hi-fi.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=70',
  }),
  makeAuthor({
    id: 'a-aman',
    name: 'Aman Joshi',
    slug: 'aman-joshi',
    bio: 'Hardware reviews — laptops, GPUs, and silicon deep dives.',
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=70',
  }),
  makeAuthor({
    id: 'a-rachel',
    name: 'Rachel Owens',
    slug: 'rachel-owens',
    bio: 'Smart home & wearables. Skeptic with a soft spot for good sensors.',
    avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=70',
  }),
];

export const tags: BlogTag[] = [
  { id: 't-buying-guide', name: 'Buying Guide', slug: 'buying-guide', postCount: 4, createdAt: now, updatedAt: now },
  { id: 't-review', name: 'Review', slug: 'review', postCount: 6, createdAt: now, updatedAt: now },
  { id: 't-laptops', name: 'Laptops', slug: 'laptops', postCount: 3, createdAt: now, updatedAt: now },
  { id: 't-audio', name: 'Audio', slug: 'audio', postCount: 2, createdAt: now, updatedAt: now },
  { id: 't-gaming', name: 'Gaming', slug: 'gaming', postCount: 3, createdAt: now, updatedAt: now },
  { id: 't-news', name: 'News', slug: 'news', postCount: 2, createdAt: now, updatedAt: now },
];

interface PostSeed {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: { url: string; alt: string };
  authorId: string;
  categorySlug: string;
  tagSlugs: string[];
  publishedAgoDays: number;
  readingTimeMinutes: number;
  views: number;
}

function expandPost(seed: PostSeed): BlogPost {
  const date = new Date();
  date.setDate(date.getDate() - seed.publishedAgoDays);
  const iso = date.toISOString();
  return {
    id: seed.id,
    title: seed.title,
    slug: seed.slug,
    excerpt: seed.excerpt,
    body: seed.body,
    coverImage: { ...seed.coverImage, width: 1600, height: 900 },
    authorId: seed.authorId,
    categorySlug: seed.categorySlug,
    tagIds: tags.filter((t) => seed.tagSlugs.includes(t.slug)).map((t) => t.id),
    status: 'published',
    publishedAt: iso,
    readingTimeMinutes: seed.readingTimeMinutes,
    views: seed.views,
    createdAt: iso,
    updatedAt: iso,
  };
}

const SEEDS: PostSeed[] = [
  {
    id: 'post-1',
    slug: 'best-laptops-2026',
    title: 'The best laptops to buy in 2026',
    excerpt:
      'We tested 18 laptops over six months. Here are the five that earned a recommendation — and one we expected to but did not.',
    body: `
## How we tested

Every laptop was carried for a full week of commuting, used through 8-hour work days running Slack/Notion/Figma, and pushed through Lightroom and Davinci Resolve on battery.

## The top pick: Nimbus 14

The Nimbus 14 is the closest a Windows machine has come to matching the M-series in efficiency without giving up creator tools. **22 hours real-world battery**, calibrated 3K OLED, and a chassis lighter than a MacBook Air.

> "The Nimbus 14 is the laptop you actually carry every day." — our reviews team

## What surprised us

The Pulse Apex laptop we expected to love came in 14% slower than spec on sustained workloads. We are reaching out to the manufacturer.

## Best for creators

The Nimbus 16 Studio's mini-LED panel is the most accurate factory-calibrated display we've tested in a laptop. 100% P3, < ΔE 1 average.

## Best for students

Splitting hairs at this budget, but the Nimbus 14 (16/512) at $1,299 is hard to beat.

## What we are watching

Foldable laptops are improving; we'll have a deep dive on the Pulse Fold once production units ship.`,
    coverImage: {
      url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=70',
      alt: 'Open laptop',
    },
    authorId: 'a-aman',
    categorySlug: 'laptops',
    tagSlugs: ['buying-guide', 'laptops'],
    publishedAgoDays: 5,
    readingTimeMinutes: 8,
    views: 12_482,
  },
  {
    id: 'post-2',
    slug: 'aurora-x-pro-review',
    title: 'Aurora X Pro review: studio-grade for the rest of us',
    excerpt:
      "Aurora's flagship ANC headphones go toe-to-toe with the $549 incumbents — and undercut them by $300.",
    body: `
## A 60-hour party trick

I genuinely could not run out the battery during this review. I left ANC on, listened at moderate volume, and forgot to plug them in. Three weeks in.

## Sound

The X Pro's signature is **neutral with a slight midrange forward lift**. Bass extends to 18 Hz with authority; treble never sibilates.

## Comfort

255 g over the ears, the plush memory foam pads are pressure-distributed. I wore them for a six-hour flight without fatigue.

## ANC

Aurora's adaptive ANC pulls 27 dB at 100 Hz. Bose is still slightly ahead in the 300-800 Hz speech range but you'd need an A/B test to hear it.

## Verdict

If you're shopping for premium ANC and care about wired lossless audio, this is the obvious pick.`,
    coverImage: {
      url: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=1600&q=70',
      alt: 'Headphones on a desk',
    },
    authorId: 'a-mai',
    categorySlug: 'audio',
    tagSlugs: ['review', 'audio'],
    publishedAgoDays: 10,
    readingTimeMinutes: 6,
    views: 8_321,
  },
  {
    id: 'post-3',
    slug: 'oled-monitor-buying-guide',
    title: 'OLED monitor buying guide: WOLED vs QD-OLED',
    excerpt:
      'Two competing OLED panel tech approaches each have strengths. Which fits your use case?',
    body: `
## The short version

For pure gaming in dim rooms, **WOLED** has the upper hand in contrast.

For productivity in mixed lighting, **QD-OLED** wins on color volume.

## Burn-in: not the bogeyman it used to be

We tested four panels through 2,000 hours of mixed productivity. No measurable burn-in. Modern automatic pixel-shift, screen-saver, and refresh routines work.

## Refresh rates that actually matter

Above 240 Hz, the OS and game engine matter more than the panel. Look at frame pacing and input lag.

## Recommended buys

- **Pulse 4K HDR Gaming Monitor 32"** — best all-rounder.
- **Pulse 2K Esports Monitor 27"** — best for competitive shooters.

## What we'd skip

Anything WOLED below 1,000 nits HDR sustained brightness; the highlights are too dim to matter.`,
    coverImage: {
      url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1600&q=70',
      alt: 'OLED monitor',
    },
    authorId: 'a-aman',
    categorySlug: 'monitors',
    tagSlugs: ['buying-guide', 'gaming'],
    publishedAgoDays: 18,
    readingTimeMinutes: 9,
    views: 6_204,
  },
  {
    id: 'post-4',
    slug: 'wearable-health-2026',
    title: 'The wearable health revolution is finally interesting',
    excerpt:
      'Smart rings, off-wrist ECG, and continuous blood pressure trending — the next two years will reshape what counts as a "consumer" health device.',
    body: `
## Off-wrist is the unlock

Smart rings have hit a tipping point: 5-7 day battery, no subscription, and surprisingly accurate heart rate / SpO2 / temperature trending.

## On-wrist still wins for context

The Orbit Watch S2 added FDA-cleared ECG and an optical BP trend that, while not a medical-grade replacement, can flag patterns worth checking.

## What we want to see next

- Open APIs for personal health data
- Sensor accuracy publicly audited
- True end-to-end encryption for the data

The Orbit Smart Ring's "no cloud lock-in" stance is the model the industry should follow.`,
    coverImage: {
      url: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=1600&q=70',
      alt: 'Wearable',
    },
    authorId: 'a-rachel',
    categorySlug: 'wearables',
    tagSlugs: ['news'],
    publishedAgoDays: 22,
    readingTimeMinutes: 5,
    views: 5_002,
  },
  {
    id: 'post-5',
    slug: 'helix-fold-z2-review',
    title: 'Helix Fold Z2 review: the crease is finally gone',
    excerpt:
      "A book-style foldable that finally feels finished. We lived with it for two months. Here's how it held up.",
    body: `
## Hardware

Helix's ceramic UTG hinge is a step change. The crease, in normal lighting, is invisible. In direct overhead lighting you can faintly see it.

## Software

Productivity features (app continuity, taskbar, split screen) are genuinely useful for the first time in foldable history.

## Cameras

200 MP periscope with 5× optical and 20× hybrid zoom that is actually usable beyond bragging rights.

## Battery

4,800 mAh and around 6.5 hours of screen-on time with mixed inner/outer use.

## Verdict

The first foldable I would recommend without an asterisk.`,
    coverImage: {
      url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=70',
      alt: 'Foldable phone',
    },
    authorId: 'a-mai',
    categorySlug: 'phones',
    tagSlugs: ['review'],
    publishedAgoDays: 30,
    readingTimeMinutes: 7,
    views: 14_822,
  },
  {
    id: 'post-6',
    slug: 'budget-gaming-pc-2026',
    title: 'Building a $1,200 gaming PC in 2026',
    excerpt:
      'Yes, you can still hit 1440p 144Hz on a budget. Here are the parts that survived our build guide rewrite.',
    body: `
## Why this build

1440p at 144Hz on the most popular shooters and AAA games, with no compromises on quiet operation.

## The list

- **CPU**: Quanta Q12 (~$229) — 8 cores at 65W, no thermal throttling needed.
- **GPU**: Quanta GPU X7 (~$429) — 12 GB GDDR7, comfortable 1440p144 on Ultra.
- **RAM**: Quanta DDR5 32 GB (~$120) — DDR5-6400, CL30.
- **Storage**: Quanta 1 TB PCIe 4.0 (~$79).
- **PSU**: 750 W 80+ Gold (~$120).
- **Case + cooler**: ~$180.

## Total

About $1,160 with current sales.

## Where we cut corners

The case airflow is more important than the case looks. The cheap cooler is fine if you keep ambient under 25°C.`,
    coverImage: {
      url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1600&q=70',
      alt: 'PC components',
    },
    authorId: 'a-aman',
    categorySlug: 'pc-building',
    tagSlugs: ['buying-guide', 'gaming'],
    publishedAgoDays: 34,
    readingTimeMinutes: 11,
    views: 9_902,
  },
];

export const posts: BlogPost[] = SEEDS.map(expandPost);

export function getAllPosts(): BlogPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime(),
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAuthorById(id: string): BlogAuthor | undefined {
  return authors.find((a) => a.id === id);
}

export function getTagById(id: string): BlogTag | undefined {
  return tags.find((t) => t.id === id);
}

export function getRelatedPosts(postId: string, limit = 3): BlogPost[] {
  const post = getPostBySlug(postId) ?? posts.find((p) => p.id === postId);
  if (!post) return [];
  return posts
    .filter((p) => p.id !== post.id && p.tagIds.some((t) => post.tagIds.includes(t)))
    .slice(0, limit);
}
