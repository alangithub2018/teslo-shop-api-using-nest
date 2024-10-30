

export const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: Function) => {

    // console.log(file);
    if (!file) return cb(new Error('File is empty'), false);

    const fileExtension = file.mimetype.split('/')[1];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    if (allowedExtensions.includes(fileExtension)) {
        cb(null, true);
    }

    // file is not allowed
    cb(null, false);
}