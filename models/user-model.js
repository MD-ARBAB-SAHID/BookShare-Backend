const mongoose = require("mongoose");

const incomingRequestSchema = new mongoose.Schema({
    senderId:{
            type:String,
            required:true
    },
    bookId:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    bookName:{
        type:String,
        required:true
    },
    sendersName:{
        type:String,
        required:true
    }
})

const outgoingRequestSchema = new mongoose.Schema({
    recieverId:{
        type:String,
        required:true
},
bookId:{
    type:String,
    required:true
},
status:{
    type:String,
    required:true
},
bookName:{
    type:String,
    required:true
},
recieversName:{
    type:String,
    required:true
},
address:{
    type:String
},
contactNo:{
    type:String
}
})

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    college:{
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
    incomingRequest:[{
        type:incomingRequestSchema,
        required:true,

    }],
    outgoingRequest:[{
        type:outgoingRequestSchema,
        required:true,

    }],
    books:[{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:'Book'
    }]
    
})

const userModel = new mongoose.model('User',userSchema);


module.exports =  userModel;