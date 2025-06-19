const User = require("../user/user.model");
const Car = require("../car/car.model");
const RequestAdd = require("../requestAdd/request_add.model");
const { Order } = require("../order/order.model");
const { Payment } = require("../payment/payment.model");
const { Refund } = require("../refund/refund.model");
const { Notification } = require("../notification/notification.model");
const Category = require("../category/category.model");

// [GET] /api/v1/admin/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ role: "seller" });
    const totalBuyers = await User.countDocuments({ role: "user" });

    const totalCars = await Car.countDocuments();
    const activeCars = await Car.countDocuments({ status: "selling" });
    const soldCars = await Car.countDocuments({ status: "sold" });

    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: "completed" });
    const pendingOrders = await Order.countDocuments({
      status: { $in: ["pending", "paid_partial", "confirmed"] },
    });

    const totalRequests = await RequestAdd.countDocuments();
    const pendingRequests = await RequestAdd.countDocuments({
      status: "pending",
    });
    const approvedRequests = await RequestAdd.countDocuments({
      status: "checked",
    });
    const rejectedRequests = await RequestAdd.countDocuments({
      status: "reject",
    }); // Calculate total revenue from completed orders
    let totalRevenue = 0;
    try {
      const revenueAggregation = await Order.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
      ]);
      totalRevenue = revenueAggregation[0]?.totalRevenue || 0;
    } catch (error) {
      console.error("Error calculating total revenue:", error);
      totalRevenue = 0;
    }

    // Calculate monthly revenue for chart (last 12 months)
    const currentDate = new Date();
    const monthlyRevenue = [];

    for (let i = 11; i >= 0; i--) {
      const startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i + 1,
        0
      );

      let monthRevenueValue = 0;
      try {
        const monthRevenue = await Order.aggregate([
          {
            $match: {
              status: "completed",
              createdAt: { $gte: startDate, $lte: endDate },
            },
          },
          { $group: { _id: null, revenue: { $sum: "$totalAmount" } } },
        ]);
        monthRevenueValue = monthRevenue[0]?.revenue || 0;
      } catch (error) {
        console.error(`Error calculating revenue for month ${i}:`, error);
        monthRevenueValue = 0;
      }

      monthlyRevenue.push({
        month: startDate.getMonth() + 1,
        year: startDate.getFullYear(),
        revenue: monthRevenueValue,
      });
    }

    // Get recent activities
    const recentActivities = [];

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("car", "title")
      .populate("buyer", "name");

    recentOrders.forEach((order) => {
      recentActivities.push({
        id: `order_${order._id}`,
        type: "order",
        message: `Đơn hàng mới từ ${order.buyer?.name || "N/A"} - ${
          order.car?.title || "N/A"
        }`,
        time: order.createdAt,
        status: order.status,
      });
    });

    // Recent requests
    const recentRequests = await RequestAdd.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("sellerId", "name");

    recentRequests.forEach((request) => {
      recentActivities.push({
        id: `request_${request._id}`,
        type: "request",
        message: `Yêu cầu duyệt xe ${request.name} từ ${
          request.sellerId?.name || "N/A"
        }`,
        time: request.createdAt,
        status: request.status,
      });
    });

    // Recent users
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    recentUsers.forEach((user) => {
      recentActivities.push({
        id: `user_${user._id}`,
        type: "user",
        message: `User mới đăng ký: ${user.name}`,
        time: user.createdAt,
        status: "active",
      });
    });

    // Sort activities by time and take latest 10
    recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const latestActivities = recentActivities.slice(0, 10).map((activity) => ({
      ...activity,
      time: formatTimeAgo(activity.time),
    })); // Order status distribution
    let orderStatusStats = [];
    try {
      orderStatusStats = await Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);
    } catch (error) {
      console.error("Error in order status aggregation:", error);
      orderStatusStats = [];
    } // Car category stats (if you have category field)
    let carCategoryStats = [];
    try {
      carCategoryStats = await Car.aggregate([
        {
          $match: {
            category_id: { $exists: true, $ne: null, $ne: "" },
          },
        },
        {
          $addFields: {
            categoryObjectId: {
              $cond: {
                if: { $eq: [{ $type: "$category_id" }, "objectId"] },
                then: "$category_id",
                else: {
                  $cond: {
                    if: { $eq: [{ $strLenCP: "$category_id" }, 24] },
                    then: { $toObjectId: "$category_id" },
                    else: null,
                  },
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "categoryObjectId",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: { $ifNull: ["$category.title", "Khác"] },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);
    } catch (error) {
      console.error("Error in car category aggregation:", error);
      carCategoryStats = [];
    }

    // Payment stats
    const pendingPayments = await Payment.countDocuments({ status: "pending" });
    const completedPayments = await Payment.countDocuments({
      status: "completed",
    });

    // Refund stats
    const pendingRefunds = await Refund.countDocuments({ status: "pending" });
    const approvedRefunds = await Refund.countDocuments({ status: "approved" });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalSellers,
          totalBuyers,
          totalCars,
          activeCars,
          soldCars,
          totalOrders,
          completedOrders,
          pendingOrders,
          totalRequests,
          pendingRequests,
          approvedRequests,
          rejectedRequests,
          totalRevenue,
          pendingPayments,
          completedPayments,
          pendingRefunds,
          approvedRefunds,
        },
        charts: {
          monthlyRevenue,
          orderStatusStats: orderStatusStats.map((stat) => ({
            status: stat._id,
            count: stat.count,
          })),
          carCategoryStats: carCategoryStats.map((stat) => ({
            category: stat._id || "Khác",
            count: stat.count,
          })),
        },
        recentActivities: latestActivities,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu thống kê",
      error: error.message,
    });
  }
};

// [GET] /api/v1/admin/dashboard/analytics
const getAnalytics = async (req, res) => {
  try {
    const { period = "30d" } = req.query; // 7d, 30d, 90d, 1y

    let dateRange;
    const currentDate = new Date();

    switch (period) {
      case "7d":
        dateRange = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        dateRange = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        dateRange = new Date(currentDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        dateRange = new Date(currentDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateRange = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // User growth trend (cumulative)
    let userGrowthTrend = [];
    try {
      const userGrowthData = await User.aggregate([
        {
          $match: { createdAt: { $gte: dateRange } },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            newUsers: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]);

      // Calculate cumulative growth
      let cumulative = 0;
      userGrowthTrend = userGrowthData.map((item) => {
        cumulative += item.newUsers;
        return {
          date: `${item._id.day}/${item._id.month}/${item._id.year}`,
          newUsers: item.newUsers,
          totalUsers: cumulative,
        };
      });
    } catch (error) {
      console.error("Error in user growth trend:", error);
      userGrowthTrend = [];
    }

    // User composition (seller vs buyer)
    let userComposition = [];
    try {
      userComposition = await User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ]);
    } catch (error) {
      console.error("Error in user composition:", error);
      userComposition = [];
    }

    // Car posting trends over time
    let carPostingTrends = [];
    try {
      carPostingTrends = await Car.aggregate([
        {
          $match: { createdAt: { $gte: dateRange } },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            carsPosted: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]);

      carPostingTrends = carPostingTrends.map((item) => ({
        date: `${item._id.day}/${item._id.month}/${item._id.year}`,
        carsPosted: item.carsPosted,
      }));
    } catch (error) {
      console.error("Error in car posting trends:", error);
      carPostingTrends = [];
    }

    // Cars by fuel type
    let carsByFuelType = [];
    try {
      carsByFuelType = await Car.aggregate([
        {
          $group: {
            _id: "$fuel_use.fuel_type",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      carsByFuelType = carsByFuelType.map((item) => ({
        fuelType: item._id || "Khác",
        count: item.count,
        fuelName: getFuelTypeName(item._id),
      }));
    } catch (error) {
      console.error("Error in cars by fuel type:", error);
      carsByFuelType = [];
    }

    // Cars by year range
    let carsByYearRange = [];
    try {
      carsByYearRange = await Car.aggregate([
        {
          $addFields: {
            yearRange: {
              $switch: {
                branches: [
                  { case: { $lt: ["$year", 2010] }, then: "Trước 2010" },
                  {
                    case: {
                      $and: [
                        { $gte: ["$year", 2010] },
                        { $lt: ["$year", 2015] },
                      ],
                    },
                    then: "2010-2014",
                  },
                  {
                    case: {
                      $and: [
                        { $gte: ["$year", 2015] },
                        { $lt: ["$year", 2020] },
                      ],
                    },
                    then: "2015-2019",
                  },
                  { case: { $gte: ["$year", 2020] }, then: "2020+" },
                ],
                default: "Không xác định",
              },
            },
          },
        },
        {
          $group: {
            _id: "$yearRange",
            count: { $sum: 1 },
            avgPrice: { $avg: "$price" },
          },
        },
        { $sort: { count: -1 } },
      ]);
    } catch (error) {
      console.error("Error in cars by year range:", error);
      carsByYearRange = [];
    } // System activity logs
    let systemActivityLogs = [];
    try {
      // Count activities in the period
      const userRegistrations = await User.countDocuments({
        createdAt: { $gte: dateRange },
      });

      const carPostings = await Car.countDocuments({
        createdAt: { $gte: dateRange },
      });

      const orderCreations = await Order.countDocuments({
        createdAt: { $gte: dateRange },
      });

      const requestSubmissions = await RequestAdd.countDocuments({
        createdAt: { $gte: dateRange },
      });

      systemActivityLogs = [
        {
          activity: "Đăng ký người dùng",
          count: userRegistrations,
          icon: "user",
        },
        { activity: "Đăng tin bán xe", count: carPostings, icon: "car" },
        { activity: "Tạo đơn hàng", count: orderCreations, icon: "order" },
        {
          activity: "Yêu cầu đăng tin",
          count: requestSubmissions,
          icon: "request",
        },
      ];
    } catch (error) {
      console.error("Error in system activity logs:", error);
      systemActivityLogs = [];
    }

    // Cars by status (selling vs sold)
    let carsByStatus = [];
    try {
      carsByStatus = await Car.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      carsByStatus = carsByStatus.map((item) => ({
        status: item._id || "Không xác định",
        count: item.count,
        statusName: getCarStatusName(item._id),
      }));
    } catch (error) {
      console.error("Error in cars by status:", error);
      carsByStatus = [];
    }

    // Order trends
    let orderTrends = [];
    try {
      orderTrends = await Order.aggregate([
        {
          $match: { createdAt: { $gte: dateRange } },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            orders: { $sum: 1 },
            revenue: { $sum: "$totalAmount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]);

      orderTrends = orderTrends.map((item) => ({
        date: `${item._id.day}/${item._id.month}/${item._id.year}`,
        orders: item.orders,
        revenue: item.revenue,
      }));
    } catch (error) {
      console.error("Error in order trends:", error);
      orderTrends = [];
    }

    // Top performing cars
    let topCars = [];
    try {
      topCars = await Order.aggregate([
        {
          $match: { createdAt: { $gte: dateRange } },
        },
        {
          $group: {
            _id: "$car",
            orderCount: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
        {
          $lookup: {
            from: "cars",
            localField: "_id",
            foreignField: "_id",
            as: "carInfo",
          },
        },
        { $unwind: "$carInfo" },
        { $sort: { orderCount: -1 } },
        { $limit: 10 },
      ]);

      topCars = topCars.map((car) => ({
        carId: car._id,
        title: car.carInfo.title,
        orderCount: car.orderCount,
        totalRevenue: car.totalRevenue,
      }));
    } catch (error) {
      console.error("Error in top cars:", error);
      topCars = [];
    }

    // Monthly revenue comparison (current vs previous period)
    let revenueComparison = {};
    try {
      const currentPeriodRevenue = await Order.aggregate([
        {
          $match: {
            status: "completed",
            createdAt: { $gte: dateRange },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            orderCount: { $sum: 1 },
          },
        },
      ]);

      // Previous period for comparison
      const previousPeriodStart = new Date(
        dateRange.getTime() - (currentDate.getTime() - dateRange.getTime())
      );
      const previousPeriodRevenue = await Order.aggregate([
        {
          $match: {
            status: "completed",
            createdAt: { $gte: previousPeriodStart, $lt: dateRange },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            orderCount: { $sum: 1 },
          },
        },
      ]);

      const currentRevenue = currentPeriodRevenue[0]?.totalRevenue || 0;
      const previousRevenue = previousPeriodRevenue[0]?.totalRevenue || 0;
      const growthRate =
        previousRevenue > 0
          ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
          : 0;

      revenueComparison = {
        currentPeriod: currentRevenue,
        previousPeriod: previousRevenue,
        growthRate: growthRate.toFixed(2),
        currentOrders: currentPeriodRevenue[0]?.orderCount || 0,
        previousOrders: previousPeriodRevenue[0]?.orderCount || 0,
      };
    } catch (error) {
      console.error("Error in revenue comparison:", error);
      revenueComparison = {
        currentPeriod: 0,
        previousPeriod: 0,
        growthRate: 0,
        currentOrders: 0,
        previousOrders: 0,
      };
    }
    res.json({
      success: true,
      data: {
        period,
        userGrowthTrend,
        userComposition: userComposition.map((item) => ({
          role: item._id,
          count: item.count,
          roleName: getRoleName(item._id),
        })),
        carPostingTrends,
        carsByFuelType,
        carsByYearRange,
        carsByStatus,
        systemActivityLogs,
        orderTrends,
        topCars,
        revenueComparison,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu phân tích",
      error: error.message,
    });
  }
};

// [GET] /api/v1/admin/users
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role = "",
      status = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (role && role !== "all") {
      filter.role = role;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get users with pagination
    const users = await User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-password");

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        let additionalData = {
          totalOrders: 0,
          totalSpent: 0,
          totalCarsPosted: 0,
          totalSales: 0,
        };

        try {
          if (user.role === "user" || user.role === "buyer") {
            // Get buyer stats
            const orders = await Order.find({
              buyer: user._id,
              status: "completed",
            });
            additionalData.totalOrders = orders.length;
            additionalData.totalSpent = orders.reduce(
              (sum, order) => sum + (order.totalAmount || 0),
              0
            );
          }

          if (user.role === "seller") {
            // Get seller stats
            const carsPosted = await Car.countDocuments({ sellerId: user._id });
            const salesOrders = await Order.find({
              seller: user._id,
              status: "completed",
            });
            additionalData.totalCarsPosted = carsPosted;
            additionalData.totalSales = salesOrders.reduce(
              (sum, order) => sum + (order.totalAmount || 0),
              0
            );
          }
        } catch (error) {
          console.error(`Error getting stats for user ${user._id}:`, error);
        }

        return {
          ...user.toObject(),
          ...additionalData,
          joinDate: user.createdAt,
          lastActivity: user.updatedAt,
        };
      })
    );

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách người dùng",
      error: error.message,
    });
  }
};

// [GET] /api/v1/admin/users/:id
const getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Get detailed stats
    let userStats = {
      totalOrders: 0,
      totalSpent: 0,
      totalCarsPosted: 0,
      totalSales: 0,
      recentOrders: [],
      recentCars: [],
    };

    if (user.role === "user" || user.role === "buyer") {
      const orders = await Order.find({ buyer: user._id })
        .populate("car", "title price images")
        .sort({ createdAt: -1 })
        .limit(5);

      userStats.recentOrders = orders;
      userStats.totalOrders = await Order.countDocuments({ buyer: user._id });

      const completedOrders = await Order.find({
        buyer: user._id,
        status: "completed",
      });
      userStats.totalSpent = completedOrders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      );
    }

    if (user.role === "seller") {
      const cars = await Car.find({ sellerId: user._id })
        .sort({ createdAt: -1 })
        .limit(5);

      userStats.recentCars = cars;
      userStats.totalCarsPosted = await Car.countDocuments({
        sellerId: user._id,
      });

      const salesOrders = await Order.find({
        seller: user._id,
        status: "completed",
      });
      userStats.totalSales = salesOrders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      );
    }

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        ...userStats,
        joinDate: user.createdAt,
        lastActivity: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get user detail error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin người dùng",
      error: error.message,
    });
  }
};

// [PUT] /api/v1/admin/users/:id
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields
    delete updateData.password;
    delete updateData._id;

    const user = await User.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật người dùng thành công",
      data: user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật người dùng",
      error: error.message,
    });
  }
};

