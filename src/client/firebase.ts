import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
// import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
    apiKey: "AIzaSyAVLjd8oXoSnVl93tw7cdDMMNLymamxi1I",
    authDomain: "simon-cabansag-portfolio-490a3.firebaseapp.com",
    projectId: "simon-cabansag-portfolio-490a3",
    storageBucket: "simon-cabansag-portfolio-490a3.firebasestorage.app",
    messagingSenderId: "357894332373",
    appId: "1:357894332373:web:a33790ca7bfe72cd64a75c",
    measurementId: "G-XGYXF3GHP6",
}

// const analytics = getAnalytics(app);
const app = initializeApp(firebaseConfig)
export const firebase = getAuth(app)
