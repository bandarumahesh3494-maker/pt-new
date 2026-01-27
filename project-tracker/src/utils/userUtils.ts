import { User } from '../types';

/**
 * Generic function to get user's full name by ID
 * @param userId - The user ID to look up
 * @param users - Array of users to search from
 * @returns User's full name or 'Unknown' if not found
 */
export const getUserNameById = (userId: string | null, users: User[]): string => {
  if (!userId) return 'Unknown';

  const user = users.find(u => u.id === userId);
  return user?.full_name || 'Unknown';
};

/**
 * Get creator name from created_by field
 * @param createdBy - The created_by field value
 * @param users - Array of users to search from
 * @returns Creator's full name or 'Unknown' if not found
 */
export const getCreatorName = (createdBy: string | null, users: User[]): string => {
  return getUserNameById(createdBy, users);
};
