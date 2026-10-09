'use client'

import { ShieldCheck, Check, Clock, Star, Heart, Info } from 'lucide-react'

export default function BadgePage() {
  return (
    <div>
      {/* Page header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Badge &amp; certification
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Le badge « Certifié Yum&apos;me » apparaît sur votre fiche et dans les résultats de recherche.
          </p>
        </div>
        <button className="rounded-xl border border-[#E5E0D8] bg-white px-4 py-2 text-sm font-medium text-gray-700 whitespace-nowrap">
          Planifier l&apos;audit
        </button>
      </div>

      {/* Two-column body */}
      <div className="flex gap-6 items-start mt-6">

        {/* LEFT COLUMN */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* CARD 1 — Certification hero */}
          <div className="rounded-2xl bg-[#4E6939] p-8">
            <div className="flex items-center gap-8">
              <div className="h-20 w-20 shrink-0 rounded-full bg-[#C8E86A]/20 flex items-center justify-center">
                <ShieldCheck className="h-10 w-10 text-[#C8E86A]" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Certifié Yum&apos;me
                </h2>
                <p className="text-sm mt-1 text-white/70">
                  Valide jusqu&apos;au 12/09/2027 · audit réalisé le 12/09/2026
                </p>
                <span className="mt-3 inline-block rounded-full bg-[#C8E86A] px-3 py-1 text-xs font-semibold text-[#1A2E0A]">
                  Score de fiabilité : 96 / 100
                </span>
              </div>
            </div>
          </div>

          {/* CARD 2 — Les 4 étapes */}
          <div className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
            <h2 className="text-sm font-semibold mb-5 text-gray-900">Les 4 étapes du badge</h2>

            <StepRow
              icon={<Check className="h-4 w-4 text-white" />}
              iconBg="bg-[#4E6939]"
              title="Déclarer les allergènes de toute la carte"
              description="24 plats sur 24 renseignés"
              badge={<DoneBadge />}
            />
            <StepRow
              icon={<Check className="h-4 w-4 text-white" />}
              iconBg="bg-[#4E6939]"
              title="Former l'équipe"
              description="Module de 45 min suivi par 6 membres sur 6"
              badge={<DoneBadge />}
              bordered
            />
            <StepRow
              icon={<Check className="h-4 w-4 text-white" />}
              iconBg="bg-[#4E6939]"
              title="Audit sur place par Yum'me"
              description="Réalisé le 12/09/2026"
              badge={<DoneBadge />}
              bordered
            />
            <StepRow
              icon={<span className="text-xs font-bold text-[#1A2E0A]">4</span>}
              iconBg="bg-[#C8E86A]"
              title="Maintenir la fiabilité"
              description="« Régime respecté » ≥ 90 % et signalements traités sous 48 h"
              badge={
                <span className="flex items-center gap-1.5 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-800 whitespace-nowrap shrink-0">
                  <Clock className="h-3 w-3" />
                  En continu
                </span>
              }
              bordered
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-72 shrink-0 flex flex-col gap-5">

          {/* CARD A — Indicateurs de fiabilité */}
          <div className="rounded-xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
            <h2 className="text-sm font-semibold mb-4 text-gray-900">Indicateurs de fiabilité</h2>
            <div className="flex flex-col gap-4">
              <ReliabilityBar label="Avis « régime respecté » (objectif 90 %)" value="97 %" percent={97} color="bg-[#4E6939]" />
              <ReliabilityBar label="Plats renseignés" value="24 / 24" percent={100} color="bg-[#4E6939]" />
              <ReliabilityBar label="Signalements traités sous 48 h" value="3 / 4" percent={75} color="bg-amber-400" />
            </div>
          </div>

          {/* CARD B — Ce que voient les clients */}
          <div className="rounded-xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
            <h2 className="text-sm font-semibold mb-4 text-gray-900">Ce que voient les clients</h2>

            <div className="rounded-xl border border-[#E5E0D8] p-3 flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=80&q=80"
                alt="Plant Kitchen"
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">Plant Kitchen</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-gray-500">4,8 · Certifié Yum&apos;me · 650 m</span>
                  <Heart className="h-3 w-3 shrink-0 text-gray-300 ml-auto" />
                </div>
                <span className="mt-1.5 inline-block rounded-full bg-[#4E6939] px-2 py-0.5 text-[10px] font-semibold text-white">
                  + 100 % compatible
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#4E6939]" />
              <span className="text-xs font-medium text-[#4E6939]">
                Certifié Yum&apos;me · audit sept. 2026
              </span>
            </div>
          </div>

          {/* CARD C — Renouvellement */}
          <div className="rounded-xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
            <h2 className="text-sm font-semibold mb-4 text-gray-900">Renouvellement</h2>

            <div className="flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 p-3.5">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-[#4E6939]" />
              <p className="text-xs text-green-800">
                Audit de renouvellement à planifier avant le 12/08/2027.
              </p>
            </div>

            <button className="mt-4 w-full rounded-xl bg-[#2D3B1F] py-2.5 text-sm font-semibold text-[#C8E86A]">
              Planifier l&apos;audit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepRow({
  icon,
  iconBg,
  title,
  description,
  badge,
  bordered = false,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
  badge: React.ReactNode
  bordered?: boolean
}) {
  return (
    <div className={`flex items-start gap-4 py-4 ${bordered ? 'border-t border-[#F9F7F4]' : ''}`}>
      <div className={`h-7 w-7 shrink-0 rounded-lg ${iconBg} flex items-center justify-center`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs mt-0.5 text-gray-500">{description}</p>
      </div>
      {badge}
    </div>
  )
}

function DoneBadge() {
  return (
    <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800 whitespace-nowrap shrink-0">
      <Check className="h-3 w-3" />
      Fait
    </span>
  )
}

function ReliabilityBar({
  label,
  value,
  percent,
  color,
}: {
  label: string
  value: string
  percent: number
  color: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-semibold text-gray-900">{value}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#F2EDE4]">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
