import type { Context } from 'hono';
import { firebaseDatabase } from '@/config/firebase';

export const getTrafficReport = async (c: Context) => {
  try {
    const snapshot = await firebaseDatabase.ref('/teams/10').once('value');
    const data = snapshot.val();

    return c.json(data || {});
  } catch (error) {
    console.error('Error fetching Firebase data:', error);
    return c.json({ error: 'Failed to fetch data from Firebase' }, 500);
  }
};
