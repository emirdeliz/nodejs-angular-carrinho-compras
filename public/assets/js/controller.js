CartModule.controller("CartListController", function($scope, $cart, $location) {
	$scope.excluir = function(index){
		var carrinhoId = $scope.carrinho[index]._id;
		var confirmar = confirm("Confirmar exclusão?");
		if(!confirmar) return;
		
		$cart.delete({id : carrinhoId});
		this.buscar();
	}
	
	$scope.buscar = function(){
		$scope.carrinho = $cart.query();
	}
	
	$scope.selecionar = function(index){
		var carrinhoId = $scope.carrinho[index]._id;
		$location.path("/get/" + carrinhoId);
	}
	
	$scope.novo = function(){
		$location.path("/new/");
	}
});

CartModule.controller("CartItemController", function($scope, $cart, $routeParams, $location) {
	$scope.buscar = function(){
		$cart.get({id: $routeParams.id}, function(carrinho){
			$scope.cliente = carrinho.cliente;
			$scope.item = carrinho.item;
			$scope._id = carrinho._id;
		});
	}
	
	$scope.salvar = function() {
		var item = new $cart({
			cliente : $scope.cliente,
			item : $scope.item,
			_id : $scope._id
		});
		
		item.$save(function(p, resp) {
			if (!p.error) {
				$location.path("cart");
			} else {
				alert("Erro ao atualizar carrinho");
			}
		});
	}

	$scope.incluir = function(){
		if(!$scope.item) $scope.item = [];
		$scope.item.push(new Object());
	}
	
	$scope.selecionar = function(index){
		$scope.itemNovo = $scope.item[index];
	}
	
	$scope.remover = function(index){
		var item = $scope.item;
		$scope.item = []
		
		angular.forEach(item, function(object, i) {
			var itemExcluido = (i == index);
			if(!itemExcluido)
				$scope.item.push(object);
		});
	}
});
