committeeApp.factory("pollsSrv", function ($q, $log, userSrv) {

    class Poll {
        constructor(parsePoll) {
            this.title = parsePoll.get("title");
            this.details = parsePoll.get("details");
            this.priority = parsePoll.get("priority");
            // for committee members, could contain false too
            this.isActive = parsePoll.get("isActive");
            this.parseUser = parsePoll.get("userId");
            this.postingDate = parsePoll.get("updatedAt");
            this.posterName = userSrv.GetUsername(this.parseUser.id);
            this.wasVoted = (userSrv.getActiveUser().readPolls.indexOf(parsePoll.id) > -1);
            this.commentsObject = {
                wasLoaded: false,
                comments: []
            };
            this.parsePoll = parsePoll;
        }
    }

    function getPolls() {
        var async = $q.defer();

        var polls = [];

        const ParsePoll = Parse.Object.extend('Poll');
        const query = new Parse.Query(ParsePoll);

        // query.equalTo("isActive", true);
        query.equalTo("committeeId", userSrv.getActiveUserCommitteeId());
        query.find().then((results) => {
            results.forEach(parsePoll => {
                var poll = new Poll(parsePoll);

                polls.push(poll)
            });


            polls.sort(function (a, b) {
                return b.postingDate - a.postingDate
            });

            async.resolve(polls);

        }, function (error) {
            $log.error('Error while fetching polls', error);
            async.reject(error);
        });

        return async.promise;
    }

    function postPoll(title, pollBody, priority, oldPoll) {
        if (oldPoll != null) {
            return updatePoll(title, pollBody, priority, oldPoll);
        }

        var async = $q.defer();

        const ParsePoll = Parse.Object.extend('Poll');
        const newPoll = new ParsePoll();

        newPoll.set('title', title);
        newPoll.set('details', pollBody);
        newPoll.set('priority', priority ? '1' : '2');
        newPoll.set('userId', Parse.User.current());
        newPoll.set('committeeId', userSrv.getActiveUserCommitteeId());
        newPoll.set('isActive', true);

        newPoll.save().then(
            (result) => {
                // console.log('Poll created', result);
                var newPollObj = new Poll(result);
                async.resolve(newPollObj);
            },
            (error) => {
                console.error('Error while creating Poll: ', error);
                async.reject(error);
            }
        );

        return async.promise;
    }


    function updatePoll(title, pollBody, priority, oldPoll) {
        var async = $q.defer();

        const ParsePoll = Parse.Object.extend('Poll');
        const query = new Parse.Query(ParsePoll);

        query.get(oldPoll.parsePoll.id).then((updatedPoll) => {
            updatedPoll.set('title', title);
            updatedPoll.set('details', pollBody);
            updatedPoll.set('priority', priority ? '1' : '2');
            updatedPoll.set('userId', Parse.User.current());
            updatedPoll.save().then(
                (result) => {
                    // console.log('Poll created', result);
                    var newPollObj = new Poll(result);
                    async.resolve(newPollObj);
                },
                (error) => {
                    console.error('Error while updating Poll: ', error);
                    async.reject(error);
                }
            );
        }, (error) => {
            console.error('Error while getting Poll', error);
            async.reject(error);
        });

        return async.promise;
    }

    function deletePoll(poll) {
        var async = $q.defer();

        const Poll = Parse.Object.extend('Poll');
        const query = new Parse.Query(Poll);
        // here you put the objectId that you want to delete
        query.get(poll.pollId).then((object) => {

            object.destroy().then((response) => {
                // console.log('Deleted Poll', response);
                async.resolve(poll);
                
                // object.destroy promise error
            }, (error) => {
                console.error('Error while deleting Poll', error);
                (error) => async.reject(error);
            })
            // query.get promise error
        }, (error) => {
            console.error('Error while getting Poll', error);
            async.reject(error)
        });

        return async.promise;
    }

    return {
        getPolls: getPolls,
        postPoll: postPoll,
        deletePoll: deletePoll
    }

})