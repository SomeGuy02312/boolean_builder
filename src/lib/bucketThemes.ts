import type { BucketThemeKey } from "./types";

export type BucketTheme = {
  key: BucketThemeKey;
  border: string;
  halo: string;
  handle: string;
  pillBg: string;
  pillText: string;
};

export const BUCKET_THEMES: BucketTheme[] = [
  {
    key: "sky",
    border: "#7DD3FC",
    halo: "rgba(125, 211, 252, 0.25)",
    handle: "#38BDF8",
    pillBg: "#E0F2FE",
    pillText: "#0F172A",
  },
  {
    key: "blue",
    border: "#93C5FD",
    halo: "rgba(147, 197, 253, 0.25)",
    handle: "#60A5FA",
    pillBg: "#DBEAFE",
    pillText: "#0F172A",
  },
  {
    key: "indigo",
    border: "#A5B4FC",
    halo: "rgba(165, 180, 252, 0.25)",
    handle: "#818CF8",
    pillBg: "#E0E7FF",
    pillText: "#0F172A",
  },
  {
    key: "violet",
    border: "#C4B5FD",
    halo: "rgba(196, 181, 253, 0.25)",
    handle: "#A78BFA",
    pillBg: "#EDE9FE",
    pillText: "#0F172A",
  },
  {
    key: "purple",
    border: "#D8B4FE",
    halo: "rgba(216, 180, 254, 0.25)",
    handle: "#C084FC",
    pillBg: "#F3E8FF",
    pillText: "#0F172A",
  },
  {
    key: "pink",
    border: "#F9A8D4",
    halo: "rgba(249, 168, 212, 0.25)",
    handle: "#F472B6",
    pillBg: "#FCE7F3",
    pillText: "#0F172A",
  },
  {
    key: "rose",
    border: "#FDA4AF",
    halo: "rgba(253, 164, 175, 0.25)",
    handle: "#FB7185",
    pillBg: "#FFE4E6",
    pillText: "#0F172A",
  },
  {
    key: "orange",
    border: "#FDBA74",
    halo: "rgba(253, 186, 116, 0.25)",
    handle: "#FB923C",
    pillBg: "#FFEDD5",
    pillText: "#0F172A",
  },
  {
    key: "amber",
    border: "#FCD34D",
    halo: "rgba(252, 211, 77, 0.25)",
    handle: "#FBBF24",
    pillBg: "#FEF3C7",
    pillText: "#0F172A",
  },
  {
    key: "lime",
    border: "#BEF264",
    halo: "rgba(190, 242, 100, 0.25)",
    handle: "#A3E635",
    pillBg: "#ECFCCB",
    pillText: "#0F172A",
  },
  {
    key: "green",
    border: "#86EFAC",
    halo: "rgba(134, 239, 172, 0.25)",
    handle: "#4ADE80",
    pillBg: "#DCFCE7",
    pillText: "#0F172A",
  },
  {
    key: "teal",
    border: "#5EEAD4",
    halo: "rgba(94, 234, 212, 0.25)",
    handle: "#2DD4BF",
    pillBg: "#CCFBF1",
    pillText: "#0F172A",
  },
];

const DEFAULT_THEME = BUCKET_THEMES[0];

export const getBucketTheme = (key?: BucketThemeKey): BucketTheme => {
  if (!key) return DEFAULT_THEME;
  return BUCKET_THEMES.find((theme) => theme.key === key) ?? DEFAULT_THEME;
};

export const getRandomBucketThemeKey = (): BucketThemeKey => {
  const index = Math.floor(Math.random() * BUCKET_THEMES.length);
  return BUCKET_THEMES[index].key;
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getStableBucketThemeKey = (seed: string): BucketThemeKey => {
  const index = hashString(seed) % BUCKET_THEMES.length;
  return BUCKET_THEMES[index].key;
};

export const ensureBucketThemeKey = (
  key: BucketThemeKey | undefined,
  seed: string
): BucketThemeKey => {
  if (key) return key;
  return getStableBucketThemeKey(seed);
};
