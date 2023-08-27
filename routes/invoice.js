const express = require ('express');
const router = express.Router();

const { body } = require ('express-validator');

const invoiceController = require('../controller/invoice');

const isAdminAuth = require('../middleware/is-admin-auth');
const isUserAuth = require('../middleware/is-user-auth');
const isAdminOrUserAuth = require('../middleware/is-adminOruser-auth');

// to fetch products ==> GET
// localhost:3000/invoice/products
router.get('/products',isAdminOrUserAuth,invoiceController.getProducts)//isAdminOrUserAuth

// to Add product to Invoice ==> GET
// localhost:3000/invoice/addProduct/:productId
router.post('/addProduct/:productId',isAdminOrUserAuth,invoiceController.addProductToInvoice)//isAdminOrUserAuth


// to sell the products in the invoice  ==>POST // i will recieve a LIST
// localhost:3000/invoice/saleInvoice
router.post('/saleInvoice',isAdminOrUserAuth,invoiceController.SaleTheInvoice)//isAdminOrUserAuth

module.exports = router;