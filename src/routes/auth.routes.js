const express = require('express');
const userModel = require('../models/user.model');
const jwt = require("jsonwebtoken")

const router = express.Router();

/* POST /register req.body = {username,password} */



router.post('/register',async (req,res)=>{
    const {username,password} = req.body

    const isUserAlreadyExists = await userModel.findOne({
        username
    })

    if(isUserAlreadyExists){
        return res.status(409).json({
            message:"username already in use"
        })
    }

    const user = await userModel.create({username,password})

    const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

    res.cookie("chacha",token,{
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    })

    res.status(201).json({
        message:"user registered successfully",
        user
    })
})


router.get('/user',async(req,res)=>{

    const token  = req.cookies.chacha

    if(!token){
        return res.status(401).json({
            message:"unauthorized token not found"
        })
    }

    try{
        const decoded = jwt.verify(token , process.env.JWT_SECRET)
        
        const user = await userModel.findOne({
            _id:decoded.id
        })

        return res.status(200).json({
            message:"user data fetched successfully",
            user
        })
        
    }catch(err){
        res.status(401).json({
            message:"Unauthorized invalid token"
        })
    }
})


router.post('/login',async(req,res)=>{
    const {username,password} = req.body

    const user = await userModel.findOne({username})

    if(!user){
        return res.status(404).json({
            message:"user account not found"
        })
    }

    const isPasswordValid = user.password === password

    if(!isPasswordValid){
        return res.status(401).json({
            message:"Invalid password"
        })
    }

    const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

    res.cookie("chacha",token,{
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    })

    res.status(200).json({
        message:"user logged in successfully",
        user
    })
})

router.get('/logout',(req,res)=>{
    res.clearCookie("chacha")

    res.status(200).json({
        message:"user logged out successfully"
    })
})

module.exports = router;