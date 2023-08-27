const { validationResult, Result } = require('express-validator');
const User = require('../models/user');
const Admin = require('../models/admin');


exports.getEditInfo=(req,res,next)=>{
    User
        .findById(req.userId)
        .then(user=>{
            if(!user){
                const error = new Error('you are not authenticated');
                error.statusCode =401;
                throw error
            }
            const loadedUser={
                name:user.name,
                phoneNumber:user.phoneNumber
            }
            res.status(201).json({message:'user fetched',user:loadedUser})
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
    User
        .findById(req.userId)
        .then(user=>{
            if(!user){
                const error = new Error('you are not authenticated');
                error.statusCode =401;
                throw error
            }
            const name = req.body.name;
            const phoneNumber = req.body.phoneNumber;
            user.name=name;
            user.phoneNumber=phoneNumber;
            return user.save()  
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

exports.getInfo=(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error(errors.array()[0].msg);
        error.statusCode = 422;
        throw error;
    };
    User
        .findById(req.userId)
        .then(user=>{
            if(!user){
                const error = new Error('you are not authenticated');
                error.statusCode =401;
                throw error
            }
            const name = user.name;
            Admin
                .findOne({'users.userInformation.userId':req.userId})
                .then(admin=>{
                    if(!admin){
                        const error = new Error('you are not authenticated');
                        error.statusCode =401;
                        throw error
                    }
                    const pharmaName = admin.pharmaName;
                    const userInfo={
                        name:name,
                        pharmaName:pharmaName
                    }
                    res.status(201).json({message:"user fetched",userInfo:userInfo})
                })
        })
};