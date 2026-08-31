import 'dotenv/config';
import { db } from '../server/db/store';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${testName} - Detail: ${detail || 'Assertion failed'}`);
  }
}

async function runProfileTests() {
  console.log('===============================================================');
  console.log('RESEARCHFLOW AI - PROFILE SETTINGS & AVATAR SAVE TEST SUITE');
  console.log('===============================================================\n');

  // Test 1: User Registration
  const testUser = db.registerUser({
    email: `test_profile_${Date.now()}@example.com`,
    name: 'John Smith',
  });
  assert(testUser.user.name === 'John Smith', 'User created with name John Smith');
  assert(testUser.user.avatarType === 'INITIALS', 'User defaults to INITIALS avatarType');
  assert(testUser.user.avatarValue === 'JS', 'User computed initials is JS');

  // Test 2: Update Full Name & Display Name (Dilip Chendra / dilip-ai)
  const updated1 = db.updateUserProfile(testUser.user.id, {
    name: 'Dilip Chendra',
    displayName: 'dilip-ai',
    avatarType: 'INITIALS',
  });
  assert(updated1?.name === 'Dilip Chendra', 'Name updated to Dilip Chendra');
  assert(updated1?.displayName === 'dilip-ai', 'DisplayName updated to dilip-ai');
  assert(updated1?.avatarValue === 'DC', `Initials updated from new name to DC: got ${updated1?.avatarValue}`);

  // Test 3: Update Avatar to Emoji (🚀)
  const updated2 = db.updateUserProfile(testUser.user.id, {
    avatarType: 'EMOJI',
    avatarValue: '🚀',
  });
  assert(updated2?.avatarType === 'EMOJI', 'AvatarType set to EMOJI');
  assert(updated2?.avatarValue === '🚀', 'AvatarValue set to 🚀');

  // Test 4: Update Avatar to Custom Photo (IMAGE)
  const samplePhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const updated3 = db.updateUserProfile(testUser.user.id, {
    avatarType: 'IMAGE',
    avatarValue: samplePhoto,
    profileImageUrl: samplePhoto,
  });
  assert(updated3?.avatarType === 'IMAGE', 'AvatarType set to IMAGE');
  assert(updated3?.profileImageUrl === samplePhoto, 'ProfileImageUrl saved');
  assert(updated3?.avatarUrl === samplePhoto, 'AvatarUrl synchronized with ProfileImageUrl');

  // Test 5: Update Avatar to Vector (DEFAULT)
  const updated4 = db.updateUserProfile(testUser.user.id, {
    avatarType: 'DEFAULT',
    avatarValue: '',
  });
  assert(updated4?.avatarType === 'DEFAULT', 'AvatarType set to DEFAULT (Vector)');

  // Test 6: Remove photo and reset to Initials
  const updated5 = db.updateUserProfile(testUser.user.id, {
    avatarType: 'INITIALS',
    avatarValue: '',
    profileImageUrl: '',
  });
  assert(updated5?.avatarType === 'INITIALS', 'Reset avatarType to INITIALS');
  assert(updated5?.profileImageUrl === '', 'ProfileImageUrl cleared');
  assert(updated5?.avatarValue === 'DC', `Initials auto-computed on photo reset to DC: got ${updated5?.avatarValue}`);

  // Test 7: Multi-User Isolation
  const userA = db.registerUser({
    email: `alice_test_${Date.now()}@example.com`,
    name: 'Alice Example',
  });
  const userB = db.registerUser({
    email: `bob_test_${Date.now()}@example.com`,
    name: 'Bob Example',
  });

  db.updateUserProfile(userA.user.id, {
    displayName: 'alice-crypto',
    avatarType: 'EMOJI',
    avatarValue: '🚀',
  });

  db.updateUserProfile(userB.user.id, {
    displayName: 'bob-builder',
    avatarType: 'EMOJI',
    avatarValue: '🎯',
  });

  const checkA = db.getUser(userA.user.id);
  const checkB = db.getUser(userB.user.id);

  assert(checkA?.displayName === 'alice-crypto' && checkA?.avatarValue === '🚀', 'User A profile preserved');
  assert(checkB?.displayName === 'bob-builder' && checkB?.avatarValue === '🎯', 'User B profile preserved');
  assert(checkA?.avatarValue !== checkB?.avatarValue, 'User A and User B have completely distinct avatars');

  // Test 8: Workspace Members Synchronization
  const members = Array.from(db.getWorkspacesForUser(userA.user.id)).flatMap(w => db.getWorkspaceMembers(w.id));
  const memberA = members.find(m => m.email.toLowerCase() === userA.user.email.toLowerCase());
  if (memberA) {
    assert(memberA.avatarType === 'EMOJI', 'WorkspaceMember avatarType synchronized');
  }

  // Summary
  console.log('\n===============================================================');
  console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runProfileTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
