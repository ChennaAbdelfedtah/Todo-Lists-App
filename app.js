const express = require('express');
const app = express();
const bodyparser = require("body-parser");
const mongoose = require('mongoose');
var expressValidator = require('express-validator');
var methodOverride = require('method-override');

mongoose.connect('mongodb://localhost/todo',{useNewUrlParser:true});

var todoSchema = new mongoose.Schema({ name: String});
var Todo = mongoose.model("Todo", todoSchema);


app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({extended:true}));
app.use(methodOverride());
app.use(expressValidator());

/***************Flash msg************/
var flash = require('express-flash');
var cookieParser = require('cookie-Parser');
var session = require('express-session');

app.use(cookieParser('keyboard cat'));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized:true,
  cookie:{maxAge:60000}
}));
app.use(flash());


//*********************default routes **********/
app.get("/", function (req, res) {
  Todo.find({}, function(err, todoList){
    if(err) res.json(err);
    else
      res.render("index.ejs", {todoList:todoList});
  });
});

/*********************New item Todo**************/
app.post("/Todo/new", function( req, res) {
  if( req.body.item == ""){
    console.log("You must do something!");
    req.flash('error','You must do something!');
  }else {
    var newIthem = new Todo({
      name: req.body.item
    });
  Todo.create(newIthem, function(err, Todo){
    if (err) console.log(err);
    else {
      console.log("Inserted item:"+newIthem);
      req.flash('success','Inserted item');
    }
  })
}
  res.redirect("/");
});

/*********************** Fetch item ID ********/
app.param('id', function(req, res, next, id){
  Todo.findById(id, function(err, docs){
    if(err) res.json(err);
    else {
      req.todoId = docs;
      next();
    }
  });
});
app.get('/Todo/:id', function(req, res){
    res.render('show', {Todo:req.todoId});
});

/************ Edit item ************/
app.get('/Todo/:id/edite', function(req, res){
  res.render('edite',{Todo: req.todoId});
});

app.post('/Todo/:id', function(req, res){
  Todo.updateOne({_id:req.params.id},
                  {name:req.body.newitem},
                  function(err){
                  if(err) res.json(err);
                  else    res.redirect('/');
  });
});

/************ Delete item **********/
app.post('/Todo/:id/delete', function(req, res) {
  Todo.findByIdAndRemove({_id:req.params.id}, function(err, docs){
    if(err) res.json(err);
    else {
      res.redirect('/');
    }
  });
});

/*************Invalid Page*********/
app.get("*", function (req, res) {
    res.send("<h1>Invalid page</h1>");
});


/**************Start Server***********/
app.listen(9999, function () {
    console.log("Server started on port 9999");
});
