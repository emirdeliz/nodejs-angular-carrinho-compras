var express = require("express")
  , http = require("http")
  , path = require("path")
  , CarrinhoProvider = require("./server/provider/carrinho").CarrinhoProvider;

var app = express();
app.configure(function(){
	app.set("port", process.env.PORT || 3000);
	app.set("views", __dirname + "/views");
	app.set("view engine", "jade");
	app.set("view options", {layout: false});
	app.use(express.favicon());
	app.use(express.logger("dev"));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, "public")));
});

var carrinhoProvider = new CarrinhoProvider("localhost");

//Routes
app.get("/", function(req, res){
	res.render("index");
});

app.get("/cart/list", function (request, response) {
	carrinhoProvider.findAll(function(carrinho){
		response.json(carrinho);
	});
});

app.get("/cart/:id", function (request, response) {
    try {
    	carrinhoProvider.find(request.params.id, function(carrinho){
        	response.json(carrinho);
        });
    } catch (exeception) {
    	console.log("Erro ao consultar item: " + exeception);
        response.send(404);
    }
});

app.post("/cart", function (request, response) {
    var carrinho = request.body;
    var doc = carrinhoProvider.saveOrUpdate({
    	cliente : carrinho.cliente,
		item : carrinho.item,
		_id : carrinho._id
    }, function(doc){
    	response.json(doc);
    });
});

app.put("/cart/:id", function (request, response) {
    try {
    	var carrinho = request.body;
	    var doc = carrinhoProvider.save({
	    	cliente : carrinho.cliente,
			item : carrinho.item,
			_id : carrinho._id
	    });
	    response.json(doc);
    } catch (exception) {
        response.send(404);
    }
});

app.delete("/cart/:id", function (request, response) {
    try {
        carrinhoProvider.remove(request.params.id);
        response.send(200);
    } catch (exeception) {
    	console.log("Erro ao excluir item: " + exeception); 
        response.send(404);
    }
});

var server = http.createServer(app);
server.listen(app.get("port"), function() {
	console.log("Express server listening on port " + app.get("port"));
});
