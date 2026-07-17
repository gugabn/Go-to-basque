// Exportar / importar todos os dados do Rumo à Basque como um ficheiro JSON.
// Fica tudo no dispositivo — o backup é só para o utilizador guardar/mover.

const isBrowser = typeof window !== 'undefined'

// Chaves incluídas no backup.
const BACKUP_KEYS = [
  'rumobasque_contributions',
  'rumobasque_goal',
  'rumobasque_milestones',
] as const

const BACKUP_FORMAT = 'rumo-basque-backup'
const BACKUP_VERSION = 1

interface BackupFile {
  format: string
  version: number
  exportedAt: string
  data: Record<string, unknown>
}

/** Constrói o objeto de backup a partir do localStorage. */
export function buildBackup(): BackupFile {
  const data: Record<string, unknown> = {}
  if (isBrowser) {
    for (const key of BACKUP_KEYS) {
      const raw = localStorage.getItem(key)
      if (raw !== null) {
        try {
          data[key] = JSON.parse(raw)
        } catch {
          // Ignora entradas corrompidas em vez de rebentar o backup todo.
        }
      }
    }
  }
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  }
}

/** Desencadeia o download do backup como ficheiro .json. */
export function downloadBackup(): void {
  if (!isBrowser) return
  const backup = buildBackup()
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const stamp = new Date().toISOString().slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `rumo-basque-backup-${stamp}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export interface ImportResult {
  ok: boolean
  restored: number   // número de secções restauradas
  error?: string
}

/**
 * Restaura os dados de um ficheiro de backup para o localStorage.
 * Valida o formato antes de escrever seja o que for.
 */
export function importBackup(fileText: string): ImportResult {
  if (!isBrowser) return { ok: false, restored: 0, error: 'Indisponível' }
  let parsed: unknown
  try {
    parsed = JSON.parse(fileText)
  } catch {
    return { ok: false, restored: 0, error: 'Ficheiro inválido (não é JSON).' }
  }

  const backup = parsed as Partial<BackupFile>
  if (!backup || backup.format !== BACKUP_FORMAT || typeof backup.data !== 'object') {
    return { ok: false, restored: 0, error: 'Este ficheiro não é um backup do Rumo à Basque.' }
  }

  let restored = 0
  const data = backup.data as Record<string, unknown>
  for (const key of BACKUP_KEYS) {
    if (key in data) {
      localStorage.setItem(key, JSON.stringify(data[key]))
      restored++
    }
  }

  return { ok: true, restored }
}
