const View = require('./views.model');
const Contact = require('./contacts.model');
const User = require('../user/user.model');
const Car = require('../car/car.model');

const { generateDateRangeObject } = require('../utils/Date');

module.exports.getInTouchView = async(props) => {
    try {
        const { sellerId } = props;

        const dateNow = new Date(Date.now());
        const day = String(dateNow.getDate()).padStart(2, "0");
        const month = String(dateNow.getMonth() + 1).padStart(2, "0");
        const year = dateNow.getFullYear();

        const fullDate = `${day}/${month}/${year}`;
        
        const views = await View.findOne({
            sellerId
        });

        if(!views) {
            const recordViews = new View({
                sellerId,
                views : [
                    {
                        counts : 1,
                        time : fullDate
                    }
                ]
            });
            await recordViews.save();
        } else {
            const indexView = views.views.findIndex(view => view.time === fullDate);
            if(indexView !== -1) {
                views.views[indexView].counts += 1;
            } else {
                views.views.push({
                    counts : 1,
                    time : fullDate
                });
            }

            await views.save();
        }
        
        return true;
    } catch(error) {
        return false;
    }
}

module.exports.getInTouchContact = async(props) => {
    try {
        const { sellerId } = props;
        const dateNow = new Date(Date.now());
        const day = String(dateNow.getDate()).padStart(2, "0");
        const month = String(dateNow.getMonth() + 1).padStart(2, "0");
        const year = dateNow.getFullYear();

        const fullDate = `${day}/${month}/${year}`;
        const contacts = await Contact.findOne({
            sellerId
        });

        if(!contacts) {
            const recordContact = new Contact({
                sellerId,
                contacts : [
                    {
                        counts : 1,
                        time : fullDate
                    }
                ]
            });
            await recordContact.save();
        } else {
            const indexContact = contacts.contacts.findIndex(contact => contact.time === fullDate);
            if(indexContact !== -1) {
                contacts.contacts[indexContact].counts += 1;
            } else {
                contacts.contacts.push({
                    counts : 1,
                    time : fullDate
                });
            }

            await contacts.save();
        }
        
        return true;
    } catch(error) {
        return false;
    }
}

// [GET] /api/v1/statistic/views 
module.exports.getStatisticViews = async(req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if(!user) {
            return res.status(404).json({ message : "Không tìm thấy người dùng!" });
        }
        
        if(user.role !== "seller") {
            return res.status(403).json({ message : "Bạn không phải là người bán! " });
        }

        const views = await View.findOne({
            sellerId : userId
        });

        const startDate = new Date(user.createdAt);
        const endDate = new Date(Date.now());
        
        const dataView = generateDateRangeObject(startDate, endDate);
        let dateArray = [];
        for (const [key, value] of Object.entries(dataView)) {
            dateArray.push(key);
        }
        if(!views) {
            return res.json({
                date : dateArray,
                views : dateArray.map(() => 0)
            })
        }

        views.views.forEach((view) => {
            dataView[view.time] += view.counts;
        });
        
        let viewArray = [];
        for (const [key, value] of Object.entries(dataView)) {
            viewArray.push(value);
        }

        return res.json({
            date : dateArray,
            views : viewArray
        });
    } catch(error) {
        return res.status(500).json({ message : "Server Error!" });
    }
}

// [GET] /api/v1/statistic/contacts 
module.exports.getStatisticContacts = async(req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if(!user) {
            return res.status(404).json({ message : "Không tìm thấy người dùng!" });
        }

        if(user.role !== "seller") {
            return res.status(403).json({ message : "Bạn không phải là người bán! " });
        }
        
        const contacts = await Contact.findOne({
            sellerId : userId
        });

        const startDate = new Date(user.createdAt);
        const endDate = new Date(Date.now());
        
        const dataContact = generateDateRangeObject(startDate, endDate);

        let dateArray = [];
        for (const [key, value] of Object.entries(dataContact)) {
            dateArray.push(key);
        }

        if(!contacts) {
            return res.json({
                date : dateArray,
                contacts : dateArray.map(() => 0)
            })
        }

        contacts.contacts.forEach((contact) => {
            dataContact[contact.time] += contact.counts;
        });
        
        let contactArray = [];
        for (const [key, value] of Object.entries(dataContact)) {
            contactArray.push(value);
        }

        return res.json({
            date : dateArray,
            contacts : contactArray
        });
    } catch(error) {
        return res.status(500).json({ message : "Server Error!" });
    }
}

// [GET] /api/v1/statistic/revenue 
module.exports.getStatisticRevenue = async(req,res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if(!user) {
            return res.status(404).json({ message : "Không tìm thấy người bán!" });
        }
        if(user.role !== "seller") {
            return res.status(403).json({ message : "Bạn không phải là người bán!" });
        }

        const carSolds = await Car.find({
            deleted : false,
            sellerId : userId,
            status : "sold"
        });

        const startDate = new Date(user.createdAt);
        const endDate = new Date(Date.now());
        
        const dataRevenue = generateDateRangeObject(startDate, endDate);
        let dateArray = [];
        
        for (const [key, value] of Object.entries(dataRevenue)) {
            dateArray.push(key);
        }

        if(!carSolds) {
            return res.json({
                date : dateArray,
                revenues : dateArray.map(() => 0)
            })
        }
        
        carSolds.forEach((car) => {
            let price = car.price;
            
            const time_sold = new Date(car.time_sold);
            const day = String(time_sold.getDate()).padStart(2, "0");
            const month = String(time_sold.getMonth() + 1).padStart(2, "0");
            const year = time_sold.getFullYear();

            const dateFormated = `${day}/${month}/${year}`;
            dataRevenue[dateFormated] += price;
        })


        const revenues = [];
        for( const [key, value] of Object.entries(dataRevenue)) {
            revenues.push(value);
        }
        return res.json({
            date : dateArray,
            revenues
        });
    } catch(error) {
        return res.status(500).json({ message : "Server Error!" });
    }
}