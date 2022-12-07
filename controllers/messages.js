const HttpError = require("../models/http-error");
const User =    require("../models/user-model");
const Book = require("../models/book-model");
const {validationResult} = require("express-validator");
const mongoose = require("mongoose");

const addRequest = async (req,res,next)=>{
    const id = req.userData;
    let existingUser = req.existingUser;
    const bookId = req.body.bookId;
    const ownerId = req.body.ownerId;
  
   
    
    let book;
    try{
book = await Book.findById(bookId);
    }
    catch(err)
    { 
        return next(new HttpError("Cannot make request for the selected book ,try again",500));
    }
   
    if(!book || book.owner.toString()!==ownerId)
    { 
        return next(new HttpError("Cannot make request for the selected book ,try again",500));
    }

    if(id===ownerId)
    {   
        return next(new HttpError("Cannot request your added book",500))
    }


     // if that user has already requested the book
     let userRequestedBookAlready = false;
     const outgoingRequest = existingUser.outgoingRequest;
     outgoingRequest.forEach((request)=>{
         if(request.bookId===bookId)
         {
             userRequestedBookAlready = true;
             return ;
         }
     })
     if(userRequestedBookAlready)
     {
        return next(new HttpError("You have already requested the book",500)); 
     }


    let reciever;
    try{
        reciever =  await User.findById(ownerId);
    }
    catch(err)
    { 
        return next(new HttpError("Cannot make request for the selected book ,try again",500));
    }
    if(!reciever)
    { 
        return next(new HttpError("Cannot make request for the selected book ,try again",500));
    }
    const recieverMessage = {
        status:"PENDING",
        bookId:bookId,
        senderId:id,
        sendersName:existingUser.name,
        bookName:book.name
    }

    const senderMessage = {
        status:"PENDING",
        bookId:bookId,
        recieverId:ownerId,
        recieversName:reciever.name,
        bookName:book.name
        
    }
    try{
       
        const sess = await mongoose.startSession();
        sess.startTransaction();
        existingUser.outgoingRequest.push(senderMessage);
        reciever.incomingRequest.push(recieverMessage);
        await existingUser.save({session:sess});
        await reciever.save({session:sess});
        await sess.commitTransaction();
    }catch(err)
    { 
        return next(new HttpError("Cannot make request for the selected book ,try again",500));
    }
   

    
    return res.json("Added");
}

const incomingRequest = async(req,res,next)=>{
  let existingUser = req.existingUser;
  let incomingRequestsArray = [];
  incomingRequestsArray = existingUser.incomingRequest;

  return res.json(incomingRequestsArray);


    
    
}

const outgoingRequest = (req,res,next)=>{
   
    let existingUser = req.existingUser;
    let outgoingRequestsArray = [];
    outgoingRequestsArray = existingUser.outgoingRequest;
  
    return res.json(outgoingRequestsArray);
}

const resultRequest = async(req,res,next)=>{
    const id = req.userData;
    let existingUser = req.existingUser;
    const {result,requestId} = req.body;


    if(!(result==="ACCEPTED" || result==="REJECTED"))
    {
        return next(new HttpError("Could not make the request,try again",500));
    }
    let findIndexOfIR = existingUser.incomingRequest.findIndex((element)=>{
        return element.id===requestId;
    })
    if(findIndexOfIR===-1)
    {
        return next(new HttpError("Could not make the request,try agains",500));
    }
    let sendersId = existingUser.incomingRequest[findIndexOfIR].senderId;
    let bookId = existingUser.incomingRequest[findIndexOfIR].bookId;
   
    const isOwner = existingUser.books.some((element)=>{
       
        return element.toString()===bookId;
    })
    if(!isOwner)
    {
        return next(new HttpError("Invalid Owner ,cannot make decisions",500));
    }
    let sendersDetails;
    try{
sendersDetails = await User.findById(sendersId);
    }catch(err)
    {
        return next(new HttpError("Senders Details not found",500));
    }
   if(!sendersDetails)
   {
    return next(new HttpError("Senders Details not found",500));
   };

   const findIndexOfOR = sendersDetails.outgoingRequest.findIndex((element)=>{
   
       return ((element.bookId===bookId) && (element.recieverId===id))
   })
   if(findIndexOfOR===-1)
   {
       return next(new HttpError("Could not make request,try again",500));
   };
   let bookDetails;
   try{
       bookDetails = await Book.findById(bookId);
   }catch(err)
   {
       return next("Book Not Found",500);
   }
   if(!bookDetails)
   {
    return next("Book Not Found",500);
   }
  
    const ORdetails = sendersDetails.outgoingRequest[findIndexOfOR];
    let modifiedDetails;
    if(result==="ACCEPTED")
    {
        modifiedDetails = {
            status:result,
            bookId:ORdetails.bookId,
            recieverId:ORdetails.recieverId,
            recieversName:ORdetails.recieversName,
            bookName:ORdetails.bookName,
            address:bookDetails.address,
            contactNo:bookDetails.contactNo
        }
    }
    else{
        modifiedDetails = {
            status:result,
            bookId:ORdetails.bookId,
            recieverId:ORdetails.recieverId,
            recieversName:ORdetails.recieversName,
            bookName:ORdetails.bookName,
            
        }
    }
    
    try{
const sess = await mongoose.startSession();
sess.startTransaction();
existingUser.incomingRequest[findIndexOfIR].status=result;
sendersDetails.outgoingRequest[findIndexOfOR] = modifiedDetails;
await existingUser.save({session:sess});
await sendersDetails.save({session:sess})
await sess.commitTransaction();

    }catch(err)
    {
        return next(new HttpError("Cannot Update Request",500));
    }
    return res.json(existingUser.incomingRequest);



}
module.exports.addRequest = addRequest;
module.exports.incomingRequest = incomingRequest;
module.exports.outgoingRequest = outgoingRequest;
module.exports.resultRequest = resultRequest;