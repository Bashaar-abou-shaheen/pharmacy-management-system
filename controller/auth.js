const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')

const Admin = require('../models/admin');
const User = require('../models/user');
const admin = require('../models/admin');

exports.signup=(req,res,next)=>{
    const isAdmin = req.query.isAdmin;
    // for signup like admin ==> localhost:3000/auth/signup?isAdmin=true
    if(isAdmin){
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            const error = new Error( errors.array()[0].msg);
            error.statusCode = 422;
            throw error; 
        }
        const email = req.body.email; 
        const password = req.body.password;
        const name = req.body.name;
        const phoneNumber = req.body.phoneNumber;
        const pharmaName = req.body.pharmaName;
        const pharmaLocation = req.body.pharmaLocation;
        bcrypt
            .hash(password,12)
            .then(hashPw=>{
                const admin = new Admin({
                    name : name,
                    email : email ,
                    password : hashPw,
                    pharmaId : Math.floor(Math.random()*1000000),
                    phoneNumber:phoneNumber,
                    pharmaName:pharmaName,         
                    pharmaLocation:pharmaLocation
                });
                return admin.save()
            })
            .then (result=>{
                const token = jwt.sign({
                    email : result.email,
                    adminId : result._id.toString() 
                },
                'hellofromtheotherside',
                {expiresIn : '168h'});
                res.status(201).json({message : 'Saved successfully' ,token:token, adminId : result._id})
            })
            .catch(err=>{
                if(!err.statusCode){
                    err.statusCode = 500
                }
                next(err)
            })
    }
    // for signup like user ==> localhost:3000/auth/signup
    if(!isAdmin){
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            const error = new Error( errors.array()[0].msg);
            error.statusCode = 422;
            throw error; 
        }
        const email = req.body.email; 
        const password = req.body.password;
        const name = req.body.name;
        const pharmaId = req.body.pharmaId;
        const phoneNumber= req.body.phoneNumber
        let adminId;
        Admin
            .findOne({pharmaId:pharmaId})
            .then(result=>{
                if(!result){
                    const error = new Error ('The pharmacy ID is incorrect');
                    error.statusCode = 401;
                    throw error;
                }
                adminId = result._id
            })
        bcrypt
            .hash(password,12)
            .then(hashPw=>{
                const user = new User({
                    name : name,
                    email : email ,
                    password : hashPw,
                    pharmaId : adminId,
                    phoneNumber:phoneNumber            
                });
                return user.save()
            })
            .then (result=>{
                Admin
                    .findById(adminId)
                    .then(admin=>{
                        if(!admin){
                            const error = new Error ('server has crashed');
                            error.statusCode = 401;
                            throw error;
                        };
                        admin.users.userInformation.push({userId : result._id})
                        return admin.save()
                    })
                    .catch(err=>{
                        if(!err.statusCode){
                            err.statusCode = 500
                        }
                        next(err)
                    })
                    const token = jwt.sign({
                        email : result.email,
                        userId : result._id.toString() 
                    },
                    'hellofromtheotherside',
                    {expiresIn : '168h'});
                res.status(201).json({message : 'Saved successfully' ,token:token ,userId : result._id})
            })
            .catch(err=>{
                if(!err.statusCode){
                    err.statusCode = 500
                }
                next(err)
            })
    }
    
};

