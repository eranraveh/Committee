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
            if (this.email === undefined)
                this.email = "";
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

        Parse.User.logIn(email, pwd).then((user) => {
            if (!user.get("isActive")) {
                Parse.User.logOut();
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

        if (activeUser.isCommitteeMember && !loadOnlyNames) {
            Parse.Cloud.run("getUsers", {}).then((results) => {
                allUsers = results.map(user => new User(user, loadOnlyNames));
                async.resolve(allUsers);
            }, (error) => {
                console.error('Error while fetching User', error);
                async.resolve([]);
            });
        } else {
            const ParseUser = Parse.Object.extend('User');
            const query = new Parse.Query(ParseUser);
            query.equalTo("committeId", activeUser.committeeId);

            // resolve names of deleted users
            // query.equalTo("isActive", true);

            query.find().then((results) => {
                allUsers = results.map(user => new User(user, loadOnlyNames));
                async.resolve(allUsers);
            }, (error) => {
                console.error('Error while fetching User', error);
                async.resolve([]);
            });
        }

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
        user.set('isActive', true);

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
            async.resolve(user);
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
        return updateCurrentUser(Parse.User.current(), null, null, null, null, messageId);
    }

    function addOpenedIssues(issueId) {
        return updateCurrentUser(Parse.User.current(), null, null, null, null, issueId);
    }

    function addSeenPoll(pollId) {
        return updateCurrentUser(Parse.User.current(), null, null, null, null, pollId);
    }

    // function update(username, email, name, apt, password) {
    //     return updateUser(Parse.User.current(), email, name, apt, null, null, null, username, password);
    // }

    function updateOtherUser(user, email = null, name = null, apt = null, isCommitteeMember = null, messageId = null, isActive = null, username = null, password = null) {
        var async = $q.defer();

        var messages = null;
        if (messageId != null) {
            var messages = getMessages(user);
            messages.push(messageId);
        }

        var userParams = {
            id: user.id,
            email: email,
            name: name,
            apt: apt,
            isCommitteeMember: isCommitteeMember,
            messages: messages,
            isActive: isActive,
            username: username,
            password: password
        }

        if (activeUser.isCommitteeMember) {
            Parse.Cloud.run("updateUser", userParams).then((results) => {
                // if updating current user - update user object with new data
                if (activeUser.id === results.id) {
                    if (messageId != null) {
                        activeUser.readMessages = results.get("messagesRead");
                    }

                    if (email != null) {
                        activeUser.email = results.get("email");
                    }

                    if (name != null) {
                        activeUser.name = results.get("name");
                        activeUser.apartment = results.get("apartment");
                        activeUser.isCommitteeMember = results.get("isCommitteeMember");
                    }

                    if (username != null) {
                        activeUser.username = results.get('username');
                    }
                }

                var updatedUser = new User(results);

                async.resolve(updatedUser);
            }, (error) => {
                async.reject(error);
            });

            return async.promise;
        }
    }

    function updateCurrentUser(user, email = null, name = null, apt = null, isCommitteeMember = null, messageId = null, isActive = null, username = null, password = null) {
        var async = $q.defer();

        const ParseUser = Parse.Object.extend('User');
        const query = new Parse.Query(ParseUser);

        query.get(user.id).then((parseUser) => {
            // const currentUser = Parse.User.current();
            if (messageId != null) {
                var messages = getMessages(parseUser);
                messages.push(messageId);
                parseUser.set('messagesRead', messages);
            }

            if (email != null) {
                parseUser.set('email', email);
            }

            if (name != null) {
                parseUser.set('name', name);
                parseUser.set('apartment', apt);
            }

            if (username != null) {
                parseUser.set('username', username);
            }

            if (password != null) {
                parseUser.set('password', password);
            }

            if (isCommitteeMember != null) {
                parseUser.set('isCommitteeMember', isCommitteeMember);
            }

            if (isActive != null) {
                parseUser.set('isActive', isActive);
            }

            // Saves the user with the updated data
            parseUser.save().then((response) => {
                if (messageId != null) {
                    activeUser.readMessages = response.get("messagesRead");
                }

                if (email != null) {
                    activeUser.email = response.get("email");
                }

                if (name != null) {
                    activeUser.name = response.get("name");
                    activeUser.apartment = response.get("apartment");
                    activeUser.isCommitteeMember = response.get("isCommitteeMember");
                }

                if (username != null) {
                    activeUser.username = response.get('username');
                }

                async.resolve(true);
            }).catch((error) => {
                console.error('Error while updating user', error);
                async.reject(error);
            });
        }), (error) => {
            console.error('Error while getting user', error);
            async.reject(error);
        };

        return async.promise;
    }


    function resetPassword(email) {
        return Parse.User.requestPasswordReset(email);
        // .then(() => {
        //     // Password reset request was sent successfully
        //     console.log('Reset password email sent successfully');
        //   }).catch((error) => {
        //     console.error('Error while creating request to reset user password', error);
        //   })
    }

    function deleteUser(user) {
        return updateOtherUser(user.parseUser, user.parseUser.id + "@" + user.parseUser.id, null, undefined, undefined, undefined, false, user.parseUser.id, null);
    }

    function GetUsername(userId) {
        var user = allUsersNames.find(user => user.id === userId);
        return user.name;
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
        // update: update,
        addUser: addUser,
        getUsers: getUsers,
        updateCurrentUser: updateCurrentUser,
        updateOtherUser: updateOtherUser,
        deleteUser: deleteUser,
        isLoggedIn: isLoggedIn,
        resetPassword: resetPassword,
        logout: logout,
        getActiveUser: getActiveUser,
        getActiveUserCommitteeId: getActiveUserCommitteeId,
        addOpenedMessages: addOpenedMessages,
        addOpenedIssues: addOpenedIssues,
        addSeenPoll: addSeenPoll,
        isCommitteeMember: isCommitteeMember,
        GetUsername: GetUsername
    }

});