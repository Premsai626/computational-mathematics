// inject-env.js: Reads BACKEND_URL from process.env and updates config.js for Render Static Site builds
const fs = require('fs');
const path = require('path');

const backendUrl = process.env.BACKEND_URL || process.env.API_BASE_URL || '';
const configPath = path.join(__dirname, 'js', 'config.js');

const content = `/**
 * ChemicalMix — Runtime Production Configuration
 * (Generated during Render Static Site build)
 */
window.CHEMICALMIX_CONFIG = {
    API_BASE_URL: '${backendUrl.replace(/\/+$/, '')}'
};
`;

fs.writeFileSync(configPath, content, 'utf8');
console.log(`[ChemicalMix] Config generated: API_BASE_URL set to '${backendUrl}'`);
