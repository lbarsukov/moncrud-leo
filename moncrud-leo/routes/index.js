var mc = require('../moncrud/moncrud.js');

exports.index = function (req, res) {
	res.render('index', {
		title: 'Express'
	});
};


mc.model('users', {
	firstname: String,
	lastname: String,
	email: String,
	password: String,
	roles: [{ type: mc.ObjectId, ref: 'roles' }],
	friends: [{ type: mc.ObjectId, ref: 'users' }]
}).crud({
	custom: {
		// creates a post-call under /api/users/populate, generates random records based on static list located at the end of this file //
		'populate': function (req, res, user_) {
			var count = demo_collection.length;
			for (var i = 0; i < demo_collection.length; i++) {
				var _user = demo_collection[i];
				var user = user_.new({
					firstname: _user.firstname,
					lastname: _user.lastname,
					email: _user.firstname + '.' + _user.lastname + '@fakmemail.net',								
				});
				user.save(function (err, data) {
					count--;
					if (count <= 1) res.json({ completed: demo_collection.length });
				});
			}
		},
		'add-friend': function (req, res, user) {
			var u = req.body;
			user.model.update({ _id: u._id }, { $push: { friends: u.friend } }, function (err, data) {
				if (err) return mc.error(res, err, data);
				res.json(data);
			});
		}
	},
	populate: {
		'find-one': ['friends'],
	},
	features: {
		dataTables: {
			//sort: {
			//	dateCreated: -1, // to make sure sorting is done correctly for dates
			//	dateUpdated: -1
			//},
			//customize: function (item) {
			//	// this call MUST be syncronous. No intanglement yet supported
			//	var data = {};
			//	for (var prop in item) {
			//		switch (prop) {
			//			case 'dateCreated':
			//			case 'dateUpdated':
			//				data[prop] = "<x style='display:none;'>" + new Date(item[prop]).getTime() + "</x>" + item[prop].toString().split('T')[0];
			//				break;
			//			default:
			//				data[prop] = item[prop];
			//				break;
					
			//		}				
			//	}				
			//	return data;
			//}
		}
	}
});

