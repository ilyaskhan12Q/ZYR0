"use client";

import {
  MoltenRingCarousel,
  type MoltenRingItem,
} from "@/components/ui/molten-ring-carousel";

// Placeholder art served straight off the crafterui CDN so the demo works the
// moment it is installed - no assets to copy into your public/. Swap the names
// and the copy for your own index - the list is the ring order, so reordering
// these rows reorders the arc and the numbering together.
const ART = (name: string) => `https://crafterui.com/art/${name}.jpg`;

const WORK: MoltenRingItem[] = [
  {
    image: ART("prismatic-rift-anime"),
    title: "Prismatic Rift",
    meta: "Motion · 2026",
  },
  {
    image: ART("black-hole-ember-clouds"),
    title: "Ember Clouds",
    meta: "Campaign · 2026",
  },
  {
    image: ART("neon-cave-portal-silhouette"),
    title: "Neon Portal",
    meta: "Art direction · 2026",
  },
  {
    image: ART("red-ribbon-typography"),
    title: "Red Ribbon",
    meta: "Type · 2025",
  },
  {
    image: ART("celestial-light-figure"),
    title: "Celestial",
    meta: "Editorial · 2025",
  },
  {
    image: ART("neon-portrait-uplight"),
    title: "Uplight",
    meta: "Portrait · 2025",
  },
  {
    image: ART("indigo-liquid-marble"),
    title: "Indigo Marble",
    meta: "Identity · 2024",
  },
  {
    image: ART("rocket-launch-gradient"),
    title: "Launch Window",
    meta: "Film · 2024",
  },
  {
    image: ART("astronaut-cosmic-wave"),
    title: "Cosmic Wave",
    meta: "Campaign · 2023",
  },
];

export default function MoltenRingCarouselDemo() {
  return (
    <div className="h-screen w-full">
      <MoltenRingCarousel
        items={WORK}
        brand="crafterui"
        arc={1.05}
        cardSize={0.18}
        cardRatio={0.56}
        fuse={0.09}
      />
    </div>
  );
}
