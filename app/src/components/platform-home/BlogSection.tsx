import { ArrowRight } from 'lucide-react';
import { blogPosts } from './data';

const tagColors = ['green', 'yellow', 'purple'];

export default function BlogSection() {
  return (
    <section className="ph-section" style={{ background: 'var(--ph-surface)' }}>
      <div className="ph-container">
        <div className="ph-section-header">
          <p className="ph-eyebrow">Blog</p>
          <h2 className="ph-display ph-section-title">News, insights and more</h2>
        </div>

        <div className="ph-blog-grid">
          {blogPosts.map((post, i) => (
            <div key={post.title} className="ph-blog-card">
              <div className="ph-blog-thumb">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5" />
                </svg>
              </div>
              <div className="ph-blog-body">
                <span className={`ph-blog-tag ${tagColors[i % tagColors.length]}`}>{post.tag}</span>
                <span className="ph-blog-date">{post.date}</span>
                <h3 className="ph-blog-title">{post.title}</h3>
                <p className="ph-blog-excerpt">{post.excerpt}</p>
                <span className="ph-blog-link">
                  Read more <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
