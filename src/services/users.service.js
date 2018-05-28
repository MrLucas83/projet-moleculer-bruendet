"use strict";

const Database = require("../adapters/Database");
const Models = require("../models");
const { MoleculerError } = require("moleculer").Errors;

module.exports = {
	name: "users",

	settings: {
 		state: {

 		}
	},

	actions: {

		//	call "users.create" --email "e-mail2" --lastname "Last Name2" --firstname "First Name2"
		create: {
			params: {
				email: "string",
				lastname: "string",
				firstname: "string",
				
			},
			handler(ctx) {
				var user = new Models.User(ctx.params).create();
				console.log("users - create - ", user);
				if (user) {
					return Database()
						.then((db) => {
							var allUsers = db.get("users");

							if(allUsers.find({ "email": user.email }).value()) {
								throw new MoleculerError("users", 409, "ERR_CRITICAL", { code: 409, message: "User already exists."} )
							}
							return allUsers
								.push(user)
								.write()
								.then(() => {
									return user;
								})
								.catch(() => {
									throw new MoleculerError("users", 500, "ERR_CRITICAL", { code: 500, message: "Critical error." } )
								});
					});
				} else {
					throw new MoleculerError("users", 417, "ERR_CRITICAL", { code: 417, message: "User is not valid." } )
				}
			}
		},

		//	call "users.getAll"
		getAll: {
			params: {

			},
			handler(ctx) {
				return Database()
					.then((db) => {
						return db.get("users").value();
					});
			}
		},


		//	call "users.get" --email "e-mail"
		get: {
			params: {
				email: "string"
			},
			handler(ctx) {
				return ctx.call("users.verify", { email: ctx.params.email })
				.then((exists) => {
					if (exists) {
						return Database()
							.then((db) => {
								var user = db.get("users").find({ email: ctx.params.email }).value();
								return user;
							})
							.catch(() => {
								throw new MoleculerError("users", 500, "ERR_CRITICAL", { code: 500, message: "Critical error." } )
							});
					} else {
						throw new MoleculerError("users", 404, "ERR_CRITICAL", { code: 404, message: "User doesn't exist." } )
					}
				})
			}
		},

		//	call "users.verify" --email "e-mail"
		verify: {
			params: {
				email: "string"
			},
			handler(ctx) {
				return Database()
					.then((db) => {
						var value = db.get("users")
										.filter({ email: ctx.params.email })
										.value();
						return value.length > 0 ? true : false;
					})
			}
		},

		//	call "users.edit" --email "e-mail" --lastname "Last Name" --firstname "First Name"
		edit: {
			params: {
				email: "string",
				lastname: "string",
				firstname: "string"
			},
			handler(ctx) {
				return ctx.call("users.get", { email: ctx.params.email })
						.then((db_user) => {
							return Database()
								.then((db) => {
									var allUsers = db.get("users");
									if(!allUsers.find( { email: ctx.params.email }).value()){
										throw new MoleculerError("users", 404, "ERR_CRITICAL", { code: 404, message: "User doesn't exist." } );
									}
									//
									var user = new Models.User(db_user).create();
									user.lastname = ctx.params.lastname || db_user.lastname;
									user.firstname = ctx.params.firstname || db_user.firstname;
									user.channel = ctx.params.channel || db_user.channel;
									//
									return allUsers
										.find({ email: ctx.params.email })
										.assign(user)
										.write()
										.then(() => {
											return user.email;
										})
										.catch(() => {
											throw new MoleculerError("users", 500, "ERR_CRITICAL", { code: 500, message: "Critical Error." } )
										});
								})
						})
			}
		}



	}
};
