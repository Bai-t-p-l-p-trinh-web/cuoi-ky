const fuel = {
    gasoline: 'Xăng',
    oil: 'Dầu',
    electric: 'Điện'
};

const isValidObjectId = id => /^[0-9a-fA-F]{24}$/.test(id);

const validateRequest = (req, res, next) => {
    if(!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ message : "Dữ liệu gửi lên không hợp lệ!" });
    }

    const { name, year, km, fuel, seat_capacity, location, img_demo } = req.body;
    if(!name || !name.trim()) {
        return res.status(400).json({ message : "Tên không được để trống!" });
    }

    if(!year || year < 1900 || year > (new Date().getFullYear())) {
        return res.status(400).json({ message : "Năm không được để trống hoặc không hợp lệ!" });
    }

    if(!km || isNaN(km) || parseInt(km) < 0){
        return res.status(400).json({ message : "Số km đã đi không được để trống hoặc không hợp lệ!"});
    }

    if(!fuel || !["gasoline", "oil", "electric"].includes(fuel)) {
        return res.status(400).json({ message : "Nhiên liệu sử dụng không được để trống hoặc không phù hợp! "});
    }

    if(!seat_capacity || isNaN(seat_capacity) || parseInt(seat_capacity) < 2 || parseInt(seat_capacity) > 7) {
        return res.status(400).json({ message : "Số chỗ ngồi không được để trống hoặc không hợp lệ!" });
    }

    if(!img_demo) {
        return res.status(400).json({ message : "Hình ảnh minh họa không được để trống hoặc không phù hợp!" });
    }

    if(!location || !location.trim() || location.length > 200) {
        return res.status(400).json({ message : "Địa điểm kiểm tra không được để trống hoặc không hợp lệ! " });
    }

    next();
}

const validateCheckedRequest = async (req, res, next) => {
    const { img_src, examine, price_recommend_high, price_recommend_low } = req.body;
    

    if (!Array.isArray(img_src) || img_src.length === 0) {
        return res.status(400).json({ message : "Phải có ít nhất 1 bức ảnh!" })
    }

    if(!price_recommend_high || !price_recommend_low)  {
        return res.status(400).json({ message : "Giá khuyến nghị là bắt buộc!" });
    }

    if (!examine || typeof examine !== "object") {
        return res.status(400).json({ message : "Phải kiểm tra xe trước khi đánh dấu là hoàn thành!" });
    } else {
        const requiredFields = [
            "isCorrectName",
            "isCorrectYear",
            "isCorrectKm",
            "isCorrectSeat_Capacity",
            "isFuel_Gasoline",
            "isFuel_Oil",
            "isFuel_Electric"
        ];

        for (const field of requiredFields) {
            if (!(field in examine)) {
                return res.status(400).json({ message: `Thiếu trường kiểm tra 'examine.${field}'.` });
            }
    
            if (typeof examine[field] !== "boolean") {
                return res.status(400).json({ message: `Trường 'examine.${field}' phải là kiểu true hay false (đúng / sai).` });
            }
        }

        if (
            !examine.isFuel_Gasoline &&
            !examine.isFuel_Oil &&
            !examine.isFuel_Electric
        ) {
            return res.status(400).json({ message : "Phải là một loại nhiên liệu"});
        } else {
            let cnt = 0;
            if(examine.isFuel_Gasoline) cnt += 1;
            if(examine.isFuel_Oil) cnt += 1;
            if(examine.isFuel_Electric) cnt += 1;

            if(cnt !== 1) {
                return res.status(400).json({ message : "Phải là một loại nhiên liệu!" });
            }
        }
    }

    next(); 
};

const validateRejectTheRequest = async (req, res, next) => {
    const { examine, message } = req.body;
    
    if(!message){
        return res.status(400).json({ message : "Phải để lại lời nhắn khi đánh dấu là từ chối"})
    }
    if(!examine || typeof examine !== "object") {
        return res.status(400).json({ message : "Phải kiểm tra xe trước khi đánh dấu là từ chối!"});
    } else {
        const requiredFields = [
            "isCorrectName",
            "isCorrectYear",
            "isCorrectKm",
            "isCorrectSeat_Capacity",
            "isFuel_Gasoline",
            "isFuel_Oil",
            "isFuel_Electric"
        ];

        for(const field of requiredFields) {
            if(!(field in examine)) {
                return res.status(400).json({ message: `Thiếu trường 'examine.${field}'.` });
            }
    
            if(typeof examine[field] !== "boolean") {
                return res.status(400).json({ message: `Trường 'examine.${field}' phải là kiểu đúng / sai.` });
            }
        }

        if(
            !examine.isFuel_Gasoline &&
            !examine.isFuel_Oil &&
            !examine.isFuel_Electric
        ) {
            return res.status(400).json({ message : "Phải là một loại nhiên liệu"});
        }
    }

    next(); 
};
  
const validatePostTheCar = async (req, res, next) => {
    try {
        const { comment, price } = req.body;

        if(!comment) {
            return res.status(400).json({ message : 'Thiếu thông tin mô tả' });
        }
    
        if (!price ) {
            return res.status(400).json({ message: 'Thiếu giá bán' });
        }
    
        next(); 
        } catch (error) {
        return res.status(500).json({ message: 'Lỗi server khi xác thực thông tin' });
    }
};

const ValidateAddTheInspectors = (req, res, next) => {
    const {userIds} = req.body;
    if(!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ mesage : "Số lượng nhân viên không hợp lệ !" });
    }

    const allValid = userIds.every(id => typeof id === 'string' && isValidObjectId(id));
    if (!allValid) {
        return res.status(400).json({ message: "Có ID nhân viên không hợp lệ!" });
    }
    
    next();
}
 
module.exports = {
    validateRequest,
    validateCheckedRequest,
    validateRejectTheRequest,
    validatePostTheCar,
    ValidateAddTheInspectors
};