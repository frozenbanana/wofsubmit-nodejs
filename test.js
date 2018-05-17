var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path'); 
var uploadedPath = path.join(__dirname, "/uploaded/");

http.createServer(function (req, res) {
  if (req.url == '/fileupload') {
    var form = new formidable.IncomingForm({uploadDir: uploadedPath});
    form.parse(req, function (err, fields, files) {
      var oldName = files.filetoupload.path;
      var newName = uploadedPath + files.filetoupload.name;
      fs.rename(oldName, newName, function (err) {
        if (err) throw err;
        console.log('File uploaded and renamed!');
        res.end();
       });
 });
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
  }
}).listen(8081);

