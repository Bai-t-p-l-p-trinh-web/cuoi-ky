const Car = require('./car.model');
const User = require('../user/user.model');
const Category = require('../category/category.model');
const { getInTouchView } = require('../statistics/statistic.controller');

// [GET] /api/v1/car 
module.exports.index = async (req, res) => {
    try {
        const find = {
            deleted : false,
            status : "selling"
        };

        // Filter By Price 
        const pricemin = parseInt(req.query.pricemin);
        const pricemax = parseInt(req.query.pricemax);

        if (!isNaN(pricemin) && !isNaN(pricemax)){
            find.price = { $gte : pricemin, $lte : pricemax};
        } else if (!isNaN(pricemin)) {
            find.price = { $gte : pricemin };
        } else if (!isNaN(pricemax)) {
            find.price = { $lte : pricemax }
        }

        // Filter By Year 
        const yearmin = parseInt(req.query.yearmin);
        const yearmax = parseInt(req.query.yearmax);

        if (!isNaN(yearmin) && !isNaN(yearmax)){
            find.year = { $gte : yearmin, $lte : yearmax};
        } else if (!isNaN(yearmin)) {
            find.year = { $gte : yearmin };
        } else if (!isNaN(yearmax)) {
            find.year = { $lte : yearmax }
        }

        // Filter By Km 
        const kmmin = parseInt(req.query.kmmin);
        const kmmax = parseInt(req.query.kmmax);

        if (!isNaN(kmmin) && !isNaN(kmmax)){
            find.km = { $gte : kmmin, $lte : kmmax};
        } else if (!isNaN(kmmin)) {
            find.km = { $gte : kmmin };
        } else if (!isNaN(kmmax)) {
            find.km = { $lte : kmmax }
        }

        if(req.query.fuel_type){
            const fuel_types = req.query.fuel_type.split('+').map(type => type.trim()).filter(Boolean);
            if (fuel_types.length > 0) {
                find["fuel_use.fuel_type"] = { $in : fuel_types};
            }
        }   
        
        if(req.query.seat_capacity){
            const seat_capacities = req.query.seat_capacity.split('+');
            if (seat_capacities.length > 0) {
                find.seat_capacity = { $in : seat_capacities};
            }
        }

        if (req.query.keyword && req.query.keyword.trim() !== "") {
            const keyword = req.query.keyword.trim();
            find.title = { $regex: keyword, $options: "i" }; 
        }


        const recordsCar = await Car.find(find).select('-__v -deleted -_id');
        console.log(find);
        console.log(recordsCar);

        let prices = recordsCar.map(car => car.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        recordsCar.forEach(car => {
            if(!car.location) {
                car.location = {
                    query_location : "",
                    query_name : "Toàn Quốc"
                }
            }
            else if (!car.location.query_location || car.location.query_location.trim() === "") {
                car.location.query_name = "Toàn Quốc";
            }
        });

        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const start = (page - 1) * limit;
        const end = page * limit;

        const paginatedCars = recordsCar.slice(start, end);

        const DataSend = {
            num : recordsCar.length,
            minPrice,
            maxPrice,
            cars : paginatedCars || []
        }


        return res.send(DataSend);
    } catch (error) {
        console.error("Error In Finding Car ! ! ! : ", error);
        return res.status(500).json({message : "Server Error!!!"});
    }
}

// [GET] /api/v1/car/:slugCar 
module.exports.getCarBySlug = async (req, res) => {
    try {

        const slugCar = req.params.slugCar;
        if(!slugCar) {
            return res.status(404).json({ message : "Không có slug Car" });
        }

        let find = {
            deleted: false,
            status : "selling",
            slug: slugCar
        };

        if(req.userId) {
            let find2 = {
                deleted : false,
                slug : slugCar,
                sellerId : req.userId
            };
            find = {$or : [find, find2]};
            
        }
        

        const resultFindingCar = await Car.findOne(find).select('-__v -deleted -_id');

        if(!resultFindingCar){
            return res.status(404).json({message : "Car not found!!!"});
        }
        
        const newResultFindingCar = JSON.parse(JSON.stringify(resultFindingCar));

        // Define result 
        newResultFindingCar.fuel = newResultFindingCar.fuel_use.fuel_name;

        // find user 
        const seller = await User.findById(resultFindingCar.sellerId);

        if(!seller) {
            return res.status(404).json ( { message : "Không tìm thấy thông tin người bán!" } );
        }

        newResultFindingCar.user = {
            id : seller._id,
            name: seller.name,
            phone: seller.phone,
            email: seller.email
        };

        await getInTouchView({sellerId : seller._id});

        return res.send(newResultFindingCar);
    } catch (error) {
        console.error("Error In Finding Car By Slug ! ! ! : ", error);
        return res.status(500).json({message : "Server Error!!!"});
    }
}



// [POST] /api/v1/car 
module.exports.createCar = async (req, res) => {
    try {
        req.body.price = parseInt(req.body.price);
        req.body.year = parseInt(req.body.year);
        req.body.seat_capacity = parseInt(req.body.seat_capacity);

        const recordCar = new Car(req.body);
        await recordCar.save();

        return res.send({message : "Create Successfully"});
        
    } catch(error) {
        console.error("Error In create Car ! ! ! : ", error);
        return res.status(500).json({message : "Server Error!!!"});
    }
}

// [GET] /api/v1/car/display 
module.exports.getCarsDisplay = async(req, res) => {
    try {
        const find = {
            deleted : false
        };
    
        const userId = req.userId;
    
        const user = await User.findById(userId);
    
        if(!user) return res.status(404).json({ message : "Không tìm thấy người dùng" });
        if(user.role !== "seller") return res.status(401).json({ message : "Phải đăng ký làm người bán" });
    
        find.sellerId = userId;
    
        const cars = await Car.find(find);
    
        if(!cars) return res.send([]);
        const respondCars = cars.map((car) => {
            return {
                title: car.title,
                price: car.price,
                img_src: (car.img_src?.[0] || "https://static.vecteezy.com/system/resources/previews/008/255/803/non_2x/page-not-found-error-404-system-updates-uploading-computing-operation-installation-programs-system-maintenance-a-hand-drawn-layout-template-of-a-broken-robot-illustration-vector.jpg"),
                status: car.status,
                slug: car.slug
            }
        });
    
        return res.send(respondCars);
    } catch(error) {
        return res.status(500).json( { message : "Server Error!" });
    }

}

// [PATCH] /api/v1/car/:slugCar
module.exports.UpdateCar = async(req, res) => {
    try {
        const slug = req.params.slugCar;
        if(!slug) {
            return res.status(400).json({ message : "Không có slug" });
        }

        const userId = req.userId;
        const user = await User.findById(userId);

        if(!user) {
            return res.status(404).json({ message : "Không tìm thấy người dùng!" });
        }

        const car = await Car.findOne({
            sellerId : userId,
            slug,
            deleted : false
        });


        if(!car) {
            return res.status(404).json({ message : "Không tìm thấy xe!" });
        }

        let { price , comment, status } = req.body;
        if(!price && !comment && !status) {
            return res.status(400).json({ message : "Không có thay đổi gì!" });
        }
        price = parseInt(price);
        
        if(isNaN(price) || !Number.isInteger(price)) {
            return res.status(400).json({ message : "Giá bán phải là một số!"});
        }
        const changeData = {};
        if(price) {
            changeData.price = price;
        }
        if(comment) {
            changeData.comment = comment;
        }
        if(status) {
            if(car.status === "sold") {
                return res.status(403).json({ message : "Xe đã bán không thể sửa được !" });
            }
            changeData.status = status;
        }

        if(status && status === "sold") {
            const timestamps = new Date(Date.now());
            changeData.time_sold  = timestamps;
        }

        const updatedCar = await Car.findOneAndUpdate(
            { _id: car._id },
            { $set: changeData },
            { new: true }
        );


        return res.status(200).json({
            message: "Đã chỉnh sửa thông tin thành công!",
            data: updatedCar
        });
    } catch(error) {
        return res.status(500).json({ message : "Server Error!" });
    }
}
