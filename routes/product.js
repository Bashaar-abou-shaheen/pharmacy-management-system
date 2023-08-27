const express = require ('express');
const router = express.Router();

const { body } = require ('express-validator');

const productController = require('../controller/product');

const isAdminAuth = require('../middleware/is-admin-auth')
const isUserAuth = require('../middleware/is-user-auth')
const isAdminOrUserAuth = require('../middleware/is-adminOruser-auth')
// add product ==> POST
//  localhost:3000/product/addproduct     if editMode === flase
router.post('/addproduct',[ //isAdminAuth || isUserAuth,
    body('title' , 'Please enter a title')
        .trim()
        .not()
        .isEmpty(),
    body('shape' , 'Please enter a shape')
        .trim()
        .not()
        .isEmpty(),
    body('factory' , 'Please enter a factory')
        .trim()
        .not()
        .isEmpty(),
    body('salePrice' , 'Please enter a sales price')
        .isNumeric()
        .trim()
        .not()
        .isEmpty(),
    body('titer' , 'Please enter a sales titer')
        .isNumeric()
        .trim()
        .not()
        .isEmpty(),
    body('quantity' , 'Please enter a sales quantity')
        .isNumeric()
        .trim()
        .not()
        .isEmpty(),
    body('price' , 'Please enter a price')
        .isNumeric()
        .trim()
        .not()
        .isEmpty(),
],isAdminOrUserAuth,productController.addProduct);

// edit product ==> GET
// localhost:3000/product/editProduct/:productId
router.get('/editProduct/:productId',isAdminOrUserAuth,productController.getProduct)    //isAdminAuth || isUserAuth,   

// edit product ==> PUT
// localhost:3000/product/editProduct/:productId
router.put('/editProduct/:productId',[
    body('title' , 'Please enter a title')
        .trim()
        .not()
        .isEmpty(),
    body('shape' , 'Please enter a shape')
        .trim()
        .not()
        .isEmpty(),
    body('factory' , 'Please enter a factory')
        .trim()
        .not()
        .isEmpty(),
    body('salePrice' , 'Please enter a sales price')
        .isNumeric()
        .trim()
        .not()
        .isEmpty(),
    body('titer' , 'Please enter a sales titer')
        .isNumeric()
        .trim()
        .not()
        .isEmpty(),
    body('quantity' , 'Please enter a sales quantity')
        .isNumeric()
        .trim()
        .not()
        .isEmpty(),
    body('price' , 'Please enter a sales price')
        .isNumeric()
        .trim()
        .not()
        .isEmpty(),
],isAdminOrUserAuth,productController.editProduct)

// delete product ==> DELETE
// localhost:3000/product/deleteProduct/:productId
router.delete('/deleteProduct/:productId',isAdminOrUserAuth,productController.deleteProduct)

// To fetch expired medications. ==> GET 
// localhost:3000/product/expiredproducts
router.get('/expiredproducts',isAdminAuth,productController.getExpiredProducts)//isAdminAuth  

// To fetch medications by search. ==> GET
// localhost:3000/product/products
router.post('/products',[
        body('search' , 'Please enter a sales quantity')
        .not()
        .isEmpty(),
    
],isAdminOrUserAuth,productController.getProductsBySearch)//isAdminAuth || isUserAuth,  

module.exports = router;