const { validationResult, Result } = require('express-validator');
const User = require('../models/user');
const Admin = require('../models/admin');
const Purchase = require('../models/purchase');


exports.addAnotherItem=(req,res,next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const error = new Error(errors.array()[0].msg);
        error.statusCode = 422;
        throw error;
    }
    const anotherItem = req.body.anotherItem;
    const price = req.body.price;
    const quantity = req.body.quantity;
    
    if(req.adminId){
        console.log();
        const anotherItemPurchase = new Purchase({
            anotherItem :anotherItem,
            price : price,      //one piece  
            quantity:quantity,
            adminId:req.adminId
        })
        anotherItemPurchase.save()
        res.status(201).json({message : "The item has been saved."})
    }

    if(req.userId){
        Admin
            .findOne({'users.userInformation.userId':req.userId})
            .then(admin=>{
                if(!admin){
                    const error = new Error('you are not authenticated');
                    error.statusCode =401;
                    throw error
                }
                const anotherItemPurchase = new Purchase({
                    anotherItem :anotherItem,
                    price : price,      //one piece  
                    quantity:quantity,
                    adminId:admin._id
                })
                anotherItemPurchase.save()
                res.status(201).json({message : "The item has been saved."})
            })
            .catch(err=>{
                if(!err.statusCode){
                    err.statusCode=500;
                }
                next(err)
            });
    }
};


exports.getAnotherItems=(req,res,next)=>{
    const period = req.query.period
    let currentDay
    let purchasesForItems=[]

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
    if(req.adminId){
    Purchase
        .find({ $and : [
            {createdAt:{$gte:currentDay}},
            {adminId:req.adminId}
        ]})
        .then(purchases=>{
            console.log(purchases);
            purchases.forEach(purchase=>{
                if(purchase.anotherItem){
                    const anotherItem = {
                        title:purchase.anotherItem,
                        price:purchase.price,
                        quantity:purchase.quantity,
                        purchasedAt:purchase.createdAt
                    }
                    purchasesForItems.push(anotherItem)
                }        
            })
            res.status(201).json({message : "succes fetched",purchasesForItems:purchasesForItems})
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode=500;
            }
            next(err)
        });
    }

    if(req.userId){
        Admin
        .findOne({'users.userInformation.userId':req.userId})
        .then(admin=>{
            if(!admin){
                const error = new Error('you are not authenticated');
                error.statusCode =401;
                throw error
            }
        Purchase
            .find({ $and : [
                {createdAt:{$gte:currentDay}},
                {adminId:admin._id}
            ]})
            .then(purchases=>{
                purchases.forEach(purchase=>{
                    if(purchase.anotherItem){
                        const anotherItem = {
                            title:purchase.anotherItem,
                            price:purchase.price,
                            quantity:purchase.quantity,
                            purchasedAt:purchase.createdAt.getDay()+"-"+purchase.createdAt.getMonth()+"-"+purchase.createdAt.getFullYear()
                        }
                        purchasesForItems.push(anotherItem)
                    }        
                })
                res.status(201).json({message : "succes fetched",purchasesForItems:purchasesForItems})
            })
            .catch(err=>{
                if(!err.statusCode){
                    err.statusCode=500;
                }
                next(err)
            });
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode=500;
            }
            next(err)
        });
    }
}