const { PDFDocument, StandardFonts, rgb, drawCheckBox } = require('pdf-lib');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const fontkit = require('fontkit');
const fs = require('fs');

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
});

const uploadPdfToCloudinary = (buffer) => {
return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
    { resource_type: 'raw', folder: 'pdfs' }, 
    (error, result) => {
        if (error) return reject(error);
        resolve(result);
    }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
});
};

const createPdf = async ({request}) => {
    const pdfDoc = await PDFDocument.create();

    pdfDoc.registerFontkit(fontkit);

    const page = pdfDoc.addPage([595, 842]); //[width, height]

    const fontBytes = fs.readFileSync('./fonts/Roboto-default.ttf');
    const font = await pdfDoc.embedFont(fontBytes);

    const fontBoldBytes = fs.readFileSync('./fonts/Roboto-bold.ttf');
    const fontBold = await pdfDoc.embedFont(fontBoldBytes);

    const form = pdfDoc.getForm();

    // Tgian htai 
    const dateNow = new Date(Date.now());
    const day = dateNow.getDate();
    const month = dateNow.getMonth() + 1;
    const year = dateNow.getFullYear();


    // Tgian tao don 
    const dateCreate = new Date(request.createdAt);
    const minuteC = dateCreate.getMinutes();
    const hourC = dateCreate.getHours();
    const dayC = dateCreate.getDate();
    const monthC = dateCreate.getMonth() + 1;
    const yearC = dateCreate.getFullYear();

    const fullDateCreate = `${hourC}:${minuteC} ${dayC}/${monthC}/${yearC}`;

    const drawText = (text, x, y, size = 12) => {
        page.drawText(text , {
            x,
            y,
            size,
            font,
            color : rgb(0, 0, 0)
        });
    };
    const drawTextBold = (text, x, y, size = 12) => {
        page.drawText(text, {
            x,
            y,
            size,
            font : fontBold,
            color : rgb(0, 0, 0)
        });
        
    };

    const drawCheckbox = (title, label, x, y, width = 11, height = 11, checked = true) => {
        // console.log(title, label, x, y);
        const fieldCheck = form.createCheckBox(title);
        fieldCheck.addToPage(page, {
            x,
            y,
            width,
            height
        });

        if (checked) fieldCheck.check();

        if(label) {
            drawText(label, x + width + 5, y);
        }
    }

    const isAllCorrect = () => {
        return request.examine.isCorrectName && request.examine.isCorrectYear && request.examine.isCorrectKm && request.examine.isCorrectSeat_Capacity;
    }


    drawText('Công ty TNHH Fake Auto', 20, 800 );
    drawText(`HCM, ngày ${day} tháng ${month} năm ${year} `, 380, 800);
    drawText('THÔNG TIN KIỂM TRA XE', 210, 730);
    drawText('ÔNG/BÀ : ', 20, 670, 11);
    drawTextBold(request.seller.name, 120, 670, 11);
    drawText('SĐT : ', 250, 670, 11);
    drawTextBold(request.seller.phone, 350, 670, 11);
    drawText('EMAIL : ', 20, 640, 11);
    drawTextBold(request.seller.email, 120, 640, 11);
    drawText('ĐỊA ĐIỂM : ', 20, 610, 11);
    drawTextBold(request.location, 120, 610, 11);
    drawText('NGÀY TẠO ĐƠN : ', 20, 580, 11);
    drawTextBold(fullDateCreate, 120, 580, 11);
    drawText('Thông tin kiểm tra', 20, 520, 11);
    
    drawCheckbox('test.right', 'Đúng', 200, 520);

    drawText('Tên : ', 50, 490, 11);
    drawTextBold(request.name, 150, 490, 11);
    drawCheckbox('car.name', '', 400, 490, 11, 11, request.examine.isCorrectName);

    drawText('Năm mua : ', 50, 460, 11);
    drawTextBold((request.year ?? '').toString(), 150, 460, 11);
    drawCheckbox('car.year', '', 400, 460, 11, 11, request.examine.isCorrectYear);

    drawText('Số km đã đi : ', 50, 430, 11);
    drawTextBold((request.km ?? '').toString(), 150, 430, 11);
    drawCheckbox('car.km', '', 400, 430, 11, 11, request.examine.isCorrectKm);

    drawText('Số ghế : ', 50, 400, 11);
    drawTextBold((request.seat_capacity ?? '').toString(), 150, 400, 11);
    drawCheckbox('car.seat_capacity', '', 400, 400, 11, 11, request.examine.isCorrectSeat_Capacity);

    

    drawText('Nhiên liệu : ', 50, 370, 11);
    drawCheckbox('car.fuel_gasoline', 'Xăng', 150, 370, 11, 11, request.examine.isFuel_Gasoline);
    drawCheckbox('car.fuel_oil', 'Dầu', 210, 370, 11, 11, request.examine.isFuel_Oil);
    drawCheckbox('car.fuel_electric', 'Điện', 270, 370, 11, 11, request.examine.isFuel_Electric);

    drawTextBold('Kết luận : ', 20, 300, 11);

    if(isAllCorrect()){
        drawText('Thông tin Ông/Bà đã điền là đúng với thông tin xe', 120, 300, 11);
    } else {
        drawText('Thông tin Ông/Bà đã điền là sai với thông tin xe', 120, 300, 11);
        drawText('Lý do : ', 20, 270, 11);
        drawTextBold(request.message, 120, 270, 11);
    }

    drawText('Chủ tịch công ty Fake Auto', 380, 180, 11);

    const imageBytes = fs.readFileSync('./requestAdd/images/mocdo.jpg');
    const image = await pdfDoc.embedJpg(imageBytes);

    const imageDims = image.scale(0.15); 

    page.drawImage(image, {
        x: 380,        
        y: 20,         
        width: imageDims.width,
        height: imageDims.height,
    });

    

    const pdfBytes = await pdfDoc.save();
    
    const result = await uploadPdfToCloudinary(pdfBytes);

    return result.secure_url;
}

module.exports = {
    createPdf
}