// [DELETE] /api/v1/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Check if user has active orders or cars
    const hasActiveOrders = await Order.countDocuments({
      $or: [{ buyer: id }, { seller: id }],
      status: { $in: ["pending", "confirmed", "paid_partial"] },
    });

    if (hasActiveOrders > 0) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa người dùng có đơn hàng đang hoạt động",
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Xóa người dùng thành công",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa người dùng",
      error: error.message,
    });
  }
};

// [PUT] /api/v1/admin/users/:id/status
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive", "banned"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.json({
      success: true,
      message: `Cập nhật trạng thái người dùng thành ${status}`,
      data: user,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái người dùng",
      error: error.message,
    });
  }
};

// Helper function to get fuel type name in Vietnamese
function getFuelTypeName(fuelType) {
  const fuelNames = {
    gasoline: "Xăng",
    oil: "Dầu",
    electric: "Điện",
  };
  return fuelNames[fuelType] || "Khác";
}

// Helper function to get role name in Vietnamese
function getRoleName(role) {
  const roleNames = {
    user: "Người mua",
    seller: "Người bán",
    admin: "Quản trị viên",
  };
  return roleNames[role] || role;
}

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diffTime = Math.abs(now - new Date(date));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.ceil(diffTime / (1000 * 60));

  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  } else if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  } else {
    return `${diffDays} ngày trước`;
  }
}

