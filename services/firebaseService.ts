import { initializeApp, FirebaseApp } from "firebase/app";
import { getDatabase, ref, set, onValue, Database } from "firebase/database";
import { StatusData, FirebaseConfig } from "../types";

const CONFIG_KEY = 'mudir_firebase_config';

// Hardcoded Configuration from user (Default/Fallback)
const defaultFirebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyAyxjSPrk5RwTyrNte9Br12HnerpVevFh0",
  authDomain: "mudirstatus.firebaseapp.com",
  databaseURL: "https://mudirstatus-default-rtdb.firebaseio.com",
  projectId: "mudirstatus",
  storageBucket: "mudirstatus.firebasestorage.app",
  messagingSenderId: "501660007110",
  appId: "1:501660007110:web:2b4e119c8dad476454b5c7"
};

let app: FirebaseApp | undefined;
let db: Database | undefined;

/**
 * Saves the Firebase configuration to local storage.
 */
export const saveConfig = (config: FirebaseConfig) => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    // Reset app instance to allow re-initialization with new config
    app = undefined;
    db = undefined;
  } catch (e) {
    console.error("Failed to save config", e);
  }
};

/**
 * Initializes Firebase with the config (stored or default).
 */
export const initFirebase = (): boolean => {
  try {
    if (app && db) return true;

    let configToUse = defaultFirebaseConfig;

    // Try to load from local storage
    const storedConfig = localStorage.getItem(CONFIG_KEY);
    if (storedConfig) {
      try {
        const parsed = JSON.parse(storedConfig);
        if (parsed && parsed.apiKey && parsed.projectId) {
          configToUse = parsed;
        }
      } catch (e) {
        console.warn("Invalid stored firebase config, using default.");
      }
    }

    app = initializeApp(configToUse);
    db = getDatabase(app);
    return true;
  } catch (e) {
    console.error("Firebase Init Failed", e);
    return false;
  }
};

/**
 * Subscribes to the status changes in Realtime Database.
 */
export const subscribeToStatus = (callback: (data: StatusData) => void) => {
  if (!db) {
    initFirebase();
  }
  
  if (!db) return;

  const statusRef = ref(db, 'officeStatus');
  
  onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    }
  });
};

/**
 * Updates the status in Realtime Database.
 */
export const updateRemoteStatus = (data: StatusData) => {
  if (!db) {
    initFirebase();
  }

  if (!db) return;

  set(ref(db, 'officeStatus'), data).catch((err) => {
    console.error("Failed to update status", err);
  });
};
