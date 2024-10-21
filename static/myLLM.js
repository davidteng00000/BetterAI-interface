// 確認user 送出chatInterface輸入
document.getElementById('inputTextArea').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        // 在這裡執行當按下 Enter 鍵時要執行的操作
        // console.log('Enter 鍵被按下了');
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
    let btn = document.querySelector('.bx-stop-circle');
    if (btn) {
        btn.classList.replace('bx-stop-circle', 'bx-send');
    } else {
        // console.warn("找不到具有 bx-stop-circle 類別的元素");
    }
}


// 獲得GPT 回應並且秀出
// function getReplyAndShow(text){
//     // let reply = text; // 尚未串接API
//     // reply = replaceSyntax(text);
//     showAiReply(reply);
// }
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function getReplyAndShow(text) {
    try {
        
        const response = await fetch("/answer", {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            credentials: "include",
            body: JSON.stringify({ 
                content: text ,
                parameters: text
            }),
        });
  
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        let output = "";
        let first = true;
        while (true) {
            let { done, value } = await reader.read();
            // console.log('aaa');
            if(first){
                var newDiv = showAiReply(); // 直接顯示串流內容
                first = false;
            }

            if (done) {
                
                recoverSendButton();
                // console.log(output);
                await fetch('/store-output', {
                    method: 'POST',
                    credentials: "include",
                    headers: { 'Content-Type': 'application/json; charset=utf-8' },
                    body: JSON.stringify({ output: output })
                });
                // console.log(output);
                update_histories_list()
                break; // 串流結束，跳出迴圈
            }

            if (typeof value !== "undefined"){
                value = value.replace(/\\/g, '\\\\')
                output += value;
                // console.log(output);
                
                newDiv.innerHTML = marked.parse(output);
                // newDiv.innerHTML = output;
                document.getElementsByClassName('chat')[0].scrollTop = document.getElementsByClassName('chat')[0].scrollHeight;

            }
            
            // await new Promise(resolve => setTimeout(resolve, 0));
            // console.log(output);
            // newDiv.innerHTML = marked.parse(output);
            document.getElementsByClassName('chat')[0].scrollTop = document.getElementsByClassName('chat')[0].scrollHeight;

            // console.log(output)
            // await sleep(100);
        }
        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        document.getElementsByClassName('chat')[0].scrollTop = document.getElementsByClassName('chat')[0].scrollHeight;
        document.getElementsByClassName('chat')[0].scrollTop = document.getElementsByClassName('chat')[0].scrollHeight;

    } catch (error) {
      console.error("Error fetching response:", error);
      // 處理錯誤，例如顯示錯誤訊息給使用者
    }
}
/*
async function getReplyAndShow(text) {
    let newDiv;
    try {
      // ... (fetch 部分不變)
      const response = await fetch("/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        credentials: "include",
        body: JSON.stringify({ 
            content: text ,
            parameters: text
        }),
    });
  
        const reader = response.body.getReader();
        let output = "";
        let first = true;
        let first_finish = true;
    
        const intervalId = setInterval(async () => {
            const { done, value } = await reader.read();
    
            if (done && !value && first_finish) {
                clearInterval(intervalId); // 清除 interval
                store_output(newDiv, output);
                recoverSendButton();
                first_finish = false;
            }
            
            if (first) {
                newDiv = showAiReply();
                first = false;
                
            }
            console.log(111);
            output += new TextDecoder().decode(value);
            await new Promise(resolve => setTimeout(resolve, 0)); // 強制輸出緩衝區資料
            console.log(output);
            newDiv.innerHTML = marked.parse(output);
            document.getElementsByClassName('chat')[0].scrollTop = document.getElementsByClassName('chat')[0].scrollHeight;
        }, 100); // 每 10 毫秒 (0.01 秒) 執行一次
        
        update_histories_list();
        return; // 結束函式


    } 
    catch (error) {
        console.error("Error fetching response:", error);
    }
        
    }
  
function store_output(newDiv, output){
    fetch('/store-output', {
        method: 'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ output: output })
    });
}
*/

function replaceSyntax(text){
    // console.log(text);
    text = text.replace(/\n/g, '<br>');
    text = text.replace(/\\n/g, '<br>');

    // console.log(text);
    return text;
}




function showAiReply(){
    
    let chatbotDiv = document.createElement('div');
    chatbotDiv.classList.add('chatbot');

    let nametagDiv = document.createElement('div');
    nametagDiv.classList.add('nametag');

    let img = document.createElement('i');
    img.classList.add('bx');
    img.classList.add('bx-shape-polygon');

    let span = document.createElement('span');
    span.textContent = 'GPT4o';

    nametagDiv.appendChild(img);
    nametagDiv.appendChild(span);

    let contentDiv = document.createElement('div');
    contentDiv.classList.add('content');
    // contentDiv.innerHTML = reply;

    chatbotDiv.appendChild(nametagDiv);
    chatbotDiv.appendChild(contentDiv);

    let chatDiv = document.querySelector('.chat');
    chatDiv.appendChild(chatbotDiv);
    
    
    return contentDiv;
}
// ---------------------------------




