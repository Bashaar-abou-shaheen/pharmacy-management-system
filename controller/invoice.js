const { validationResult } = require('express-validator');
const Invoice = require('../models/invoice');
const Product = require('../models/product');
const Sale = require('../models/sale');
const Admin = require('../models/admin');
// const product = require('../models/product');
// const invoice = require('../models/invoice');

exports.getProducts=(req,res,next)=>{
    let prodcutsInInvoice=[];
    let allSales = 0;
    if(req.adminId){
        Invoice
            .findOne({salerId:req.adminId})
            .populate({path:'products.productId',select : 'title shape factory titer salePrice'})
            .then(invoice=>{
                if(!invoice){
                    const error = new Error ("You haven't started any invoice yet.");
                    error.statusCode = 404;
                    throw error;
                }
                invoice.products.forEach(item=>{
                    
                    const product={
                        title:item.productId.title,
                        shape:item.productId.shape,
                        factory:item.productId.factory,
                        salePrice:item.productId.salePrice,
                        titer:item.productId.titer,
                        quantity:item.quantity
                    }
                    allSales = (item.productId.salePrice * item.quantity) + allSales  
                    prodcutsInInvoice.push(product)
                })
                res.status(201).json({message:"the Products have been fetched" , prodcutsInInvoice:prodcutsInInvoice , allSales:allSales})
            })
            .catch(err=>{
                if(!err.statusCode){
                    err.statusCode =500
                };
                next(err)
            })
    }
    if(req.userId){
        Invoice
            .findOne({salerId:req.userId})
            .populate({path:'products.productId',select : 'title shape factory titer salePrice'})
            .then(invoice=>{
                if(!invoice){
                    const error = new Error ("You haven't started any invoice yet.");
                    error.statusCode = 404;
                    throw error;
                }
                invoice.products.forEach(item=>{
                    
                    const product={
                        title:item.productId.title,
                        shape:item.productId.shape,
                        factory:item.productId.factory,
                        salePrice:item.productId.salePrice,
                        titer:item.productId.titer,
                        quantity:item.quantity
                    }
                    allSales = (item.productId.salePrice * item.quantity) + allSales  
                    prodcutsInInvoice.push(product)
                })
                res.status(201).json({message:"the Products have been fetched" , prodcutsInInvoice:prodcutsInInvoice , allSales:allSales})
            })
            .catch(err=>{
                if(!err.statusCode){
                    err.statusCode =500
                };
                next(err)
            })
    }
};

exports.addProductToInvoice=(req,res,next)=>{
    const productId =req.params.productId;
    Product
        .findById(productId)
        .then(product=>{
            if(!product){
                const error = new Error ('The medicine is not available');
                error.statusCode = 404;
                throw error;
            };
            if(product.quantity === 0){
                const error = new Error ("you don't have this medicine");
                error.statusCode = 404;
                throw error;
            }
            product.quantity = product.quantity - 1 
        return product.save()
        })
        .then(result=>{
            if(req.adminId){
                Invoice
                    .findOne({salerId:req.adminId})
                    .then(invoice=>{
                        if(invoice){
                            const indexOfProduct = invoice.products.findIndex(item=>item.productId.toString() === productId.toString())
                            if(indexOfProduct != -1 ){
                                invoice.products[indexOfProduct].quantity = invoice.products[indexOfProduct].quantity + 1 
                                return invoice.save()
                            }
                            const newProduct = {
                                productId:productId,
                                quantity : 1  
                            }
                            invoice.products.push(newProduct)
                            return invoice.save() 
                        }
                        const newInvoice = new Invoice({
                            products:[
                                {
                                    productId:productId,
                                    quantity:1,
                                }
                            ],
                            salerId:req.adminId
                        })
                        return newInvoice.save()
                    })
                    .then(result=>{
                        res.status(201).json({message:"The invoice has been updated."})
                    })
                    .catch(err=>{
                        if (!err.statusCode) {
                            err.statusCode = 500;
                        }
                        next(err);
                    });
            } 

            if(req.userId){
                Invoice
                    .findOne({salerId:req.userId})
                    .then(invoice=>{
                        if(invoice){
                            const indexOfProduct = invoice.products.findIndex(item=>item.productId.toString() === productId.toString())
                            if(indexOfProduct != -1 ){
                                invoice.products[indexOfProduct].quantity = invoice.products[indexOfProduct].quantity + 1 
                                return invoice.save()
                            }
                            const newProduct = {
                                productId:productId,
                                quantity : 1  
                            }
                            invoice.products.push(newProduct)
                            return invoice.save() 
                        }
                        const newInvoice = new Invoice({
                            products:[
                                {
                                    productId:productId,
                                    quantity:1,
                                }
                            ],
                            salerId:req.userId
                        })
                        return newInvoice.save()
                    })
                    .then(result=>{
                        res.status(201).json({message:"The invoice has been updated."})
                    })
                    .catch(err=>{
                        if (!err.statusCode) {
                            err.statusCode = 500;
                        }
                        next(err);
                    });
            } 
        })
        .catch(err=>{
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.SaleTheInvoice=(req,res,next)=>{
    if(req.adminId){
        Invoice
        .findOne({salerId:req.adminId})
        .populate('products.productId')
        .then(invoice=>{
            if(!invoice){
                const error = new Error ("You haven't started the invoice yet.");
                error.statusCode = 404;
                throw error;
            }
            invoice.products.forEach(item=>{
                const sale = new Sale({
                    productId:item.productId._id,
                    price:item.productId.salePrice,
                    quantity:item.quantity,
                    adminId:req.adminId
                })
                sale.save()
            })
            return Invoice.findByIdAndRemove(invoice._id)
        })
        .then(result=>{
            res.status(201).json({message:"The sale is completed."})
        })
        .catch(err=>{
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
    }
    if(req.userId){
        Invoice
        .findOne({salerId:req.userId})
        .populate('products.productId')
        .then(invoice=>{
            if(!invoice){
                const error = new Error ("You haven't started the invoice yet.");
                error.statusCode = 404;
                throw error;
            }
            Admin
                .findOne({'users.userInformation.userId':req.userId})
                .then(admin=>{
                    if(!admin){
                        const error = new Error ("You do not belong to any pharmacy.");
                        error.statusCode = 404;
                        throw error;
                    }        
                    invoice.products.forEach(item=>{
                        const sale = new Sale({
                            productId:item.productId._id,
                            price:item.productId.salePrice,
                            quantity:item.quantity,
                            adminId:admin._id
                        })
                        sale.save()
                    })
                    return Invoice.findByIdAndRemove(invoice._id)
                })
                .then(result=>{
                    res.status(201).json({message:"The sale is completed."})
                })
                .catch(err=>{
                    if (!err.statusCode) {
                        err.statusCode = 500;
                    }
                    next(err);
                });
        })
        .catch(err=>{
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
    }
}