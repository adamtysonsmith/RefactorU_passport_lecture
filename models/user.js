var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

/**
 * Create a schema (blueprint) for all users in the database.
 * If you want to collect additional info, add the fields here.
 * We are setting required to true so that if the field is not
 * given, the document is not inserted. Unique will prevent
 * saving if a duplicate entry is found.
 */
var userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

/**
 * This allows us to hook into the pre-save DB flow. Our
 * callback will be called whenever a new user is about to
 * be saved to the database so that we can encrypt the password.
 */

// .pre() means do this callback RIGHT before the save()
userSchema.pre('save', function(next){

  // First, check to see if the password has been modified. If not, just move on.
  // 'this' is referring the current document, mongoose gives us the isModified method
  if(!this.isModified('password')) return next();

  // Store access to "this", which represents the current user document
  var user = this;

  // Generate an encryption "salt." This is a special way of increasing the
  // encryption power by wrapping the given string in a secret string. Something
  // like "secretpasswordsecret" and then encrypting that result.
  bcrypt.genSalt(10, function(err, salt){

    // If there was an error, allow execution to move to the next middleware
    if(err) return next(err);

    // If we are successful, use the salt to run the encryption on the given password
    bcrypt.hash(user.password, salt, function(err, hash){

      // If there was an error, allow execution to move to the next middleware
      if(err) return next(err);

      // If the encryption succeeded, then replace the un-encrypted password
      // in the given document with the newly encrypted one.
      user.password = hash;

      // Allow execution to move to the next middleware
      // This actually performs the save()
      return next();
    });
  });
});


/*
 * Method on the user schema that allows us to hook into the
 * bcrypt system to compare an encrypted password to a given
 * password. This process doesn't involve unencrypting the stored
 * password, but rather encrypts the given one in the same way and
 * compares those values
 */

// We are defining a comparePassword method on the schema.methods which affects all documents in the DB
// Similar to Object.prototype ==> Schema.methods
// candidatePassword is what the user typed in for their password
userSchema.methods.comparePassword = function(candidatePassword, next){
  // Use bcrypt to compare the unencrypted value to the encrypted one in the DB
    
  // this.password refers to the user when we call User.comparePassword() in our controller
    // Users.findOne({whatever}, function(err, docs){
    //    User.comparePassword()
    // });
    
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch){
    // If there was an error, allow execution to move to the next middleware
    if(err) return next(err);

    // If there is no error, move to the next middleware and inform
    // it of the match status (true or false)
    return next(null, isMatch);
  });
}

// Our user model
var User = mongoose.model('user', userSchema);

// Make user model available through exports/require
module.exports = User;