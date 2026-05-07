function extractCreatureData(text) {
  const data = {};

  // Name (usually first line or after certain headers)
  data.name = text.split('\n')[0].trim();

  // AC
  const acMatch = text.match(/Armor Class\s+(\d+)/i);
  data.ac = acMatch ? acMatch[1] : '10';

  // HP
  const hpMatch = text.match(/Hit Points\s+([\d\s\(\)d\+\-]+)/i);
  data.hp = hpMatch ? hpMatch[1].trim() : '10 (3d8)';

  // Speed
  const speedMatch = text.match(/Speed\s+([^\n]+)/i);
  data.speed = speedMatch ? speedMatch[1].trim() : '30 ft.';

  // Abilities
  const abilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  abilities.forEach(ab => {
    const abMatch = new RegExp(`${ab}\\s+(\\d+)\\s*\\(([+-]\\d+)\\)`, 'i').exec(text);
    if (abMatch) {
      data[ab.toLowerCase()] = `${abMatch[1]} (${abMatch[2]})`;
    } else {
      data[ab.toLowerCase()] = '10 (+0)';
    }
  });

  // Senses, Languages, Challenge
  const sensesMatch = text.match(/Senses\s+([^\n]+)/i);
  data.senses = sensesMatch ? sensesMatch[1].trim() : 'passive Perception 10';

  const langMatch = text.match(/Languages\s+([^\n]+)/i);
  data.languages = langMatch ? langMatch[1].trim() : 'Common';

  const crMatch = text.match(/Challenge\s+([\d\/]+)/i);
  data.cr = crMatch ? crMatch[1] : '0';

  return data;
}

function extractItemData(text) {
    const data = { name: text.split('\n')[0].trim() };
    const typeMatch = text.match(/(Wondrous item|Armor|Weapon|Potion|Ring|Staff|Rod|Wand),?\s+([^,]+)/i);
    data.type = typeMatch ? typeMatch[1] : 'Wondrous item';
    data.rarity = typeMatch ? typeMatch[2] : 'uncommon';
    data.attunement = /requires attunement/i.test(text);
    data.description = text;
    return data;
}

function extractData(type, text) {
    if (type === 'creature') return extractCreatureData(text);
    if (type === 'item') return extractItemData(text);
    return { name: text.split('\n')[0].trim(), description: text };
}

module.exports = { extractData };
