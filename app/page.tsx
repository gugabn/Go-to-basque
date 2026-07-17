'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useStore } from '@/hooks/useStore'
import type { Milestone } from '@/lib/types'

import Header from '@/components/Header'
import Toast from '@/components/ui/Toast'
import FinanceView from '@/components/FinanceView'

import AddContributionModal from '@/components/modals/AddContributionModal'
import FinanceGoalModal from '@/components/modals/FinanceGoalModal'
import AddMilestoneModal from '@/components/modals/AddMilestoneModal'
import SettingsModal from '@/components/modals/SettingsModal'

export default function Page() {
  const {
    hydrated,
    contributions, addContribution, deleteContribution,
    financeGoal, setFinanceGoal,
    milestones, addMilestone, updateMilestone, toggleMilestone, deleteMilestone,
  } = useStore()

  // Modal states
  const [addContributionOpen, setAddContributionOpen] = useState(false)
  const [financeGoalOpen, setFinanceGoalOpen] = useState(false)
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false)
  const [editMilestone, setEditMilestone] = useState<Milestone | undefined>(undefined)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Toast
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((message: string) => {
    setToastMsg(message)
    setToastVisible(true)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false)
    }, 2500)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  const handleSaveContribution = (contribution: Parameters<typeof addContribution>[0]) => {
    addContribution(contribution)
    showToast(contribution.type === 'deposito' ? 'Depósito registado!' : 'Levantamento registado')
  }

  const handleDeleteContribution = (id: string) => {
    deleteContribution(id)
    showToast('Lançamento eliminado')
  }

  const handleSaveGoal = (goal: Parameters<typeof setFinanceGoal>[0]) => {
    setFinanceGoal(goal)
    showToast('Meta atualizada!')
  }

  const handleAddMilestone = () => {
    setEditMilestone(undefined)
    setMilestoneModalOpen(true)
  }

  const handleEditMilestone = (milestone: Milestone) => {
    setEditMilestone(milestone)
    setMilestoneModalOpen(true)
  }

  const handleSaveMilestone = (milestone: Milestone) => {
    if (editMilestone) {
      updateMilestone(milestone)
      showToast('Marco atualizado!')
    } else {
      addMilestone(milestone)
      showToast('Marco adicionado!')
    }
  }

  const handleDeleteMilestone = (id: string) => {
    deleteMilestone(id)
    showToast('Marco eliminado')
  }

  if (!hydrated) {
    return (
      <div
        className="app-shell"
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
              <line x1="6" y1="17" x2="18" y2="17" />
            </svg>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: 22,
              color: 'var(--primary)',
              fontWeight: 700,
            }}
          >
            Rumo à Basque
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell" style={{ minHeight: '100dvh', backgroundColor: 'var(--bg)' }}>
      <Header
        onAdd={() => setAddContributionOpen(true)}
        onSettings={() => setSettingsOpen(true)}
      />

      <main
        style={{
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
          minHeight: 'calc(100dvh - 60px)',
        }}
      >
        <FinanceView
          contributions={contributions}
          goal={financeGoal}
          milestones={milestones}
          onEditGoal={() => setFinanceGoalOpen(true)}
          onDeleteContribution={handleDeleteContribution}
          onAddMilestone={handleAddMilestone}
          onEditMilestone={handleEditMilestone}
          onToggleMilestone={toggleMilestone}
          onDeleteMilestone={handleDeleteMilestone}
        />
      </main>

      {/* Modals */}
      <AddContributionModal
        isOpen={addContributionOpen}
        onClose={() => setAddContributionOpen(false)}
        onSave={handleSaveContribution}
      />

      <FinanceGoalModal
        isOpen={financeGoalOpen}
        onClose={() => setFinanceGoalOpen(false)}
        goal={financeGoal}
        onSave={handleSaveGoal}
      />

      <AddMilestoneModal
        isOpen={milestoneModalOpen}
        onClose={() => setMilestoneModalOpen(false)}
        onSave={handleSaveMilestone}
        initialData={editMilestone}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  )
}
