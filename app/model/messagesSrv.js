committeeApp.factory("messagesSrv", function ($q, $log, userSrv) {

    class Message {
        constructor(parseMessage) {
            this.title = parseMessage.get("title");
            this.details = parseMessage.get("details");
            this.priority = parseMessage.get("priority");
            // for committee members, could contain false too
            this.isActive = parseMessage.get("isActive");
            this.user = parseMessage.get("userId");
            this.postingDate = parseMessage.get("updatedAt");
            this.wasRead = (userSrv.getActiveUser().readMessages.indexOf(parseMessage.id) > -1);
            this.commentsObject = {
                wasLoaded: false,
                comments: []
            };
            this.parseMessage = parseMessage;
        }
    }

    function getActiveUserMessages() {
        var async = $q.defer();

        var messages = [];

        const ParseMessage = Parse.Object.extend('Message');
        const query = new Parse.Query(ParseMessage);

        // query.equalTo("isActive", true);
        query.equalTo("committeeId", userSrv.getActiveUserCommitteeId());
        query.find().then((results) => {
            results.forEach(parseMessage => {
                var message = new Message(parseMessage);

                messages.push(message)
            });


            messages.sort(function (a, b) {
                return b.postingDate - a.postingDate
            });

            async.resolve(messages);

        }, function (error) {
            $log.error('Error while fetching messages', error);
            async.reject(error);
        });

        return async.promise;
    }

    function postMessage(title, messageBody, priority, oldMessage) {
        if (oldMessage != null) {
            return updateMessage(title, messageBody, priority, oldMessage);
        }

        var async = $q.defer();

        const ParseMessage = Parse.Object.extend('Message');
        const newMessage = new ParseMessage();

        newMessage.set('title', title);
        newMessage.set('details', messageBody);
        newMessage.set('priority', priority ? '1' : '2');
        newMessage.set('userId', Parse.User.current());
        newMessage.set('committeeId', userSrv.getActiveUserCommitteeId());
        newMessage.set('isActive', true);

        newMessage.save().then(
            (result) => {
                console.log('Message created', result);
                var newMessageObj = new Message(result);
                async.resolve(newMessageObj);
            },
            (error) => {
                console.error('Error while creating Message: ', error);
                async.reject(error);
            }
        );

        return async.promise;
    }


    function updateMessage(title, messageBody, priority, oldMessage) {
        var async = $q.defer();

        const ParseMessage = Parse.Object.extend('Message');
        const query = new Parse.Query(ParseMessage);

        query.get(oldMessage.parseMessage.id).then((updatedMessage) => {
            updatedMessage.set('title', title);
            updatedMessage.set('details', messageBody);
            updatedMessage.set('priority', priority ? '1' : '2');
            updatedMessage.set('userId', Parse.User.current());
            updatedMessage.save().then(
                (result) => {
                    console.log('Message created', result);
                    var newMessageObj = new Message(result);
                    async.resolve(newMessageObj);
                },
                (error) => {
                    console.error('Error while updating Message: ', error);
                    async.reject(error);
                }
            );
        }, (error) => {
            console.error('Error while getting Message', error);
            async.reject(error);
        });

        return async.promise;
    }

    function deleteMessage(message) {
        var async = $q.defer();

        const Message = Parse.Object.extend('Message');
        const query = new Parse.Query(Message);
        // here you put the objectId that you want to delete
        query.get(message.messageId).then((object) => {

            object.destroy().then((response) => {
                console.log('Deleted Message', response);
                async.resolve(message);
                // object.destroy promise error
            }, (error) => {
                console.error('Error while deleting Message', error);
                (error) => async.reject(error);
            })
            // query.get promise error
        }, (error) => {
            console.error('Error while getting Message', error);
            async.reject(error)
        });

        return async.promise;
    }

    return {
        getActiveUserMessages: getActiveUserMessages,
        postMessage: postMessage,
        deleteMessage: deleteMessage
    }

})