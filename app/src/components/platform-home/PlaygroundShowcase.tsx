import { MoltenRingCarousel, type MoltenRingItem } from '@/components/ui/molten-ring-carousel';

const playgroundItems: MoltenRingItem[] = [
  {
    image: '/images/products/studio.svg',
    title: 'ZYR0 Studio',
    meta: 'AI Builder · Instant Edge Deploy',
  },
  {
    image: '/images/products/school.svg',
    title: 'School OS',
    meta: 'Institution SaaS · Live Telemetry',
  },
  {
    image: '/images/products/research.svg',
    title: 'Research Agent',
    meta: 'Autonomous AI · 140+ Sources',
  },
  {
    image: '/images/products/work.svg',
    title: 'ZYR0 Work',
    meta: 'Proof of Work · ECDSA Verified',
  },
  {
    image: '/images/products/skills.svg',
    title: 'Skills Hub',
    meta: '240+ Modules · Open Ecosystem',
  },
  {
    image: '/images/products/developer.svg',
    title: 'Developer Engine',
    meta: 'CLI & REST · Cloud Edge',
  },
];

// A plain full-screen stage: the ring owns its own turn (wheel, drag, swipe,
// keys), and the page scrolls past it like any other section. Driving it from
// scroll would mean editing the component, which stays verbatim as shipped.
export default function PlaygroundShowcase() {
  return (
    <section id="products" className="relative h-screen w-full">
      <MoltenRingCarousel
        items={playgroundItems}
        brand="The Playground"
        className="h-full w-full bg-transparent"
      />
    </section>
  );
}
