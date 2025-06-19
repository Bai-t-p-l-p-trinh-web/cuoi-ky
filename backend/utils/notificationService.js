// Redirect to new notification service
const notificationService = require("../notification/notification.service");

// Export methods for backward compatibility
module.exports = {
  // Order notifications
  sendOrderNotification: (order, eventType) => {
    return notificationService.createOrderNotification(order, eventType);
  },

  // Refund notifications
  sendRefundNotification: (refund, eventType) => {
    return notificationService.createRefundNotification(refund, eventType);
  },

  // Email
  sendEmail: (options) => {
    return notificationService.sendEmailNotification(options);
  },

  // SMS (mock)
  sendSMS: (options) => {
    console.log(`[SMS MOCK] To: ${options.to}, Message: ${options.message}`);
    return Promise.resolve({ success: true, mock: true });
  },

  // In-app notification
  createInAppNotification: (options) => {
    return notificationService.createNotificationForUser(options);
  },

  // System notifications
  createSystemNotification: (options) => {
    return notificationService.createSystemNotification(options);
  },
};
