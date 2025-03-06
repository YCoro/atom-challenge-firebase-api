/**
 * Authentication constants
 */
export const AUTH = {
  // Header prefixes
  USER_ID_PREFIX: 'UserId',
  EMAIL_PREFIX: 'Email',
  
  // Query parameter names
  USER_ID_PARAM: 'userId',
  EMAIL_PARAM: 'email',
  
  // Request body field names
  USER_ID_FIELD: 'userId',
  EMAIL_FIELD: 'email',
};

/**
 * Database collection names
 */
export const COLLECTIONS = {
  TASKS: 'tasks',
  USERS: 'users',
};

/**
 * Field names in documents
 */
export const FIELDS = {
  // Common fields
  ID: 'id',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  
  // Task fields
  TITLE: 'title',
  DESCRIPTION: 'description',
  COMPLETED: 'completed',
  USER_ID: 'userId',
  
  // User fields
  EMAIL: 'email',
};

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  // Authentication errors
  AUTH_REQUIRED: 'Authentication required. Provide userId or email.',
  USER_NOT_FOUND: 'User not found. Invalid authentication.',
  INVALID_EMAIL_FORMAT: 'Invalid email format',
  INTERNAL_AUTH_ERROR: 'Internal server error during authentication',
  
  // Task errors
  TASK_NOT_FOUND: 'Task not found',
  TITLE_REQUIRED: 'Task title is required',
  FORBIDDEN_TASK_UPDATE: 'Forbidden - You do not have permission to update this task',
  FORBIDDEN_TASK_DELETE: 'Forbidden - You do not have permission to delete this task',
  FORBIDDEN_TASK_ACCESS: 'Forbidden - You do not have permission to access this task',
  FAILED_GET_TASKS: 'Failed to get tasks',
  FAILED_GET_TASK: 'Failed to get task',
  FAILED_CREATE_TASK: 'Failed to create task',
  FAILED_UPDATE_TASK: 'Failed to update task',
  FAILED_DELETE_TASK: 'Failed to delete task',
  
  // User errors
  EMAIL_REQUIRED: 'Email is required',
  FAILED_GET_USER: 'Failed to get user',
  FAILED_CREATE_USER: 'Failed to create user',
}; 