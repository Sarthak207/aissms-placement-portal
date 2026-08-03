const { Notification } = require('../models');
const { sendMail } = require('./email.service');

/**
 * Creates a Notification document, emits it in real-time via Socket.io (if available),
 * and optionally sends an accompanying email.
 */
async function notify(io, { userId, type, title, message, link = '', email = null }) {
  const notification = await Notification.create({ userId, type, title, message, link });

  if (io) {
    io.of('/notifications').to(userId.toString()).emit('notification', notification);
  }

  if (email) {
    await sendMail({
      to: email,
      subject: title,
      html: `<p>${message}</p>${link ? `<p><a href="${link}">View details</a></p>` : ''}`,
    });
  }

  return notification;
}

/** Notifies multiple users at once (e.g. all eligible students for a new drive). */
async function notifyMany(io, userIds, payload) {
  return Promise.all(userIds.map((userId) => notify(io, { ...payload, userId })));
}

module.exports = { notify, notifyMany };
