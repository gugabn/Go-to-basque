'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useStore } from '@/hooks/useStore'
import type { Milestone } from '@/lib/types'

import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import Toast from '@/components/ui/Toast'
import ResumoTab from '@/components/tabs/ResumoTab'
import MarcosTab from '@/components/tabs/MarcosTab'
import MovimentosTab from '@/components/tabs/MovimentosTab'

import AddContributionModal from '@/components/modals/AddContributionModal'
import FinanceGoalModal from '@/components/modals/FinanceGoalModal'
import AddMilestoneModal from '@/components/modals/AddMilestoneModal'
import SettingsModal from '@/components/modals/SettingsModal'

type Tab = 'resumo' | 'marcos' | 'movimentos'

export default function Page() {
  const {
    hydrated,
    contributions, addContribution, deleteContribution,
    financeGoal, setFinanceGoal,
    milestones, addMilestone, updateMilestone, toggleMilestone, deleteMilestone,
  } = useStore()

  const [activeTab, setActiveTab] = useState<Tab>('resumo')

  const [addContributionOpen, setAddContributionOpen] = useState(false)
  const [financeGoalOpen, setFinanceGoalOpen] = useState(false)
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false)
  const [editMilestone, setEditMilestone] = useState<Milestone | undefined>(undefined)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((message: string) => {
    setToastMsg(message)
    setToastVisible(true)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2500)
  }, [])

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current) }, [])

  const handleAdd = () => {
    if (activeTab === 'marcos') {
      setEditMilestone(undefined)
      setMilestoneModalOpen(true)
    } else {
      setAddContributionOpen(true)
    }
  }

  const handleSaveContribution = (c: Parameters<typeof addContribution>[0]) => {
    addContribution(c)
    showToast(c.type === 'deposito' ? 'Depósito registado!' : 'Levantamento registado')
  }
  const handleDeleteContribution = (id: string) => { deleteContribution(id); showToast('Lançamento eliminado') }
  const handleSaveGoal = (g: Parameters<typeof setFinanceGoal>[0]) => { setFinanceGoal(g); showToast('Meta atualizada!') }

  const handleEditMilestone = (m: Milestone) => { setEditMilestone(m); setMilestoneModalOpen(true) }
  const handleSaveMilestone = (m: Milestone) => {
    if (editMilestone) { updateMilestone(m); showToast('Marco atualizado!') }
    else { addMilestone(m); showToast('Marco adicionado!') }
  }
  const handleDeleteMilestone = (id: string) => { deleteMilestone(id); showToast('Marco eliminado') }

  if (!hydrated) {
    return (
      <div className="app-shell" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 54, height: 54, borderRadius: 16, background: 'var(--accent-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--glow-primary)' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0B0B10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
              <line x1="6" y1="17" x2="18" y2="17" />
            </svg>
          </div>
          <span className="grad-text" style={{ fontFamily: 'var(--font-display), sans-serif', fontSize: 22, fontWeight: 800 }}>Rumo à Basque</span>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell" style={{ minHeight: '100dvh' }}>
      <Header activeTab={activeTab} onAdd={handleAdd} onSettings={() => setSettingsOpen(true)} />

      <main style={{ paddingBottom: 'calc(96px + env(safe-area-inset-bottom))', minHeight: 'calc(100dvh - 68px)' }}>
        {activeTab === 'resumo' && (
          <ResumoTab contributions={contributions} goal={financeGoal} onEditGoal={() => setFinanceGoalOpen(true)} />
        )}
        {activeTab === 'marcos' && (
          <MarcosTab
            milestones={milestones}
            onAddMilestone={() => { setEditMilestone(undefined); setMilestoneModalOpen(true) }}
            onEditMilestone={handleEditMilestone}
            onToggleMilestone={toggleMilestone}
            onDeleteMilestone={handleDeleteMilestone}
          />
        )}
        {activeTab === 'movimentos' && (
          <MovimentosTab
            contributions={contributions}
            goal={financeGoal}
            onAdd={() => setAddContributionOpen(true)}
            onDeleteContribution={handleDeleteContribution}
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />

      <AddContributionModal isOpen={addContributionOpen} onClose={() => setAddContributionOpen(false)} onSave={handleSaveContribution} />
      <FinanceGoalModal isOpen={financeGoalOpen} onClose={() => setFinanceGoalOpen(false)} goal={financeGoal} onSave={handleSaveGoal} />
      <AddMilestoneModal isOpen={milestoneModalOpen} onClose={() => setMilestoneModalOpen(false)} onSave={handleSaveMilestone} initialData={editMilestone} />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  )
}
