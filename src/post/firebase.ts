import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyCJTOsQZ2rgynHPz3uKv2_VlRsZiYlOId0",
    authDomain: "pal-optical-tool.firebaseapp.com",
    projectId: "pal-optical-tool",
    storageBucket: "pal-optical-tool.firebasestorage.app",
    messagingSenderId: "294632477326",
    appId: "1:294632477326:web:6aca10159254e27a8e2fdf",
    databaseURL: "https://pal-optical-tool-default-rtdb.firebaseio.com/",
};

// Initialize with a name to avoid conflict with the main [DEFAULT] app
const appName = "post-tool-app";
const app = getApps().find(a => a.name === appName) 
    || initializeApp(firebaseConfig, appName);

export const database = getDatabase(app);
