/**
 * One-off / CI helper: read JWT_PRIVATE_KEY from Convex (dev deployment) and print JWKS JSON
 * for @convex-dev/auth (same shape as `generateKeys` in @convex-dev/auth).
 *
 * Usage (from repo root, with .env.local / Convex auth configured for CLI):
 *   node scripts/derive-jwks-from-convex-private-key.mjs
 */
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { importPKCS8, exportJWK } from 'jose';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function getPrivateKeyPem() {
  const out = execFileSync('npx', ['convex', 'env', 'get', 'JWT_PRIVATE_KEY'], {
    encoding: 'utf8',
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  // CLI may wrap in single quotes; strip outer quotes and normalize newlines
  let pem = out.trim();
  if ((pem.startsWith("'") && pem.endsWith("'")) || (pem.startsWith('"') && pem.endsWith('"'))) {
    pem = pem.slice(1, -1);
  }
  pem = pem.replace(/\\n/g, '\n');
  return pem;
}

const pem = getPrivateKeyPem();
const privateKey = await importPKCS8(pem, 'RS256');
const jwk = await exportJWK(privateKey);
const { d, p, q, dp, dq, qi, ...publicOnly } = jwk;
const jwks = JSON.stringify({ keys: [{ use: 'sig', ...publicOnly }] });
process.stdout.write(jwks);
