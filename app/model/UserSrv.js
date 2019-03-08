committeeApp.factory("userSrv", function ($q, $log) {

    var activeUser = null;

    class User {
        constructor(parseUser) {
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
        // const User = new Parse.User();
        // const query = new Parse.Query(User);

        // // Finds the user by its ID
        // query.get('hEPjkt4epS').then((user) => {
        //     // Updates the data we want
        //     user.set('username', 'A string');
        //     user.set('email', 'A string');
        //     user.set('name', 'A string');
        //     user.set('apartment', 'A string');
        //     user.set('isCommitteeMember', 'A string');
        //     user.set('committeId', new Parse.Object("Committee"));
        //     user.set('messagesRead', [1, 'a string']);
        //     // Saves the user with the updated data
        //     user.save().then((response) => {
        //         if (typeof document !== 'undefined') document.write(`Updated user: ${JSON.stringify(response)}`);
        //         console.log('Updated user', response);
        //     }).catch((error) => {
        //         if (typeof document !== 'undefined') document.write(`Error while updating user: ${JSON.stringify(error)}`);
        //         console.error('Error while updating user', error);
        //     });
        // });
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
        isCommitteeMember: isCommitteeMember
    }

});