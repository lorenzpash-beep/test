const puppeteer = require('puppeteer');
const path = require('path');

const templates = {
  creature: (data) => `
    <div class="stat-block">
      <hr class="orange-border" />
      <div class="creature-heading">
        ${data.imagePath ? `<img src="file://${data.imagePath}" class="art-top-right" />` : ''}
        <h1>${data.name || 'Creature Name'}</h1>
        <h2>${data.size || 'Medium'} ${data.type || 'humanoid'}, ${data.alignment || 'any alignment'}</h2>
      </div>
      <hr class="orange-border" />
      <svg height="5" width="100%" class="tapered-rule">
        <polyline points="0,0 400,2.5 0,5"></polyline>
      </svg>
      <div class="property-line first">
        <h4>Armor Class</h4>
        <p>${data.ac || '10'}</p>
      </div>
      <div class="property-line">
        <h4>Hit Points</h4>
        <p>${data.hp || '10 (3d8)'}</p>
      </div>
      <div class="property-line last">
        <h4>Speed</h4>
        <p>${data.speed || '30 ft.'}</p>
      </div>
      <svg height="5" width="100%" class="tapered-rule">
        <polyline points="0,0 400,2.5 0,5"></polyline>
      </svg>
      <div class="abilities">
        <div class="ability-strength">
          <h4>STR</h4>
          <p>${data.str || '10 (+0)'}</p>
        </div>
        <div class="ability-dexterity">
          <h4>DEX</h4>
          <p>${data.dex || '10 (+0)'}</p>
        </div>
        <div class="ability-constitution">
          <h4>CON</h4>
          <p>${data.con || '10 (+0)'}</p>
        </div>
        <div class="ability-intelligence">
          <h4>INT</h4>
          <p>${data.int || '10 (+0)'}</p>
        </div>
        <div class="ability-wisdom">
          <h4>WIS</h4>
          <p>${data.wis || '10 (+0)'}</p>
        </div>
        <div class="ability-charisma">
          <h4>CHA</h4>
          <p>${data.cha || '10 (+0)'}</p>
        </div>
      </div>
      <svg height="5" width="100%" class="tapered-rule">
        <polyline points="0,0 400,2.5 0,5"></polyline>
      </svg>
      <div class="property-line first">
        <h4>Senses</h4>
        <p>${data.senses || 'passive Perception 10'}</p>
      </div>
      <div class="property-line">
        <h4>Languages</h4>
        <p>${data.languages || 'any one language (usually Common)'}</p>
      </div>
      <div class="property-line last">
        <h4>Challenge</h4>
        <p>${data.cr || '0 (10 XP)'}</p>
      </div>
      <svg height="5" width="100%" class="tapered-rule">
        <polyline points="0,0 400,2.5 0,5"></polyline>
      </svg>
      ${data.traits ? data.traits.map(t => `<div class="property-block"><h4>${t.name}.</h4><p>${t.description}</p></div>`).join('') : ''}
      <div class="section-heading">Actions</div>
      ${data.actions ? data.actions.map(a => `<div class="property-block"><h4>${a.name}.</h4><p>${a.description}</p></div>`).join('') : ''}
    </div>
  `,
  item: (data) => `
    <div class="phb-page">
      <div class="item-card">
        ${data.imagePath ? `<img src="file://${data.imagePath}" class="art-beside" />` : ''}
        <h1 class="item-name">${data.name || 'Magic Item'}</h1>
        <p class="item-type">${data.type || 'Wondrous item'}, ${data.rarity || 'uncommon'} ${data.attunement ? '(requires attunement)' : ''}</p>
        <div class="description-text">
          ${(data.description || '').split('\n').map(p => `<p>${p}</p>`).join('')}
        </div>
      </div>
    </div>
  `,
  race: (data) => `
    <div class="phb-page">
      ${data.imagePath ? `<img src="file://${data.imagePath}" class="art-float-right" />` : ''}
      <h1>${data.name}</h1>
      <div class="description-text">
        ${(data.description || '').split('\n').map(p => `<p>${p}</p>`).join('')}
      </div>
      <h2>${data.name} Traits</h2>
      <p>Your ${data.name} character has the following traits.</p>
      <div class="property-block"><h4>Ability Score Increase.</h4><p>${data.asi || 'Your ability scores increase.'}</p></div>
      <div class="property-block"><h4>Age.</h4><p>${data.age || 'Standard aging.'}</p></div>
      <div class="property-block"><h4>Alignment.</h4><p>${data.alignment || 'Any alignment.'}</p></div>
      <div class="property-block"><h4>Size.</h4><p>${data.size || 'Medium.'}</p></div>
    </div>
  `,
  class: (data) => `
    <div class="phb-page">
      ${data.imagePath ? `<img src="file://${data.imagePath}" class="art-float-right" />` : ''}
      <h1>${data.name}</h1>
      <div class="description-text">
        ${(data.description || '').split('\n').map(p => `<p>${p}</p>`).join('')}
      </div>
      <h2>Class Features</h2>
      <p>As a ${data.name}, you gain the following class features.</p>
      <h3>Hit Points</h3>
      <p><strong>Hit Dice:</strong> ${data.hitDice || '1d8'} per ${data.name} level</p>
      <h3>Proficiencies</h3>
      <p><strong>Armor:</strong> ${data.armor || 'None'}<br/><strong>Weapons:</strong> ${data.weapons || 'None'}</p>
    </div>
  `,
  weapon: (data) => `
    <div class="phb-page">
      ${data.imagePath ? `<img src="file://${data.imagePath}" class="art-float-right" />` : ''}
      <h1>${data.name}</h1>
      <table class="equipment-table">
        <thead>
          <tr><th>Name</th><th>Cost</th><th>Damage</th><th>Weight</th><th>Properties</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>${data.name}</td>
            <td>${data.cost || '-'}</td>
            <td>${data.damage || '-'}</td>
            <td>${data.weight || '-'}</td>
            <td>${data.properties || '-'}</td>
          </tr>
        </tbody>
      </table>
      <div class="description-text" style="margin-top: 20px;">
        ${(data.description || '').split('\n').map(p => `<p>${p}</p>`).join('')}
      </div>
    </div>
  `
};

const baseCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400;1,700&family=Open+Sans:wght@400;700&display=swap');

  body {
    background: white;
    font-family: 'Open Sans', sans-serif;
    padding: 0;
    margin: 0;
  }

  .phb-page {
    background: #fdf1dc;
    padding: 0.5in;
    min-height: 11in;
    box-sizing: border-box;
    color: #000;
    position: relative;
  }

  h1 {
    font-family: 'Lora', serif;
    color: #58180d;
    font-size: 36px;
    margin-bottom: 10px;
    border-bottom: 2px solid #c9ad6a;
  }

  .stat-block {
    background: #fdf1dc;
    width: 100%;
    max-width: 450px;
    padding: 15px;
    box-sizing: border-box;
    border: 1px solid #ddd;
    position: relative;
  }

  .art-top-right {
    float: right;
    width: 150px;
    height: auto;
    border-radius: 5px;
    margin-left: 10px;
  }

  .art-beside {
    float: right;
    width: 200px;
    margin-left: 20px;
  }

  .art-float-right {
    float: right;
    width: 250px;
    margin-left: 20px;
  }

  .creature-heading h1 { border: none; font-size: 24px; margin: 0; }
  .creature-heading h2 { border: none; font-style: italic; font-size: 12px; margin: 0; }
  .orange-border { height: 5px; border: none; background: #58180d; margin: 5px 0; }
  .tapered-rule { fill: #58180d; margin: 5px 0; }
  .property-line h4, .property-block h4 { display: inline; color: #58180d; font-weight: bold; margin: 0; }
  .property-line p, .property-block p { display: inline; margin-left: 5px; }
  .abilities { display: flex; justify-content: space-around; color: #58180d; text-align: center; }
  .section-heading { border-bottom: 1px solid #58180d; color: #58180d; font-size: 18px; font-family: 'Lora', serif; margin: 10px 0 5px 0; font-variant: small-caps; font-weight: bold; }
  .equipment-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  .equipment-table th { background: #58180d; color: white; text-align: left; padding: 5px; }
  .equipment-table td { padding: 5px; border-bottom: 1px solid #c9ad6a; }
`;

async function generatePDF(type, data, outputPath, thumbPath) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const content = `
    <html>
      <head>
        <style>${baseCSS}</style>
      </head>
      <body>
        ${templates[type] ? templates[type](data) : `<div>Unknown type</div>`}
      </body>
    </html>
  `;

  await page.setContent(content, { waitUntil: 'networkidle0' });

  // Capture screenshot for thumbnail
  if (thumbPath) {
    await page.screenshot({ path: thumbPath });
  }

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true
  });

  await browser.close();
}

module.exports = { generatePDF, templates, baseCSS };
