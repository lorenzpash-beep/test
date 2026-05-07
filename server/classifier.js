function classifyContent(text) {
  const content = text.toLowerCase();

  // Creature patterns
  const creatureKeywords = [
    'armor class', 'hit points', 'speed', 'str', 'dex', 'con', 'int', 'wis', 'cha',
    'senses', 'languages', 'challenge', 'actions', 'legendary actions'
  ];
  if (creatureKeywords.some(keyword => content.includes(keyword))) {
    return 'creature';
  }

  // Weapon patterns
  const weaponKeywords = [
    'weapon (martial, melee)', 'simple weapon, ranged', 'damage:', 'martial melee weapon', 'simple melee weapon'
  ];
  if (weaponKeywords.some(keyword => content.includes(keyword)) || (content.includes('damage') && /\d+d\d+/.test(content))) {
    // Basic check for weapon, but could be monster damage.
    // Usually "Weapon (martial, melee)" is a strong indicator.
    if (content.includes('weapon (') || content.includes('properties:')) {
        return 'weapon';
    }
  }

  // Race patterns
  const raceKeywords = [
    'racial traits', 'ability score increase', 'age', 'alignment', 'size', 'darkvision'
  ];
  if (raceKeywords.every(keyword => content.includes(keyword)) || (content.includes('racial traits') && content.includes('size'))) {
    return 'race';
  }

  // Class patterns
  const classKeywords = [
    'class features', 'hit dice', 'saving throws', 'proficiencies', 'spellcasting ability'
  ];
  if (classKeywords.some(keyword => content.includes(keyword)) && content.includes('level')) {
    return 'class';
  }

  // Item patterns
  const itemKeywords = [
    'wondrous item', 'armor (light)', 'armor (medium)', 'armor (heavy)', 'weapon (any)', 'requires attunement', 'uncommon', 'rare', 'very rare', 'legendary'
  ];
  if (itemKeywords.some(keyword => content.includes(keyword))) {
    return 'item';
  }

  return 'unknown';
}

module.exports = { classifyContent };
