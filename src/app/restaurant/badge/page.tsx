'use client'

import { ShieldCheck, Check, Clock, Star, Heart, Info } from 'lucide-react'

export default function BadgePage() {
  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>
            Badge &amp; certification
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem', marginBottom: 0 }}>
            Le badge « Certifié Yum&apos;me » apparaît sur votre fiche et dans les résultats de recherche.
          </p>
        </div>
        <button
          style={{
            border: '1px solid #E5E0D8',
            background: '#fff',
            color: '#374151',
            borderRadius: '0.75rem',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Planifier l&apos;audit
        </button>
      </div>

      {/* Two-column body */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginTop: '1.5rem' }}>

        {/* LEFT COLUMN */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* CARD 1 — Certification hero */}
          <div
            style={{
              borderRadius: '1rem',
              padding: '2rem',
              background: '#4E6939',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              {/* Shield icon */}
              <div
                style={{
                  width: '5rem',
                  height: '5rem',
                  borderRadius: '50%',
                  background: 'rgba(200,232,106,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck style={{ width: '2.5rem', height: '2.5rem', color: '#C8E86A' }} />
              </div>
              {/* Text block */}
              <div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Certifié Yum&apos;me
                </h2>
                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', marginBottom: 0, color: 'rgba(255,255,255,0.7)' }}>
                  Valide jusqu&apos;au 12/09/2027 · audit réalisé le 12/09/2026
                </p>
                <span
                  style={{
                    marginTop: '0.75rem',
                    display: 'inline-block',
                    borderRadius: '9999px',
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: '#C8E86A',
                    color: '#1A2E0A',
                  }}
                >
                  Score de fiabilité : 96 / 100
                </span>
              </div>
            </div>
          </div>

          {/* CARD 2 — Les 4 étapes */}
          <div
            style={{
              borderRadius: '0.75rem',
              background: '#fff',
              padding: '1.5rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            }}
          >
            <h2 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.25rem', color: '#111827', marginTop: 0 }}>
              Les 4 étapes du badge
            </h2>

            {/* Step 1 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', paddingTop: '1rem', paddingBottom: '1rem' }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '0.5rem',
                  background: '#4E6939',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Check style={{ width: '1rem', height: '1rem', color: '#fff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Déclarer les allergènes de toute la carte
                </p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.125rem', marginBottom: 0, color: '#6B7280' }}>
                  24 plats sur 24 renseignés
                </p>
              </div>
              <span
                style={{
                  borderRadius: '9999px',
                  padding: '0.25rem 0.625rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: '#D1FAE5',
                  color: '#065F46',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <Check style={{ width: '0.75rem', height: '0.75rem' }} />
                Fait
              </span>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', paddingTop: '1rem', paddingBottom: '1rem', borderTop: '1px solid #F9F7F4' }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '0.5rem',
                  background: '#4E6939',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Check style={{ width: '1rem', height: '1rem', color: '#fff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Former l&apos;équipe
                </p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.125rem', marginBottom: 0, color: '#6B7280' }}>
                  Module de 45 min suivi par 6 membres sur 6
                </p>
              </div>
              <span
                style={{
                  borderRadius: '9999px',
                  padding: '0.25rem 0.625rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: '#D1FAE5',
                  color: '#065F46',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <Check style={{ width: '0.75rem', height: '0.75rem' }} />
                Fait
              </span>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', paddingTop: '1rem', paddingBottom: '1rem', borderTop: '1px solid #F9F7F4' }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '0.5rem',
                  background: '#4E6939',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Check style={{ width: '1rem', height: '1rem', color: '#fff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Audit sur place par Yum&apos;me
                </p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.125rem', marginBottom: 0, color: '#6B7280' }}>
                  Réalisé le 12/09/2026
                </p>
              </div>
              <span
                style={{
                  borderRadius: '9999px',
                  padding: '0.25rem 0.625rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: '#D1FAE5',
                  color: '#065F46',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <Check style={{ width: '0.75rem', height: '0.75rem' }} />
                Fait
              </span>
            </div>

            {/* Step 4 — En continu */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', paddingTop: '1rem', paddingBottom: '1rem', borderTop: '1px solid #F9F7F4' }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '0.5rem',
                  background: '#C8E86A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1A2E0A' }}>4</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Maintenir la fiabilité
                </p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.125rem', marginBottom: 0, color: '#6B7280' }}>
                  « Régime respecté » ≥ 90 % et signalements traités sous 48 h
                </p>
              </div>
              <span
                style={{
                  borderRadius: '9999px',
                  padding: '0.25rem 0.625rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: '#FEF3C7',
                  color: '#92400E',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <Clock style={{ width: '0.75rem', height: '0.75rem' }} />
                En continu
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ width: '18rem', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* CARD A — Indicateurs de fiabilité */}
          <div
            style={{
              borderRadius: '0.75rem',
              background: '#fff',
              padding: '1.25rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            }}
          >
            <h2 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: '#111827', marginTop: 0 }}>
              Indicateurs de fiabilité
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Indicator 1 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    Avis « régime respecté » (objectif 90 %)
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#111827' }}>97 %</span>
                </div>
                <div style={{ width: '100%', height: '0.375rem', borderRadius: '9999px', background: '#F2EDE4' }}>
                  <div style={{ height: '100%', borderRadius: '9999px', background: '#4E6939', width: '97%' }} />
                </div>
              </div>

              {/* Indicator 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Plats renseignés</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#111827' }}>24 / 24</span>
                </div>
                <div style={{ width: '100%', height: '0.375rem', borderRadius: '9999px', background: '#F2EDE4' }}>
                  <div style={{ height: '100%', borderRadius: '9999px', background: '#4E6939', width: '100%' }} />
                </div>
              </div>

              {/* Indicator 3 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Signalements traités sous 48 h</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#111827' }}>3 / 4</span>
                </div>
                <div style={{ width: '100%', height: '0.375rem', borderRadius: '9999px', background: '#F2EDE4' }}>
                  <div style={{ height: '100%', borderRadius: '9999px', background: '#F59E0B', width: '75%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* CARD B — Ce que voient les clients */}
          <div
            style={{
              borderRadius: '0.75rem',
              background: '#fff',
              padding: '1.25rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            }}
          >
            <h2 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: '#111827', marginTop: 0 }}>
              Ce que voient les clients
            </h2>

            {/* Restaurant mini-card */}
            <div
              style={{
                borderRadius: '0.75rem',
                border: '1px solid #E5E0D8',
                padding: '0.75rem',
                display: 'flex',
                gap: '0.75rem',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=80&q=80"
                alt="Plant Kitchen"
                style={{ borderRadius: '0.5rem', width: '4rem', height: '4rem', objectFit: 'cover', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Plant Kitchen
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.125rem' }}>
                  <Star style={{ width: '0.75rem', height: '0.75rem', fill: '#F59E0B', color: '#F59E0B', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>4,8 · Certifié Yum&apos;me · 650 m</span>
                  <Heart style={{ width: '0.75rem', height: '0.75rem', color: '#D1D5DB', marginLeft: 'auto', flexShrink: 0 }} />
                </div>
                <span
                  style={{
                    marginTop: '0.375rem',
                    display: 'inline-block',
                    borderRadius: '9999px',
                    padding: '0.125rem 0.5rem',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    background: '#4E6939',
                    color: '#fff',
                  }}
                >
                  + 100 % compatible
                </span>
              </div>
            </div>

            {/* Below mini-card */}
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <ShieldCheck style={{ width: '0.875rem', height: '0.875rem', color: '#4E6939', flexShrink: 0 }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#4E6939' }}>
                Certifié Yum&apos;me · audit sept. 2026
              </span>
            </div>
          </div>

          {/* CARD C — Renouvellement */}
          <div
            style={{
              borderRadius: '0.75rem',
              background: '#fff',
              padding: '1.25rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            }}
          >
            <h2 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: '#111827', marginTop: 0 }}>
              Renouvellement
            </h2>

            {/* Info box */}
            <div
              style={{
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.625rem',
                padding: '0.875rem',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
              }}
            >
              <Info style={{ width: '1rem', height: '1rem', flexShrink: 0, marginTop: '0.125rem', color: '#4E6939' }} />
              <p style={{ fontSize: '0.75rem', color: '#065F46', margin: 0 }}>
                Audit de renouvellement à planifier avant le 12/08/2027.
              </p>
            </div>

            {/* CTA button */}
            <button
              style={{
                marginTop: '1rem',
                width: '100%',
                borderRadius: '0.75rem',
                paddingTop: '0.625rem',
                paddingBottom: '0.625rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                background: '#2D3B1F',
                color: '#C8E86A',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Planifier l&apos;audit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