var demo_collection = [
	{ firstname: "Evan", lastname: "Hawkins" },
	{ firstname: "Velma", lastname: "Christensen" },
	{ firstname: "Pam", lastname: "Matthews" },
	{ firstname: "Mark", lastname: "Harvey" },
	{ firstname: "Jana", lastname: "Thomas" },
	{ firstname: "Angelica", lastname: "Stanley" },
	{ firstname: "Nellie", lastname: "Murray" },
	{ firstname: "Mable", lastname: "Schwartz" },
	{ firstname: "Neal", lastname: "Beck" },
	{ firstname: "Vincent", lastname: "Walsh" },
	{ firstname: "Iris", lastname: "Hale" },
	{ firstname: "Anne", lastname: "Peters" },
	{ firstname: "Chad", lastname: "Flores" },
	{ firstname: "Melissa", lastname: "Saunders" },
	{ firstname: "Ellen", lastname: "Burns" },
	{ firstname: "Kay", lastname: "Daniel" },
	{ firstname: "Roger", lastname: "Vasquez" },
	{ firstname: "Bernice", lastname: "Fleming" },
	{ firstname: "Lamar", lastname: "Mathis" },
	{ firstname: "Jessica", lastname: "Mann" },
	{ firstname: "Darrel", lastname: "Grant" },
	{ firstname: "Mandy", lastname: "Patton" },
	{ firstname: "Carlos", lastname: "Collier" },
	{ firstname: "Myrtle", lastname: "Pearson" },
	{ firstname: "Douglas", lastname: "Fletcher" },
	{ firstname: "Eddie", lastname: "Baldwin" },
	{ firstname: "Sandy", lastname: "Obrien" },
	{ firstname: "Sherry", lastname: "Ford" },
	{ firstname: "Barbara", lastname: "Richards" },
	{ firstname: "Glenn", lastname: "Luna" },
	{ firstname: "Cindy", lastname: "Chavez" },
	{ firstname: "Victoria", lastname: "Webb" },
	{ firstname: "Lionel", lastname: "Garner" },
	{ firstname: "Deanna", lastname: "Fitzgerald" },
	{ firstname: "Jessie", lastname: "Guerrero" },
	{ firstname: "Melvin", lastname: "Goodman" },
	{ firstname: "Cameron", lastname: "Holland" },
	{ firstname: "Lloyd", lastname: "Aguilar" },
	{ firstname: "Casey", lastname: "Palmer" },
	{ firstname: "Drew", lastname: "Wheeler" },
	{ firstname: "Dawn", lastname: "Bradley" },
	{ firstname: "Casey", lastname: "Kelley" },
	{ firstname: "May", lastname: "Graves" },
	{ firstname: "Bryant", lastname: "Huff" },
	{ firstname: "Milton", lastname: "Santos" },
	{ firstname: "Percy", lastname: "Benson" },
	{ firstname: "Arlene", lastname: "Meyer" },
	{ firstname: "Brent", lastname: "Higgins" },
	{ firstname: "Patrick", lastname: "Day" },
	{ firstname: "Dixie", lastname: "Cox" },
	{ firstname: "Nancy", lastname: "Guzman" },
	{ firstname: "Katie", lastname: "Ward" },
	{ firstname: "Joanna", lastname: "Moody" },
	{ firstname: "Amber", lastname: "Dean" },
	{ firstname: "Guillermo", lastname: "Garza" },
	{ firstname: "Alex", lastname: "Payne" },
	{ firstname: "Raquel", lastname: "Horton" },
	{ firstname: "Cody", lastname: "Conner" },
	{ firstname: "Angela", lastname: "Wagner" },
	{ firstname: "Janis", lastname: "Cole" },
	{ firstname: "Ana", lastname: "Pratt" },
	{ firstname: "Billy", lastname: "Johnston" },
	{ firstname: "Manuel", lastname: "Perez" },
	{ firstname: "Matt", lastname: "Cortez" },
	{ firstname: "Francisco", lastname: "Hines" },
	{ firstname: "Kerry", lastname: "Lamb" },
	{ firstname: "Ernesto", lastname: "Bailey" },
	{ firstname: "Marion", lastname: "Mills" },
	{ firstname: "Pedro", lastname: "Ingram" },
	{ firstname: "Dwayne", lastname: "Sharp" },
	{ firstname: "Gregg", lastname: "Floyd" },
	{ firstname: "Larry", lastname: "Buchanan" },
	{ firstname: "Terence", lastname: "Carroll" },
	{ firstname: "Marshall", lastname: "Hammond" },
	{ firstname: "Santiago", lastname: "Mclaughlin" },
	{ firstname: "Roman", lastname: "Valdez" },
	{ firstname: "Hannah", lastname: "Blake" },
	{ firstname: "Kristin", lastname: "Lewis" },
	{ firstname: "Spencer", lastname: "Weaver" },
	{ firstname: "Terrance", lastname: "Evans" },
	{ firstname: "Margie", lastname: "George" },
	{ firstname: "Josephine", lastname: "Hoffman" },
	{ firstname: "Alvin", lastname: "Robbins" },
	{ firstname: "Sheila", lastname: "Schmidt" },
	{ firstname: "Patti", lastname: "Martinez" },
	{ firstname: "Felix", lastname: "Ortega" },
	{ firstname: "Preston", lastname: "Perry" },
	{ firstname: "Al", lastname: "Moreno" },
	{ firstname: "Cornelius", lastname: "Newton" },
	{ firstname: "Alejandro", lastname: "Frazier" },
	{ firstname: "Bertha", lastname: "Houston" },
	{ firstname: "Howard", lastname: "Olson" },
	{ firstname: "Lola", lastname: "Peterson" },
	{ firstname: "Jody", lastname: "Brooks" },
	{ firstname: "Kristine", lastname: "Butler" },
	{ firstname: "Annie", lastname: "Freeman" },
	{ firstname: "Marsha", lastname: "Brady" },
	{ firstname: "Judy", lastname: "Rhodes" },
	{ firstname: "Carlton", lastname: "Farmer" },
	{ firstname: "Agnes", lastname: "Lopez" }
];

