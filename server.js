const Hapi = require("@hapi/hapi")
const Joi = require("joi")
const handlebars = require("handlebars")
const { personDataSchema } = require("./joi-schema.js")
const { v4: uuidv4 } = require('uuid');

const mongo = require("./db");


init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: "localhost"
    })
    
    await server.register(require("@hapi/inert"))
    await server.register(require("@hapi/vision"))
    
    server.route({
        path: "/",
        method: "GET",
        handler: (request, h) => {
           return h.response(h.file("./static/index.html"))
        }
    })
    server.route({
        path: "/person",
        method: "GET",
        handler: (request, h) => {
           
            return h.response({
                name: "data",
                email: "arsalan2018@namal.edu.pk",
                birthday: new Date().toISOString()
            })
                .code(200)
                .header("Content-Type", "application/json")
        }      
    })
    server.route({
        path: "/person",
        method: "POST",
        handler: async (request, h)=>{
            
            const data = request.payload
            const schema = Joi.object().keys({
                name: Joi.string().required(),
                email: Joi.string().email().required(),
                data: Joi.date().iso()
            });
            try {
                const value = await schema.validateAsync(data)
                
                return h.response(value).code(200)  
            } catch (error) {
                console.log("Eror")
                Joi.isError(error)
                return h.response({error}).code(404) 
            }
            
        }
    })


    server.route({
        path: "/api/users/{id?}",
        method: "GET",
        handler: (request, h) => {
        
            const data = (request.query)
            console.log(data)
            if( request.params.id){
                console.log(request.params.id)
            }else{
                console.log("Not")
            }

            return h.response(h.view("main.html", {
                data: request.params, 
                arrays : data.filter
            })).code(200)
        }
    })

    server.route({
        path: "/api/products",
        method: "GET",
        handler: async (request, h) => {
            const data = await mongo.db.collection("products").find().toArray()
            return h.response(data)
        }
    })
    server.route({
        method: "POST",
        path: "/api/products",
        handler: async (request, h) => {
            const schema = Joi.object({
                title: Joi.string().required(),
                description: Joi.string().required()
            })
            try {
                
                await schema.validateAsync(request.payload)
                await mongo.db.collection("products").insertOne(request.payload)
                return h.response("Added")
            } catch (error) {
                return h.response({error})
            }
            
        }
    })
    server.route({
        path: "/api/test",
        method: "POST",
        handler: async (request, h) =>{
            console.log(request.payload)
            try {
                const id = uuidv4()
                var data = request.payload 
                data._id = id 

                await personDataSchema.validateAsync(data)
                await mongo.db.collection("students").insertOne(data)

                console.log("Added to DB")
                return h.response({message: data})

            } catch (error) {
                
                return h.response(error.message)
            }
        }
    })

    server.route({
        path: "/api/test/{firstname}",
        method: "GET",
        handler: async (request, h)=>{
            console.log(request.params)
            const data = await mongo.db.collection("students")
                .find({firstname: new RegExp('^' + request.params.firstname + '$')}).toArray()
            return data
        }
    })

    server.route({
        path: "/api/test",
        method: "GET",
        handler: async (request, h)=>{
            const data = await mongo.db.collection("students").find().toArray()
            return data
        }
    })

    // Render Views
    server.route({
        path: "/api/testing",
        method: "GET",
        handler: async (request, h)=>{
            const data = await mongo.db.collection("students").find().toArray()
            console.log(data)
            return h.response(h.view("students", {data:data}))
        }
    })
    // Setting the template engine with Application
    server.views({
        engines: {html: handlebars},
        relativeTo: __dirname,
        path: "static/"
    })


    await server.start()
    await mongo.init()
    console.log(`Server Started at : ${server.info.uri}`)
}

init()