// 控制輸入框高度

const inputTextArea = document.querySelector("textarea");
inputTextArea.addEventListener("keyup", e =>{
    inputTextArea.style.height = "16px";
    let scHeight = e.target.scrollHeight;
    // console.log(scHeight)
    // inputTextArea.style.height = "auto";
    inputTextArea.style.height = `${scHeight}px`;
});

// 選擇model
/*
let currmodel = document.getElementById('currmodel');
let GPT3 = document.getElementById('GPT3');
let GPT4 = document.getElementById('GPT4');
let DALLE = document.getElementById('DALLE');

function changemodel(newmodel){
    console.log(currmodel.innerText);
    console.log(newmodel);
    console.log(10);
    if(currmodel.innerText !== newmodel){
        currmodel.innerText = newmodel;
    }
}

GPT3.addEventListener('click', () => changemodel('ChatGPT 3.5'));
GPT4.addEventListener('click', () => changemodel('ChatGPT 4'));
DALLE.addEventListener('click', () => changemodel('DALL·E 3'));
*/

// 設定頁面開啟/關閉

let settingBtn = document.getElementsByClassName('settingsIcon')[0].querySelector('i');
let settingWrapper = document.getElementById('setW');
let detailBtn = document.getElementById('more-details-btn');
let settingOpen = false;
let detailsOpen = false;
function openSettingPage(){
    settingOpen = true;
    detailBtn = document.getElementById('more-details-btn');
    document.getElementById('setPage').style.display = 'block';
    document.getElementById('closeSettings').addEventListener('click', closeSettingPage);
    activateDetailsBtn();
    getSettings();
}

function closeSettingPage(){
    // console.log(1);
    settingOpen = false;
    activateDetailsBtn();
    document.getElementById('setPage').style.display = 'none';
    document.getElementById('closeSettings').removeEventListener('click', closeSettingPage);
}

function activateDetailsBtn(){
    if(settingOpen) detailBtn.addEventListener('click', details);
    else detailBtn.removeEventListener('click', details);
}

function details(){
    detailsOpen = !detailsOpen;
    if(detailsOpen){
        detailBtn.querySelector('i').style.transform = `rotate(0deg)`;
        document.getElementsByClassName('details')[0].style.display = 'block';
        document.getElementsByClassName('details')[0].style.maxHeight = "1000px";
        
    }
    else{
        detailBtn.querySelector('i').style.transform = `rotate(90deg)`;
        document.getElementsByClassName('details')[0].style.display = 'none';
        document.getElementsByClassName('details')[0].style.maxHeight = "0";
    }
}


settingBtn.addEventListener('click', openSettingPage);


// 取得詳細設定數據

let top_p_slider = document.getElementById('top_p_slider');
let top_p_value_display = document.getElementById('top_p_value_display');

top_p_slider.addEventListener('input', () => {
    top_p_value_display.innerHTML = top_p_slider.value;
});

let max_tokens_slider = document.getElementById('max_tokens_slider');
let max_tokens_value_display = document.getElementById('max_tokens_value_display');
max_tokens_slider.addEventListener('input', () => {
    max_tokens_value_display.innerHTML = max_tokens_slider.value;
});

let temperature_slider = document.getElementById('temperature_slider');
let temperature_value_display = document.getElementById('temperature_value_display');
temperature_slider.addEventListener('input', () => {
    temperature_value_display.innerHTML = temperature_slider.value;
});

let frequency_penalty_slider = document.getElementById('frequency_penalty_slider');
let frequency_penalty_value_display = document.getElementById('frequency_penalty_value_display');
frequency_penalty_slider.addEventListener('input', () => {
    frequency_penalty_value_display.innerHTML = frequency_penalty_slider.value;
});

let presence_penalty_slider = document.getElementById('presence_penalty_slider');
let presence_penalty_value_display = document.getElementById('presence_penalty_value_display');
presence_penalty_slider.addEventListener('input', () => {
    presence_penalty_value_display.innerHTML = presence_penalty_slider.value;
});

// 根據資料庫更新設定介面上的數據
function getSettings(){
    fetch('/get-settings') // 發送請求到後端 API
    .then(response => response.json())
    .then(settings => {
        // 在這裡處理從後端接收到的 settings
        // console.log(settings); 
        top_p_value_display.innerHTML = settings[3];
        top_p_slider.value = settings[3];

        max_tokens_value_display.innerHTML = settings[6];
        max_tokens_slider.value = settings[6];

        temperature_value_display.innerHTML = settings[7];
        temperature_slider.value = settings[7];

        frequency_penalty_value_display.innerHTML = settings[8];
        frequency_penalty_slider.value = settings[8];
        
        presence_penalty_value_display.innerHTML = settings[9];
        presence_penalty_slider.value = settings[9];

        document.getElementById('sysPrompt').value = settings[4];
        document.getElementById('chatName').value = settings[1];
        // ... 更新 UI 或其他操作
    });
}

