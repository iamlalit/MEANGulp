var UsersDAO = require('../users').UsersDAO
  , SessionsDAO = require('../sessions').SessionsDAO
  , https = require('https');

/* The SessionHandler must be constructed with a connected db */
function SessionHandler (db) {
    "use strict";

    var users = new UsersDAO(db);
    var sessions = new SessionsDAO(db);

    this.isLoggedInMiddleware = function(req, res, next) {
        var session_id = req.cookies.session;
        sessions.getUsername(session_id, function(err, username) {
            "use strict";

            if (!err && username) {
                req.username = username;
            }
            return next();
        });
    }

    this.displayLoginPage = function(req, res, next) {
        "use strict";

        //Header for login page
        var headerMenu = { '/': 'Home', '/signup': 'Not a member? signup' };
        
        return res.render("login", {
            username:"", 
            password:"", 
            login_error:"",
            header: headerMenu
        })
    }

    this.handleLoginRequest = function(req, res, next) {
        "use strict";

        var username = req.body.username;
        var password = req.body.password;

        console.log("user submitted username: " + username + " pass: " + password);

        users.validateLogin(username, password, function(err, user) {
            "use strict";
            console.log(err);
            if (err) {
                if (err.no_such_user) {
                    return res.render("login", {username:username, password:"", login_error:"No such user"});
                }
                else if (err.invalid_password) {
                    return res.render("login", {username:username, password:"", login_error:"Invalid password"});
                }
                else {
                    // Some other kind of error
                    return next(err);
                }
            }

            sessions.startSession(user['_id'], function(err, session_id) {
                "use strict";

                if (err) return next(err);

                res.cookie('session', session_id);
                return res.redirect('/');
            });
        });
    }

    this.displayLogoutPage = function(req, res, next) {
        "use strict";

        var session_id = req.cookies.session;
        sessions.endSession(session_id, function (err) {
            "use strict";

            // Even if the user wasn't logged in, redirect to home
            res.cookie('session', '');
            return res.redirect('/');
        });
    }

    this.displaySignupPage =  function(req, res, next) {
        "use strict";
        var headerMenu = { '/': 'Home', '/login': 'Login' };

        res.render("signup", {username:"", password:"",
                            password_error:"",
                            email:"", username_error:"", email_error:"",
                            verify_error :"",
                            captch_error : "",
                            header: headerMenu});
    }

    this.displayPasswordRecoveryPage = function(req, res, next) {
        "use strict";
        var headerMenu = { '/': 'Home', '/login': 'Login' };

        res.render("passwordRecovery", {
                    header: headerMenu});
    }

    function validateSignup(username, password, verify, email, errors) {
        "use strict";
        var USER_RE = /^[a-zA-Z0-9_-]{3,20}$/;
        var PASS_RE = /^.{3,20}$/;
        var EMAIL_RE = /^[\S]+@[\S]+\.[\S]+$/;

        errors['username_error'] = "";
        errors['password_error'] = "";
        errors['verify_error'] = "";
        errors['email_error'] = "";

        if (!USER_RE.test(username)) {
            errors['username_error'] = "invalid username. try just letters and numbers";
            return false;
        }
        if (!PASS_RE.test(password)) {
            errors['password_error'] = "invalid password.";
            return false;
        }
        if (password != verify) {
            errors['verify_error'] = "password must match";
            return false;
        }
        if (email != "") {
            if (!EMAIL_RE.test(email)) {
                errors['email_error'] = "invalid email address";
                return false;
            }
        }
        return true;
    }
    var SECRET = "6LdXAgETAAAAACfNJyKnolwkgD1ZeyrB3gg9oeSW";
    var key = '';
    function verifyRecaptcha(key, callback) {
        https.get("https://www.google.com/recaptcha/api/siteverify?secret=" + SECRET + "&response=" + key, function(res) {
            var data = "";
            res.on('data', function (chunk) {
                data += chunk.toString();
            });
            res.on('end', function() {
                try {
                        var parsedData = JSON.parse(data);
                        callback(parsedData.success);
                } catch (e) {
                        callback(false);
                }
            });
        });
    }


    this.handleSignup = function(req, res, next) {
        "use strict";

        var email = req.body.email
        var username = req.body.username
        var password = req.body.password
        var verify = req.body.verify
        var captchaResponse = req.body["g-recaptcha-response"];
        var response = false;        
        // set these up in case we have an error case
        var errors = {'username': username, 'email': email}

        if (validateSignup(username, password, verify, email, errors)) {
            verifyRecaptcha(captchaResponse, function(success) {
                if (success) {
                    users.addUser(username, password, email, function(err, user) {
                        "use strict";

                        if (err) {
                            // this was a duplicate
                            if (err.code == '11000') {
                                errors['username_error'] = "Username already in use. Please choose another";
                                return res.render("signup", errors);
                            }
                            // this was a different error
                            else {
                                return next(err);
                            }
                        }

                        sessions.startSession(user['_id'], function(err, session_id) {
                            "use strict";
                            console.log("here");
                            if (err) return next(err);

                            res.cookie('session', session_id);
                            return res.redirect('/');
                        });
                    });
                    

                }else{
                    var headerMenu = { '/': 'Home', '/login': 'Login' };
                    return res.render("signup", {captch_error:"Please check the checkbox",
                                                header: headerMenu,
                                                'username': username, 'email': email  });   
                }
            });
        }
        else {
            console.log("user did not validate");
            return res.render("signup", errors);
        }
    }
    


    this.displayWelcomePage = function(req, res, next) {
        "use strict";

        if (!req.username) {
            console.log("welcome: can't identify user...redirecting to signup");
            return res.redirect("/signup");
        }
        console.log('here')
        return res.render("blog_template", {'username':req.username})
    }
}

module.exports = SessionHandler;
