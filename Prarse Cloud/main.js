Parse.Cloud.define("getUsers", function (request, response) {
    let isCommitteeMember = request.user.get("isCommitteeMember");
    if (!isCommitteeMember)
        response.error("not allowed for non admin");

    let committeeId = request.user.get("committeId");

    var query = new Parse.Query(ParseUser);
    query.equalTo("committeId", committeeId);
    query.find({useMasterKey:true}).then(function (results) {
        response.success(results);
    }, function (error) {
        response.error("user with emails lookup failed");
    });
});