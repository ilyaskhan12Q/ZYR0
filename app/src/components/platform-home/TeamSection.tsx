import { teamMembers } from './data';

export default function TeamSection() {
  return (
    <section className="ph-section">
      <div className="ph-container">
        <div className="ph-section-header">
          <p className="ph-eyebrow">Our Team</p>
          <h2 className="ph-display ph-section-title">Meet the team</h2>
        </div>

        <div className="ph-team-grid">
          {teamMembers.map((member) => (
            <div key={member.name} className="ph-team-card">
              <div className="ph-team-avatar">
                <img src={member.image} alt={member.name} width="64" height="64" />
              </div>
              <h3 className="ph-team-name">{member.name}</h3>
              <p className="ph-team-role">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
