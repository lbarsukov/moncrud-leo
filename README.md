# moncrud-leo
Mongoose Crud engine for MongoDB and Express on Node.js applications.

# moncrud-leo
## using MongoDB with Mongoose and Express

moncrud-leo package helps creating a model with <b>Ajax Create, Read, Update, Delete</b> structure.
Because in many scenarios, I needed same types of AJAX calls to manipulate and retrieve data,
and I got tired of writing tons of code for it, I have descieded to credate a package for it.

It takes care of creating the model, creating all standard data calls, feeding data to DataTables 
with server-side search, sorting and pagination, and, of course, custom actions.

It is very easy to implement and set up this engine!

<style>
	tag{
		padding:2px;
		font-size:10px;
		/*border:solid 1px rgba(150,150,150,0.3);*/
		background:rgba(50,50,50,0.3);
		color:#888;
		border-radius:6px;		
	}
</style>
<tags>
	 <i>tags</i><br />
	 <tag>MongoDB</tag>
	 <tag>Mongoose</tag>
	 <tag>Express</tag>
	 <tag>Crud</tag>
	 <tag>Create</tag>
	 <tag>Update</tag>
	 <tag>Delete</tag>
	 <tag>Read</tag>
	 <tag>DataTables</tag>
	 <tag>Ajax Search</tag>
	 <tag>Sort</tag>
</tags>


### Basics
#### Initialize moncrud-leo
```js
var mc = require('moncrud-leo');

mc.init(app, {
	apidomain: 'api',
	connection: 'mongodb://localhost/collection'
}, function(data, next){
	var hasAccess = true;
	next(hasAccess); // true/false return

}); 
```

#### More Options and Details
```js
var mc = require('moncrud-leo');
// this depends on express, give the initializer the [app] element
mc.init(app, {
	//settings
	// more details will be available later
	apidomain: 'api',
	connection: 'mongodb://localhost/collection'
}, function(data, next){
	var hasAccess = true;
	//authenticate	
	/*
	 * data gives you details about the request,
	 */
	next(hasAccess); // true/false return 
	// this will return a response to the query based on a boolean.
	// if user is qualified after this test, the query is executed.
	// otherwise client get's an error response.
}); 
```

## Using moncrud

```js
// require moncrud
var mc = require('moncrud-leo');
// create a model
var users = mc.model('users', {
	firstname: String,
	lastname: String,
	email: String,
	active: Boolean,
	username: String,
	password: String,
	roles: ['basic'],
	friends: [{ 
		type: mc.ObjectId,
		ref: 'users'		
	}]
	// etc. Use the standard model parameters you would use for Mongoose	
});
// After the model is created, you can initate CRUD
// basic CRUD initializer:
users.crud();
// users.crud() function initiates HTTP\post calls: '/api/users/' [find, find-one, add, update, remove]
// you can also customoze the controller
users.crud({
	populate: {
		'get': ['friends'],
		'get-all': []				
	},
	custom: {
		'add-friend':function(req,res,model){
			// execute you standard calls here for a custom controller			
		}		
	}
		
});
```
## This produces URL's to work with the data
 1. /api/users/find-one
 *  /api/users/find
 *  /api/users/add
 *  /api/users/update
 *  /api/users/remove
 
 
 All methods are 'post' methods, because they can all send data
 to use 'find-one', you feed parameters, such as '_id' as an AJAX data request
  jQuery action looks like this:
  
```js 
$.post('/api/users/find-one', { _id: 's98d7fs9d87f7d89d87fd8d8' }, function(data){
	// data response comes here //
});
```
This method becomes the the one you can use for any method.
Of course, if you are adding the data, you would need to specify all the properties.

<br/>
## Implementing DataTables AJAX request, pagination
#### Feature is emplemented at root level, off by default
The DataTables client-side initialization will work the same
way you would normally do it. Please look at this example.
```html
<!--HTML DataTables Table-->
<table class='demo-table'>
	<thead>
		<tr>			
			<tr>First Name</tr>  
			<tr>Last Name</tr>   
			<tr>Email</tr>   
			<tr>Date Created</tr>   
			<tr>Date Updated</tr>
		</tr>		
	</thead>	
</table>
```

### Client-side JavaScript
You must include jquery.js, datatables.js
please go to [https://www.datatables.net/examples/data_sources/server_side.html](https://www.datatables.net/examples/data_sources/server_side.html) for more details.

The example on the provided link is focusing on php, so it's not very relevent. This
controller sends data as objects, not arrays; thus the "columns" element will be required. 
```js
$(document).ready(function () {
	$(".demo-table").DataTable({
		processing: true, 
		serverSide: true, 
		// notice that the request url is set to [model]/dt
		// /dt is an internal DataTables action which will automatically take care of search
		// and sort of data coming into DataTables
		ajax: { url : '/api/users/dt', type: 'post' }, 
		columns: [
			{ data: 'firstname' }, 
			{ data: 'lastname' },
			{ data: 'email' },
			{ data: 'dateCreated' },
			{ data: 'dateUpdated' }
		]
	});
});
```



```js
// Server-side script
// this initates a model, just like you see above
mc.model('users', {
	// this should be structured just like a standard 
	// Mongoose model. 
	firstname: String,
	lastname: String,
	email: String,
	password: String,
	// reference records
	roles: [{ type: mc.ObjectId, ref: 'roles' }],
	friends: [{ type: mc.ObjectId, ref: 'users' }]
}).crud({
	custom: {		
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
			sort: {
				// to make sure sorting is done correctly for dates
				dateCreated: -1, 
				dateUpdated: -1
			},			
		}
	}
});
```


### More information is coming soon!
