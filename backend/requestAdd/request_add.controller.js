const User = require('../user/user.model');
const Car = require('../car/car.model');

const RequestAdd = require('./request_add.model');
var md5 = require('md5');
const { createPdf } = require('./request_add.service');
const fuel = require('../constants/fuelEnum');

// [POST] /api/v1/requestAdd
const createRequest = async(req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({ message : "không tìm thấy người dùng !" });
        }
        if(user.role !== "seller") {
            return res.status(403).json({ message : "Bạn không có quyền tạo yêu cầu! "});
        }

        let { name, year, km, fuel, seat_capacity, location, img_demo } = req.body;
        
        year = parseInt(year);
        km = parseInt(km);
        seat_capacity = parseInt(seat_capacity);

        const infoForm = {
            name,
            year,
            km,
            fuel,
            seat_capacity,
            location,
            img_demo,
            sellerId : userId
        };


        const record = new RequestAdd(infoForm);
        await record.save();

        return res.send("Tạo thành công yêu cầu !");

    } catch (error) {
        return res.status(500).json({ message : "server error!" });
    }
};

// [GET] /api/v1/requestAdd
const getAllRequestOfUser = async(req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId);

        if(!user) {
            return res.status(404).json({ message : "Không tìm thấy người dùng" });
        }

        if(user.role !== "seller") {
            return res.status(401).json({ message : "Người dùng không có quyền truy cập!"});
        }

        const requests = await RequestAdd.find({
            sellerId : userId
        });

        const responseData = requests.map((request) => (
            {
                id : md5(request._id),
                name : request.name,
                status : request.status,
                img_demo : request.img_demo,
                createdAt : request.createdAt,
                slug : request.slug
            }
        ));

        return res.send(responseData);
    } catch(error) {
        return res.status(500).json({ message : "Server Error!"});
    }
}


// [GET] /api/v1/requestAdd/:slugRequest 
const getRequestBySlug = async(req, res) => {
    try {
        const userId = req.userId;
        const slugRequest = req.params.slugRequest;

        if(!slugRequest) {
            return res.status(400).json({ message : "Không có slug request!" });
        }
        
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ message : "Không tìm thấy người dùng!" });
        }
        if(user.role === "user") {
            return res.status(403).json({ message : "Người dùng không có quyền truy cập!"});
        }

        const conditionFind = {};

        if(user.role === "seller") {
            conditionFind.sellerId = userId;
        }
        
        conditionFind.slug = slugRequest;

        const request = await RequestAdd.findOne(conditionFind).select("-_id -__v -updatedAt -sellerId");

        if(!request){
            return res.status(404).json({ message : "Không tìm thấy yêu cầu! "});
        }

        const responseDataSend = JSON.parse(JSON.stringify(request));

        if(request.userIds && request.userIds.length > 0) {
            const users = await Promise.all(
                request.userIds.map(async (staffId) => {
                    const staff = await User.findById(staffId);
                    if(!staff) return null;
                    const responseData = {
                        name : staff.name,
                        email : staff.email,
                        phone : staff.phone,
                        avatar : staff.avatar
                    };

                    return responseData;
                })
            )

            responseDataSend.staffs = users.filter(Boolean);
        }

        

        return res.send(responseDataSend);

    } catch(error) {
        return res.status(500).json({ message : "Server Error!" });
    }
}

// [PATCH] api/v1/requestAdd/:slugRequest/employee 
const AddTheInspectors = async(req, res) => {
    try {
        const { userIds } = req.body;
        const slug = req.params.slugRequest;

        const request = await RequestAdd.findOne({
            status : "pending",
            slug
        });

        if(!request) {
            return res.status(404).json({ message : "Không tìm thấy yêu cầu ! "});
        }
        
        const userIdsValid = userIds.filter(userId => !request.userIds.includes(userId));
        request.userIds = [...request.userIds, ...userIdsValid];
        await request.save();

        return res.send('Đã phái nhân viên đến thành công! '); 
    } catch(error) {
        return res.status(500).json({ message : "Server Error" });
    }
}

// [PATCH] /api/v1/requestAdd/:slugRequest/checked
const checkedTheRequest = async(req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if(!user) return res.status(404).json({ message : "Không tìm thấy người dùng!" });

        const slug = req.params.slugRequest;
        if(!slug) {
            return res.status(400).json({ message : "Chưa có thông tin form request! "});
        }

        const request = await RequestAdd.findOne({
            slug,
            userIds : userId
        });

        if(!request) {
            return res.status(404).json({ message : "Không tìm thấy request yêu cầu!" });
        }
        
        const sellerId = request.sellerId;
        const seller = await User.findById(sellerId);

        if(!seller) {
            return res.status(404).json({ message : "Không tìm thấy người bán !" });
        }

        if(request.status !== "pending") {
            return res.status(403).json({ message : "Đã duyệt rồi không thể duyệt nữa!" });
        }

        request.status = "checked";
        request.img_src = req.body.img_src || [];
        request.examine = req.body.examine;
        request.price_recommend_low = req.body.price_recommend_low;
        request.price_recommend_high = req.body.price_recommend_high;


        const dataSend = JSON.parse(JSON.stringify(request));
        dataSend.seller = seller;
        // console.log(dataSend);
        const secure_url = await createPdf({ request : dataSend});
        

        request.secure_url = secure_url;

        await request.save();
        return res.send("Đã chuyển trạng thái sang kiểm tra xong thành công! ");
    } catch(error) {
        return res.status(500).json({ message : "Server Error!"});
    }
}

