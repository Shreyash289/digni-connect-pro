// This page can be shown in the app during demo to showcase security
// Add this route to App.jsx if needed: <Route path="/security" element={<SecurityInfo />} />

export default function SecurityInfo() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', padding: '40px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 8 }}>
            4-Layer Privacy Shield
          </h1>
          <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 600, margin: '0 auto' }}>
            How CAREVIA protects survivor data with military-grade security
          </p>
        </div>

        {/* 4 Layers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 40 }}>
          {[
            {
              num: '1',
              title: 'OTP-Based Authentication',
              icon: '📱',
              desc: 'No passwords stored. Each login gets a unique 6-digit code valid 10 minutes only.',
              points: [
                'No password database = nothing to hack',
                'Time-limited codes (10 min expiry)',
                'Unique code per login',
                'SMS + Email delivery'
              ],
              color: '#2563EB'
            },
            {
              num: '2',
              title: 'Database-Level Access Control',
              icon: '🔐',
              desc: 'Row-Level Security enforced at database. Even a hacker inside can\'t bypass it.',
              points: [
                'Survivor can NEVER see other survivors',
                'Recruiter sees ONLY approved profiles',
                'Admin access is logged & audit-tracked',
                'RLS enforced at SQL level'
              ],
              color: '#0D9488'
            },
            {
              num: '3',
              title: 'Data Masking',
              icon: '🎭',
              desc: 'Sensitive info masked until explicitly approved by admin.',
              points: [
                'Show initials, hide full name',
                'Show city, hide exact address',
                'Show skills, hide contact details',
                'Full reveal = admin approval required'
              ],
              color: '#7C3AED'
            },
            {
              num: '4',
              title: 'Encrypted Document Vault',
              icon: '🔑',
              desc: 'Documents encrypted before upload. Even Supabase can\'t read them.',
              points: [
                'Encrypted in browser before upload',
                'AES-256 encryption (military standard)',
                'Only decryptable with survivor\'s key',
                'Access controlled + audit logged'
              ],
              color: '#D97706'
            }
          ].map((layer) => (
            <div key={layer.num} className="card" style={{ padding: 24, border: `2px solid ${layer.color}20`, background: `${layer.color}08` }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 32 }}>{layer.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: layer.color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Layer {layer.num}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', margin: '2px 0 0' }}>{layer.title}</h3>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 14 }}>{layer.desc}</p>
              <div>
                {layer.points.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 12, color: '#374151' }}>
                    <span style={{ color: layer.color, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Data Protection Table */}
        <div className="card" style={{ padding: 24, marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 16 }}>What Data Is Protected?</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Data Type</th>
                  <th>Status</th>
                  <th>Protection Method</th>
                  <th>Who Can Access</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { data: 'Full Name', status: '🔒 Encrypted', method: 'AES-256 + Masking', access: 'Survivor, Admin, Approved Recruiter' },
                  { data: 'Phone Number', status: '🔒 Encrypted', method: 'AES-256 + Masking', access: 'Survivor, Admin, Approved Recruiter' },
                  { data: 'Email Address', status: '🔒 Encrypted', method: 'AES-256', access: 'Survivor, Admin' },
                  { data: 'Exact Address', status: '🔒 Encrypted', method: 'AES-256 + Masked', access: 'Survivor, Admin only' },
                  { data: 'Skills & Education', status: '✓ Visible', method: 'Role-Based Access', access: 'Survivor, Admin, Recruiter' },
                  { data: 'BGV Documents', status: '🔒 Encrypted', method: 'AES-256', access: 'Survivor, Admin only' },
                  { data: 'Medical Records', status: '🔒 Encrypted', method: 'AES-256', access: 'Survivor, Admin only' },
                  { data: 'Work History', status: '✓ Visible', method: 'Role-Based Access', access: 'Survivor, Admin, Recruiter' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{row.data}</td>
                    <td>{row.status}</td>
                    <td><span style={{ fontSize: 12, background: '#F3F4F6', padding: '2px 8px', borderRadius: 4 }}>{row.method}</span></td>
                    <td><span style={{ fontSize: 12, color: '#6B7280' }}>{row.access}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Breach Response */}
        <div className="card" style={{ padding: 24, background: '#FEF2F2', border: '0.5px solid #FECACA', marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#DC2626', fontFamily: 'Plus Jakarta Sans', marginBottom: 16 }}>⚠️ If Data Breach Happens</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { time: '0-5 min', action: 'Breach detected', detail: 'Audit logs alert team' },
              { time: '5-30 min', action: 'Accounts disabled', detail: 'Affected users locked out' },
              { time: '1 hour', action: 'Survivors notified', detail: 'SMS + Email alert' },
              { time: '4 hours', action: 'Forensics begin', detail: 'External security firm engaged' },
              { time: '24 hours', action: 'Government notified', detail: 'Legal requirement' },
              { time: '72 hours', action: 'Police report', detail: 'FIR filed' },
              { time: '7 days', action: 'Insurance claim', detail: 'Cyber liability coverage' },
              { time: '30 days', action: 'Compensation', detail: 'Min ₹50,000 per survivor' },
            ].map((item, i) => (
              <div key={i} style={{ padding: 12, background: '#fff', borderRadius: 8, border: '0.5px solid #FECACA', textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>{item.time}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0C1F3F', marginBottom: 2 }}>{item.action}</div>
                <div style={{ fontSize: 10, color: '#6B7280' }}>{item.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="card" style={{ padding: 24, background: '#F0FDF4', border: '0.5px solid #BBF7D0', marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#166534', fontFamily: 'Plus Jakarta Sans', marginBottom: 16 }}>✓ Certifications & Compliance</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[
              { icon: '🔍', cert: 'SOC 2 Type II', org: 'Supabase Infrastructure', desc: 'Annual external security audit' },
              { icon: '📜', cert: 'GDPR Compliant', org: 'EU Data Protection', desc: 'Survivor consent & data rights' },
              { icon: '🇮🇳', cert: 'DPDP Act 2023', org: 'India Personal Data', desc: 'Government data protection law' },
              { icon: '⚖️', cert: 'Legal Liability', org: 'Insurance & Contracts', desc: 'Financial accountability (₹10 Cr)' },
            ].map((item, i) => (
              <div key={i} style={{ padding: 16, background: '#fff', borderRadius: 8, border: '0.5px solid #BBF7D0' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', fontFamily: 'Plus Jakarta Sans', marginBottom: 2 }}>{item.cert}</div>
                <div style={{ fontSize: 11, color: '#059669', fontWeight: 600, marginBottom: 4 }}>{item.org}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', padding: '24px', background: '#fff', borderRadius: 12, border: '0.5px solid #E5E7EB' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 10 }}>
            Questions About Security?
          </h3>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
            Download our complete security architecture document or contact our security team.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button style={{ padding: '10px 20px', borderRadius: 8, background: '#2563EB', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
              📄 Download Security Doc
            </button>
            <button style={{ padding: '10px 20px', borderRadius: 8, background: '#F3F4F6', color: '#0C1F3F', border: '0.5px solid #E5E7EB', fontWeight: 600, cursor: 'pointer' }}>
              📧 Contact Security Team
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
