const mongoose=require('mongoose')
const crypto=require('crypto')
const validator=require('validator')
const bcrypt=require('bcrypt')
const sharp=require('sharp')
const appError = require('../utils/appError')
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please provide a name']
    },
    email:{
        type:String,
        required:[true,'please provide your email'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,'please provide a valid email'],
    },
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'
    },
    photo:{
        type:String,
        default:'default.jpg'
    },
    password:{
        type:String,
        required:[true,'provide a password'],
        minlength:8,
        select:false
    },
    passwordConfirm:{
        type:String,
        required:[true,'please reenter the password'],
        validate:{
            validator: function(el){
                return el===this.password
            }
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active:{
        type:Boolean,
        select:false,
        default:true
    },
})
userSchema.pre(/^find/,function(next){
    this.find({active :{$ne:false}})
    next();
})
userSchema.pre('save',async function(next){
     if(!this.isModified('password')) return next()
     this.password=await bcrypt.hash(this.password,12)
     this.passwordConfirm=undefined
     next();
 })

userSchema.pre('save',function(next){
     if(!this.isModified('password')||this.isNew ) return next();
     this.passwordChangedAt=Date.now()-1000
     next()
 })
userSchema.methods.correctPassword= async function(candidatepassword,userpassword){
    return await bcrypt.compare(candidatepassword,userpassword)
}
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
  
      return JWTTimestamp < changedTimestamp;
    }
  
    // False means NOT changed
    return false;
  };


userSchema.methods.createPasswordResetToken=function(){
    const resetToken=crypto.randomBytes(32).toString('hex')
    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex')
    console.log({resetToken},this.passwordResetToken)
    this.passwordResetExpires=Date.now() + 100*60*1000
    return resetToken
}

const user=mongoose.model('user',userSchema)
module.exports=user