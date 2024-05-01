// 控制輸入框高度

const inputTextArea = document.querySelector("textarea");
inputTextArea.addEventListener("keyup", e =>{
    inputTextArea.style.height = "16px";
    let scHeight = e.target.scrollHeight;
    console.log(scHeight)
    // inputTextArea.style.height = "auto";
    inputTextArea.style.height = `${scHeight}px`;
});

// 選擇model

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


// 偵測settingsIcon
let setbtn = document.getElementsByClassName('settingsIcon')[0];
let setP = false;
let setBack = document.getElementById('setPage');

function setPageOnOff(e){
    console.log(1);
    if(setP === false){ //開啟設定介面
        document.getElementById('setPage').style.display = "block";
        setP = true;
        console.log(2);
        setBack = document.getElementById('setPage');
        setBack.addEventListener('click', setPageOnOff);
    }
    else{
        if(e.target === document.getElementById('setPage')){ //關閉設定介面
            document.getElementById('setPage').style.display = "none";
            setP = false;
            console.log(3);
        }
        
    }
}

setbtn.addEventListener('click', e => setPageOnOff());

// 偵測設定介面的more details btn
let 