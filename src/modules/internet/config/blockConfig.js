// Block Configuration - Bank details, pricing & operational costs per block
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
    },
    // Monthly operational costs for Blok A
    expenses: {
      Bandwidth: { label: '🌐 Internet Starlink', nominal: 750000 },
      Listrik: { label: '⚡ Listrik Starlink & Perangkat Jaringan', nominal: 75000 }
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
    },
    // Monthly operational costs for Blok B
    expenses: {
      Bandwidth: { label: '🌐 Internet Starlink', nominal: 800000 },
      Support: { label: '🔧 Support & Maintenance', nominal: 500000 },
      Listrik: { label: '⚡ Listrik Starlink & Perangkat Jaringan', nominal: 75000 }
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

// Get the fixed expense amount for a category in a specific block
export function getBlockExpenseAmount(blockId, category) {
  const config = getBlockConfig(blockId)
  return config?.expenses?.[category]?.nominal || null
}

// Get all expense categories for a block (returns config-aware categories)
export function getBlockExpenseCategories(blockId) {
  const config = getBlockConfig(blockId)
  return config?.expenses || {}
}