// Helper function to get car status name in Vietnamese
function getCarStatusName(status) {
  const statusNames = {
    selling: "Đang bán",
    sold: "Đã bán",
    pending: "Chờ duyệt",
    rejected: "Bị từ chối",
  };
  return statusNames[status] || status;
}

// === CAR MANAGEMENT APIs ===

// [GET] /api/v1/admin/cars
const getCars = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
      ];
    }

    if (status !== "all") {
      filter.status = status;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get cars with pagination
    const [cars, totalCars] = await Promise.all([
      Car.find(filter)
        .populate("user_id", "name email phone")
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Car.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCars / limitNum);

    res.json({
      success: true,
      data: {
        cars: cars.map((car) => ({
          _id: car._id,
          title: car.title,
          price: car.price,
          year: car.year,
          km: car.km,
          status: car.status,
          fuel: car.fuel,
          seat_capacity: car.seat_capacity,
          location: car.location,
          img_demo: car.img_demo,
          createdAt: car.createdAt,
          updatedAt: car.updatedAt,
          seller: car.user_id
            ? {
                _id: car.user_id._id,
                name: car.user_id.name,
                email: car.user_id.email,
                phone: car.user_id.phone,
              }
            : null,
          views: car.views || 0,
          favorites: car.favorites || 0,
        })),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalCars,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get cars error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách xe",
      error: error.message,
    });
  }
};

// [GET] /api/v1/admin/cars/:id
const getCarDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const car = await Car.findById(id)
      .populate("user_id", "name email phone createdAt")
      .populate("category_id", "title");

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy xe",
      });
    }

    res.json({
      success: true,
      data: {
        ...car.toObject(),
        seller: car.user_id
          ? {
              _id: car.user_id._id,
              name: car.user_id.name,
              email: car.user_id.email,
              phone: car.user_id.phone,
              joinedAt: car.user_id.createdAt,
            }
          : null,
        category: car.category_id
          ? {
              _id: car.category_id._id,
              title: car.category_id.title,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Get car detail error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết xe",
      error: error.message,
    });
  }
};

