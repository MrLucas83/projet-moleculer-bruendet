"use strict";

const Database = require("../adapters/Database");
const Models = require("../models");
const { MoleculerError } = require("moleculer").Errors;

module.exports = {
	name: "message",

	settings: {
 		state: {

 		}
	},

	actions: {

		//	call "message.create" --message "Messages2" --firstname "First Name2"
		create: {
			params: {
				message: "string",
				firstname: "string"
			},
			handler(ctx) {
				var mess = new Models.Message(ctx.params).create();
				console.log("message - create - ", mess);
				if (mess) {
					return Database()
						.then((db) => {
							var allMess = db.get("message");

							return allMess
								.push(mess)
								.write()
								.then(() => {
									return mess;
								})
								.catch(() => {
									throw new MoleculerError("message", 500, "ERR_CRITICAL", { code: 500, message: "Critical error." } )
								});
					});
				} else {
					throw new MoleculerError("message", 417, "ERR_CRITICAL", { code: 417, message: "message is not valid." } )
				}
			}
		},

		//	call "message.getAll"
		getAll: {
			params: {

			},
			handler(ctx) {
				return Database()
					.then((db) => {
						return db.get("message").value();
					});
			}
		},


		//	call "message.get" --id_message "c44713ef-f06e-4973-be94-98a3c8b2f795"
		get: {
			params: {
				id_message: "string"
			},
			handler(ctx) {
				return ctx.call("message.verify", { id_message: ctx.params.id_message })
				.then((exists) => {
					console.log("exists - create - ", exists);
					if (exists) {
						return Database()
							.then((db) => {
								var mess = db.get("message").find({ id: ctx.params.id_message }).value();
								return mess;
							})
							.catch(() => {
								throw new MoleculerError("message", 500, "ERR_CRITICAL", { code: 500, message: "Critical error." } )
							});
					} else {
						throw new MoleculerError("message", 404, "ERR_CRITICAL", { code: 404, message: "message doesn't exist." } )
					}
				})
			}
		},


		//	call "message.verify" --id_message "c44713ef-f06e-4973-be94-98a3c8b2f795"
		verify: {
			params: {
				id_message: "string"
			},
			handler(ctx) {
				return Database()
					.then((db) => {
						var value = db.get("message")
										.filter({ id: ctx.params.id_message })
										.value();
						return value.length > 0 ? true : false;
					})
			}
		},

		//	call "message.edit" --id_message "c44713ef-f06e-4973-be94-98a3c8b2f795" --firstname "First Name" --message "Messages"
		edit: {
			params: {
				id_message: "string",
				firstname: "string",
				message: "string"
			},
			handler(ctx) {
				return ctx.call("message.get", { id_message: ctx.params.id_message })
						.then((db_message) => {
							return Database()
								.then((db) => {
									var allMess = db.get("message");
									if(!allMess.find( { id: ctx.params.id_message }).value()){
										throw new MoleculerError("message", 404, "ERR_CRITICAL", { code: 404, message: "mess doesn't exist." } );
									}
									//
									var mess = new Models.Message(db_message).create();
									mess.message = ctx.params.message || db_message.message;
									mess.firstname = ctx.params.firstname || db_message.firstname;
									//
									return allMess
										.find({ id: ctx.params.id_message })
										.assign(mess)
										.write()
										.then(() => {
											return mess.message;
										})
										.catch(() => {
											throw new MoleculerError("message", 500, "ERR_CRITICAL", { code: 500, message: "Critical Error." } )
										});
								})
						})
			}
		}



	}
};
