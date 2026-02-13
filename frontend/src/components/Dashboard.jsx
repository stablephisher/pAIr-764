// pAIr v3 — Dashboard Component
// Displays risk score, sustainability, profitability, and ethics data
import React from 'react';
import {
  Shield, Leaf, TrendingUp, Scale,
  AlertTriangle, CheckCircle, Clock,
  TreePine, Droplets, Zap, IndianRupee
} from 'lucide-react';

// ── Risk Gauge (0-100) ──────────────────────────────────────────────
function RiskGauge({ score, band }) {
  const radius = 60;
  const circumference = Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const bandColors = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#22c55e',
    MINIMAL: '#06b6d4',
  };

  const color = bandColors[band] || '#6b7280';

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="80" viewBox="0 0 140 80">
        {/* Background arc */}
        <path
          d="M 10 75 A 60 60 0 0 1 130 75"
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d="M 10 75 A 60 60 0 0 1 130 75"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
        {/* Score text */}
        <text x="70" y="60" textAnchor="middle" fill={color} fontSize="24" fontWeight="bold">
          {score}
        </text>
        <text x="70" y="75" textAnchor="middle" fill="var(--text-secondary)" fontSize="10">
          {band}
        </text>
      </svg>
    </div>
  );
}

// ── Green Score Badge ───────────────────────────────────────────────
function GreenBadge({ score, grade }) {
  const gradeColors = {
    'A+': '#22c55e', 'A': '#4ade80', 'B': '#eab308', 'C': '#f97316', 'D': '#ef4444'
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
        style={{ backgroundColor: gradeColors[grade] || '#6b7280' }}>
        {grade}
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {score?.toFixed(0) || 0}<span className="text-sm font-normal">/100</span>
        </div>
        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Green Score</div>
      </div>
    </div>
  );
}

// ── Stat Card ───────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, subtitle, color = 'var(--accent-primary)' }) {
  return (
    <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
      </div>
      <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
      {subtitle && <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{subtitle}</div>}
    </div>
  );
}