exports.login=(req,res,next)=>{
    const isAdmin = req.query.isAdmin 
    // localhost:3000/auth/login?isAdmin=false
    if(!isAdmin){
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            const error = new Error (errors.array()[0].msg);
            error.statusCode = 422;
            throw error
        }
        const email =req.body.email;
        const password = req.body.password;
        let loadedUser;
        User
            .findOne({email:email})
            .then(user=>{
                if(!user){
                    const error = new Error( 'The email is not found' );
                    error.statusCode = 401;
                    throw error;
                }
                loadedUser = user;
                return bcrypt.compare(password , user.password)
            })
            .then(isEqual =>{
                if(!isEqual){
                    const error = new Error ( 'Incorrect password' );
                    error.statusCode = 401;
                    throw error;
                }
                const token = jwt.sign({
                    email : loadedUser.email,
                    userId : loadedUser._id.toString() 
                },
                'hellofromtheotherside',
                {expiresIn : '168h'});
                res.status(200).json({token : token , userId: loadedUser._id.toString()});
            })
            .catch(err=>{
                if(!err.statusCode){
                    err.statusCode = 500
                }
                next(err)
            });
    };
    // localhost:3000/auth/login?isAdmin=false
    if(isAdmin){
        console.log(req.body);
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            const error = new Error (errors.array()[0].msg);
            error.statusCode = 422;
            throw error
        }
        const email =req.body.email;
        const password = req.body.password;
        let loadedAdmin;
        Admin
            .findOne({email:email})
            .then(admin=>{
                if(!admin){
                    const error = new Error( 'The email is not found' );
                    error.statusCode = 401;
                    throw error;
                }
                loadedAdmin = admin;
                return bcrypt.compare(password , admin.password)
            })
            .then(isEqual =>{
                if(!isEqual){
                    const error = new Error ( 'Incorrect password' );
                    error.statusCode = 401;
                    throw error;
                }
                const token = jwt.sign({
                    email : loadedAdmin.email,
                    adminId : loadedAdmin._id.toString() 
                },
                'hellofromtheotherside',
                {expiresIn : '168h'});
                res.status(200).json({token : token , adminId: loadedAdmin._id.toString()});
            })
            .catch(err=>{
                if(!err.statusCode){
                    err.statusCode = 500
                }
                next(err)
            });    
    };
};

exports.forget=(req,res,next)=>{
    const isAdmin = req.query.isAdmin 
    // localhost:3000/auth/forget?isAdmin=false
    if(!isAdmin){
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            const error = new Error (errors.array()[0].msg);
            error.statusCode = 422;
            throw error
        }
        const email = req.body.email;
        let newverificationCode = Math.floor(Math.random()*10000)
        User
            .findOne({email:email})
            .then(user=>{
                if(!user){
                    const error = new Error( 'The email is not found' );
                    error.statusCode = 401;
                    throw error;
                }
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: '*********@gmail.com',
                      pass: '********'
                    }
                });
                const mailOptions = {
                    from: '*********@gmail.com',
                    to: email,
                    subject: 'PharmaPro',
                    text: 'your confirmation code is '+ newverificationCode
                  };
                  
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                user.verificationCode = newverificationCode;
                return user.save()
            })
            .then(result=>{
                res.status(200).json({message : "confirmation code has been sent successfully."})
            })
            .catch(err=>{
                if(!err.statusCode){
                    err.statusCode=500;
                }
                next(err)
            })
    }
    // localhost:3000/auth/forget?isAdmin=false
    if(isAdmin){
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            const error = new Error (errors.array()[0].msg);
            error.statusCode = 422;
            throw error
        }
        const email = req.body.email;
        let newverificationCode = Math.floor(Math.random()*10000)
        Admin
            .findOne({email:email})
            .then(admin=>{
                if(!admin){
                    const error = new Error( 'The email is not found' );
                    error.statusCode = 401;
                    throw error;
                }
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: '*******@gmail.com',
                      pass: '****'
                    }
                });
                const mailOptions = {
                    from: '*******@gmail.com',
                    to: email,
                    subject: 'PharmaPro',
                    text: 'your confirmation code is '+ newverificationCode
                  };
                  
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                admin.verificationCode = newverificationCode;
                return admin.save()  
            })
            .then(result=>{
                res.status(200).json({message : "confirmation code has been sent successfully."})
            })
            .catch(err=>{
                if(!err.statusCode){
                    err.statusCode=500;
                }
                next(err)
            })
    }
};

