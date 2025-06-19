/**
 * Pagination utility functions
 */

class PaginationHelper {
  /**
   * Get pagination parameters from request
   * @param {Object} req - Express request object
   * @param {number} defaultLimit - Default items per page
   * @returns {Object} Pagination parameters
   */
  static getPaginationParams(req, defaultLimit = 10) {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(
      1,
      Math.min(100, parseInt(req.query.limit) || defaultLimit)
    );
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  /**
   * Create pagination info for response
   * @param {number} totalItems - Total number of items
   * @param {number} page - Current page number
   * @param {number} limit - Items per page
   * @returns {Object} Pagination info
   */
  static createPaginationInfo(totalItems, page, limit) {
    const totalPages = Math.ceil(totalItems / limit);

    return {
      currentPage: page,
      totalPages,
      limit,
      totalItems,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    };
  }

  /**
   * Paginate Mongoose query
   * @param {Object} Model - Mongoose model
   * @param {Object} filter - Query filter
   * @param {Object} options - Options object
   * @returns {Object} Paginated results
   */
  static async paginateQuery(Model, filter = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      select = "",
      sort = { createdAt: -1 },
      populate = null,
    } = options;

    const skip = (page - 1) * limit;

    // Get total count
    const total = await Model.countDocuments(filter);

    // Build query
    let query = Model.find(filter)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Add population if specified
    if (populate) {
      query = query.populate(populate);
    }

    const items = await query;
    const pagination = this.createPaginationInfo(total, page, limit);

    return {
      items,
      pagination,
    };
  }

  /**
   * Create standardized paginated response
   * @param {Array} items - Array of items
   * @param {Object} pagination - Pagination info
   * @param {string} message - Success message
   * @returns {Object} Response object
   */
  static createResponse(items, pagination, message = "Success") {
    return {
      success: true,
      message,
      data: items,
      pagination,
    };
  }
}

module.exports = PaginationHelper;
