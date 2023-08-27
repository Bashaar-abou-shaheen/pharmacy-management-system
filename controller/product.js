const { validationResult } = require('express-validator')

const Product = require('../models/product')
const Purchase = require('../models/purchase');
const Sale = require('../models/sale');
const Admin= require('../models/admin')
const { post } = require('../routes/admin');
const admin = require('../models/admin');

exports.addProduct = (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error(errors.array()[0].msg);
        error.statusCode = 422;
        throw error;
    };
    // for product 
    const title = req.body.title;
    const shape = req.body.shape;
    const factory = req.body.factory;
    const salePrice = req.body.salePrice;
    const titer = req.body.titer;
    const expirationDate = req.body.expirationDate;
    // for purchase
    const quantity = req.body.quantity;
    const price = req.body.price;
        Product
        .findOne({ $and : [
            {title: title},
            {shape :shape},
            {factory: factory},
            {titer :titer}
        ]})
        .then(product=>{
            if(!product){
                const product = new Product({
                    title : title ,
                    shape : shape ,
                    quantity : quantity,
                    factory : factory,
                    salePrice:salePrice,
                    price:price,
                    titer :titer,
                })
                return product.save()
            }
            if(product){
                product.quantity = product.quantity + quantity;
            }
            product.save()
            return product
        })
        .then(currentProduct=>{
            if(!req.userId  && !req.adminId){
                const error = new Error('you are not authenticated');
                error.statusCode =401;
                throw error
            }
            if(req.adminId){
                Admin
                .findById(req.adminId)
                .then(admin=>{
                    admin.products.items.push({productId : currentProduct._id,expirationDate:expirationDate})
                    const purchase = new Purchase({
                        productId : currentProduct._id,
                        quantity : quantity,
                        price :price,
                        adminId:admin._id
                    })
                    purchase.save()
                    return admin.save()
                })
                .catch(err=>{
                    if (!err.statusCode) {
                        err.statusCode = 500;
                    }
                    next(err);
                })
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
                        admin.products.items.push({productId : currentProduct._id,expirationDate:expirationDate})
                        const purchase = new Purchase({
                            productId : currentProduct._id,
                            quantity : quantity,
                            price :price,
                            adminId:admin._id
                        })
                        purchase.save()
                        return admin.save()
                    })
                    .catch(err=>{
                        if (!err.statusCode) {
                            err.statusCode = 500;
                        }
                        next(err);
                    })
            }
            return
        })
        .then(result=>{
            res.status(201).json({
                message : 'The medication has been saved.'
            })
        })
        .catch(err=>{
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }); 
}
exports.getProduct=(req,res,next)=>{
    const productId = req.params.productId;
    const productInfo = {};
    if(!req.userId  && !req.adminId){
        const error = new Error('you are not authenticated');
        error.statusCode =401;
        throw error
    }
    if(req.adminId){
        Admin
        .findById(req.adminId)
        .select("products -_id")
        .populate("products.items.productId")
        .then(products=>{
            products.products.items.forEach(item=>{
                if(item.productId._id.toString() === productId.toString()){
                    productInfo.title = item.productId.title
                    productInfo.shape = item.productId.shape
                    productInfo.quantity = item.productId.quantity
                    productInfo.factory = item.productId.factory
                    productInfo.price = item.productId.price
                    productInfo.salePrice = item.productId.salePrice
                    productInfo.titer = item.productId.titer
                    productInfo.expirationDate = item.expirationDate
                }
            })
            return productInfo
        })
        .then(productInfo=>{
            res.status(201).json({message:'product fetched' , product:productInfo});
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        })        
    }  
    if(req.userId){
        Admin
        .findOne({'users.userInformation.userId':req.userId})
        .select("products -_id")
        .populate("products.items.productId")
        .then(products=>{
            products.products.items.forEach(item=>{
                if(item.productId._id.toString() === productId.toString()){
                    productInfo.title = item.productId.title
                    productInfo.shape = item.productId.shape
                    productInfo.quantity = item.productId.quantity
                    productInfo.factory = item.productId.factory
                    productInfo.price = item.productId.price
                    productInfo.salePrice = item.productId.salePrice
                    productInfo.titer = item.productId.titer
                    productInfo.expirationDate = item.expirationDate
                }
            })
            return productInfo
        })
        .then(productInfo=>{
            res.status(201).json({message:'product fetched' , product:productInfo});
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        })    
    }   
};

