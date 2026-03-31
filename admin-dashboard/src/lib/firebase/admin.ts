import 'server-only';

import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

type AdminEnv = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

let cachedAdminApp: App | null = null;

function getAdminEnv(): AdminEnv {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId) {
    throw new Error('Missing FIREBASE_PROJECT_ID environment variable.');
  }

  if (!clientEmail) {
    throw new Error('Missing FIREBASE_CLIENT_EMAIL environment variable.');
  }

  if (!privateKey) {
    throw new Error('Missing FIREBASE_PRIVATE_KEY environment variable.');
  }

  return {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  };
}

function getAdminApp(): App {
  if (cachedAdminApp) {
    return cachedAdminApp;
  }

  const existingApp = getApps()[0];
  if (existingApp) {
    cachedAdminApp = existingApp;
    return existingApp;
  }

  const adminEnv = getAdminEnv();
  cachedAdminApp = initializeApp({
    credential: cert({
      projectId: adminEnv.projectId,
      clientEmail: adminEnv.clientEmail,
      privateKey: adminEnv.privateKey,
    }),
  });

  return cachedAdminApp;
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}
