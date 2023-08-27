const express = require('express');
const app =express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cron = require('node-cron')

const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const extraCostsRoutes = require('./routes/extraCosts');
const errorController = require('./controller/error');
const authRoutes = require('./routes/auth');
const invoiceRoutes = require('./routes/invoice');

const Admin = require('./models/admin')
const Purchase = require('./models/purchase')

app.use(bodyParser.json());

const MONGODB_URI= 'mongodb://127.0.0.1:27017/pharmacy';


app.use((req, res,next)=>{        // to make the site work on another server      (((  fix --CORS-- Error  )))
    res.setHeader('Access-Control-Allow-Origin',"*")        // to make it work in all domain
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE')   // to make the methods work the other domain
    res.setHeader('Access-Control-Allow-Headers','Content-Type , Authorization')    // we need Authorization for token
    next();
})

cron.schedule('0 0 1 * *',()=>{
    Admin
        .find()
        .then(admins=>{
            if(admins.length === 0){
                return
            }
            admins.forEach(admin=>{
                const userList = admin.users.userInformation
                if(userList.length > 0){
                    userList.forEach(item=>{
                        const userId = item.userId;
                        const salary = item.salary;
                        const purchase = new Purchase({
                            userId:userId,
                            price:salary,
                            adminId:admin._id
                        })
                        return purchase.save()
                    })
                }
                return
            })
            return
        })
        .catch(err=>{
            console.log(err);
        });
})

app.use('/admin',adminRoutes)
app.use('/user',userRoutes)
app.use('/product',productRoutes)
app.use('/extracosts',extraCostsRoutes)
app.use('/auth',authRoutes)
app.use('/invoice',invoiceRoutes)
app.use('/',errorController.getError)

app.use((error,req,res,next)=>{
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({message : message})
});

mongoose.connect(MONGODB_URI)
    .then(()=>{
        app.listen(3000)
    })
    .catch(err=>{
        console.log(err);
    });