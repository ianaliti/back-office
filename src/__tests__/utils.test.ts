import { cn, formatPrice, formatDate } from '@/lib/utils'

describe('cn()', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('resolves tailwind conflicts (last wins)', () => {
    expect(cn('p-4', 'p-6')).toBe('p-6')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('handles undefined and null values', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end')
  })

  it('handles array inputs', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c')
  })
})

describe('formatPrice()', () => {
  it('formats a price in USD', () => {
    expect(formatPrice(9.99)).toContain('9.99')
  })

  it('formats zero', () => {
    expect(formatPrice(0)).toContain('0')
  })

  it('formats large numbers', () => {
    expect(formatPrice(1000)).toContain('1,000')
  })
})

describe('formatDate()', () => {
  it('formats a valid date string', () => {
    const result = formatDate('2024-01-15T00:00:00.000Z')
    expect(result).toContain('2024')
  })

  it('returns a string', () => {
    expect(typeof formatDate('2024-06-01')).toBe('string')
  })
})
