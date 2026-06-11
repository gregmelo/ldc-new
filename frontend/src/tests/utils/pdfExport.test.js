import { describe, it, expect, vi } from 'vitest'

// Mock jsPDF avec une vraie classe
vi.mock('jspdf', () => {
  const MockJsPDF = vi.fn().mockImplementation(function() {
    this.setFillColor = vi.fn()
    this.setTextColor = vi.fn()
    this.setFont      = vi.fn()
    this.setFontSize  = vi.fn()
    this.rect         = vi.fn()
    this.roundedRect  = vi.fn()
    this.text         = vi.fn()
    this.addImage     = vi.fn()
    this.addPage      = vi.fn()
    this.setPage      = vi.fn()
    this.save         = vi.fn()
    this.getNumberOfPages = vi.fn().mockReturnValue(1)
  })
  return { default: MockJsPDF }
})

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
    height: 100,
    width:  200,
  })
}))

import { exportRapportPDF } from '../../utils/pdfExport'

const mockInterventions = [
  { id: 1, date: '2026-06-01', nom: 'Jean-Luc',  type: 'visio',    duree: 30,   sujet: 'Problème Teams',    status: 'resolu',   notes: '' },
  { id: 2, date: '2026-05-15', nom: 'Pascaline', type: 'message',  duree: null, sujet: 'Accès SharePoint',  status: 'en_cours', notes: '' },
  { id: 3, date: '2026-04-10', nom: 'Jean-Luc',  type: 'visio',    duree: 45,   sujet: 'Problème Builder',  status: 'resolu',   notes: '' },
]

describe('exportRapportPDF', () => {
  it('est une fonction', () => {
    expect(typeof exportRapportPDF).toBe('function')
  })

  it('s\'exécute sans erreur avec des données valides', async () => {
    await expect(exportRapportPDF(mockInterventions, 'T2 2026', [])).resolves.not.toThrow()
  })

  it('s\'exécute sans erreur avec une liste vide', async () => {
    await expect(exportRapportPDF([], 'T2 2026', [])).resolves.not.toThrow()
  })

  it('s\'exécute sans erreur sans IDs de graphiques', async () => {
    await expect(exportRapportPDF(mockInterventions, 'T1 2026')).resolves.not.toThrow()
  })
})