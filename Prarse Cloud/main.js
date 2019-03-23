Parse.Cloud.define("getUsers", function (request, response) {
    let isCommitteeMember = request.user.get("isCommitteeMember");
    if (!isCommitteeMember)
        response.success("not allowed for non admin");

    let committeeId = request.user.get("committeId");
    const query = new Parse.Query("User");
    query.equalTo("committeId", committeeId);
    query.equalTo("isActive", true);

    query.find({
        useMasterKey: true
    }).then(function (results) {
        response.success(results);
    }, function (error) {
        response.error(error);
    });
});



Parse.Cloud.define("updateUser", function (request, response) {
    let isCommitteeMember = request.user.get("isCommitteeMember");
    if (!isCommitteeMember)
        response.success("not allowed for non admin");

    // const ParseUser = Parse.Object.extend('User');
    // const query = new Parse.Query(ParseUser);

    // query.get(request.params.id, { useMasterKey: true }).then((parseUser) => {

    const query = new Parse.Query('User');
    query.equalTo("objectId", request.params.id);
    query.find({
        useMasterKey: true
    }).then(function (results) {
        query.first(null, {
            useMasterKey: true
        }).then(function (parseUser) {
            if (request.params.messages != null) {
                parseUser.set('messagesRead', messages);
            }

            if (request.params.email != null) {
                parseUser.set('email', request.params.email);
            }

            if (request.params.name != null) {
                parseUser.set('name', request.params.name);
                parseUser.set('apartment', request.params.apt);
            }

            if (request.params.username != null) {
                parseUser.set('username', request.params.username);
            }

            if (request.params.password != null) {
                parseUser.set('password', request.params.password);
            }

            if (request.params.isCommitteeMember != null) {
                parseUser.set('isCommitteeMember', request.params.isCommitteeMember);
            }

            if (request.params.isActive != null) {
                parseUser.set('isActive', request.params.isActive);
            }

            // Saves the user with the updated data
            parseUser.save(null, {
                useMasterKey: true
            }).then((results) => {
                response.success(results);
            }, function (error) {
                response.error(error);
            });
        }, function (error) {
            response.error(error);
        });
    }), (error) => {
        response.error(error);
    };
});