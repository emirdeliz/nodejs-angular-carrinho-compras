CartModule.config(function($routeProvider) {
	$routeProvider.when("/list", {
		templateUrl : "pages/list.html",
		controller : "CartListController"
	}).when("/get/:id", {
		templateUrl : "pages/item.html",
		controller : "CartItemController"
	}).when("/new", {
		templateUrl : "pages/item.html",
		controller : "CartItemController"
	}).otherwise({
		redirectTo : "/list"
	});
});
