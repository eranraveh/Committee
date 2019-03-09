committeeApp.factory("userSrv", function ($q, $log) {

    var activeUser = null;

    class User {
        constructor(parseUser) {
            this.username = parseUser.get("username");
            this.name = parseUser.get("name");
            this.isCommitteeMember = parseUser.get("isCommitteeMember");
            this.email = parseUser.get("email");
            this.apartment = parseUser.get("apartment");
            this.readMessages = parseUser.get("messagesRead");
            if (this.readMessages === undefined)
                this.readMessages = [];

            this.committeeId = parseUser.get("committeId");
        }
    }

    function login(email, pwd) {
        var async = $q.defer();

        Parse.User.logIn(email, pwd).then((user) => {
            activeUser = new User(user);
            async.resolve(activeUser);
        }).catch((error) => {
            $log.error('Error while logging in user', error);
            async.reject(error);
        });

        return async.promise;
    }

    function isLoggedIn() {
        return activeUser ? true : false;
    }

    function logout() {
        activeUser = null;
    }

    function getActiveUser() {
        return activeUser;
    }

    function getActiveUserCommitteeId() {
        return activeUser.committeeId;
    }

    function addOpenedMessages(messageId) {
        return updateUser(messageId);
    }

    function addOpenedIssues(issueId) {
        return updateUser(issueId);
    }

    function updateUser(messageId = null) {
        var async = $q.defer();

        const currentUser = Parse.User.current();
        if (typeof messageId == 'string' && messageId != "") {
            var messages = getMessages(currentUser);
            messages.push(messageId);
            currentUser.set('messagesRead', messages);
        }
        // Saves the user with the updated data
        currentUser.save().then((response) => {
            console.log('Updated user', response);

            async.resolve(true);
        }).catch((error) => {
            console.error('Error while updating user', error);
            async.reject(error);
        });

        return async.promise;
    }

    function getMessages(currentUser) {
        var messages = currentUser.get("messagesRead");
        if (messages === undefined)
            messages = [];
        return messages;
    }

    function isCommitteeMember() {
        if (activeUser != null)
            return activeUser.isCommitteeMember;
        return false;
    }

    return {
        login: login,
        isLoggedIn: isLoggedIn,
        logout: logout,
        getActiveUser: getActiveUser,
        getActiveUserCommitteeId: getActiveUserCommitteeId,
        addOpenedMessages: addOpenedMessages,
        addOpenedIssues: addOpenedIssues,
        isCommitteeMember: isCommitteeMember
    }

});