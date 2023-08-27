const express = require('express');
const router = express.Router();
const { check , body } = require ('express-validator');

const User = require('../models/user')
const Admin = require('../models/admin')
const authController = require('../controller/auth');

const isAdminOrUserAuth = require('../middleware/is-adminOruser-auth');
// signup ==> PUT
// localhost:3000/auth/signup?isAdmin=(true or false)
router.put('/signup',[
    body ('email')
        .isEmail()
        .custom((value,{ req })=>{
            const isAdmin = req.query.isAdmin;
            if(!isAdmin){
                return User.findOne({email : value})
                .then (userDoc=>{
                    if(userDoc){
                        return Promise.reject('"The email is already in use')
                    }
                })
            };
            if(isAdmin){
                return Admin.findOne({email : value})
                .then (adminDoc=>{
                    if(adminDoc){
                        return Promise.reject('"The email is already in use')
                    }
                })
            };
        })
        .trim()
        .normalizeEmail(),
    body('password','The password must contain at least 7 characters.')
        .trim()
        .isLength({ min : 7 }),
    body('confirmPassword')
        .custom((value,{req})=>{
            if (value !== req.body.password){
                throw new Error ('passwords have to match')
            }
            return true
        })
        .trim(),
    body('name',"Please enter the location of the pharmacy.")
        .trim()
        .not()
        .isEmpty(),
    check('phoneNumber')
        .trim()
        .isLength({ min : 7 })
        .withMessage('The phone number must contain at least 7 characters.'),
    check('pharmaName')
        .trim()
        .if((value , { req })=>req.query.isAdmin)
        .not()
        .isEmpty()
        .withMessage('Please enter the name of the pharmacy.'),
    check('pharmaLocation')
        .trim()
        .if((value , { req })=>req.query.isAdmin)
        .not()
        .isEmpty()
        .withMessage('Please enter the location of the pharmacy.')
],authController.signup);


// login ==> POST
// localhost:3000/auth/login?isAdmin=(true or false)
router.post('/login',[
    body('email')
        .isEmail()
        .custom((value,{ req })=>{
            const isAdmin = req.query.isAdmin;
            if(!isAdmin){
                return User.findOne({email : value})
                .then (userDoc=>{
                    if(!userDoc){
                        return Promise.reject('The email does not exist')
                    }
                })
            };
            if(isAdmin){
                return Admin.findOne({email : value})
                .then (adminDoc=>{
                    if(!adminDoc){
                        return Promise.reject('The email does not exist')
                    }
                })
            };
        })
        .trim()
        .normalizeEmail(),
    body('password')
            .trim()
            .isLength({ min : 7 })
    // body('confirmPassword')
    //         .custom((value,{req})=>{
    //             if (value !== req.body.password){
    //                 throw new Error ('passwords have to match')
    //             }
    //             return true
    //         })
    //         .trim()

],authController.login);

// forgetPassword ==> POST
// localhost:3000/auth/forget?isAdmin=(true or false)
router.post('/forget',[
    body('email')
        .isEmail()
        .custom((value,{ req })=>{
            const isAdmin = req.query.isAdmin;
            if(!isAdmin){
                return User.findOne({email : value})
                .then (userDoc=>{
                    if(!userDoc){
                        return Promise.reject('The email does not exist')
                    }
                })
            };
            if(isAdmin){
                return Admin.findOne({email : value})
                .then (adminDoc=>{
                    if(!adminDoc){
                        return Promise.reject('The email does not exist')
                    }
                })
            };
        })
        .trim()
        .normalizeEmail()],authController.forget)


// resetPassword ==> PUT
// localhost:3000/auth/reset?isAdmin=(true or false)
router.put('/reset',[
    body('email')
        .isEmail()
        .custom((value,{ req })=>{
            const isAdmin = req.query.isAdmin;
            if(!isAdmin){
                return User.findOne({email : value})
                .then (userDoc=>{
                    if(!userDoc){
                        return Promise.reject('The email does not exist')
                    }
                })
            };
            if(isAdmin){
                return Admin.findOne({email : value})
                .then (adminDoc=>{
                    if(!adminDoc){
                        return Promise.reject('The email does not exist')
                    }
                })
            };
        })
        .trim()
        .normalizeEmail(),
    body('verificationCode',"The verification code must contain 4 number.")
        .trim()
        .isLength({ min : 4,max:4 }),
    body('password','The password must contain at least 7 characters.')
        .trim()
        .isLength({ min : 7 })
    // body('confirmPassword')
    //     .custom((value,{req})=>{
    //         if (value !== req.body.password){
    //             throw new Error ('passwords have to match')
    //         }
    //         return true
    //     })
    //     .trim()
],authController.reset)


// resetPassword ==> PUT
// localhost:3000/auth/resetbyoldpass?isAdmin=(true or false)
router.put('/resetbyoldpass',[
    body('email')
        .isEmail()
        .custom((value,{ req })=>{
            const isAdmin = req.query.isAdmin;
            if(!isAdmin){
                return User.findOne({email : value})
                .then (userDoc=>{
                    if(!userDoc){
                        return Promise.reject('The email does not exist')
                    }
                })
            };
            if(isAdmin){
                return Admin.findOne({email : value})
                .then (adminDoc=>{
                    if(!adminDoc){
                        return Promise.reject('The email does not exist')
                    }
                })
            };
        })
        .trim()
        .normalizeEmail(),
    body('password','The password must contain at least 7 characters.')
        .trim()
        .isLength({ min : 7 }),
    body('newPassword','The password must contain at least 7 characters.')
    .isLength({ min : 7 })
    .trim()
],authController.resetByOldPass)

// logout ==> POST
// localhost:3000/auth/logout
router.post('/logout',isAdminOrUserAuth,authController.logout)//isAdminOrUserAuth

module.exports=router;