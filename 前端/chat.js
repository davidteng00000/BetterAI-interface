// 獲取chatInterface輸入
document.getElementById('inputTextArea').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        // 在這裡執行當按下 Enter 鍵時要執行的操作
        // console.log('Enter 鍵被按下了');
        handleTextInput();
    }
});
// 讓問題出現在chat interface 並呼叫getReplyAndShow獲取reply
function handleTextInput(){
    let text = document.getElementById('inputTextArea').value;
    document.getElementById('inputTextArea').value= '';
    addUserText(text);
    getReplyAndShow(text);
}

// 把user 的文字內容append 到 chat interfane (.chat) 中
function addUserText(text){
    // console.log(text);
    let userDiv = document.createElement('div');
    userDiv.classList.add('user');
    let nametagDiv = document.createElement('div');
    nametagDiv.classList.add('nametag');
    let img = document.createElement('i');
    img.classList.add('bx');
    img.classList.add('bx-user-circle');
    let span = document.createElement('span');
    span.textContent = 'You';

    nametagDiv.appendChild(img);
    nametagDiv.appendChild(span);

    let contentDiv = document.createElement('div');
    contentDiv.classList.add('content');
    contentDiv.textContent = text;

    userDiv.appendChild(nametagDiv);
    userDiv.appendChild(contentDiv);

    let chatDiv = document.querySelector('.chat');
    chatDiv.appendChild(userDiv);


}