// [PUT] /api/v1/admin/cars/:id/status
const updateCarStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ["selling", "sold", "pending", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const updateData = { status };
    if (status === "rejected" && reason) {
      updateData.rejectionReason = reason;
    }

    const car = await Car.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("user_id", "name email");

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy xe",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái xe thành công",
      data: car,
    });
  } catch (error) {
    console.error("Update car status error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái xe",
      error: error.message,
    });
  }
};

// [DELETE] /api/v1/admin/cars/:id
const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    const car = await Car.findByIdAndDelete(id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy xe",
      });
    }

    res.json({
      success: true,
      message: "Xóa xe thành công",
    });
  } catch (error) {
    console.error("Delete car error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa xe",
      error: error.message,
    });
  }
};

// === REQUEST MANAGEMENT APIs ===

// [GET] /api/v1/admin/requests
const getRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
      ];
    }

    if (status !== "all") {
      filter.status = status;
    } // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get requests with pagination
    const [requests, totalRequests] = await Promise.all([
      RequestAdd.find(filter).sort(sort).skip(skip).limit(limitNum),
      RequestAdd.countDocuments(filter),
    ]);

    // Manually populate seller data
    const requestsWithSeller = await Promise.all(
      requests.map(async (request) => {
        let seller = null;
        if (request.sellerId) {
          try {
            seller = await User.findById(request.sellerId).select(
              "name email phone bankInfo"
            );
          } catch (error) {
            console.error(`Error finding seller ${request.sellerId}:`, error);
          }
        }

        // Get inspectors if userIds exist
        let inspectors = [];
        if (request.userIds && request.userIds.length > 0) {
          try {
            inspectors = await User.find({
              _id: { $in: request.userIds },
            }).select("name email");
          } catch (error) {
            console.error(`Error finding inspectors:`, error);
          }
        }

        return {
          _id: request._id,
          slug: request.slug,
          name: request.name,
          brand: request.brand,
          model: request.model,
          year: request.year,
          km: request.km,
          fuel: request.fuel,
          seat_capacity: request.seat_capacity,
          location: request.location,
          status: request.status,
          img_demo: request.img_demo,
          price_recommend_low: request.price_recommend_low,
          price_recommend_high: request.price_recommend_high,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
          message: request.message,
          seller: seller
            ? {
                _id: seller._id,
                name: seller.name,
                email: seller.email,
                phone: seller.phone,
                bankInfo: {
                  hasBankInfo: !!seller.bankInfo?.accountNumber,
                  isVerified: seller.bankInfo?.isVerified || false,
                  bankName: seller.bankInfo?.bankName || null,
                  verifiedAt: seller.bankInfo?.verifiedAt || null,
                },
              }
            : null,
          inspectors: inspectors || [],
        };
      })
    );

    const totalPages = Math.ceil(totalRequests / limitNum);

    res.json({
      success: true,
      data: {
        requests: requestsWithSeller,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalRequests,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách yêu cầu",
      error: error.message,
    });
  }
};

