/**
 * Sets Convex deployment env `JWKS` from existing `JWT_PRIVATE_KEY` (same keypair @convex-dev/auth expects).
 * Run from repo root with CLI auth (e.g. `.env.local` with CONVEX_DEPLOYMENT):
 *   node scripts/set-jwks-on-convex.mjs
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
  let pem = out.trim();
  if ((pem.startsWith("'") && pem.endsWith("'")) || (pem.startsWith('"') && pem.endsWith('"'))) {
    pem = pem.slice(1, -1);
  }
  pem = pem.replace(/\\n/g, '\n');
  return pem;
}

async function buildJwks(pem) {
  const normalized = pem.includes('BEGIN PRIVATE KEY')
    ? pem
    : pem.replace(/ /g, '\n');
  const key = await importPKCS8(normalized, 'RS256');
  const jwk = await exportJWK(key);
  const { d, p, q, dp, dq, qi, oth, ...pub } = jwk;
  return JSON.stringify({ keys: [{ use: 'sig', ...pub }] });
}

const pem = getPrivateKeyPem();
const jwks = await buildJwks(pem);

execFileSync('npx', ['convex', 'env', 'set', 'JWKS', jwks], {
  cwd: root,
  stdio: 'inherit',
});
console.error('Set JWKS on current Convex deployment.');
