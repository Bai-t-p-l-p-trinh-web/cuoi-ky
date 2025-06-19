const Category = require("./category.model");
const createTreeUtils = require("../utils/createTree");

// [GET] /api/v1/category
module.exports.index = async (req, res) => {
  try {
    let find = {
      deleted: false,
    };

    const records = await Category.find(find);
    const newRecords = createTreeUtils.tree(records);
    return res.send(newRecords);
  } catch (error) {
    console.error("Error in get all Category: ", error);
    return res.status(500).json({ message: "Server Error!" });
  }
};

// [POST] /api/v1/category
module.exports.createCategory = async (req, res) => {
  try {
    if (!req.body.position) {
      const count = await Category.countDocuments();
      req.body.position = count + 1;
    } else {
      req.body.position = parseInt(req.body.position);
    }

    const recordCategory = new Category(req.body);
    await recordCategory.save();

    return res.send({ message: "Create Successfully!" });
  } catch (error) {
    console.error("Error in createCategory: ", error);
    return res.status(500).json({ message: "Server Error!" });
  }
};
