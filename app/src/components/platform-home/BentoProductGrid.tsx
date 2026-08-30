import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { productsList } from './data';
import Reveal from './Reveal';

const gridConfig = [
  { id: 'studio', colSpan: 'lg:col-span-8', rowSpan: 'lg:row-span-2', aspect: 'aspect-[16/10]' },
  { id: 'edu', colSpan: 'lg:col-span-4', rowSpan: 'lg:row-span-1', aspect: 'aspect-[16/9]' },
  { id: 'research', colSpan: 'lg:col-span-4', rowSpan: 'lg:row-span-1', aspect: 'aspect-[16/9]' },
  { id: 'work', colSpan: 'lg:col-span-12', rowSpan: 'lg:row-span-1', aspect: 'aspect-[21/9]' },
];

export default function BentoProductGrid() {
  return (
    <section id="products" className="py-20 md:py-28">
      <div className="max-w-[1264px] mx-auto px-6 md:px-16">
        {/* Section header */}
        <Reveal>
          <div className="max-w-2xl mb-12 md:mb-16">
            <p
              className="font-label text-[11px] tracking-[0.2em] uppercase mb-4"
              style={{ color: 'var(--zyro-accent)' }}
            >
              Products
            </p>
            <h2
              className="text-4xl md:text-5xl font-display mb-4"
              style={{ color: 'var(--zyro-text)', letterSpacing: '-0.02em' }}
            >
              Four products, one ecosystem.
            </h2>
            <p
              className="text-lg"
              style={{ color: 'var(--zyro-text-secondary)' }}
            >
              Each product works standalone. Together, they cover the full lifecycle —
              from building to learning, researching, and working.
            </p>
          </div>
        </Reveal>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
          {gridConfig.map((config, index) => {
            const product = productsList.find((p) => p.id === config.id);
            if (!product) return null;

            return (
              <Reveal key={product.id} delay={index * 0.08} className={`${config.colSpan} ${config.rowSpan}`}>
                <Link
                  to={product.href}
                  className="group relative rounded-2xl border overflow-hidden transition-all duration-300 block h-full"
                  style={{
                    background: 'var(--zyro-surface)',
                    borderColor: 'var(--zyro-border)',
                  }}
                >
                  {/* Image area */}
                  <div
                    className={`relative ${config.aspect} w-full overflow-hidden`}
                    style={{ background: 'var(--zyro-elevated)' }}
                  >
                    {product.id !== 'work' ? (
                      <img
                        src={`/logos/${product.id === 'edu' ? 'schoolOS' : product.id}.png`}
                        alt={`${product.name} logo`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div
                            className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                            style={{ background: 'var(--zyro-accent-muted)' }}
                          >
                            <span
                              className="font-display text-lg"
                              style={{ color: 'var(--zyro-accent)' }}
                            >
                              W
                            </span>
                          </div>
                          <p
                            className="font-label text-[10px] tracking-[0.15em]"
                            style={{ color: 'var(--zyro-text-muted)' }}
                          >
                            {product.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6"
                      style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                      }}
                    >
                      <span className="text-white text-sm font-medium flex items-center gap-1.5">
                        View product
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Info strip */}
                  <div className="p-4 md:p-5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3
                        className="text-base font-semibold"
                        style={{ color: 'var(--zyro-text)' }}
                      >
                        {product.name}
                      </h3>
                      <span
                        className="font-label text-[9px] tracking-[0.12em] px-2 py-0.5 rounded-full border"
                        style={{
                          color: 'var(--zyro-text-muted)',
                          borderColor: 'var(--zyro-border)',
                        }}
                      >
                        {product.badge}
                      </span>
                    </div>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--zyro-text-secondary)' }}
                    >
                      {product.headline}
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
