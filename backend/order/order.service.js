const { Log } = require("../log/log.model");
const { Order } = require("../order/order.model");

const populateOrder = async (order) => {
  if (!order) {
    console.log("populateOrder: order is null/undefined");
    return null;
  }

  console.log("populateOrder: Bắt đầu populate order với ID:", order._id);

  try {
    const result = await Order.findById(order._id)
      .populate("buyer", "fullName email phoneNumber avatar address")
      .populate("seller", "fullName email phoneNumber avatar address")
      .populate("car");

    console.log("populateOrder: Thành công", !!result);
    return result;
  } catch (error) {
    console.error("populateOrder: Lỗi khi populate:", error);
    throw error;
  }
};

const createLog = async ({
  type,
  order,
  user,
  action,
  description,
  previousData,
  newData,
  req,
}) => {
  try {
    const log = new Log({
      type: type,
      order: order,
      user: user,
      action: action,
      description: description,
      previousData: previousData,
      newData: newData,
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
    });

    console.log("tạo log thành công");
    await log.save();
    return log;
  } catch (error) {
    console.error("Create log error:", error);
  }
};

module.exports = { populateOrder, createLog };
