const success_function = require("../utils/responsehandler").success_function
const error_function = require("../utils/responsehandler").error_function
const { users } = require('../db/model/user');
const jwt  = require('jsonwebtoken');
const control_data = require('../utils/control-data.json');
const dotenv = require('dotenv');
dotenv.config();

exports.accessControl = async function (access_types,req,res,next) {
    try {

        console.log("access_types : ",access_types)

        if(access_types === '*'){
            next()
        }else{
            const authheader = req.headers["authorization"];
            console.log("authheader : ",authheader)

            if(!authheader){
                let response = error_function({
                    statusCode : 400,
                    message : "Please login to continue"
                })
                res.status(response.statuscode).send(response);
                return;
            }
            let token = authheader.split(' ')[1];
            console.log("token : ",token);

            if(!token || token == null || token == undefined || token == '' || token == 'null' || token == 'undefined'){
                let response = error_function({
                    statusCode : 400,
                    message : "Please login to continue"
                })
                res.status(response.statuscode).send(response);
                return;
            }else{
                jwt.verify(token, process.env.PRIVATE_KEY , async function (err,decoded){
                    if(err){
                        let response = error_function({
                            statusCode : 400,
                            message : "Please login to continue"
                        })
                        res.status(response.statuscode).send(response);
                        return;
                    }else{
                        console.log("decode : ",decoded);

                        let user_id = decoded.user_id;
                        console.log("user_id : ",user_id);

                        // req.params = user_id;
                        // console.log("req.params : ",req.params)

                        let user = await users.findOne({_id : user_id});
                        console.log("user : ",user);

                        let user_type = user.userType;
                        console.log("user_type : ",user_type);

                        let allowed = access_types.split(",").map((obj) => control_data[obj] );
                        console.log("allowed : ",allowed);

                        if(allowed && allowed.includes(user_type)){
                            next()
                        }else{
                            let response = error_function({
                                statusCode : 400,
                                message : "Not allowed to access the route"
                            })
                            res.status(response.statuscode).send(response);
                            return;
                        }
                    }
                })
            }
        }


    } catch (error) {
        console.log("error : ",error);


        let response = error_function({
            statusCode: 400,
            message: "error",
        });

        res.status(response.statuscode).send(response);
        return;
    }
} 