const { validationResult } = require('express-validator');

const Admin = require('../models/admin');
const Product = require('../models/product');
const User = require('../models/user');
const Purchase = require('../models/purchase');
const Sale = require('../models/sale');
// const admin = require('../models/admin');

exports.editUser=(req,res,next)=>{
    const userId = req.params.userId;
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const error = new Error(errors.array()[0].msg);
        error.statusCode = 422;
        throw error;
    };
    User
        .findById(userId)
        .then(user=>{
            if(!user){
                const error = new Error('The user is not available')
                error.statusCode=404;
                throw error;
            }
            const salary = req.body.salary;
            const workShift = req.body.workShift
            Admin
                .findById(req.adminId)
                .then(admin=>{
                    const userIndex = admin.users.userInformation.findIndex(item=> item.userId.toString() === userId.toString());
                    admin.users.userInformation[userIndex] = { userId : userId , salary : salary , workShift:workShift};
                    return admin.save();
                })
                .then(()=>{
                    const purchase = new Purchase({
                        userId : userId,
                        price : salary
                    });
                    return purchase.save()
                })
                .then(()=>{
                    res.status(200).json({message : "The changes have been successfully saved."})
                })
                .catch(err=>{
                    if(!err.statusCode){
                        err.statusCode=500;
                    }
                    next(err)
                });
        });
};

exports.deleteUser=(req,res,next)=>{
    const userId = req.params.userId;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error (errors.array()[0].msg);
        error.statusCode = 422;
        throw error;
    }
    User
        .findById(userId)
        .then(user=>{
            if(!user){
                const error = new Error('The user is not available')
                error.statusCode=404;
                throw error;
            }
            Admin
                .findById(req.adminId)
                .then(admin=>{
                    console.log(admin);
                    const userIndex = admin.users.userInformation.findIndex(item=> item.userId.toString() === userId.toString());   //findIndex(item=> item.userId.toString() === userId.toString());
                    admin.users.userInformation.splice(userIndex,1);
                    return admin.save();
                })
                .then(()=>{
                    res.status(200).json({message : "The salary has been updated successfully."})
                })
                .catch(err=>{
                    if(!err.statusCode){
                        err.statusCode=500;
                    }
                    next(err)
                });
        });
};

exports.getInventory=(req,res,next)=>{
    const period = req.query.period;
    let currentDay;         
    let purchaseMony=0;     
    let salesMony=0;        
    let netProfit = 0;      

    let purchasesForItems=[]
    let purchasesForAnotherItems=[]
    let purchasesForUsers=[]
 
    let salesForItems=[]

    let purchasesWithPrice = {};    
    let salesWithPrice = {};
// console.log(period);
    if(period==='day'){
        currentDay = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate());
    }
    if(period==='month'){
        currentDay = new Date(new Date().getFullYear(),new Date().getMonth(),1);
    }
    if(period==='year'){
        currentDay = new Date(new Date().getFullYear(),0,1);
    }
    console.log(currentDay);
    Purchase
        .find({ $and : [
            {createdAt:{$gte:currentDay}},
            {adminId:req.adminId}
        ]})
        .populate({path:'productId',select : 'title -_id'})
        .populate({path:'userId',select : 'name'})
        .select("price anotherItem quantity createdAt userId productId -_id")
        .then(purchases=>{
            purchases.forEach(item=>{
                // console.log(item);
                if(item.userId){
                    
                    const user ={
                        title :item.userId.name,
                        price:item.price,
                        quantity:item.quantity
                    }
                    purchasesForUsers.push(user)
                }
                if(item.productId){
                    const product ={
                        title :item.productId.title,
                        price:item.price,
                        quantity:item.quantity
                        // createdAt:item.createdAt
                    }
                    purchasesForItems.push(product)
                }
                if(item.anotherItem){
                    const anotherItem = {
                        title:item.anotherItem,
                        price:item.price,
                        quantity:item.quantity
                    }
                    purchasesForAnotherItems.push(anotherItem)
                }
                const price = item.price;
                const quantity = item.quantity;
                purchaseMony = purchaseMony + (price*quantity)
            })
            purchasesWithPrice={
                purchasesForUsers:purchasesForUsers,
                purchasesForItems:purchasesForItems,
                purchasesForAnotherItems:purchasesForAnotherItems,
                purchaseMony:purchaseMony
            }
            return purchasesWithPrice
        })
        .then(()=>{
            Sale
                .find({ $and : [
                    {createdAt:{$gte:currentDay}},
                    {adminId:req.adminId}
                ]})
                .populate({path:'productId',select : 'title -_id'})
                .select("price quantity createdAt productId -_id")
                .then(sales=>{
                    sales.forEach(item=>{ if(item.productId){
                        const product ={
                            title :item.productId.title,
                            price:item.price,
                            quantity:item.quantity
                            // createdAt:item.createdAt
                        }
                        salesForItems.push(product)
                    }
                        const price = item.price
                        const quantity = item.quantity
                        salesMony = salesMony + (price * quantity)
                    })
                    salesWithPrice={
                        salesForItems:salesForItems,
                        salesMony:salesMony
                    }
                    return salesWithPrice
                })
                .then(()=>{
                    return netProfit = salesMony - purchaseMony
                })
                .then(()=>{
                    console.log(purchasesWithPrice);res.json({isOk:"true",message:"success fetched",purchasesWithPrice:purchasesWithPrice,salesWithPrice:salesWithPrice,netProfit:netProfit})
                })
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode=500;
            }next(err)
        });
}

