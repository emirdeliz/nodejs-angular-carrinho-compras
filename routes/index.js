var mongoose = require("mongoose");
var db = mongoose.createConnection("localhost", "carrinho-compras-app");

var Cliente = db.model("Cliente", new mongoose.Schema({
	nome : {
		type : String,
		required : true
	},
	endereco : {
		type : String,
		required : true
	}
}));

var Produto = db.model("Produto", new mongoose.Schema({
	id : {
		type : String,
		required : true
	},
	nome : {
		type : String,
		required : true
	}
}));

var Item = db.model("Item", new mongoose.Schema({
	valor : {
		type : Number,
		required : true
	},
	qtd : {
		type : Number,
		required : true
	},
	produto : {
		type: mongoose.Schema.ObjectId,
		ref: "Produto"
	}
}));

var Carrinho = db.model("Carrinho", new mongoose.Schema({
	cliente : {
		type: mongoose.Schema.ObjectId,
		ref: "Cliente"
	},
	item : {
		type : [{
			type: mongoose.Schema.ObjectId,
			ref: "Produto"
		}],
		required : true
	}
});
