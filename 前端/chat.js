// 確認user 送出chatInterface輸入
document.getElementById('inputTextArea').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        // 在這裡執行當按下 Enter 鍵時要執行的操作
        console.log('Enter 鍵被按下了');
        text = document.getElementById('inputTextArea').value.trim();
        if(text){
            handleTextInput();
        }
    }
});
document.getElementsByClassName('bx-send')[0].addEventListener('click', function(){
    text = document.getElementById('inputTextArea').value.trim();
    if(text){
        handleTextInput();
    }
    
});
// 讓問題出現在chat interface 並呼叫getReplyAndShow獲取reply
function handleTextInput(){
    let textArea = document.getElementById('inputTextArea');
    let text = textArea.value.trim(); // 去除字串前後的空格
    textArea.value = ''; // 清空文本區域的值
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
    contentDiv.innerHTML = replaceSyntax(text);

    userDiv.appendChild(nametagDiv);
    userDiv.appendChild(contentDiv);

    let chatDiv = document.querySelector('.chat');
    chatDiv.appendChild(userDiv);

    // 把送出按鈕換掉
    removeSendButton();
    document.getElementsByClassName('chat')[0].scrollTop = document.getElementsByClassName('chat')[0].scrollHeight;
}
function removeSendButton(){
    let btn = document.getElementsByClassName('bx-send')[0];
    btn.classList.replace('bx-send', 'bx-stop-circle');
}

function recoverSendButton(){
    let btn = document.getElementsByClassName('bx-stop-circle')[0];
    btn.classList.replace('bx-stop-circle', 'bx-send');
}


// 獲得GPT 回應並且秀出
function getReplyAndShow(text){
    // let reply = text; // 尚未串接API
    reply = replaceSyntax(text);
    showAiReply(reply);
}
function replaceSyntax(text){
    console.log(text);
    text = text.replace(/\n/g, '<br>');
    text = text.replace(/\\n/g, '<br>');
    
    console.log(text);
    return text;
}




function showAiReply(reply){
    let chatbotDiv = document.createElement('div');
    chatbotDiv.classList.add('chatbot');

    let nametagDiv = document.createElement('div');
    nametagDiv.classList.add('nametag');
    let img = document.createElement('img');
    img.setAttribute('src', './images/apple-touch-icon.png');
    let span = document.createElement('span');
    span.textContent = 'GPT4';

    nametagDiv.appendChild(img);
    nametagDiv.appendChild(span);

    let contentDiv = document.createElement('div');
    contentDiv.classList.add('content');
    contentDiv.innerHTML = reply;

    chatbotDiv.appendChild(nametagDiv);
    chatbotDiv.appendChild(contentDiv);

    let chatDiv = document.querySelector('.chat');
    chatDiv.appendChild(chatbotDiv);
    
    recoverSendButton();
    document.getElementsByClassName('chat')[0].scrollTop = document.getElementsByClassName('chat')[0].scrollHeight;
}