// [GET] /api/v1/admin/requests/:id
const getRequestDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await RequestAdd.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu",
      });
    } // Manually populate seller data
    let seller = null;
    if (request.sellerId) {
      try {
        seller = await User.findById(request.sellerId).select(
          "name email phone createdAt bankInfo"
        );
      } catch (error) {
        console.error(`Error finding seller ${request.sellerId}:`, error);
      }
    }

    // Get inspectors if userIds exist
    let inspectors = [];
    if (request.userIds && request.userIds.length > 0) {
      try {
        inspectors = await User.find({
          _id: { $in: request.userIds },
        }).select("name email");
      } catch (error) {
        console.error(`Error finding inspectors:`, error);
      }
    }
    res.json({
      success: true,
      data: {
        ...request.toObject(),
        seller: seller
          ? {
              _id: seller._id,
              name: seller.name,
              email: seller.email,
              phone: seller.phone,
              joinedAt: seller.createdAt,
              bankInfo: {
                hasBankInfo: !!seller.bankInfo?.accountNumber,
                isVerified: seller.bankInfo?.isVerified || false,
                bankName: seller.bankInfo?.bankName || null,
                accountNumber: seller.bankInfo?.accountNumber
                  ? `****${seller.bankInfo.accountNumber.slice(-4)}`
                  : null,
                accountHolder: seller.bankInfo?.accountHolder || null,
                verifiedAt: seller.bankInfo?.verifiedAt || null,
              },
            }
          : null,
        inspectors: inspectors || [],
      },
    });
  } catch (error) {
    console.error("Get request detail error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết yêu cầu",
      error: error.message,
    });
  }
};

