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
}

function closeSettingPage(){
    console.log(1);
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