const axios = require('axios');
const jwt = require('jsonwebtoken');

const User = require('../user/user.model');

const { generateRandomString } = require('../utils/generate');
const { hashPassword } = require('../auth/auth.services');

// {code} => {id_token, access_token} 
const getOauthGoogleToken = async (code) => {
    const body = {
        code,
        client_id : process.env.GOOGLE_CLIENT_ID,
        client_secret : process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri : process.env.GOOGLE_AUTHORIZED_REDIRECT_URI,
        grant_type : 'authorization_code' 
    };

    const { data } = await axios.post(
        'https://oauth2.googleapis.com/token',
        body,
        {
            headers : {
                'Content-Type' : 'application/x-www-form-urlencoded'
            }
        }
    );

    return data;
}

// {id_token, access_token} => {profile user}
const getDataUserFromToken = async ( { id_token, access_token } ) => {
    const { data } = await axios.get(
        'https://www.googleapis.com/oauth2/v1/userinfo',
        {
            params : {
                access_token,
                alt : 'json'
            },
            headers : {
                Authorization : `Bearer ${id_token}`
            }
        }
    );
    return data;
}

// [GET] /api/v1/oauth/google 
const getRepondsByGoogle = async (req, res) => {
    const {code} = req.query;
    const data = await getOauthGoogleToken(code);
    const { id_token, access_token } = data;
    const googleUser = await getDataUserFromToken({id_token, access_token});

    if (!googleUser.verified_email) {
        return res.status(403).json({
            message : "Google email are not verified"
        });
    }

    try {
        let user = await User.findOne( { 
            email : googleUser.email
        } );

        // chưa có user thì tạo user mới 
        if( !user ) {
            try {
                user = await User.create({
                    email : googleUser.email,
                    name : googleUser.name,
                    avatar : googleUser.picture,
                    password : generateRandomString(50),
                    isVerified : true
                });
    
                
                const tempToken = jwt.sign(
                    { userId : user._id },
                    process.env.JWT_SECRET,
                    { expiresIn : '10m' }
                );
    
        
                res.cookie('temp_oauth_token', tempToken, {
                    httpOnly : true,
                    secure: process.env.NODE_ENV === "production",
                    maxAge : 10 * 60 * 1000
                });
        
                res.redirect(`${process.env.CLIENT_URL}/fill-info`);
            } catch (error) {
                res.send(error);
            }
            
        } else { // Có rồi thì đăng nhập 
            const accessToken = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" } 
            );
        
            res.cookie("access_token", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60 * 1000, 
                sameSite: "Lax"
            });

            return res.redirect(`${process.env.CLIENT_URL}`);
        }

        
    } catch (error) {
        return res.status(500).json({message : "server error!"});
    }
}

// [GET] /api/v1/oauth/tempUser 
const getTempUser = async (req, res) => {
    const token = req.cookies.temp_oauth_token;
    if(!token) return res.status(401).json({ message : 'Chưa xác thực Google' });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({
            _id: payload.userId
        });
        
        if(!user) {
            return res.status(400).json({ message : "Người dùng không hợp lệ" });
        }

        return res.send({
            name : user.name,
            email : user.email,
            avatar : user.avatar
        });
    } catch (error) {
        return res.status(401).json({ message : "Token không hợp lệ" });
    }
}

// [POST] /api/v1/oauth/updateUser 
const updateUser = async(req, res) => {
    try {
        const token = req.cookies.temp_oauth_token;
        if(!token) return res.status(401).json({ message : 'Chưa xác thực Google' });

        const { name, phone, password, email, avatar } = req.body;

        
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const updateUser = await User.findByIdAndUpdate(
            payload.userId,
            {
                name,
                phone,
                password : await hashPassword(password),
                avatar
            }, {
                new : true
            }
        );

        if(!updateUser) {
            return res.status(404).json({message : "Không tìm thấy người dùng "});
        }
        
        const accessToken = jwt.sign(
            { userId: payload.userId },
            process.env.JWT_SECRET,
            { expiresIn: "7d" } 
        );
    
        res.cookie("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, 
            sameSite: "Lax"
        });

        return res.send({message : "Cập nhật thông tin người dùng thành công!"});
    } catch (error) {
        return res.status(500).json({ message : "Server Error!" });
    }

}



module.exports = {
    getRepondsByGoogle,
    getTempUser,
    updateUser
};