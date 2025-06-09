const Car = require('./car.model');
const User = require('../user/user.model');
const Category = require('../category/category.model');

// [GET] /api/v1/car 
module.exports.index = async (req, res) => {
    try {
        const find = {
            deleted : false 
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
            const fuel_types = req.query.fuel_type.split('+') || [];
            if (fuel_types.length > 0) {
                find['fuel_use.fuel_types'] = { $in : fuel_types};
            }
        }   
        
        if(req.query.seat_capacity){
            const seat_capacities = req.query.seat_capacity.split('+');
            if (seat_capacities.length > 0) {
                find.seat_capacity = { $in : seat_capacities};
            }
        }

        

        const recordsCar = await Car.find(find).select('-__v -deleted -_id');
        return res.send(recordsCar);
    } catch (error) {
        console.error("Error In Finding Car ! ! ! : ", error);
        return res.status(500).json({message : "Server Error!!!"});
    }
}

module.exports.getCarBySlug = async (req, res) => {
    try {
        const slugCar = req.params.slugCar;
        const find = {
            deleted: false,
            slug: slugCar
        };

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
            deleted : false,
            isVerified : true
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