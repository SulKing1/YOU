import { describe, expect, it } from 'vitest'
import { initials } from './utils'

describe('initials', () => {
  it('returns the first two initials uppercased', () => {
    expect(initials('Sultan King')).toBe('SK')
  })

  it('handles a single name', () => {
    expect(initials('sultan')).toBe('S')
  })

  it('collapses extra whitespace and ignores trailing names', () => {
    expect(initials('  ada   lovelace   byron ')).toBe('AL')
  })

  it('returns an empty string for an empty input', () => {
    expect(initials('   ')).toBe('')
  })
})
