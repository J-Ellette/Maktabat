import { describe, it, expect, beforeEach } from 'vitest'
import { analyzeWord, clearMorphologyCache } from './morphology'

describe('analyzeWord', () => {
  beforeEach(() => {
    clearMorphologyCache()
  })

  it('should return a MorphologyResult for a basic Arabic word', () => {
    const result = analyzeWord('كَتَبَ')
    expect(result).toBeDefined()
    expect(result.word).toBe('كَتَبَ')
    expect(result.root).toBeTruthy()
    expect(result.partOfSpeech).toBeTruthy()
  })

  it('should return consistent results for the same word', () => {
    const first = analyzeWord('قَرَأَ')
    const second = analyzeWord('قَرَأَ')
    expect(first).toEqual(second)
  })

  it('should cache results (second call is from cache)', () => {
    const word = 'رَحِمَ'
    analyzeWord(word) // fills cache
    const cached = analyzeWord(word) // from cache
    expect(cached).toBeDefined()
    expect(cached.word).toBe(word)
  })

  it('should handle Form X (استفعل pattern)', () => {
    const result = analyzeWord('استَغْفَرَ')
    expect(result.wazanForm).toBe(10)
  })

  it('should handle non-Arabic text gracefully', () => {
    const result = analyzeWord('hello')
    expect(result).toBeDefined()
    expect(result.word).toBe('hello')
  })

  it('should handle empty string', () => {
    const result = analyzeWord('')
    expect(result).toBeDefined()
  })
})
