"use strict";

const ApiGateway = require("moleculer-web");


module.exports = {
	name: "api",
	mixins: [ ApiGateway],

	settings: {
		port: process.env.PORT || 9000,

        cors: {
            // Configures the Access-Control-Allow-Origin CORS header.
            origin: "*",
            // Configures the Access-Control-Allow-Methods CORS header.
            methods: ["GET", "PATCH", "OPTIONS", "POST", "PUT", "DELETE"],
            // Configures the Access-Control-Allow-Headers CORS header.
            allowedHeaders: ["Content-Type"],
            // Configures the Access-Control-Expose-Headers CORS header.
            exposedHeaders: [],
            // Configures the Access-Control-Allow-Credentials CORS header.
            credentials: false,
            // Configures the Access-Control-Max-Age CORS header.
            maxAge: 3600
        },

		routes: [

			{
				path: "/status/",
				whitelist: [
					// Access to any actions in all services
					"*"
				],
				aliases: {
					"GET server": "application.configuration",
					"GET health": "application.health",
					"GET database": "application.database",
					"GET reset": "application.reset"
				}
			},
			{
				//Allowing to request with json body on the path
				bodyParsers: {
	                json: true,
	            },

				path: "/api/le100/",
				whitelist: [
					// Access to any actions in all services
					"*"
				],
				
				//Methods
				aliases: {
					//USER
						//User creation service
						//Get all users service
						//Get user by mail service
						//User edition service
						"POST user": "users.create",
						"GET user": "users.getAll",
						"GET user/:email": "users.get",
						"PATCH user/:email": "users.edit",

					//USER
						//User creation service
						//Get all users service
						//Get user by mail service
						//User edition service
						"POST channel": "channels.create",
						"GET channel": "channels.getAll",
						"GET channel/:email": "channels.get",
						"PATCH channel/:email": "channels.edit",

					//
					//Message
						//Message creation service
						//Get all messages service
						//Get message by id service
						"POST message": "message.create",						
						"GET message": "message.getAll",						
						"GET message/:id_message": "message.get",


						
				}
			}, 
			{
				//Allowing to request with json body on the path
				bodyParsers: {
	                json: true,
	            },
				path: "/client/",
				whitelist: [
					// Access to any actions in all services
					"*"
				],
				aliases: {
					//	Example project
				}
			}
		]

	}
};
