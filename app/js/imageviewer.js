window.$ = window.jQuery = require('./js/jquery-2.1.4.min.js');
var remote = require('remote');
var dialog = remote.require('dialog');
var fs = require('fs');
var path = require('path');
var imgs = [];
var page = 0;
var bigimg = false;
var scrollflag = false;

function checkImgExt(filepath) {
  var extlist = ['.jpg', '.jpeg', '.gif', '.png', '.svg', '.bmp'];
  var f = path.extname(filepath).toLowerCase();
  for (var i in extlist) {
    if (extlist[i] === f) return true;
  }
  return false;
}

function openFile(filepath) {
  fs.stat(filepath, function(err, stat) {
    if (err) {
      $('#input_msg').text('Not a file or directory');
    } else {
      if (stat.isDirectory()) {
        $('#input_msg').text('');
        loadImgs(filepath);
      } else {
        $('#input_msg').text('Not a directory');
      }
    }
  });
}

function loadImgs(filepath) {
  fs.readdir(filepath, function(err, files) {
    if (err) {
      console.log(err);
    } else {
      var count = 0;
      imgs = [];
      page = 0;
      for (var f in files) {
        if (checkImgExt(files[f])) {
          count++;
          imgs.push('file:///' + filepath + '/' + files[f]);
        }
      }
      if (count === 0) {
        $('#input_msg').text('no image file in directory');
      } else {
        $('#imgwindow').attr('src', imgs[0]);
        $('#ctrl_page').val(1);
      }
      $('#lbl_total').text('/ ' + imgs.length);
    }
  });
}

function showprevious() {
  if (page > 0) {
    page--;
    $('#imgwindow').attr('src', imgs[page]);
    $('#ctrl_page').val(page + 1);
    $('#content').scrollTop(0);
  }
}

function shownext() {
  if (page < imgs.length - 1) {
    page++;
    $('#imgwindow').attr('src', imgs[page]);
    $('#ctrl_page').val(page + 1);
    $('#content').scrollTop(0);
  }
}

function showpage(val) {
  if (val > 0 && val <= imgs.length) {
    $('#imgwindow').attr('src', imgs[val - 1]);
    page = val - 1;
    $('#content').scrollTop(0);
  }
}

$('#install_path').on('input', function() {
  var filepath = $(this).val();
  openFile(filepath);
});

$('#browse').on('click', function() {
  $(this).blur();
  var filepath = dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (filepath !== undefined) {
    $('#install_path').val(filepath[0]);
    openFile(filepath[0]);
  }
});

$('#btn_left').on('click', function(){
  $(this).blur();
  showprevious();
});
$('#btn_right').on('click', function(){
  $(this).blur();
  shownext();
});
$('#btn_leftmost').on('click', function(){
  $(this).blur();
  showpage(1);
  if(imgs.length === 0 ){
    $('#ctrl_page').val(0);
  }else{
    $('#ctrl_page').val(1);
  }
});
$('#btn_rightmost').on('click', function(){
  $(this).blur();
  showpage(imgs.length);
  $('#ctrl_page').val(imgs.length);
});

$(document).keydown(function(e) {
  if(!($('#install_path').is(':focus') || $('#ctrl_page').is(':focus')) ){
    //do not fire if user is typing something in text input
    var keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode === 32) shownext(); //space
    else if (keycode === 37) showprevious(); //arrow left
    else if (keycode === 38) showprevious(); //arrow up
    else if (keycode === 39) shownext(); //arrow right
    else if (keycode === 40) shownext(); //arrow down
  }
});

$(document).on('wheel', function(e){
  if(!bigimg){
    if(e.originalEvent.wheelDelta > 0){
      showprevious();
    }else{
      shownext();
    }
  }
});

$('#content').on('click', shownext);
$('#content').on('contextmenu', showprevious);

$('#ctrl_page').on('change', function() {
  showpage($(this).val());
});

$('#fit_height').on('click', function() {
  $(this).blur();
  bigimg = !bigimg;
  $('#imgwindow').toggleClass('fullheight');
});
