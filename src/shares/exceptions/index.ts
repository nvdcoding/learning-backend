import { emailConfig } from 'src/configs/email.config';

export const httpErrors = {
  // AUTH
  UNAUTHORIZED: {
    message: 'Unauthorized',
    code: 'ERR_AUTH_001',
  },
  // User
  USER_EXIST: {
    message: 'User exist',
    code: 'ERR_USER_001',
  },
  USER_NOT_FOUND: {
    message: 'User not found',
    code: 'ERR_USER_002',
  },
  USER_NOT_ACTIVE: {
    message: 'User is not active',
    code: 'ERR_USER_003',
  },
  USER_LOGIN_FAIL: {
    message: 'Email or password not match',
    code: 'ERR_USER_004',
  },
  //ADMIN
  ADMIN_LOGIN_FAIL: {
    message: 'Username or password not match',
    code: 'ERR_ADMIN_004',
  },
  ADMIN_NOT_ACTIVE: {
    message: 'Account is not active',
    code: 'ERR_USER_003',
  },
  // Email
  WAIT_TO_RESEND: {
    message: `Please wait for ${emailConfig.registerTTL} seconds to resend`,
    code: `ERR_EMAIL_001`,
  },
  //REGISTER
  REGISTER_TOKEN_NOT_FOUND: {
    message: `Register token not found`,
    code: `ERR_REGISTER_001`,
  },
  REGISTER_TOKEN_NOT_MATCH: {
    message: `Register token not match`,
    code: `ERR_REGISTER_002`,
  },

  // COURSE
  COURSE_FOUND: {
    message: `Course found!`,
    code: `ERR_COURSE_001`,
  },
  COURSE_NOT_FOUND: {
    message: `Course not found!`,
    code: `ERR_COURSE_002`,
  },
  // LESSON
  LESSON_NOT_FOUND: {
    message: `Lesson not found`,
    code: `ERR_LESSON_001`,
  },
  COURSE_ID_NOT_DEFINED: {
    message: `Course id not defined`,
    code: `ERR_LESSON_002`,
  },
  // EXERCISE
  EXERCISE_NOT_FOUND: {
    message: `Exercise not found`,
    code: `ERR_EXERCISE_001`,
  },
};
