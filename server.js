const dotenv = require('dotenv');
const app = require('./app');
const mongoose=require('mongoose')
dotenv.config({ path: './config.env' });

const db=process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD) || process.env.DATABASE_LOCAL
mongoose.connect(db,{
    useNewUrlParser:true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con=>{
    console.log("db connection successfull")
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