// [PUT] /api/v1/admin/requests/:id/approve
const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const request = await RequestAdd.findByIdAndUpdate(
      id,
      {
        status: "checked",
        approvedAt: new Date(),
        approvalNotes: notes,
      },
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu",
      });
    }

    // Get seller info
    let seller = null;
    if (request.sellerId) {
      try {
        seller = await User.findById(request.sellerId).select("name email");
      } catch (error) {
        console.error(`Error finding seller ${request.sellerId}:`, error);
      }
    }

    // Create car record from approved request
    try {
      const carData = {
        title: `${request.brand} ${request.model} ${request.year}`,
        brand: request.brand,
        model: request.model,
        year: request.year,
        km: request.km,
        fuel: request.fuel,
        seat_capacity: request.seat_capacity,
        location: request.location,
        price: request.price_recommend_high, // Use recommended high price as starting price
        img_demo: request.img_demo,
        description: request.description,
        sellerId: request.sellerId, // Sửa từ user_id thành sellerId
        status: "selling",
        createdAt: new Date(),
      };

      const newCar = new Car(carData);
      await newCar.save();

      // Update request with car reference
      request.carId = newCar._id;
      await request.save();
    } catch (carError) {
      console.error("Error creating car from request:", carError);
      // Don't fail the approval if car creation fails
    }
    res.json({
      success: true,
      message: "Duyệt yêu cầu thành công",
      data: {
        ...request.toObject(),
        seller: seller,
      },
    });
  } catch (error) {
    console.error("Approve request error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi duyệt yêu cầu",
      error: error.message,
    });
  }
};

// [PUT] /api/v1/admin/requests/:id/reject
const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập lý do từ chối",
      });
    }
    const request = await RequestAdd.findByIdAndUpdate(
      id,
      {
        status: "reject",
        rejectedAt: new Date(),
        message: reason,
      },
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu",
      });
    }

    // Get seller info
    let seller = null;
    if (request.sellerId) {
      try {
        seller = await User.findById(request.sellerId).select("name email");
      } catch (error) {
        console.error(`Error finding seller ${request.sellerId}:`, error);
      }
    }

    res.json({
      success: true,
      message: "Từ chối yêu cầu thành công",
      data: {
        ...request.toObject(),
        seller: seller,
      },
    });
  } catch (error) {
    console.error("Reject request error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi từ chối yêu cầu",
      error: error.message,
    });
  }
};

// [PUT] /api/v1/admin/requests/:id/assign
const assignInspectors = async (req, res) => {
  try {
    const { id } = req.params;
    const { inspectorIds } = req.body;

    if (
      !inspectorIds ||
      !Array.isArray(inspectorIds) ||
      inspectorIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn ít nhất một inspector",
      });
    }

    // Verify inspectors exist
    const inspectors = await User.find({
      _id: { $in: inspectorIds },
      role: "inspector",
    });

    if (inspectors.length !== inspectorIds.length) {
      return res.status(400).json({
        success: false,
        message: "Một số inspector không tồn tại hoặc không hợp lệ",
      });
    }

    const request = await RequestAdd.findByIdAndUpdate(
      id,
      {
        userIds: inspectorIds,
        assignedAt: new Date(),
      },
      { new: true, runValidators: true }
    )
      .populate("sellerId", "name email")
      .populate("userIds", "name email");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu",
      });
    }

    res.json({
      success: true,
      message: "Phân công inspector thành công",
      data: request,
    });
  } catch (error) {
    console.error("Assign inspectors error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi phân công inspector",
      error: error.message,
    });
  }
};

