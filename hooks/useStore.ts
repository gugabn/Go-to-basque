'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Contribution, FinanceGoal, Milestone } from '@/lib/types'
import { DEFAULT_GOAL } from '@/lib/types'
import {
  migrateLegacyData,
  getContributions, saveContributions,
  getFinanceGoal, saveFinanceGoal,
  getMilestones, saveMilestones,
  getOnboarded, saveOnboarded,
} from '@/lib/storage'

export function useStore() {
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [financeGoal, setFinanceGoalState] = useState<FinanceGoal>(DEFAULT_GOAL)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [onboarded, setOnboardedState] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    migrateLegacyData() // importa dados antigos do ChefBook, se existirem
    setContributions(getContributions())
    setFinanceGoalState(getFinanceGoal())
    setMilestones(getMilestones())
    setOnboardedState(getOnboarded())
    setHydrated(true)
  }, [])

  const setOnboarded = useCallback((done: boolean) => {
    saveOnboarded(done)
    setOnboardedState(done)
  }, [])

  // ── Contribuições ────────────────────────────────────────────────────────────

  const addContribution = useCallback((contribution: Contribution) => {
    setContributions(prev => {
      const next = [contribution, ...prev]
      saveContributions(next)
      return next
    })
  }, [])

  const deleteContribution = useCallback((id: string) => {
    setContributions(prev => {
      const next = prev.filter(c => c.id !== id)
      saveContributions(next)
      return next
    })
  }, [])

  // ── Meta financeira ──────────────────────────────────────────────────────────

  const setFinanceGoal = useCallback((goal: FinanceGoal) => {
    saveFinanceGoal(goal)
    setFinanceGoalState(goal)
  }, [])

  // ── Marcos / certificações ───────────────────────────────────────────────────

  const addMilestone = useCallback((milestone: Milestone) => {
    setMilestones(prev => {
      const next = [...prev, milestone]
      saveMilestones(next)
      return next
    })
  }, [])

  const updateMilestone = useCallback((milestone: Milestone) => {
    setMilestones(prev => {
      const next = prev.map(m => (m.id === milestone.id ? milestone : m))
      saveMilestones(next)
      return next
    })
  }, [])

  const toggleMilestone = useCallback((id: string) => {
    setMilestones(prev => {
      const next = prev.map(m => (m.id === id ? { ...m, done: !m.done } : m))
      saveMilestones(next)
      return next
    })
  }, [])

  const deleteMilestone = useCallback((id: string) => {
    setMilestones(prev => {
      const next = prev.filter(m => m.id !== id)
      saveMilestones(next)
      return next
    })
  }, [])

  return {
    hydrated,
    contributions,
    financeGoal,
    milestones,
    onboarded,
    setOnboarded,
    addContribution,
    deleteContribution,
    setFinanceGoal,
    addMilestone,
    updateMilestone,
    toggleMilestone,
    deleteMilestone,
  }
}
