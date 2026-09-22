// Block Configuration - Bank details & pricing per block
export const BLOCK_CONFIG = {
  A: {
    id: 'A',
    name: 'Blok A',
    color: '#10b981',
    colorSecondary: '#059669',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    bank: {
      name: 'BSI',
      accountNumber: '7276140919',
      accountHolder: 'Ardyanto Pri Utomo',
      logo: '🏦'
    },
    iuran: 150000,
    admin: {
      name: 'Ardyanto Pri Utomo',
      role: 'Pengurus Internet Blok A'
    }
  },
  B: {
    id: 'B',
    name: 'Blok B',
    color: '#3b82f6',
    colorSecondary: '#2563eb',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    bank: {
      name: 'Bank Mandiri',
      accountNumber: '1480023234738',
      accountHolder: 'Ardyanto Pri Utomo',
      logo: '🏛️'
    },
    iuran: 150000,
    admin: {
      name: 'Ardyanto Pri Utomo',
      role: 'Pengurus Internet Blok B'
    }
  }
}

export function getBlockConfig(blockId) {
  return BLOCK_CONFIG[blockId?.toUpperCase()] || null
}

export function getBlockBankInfo(blockId) {
  const config = getBlockConfig(blockId)
  return config?.bank || null
}
