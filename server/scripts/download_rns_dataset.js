import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.join(__dirname, '../data/sociedades');
const targetFile = path.join(targetDir, 'registro-nacional-sociedades.csv');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const url = 'https://datos.jus.gob.ar/dataset/ee83de85-4305-4c53-9a9f-fd3d15e42c36/resource/6096331b-0511-4728-b01b-6c6b535f4c2b/download/registro-nacional-sociedades-muestreo.csv';

console.log(`📥 Downloading Registro Nacional de Sociedades dataset from:`);
console.log(`   ${url}`);

const fileStream = fs.createWriteStream(targetFile);

function download(downloadUrl) {
  const client = downloadUrl.startsWith('https') ? https : http;
  client.get(downloadUrl, { rejectUnauthorized: false }, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log(`↪ Redirecting to: ${res.headers.location}`);
      return download(res.headers.location);
    }
    if (res.statusCode !== 200) {
      console.error(`❌ Download failed with status HTTP ${res.statusCode}`);
      process.exit(1);
    }

    let downloadedBytes = 0;
    res.on('data', (chunk) => {
      downloadedBytes += chunk.length;
    });

    res.pipe(fileStream);

    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`✅ Download complete! Saved to: ${targetFile} (${(downloadedBytes / 1024).toFixed(2)} KB)`);
    });
  }).on('error', (err) => {
    fs.unlink(targetFile, () => {});
    console.error(`❌ Download error: ${err.message}`);
    process.exit(1);
  });
}

download(url);
