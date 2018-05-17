var formidable = require('formidable'),
    util = require('util'),
    express = require('express'),
    app = express();

app.set('port', process.env.PORT || 3600);
app.get('/', function (req, res) {
    res.send(     
    '<form action="/upload" enctype="multipart/form-data" method="post">'+
    '<input type="text" name="adName" placeholder="adName"><br>'+
    '<input type="text" name="adMessage" placeholder="adMessage"><br>'+
    '<input type="text" name="phone" placeholder="phone"><br>'+
    '<input type="text" name="rawPrice" placeholder="rawprice"><br>'+
    '<input type="text" name="rawCurrency" placeholder="rawcurrency"><br>'+
    '<input type="file" name="upload" multiple="multiple"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'
  );
});

app.post('/upload', function(req, res){
    var form = new formidable.IncomingForm();
    form.uploadDir = __dirname + "/uploaded";
    form.parse(req, function(err, fields, files) {
        //fields is an object containing all your fields, do waht ever you want with them from here
        //file is an object containing properties of your uploaded file
      console.log(form);

        res.send(util.inspect({fields: fields, files: files}));
      console.log('file uploaded : ' + files.upload.path + '/' + files.upload.name);
      console.log('Fields : ' + fields.adName);//you can access all your fields
    });
});

//starting server
app.listen(app.get('port'), function () {
    console.log('Express is listening: http://localhost:%s;', app.get('port'));
});