exports.editPharmaId=(req,res,next)=>{
    let newPharmaId = Math.floor(Math.random()*1000000)
    Admin
        .findById(req.adminId)
        .then(admin=>{
            console.log(admin);
            admin.pharmaId = newPharmaId;
            return admin.save()
        })
        .then(newAdmin=>{
            res.status(200).json({message : "The pharmacy Id has been updated successfully." , pharmacyId : newAdmin.pharmaId})
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode=500;
            }
            next(err)
        })
};

exports.getUsers=(req,res,next)=>{
    Admin
        .findById(req.adminId)
        .populate("users.userInformation.userId")
        //.select("users")
        .then(admin=>{
            let users=[]
            if(!admin){
                const error = new Error('The admin is not available')
                error.statusCode=404;
                throw error;
            }
            admin.users.userInformation.forEach(item=>{
                console.log(item);
                // console.log(item.workShift);
                const user={
                    _id:item.userId._id,
                    name :item.userId.name,
                    email:item.userId.email,
                    phoneNumber:item.userId.phoneNumber,
                    salary:item.salary,
                    workShift:item.workShift
                }
                users.push(user)
            })
            res.status(201).json({message:"succes fetched",users:users})
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode=500;
            }
            next(err)
        })
};

exports.getEditInfo=(req,res,next)=>{
    Admin
        .findById(req.adminId)
        .then(admin=>{
            if(!admin){
                const error = new Error('you are not authenticated');
                error.statusCode =401;
                throw error
            }
            const loadedAdmin={
                pharmaId:admin.pharmaId,
                name:admin.name,
                phoneNumber:admin.phoneNumber,
                pharmaName:admin.pharmaName,
                pharmaLocation:admin.pharmaLocation
            }
            res.status(201).json({message:'user fetched',admin:loadedAdmin})
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        })
};

exports.postEditInfo=(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error(errors.array()[0].msg);
        error.statusCode = 422;
        throw error;
    };
    Admin
        .findById(req.adminId)
        .then(admin=>{
            if(!admin){
                const error = new Error('you are not authenticated');
                error.statusCode =401;
                throw error
            }
            const name = req.body.name;
            const phoneNumber = req.body.phoneNumber;
            const pharmaName = req.body.pharmaName;
            const pharmaLocation = req.body.pharmaLocation;
            admin.name=name;
            admin.phoneNumber=phoneNumber;
            admin.pharmaName=pharmaName
            admin.pharmaLocation=pharmaLocation
            return admin.save()  
        })
        .then(result=>{
            res.status(201).json({message:"The information has been saved" , isChanged:"true"})
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        })
};