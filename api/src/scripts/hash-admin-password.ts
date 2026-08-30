/**
 * Prints the bcrypt hash (cost 12) of the password given as first argument,
 * for pasting into the ADMIN_PASSWORD_HASH env var (design §3, NFR-6).
 *
 * Usage:
 *   node dist/scripts/hash-admin-password.js 'my-secret-password'
 *   (dev) npx tsx src/scripts/hash-admin-password.ts 'my-secret-password'
 */
import bcrypt from 'bcrypt';

const password = process.argv[2];
if (!password) {
  console.error('Usage: hash-admin-password <password>');
  process.exit(1);
}

console.log(bcrypt.hashSync(password, 12));
