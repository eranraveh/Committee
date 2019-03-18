committeeApp.filter('myDate', function () {
    return function (inDate) {
        var inMoment = moment(inDate);
        var now = moment();
        if (inMoment.isAfter(now))
            return inMoment.format("ddd D/M");

        var fourDaysAgo = now.subtract(4, 'd');
        if (inMoment.isAfter(fourDaysAgo))
            return inMoment.format("ddd H:mm");
        else
            return inMoment.format("ddd D/M");

    };
});