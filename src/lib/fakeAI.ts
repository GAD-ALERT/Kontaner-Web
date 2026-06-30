/**
 * Fake-AI helpers used to make the demo feel like it's running on real
 * inference without any network round-trips. Tags are derived from the
 * filename / file type heuristically — so a file called
 * `kente_market_01.jpg` gets culturally-relevant tags, not random ones.
 */

interface ThemeProfile {
  match: RegExp;
  tags: readonly string[];
  insight: string;
}

const themes: readonly ThemeProfile[] = [
  {
    match: /kente|weave|fabric|textile|cloth/i,
    tags: [
      'Kente Pattern',
      'Traditional Textile',
      'Heritage',
      'Vibrant Colors',
      'Ghanaian Craft',
      'Cultural Symbol',
      'Hand-woven',
    ],
    insight:
      'The composition centres on woven geometric motifs typical of Ashanti kente — the eye finds the gold-and-black axis quickly, making this strong for print campaigns.',
  },
  {
    match: /market|makola|kejetia|vendor|trade/i,
    tags: [
      'Market Scene',
      'Daily Life',
      'Commerce',
      'Street Photography',
      'Ghanaian Market',
      'Vibrant Colors',
      'Documentary',
    ],
    insight:
      'High visual density and warm tones make this ideal for editorial storytelling. The vendor in the lower-third anchors the gaze without dominating the frame.',
  },
  {
    match: /portrait|face|studio|person|model/i,
    tags: [
      'Portrait',
      'Studio Lighting',
      'Editorial',
      'Person',
      'West African Culture',
      'Skin Tone',
      'Direct Gaze',
    ],
    insight:
      'A controlled portrait with balanced rim light. Skin tones read as warm and unfiltered — appropriate for both editorial and brand-campaign use.',
  },
  {
    match: /accra|kumasi|city|skyline|urban|street/i,
    tags: [
      'Urban',
      'Cityscape',
      'Accra City',
      'Architecture',
      'Street Life',
      'West Africa',
      'Documentary',
    ],
    insight:
      'A wide cityscape with a strong horizon and atmospheric layering. The depth cue from the foreground street furniture pulls the viewer into the frame.',
  },
  {
    match: /aerial|drone|sky|cloud|overhead/i,
    tags: [
      'Aerial',
      'Drone',
      'Top-Down',
      'Landscape',
      'Wide Coverage',
      'Cinematic',
      'Editorial',
    ],
    insight:
      'A top-down framing that emphasises pattern over subject. The repetition of rooftops or tree canopy creates an almost graphic rhythm.',
  },
  {
    match: /food|jollof|fufu|cuisine|dish/i,
    tags: [
      'Food',
      'West African Cuisine',
      'Editorial Food',
      'Plated',
      'Warm Tones',
      'Cultural',
      'Lifestyle',
    ],
    insight:
      'Centre-framed plate with shallow depth of field. The warm tonal range and rim of negative space make it ready for a magazine spread.',
  },
  {
    match: /nature|landscape|forest|beach|palm|tropic/i,
    tags: [
      'Landscape',
      'Nature',
      'Tropical',
      'Outdoor',
      'Travel',
      'Ghana',
      'Editorial',
    ],
    insight:
      'A balanced landscape with strong layering. The natural palette would harmonise easily with most brand systems without colour correction.',
  },
  {
    match: /adinkra|symbol|pattern|motif|geometry/i,
    tags: [
      'Adinkra Symbol',
      'Geometric Pattern',
      'Cultural Heritage',
      'Iconography',
      'Tradition',
      'Graphic',
      'Editorial',
    ],
    insight:
      'High graphic contrast and a tight composition — suited to overlay treatment or use as a textural background element in a layout.',
  },
  {
    match: /afrobeat|music|dance|concert|festival/i,
    tags: [
      'Afrobeat',
      'Music',
      'Cultural Event',
      'Performance',
      'Movement',
      'Ghanaian Culture',
      'Editorial',
    ],
    insight:
      'Dynamic frame with implied motion. Best used in formats that can hold movement — video stills, hero banners, or animated splash content.',
  },
];

const fallbackProfile: ThemeProfile = {
  match: /./,
  tags: [
    'Editorial',
    'High Resolution',
    'Studio Quality',
    'Commercial',
    'West Africa',
    'Documentary',
    'Cultural',
  ],
  insight:
    'A clean, high-resolution capture with neutral framing. Ready for downstream editorial or branded use with minimal retouching.',
};

export interface FakeTagPlan {
  tags: string[];
  insight: string;
}

/**
 * Returns a deterministic, theme-aware list of tags + an editorial-style
 * AI insight for a given filename. Pulls 5–7 tags by hashing the name
 * into the theme's pool so the same file yields the same output.
 */
export function planTagsFor(filename: string): FakeTagPlan {
  const lower = filename.toLowerCase();
  const profile = themes.find((t) => t.match.test(lower)) ?? fallbackProfile;
  const count = 5 + (hashCode(lower) % 3); // 5..7
  const shuffled = shuffleStable(profile.tags, lower);
  return {
    tags: shuffled.slice(0, count),
    insight: profile.insight,
  };
}

/**
 * Async generator that yields each tag with a small delay so the UI
 * can render them one-by-one. Lets the upload page feel like tags are
 * being inferred live.
 */
export async function* streamTags(
  filename: string,
  perTagMs = 220,
): AsyncGenerator<{ tag: string; remaining: number }> {
  const plan = planTagsFor(filename);
  for (let i = 0; i < plan.tags.length; i++) {
    await new Promise((r) => setTimeout(r, perTagMs));
    yield { tag: plan.tags[i], remaining: plan.tags.length - i - 1 };
  }
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function shuffleStable<T>(arr: readonly T[], seed: string): T[] {
  const out = [...arr];
  let s = hashCode(seed);
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
