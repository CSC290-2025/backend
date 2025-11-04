import ngrok from '@ngrok/ngrok';

export async function startNgrok(port: number, authToken: string) {
  try {
    const listener = await ngrok.forward({
      addr: port,
      authtoken: authToken,
    });

    const url = listener.url();
    console.log(`\n🌐 ngrok tunnel: ${url}`);
    console.log(`   Forwarding to: http://localhost:${port}\n`);

    return url;
  } catch (error) {
    console.error('Failed to start ngrok:', error);
    return null;
  }
}
