import { CheckCircle } from 'lucide-react';
import { tools } from './data';

export default function ToolsSection() {
  return (
    <section className="ph-section" style={{ background: 'var(--ph-surface)' }}>
      <div className="ph-container">
        <div className="ph-section-header">
          <p className="ph-eyebrow">Platform Tools</p>
          <h2 className="ph-display ph-section-title">Powerful features, simple design</h2>
          <p className="ph-section-subtitle">
            Tools built to help you find, apply, and manage internships efficiently.
          </p>
        </div>

        <div className="ph-tools-list">
          {tools.map((tool) => (
            <div key={tool} className="ph-tool-item">
              <CheckCircle className="w-4 h-4" />
              <span>{tool}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
