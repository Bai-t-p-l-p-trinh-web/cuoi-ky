const Notificate = require('./notiUser.model');
const createNoti = async(userId, content) => {
    try {
        const noti = new Notificate({
            userId,
            content
        });
        await noti.save();
    }  catch (error) {
        return;
    } 
}
module.exports = {
    createNoti
}