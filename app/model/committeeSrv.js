committeeApp.factory("committeeSrv", function ($q) {

    var activeCommittee = null;

    function createCommittee(city, address, img) {
        var async = $q.defer();

        const Committee = Parse.Object.extend('Committee');
        const myNewObject = new Committee();

        myNewObject.set('city', city);
        myNewObject.set('address', address);
        myNewObject.set('buildingImageUrl', img);

        myNewObject.save().then(
            (result) => {
                // console.log('Committee created', result);
                activeCommittee = result;
                async.resolve(activeCommittee);
            },
            (error) => {
                console.error('Error while creating Committee: ', error);
                async.reject(error);
            }
        );

        return async.promise;
    }

    function deleteCommittee(committee) {
        var async = $q.defer();

        const Committee = Parse.Object.extend('Committee');
        const query = new Parse.Query(Committee);
        // here you put the objectId that you want to delete
        query.get(committee.id).then((object) => {
            object.destroy().then((response) => {
                // console.log('Deleted Committee', response);
                async.resolve(activeCommittee);
            }, (error) => {
                console.error('Error while deleting Committee', error);
                async.reject(error);
            });
        });

        return async.promise;
    }

    return {
        createCommittee: createCommittee,
        deleteCommittee: deleteCommittee
    }
});