// confirm 鍵

let confirmBtn = document.getElementById('setConfirmBtn');
confirmBtn.addEventListener('click', () => {
    // 获取滑块的值
    let topP = parseFloat(top_p_slider.value);
    let maxTokens = parseInt(max_tokens_slider.value, 10);
    let temperature = parseFloat(temperature_slider.value);
    let frequencyPenalty = parseFloat(frequency_penalty_slider.value);
    let presencePenalty = parseFloat(presence_penalty_slider.value);
    let sysPrompt = document.getElementById('sysPrompt').value;
    let chatName = document.getElementById('chatName').value;
    // console.log(sysPrompt)
    // 创建包含设置的 JSON 对象
    let settingsData = {
        topP,
        maxTokens,
        temperature,
        frequencyPenalty,
        presencePenalty,
        sysPrompt,
        chatName
    };
    // console.log(JSON.stringify(settingsData));
  
    // 发送数据到后端
    fetch('/save-settings', {  // 替换为你的后端路由
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(settingsData)
    })
    .then(response => response.json())
    .then(data => {
        // console.log('Settings saved:', data);
        // 可以在这里添加成功保存后的提示信息或操作
    })
    .catch(error => {
        console.error('Error saving settings:', error);
        // 可以在这里添加错误处理
    });
    update_histories_list();
    closeSettingPage();

});


// 更新歷史
function update_histories_list(){
    fetch('/get-conversations')
    .then(response => response.json())
    .then(conversations => {
        let historiesList = document.getElementById('histories_list');

        // 清空现有内容（可选）
        historiesList.innerHTML = '';
        // let id = 1;
        for (let item of conversations) {
            let historyDiv = document.createElement('div');
            historyDiv.classList.add('history'); // 添加 CSS 类
            historyDiv.id = item[1];
            historyDiv.textContent = item[0];
            historiesList.appendChild(historyDiv);
        }
        // console.log('meo')
    })
    .catch(error => console.error('Error fetching conversations:', error));
}

// 新增對話邏輯

const chatInput = document.querySelector('.chat-input');

let new_chat_btn = document.getElementById('new_chat_btn');
new_chat_btn.addEventListener('click', () => {
    fetch('/new-chat')
    .then(response => response.json())
    .catch(error => {
        console.error('Error: ', error);
    });
    update_histories_list()
    update_histories_list()
});


update_histories_list()

function loadChat(event){
    let clickedElement = event.target;

    // 检查是否点击了 .history 元素
    if (clickedElement.classList.contains('history')) {
        let conversationID = clickedElement.id;
        // 在这里处理点击事件，例如：
        // console.log('Clicked conversation:', conversationID);
        fetch('/change-chat', {
            method: 'POST', // 使用 POST 请求发送数据
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({ conversationID }) // 将 conversationID 转换为 JSON
        })
        .then(response => response.json())
        .then(chat_list => {
            // 在这里处理后端返回的数据 (如果有)
            // console.log('Response from server:', chat_list);
            let chat_field = document.getElementById('chat_field');

            // 清空现有内容（可选）
            chat_field.innerHTML = '';
            for(let item of chat_list){
                let chatDiv = document.createElement('div');
                // console.log(item[0]);
                if(item[3] === 'user'){
                    // console.log("dsadsaSdsfdsfd")
                    chatDiv.classList.add('user');
                    chatDiv.id = item[0];
                    chatDiv.innerHTML = `
                    
                        <div class="nametag"><i class='bx bx-user-circle'></i><span>You</span></div>
                        <div class="content">${marked.parse(item[6])}</div>
                    
                `;
                }
                else if(item[3] === 'assistant'){
                    chatDiv.classList.add('chatbot');
                    chatDiv.id = item[0];
                    chatDiv.innerHTML = `
                    
                        <div class="nametag"><i class='bx bx-shape-polygon'></i><span>GPT</span></div>
                        <div class="content">${marked.parse(item[6])}</div>
                    
                `;
                }
                chat_field.appendChild(chatDiv);
                
            }
            // marked.parse(item[6])
            MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
            document.getElementsByClassName('chat')[0].scrollTop = document.getElementsByClassName('chat')[0].scrollHeight;
            document.getElementsByClassName('chat')[0].scrollTop = document.getElementsByClassName('chat')[0].scrollHeight;


            // let id = 1;
            
        })
        .catch(error => {
            console.error('Error:', error);
        });
        // ... 其他操作，如加载对话内容等
        document.querySelector('.chatInterface').style.display = 'flex';
        // document.getElementsByClassName('chat')[0].scrollTop = document.getElementsByClassName('chat')[0].scrollHeight;
    }
}


let historiesList = document.getElementById('histories_list');

historiesList.addEventListener('click', loadChat);