// === INSPECTOR APIs ===

// [GET] /api/v1/admin/inspectors
const getInspectors = async (req, res) => {
  try {
    const inspectors = await User.find({ role: "inspector" })
      .select("name email phone createdAt")
      .sort({ name: 1 });

    res.json({
      success: true,
      data: inspectors,
    });
  } catch (error) {
    console.error("Get inspectors error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách inspector",
      error: error.message,
    });
  }
};

// === ORDER MANAGEMENT APIs ===

// [GET] /api/v1/admin/orders
const getOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = {};

    if (search) {
      // Search in order ID or populate car/buyer later
      filter.$or = [{ _id: new RegExp(search, "i") }];
    }

    if (status !== "all") {
      filter.status = status;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get orders with pagination
    const [orders, totalOrders] = await Promise.all([
      Order.find(filter).sort(sort).skip(skip).limit(limitNum),
      Order.countDocuments(filter),
    ]);

    // Get car and buyer details manually
    const Car = require("../car/car.model");
    const User = require("../user/user.model");

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const [car, buyer] = await Promise.all([
          Car.findById(order.car),
          User.findById(order.buyer),
        ]);

        return {
          _id: order._id,
          status: order.status,
          totalAmount: order.totalAmount,
          depositAmount: order.depositAmount,
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          car: car
            ? {
                _id: car._id,
                title: car.title,
                price: car.price,
                img_demo: car.img_demo,
              }
            : null,
          buyer: buyer
            ? {
                _id: buyer._id,
                name: buyer.name,
                email: buyer.email,
                phone: buyer.phone,
              }
            : null,
        };
      })
    );

    const totalPages = Math.ceil(totalOrders / limitNum);

    res.json({
      success: true,
      data: {
        orders: enrichedOrders,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalOrders,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng",
      error: error.message,
    });
  }
};

// [GET] /api/v1/admin/orders/:id
const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Get car and buyer details manually
    const Car = require("../car/car.model");
    const User = require("../user/user.model");

    const [car, buyer] = await Promise.all([
      Car.findById(order.car),
      User.findById(order.buyer),
    ]);

    const enrichedOrder = {
      ...order.toObject(),
      car: car
        ? {
            _id: car._id,
            title: car.title,
            price: car.price,
            img_demo: car.img_demo,
            year: car.year,
            km: car.km,
            fuel: car.fuel,
          }
        : null,
      buyer: buyer
        ? {
            _id: buyer._id,
            name: buyer.name,
            email: buyer.email,
            phone: buyer.phone,
          }
        : null,
    };

    res.json({
      success: true,
      data: enrichedOrder,
    });
  } catch (error) {
    console.error("Get order detail error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết đơn hàng",
      error: error.message,
    });
  }
};

// [PUT] /api/v1/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "paid_partial",
      "paid_full",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const updateData = { status };
    if (notes) {
      updateData.adminNotes = notes;
    }

    const order = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái đơn hàng",
      error: error.message,
    });
  }
};

// === PAYMENT MANAGEMENT APIs ===

// [GET] /api/v1/admin/payments
const getPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { transactionId: new RegExp(search, "i") },
        { buyerName: new RegExp(search, "i") },
        { buyerEmail: new RegExp(search, "i") },
        { carTitle: new RegExp(search, "i") },
      ];
    }

    if (status !== "all") {
      filter.status = status;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1; // Get payments with pagination
    const Payment = require("../payment/payment.model").Payment;
    const [payments, totalPayments] = await Promise.all([
      Payment.find(filter).sort(sort).skip(skip).limit(limitNum),
      Payment.countDocuments(filter),
    ]);

    console.log("payment: ", payments); // Simply return payments with minimal transformation
    const enrichedPayments = payments.map((payment) => {
      const paymentObj = payment.toObject();

      // Add missing fields that frontend expects
      paymentObj.paymentMethod = paymentObj.paymentMethod || "bank_transfer";
      paymentObj.paymentCode = paymentObj.transactionId;
      paymentObj.type = paymentObj.paymentType;

      // Create user object from buyer info
      if (paymentObj.buyerId) {
        paymentObj.user = {
          _id: paymentObj.buyerId,
          name: paymentObj.buyerName,
          email: paymentObj.buyerEmail,
          phone: paymentObj.buyerPhone,
        };
      }

      // Create order object from car info
      if (paymentObj.carId) {
        paymentObj.order = {
          _id: paymentObj.carId,
          title: paymentObj.carTitle,
          status: "active",
          totalAmount: paymentObj.amount * 1000000, // Assuming amount is in millions
        };
      }

      // Create seller info
      if (paymentObj.sellerId) {
        paymentObj.seller = {
          _id: paymentObj.sellerId,
          name: paymentObj.sellerName,
          email: paymentObj.sellerEmail || "",
          phone: paymentObj.sellerPhone || "",
        };
      }

      return paymentObj;
    });
    console.log("enriched payment: ", enrichedPayments);

    const totalPages = Math.ceil(totalPayments / limitNum);

    res.json({
      success: true,
      data: {
        payments: enrichedPayments,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalPayments,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách thanh toán",
      error: error.message,
    });
  }
};

