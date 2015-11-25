var mongoose = require('mongoose');
var moment = require('moment');
var ObjectId = mongoose.Schema.Types.ObjectId;
var App = global.App;

module.exports = {
	init: function (app, settings, authenticate) {
		
		if (settings.connection != null)
			mongoose.connect(settings.connection);
		
		global.App = app;
		global.App.mongocrud = {};
		
		global.App.mongocrud.domain = settings.apidomain == null ? 'api' : settings.apidomain;
		// Authenticate has {role: role, call:  } (get,get-all,add,update,remove)
		authenticate = authenticate == null ? function (a, c) { c(true); } : authenticate;
		global.App.authenticate = authenticate;
		App = global.App;
	},
	ObjectId: ObjectId,
	clean: function (obj) {
		var newobj = {};
		for (var param in obj) {
			if (param.indexOf('_') != 0) {
				newobj[param] = obj[param];
			}
		}
		return newobj;
	},
	model: function (name, model) {
		if (App == null) {
			throw console.error('Cannot register model, please initiate moncrud first.');
			return;
		}
		if (model == null) return App.mongocrud[name];
		
		model.dateCreated = Date;
		model.dateUpdated = Date;
		model.createdByUser = Object;
		model.modifiedByUser = Object;
		model.active = Boolean;
		var _model = mongoose.model(name, mongoose.Schema(model));;
		
		App.mongocrud[name] = {
			model: _model,
			new: function (data, req) {
				var req = req == null ? { body: {} } : req,
					body = req.body;
				var _data = {
					createdByUser : req.user,
					modifiedByUser: req.user,
					dateCreated   : new Date(),
					dateUpdated   : new Date(),
					active        : body.active == null ? true : body.active
				};
				for (var param in data) {
					if (param.indexOf("_") != 0) {
						_data[param] = data[param];
					}
				}
				return new _model(_data);
			},            
			push: function (array, relation, callback) {
				var relation = relation,
					array = array,
					callback = callback;
				var model = relation.model == null ? _model:relation.model;
				
				relation.data.save(function (err, transaction) {
					if (err) return callback(err, null);
					var pushdata = { $push: {} };
					pushdata.$push[array] = transaction._id;
					
					model.update({ _id: relation._id }, pushdata, function (err, data) {
						if (err) return callback(err, null);
						callback(null, data);
					});
				});
			}

		}
		
		
		return {
			crud: function (crud) {
				crud = crud == null ? {}                   : crud;
				crud.url = crud.url == null ? "/" + name   : crud.url;
				crud.role = crud.role == null ? 'none'     : crud.role;
				crud.exclude = crud.exclude == null ? []   : crud.exclude;
				crud.populate = crud.populate == null ? {} : crud.populate;
				crud.custom = crud.custom == null ? {}     : crud.custom;
				crud.features = crud.features == null ? {} : crud.features;
				module.exports.crud(_model, crud);
			},
			model: _model,
			name: name
		};
	},
	error: function (res, err, data) {
		res.status(500);
		res.end(JSON.stringify({ error: err, data: data }))
	},    
	crud: function (Model, crud) {
		var model = Model;
		var modelBase = module.exports.model(Model.modelName);
		var error = module.exports.error;
		
		crud.exclude = crud.exclude == null ? [] : crud.exclude;
		crud.populate = crud.populate == null ? {} : crud.populate;
		crud.url = "/" + App.mongocrud.domain + crud.url;
		
		var validate = function (call, then) {
			call.res.setHeader('Content-Type', 'application/json');
			var then = then;
			call.role = crud.role;
			call.url = crud.url;
			call.model = model;
			
			App.authenticate(call, function (validated) {
				if (validated) {
					
					then(call);
				} else {
					res.end(JSON.stringify({ error: "Authentication Failed", call: url, model: object.name }));
				}
			})
		}
		var populate = function (search, call) {
			var populate = crud.populate[call];
			if (populate == null) populate = [];
			for (var i = 0; i < populate.length; i++) {
				search.populate(populate[i], null, { active: true });
			}
		}
		
		var update = function (req, res, call) {
			validate({ call: 'update', req: req, res: res }, function (params) {
				var model = req.body;
				var _id = model._id;
				delete model._id;
				for (var prop in model) {
					if (prop.indexOf('_') != -1)
						delete model[prop];
				}
				
				model.modifiedByUser = params.user;
				model.dateUpdated = new Date();
				model.active = model.active == null ? true : model.active;
				
				Model.update({ _id: _id }, { $set: model }, function (err, data) {
					if (err) return error(res, err, data);
					res.end(JSON.stringify(data));
				});
			});
		}
		
		if (crud.exclude.indexOf('find-one') == -1)
			App.post(crud.url + '/find-one', function (req, res) {
				var req = req,
					res = res;
				validate({ call: 'find-one', req: req, res: res }, function () {
					params = req.body;
					
					// var hasparams = params.length > 0 | params._id !=null;					
					// if (!hasparams) {						
					// 	return error(res, { error: crud.url + '/find-one requires at least one parameter to match a record' }, params);
					// }
					
					var search = Model.findOne(params);
					populate(search, 'find-one');
					search.exec(function (err, data) {
						if (err) return error(res, err, data);
						res.end(JSON.stringify(data));
					});
				});
			});
		
		if (crud.exclude.indexOf('find') == -1)
			App.post(crud.url + '/find', function (req, res) {
				validate({ call: 'find', req: req, res: res }, function (params) {
					params = req.body;
					params.active = params.active == null ? true:params.active;
					var search = Model.find(params);
					populate(search, 'find');
					search.exec(function (err, data) {
						if (err) return error(res, err, data);
						res.end(JSON.stringify(data));
					});
				});
			});
		
		if (crud.exclude.indexOf('add') == -1)
			App.post(crud.url + '/add', function (req, res) {
				validate({ call: 'add', req: req, res: res }, function (params) {
					var body = JSON.parse(JSON.stringify(req.body));
					var data = {
						createdByUser : params.user,
						modifiedByUser: params.user,
						dateCreated   : new Date(),
						dateUpdated   : new Date(),
						active        : body.active == null ? true : body.active
					};
					
					for (var prop in body) {
						if (prop.indexOf('-') == -1)
							data[prop] = body[prop];
					}
					
					var model = new Model(data);
					
					model.save(function (err, data) {
						if (err) return error(res, err, data);
						res.end(JSON.stringify(data));
					});
				});
			});
		
		if (crud.exclude.indexOf('update') == -1)
			App.post(crud.url + '/update', function (req, res) {
				update(req, res, 'update');
			});
		
		if (crud.exclude.indexOf('remove') == -1)
			App.post(crud.url + '/remove', function (req, res) {
				req.body = {
					_id: req.body._id,
					active: false
				};
				update(req, res, 'remove');
			});
		
		if (crud.features.dataTables) {
			var dtf = crud.features.dataTables;
			
			crud.custom['dt'] = function (req, res, mcd) {
				var model = mcd.model;
				var params = req.body;
				var sa = { $and: [{ active: true }] };
				var cols = params.columns;
				var sparams = params.search.value.split(/\ /ig);
				
				//crud.features.dataTables = crud.features.dataTables == null ? { sort: {} } : crud.features.dataTables;
				
				if (params.search.value != "") {
					for (var p = 0; p < sparams.length; p++) {
						var param = sparams[p];
						var expression = eval("/.*" + param.toLowerCase().replace(/\//ig, '\\\\') + ".*/ig");
						var sp = { $or: [] };
						for (var i = 0; i < cols.length; i++) {
							var compare = {};
							var column = cols[i];
							var key = column.data == 'function' ? column.name : column.data;
							var type = mcd.model.schema.paths[key].instance;
							var obj = column.data == 'function' ? column.name : column.data;
							switch (type) {
								case 'String':
									compare[column.data] = { $regex: expression };
									sp.$or.push(compare);
									break;
								case 'Date':
									var date = new moment(params.search.value);
									date = new Date(date.toString());
									var lt = new Date(date.getTime() + 24 * 60 * 60 * 1000);
									if (date != "Invalid Date") {
										
										compare[obj] = {
											$gte: date,
											$lt: lt
										};
										sp.$or.push(compare);
									}
									break;
							}
						}
						sa.$and.push(sp);
					}
				}
				else sa = {};
				
				
				var m = model.find(sa);
				var sort = {};
				crud.features.dataTables.sort = crud.features.dataTables.sort == null ? {} : crud.features.dataTables.sort;
				for (var r = 0; r < params.order.length; r++) {
					var _sort = params.order[r];
					var column = params.columns[parseInt(_sort.column)];
					var key = column.data == 'function' ? column.name : column.data;
					
					var direction = crud.features.dataTables.sort[key];
					var type = mcd.model.schema.paths[key].instance;
					
					direction = direction == null ? 1 : direction;
					
					
					
					switch (_sort.dir) {
						case "asc":
							if (type == 'Date') {
								sort[key] = direction == 1 ? -1 : 1;
							} else sort[key] = direction == 1 ? 1 : -1;
							break;
						case "desc":
							if (type == 'Date') {
								sort[key] = direction == 1 ? 1 : -1;
							} else sort[key] = direction == 1 ? -1 : 1;
							break;
					}
				}
				m.sort(sort);
				
				
				m.exec(function (err, data) {
					if (err) return error(res, err, data);
					var count = data.length;
					var output = data.slice(parseInt(params.start), parseInt(params.length) + parseInt(params.start));
					
					//customize
					
					
					var final_output = [];
					
					for (var i = 0; i < output.length; i++) {
						var item = JSON.parse(JSON.stringify(output[i]));
						var rawitem = output[i];
						
						if (typeof dtf.customize == 'function') {
							final_output.push(dtf.customize(item));
						} else {
							var _item = {};
							for (var prop in item) {
								var p = rawitem[prop];
								//if (typeof p == 'object') {
								//	p = p.toString().split('T')[0];
								//}
								_item[prop] = p;
							}
							final_output.push(_item);
						}
					}
					
					var _data = {
						draw: params.draw,
						recordsTotal: count,
						recordsFiltered: count,
						data: final_output
					};
					res.json(_data);
				});
			};
		}
		for (var param in crud.custom) {
			if (param.indexOf('_') != 0) {
				var value = crud.custom[param];
				if (typeof value == 'function') {
					var initcall = function (param, value) {
						var param = param,
							value = value;
						App.post(crud.url + '/' + param, function (req, res) {
							var req = req,
								res = res;
							validate({ call: param, req: req, res: res }, function (params) {
								res.json = function (data) {
									res.end(JSON.stringify(data));
								}
								value(req, res, modelBase);
							});
						});
					}
					initcall(param, value);
				}
			}
		}
	},
};