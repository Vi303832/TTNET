const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let isFirebaseInitialized = false;
let db = null;
let auth = null;

// In-memory fallback stores for when Firebase Admin credentials are not yet configured
const inMemoryStore = {
  sessions: new Map(),
  messages: new Map(),
  usageLogs: [],
  users: new Map()
};

function initializeFirebase() {
  if (isFirebaseInitialized) {
    return { db, auth, isInitialized: true, isMock: false };
  }

  try {
    let credential = null;

    // 1. Check if direct JSON string is provided in env
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      credential = admin.credential.cert(serviceAccount);
    } 
    // 2. Check if file path is provided in env or default serviceAccountKey.json exists
    else {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
      const resolvedPath = path.isAbsolute(serviceAccountPath) 
        ? serviceAccountPath 
        : path.resolve(process.cwd(), serviceAccountPath);

      if (fs.existsSync(resolvedPath)) {
        const serviceAccount = require(resolvedPath);
        credential = admin.credential.cert(serviceAccount);
      }
    }

    if (credential) {
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential,
          projectId: process.env.FIREBASE_PROJECT_ID
        });
      }
      db = admin.firestore();
      auth = admin.auth();
      isFirebaseInitialized = true;
      console.log('✅ Firebase Admin SDK başarıyla başlatıldı (Gerçek Bağlantı).');
      return { db, auth, isInitialized: true, isMock: false };
    } else {
      console.warn('⚠️  Firebase Admin kimlik dosyası (serviceAccountKey.json) bulunamadı. Geliştirme modu (In-Memory Mock) devrede.');
      return { db: null, auth: null, isInitialized: false, isMock: true, inMemoryStore };
    }
  } catch (error) {
    console.error('❌ Firebase Admin başlatma hatası:', error.message);
    console.warn('⚠️  Geliştirme modu (In-Memory Mock) ile devam ediliyor.');
    return { db: null, auth: null, isInitialized: false, isMock: true, inMemoryStore };
  }
}

const firebaseInstance = initializeFirebase();

module.exports = {
  admin,
  getDb: () => firebaseInstance.db,
  getAuth: () => firebaseInstance.auth,
  isInitialized: () => firebaseInstance.isInitialized,
  isMock: () => firebaseInstance.isMock,
  inMemoryStore,
  initializeFirebase
};
