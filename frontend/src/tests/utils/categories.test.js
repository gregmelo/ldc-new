import { describe, it, expect } from 'vitest'
import { CATEGORIES } from '../../utils/categories'

describe('CATEGORIES', () => {
  it('contient les catégories attendues', () => {
    expect(CATEGORIES).toContain('Teams')
    expect(CATEGORIES).toContain('SharePoint')
    expect(CATEGORIES).toContain('Builder')
    expect(CATEGORIES).toContain('JW Stream')
    expect(CATEGORIES).toContain('Accès')
    expect(CATEGORIES).toContain('Matériel')
    expect(CATEGORIES).toContain('Autre')
  })

  it('contient exactement 7 catégories', () => {
    expect(CATEGORIES).toHaveLength(7)
  })

  it('est un tableau', () => {
    expect(Array.isArray(CATEGORIES)).toBe(true)
  })

  it('ne contient pas de doublons', () => {
    const unique = [...new Set(CATEGORIES)]
    expect(unique).toHaveLength(CATEGORIES.length)
  })
})