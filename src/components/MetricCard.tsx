import type { ElementType } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  icon: ElementType;
  iconBg: string;
  iconColor: string;
  glowColor: string;
}

export function MetricCard({ label, value, icon: Icon, iconBg, iconColor, glowColor }: MetricCardProps) {
  return (
    <div style={{
      background: '#0F1629',
      border: '1px solid #1E293B',
      borderRadius: 12,
      padding: 18,
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: glowColor,
        filter: 'blur(30px)',
        opacity: 0.5,
        pointerEvents: 'none',
      }} />
      <div>
        <div style={{ fontSize: 11, fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          {label}
        </div>
        <div style={{ fontSize: 26, fontWeight: 500, color: '#F1F5F9', lineHeight: 1 }}>
          {value}
        </div>
      </div>
      <div style={{
        width: 42, height: 42, borderRadius: '50%',
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={20} color={iconColor} strokeWidth={1.5} />
      </div>
    </div>
  );
}
