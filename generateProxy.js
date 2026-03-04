/**
 * NOTE
 * Easier proxy addition, the generation is triggered by the npm script:
 * look package.json "gen:proxy" script - should be executed on
 * every build/launch
 */
const fs = require('fs');
const path = require('path');

// notifying the dirty dog
console.log(`🔥 Generating proxies, you dirty dog`)

// Maybe pull proxies list from process.env.PROXY_LIST here?
// BEWARE ORDER MATTERS!!!!! Regex matching on the partial path
const proxies = {
  aruba_lnr: "https://gx-notary.aruba.it",
  aruba: "https://gx-compliance.aruba.it",
  gaia_lnr: "https://registrationnumber.notary.lab.gaia-x.eu",
  deltadao: "https://delta-dao.com",
  zertifier_file_api: "https://zertifier.com/docs/index.php",
};

const proxyConfig = {};
for (const proxy in proxies) {
  proxyConfig[`/${proxy}`] = {
    "target": proxies[proxy],
    "pathRewrite": {
      [`^/${proxy}`]: "" // Square brackets - js synthax for dynamic key literals
    },

    // NOTE ↓ Do we actually need all this garbage ???
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}

// Path to angular proxy.conf.json
const outputPath = path.join(__dirname, 'proxy.conf.json');

// Ensure the directory exists and write the file SYNCHRONOUSLY
fs.writeFileSync(outputPath, JSON.stringify(proxyConfig, null, 2));

console.log(`✅ Proxies generated at ${outputPath}`);
