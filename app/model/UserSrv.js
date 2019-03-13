committeeApp.factory("userSrv", function ($q, $log) {

    var activeUser = null;
    let allUsersNames = [];

    class User {
        constructor(parseUser, isNameResolver = false) {
            this.name = parseUser.get("name");
            this.id = parseUser.id;
            if (isNameResolver)
                return;
            this.username = parseUser.get("username");
            this.isCommitteeMember = parseUser.get("isCommitteeMember");
            this.email = parseUser.get("email");
            this.apartment = parseUser.get("apartment");
            this.readMessages = parseUser.get("messagesRead");
            if (this.readMessages === undefined)
                this.readMessages = [];
            this.parseUser = parseUser;

            this.committeeId = parseUser.get("committeId");
        }
    }

    function login(email, pwd) {
        var async = $q.defer();

        // Parse.User.logIn(email, pwd).then((user) => {
        //     activeUser = new User(user);
        //     LoadUsersNames().then((allUsers) => {
        //         allUsersNames = allUsers;
        //         async.resolve(activeUser);
        //     });
        // }).catch((error) => {
        //     $log.error('Error while logging in user', error);
        //     async.reject(error);
        // });
        Parse.User.logIn(email, pwd).then((user) => {
            if (!user.get("isActive")) {
                async.reject({
                    message: "User not in building. Contact your committee"
                });
            }

            activeUser = new User(user);
            return LoadUsersNames();
        }).catch((error) => {
            $log.error('Error while logging in user', error);
            async.reject(error);
        }).then((allUsers) => {
            allUsersNames = allUsers;
            async.resolve(activeUser);
        });;

        return async.promise;
    }

    function LoadUsersNames(loadOnlyNames = true) {
        var async = $q.defer();

        var promise;
        // const params = {
        //     committeeId: activeUser.committeeId
        // };
        // if (!loadOnlyNames)
        //     promise = Parse.Cloud.run("getUsers", params);
        // else {
        const ParseUser = Parse.Object.extend('User');
        const query = new Parse.Query(ParseUser);
        query.equalTo("committeId", activeUser.committeeId);
        promise = query.find()
        // }

        promise.then((results) => {
            allUsers = results.map(user => new User(user, loadOnlyNames));
            // console.log('Users fetched', results);
            async.resolve(allUsers);
        }, (error) => {
            console.error('Error while fetching User', error);
            async.resolve([]);
        });

        return async.promise;
    }

    function signupUser(username, email, name, apt, committee, password, isCommitteeMember = true) {
        var async = $q.defer();

        if (username === "")
            username = email;
        const user = new Parse.User()
        user.set('username', username);
        user.set('email', email);
        user.set('name', name);
        user.set('apartment', apt);
        user.set('committeId', committee);
        user.set('messagesRead', []);
        user.set('isCommitteeMember', isCommitteeMember);
        user.set('password', password);

        user.signUp().then((user) => {
            // activeUser = new User(user);

            allUsersNames.unshift(new User(user, true));
            // console.log('User signed up', user);
            async.resolve(user);
        }).catch(error => {
            console.error('Error while signing up user', error);
            async.reject(error);
        });

        return async.promise;
    }

    function signup(username, email, name, apt, committee, password) {
        var async = $q.defer();
        signupUser(username, email, name, apt, committee, password, true).then((parseUser) => {
            activeUser = new User(parseUser);
            async.resolve(activeUser);
        }, (error) => {
            async.reject(error);
        });

        return async.promise;
    }

    function addUser(username, email, name, apt, committee, password, isCommitteeMember) {
        var async = $q.defer();
        signupUser(username, email, name, apt, committee, password, isCommitteeMember).then((parseUser) => {
            var user = new User(parseUser);
            async.resolve(activeUser);
        }, (error) => {
            async.reject(error);
        });

        return async.promise;
    }

    function getUsers() {
        return LoadUsersNames(false);
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
        return updateUser(Parse.User.current(), null, null, null, null, messageId);
    }

    function addOpenedIssues(issueId) {
        return updateUser(Parse.User.current(), null, null, null, null, issueId);
    }

    function updateUser(parseUser, email = null, name = null, apt = null, isCommitteeMember = null, messageId = null, null) {
        var async = $q.defer();

        // const currentUser = Parse.User.current();
        if (typeof messageId == 'string' && messageId != "") {
            var messages = getMessages(parseUser);
            messages.push(messageId);
            parseUser.set('messagesRead', messages);
        }

        ?????????
        // const currentUser = Parse.User.current();
        if (typeof messageId == 'string' && messageId != "") {
            var messages = getMessages(parseUser);
            messages.push(messageId);
            parseUser.set('messagesRead', messages);
        }

        // Saves the user with the updated data
        parseUser.save().then((response) => {
            // console.log('Updated user', response);

            async.resolve(true);
        }).catch((error) => {
            console.error('Error while updating user', error);
            async.reject(error);
        });

        return async.promise;
    }

    function deleteUser(user) {
        return updateUser(user.parseUser, null, null, null, null, null, false);
    }

    function GetUsername(userId) {
        return allUsersNames.find(user => user.id === userId).name;
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
        signup: signup,
        addUser: addUser,
        getUsers: getUsers,
        deleteUser: deleteUser,
        isLoggedIn: isLoggedIn,
        logout: logout,
        getActiveUser: getActiveUser,
        getActiveUserCommitteeId: getActiveUserCommitteeId,
        addOpenedMessages: addOpenedMessages,
        addOpenedIssues: addOpenedIssues,
        isCommitteeMember: isCommitteeMember,
        GetUsername: GetUsername
    }

});