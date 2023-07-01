const dotenv = require('dotenv');
const fs=require('fs')
const Tour=require('../../models/tourModel')
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');
const mongoose=require('mongoose');
dotenv.config({ path: './config.env' });

const db=process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD) || process.env.DATABASE_LOCAL
mongoose.connect(db,{
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex:true,
    autoIndex:false,
    useFindAndModify:false
}).then(con=>{
    console.log("db connection successfull")
})
const tour=JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);


const importdata= async ()=>{
    try{
    await Tour.create(tour)
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log("data successfully loaded")
    process.exit()
    }catch(err){
        console.log("error found:",err)
    }
}
const deletedata= async()=>{
    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("deleted successfully")
        process.exit()

    }catch(err){
      console.log("error found:",err)
    }
}

if(process.argv[2]==='--import'){
    importdata();
}
else if(process.argv[2]==='--delete'){
    deletedata();
}
console.log(process.argv)