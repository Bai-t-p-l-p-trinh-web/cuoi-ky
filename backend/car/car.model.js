const mongoose = require('mongoose');
const slugUpdater = require('mongoose-slug-updater');
const LocationEnum = require('../constants/locationEnum');
const allowedLocations = Object.values(LocationEnum).map(l => l.query_location);

mongoose.plugin(slugUpdater);

const carSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true 
        },
        category_id: {
            type: String,
            default: ""
        },
        location: {
            query_location: {
                type: String,
                enum: allowedLocations,
                required: true
            },
            query_name: {
                type: String,
                required: true
            }
        },
        price: {
            type: Number,
            required: true 
        },
        year: {
            type: Number,
            required: true 
        },
        km: {
            type: Number,
            required: true 
        },
        fuel_use : {
            fuel_type: {
                type: String,
                enum: ["gasoline", "oil", "electric"],
                required: true
            },
            fuel_name: {
                type: String,
                required: true
            }
        },
        seat_capacity: {
            type: Number,
            required: true 
        },
        comment: String,
        img_src: Array,
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

const Car = mongoose.model('Car', carSchema, 'cars');

module.exports = Car;