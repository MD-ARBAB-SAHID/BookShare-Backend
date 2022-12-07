const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    branch:{
        type:String,
        required:true,
        
    },
    semester:{
        type:String,
        required:true
    },
    contactNo:{
        type:String,
        required:true
    },
    subject:{
        type:String,
        required:true
    },
    owner:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:"User"
    }
    
})

const bookModel = new mongoose.model('Book',bookSchema);


module.exports =  bookModel;