import { usersService } from './users.service';

/**
 * Test user update functionality
 */
export async function testUserUpdate() {
  console.log('========== USER UPDATE TEST ==========');

  try {
    // Get first user
    const { data: users, error: getUsersError } = await usersService.getUsers();

    if (getUsersError) {
      console.error('❌ Failed to fetch users:', getUsersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('ℹ️  No users found to test');
      return;
    }

    const testUser = users[0];
    console.log(`📝 Testing update for user: ${testUser.name}`);

    // Try to update a simple field
    const { data: updatedUser, error: updateError } = await usersService.updateUser(
      testUser.id,
      {
        name: `${testUser.name} (Updated at ${new Date().toLocaleTimeString()})`
      }
    );

    if (updateError) {
      console.error('❌ Update failed:', updateError);
      return;
    }

    if (updatedUser) {
      console.log('✅ Update successful!');
      console.log('Updated user:', updatedUser);
    } else {
      console.error('❌ Update returned no data');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  console.log('========== END TEST ==========');
}
