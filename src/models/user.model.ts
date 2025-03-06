import * as admin from 'firebase-admin';

export interface User {
  id?: string;
  email: string;
  createdAt?: admin.firestore.Timestamp;
}

export interface CreateUserDto {
  email: string;
} 