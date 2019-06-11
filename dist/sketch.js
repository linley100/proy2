var socket;
var text = {
    text: ''
};
var flag = true;
//Aqui funciona el socket
function setup(){
    socket = io.connect('http://190.200.104.21:3000');
    $("#text").on("froalaEditor.keyup", function(){
        var html = $(this).froalaEditor('html.get');
        var data = {
            text: html
        };
        socket.emit('text', data);
    });
    $('#text').froalaEditor({
        toolbarButtons: ['fullscreen'],
        fullPage: true
    });
    
    //Aca se llaman a las funciones y se les pasan los argumentos
    socket.on('text', handleRecievedText);
    socket.on('newUser', updateText);
}

function updateText(data){
    text.text = data.text;
    $("#text").froalaEditor('html.set', data.text);
    var editor = $('#text').data('froala.editor');
    editor.selection.setAtEnd(editor.$el.get(0));
    editor.selection.restore()
}

function handleRecievedText(data){
    console.log(data);
    text.text = data.text;
    $("#text").froalaEditor('html.set', data.text);
    var editor = $('#text').data('froala.editor');
    editor.selection.setAtEnd(editor.$el.get(0));
    editor.selection.restore()
}


