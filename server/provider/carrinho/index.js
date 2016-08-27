var mongoose = require("mongoose");
var db = mongoose.createConnection("localhost", "carrinho-compras-app");

var CarrinhoSchema = require("../../model").CarrinhoSchema;
var CarrinhoModel = db.model("carrinho", CarrinhoSchema);
var CarrinhoProvider = function() {
	
}

CarrinhoProvider.prototype.find = function(id, callback) {
	CarrinhoModel.findById(id, "", { lean: true }, function(err, carrinho) {
		callback(carrinho);
	});
}

CarrinhoProvider.prototype.findAll = function(callback) {
	CarrinhoModel.find(function(error, carrinho) {
		callback(carrinho);
	});
}

CarrinhoProvider.prototype.saveOrUpdate = function(vo, callback) {
	var isSave = !(vo._id);
	var carrinho = {
		cliente : vo.cliente,
		item : vo.item
	};
		
	if(isSave){
		CarrinhoModel.create(carrinho, function(err, doc) {
			if (err || !doc) throw "Error " + err + " " + doc;
			else callback(doc);
		});
	}else{
		CarrinhoModel.update({_id : vo._id}, carrinho, function(err, doc) {
			if (err || !doc) throw "Error " + err + " " + doc;
			else callback(doc);
		});
	}
}

CarrinhoProvider.prototype.remove = function(id) {
	CarrinhoModel.remove({_id : id}).exec();
}

exports.CarrinhoProvider = CarrinhoProvider;