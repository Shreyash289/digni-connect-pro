import Layout from '../../components/Layout'
import { PageHeader, StatGrid, ErrorBanner, EmptyState, Loading } from '../../components/ui'
import { NgoGate } from '../../components/ngo'
import { useLiveQuery } from '../../lib/live'
import { listNgoSurvivors, JOURNEY, journeyStage } from '../../lib/careers'

export default function ProgressTracking() {
  return (
    <Layout>
      <NgoGate>{() => <Progress />}</NgoGate>
    </Layout>
  )
}

function Progress() {
  const { data, loading, error, live } = useLiveQuery(listNgoSurvivors, {
    tables: ['survivors', 'job_applications', 'interviews'],
  })
  const survivors = (data ?? []).map((s) => ({
    ...s,
    stage: journeyStage({
      completion: s.profile_completion, applications: s.applications, interviews: s.interviews, offers: s.offers, hired: s.hired,
    }),
  })).sort((a, b) => b.stage - a.stage)

  const atStage = (n) => survivors.filter((s) => s.stage === n).length

  return (
    <>
      <PageHeader title="📈 Progress Tracking" subtitle="Each survivor's journey, updated automatically from their applications and interviews" live={live} />

      <StatGrid stats={[
        { label: 'Getting started', value: atStage(1) + atStage(2), color: 'var(--ink2)', bg: 'var(--mist)' },
        { label: 'Applying', value: atStage(3), color: 'var(--royal)', bg: 'var(--mist)' },
        { label: 'Interviewing', value: atStage(4), color: 'var(--royal)', bg: 'var(--mist)' },
        { label: 'Offer received', value: atStage(5), color: '#D97706', bg: '#FFFBEB' },
        { label: 'Employed', value: atStage(6), color: 'var(--navy)', bg: 'var(--mist)' },
      ]} />

      <ErrorBanner message={error} />

      {loading ? <Loading /> : survivors.length === 0 ? (
        <EmptyState title="No survivors to track yet" hint="Add survivors under Manage Survivors. Their progress appears here automatically." />
      ) : survivors.map((s) => (
        <div key={s.id} className="card" style={{ marginBottom: 16, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', marginBottom: 2 }}>{s.full_name || s.anonymous_id}</div>
              <div style={{ fontSize: 12, color: 'var(--ink2)' }}>Current stage: <strong style={{ color: 'var(--royal)' }}>{JOURNEY[s.stage - 1]}</strong></div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink2)', textAlign: 'right' }}>
              Profile {s.profile_completion}% · {s.applications} application{s.applications === 1 ? '' : 's'} · {s.interviews} interview{s.interviews === 1 ? '' : 's'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {JOURNEY.map((label, idx) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', flex: idx < JOURNEY.length - 1 ? 1 : 'none' }}>
                <div title={label} style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: idx < s.stage ? 'var(--navy)' : 'var(--line)', color: idx < s.stage ? '#fff' : '#8A97B5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                }}>
                  {idx < s.stage ? '✓' : idx + 1}
                </div>
                {idx < JOURNEY.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: idx < s.stage - 1 ? 'var(--navy)' : 'var(--line)', margin: '0 4px' }} />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {JOURNEY.map((label) => <span key={label} style={{ fontSize: 10, color: '#8A97B5', width: 60, textAlign: 'center' }}>{label}</span>)}
          </div>
        </div>
      ))}
    </>
  )
}