exports.editProduct = (req,res,next)=>{
    const productId = req.params.productId;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error(errors.array()[0].msg)
        error.statusCode = 422;
        throw error
    }
    const title = req.body.title;
    const shape = req.body.shape;
    const factory = req.body.factory;
    const salePrice = req.body.salePrice;
    const titer = req.body.titer;
    Product
        .findById(productId)
        .then(product=>{
            if(!product){
                const error = new Error ('The medicine is not available');
                error.statusCode = 404;
                throw error;
            }
            product.title = title;
            product.shape = shape;
            product.factory = factory;
            product.salePrice = salePrice;
            product.titer = titer;
            return product.save();
        })
        .then(result=>{
            res.status(200).json({message:'The medication has been saved.',product:result})
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.deleteProduct=(req,res,next)=>{
    const productId = req.params.productId;
    Product
        .findById(productId)
        .then(product=>{
            if(!product){
                const error = new Error ('The medicine is not available');
                error.statusCode = 404;
                throw error;
            };
            return Product.findByIdAndRemove(productId)
        })
        .then(()=>{
            res.status(200).json({message: 'Deleted successfully.'})
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode =500
            };
            next(err)
        });
};

// To fetch expired medications.
exports.getExpiredProducts = (req,res,next)=>{
    const currentDay = new Date ();
    if(req.adminId){
        Admin
        .findById(req.adminId)
        .select("products -_id")
        .populate("products.items.productId")
        .then(admin=>{
            const expiredProductsArray = []
            const productsArray = admin.products.items
            productsArray.forEach(item=>{
                if (item.productId.quantity>0 && item.expirationDate < currentDay){
                    const loadedItem ={
                        title: item.productId.title,
                        shape: item.productId.shape,
                        quantity: item.productId.quantity,
                        factory: item.productId.factory,
                        price: item.productId.price,
                        salePrice: item.productId.sale,
                        titer: item.productId.titer,
                        expirationDate:item.expirationDate                        
                    }
                    expiredProductsArray.push(loadedItem)
                }
            })
            res.status(200).json({message :"the expired Products have been fetched",expiredProducts : expiredProductsArray})
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode =500
            };
            next(err)
        })
    }
};

exports.getProductsBySearch=(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error(errors.array()[0].msg)
        error.statusCode=422;
        throw error;
    }
    const search = req.body.search;
    let productsIds = [];
    let finalProducts = [];
    Product
        .find({title : {$regex : search}})
        .then(products=>{
            products.forEach(item=>{
                productsIds.push(item._id)
            })
            if(productsIds.length ==0){
                const error = new Error('you do not have any prodcut');
                error.statusCode =401;
                throw error
            }
            return productsIds
        })
        .then(allProducts=>{
            
            if(!req.userId  && !req.adminId){
                const error = new Error('you are not authenticated');
                error.statusCode =401;
                throw error
            }
            if(req.adminId){
                Admin
                .findById(req.adminId)
                .select("products ")
                .populate("products.items.productId")
                .then(products=>{
                    
                    productsIds.forEach(itemId=>{
                        products.products.items.forEach(item=>{                     
                            console.log(item);
                            if(item.productId._id.toString() === itemId.toString()){
                                const productInfo = {
                                    _id : item.productId._id,
                                    title : item.productId.title,
                                    shape : item.productId.shape,
                                    quantity : item.productId.quantity,
                                    factory : item.productId.factory,
                                    // price : item.productId.price,
                                    salePrice : item.productId.salePrice,
                                    titer : item.productId.titer
                                    // expirationDate : item.expirationDate.getDay()+'-'+item.expirationDate.getMonth()+'-'+item.expirationDate.getFullYear()
                                }
                                finalProducts.push(productInfo)
                            }
                        })
                    })
                    res.status(201).json({products:finalProducts})
                })
            }
            if(req.userId){
                Admin
                .findOne({'users.userInformation.userId':req.userId})
                .select("products -_id")
                .populate("products.items.productId")
                .then(products=>{
                    productsIds.forEach(itemId=>{
                        products.products.items.forEach(item=>{                     
                            if(item.productId._id.toString() === itemId.toString()){
                                const productInfo = {
                                    title : item.productId.title,
                                    shape : item.productId.shape,
                                    quantity : item.productId.quantity,
                                    factory : item.productId.factory,
                                    price : item.productId.price,
                                    salePrice : item.productId.salePrice,
                                    titer : item.productId.titer,
                                    expirationDate : item.expirationDate
                                }
                                finalProducts.push(productInfo)
                            }
                        })
                    })
                    res.status(201).json({products:finalProducts})
                })
            }
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode =500
            };
            next(err)
        })
};