exports.reset=(req,res,next)=>{
    const isAdmin = req.query.isAdmin 
    // localhost:3000/auth/reset?isAdmin=false
    if(!isAdmin){
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            const error = new Error (errors.array()[0].msg);
            error.statusCode = 422;
            throw error
        }
        const email =req.body.email;
        const verificationCode = req.body.verificationCode;
        const password = req.body.password;
        User
            .findOne({email:email})
            .then(user=>{
                if(!user){
                    const error = new Error( 'The email is not found' );
                    error.statusCode = 401;
                    throw error;
                }
                if(!user.validationResult === verificationCode){
                    const error = new Error ( 'Incorrect password' );
                    error.statusCode = 401;
                    throw error;
                }
                bcrypt
                .hash(password,12)
                .then(hashPw=>{
                    user.password = hashPw;
                    return user.save()
                })
                .then (result=>{
                    res.status(201).json({message : 'Saved successfully' , userId : result._id})
                })
                .catch(err=>{
                    if(!err.statusCode){
                        err.statusCode = 500
                    }
                    next(err)
                })
            })
    }

    // localhost:3000/auth/reset?isAdmin=true
    if(isAdmin){
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            const error = new Error (errors.array()[0].msg);
            error.statusCode = 422;
            throw error
        }
        const email =req.body.email;
        const verificationCode = req.body.verificationCode;
        const password = req.body.password
        Admin
            .findOne({email:email})
            .then(admin=>{
                if(!admin){
                    const error = new Error( 'The email is not found' );
                    error.statusCode = 401;
                    throw error;
                }
                if(!admin.validationResult === verificationCode){
                    const error = new Error ( 'Incorrect password' );
                    error.statusCode = 401;
                    throw error;
                }
                bcrypt
                .hash(password,12)
                .then(hashPw=>{
                    admin.password = hashPw;
                    return admin.save()
                })
                .then (result=>{
                    res.status(201).json({message : 'Saved successfully' , adminId : result._id})
                })
                .catch(err=>{
                    if(!err.statusCode){
                        err.statusCode = 500
                    }
                    next(err)
                })
            })
    }
};

exports.resetByOldPass=(req,res,next)=>{
    const isAdmin = req.query.isAdmin 
    // localhost:3000/auth/resetbyoldpass?isAdmin=false
    if(!isAdmin){
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            const error = new Error (errors.array()[0].msg);
            error.statusCode = 422;
            throw error
        }
        const email =req.body.email;
        const password = req.body.password;
        const newPassword = req.body.newPassword;
        let loadedUser;
        User
            .findOne({email:email})
            .then(user=>{
                if(!user){
                    const error = new Error( 'The email is not found' );
                    error.statusCode = 401;
                    throw error;
                }
                loadedUser = user;
                return bcrypt.compare(password , user.password)
            })
            .then(isEqual =>{
                if(!isEqual){
                    const error = new Error ( 'Incorrect password' );
                    error.statusCode = 401;
                    throw error;
                }
                return bcrypt.compare(newPassword , loadedUser.password)
            })
            .then(isSame=>{
                if(isSame){
                    const error = new Error ( 'this is the old password' );
                    error.statusCode = 401;
                    throw error;
                }
                bcrypt
                .hash(newPassword,12)
                .then(hashPw=>{
                    loadedUser.password = hashPw;
                    return loadedUser.save()
                })
                .then (result=>{
                    res.status(201).json({message : 'Saved successfully'})
                })
            })
            .catch(err=>{
                if(!err.statusCode){
                    err.statusCode = 500
                }
                next(err)
            });    
    };
    // localhost:3000/auth/resetbyoldpass?isAdmin=false
    if(isAdmin){
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            const error = new Error (errors.array()[0].msg);
            error.statusCode = 422;
            throw error
        }
        const email =req.body.email;
        const password = req.body.password;
        const newPassword = req.body.newPassword;
        let loadedAdmin;
        Admin
            .findOne({email:email})
            .then(admin=>{
                if(!admin){
                    const error = new Error( 'The email is not found' );
                    error.statusCode = 401;
                    throw error;
                }
                loadedAdmin = admin;
                return bcrypt.compare(password , admin.password)
            })
            .then(isEqual =>{
                if(!isEqual){
                    const error = new Error ( 'Incorrect password' );
                    error.statusCode = 401;
                    throw error;
                }
                return bcrypt.compare(newPassword , loadedAdmin.password)
            })
            .then(isSame=>{
                if(isSame){
                    const error = new Error ( 'this is the old password' );
                    error.statusCode = 401;
                    throw error;
                }
                bcrypt
                .hash(newPassword,12)
                .then(hashPw=>{
                    loadedAdmin.password = hashPw;
                    return loadedAdmin.save()
                })
                .then (result=>{
                    res.status(201).json({message : 'Saved successfully' })
                })
            })
            .catch(err=>{
                if(!err.statusCode){
                    err.statusCode = 500
                }
                next(err)
            });    
    };
};

exports.logout=(req,res,next)=>{
    req.get('Authorization').split(' ')[1]=null;
    res.status(201).json({ message: 'Logged out successfully' });
};