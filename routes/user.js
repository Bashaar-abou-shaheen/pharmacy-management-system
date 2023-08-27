const express = require ('express');
const router = express.Router();
const { check , body } = require('express-validator');

const isUserAuth = require('../middleware/is-user-auth');
const userController = require('../controller/user');


//edit user ==> GET 
// localhost:3000/user/editInfo
router.get('/editInfo',isUserAuth,userController.getEditInfo)//isUserAuth,

//edit user ==> PUT 
// localhost:3000/user/editInfo
router.put('/editInfo',[
    body('name',"Please enter the name")
        .trim()
        .not()
        .isEmpty(),
    check('phoneNumber')
    .trim()
    .isLength({ min : 7 })
    .withMessage('The phone number must contain at least 7 characters.')
],userController.postEditInfo)//isUserAuth,

//edit user ==> GET 
// localhost:3000/user/info
router.get('/info',isUserAuth,userController.getInfo)//isUserAuth,


module.exports = router;