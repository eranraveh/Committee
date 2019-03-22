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