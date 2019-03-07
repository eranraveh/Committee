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
                messages.push(new Message(parseMessage))
            });

            async.resolve(messages);

        }, function (error) {
            $log.error('Error while fetching messages', error);
            async.reject(error);
        });

        return async.promise;
    }

    function createRecipe(name, description, img, ingredients, steps, duration) {
        var async = $q.defer();

        const RecipeParse = Parse.Object.extend('Recipe');
        const newRecipe = new RecipeParse();

        newRecipe.set('name', name);
        newRecipe.set('description', description);
        newRecipe.set('image', new Parse.File(name + ".jpg", {
            base64: img
        }));
        newRecipe.set('ingredients', ingredients);
        newRecipe.set('steps', steps);
        newRecipe.set('duration', duration);
        newRecipe.set('userId', Parse.User.current());

        newRecipe.save().then(
            function (result) {
                $log.info('Recipe created', result);
                var newRecipe = new Recipe(result);
                async.resolve(newRecipe);
            },
            function (error) {
                $log.error('Error while creating Recipe: ', error);
                async.reject(error);
            }
        );

        return async.promise;
    }

    return {
        getActiveUserMessages: getActiveUserMessages,
        createRecipe: createRecipe
    }

})