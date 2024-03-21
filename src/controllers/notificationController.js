const prisma = require("../configs/databaseConfig");

const {
  sendNotification,
} = require("../services/firebase-notifications.service");

exports.sendCustomNotification = async (title, body, token, res) => {
  try {
    const pushNotification = {
      notification: {
        title: title,
        body: body,
      },
      data: {},
      token: token,
    };
    await sendNotification(pushNotification);
  } catch (error) {
    console.error("error --> ", error);
    res.status(500).json({ message: "error sending notification" });
  }
};
