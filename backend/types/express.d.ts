// Express Request augmentation for custom fields used in ShramSetu backend

declare global {
  namespace Express {
    interface Request {
      /** Authenticated user object (for both user and worker) */
      user?: any;
      /** Indicates whether the request belongs to a 'user' or 'worker' */
      userType?: string;
      /** Worker object when userType is 'worker' */
      worker?: any;
      /** Multer single file upload */
      file?: any;
      /** Multer multiple file upload (profilepic, identity, etc.) */
      files?: any;
    }
  }
}

export {};
