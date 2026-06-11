import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBadge, { STATUS_CONFIG, STATUS_OPTIONS } from '../../components/ui/StatusBadge'

describe('STATUS_CONFIG', () => {
  it('contient tous les statuts', () => {
    expect(STATUS_CONFIG).toHaveProperty('en_cours')
    expect(STATUS_CONFIG).toHaveProperty('resolu')
    expect(STATUS_CONFIG).toHaveProperty('en_attente')
    expect(STATUS_CONFIG).toHaveProperty('annule')
    expect(STATUS_CONFIG).toHaveProperty('envoye_support')
  })

  it('chaque statut a un label et une icône', () => {
    Object.values(STATUS_CONFIG).forEach(config => {
      expect(config).toHaveProperty('label')
      expect(config).toHaveProperty('icon')
      expect(config.label).toBeTruthy()
      expect(config.icon).toBeTruthy()
    })
  })
})

describe('STATUS_OPTIONS', () => {
  it('est un tableau non vide', () => {
    expect(Array.isArray(STATUS_OPTIONS)).toBe(true)
    expect(STATUS_OPTIONS.length).toBeGreaterThan(0)
  })

  it('chaque option a value et label', () => {
    STATUS_OPTIONS.forEach(option => {
      expect(option).toHaveProperty('value')
      expect(option).toHaveProperty('label')
    })
  })
})