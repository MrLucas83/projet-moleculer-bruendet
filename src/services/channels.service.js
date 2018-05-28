"use strict";

const Database = require("../adapters/Database");
const Models = require("../models");
const { MoleculerError } = require("moleculer").Errors;

module.exports = {
	name: "channels",

	settings: {
 		state: {

 		}
	},

	actions: {

		//	call "channels.create" --email "e-mail" --firstname "First Name"
		create: {
			params: {
				email: "string",
				firstname: "string",
				
			},
			handler(ctx) {
				var channel = new Models.Channel(ctx.params).create();
				console.log("channels - create - ", channel);
				if (channel) {
					return Database()
						.then((db) => {
							var allchannels = db.get("channels");

							if(allchannels.find({ "email": channel.email }).value()) {
								throw new MoleculerError("channels", 409, "ERR_CRITICAL", { code: 409, message: "channel already exists."} )
							}
							return allchannels
								.push(channel)
								.write()
								.then(() => {
									return channel;
								})
								.catch(() => {
									throw new MoleculerError("channels", 500, "ERR_CRITICAL", { code: 500, message: "Critical error." } )
								});
					});
				} else {
					throw new MoleculerError("channels", 417, "ERR_CRITICAL", { code: 417, message: "channel is not valid." } )
				}
			}
		},

		//	call "channels.getAll"
		getAll: {
			params: {

			},
			handler(ctx) {
				return Database()
					.then((db) => {
						return db.get("channels").value();
					});
			}
		},


		//	call "channels.get" --email "e-mail"
		get: {
			params: {
				email: "string"
			},
			handler(ctx) {
				return ctx.call("channels.verify", { email: ctx.params.email })
				.then((exists) => {
					if (exists) {
						return Database()
							.then((db) => {
								var channel = db.get("channels").find({ email: ctx.params.email }).value();
								return channel;
							})
							.catch(() => {
								throw new MoleculerError("channels", 500, "ERR_CRITICAL", { code: 500, message: "Critical error." } )
							});
					} else {
						throw new MoleculerError("channels", 404, "ERR_CRITICAL", { code: 404, message: "channel doesn't exist." } )
					}
				})
			}
		},

		//	call "channels.verify" --email "e-mail"
		verify: {
			params: {
				email: "string"
			},
			handler(ctx) {
				return Database()
					.then((db) => {
						var value = db.get("channels")
										.filter({ email: ctx.params.email })
										.value();
						return value.length > 0 ? true : false;
					})
			}
		},

		//	call "channels.edit" --email "e-mail" --firstname "First Name"
		edit: {
			params: {
				email: "string",
				firstname: "string"
			},
			handler(ctx) {
				return ctx.call("channels.get", { email: ctx.params.email })
						.then((db_channel) => {
							return Database()
								.then((db) => {
									var allchannels = db.get("channels");
									if(!allchannels.find( { email: ctx.params.email }).value()){
										throw new MoleculerError("channels", 404, "ERR_CRITICAL", { code: 404, message: "channel doesn't exist." } );
									}
									//
									var channel = new Models.Channel(db_channel).create();
									channel.firstname = ctx.params.firstname || db_channel.firstname;
									channel.channel = ctx.params.channel || db_channel.channel;
									//
									return allchannels
										.find({ email: ctx.params.email })
										.assign(channel)
										.write()
										.then(() => {
											return channel.email;
										})
										.catch(() => {
											throw new MoleculerError("channels", 500, "ERR_CRITICAL", { code: 500, message: "Critical Error." } )
										});
								})
						})
			}
		}



	}
};
