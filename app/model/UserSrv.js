committeeApp.factory("userSrv", function ($q, $log) {

    var activeUser = null;

    class User {
        constructor(parseUser) {
            this.name = parseUser.get("name");
            this.isCommitteeMember = parseUser.get("isCommitteeMember");
            this.email = parseUser.get("email");
            this.apartment = parseUser.get("apartment");
            
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

    return {
        login: login,
        isLoggedIn: isLoggedIn,
        logout: logout,
        getActiveUser: getActiveUser,
        getActiveUserCommitteeId: getActiveUserCommitteeId
    }

});