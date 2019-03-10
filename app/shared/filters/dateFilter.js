committeeApp.filter('myDate', function () {
  return function (inDate) {
    var inMoment = moment(inDate);
    var oneWeekAgo = moment().subtract(7, 'd');
    if (inMoment.isAfter(oneWeekAgo))
      return inMoment.format("ddd H:mm");
    else
      return inMoment.format("ddd D/M");

  };
});