var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ItemSchema = new Schema({
	valor : {
		type : Number,
		required : true
	},
	qtd : {
		type : Number,
		required : true
	},
	produto : {
		id : {
			type : String,
			required : true
		},
		nome : {
			type : String,
			required : true
		}
	}
});

var CarrinhoSchema = new Schema({
	cliente : {
		nome : {
			type : String,
			required : true
		},
		endereco : {
			type : String,
			required : true
		}
	},
	item : [ItemSchema]
});

exports.CarrinhoSchema = CarrinhoSchema;
