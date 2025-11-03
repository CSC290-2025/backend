// to test generating new SCB OAuth token since there is no public endpoint for it
// run with npx tsx
import { ScbService } from './index';

try {
  console.log(' -- First Call -- ');
  const token = await ScbService.getOAuthToken();
  console.log('Token:', token);
  console.log('Expires at:', new Date(token.expiresAt));

  console.log(' -- Cache Test With Second Call -- ');
  const cachedToken = await ScbService.getOAuthToken();
  console.log('Cached Token:', cachedToken);
  console.log('Cached Expires at:', new Date(cachedToken.expiresAt));

  if (token.accessToken === cachedToken.accessToken) {
    console.log('Cache successful!! Yippe (👉ﾟヮﾟ)👉');
  } else {
    console.log('Cache failed 😭🥀');
  }
} catch (error) {
  console.error(error);
}

try {
  console.log(' -- Encrypt Test -- ');
  const testData = {
    refNumber: 'TEST-' + Date.now(),
    customerRef: 'CUST123',
    amount: 250.5,
    currency: 'THB',
    txnDateTime: new Date().toISOString(),
  };

  console.log('Original data:', testData);
  const encrypted = await ScbService.encrypt(testData);
  console.log('Encrypted:', encrypted);
  console.log('Encrypted length:', encrypted.length);
  console.log('Encryption successful!! 🔒');
} catch (error) {
  console.error('Encryption failed:', error);
}
// Decrypt test with known encrypted string
try {
  console.log('\n -- Decrypt Test -- ');

  const encrypted =
    'b2wLiEGCU+zwZFmBzyg82uhy6wFrAEbYOezuXev54zTPOR85p2OSQlKAkP2fic/OymuQWQJQ8APY3StdZTiuQNPekqZG8ACyo/UWgmBKCtZ7xvxnmNQAf2Wnkgh2DpJgQLiMZnCywHR/xGIIzpQcnhbf3Kw8KfKtQOPF5GQbnw9gSHlzOuBdjK3MawXhvB5LQcR7XBEV/dzs2W/UGTgvLkXMFs4pIHgMgQkk5uHJzpCZHzVCmvHKVUhlyobJVl/QRy5KB3uNLXoY0Qn/BaMj6g7RMmOPT2is8PrUWdrRs8U4rFKyJhxFD3lxapEFZzmTXkJiUTd+u+1BN8VLOcIGaZeTmD0el1nQn3uENRlvfeQDsaSvW0IoxaKNXVgVwBk0z+OVDMTy3VKqy6wxrJ8glpHMKQGLiigHVwdcxRH6n3gZar/0eICojz2DmfHN/iHDhxkL6FMfc5B/Tv2tthQOiQ/AsHy5bpJr0MdccLvhqzY30cK02VprOblLg7yNV/FuwgXiJLjrPxFVCARECqqaAo0OrZWUJNohzCccF9TfKew2rwXVDwmDsWpmtJOC118yNlCp908ABkLYP2LEZjruFtemzivVTXrOXRhNFItFr0jlS7+gr3o/XaUjdNUhKoDi9N1Nj1zQqJCWrXTYNrEfPabllgXC+81UL0j9ygG8js0=';

  const value = await ScbService.decrypt(encrypted);
  console.log('Decrypted value:', value);
  console.log('Decryption successful!! 🔓');
} catch (error) {
  console.error('Decryption failed:', error);
}

// exncrypt test
try {
  console.log('\n -- Encrypt  Test -- ');
  const originalData = {
    orderId: 'ORDER-' + Date.now(),
    userId: 'USER456',
    amount: 999.99,
    currency: 'THB',
    status: 'pending',
  };

  console.log('Original:', originalData);
  const encryptedData = await ScbService.encrypt(originalData);
  console.log('Encrypted successfully ✓', encryptedData);
} catch (error) {
  console.error(error);
}
