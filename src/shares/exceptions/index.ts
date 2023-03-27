import { emailConfig } from 'src/configs/email.config';

export const httpErrors = {
  // User
  USER_EXIST: {
    message: 'User exist',
    code: 'ERR_USER_001',
  },
  USER_NOT_FOUND: {
    message: 'User not found',
    code: 'ERR_USER_002',
  },
  // Email
  WAIT_TO_RESEND: {
    message: `Please wait for ${emailConfig.registerTTL} seconds to resend`,
    code: `ERR_EMAIL_001`,
  },
};
