// Set up server
var express    = require('express');
var app        = express();
var ejs        = require('ejs');
var db         = require('./db.js');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Listen on port
app.listen(3000);
console.log('Server running');

// Set up routes
app.get('/', function(req, res) {
	db.query("SELECT * FROM posts;", function(err, dbRes) {
		if(!err) {
			res.render('posts/index', { posts: dbRes.rows });
		}
	});
});

app.get('/posts', function(req, res) {
	db.query("SELECT * FROM posts;", function(err, dbRes) {
		if(!err) {
			res.render('posts/index', { posts: dbRes.rows });
		}
	});
});

app.get('/posts/new', function(req, res) {
	res.render('posts/new');
});

app.get('/posts/:id', function(req, res)
 {
	db.query("SELECT * FROM posts WHERE id = $1", [req.params.id], function(err, dbRes) {
		if(!err) {
			res.render('posts/show', { post: dbRes.rows[0] });
		}
	});
});

app.post('/posts', function(req, res) {
	db.query("INSERT INTO posts (name, entry) VALUES ($1, $2)", [req.body.name, req.body.entry], function(err, dbRes) {
		if(!err) {
			res.redirect('/posts');
		}
	});
});

app.get('/posts/:id/edit', function(req, res) {
	db.query("SELECT * FROM posts WHERE id = $1", [req.params.id], function(err, dbRes) {
		if (!err) {
			res.render('posts/edit', { post: dbRes.rows[0] });
		}
	});
});

app.patch('/posts/:id', function(req, res) {
	db.query("UPDATE posts SET name = $1, entry = $2 WHERE id = $3", [req.body.name, req.body.entry, req.params.id], function(err, dbRes) {
		if (!err) {
			res.redirect('/posts/' + req.params.id);
		}
	});
});

app.delete('/posts/:id', function(req, res) {
	db.query("DELETE FROM posts WHERE id = $1", [req.params.id], function(err, dbRes) {
		if (!err) {
			res.redirect('/posts');
		}
	});
});