const mongoose = require('mongoose');
const slugUpdater = require('mongoose-slug-updater')

mongoose.plugin(slugUpdater);

const categorySchema = new mongoose.Schema(
    {
        title: String,
        parent_id: {
            type: String,
            default: ""
        },
        description: String,
        thumbnail: String,
        status: String,
        position: Number,
        slug: {
            type: String,
            slug: "title",
            unique: true
        },
        deleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Category = mongoose.model('Category', categorySchema, 'cars-category');

module.exports = Category;