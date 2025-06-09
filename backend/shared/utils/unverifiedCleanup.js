const cron = require("node-cron");
const User = require("../../user/user.model");
const Otp = require("../../otp/otp.model");

const cleanupUnverifiedUsers = () => {
  // run every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    const expiredTime = new Date(Date.now() - 10 * 60 * 1000);

    // Find unverified users that need to be deleted
    const usersToDelete = await User.find({
      isVerified: false,
      createdAt: { $lt: expiredTime },
    }).select("_id");

    if (usersToDelete.length > 0) {
      // Extract user IDs
      const userIds = usersToDelete.map((user) => user._id.toString());

      // Delete associated OTP records first
      const deletedOtps = await Otp.deleteMany({
        userId: { $in: userIds },
      });

      // Then delete the unverified users
      const deletedUsers = await User.deleteMany({
        isVerified: false,
        createdAt: { $lt: expiredTime },
      });

      console.log(
        `Cleaned up ${deletedUsers.deletedCount} unverified users and ${deletedOtps.deletedCount} associated OTP records`
      );
    }
  });
};

module.exports = cleanupUnverifiedUsers;
