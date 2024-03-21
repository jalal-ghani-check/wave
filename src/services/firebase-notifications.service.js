const admin = require("firebase-admin");
const serviceAccount = require("../../wave-notify-firebase-adminsdk.json");

const sendNotification = async (pushNotification) => {
  try {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    await admin.messaging().send(pushNotification);
  } catch (err) {
    console.error("Notification could not be sent");
    console.error(err);
  }
};
module.exports = {
  sendNotification,
};
