import { db, PersistentDatabaseStore } from '../server/db/store.js';
import path from 'path';

async function testDilipReload() {
  console.log('=== TESTING DILIP PROFILE PERSISTENCE & RELOAD ===');

  const dilip = db.getUser('usr_1788165870953_adc607b1');
  console.log('Current user before update:', dilip);

  // Update profile to EMOJI: 🧠
  const updated = db.updateUserProfile('usr_1788165870953_adc607b1', {
    name: 'Dilip',
    displayName: 'Dilip',
    avatarType: 'EMOJI',
    avatarValue: '🧠',
  });
  console.log('Updated user in memory:', updated);

  // Force synchronous save
  db.saveToDiskSync();

  // Create new store instance loading directly from disk
  const freshDb = new PersistentDatabaseStore(path.join(process.cwd(), 'data'));
  const reloadedUser = freshDb.getUser('usr_1788165870953_adc607b1');
  console.log('Reloaded user from fresh store instance:', reloadedUser);

  if (reloadedUser?.avatarType === 'EMOJI' && reloadedUser?.avatarValue === '🧠') {
    console.log('✅ FRESH DB LOAD PRESERVES EMOJI AVATAR');
  } else {
    console.log('❌ FRESH DB LOAD LOST AVATAR:', reloadedUser?.avatarType, reloadedUser?.avatarValue);
  }
}

testDilipReload();
