var User = require('../user');

module.exports = function(req, res, next){
	var uid = req.session.uid;
	console.log("uid: " + uid);
	if (!uid) return next();
	User.get(uid, function(err, user){
		if (err) return next(err);
		req.user = res.locals.user = user;
		next();
	});
};
