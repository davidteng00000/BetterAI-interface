// 獲取chatInterface輸入
document.getElementById('inputTextArea').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        // 在這裡執行當按下 Enter 鍵時要執行的操作
        console.log('Enter 鍵被按下了');
        handleTextInput();
    }
});

function handleTextInput(){
    let text = document.getElementById('inputTextArea').value;
    document.getElementById('inputTextArea').textContent= '';
    console.log(text);
}