// [GET] /api/v1/admin/payments/:id
const getPaymentDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const Payment = require("../payment/payment.model").Payment;
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thanh toán",
      });
    } // Return payment with minimal transformation
    const enrichedPayment = payment.toObject();

    // Add missing fields that frontend expects
    enrichedPayment.paymentMethod =
      enrichedPayment.paymentMethod || "bank_transfer";
    enrichedPayment.paymentCode = enrichedPayment.transactionId;
    enrichedPayment.type = enrichedPayment.paymentType;

    // Create user object from buyer info
    if (enrichedPayment.buyerId) {
      enrichedPayment.user = {
        _id: enrichedPayment.buyerId,
        name: enrichedPayment.buyerName,
        email: enrichedPayment.buyerEmail,
        phone: enrichedPayment.buyerPhone,
      };
    }

    // Create order object from car info
    if (enrichedPayment.carId) {
      enrichedPayment.order = {
        _id: enrichedPayment.carId,
        title: enrichedPayment.carTitle,
        status: "active",
        totalAmount: enrichedPayment.amount * 1000000, // Assuming amount is in millions
      };
    }

    // Create seller info
    if (enrichedPayment.sellerId) {
      enrichedPayment.seller = {
        _id: enrichedPayment.sellerId,
        name: enrichedPayment.sellerName,
        email: enrichedPayment.sellerEmail || "",
        phone: enrichedPayment.sellerPhone || "",
      };
    }

    res.json({
      success: true,
      data: enrichedPayment,
    });
  } catch (error) {
    console.error("Get payment detail error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết thanh toán",
      error: error.message,
    });
  }
};

// [PUT] /api/v1/admin/payments/:id/status
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const validStatuses = [
      "pending",
      "completed",
      "failed",
      "refunded",
      "deposited",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const updateData = { status };
    if (notes) {
      updateData.adminNotes = notes;
    }

    const Payment = require("../payment/payment.model").Payment;
    const payment = await Payment.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thanh toán",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái thanh toán thành công",
      data: payment,
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái thanh toán",
      error: error.message,
    });
  }
};

// [PATCH] /api/v1/admin/users/:userId/verify-bank
const verifyUserBankInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isVerified } = req.body;
    const adminId = req.userId;

    // Kiểm tra quyền admin/inspector
    const admin = await User.findById(adminId);
    if (!admin || !["admin", "inspector"].includes(admin.role)) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền thực hiện thao tác này",
      });
    }

    // Tìm user cần verify
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    if (!user.bankInfo || !user.bankInfo.accountNumber) {
      return res.status(400).json({
        success: false,
        message: "User chưa có thông tin ngân hàng",
      });
    }

    // Cập nhật trạng thái verification
    user.bankInfo.isVerified = isVerified;
    user.bankInfo.verifiedAt = isVerified ? new Date() : null;
    user.bankInfo.verifiedBy = adminId;

    await user.save();

    res.json({
      success: true,
      message: isVerified
        ? "Đã xác thực thông tin ngân hàng thành công"
        : "Đã từ chối xác thực thông tin ngân hàng",
      data: {
        userId: user._id,
        bankInfo: {
          isVerified: user.bankInfo.isVerified,
          verifiedAt: user.bankInfo.verifiedAt,
          verifiedBy: admin.name,
        },
      },
    });
  } catch (error) {
    console.error("Verify bank info error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xác thực thông tin ngân hàng",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getAnalytics,
  getUsers,
  getUserDetail,
  updateUser,
  deleteUser,
  updateUserStatus,
  verifyUserBankInfo,
  // Car management APIs
  getCars,
  getCarDetail,
  updateCarStatus,
  deleteCar,
  // Request management APIs
  getRequests,
  getRequestDetail,
  approveRequest,
  rejectRequest,
  assignInspectors,
  // Inspector APIs
  getInspectors,
  // Order management APIs
  getOrders,
  getOrderDetail,
  updateOrderStatus,
  // Payment management APIs
  getPayments,
  getPaymentDetail,
  updatePaymentStatus,
  verifyUserBankInfo,
};
