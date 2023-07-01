const catchAsync = require("../utils/catchAsync");
const appError=require('./../utils/appError')
const User=require('./../models/userModel')
const factory=require('./handleFactory')
const multer=require('multer')
const sharp=require('sharp')
const multerStorage = multer.memoryStorage();
// const multerStorage=multer.diskStorage({
//   destination:(req,file,cb)=>{
//     cb(null,'public/img/users',)
//   },
//   filename:(req,file,cb)=>{
//     const ext= file.mimetype.split('/')[1]
//     cb(null,`user-${req.user.id}-${Date.now()}.${ext}`)
//   },
  
// })
const multerFilter=(req,file,cb)=>{
  if(file.mimetype.startsWith('image')){
    cb(null,true)
  }
  else{
    cb(new appError('Not an image!Please upload an image',400),false)
  }
}
const upload=multer({
  storage:multerStorage,
  fileFilter:multerFilter
})
exports.uploadUserPhoto=upload.single('photo')
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});
exports.deleteMe=catchAsync(async(req,res,next)=>{
  await User.findByIdAndUpdate(req.user.id,{active :false})
  res.status(204).json({
    status:'success',
  })
})
exports.getAllUsers =catchAsync(async (req, res) => {
  const user= await User.find()
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: user.length,
     data: {
     user
     }
  });
})
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

const filterObj=(obj,...allowedfields)=>{
  const newObj={}
  Object.keys(obj).forEach(el=>{
    if(allowedfields.includes(el)) newObj[el]=obj[el]
  })
  return newObj
}
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.updateMe=catchAsync(async (req,res,next)=>{
  if(req.body.password || req.body.passwordConfirm){
    return next(new appError('this is the not the route to update password',400))

  }
  const filterbody=filterObj(req.body,'name','email')
  if(req.file) filterbody.photo=req.file.filename
  const updateduser=await User.findByIdAndUpdate(req.user.id,filterbody,{
    new:true,
    runValidators:true
  })
  res.status(200).json({
    status:'success',
    data:{
      user:updateduser
    }

  })
})
exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

