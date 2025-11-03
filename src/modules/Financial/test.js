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
    console.log('Cache successful!! Yippee (👉ﾟヮﾟ)👉');
  } else {
    console.log('Cache failed 😭🥀');
  }
} catch (error) {
  console.error(error);
}
