committeeApp.factory("messagesSrv", function ($q, $log, userSrv) {

    class Message {
        constructor(parseMessage) {
            this.title = parseMessage.get("title");
            this.details = parseMessage.get("details");
            this.priority = parseMessage.get("priority");
            // for committee members, could contain false too
            this.isActive = parseMessage.get("isActive");
            this.user = parseMessage.get("userId");
            this.postingDate = parseMessage.get("createdAt");
            this.messageId = parseMessage.id;
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

    // function createRecipe(name, description, img, ingredients, steps, duration) {
    //     var async = $q.defer();

    //     const RecipeParse = Parse.Object.extend('Recipe');
    //     const newRecipe = new RecipeParse();

    //     newRecipe.set('name', name);
    //     newRecipe.set('description', description);
    //     newRecipe.set('image', new Parse.File(name + ".jpg", {
    //         base64: img
    //     }));
    //     newRecipe.set('ingredients', ingredients);
    //     newRecipe.set('steps', steps);
    //     newRecipe.set('duration', duration);
    //     newRecipe.set('userId', Parse.User.current());

    //     newRecipe.save().then(
    //         function (result) {
    //             $log.info('Recipe created', result);
    //             var newRecipe = new Recipe(result);
    //             async.resolve(newRecipe);
    //         },
    //         function (error) {
    //             $log.error('Error while creating Recipe: ', error);
    //             async.reject(error);
    //         }
    //     );

    //     return async.promise;
    // }

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
        deleteMessage: deleteMessage
    }

})