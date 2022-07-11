
import * as admin from "firebase-admin";

const serviceAccount = require("../../issue-pick-firebase-adminsdk-sixfr-056210d01f.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

export const firebaseAdmin = admin

export const firebaseFirestore = admin.firestore()