// [PATCH] /api/v1/requestAdd/:slugRequest/reject
const rejectRequest = async(req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if(!user) return res.status(404).json({ message : "Không tìm thấy người dùng!" });

        const slug = req.params.slugRequest;
        if(!slug) {
            return res.status(400).json({ message : "Chưa có thông tin form request! "});
        }

        const request = await RequestAdd.findOne({
            slug,
            userIds : userId
        });

        if(!request) {
            return res.status(404).json({ message : "Không tìm thấy request yêu cầu!" });
        }

        const sellerId = request.sellerId;
        const seller = await User.findById(sellerId);

        if(!seller) {
            return res.status(404).json({ message : "Không tìm thấy người bán !" });
        }

        if(request.status !== "pending") {
            return res.status(403).json({ message : "Đã duyệt rồi không thể duyệt nữa!" });
        }

        request.status = "reject";
        request.message = req.body.message || "";
        request.examine = req.body.examine;

        const dataSend = JSON.parse(JSON.stringify(request));
        dataSend.seller = seller;
        const secure_url = await createPdf({ request : dataSend});
        

        request.secure_url = secure_url;

        await request.save();
        return res.send("Đã chuyển trạng thái sang từ chối xong thành công! ");
    } catch(error) {
        return res.status(500).json({ message : "Server Error!" });
    }
}

// [PATCH] /api/v1/requestAdd/:slugRequest/done
const PostTheCar = async(req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if(!user) {
            return res.status(404).json({ message : "Không tìm thấy người dùng" });
        }
        if(user.role !== "seller") {
            return res.status(403).json({ message : "Người dùng không có quyền đăng bán" });
        }

        const slug = req.params.slugRequest;
        const find = {
            sellerId : userId,
            status : "checked",
            slug
        };


        const request = await RequestAdd.findOne(find);
        if(!request) {
            return res.status(404).json({ message : "Không tìm thấy yêu cầu !" });
        }

        const { comment, price, category_id, location } = req.body;
        const CarData = {
            title : request.name,
            price,
            year : request.year,
            km : request.km,
            fuel_use : {
                fuel_type : request.fuel,
                fuel_name : fuel[request.fuel]
            },
            seat_capacity : request.seat_capacity,
            comment,
            img_src : request.img_src,
            sellerId : userId,
            status : "selling"
        };

        const recordCarSelling = new Car(CarData);
        await recordCarSelling.save();

        request.comment = comment;
        request.price = price;
        request.status = "done";

        await request.save();
        return res.send("Đã đăng bán thành công!");
    } catch(error) {
        return res.status(500).json({ message : "Server Error!" });
    }
}

// [DELETE] /api/v1/requestAdd/:slugRequest 
const deleteRequest = async(req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({ message: "Không tìm thấy người dùng!" });
        }
        const slug = req.params.slugRequest;
        if(!slug) {
            return res.status(400).json({ message : "Chưa có slug!" });
        }
        const DataFind = {
            slug,
            sellerId : userId 
        }
        if(user.role === "admin"){
            delete DataFind.sellerId;
        };

        const request = await RequestAdd.findOne(DataFind);

        if(!request){
            return res.status(400).json({ message : "Không tìm thấy đơn! " });
        }

        await request.deleteOne();

        return res.status(200).json({ message : "Xóa đơn thành công! " });
    } catch(error) {
        return res.status(500).json({ message : "Server Error!" });
    }
}

// const createPdfFileTest = async(req, res) => {
//     const request = {
//         name: "Mercedes-Benz GLC 300 2019",
//         year: 2019,
//         km: 72000,
//         fuel: "gasoline",
//         seat_capacity: 5,
//         location: "97 Man Thiện, Phường Hiệp Phú, TP. Thủ Đức, TP. HCM",
//         createdAt: "2025-06-10T15:02:38.824Z",
//         seller : {
//             name : "Lê Viết Xuân",
//             phone : "0356446244",
//             email : "xuantryingbetter@gmail.com"
//         },
//         examine : {
//             isCorrectName : true,
//             isCorrectYear : true,
//             isCorrectKm   : true,
//             isCorrectSeat_Capacity : true,
//             isFuel_Gasoline : true,
//             isFuel_Oil  : false,
//             isFuel_Electric : false
//         }
//     }
//     await createPdf({request});
//     return res.send('ok');
// }

module.exports = {
    createRequest,
    getAllRequestOfUser,
    getRequestBySlug,
    checkedTheRequest,
    rejectRequest,
    PostTheCar,
    AddTheInspectors,
    deleteRequest
    // createPdfFileTest
}