const express = require ('express');
const router = express.Router();
const { check , body } = require('express-validator');
const isAdminAuth = require('../middleware/is-admin-auth');
const adminController = require('../controller/admin');


// editing user salary ==> PUT
// localhost:3000/admin/edituser/:userId
router.put('/edituser/:userId',[
    body('salary','Please Add the salary')
        .isNumeric()
        .not()
        .isEmpty(),
    body('workShift')
        .trim()
        .not()
        .isEmpty(),
],isAdminAuth,adminController.editUser)

// to see all the user ==>GET
// localhost:3000/admin/users
router.get('/users',isAdminAuth,adminController.getUsers)//,isAdminAuth

//  delete user ==> DELETE 
// localhost:3000/admin/deleteuser/:userId
router.delete('/deleteuser/:userId',isAdminAuth,adminController.deleteUser)//,isAdminAuth


// To fetch sales and purchaes for (Day,Month,Year) ago. ==> GET 
// localhost:3000/admin/inventory?period=(day||month||year)
router.get('/inventory',isAdminAuth,adminController.getInventory)//isAdminAuth

// to Edit pharmaId ==> PUt 
//localhost:3000/admin/editpharmaid
router.put('/editpharmaid',isAdminAuth,adminController.editPharmaId)//isAdminAuth

//edit admin ==> GET 
// localhost:3000/admin/editInfo
router.get('/editInfo',isAdminAuth,adminController.getEditInfo)//isAdminAuth,

//edit admin ==> PUT 
// localhost:3000/admin/editInfo
router.put('/editInfo',[
    body('name',"Please enter the name")
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
],isAdminAuth,adminController.postEditInfo)//isAdminAuth,

module.exports = router;