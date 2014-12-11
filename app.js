// Set up server
var express    = require('express');
var app        = express();
var ejs        = require('ejs');
var db         = require('./db.js');
var bodyParser = require('body-parser'),
cookieParser  = require('cookie-parser'),
session       = require('express-session');
var methodOverride = require('method-override');
var path       = require('path'),
LocalStrategy	 = require('passport-local').Strategy,
passport     	 = require('passport');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(methodOverride('_method'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.query("SELECT * FROM users WHERE id = $1", [id], function (err, user) {
    done(err, user);
  });
});

var localStrategy = new LocalStrategy(
  function(username, password, done) {
  	db.query("SELECT * FROM users WHERE username = $1", [username], function(err, dbRes) {
        var user = dbRes.rows[0];
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
  }
)

passport.use(localStrategy);

app.use(passport.initialize());
app.use(passport.session());

// Listen on port
app.listen(3000);
console.log('Server running');

// Set up routes
app.get('/', function(req, res) {
	db.query("SELECT * FROM posts;", function(err, dbRes) {
		if(!err) {
			var user = req.user;
			res.render('posts/index', { posts: dbRes.rows, user: user });
		}
	});
});

app.get('/login', function(req, res) {
	var user = req.user;
	res.render('login', {user : user});
});

app.post('/login', passport.authenticate('local', 
  {failureRedirect: '/login'}), function(req, res) {
    res.redirect('/');
});

app.get('/profile', function(req, res) {
	var user = req.user
	// Debugging
	console.log('-----------------------------------------');
	console.log(user);
	console.log('-----------------------------------------');
	// Debug
	res.render('profile', {user: user});
});

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/')
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
	db.query("INSERT INTO posts (name, entry, avatar) VALUES ($1, $2, $3)", [req.body.name, req.body.entry, req.body.avatar], function(err, dbRes) {
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
	db.query("UPDATE posts SET name = $1, entry = $2, avatar = $3 WHERE id = $4", [req.body.name, req.body.entry, req.body.avatar, req.params.id], function(err, dbRes) {
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
