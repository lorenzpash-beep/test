function extractCreatureData(text) {
  const data = {};
  const lines = text.split('\n');
  data.name = lines[0].trim();

  const acMatch = text.match(/Armor Class\s+(\d+)/i);
  data.ac = acMatch ? acMatch[1] : '10';

  const hpMatch = text.match(/Hit Points\s+([\d\s\(\)d\+\-]+)/i);
  data.hp = hpMatch ? hpMatch[1].trim() : '10 (3d8)';

  const speedMatch = text.match(/Speed\s+([^\n]+)/i);
  data.speed = speedMatch ? speedMatch[1].trim() : '30 ft.';

  const abilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  abilities.forEach(ab => {
    const abMatch = new RegExp(`${ab}\\s+(\\d+)\\s*\\(([+-]\\d+)\\)`, 'i').exec(text);
    if (abMatch) {
      data[ab.toLowerCase()] = `${abMatch[1]} (${abMatch[2]})`;
    } else {
      data[ab.toLowerCase()] = '10 (+0)';
    }
  });

  const sensesMatch = text.match(/Senses\s+([^\n]+)/i);
  data.senses = sensesMatch ? sensesMatch[1].trim() : 'passive Perception 10';
  const langMatch = text.match(/Languages\s+([^\n]+)/i);
  data.languages = langMatch ? langMatch[1].trim() : 'Common';
  const crMatch = text.match(/Challenge\s+([\d\/]+)/i);
  data.cr = crMatch ? crMatch[1] : '0';

  const traits = [];
  const actions = [];
  let currentSection = 'traits';

  for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (/Actions/i.test(line)) {
          currentSection = 'actions';
          continue;
      }

      const match = line.match(/^([A-Z][a-z]+(\s[A-Z][a-z]+)*)\.\s+(.*)/);
      if (match) {
          const item = { name: match[1], description: match[3] };
          if (currentSection === 'traits') traits.push(item);
          else actions.push(item);
      }
  }

  data.traits = traits;
  data.actions = actions;
  data.description = text;
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

function extractRaceData(text) {
    const data = { name: text.split('\n')[0].trim() };
    const asiMatch = text.match(/Ability Score Increase\.\s+([^\.]+)/i);
    data.asi = asiMatch ? asiMatch[1].trim() : 'Your ability scores increase.';
    const ageMatch = text.match(/Age\.\s+([^\.]+)/i);
    data.age = ageMatch ? ageMatch[1].trim() : 'Standard aging.';
    const sizeMatch = text.match(/Size\.\s+([^\.]+)/i);
    data.size = sizeMatch ? sizeMatch[1].trim() : 'Medium.';
    data.description = text;
    return data;
}

function extractClassData(text) {
    const data = { name: text.split('\n')[0].trim() };
    const hdMatch = text.match(/Hit Dice:\s+([^\n]+)/i);
    data.hitDice = hdMatch ? hdMatch[1].trim() : '1d8';
    const armorMatch = text.match(/Armor:\s+([^\n]+)/i);
    data.armor = armorMatch ? armorMatch[1].trim() : 'None';
    const weaponsMatch = text.match(/Weapons:\s+([^\n]+)/i);
    data.weapons = weaponsMatch ? weaponsMatch[1].trim() : 'None';
    data.description = text;
    return data;
}

function extractWeaponData(text) {
    const data = { name: text.split('\n')[0].trim() };
    const costMatch = text.match(/Cost:\s+([^\n]+)/i);
    data.cost = costMatch ? costMatch[1].trim() : '-';
    const damageMatch = text.match(/Damage:\s+([^\n]+)/i);
    data.damage = damageMatch ? damageMatch[1].trim() : '-';
    const weightMatch = text.match(/Weight:\s+([^\n]+)/i);
    data.weight = weightMatch ? weightMatch[1].trim() : '-';
    const propsMatch = text.match(/Properties:\s+([^\n]+)/i);
    data.properties = propsMatch ? propsMatch[1].trim() : '-';
    data.description = text;
    return data;
}

function extractData(type, text) {
    if (type === 'creature') return extractCreatureData(text);
    if (type === 'item') return extractItemData(text);
    if (type === 'race') return extractRaceData(text);
    if (type === 'class') return extractClassData(text);
    if (type === 'weapon') return extractWeaponData(text);
    return { name: text.split('\n')[0].trim(), description: text };
}

module.exports = { extractData };
