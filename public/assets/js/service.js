CartModule.factory("$cart", function($resource) {
	return $resource("cart/:id", {}, {
		query : {
			method : "GET",
			params : {
				id : "list"
			},
			isArray : true
		}
	})
});

CartModule.factory("$socket", function($rootScope) {
	var socket = io.connect();
	return {
		on : function(eventName, callback) {
			socket.on(eventName, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					callback.apply(socket, args);
				});
			});
		},
		emit : function(eventName, data, callback) {
			socket.emit(eventName, data, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			})
		}
	};
});