import type { Review } from '@twinspire/types';

type Seed = Pick<
  Review,
  'productId' | 'rating' | 'title' | 'body' | 'authorName' | 'authorAvatarUrl' | 'verifiedPurchase' | 'helpfulCount' | 'notHelpfulCount'
> & { daysAgo: number };

function makeReview(seed: Seed, idx: number): Review {
  const date = new Date();
  date.setDate(date.getDate() - seed.daysAgo);
  const iso = date.toISOString();
  return {
    id: `r-${seed.productId}-${idx}`,
    productId: seed.productId,
    userId: `u-${idx}`,
    authorName: seed.authorName,
    authorAvatarUrl: seed.authorAvatarUrl,
    rating: seed.rating,
    title: seed.title,
    body: seed.body,
    helpfulCount: seed.helpfulCount,
    notHelpfulCount: seed.notHelpfulCount,
    verifiedPurchase: seed.verifiedPurchase,
    status: 'approved',
    createdAt: iso,
    updatedAt: iso,
  };
}

const SEEDS: Seed[] = [
  {
    productId: 'p-aurora-x-pro',
    rating: 5,
    title: 'Genuinely studio-grade',
    body:
      'I mix in a small studio and these have replaced my reference cans for casual listening. The midrange is liquid and the ANC actually competes with the big names. The hardshell case is a nice touch.',
    authorName: 'Marcus L.',
    verifiedPurchase: true,
    helpfulCount: 92,
    notHelpfulCount: 2,
    daysAgo: 3,
  },
  {
    productId: 'p-aurora-x-pro',
    rating: 5,
    title: '60 hours is not a typo',
    body:
      "I get 50+ hours of actual playback with ANC on and LDAC. Comfortable for full work days, and the lifetime cushion replacement is a real perk. Only nitpick: the case is a touch large.",
    authorName: 'Priya R.',
    verifiedPurchase: true,
    helpfulCount: 47,
    notHelpfulCount: 1,
    daysAgo: 8,
  },
  {
    productId: 'p-aurora-x-pro',
    rating: 4,
    title: 'Excellent, app could be better',
    body:
      "Sound is fantastic and the build is rock-solid. The companion app has occasional Bluetooth handshake issues on Android 14. Still 4 stars because once paired it stays paired forever.",
    authorName: 'Jens K.',
    verifiedPurchase: true,
    helpfulCount: 18,
    notHelpfulCount: 4,
    daysAgo: 14,
  },
  {
    productId: 'p-nimbus-14',
    rating: 5,
    title: 'Silent, light, fast',
    body:
      "This thing is genuinely 1.9 lbs and I haven't heard the fans even when video editing on battery. Battery life of 18-19h doing actual work — not Apple-style trickling.",
    authorName: 'Sofia A.',
    verifiedPurchase: true,
    helpfulCount: 64,
    notHelpfulCount: 0,
    daysAgo: 2,
  },
  {
    productId: 'p-nimbus-14',
    rating: 4,
    title: 'Best Windows laptop I have used',
    body:
      "Display is gorgeous and the keyboard is a real Thinkpad rival. Lost one star because the trackpad palm rejection has rough edges in Photoshop.",
    authorName: 'Cole W.',
    verifiedPurchase: true,
    helpfulCount: 22,
    notHelpfulCount: 3,
    daysAgo: 9,
  },
  {
    productId: 'p-pulse-4k',
    rating: 5,
    title: '240 Hz at 4K is unreal',
    body:
      "Coming from a 1440p 144Hz this is a generational upgrade. QD-OLED color is impressive, no burn-in after 6 months of heavy use.",
    authorName: 'Ethan P.',
    verifiedPurchase: true,
    helpfulCount: 31,
    notHelpfulCount: 1,
    daysAgo: 5,
  },
  {
    productId: 'p-pulse-4k',
    rating: 4,
    title: 'Beautiful but watch HDR brightness',
    body:
      "Stunning panel, the included DP 2.1 cable is appreciated. Just remember QD-OLED tops out around 1000 nits sustained in HDR. Still drop-dead beautiful.",
    authorName: 'Ana M.',
    verifiedPurchase: true,
    helpfulCount: 14,
    notHelpfulCount: 2,
    daysAgo: 11,
  },
  {
    productId: 'p-orbit-ring',
    rating: 4,
    title: 'No subscription is the killer feature',
    body:
      "Sleep tracking is detailed without funneling me into a $7/mo subscription. Ring is light and comfortable to wear 24/7.",
    authorName: 'Reggie T.',
    verifiedPurchase: true,
    helpfulCount: 19,
    notHelpfulCount: 0,
    daysAgo: 16,
  },
  {
    productId: 'p-helix-fold',
    rating: 5,
    title: 'The crease is finally invisible',
    body:
      "Coming from gen 1 foldables, the crease on the Fold Z2 is genuinely gone in normal lighting. The 200 MP camera is wild.",
    authorName: 'Kavi S.',
    verifiedPurchase: true,
    helpfulCount: 38,
    notHelpfulCount: 4,
    daysAgo: 6,
  },
  {
    productId: 'p-helix-pro',
    rating: 5,
    title: 'Camera is class-leading',
    body:
      "8K ProRes from a phone is just absurd. Battery comfortably gets me through 1.5 days of heavy use.",
    authorName: 'Mira N.',
    verifiedPurchase: true,
    helpfulCount: 51,
    notHelpfulCount: 1,
    daysAgo: 4,
  },
  {
    productId: 'p-monolith-oled',
    rating: 5,
    title: "Out-of-box calibration that's actually accurate",
    body:
      "Filmmaker Mode greyscale is shockingly close to a $3,000 calibration. Built-in speakers replace a starter soundbar.",
    authorName: 'Wesley B.',
    verifiedPurchase: true,
    helpfulCount: 27,
    notHelpfulCount: 0,
    daysAgo: 19,
  },
  {
    productId: 'p-pulse-kb',
    rating: 5,
    title: "Magnetic switches are the future",
    body:
      'After three years on Cherry MX I will not go back. Customizable actuation per-key, super responsive, gasket mount is comfortable typing all day.',
    authorName: 'Tyler V.',
    verifiedPurchase: true,
    helpfulCount: 43,
    notHelpfulCount: 0,
    daysAgo: 7,
  },
  {
    productId: 'p-pulse-kb',
    rating: 4,
    title: 'Great keyboard, app is fine',
    body:
      "Build is exceptional. The Pulse Studio app works but is missing macros that older Pulse boards had.",
    authorName: 'Dana O.',
    verifiedPurchase: false,
    helpfulCount: 8,
    notHelpfulCount: 6,
    daysAgo: 22,
  },
  {
    productId: 'p-aurora-earbuds',
    rating: 5,
    title: '36 hours real-world',
    body:
      "I commute 2h daily and only charge weekly. Lossless 24-bit makes a huge difference vs older AAC buds.",
    authorName: 'Renee L.',
    verifiedPurchase: true,
    helpfulCount: 23,
    notHelpfulCount: 1,
    daysAgo: 12,
  },
  {
    productId: 'p-quanta-q18',
    rating: 5,
    title: 'Blender renders melted',
    body:
      "18 cores at 65W with stacked cache is mental. Replaced a 32-core part and got 90% of the speed at half the heat.",
    authorName: 'Aria F.',
    verifiedPurchase: true,
    helpfulCount: 19,
    notHelpfulCount: 0,
    daysAgo: 24,
  },
];

export const reviews: Review[] = SEEDS.map((seed, i) => makeReview(seed, i));

export function getReviewsByProductId(productId: string): Review[] {
  return reviews
    .filter((r) => r.productId === productId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
