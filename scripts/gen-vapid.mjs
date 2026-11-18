// Prints a fresh VAPID keypair in .dev.vars format (local testing only; use a separate keypair per environment).
import { wpGenerateVapidKeys } from "../worker/web-push.js";
const k = await wpGenerateVapidKeys();
console.log(`VAPID_PUBLIC_KEY=${k.publicKey}\nVAPID_PRIVATE_KEY=${k.privateKey}\nVAPID_SUBJECT=mailto:you@example.com`);