// ── Main Dashboard ──────────────────────────────────────────────────
export default function Dashboard({ data }) {
  const risk = data?.risk_score || {};
  const sustainability = data?.sustainability || {};
  const profitability = data?.profitability || {};
  const ethics = data?.ethics || {};

  const hasScoring = risk.overall_score !== undefined || sustainability.green_score !== undefined;
  if (!hasScoring) return null;

  return (
    <div className="space-y-6 mb-8 animate-fadeIn">
      {/* ── Top Row: 4 Key Metrics ──────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Shield}
          label="Risk Score"
          value={risk.overall_score ?? '—'}
          subtitle={risk.overall_band || 'N/A'}
          color={risk.overall_band === 'CRITICAL' ? '#ef4444' :
                 risk.overall_band === 'HIGH' ? '#f97316' :
                 risk.overall_band === 'MEDIUM' ? '#eab308' : '#22c55e'}
        />
        <StatCard
          icon={Leaf}
          label="Green Score"
          value={`${sustainability.green_score?.toFixed(0) || 0}/100`}
          subtitle={`Grade: ${sustainability.grade || 'N/A'}`}
          color="#22c55e"
        />
        <StatCard
          icon={TrendingUp}
          label="ROI"
          value={`₹${(profitability.total_roi_inr || 0).toLocaleString('en-IN')}`}
          subtitle={`${profitability.roi_multiplier || 0}× return`}
          color="#8b5cf6"
        />
        <StatCard
          icon={Scale}
          label="Ethics"
          value={ethics.confidence_level || 'VERIFIED'}
          subtitle={ethics.consult_expert ? 'Expert needed' : 'AI-validated'}
          color="#06b6d4"
        />
      </div>

      {/* ── Risk Analysis ────────────────────────────────────────── */}
      {risk.overall_score !== undefined && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Shield size={20} /> Compliance Risk Analysis
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Gauge */}
            <div className="flex justify-center">
              <RiskGauge score={risk.overall_score} band={risk.overall_band} />
            </div>
            {/* Top Risks */}
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Top Risks</h4>
              <div className="space-y-2">
                {(risk.top_risks || []).map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <AlertTriangle size={14}
                        style={{ color: r.band === 'CRITICAL' ? '#ef4444' : r.band === 'HIGH' ? '#f97316' : '#eab308', flexShrink: 0 }} />
                      <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {r.name}
                      </span>
                    </div>
                    <span className="text-xs font-mono ml-2 px-2 py-1 rounded"
                      style={{
                        backgroundColor: r.band === 'CRITICAL' ? '#ef444420' : r.band === 'HIGH' ? '#f9731620' : '#eab30820',
                        color: r.band === 'CRITICAL' ? '#ef4444' : r.band === 'HIGH' ? '#f97316' : '#eab308',
                      }}>
                      {r.score}
                    </span>
                  </div>
                ))}
              </div>
              {/* Recommendations */}
              {risk.recommendations?.length > 0 && (
                <div className="mt-4 space-y-1">
                  {risk.recommendations.map((rec, i) => (
                    <p key={i} className="text-xs" style={{ color: 'var(--text-secondary)' }}>{rec}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Sustainability ───────────────────────────────────────── */}
      {sustainability.green_score !== undefined && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Leaf size={20} style={{ color: '#22c55e' }} /> Environmental Impact
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Green badge + narrative */}
            <div>
              <GreenBadge score={sustainability.green_score} grade={sustainability.grade} />
              <p className="text-sm mt-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {sustainability.narrative}
              </p>
            </div>
            {/* Impact stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={TreePine} label="Paper Saved" value={`${sustainability.paper_saved || 0} pages`} color="#22c55e" />
              <StatCard icon={Droplets} label="CO₂ Saved" value={`${sustainability.co2_saved_kg || 0} kg`} color="#06b6d4" />
              <StatCard icon={Clock} label="Time Saved" value={`${sustainability.hours_saved || 0}h`} color="#8b5cf6" />
              <StatCard icon={Zap} label="Speed" value={`${sustainability.productivity_multiplier || 0}×`} subtitle="faster than manual" color="#f97316" />
            </div>
          </div>
          {/* SDG Alignment */}
          {sustainability.sdg_alignment?.length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
              <h4 className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                UN SDG Alignment
              </h4>
              <div className="flex flex-wrap gap-2">
                {sustainability.sdg_alignment.map((sdg, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                    {sdg.split('—')[0].trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Profitability ────────────────────────────────────────── */}
      {profitability.total_roi_inr !== undefined && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp size={20} style={{ color: '#8b5cf6' }} /> Financial Impact
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatCard icon={IndianRupee} label="Total ROI" value={`₹${(profitability.total_roi_inr || 0).toLocaleString('en-IN')}`} color="#8b5cf6" />
            <StatCard icon={Shield} label="Penalty Avoided" value={`₹${(profitability.penalty_avoidance_inr || 0).toLocaleString('en-IN')}`} color="#ef4444" />
            <StatCard icon={TrendingUp} label="Scheme Benefits" value={`₹${(profitability.scheme_benefits_inr || 0).toLocaleString('en-IN')}`} color="#22c55e" />
            <StatCard icon={IndianRupee} label="Yearly Projection" value={`₹${(profitability.yearly_projection_inr || 0).toLocaleString('en-IN')}`} color="#f97316" />
          </div>
          {/* Scheme Benefits */}
          {profitability.scheme_benefits?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Applicable Schemes</h4>
              <div className="space-y-2">
                {profitability.scheme_benefits.map((sb, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <div>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{sb.name}</span>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sb.notes}</p>
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#22c55e' }}>
                      ₹{(sb.value_inr || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Recommendations */}
          {profitability.recommendations?.length > 0 && (
            <div className="mt-4 space-y-1">
              {profitability.recommendations.map((rec, i) => (
                <p key={i} className="text-xs" style={{ color: 'var(--text-secondary)' }}>{rec}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Ethics & Governance ──────────────────────────────────── */}
      {ethics.is_ai_generated && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Scale size={16} style={{ color: '#06b6d4' }} /> AI Governance & Ethics
          </h3>
          <div className="flex flex-wrap gap-3 mb-3">
            <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              <CheckCircle size={12} /> AI-Generated
            </span>
            <span className="text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              Confidence: {ethics.confidence_level}
            </span>
            {ethics.consult_expert && (
              <span className="text-xs px-2 py-1 rounded-full"
                style={{ backgroundColor: '#f9731620', color: '#f97316' }}>
                ⚠️ Expert consultation recommended: {ethics.expert_type}
              </span>
            )}
          </div>
          {ethics.disclaimers?.length > 0 && (
            <div className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
              {ethics.disclaimers.slice(0, 3).map((d, i) => (
                <p key={i}>{d}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
