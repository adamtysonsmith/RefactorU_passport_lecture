// this is how we create functions that accept callbacks
var getMyName = function(callback) {
    
    mongoose.find({name: 'Billy'}, function(err, user){
        // You can call the function reference param, and pass values
        callback(user.name);
    });
    
}

// Now our callback is going to log the user.name
getMyName(function(userName){
    console.log(userName);
});