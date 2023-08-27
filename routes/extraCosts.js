const express = require ('express');
const router = express.Router();
const { check , body } = require('express-validator');

const isUserAuth = require('../middleware/is-user-auth');
const isAdminOrUserAuth = require('../middleware/is-adminOruser-auth');
const extraCostsController = require('../controller/extraCosts');

//  add another Item ==> POST 
// localhost:3000/extracosts/addanotheritem
router.post('/addanotheritem',[
    body('anotherItem','Please add another Item')
        .trim()
        .not()
        .isEmpty(),
    body('price','Please add the price')
        .isNumeric()
        .not()
        .isEmpty(),
    body('quantity','Please add the quantity')
        .isNumeric()
        .not()
        .isEmpty(),
],isAdminOrUserAuth,extraCostsController.addAnotherItem)//isAdminOrUserAuth

//  add another Item ==> POST 
// localhost:3000/extracosts/anotheritem
router.get("/anotheritem",isAdminOrUserAuth,extraCostsController.getAnotherItems)//isAdminOrUserAuth

module.exports = router;