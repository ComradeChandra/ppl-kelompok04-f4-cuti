import { describe, expect, it } from 'vitest'
import { shortId } from '../short-id'
import { accountsFor, findAccount } from './accounts'

describe('accountsFor', () => {
  it('mode f2 hanya menawarkan karyawan dari API Kelompok 2 beserta penyetuju', () => {
    expect(accountsFor('f2').map((a) => a.name)).toEqual(['Sandy Walsh', 'Rina Maharani', 'Bima Saputra', 'Maya Lestari'])
  })

  it('mode seed tidak menawarkan karyawan Kelompok 2', () => {
    const names = accountsFor('seed').map((a) => a.name)
    expect(names[0]).toBe('Nadia Prameswari')
    expect(names).not.toContain('Sandy Walsh')
    expect(names).toContain('Bima Saputra')
  })

  it('token yang tidak tersedia pada sumber aktif jatuh ke akun pertama', () => {
    expect(findAccount('token-uji-karyawan', accountsFor('f2')).name).toBe('Sandy Walsh')
  })
})

describe('shortId', () => {
  it('menyingkat UUID v7 dan membiarkan ID pendek', () => {
    expect(shortId('01929b4a-5f10-7a22-9d44-3c8f1b2e7a90')).toBe('01929b4a...7a90')
    expect(shortId('EMP-001')).toBe('EMP-001')
  })
})
