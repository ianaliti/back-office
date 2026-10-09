export const ALLERGEN_EMOJI: Record<string, string> = {
  gluten: '🌾', lactose: '🥛', oeufs: '🥚', poisson: '🐟',
  arachides: '🥜', soja: '🫘', fruits_coque: '🌰', celeri: '🌿',
  moutarde: '🌻', sesame: '🌱', sulfites: '🍷', lupin: '🫛',
  crustaces: '🦐', mollusques: '🦪',
}

export const ALLERGEN_LABEL: Record<string, string> = {
  gluten: 'Gluten', lactose: 'Lait', oeufs: 'Œufs', poisson: 'Poissons',
  arachides: 'Arachides', soja: 'Soja', fruits_coque: 'Fruits à coque',
  celeri: 'Céleri', moutarde: 'Moutarde', sesame: 'Sésame',
  sulfites: 'Sulfites', lupin: 'Lupin', crustaces: 'Crustacés', mollusques: 'Mollusques',
}

export const DIET_LABEL: Record<string, string> = {
  vegan: 'Vegan', vegetarian: 'Végétarien', gluten_free: 'Sans gluten',
  lactose_free: 'Sans lactose', halal: 'Halal', kosher: 'Kosher',
}

export const DIET_COLORS: Record<string, { bg: string; text: string }> = {
  vegan:        { bg: '#D1FAE5', text: '#065F46' },
  vegetarian:   { bg: '#DCFCE7', text: '#166534' },
  halal:        { bg: '#FEF3C7', text: '#92400E' },
  kosher:       { bg: '#DBEAFE', text: '#1E40AF' },
  gluten_free:  { bg: '#FEE2E2', text: '#991B1B' },
  lactose_free: { bg: '#F3E8FF', text: '#6B21A8' },
}
