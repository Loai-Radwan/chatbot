let chatBot = document.querySelector('#chatbot')
let chatBody = document.querySelector('.chat-body')
let submitButton = document.querySelector('.submit')
let input = document.querySelector('#input')
let fileInput = document.querySelector('#file-input')
let fileWrapper = document.querySelector('.file-upload-wrapper')
let fileButton = document.getElementById('file-upload')
let cancelFile = document.getElementById('cancel-upload')


const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
// const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent';

const apiKey = 'AIzaSyBi9WsFwJFcOtSeuI2iLm6AmmCZpBVeUBA';
const chatHistory = []
const userData = {
    message : null,
    file : {
        data : null,
        mime_type: null
    }
}
async function generateBotResponse(message){
    chatHistory.push({
        role : 'user',
        parts: [
                {text : userData.message},
            (userData.file.data ?  [{inline_data : userData.file  }] : [])
            ]
    })
    let messageElement = message.querySelector('.text')
    const options = {
    method: 'POST',
    contentType: 'application/json',
    headers: {
        'x-goog-api-key': apiKey,
        // "Content-Type":"application/json"
    },
    body : JSON.stringify({
        contents: chatHistory
    })
    };
    try{
        const response = await fetch(url, options);
        const data  = await response.json()
        if (!response.ok) throw new Error(data.error.message)
        const apiRespond = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g , "$1").trim()
        messageElement.textContent = apiRespond
        chatHistory.push({
            role : 'model' , 
            parts : [{text : apiRespond}]
        })
    } catch (error){
        console.log(error)
        messageElement.textContent = error.message
        message.style.color = '#ff0000'
        chatBody.scrollTo({top : chatBody.scrollHeight , behavior : 'smooth'})

    }finally{
        userData.file = {}
        message.classList.remove('thinking')
        chatBody.scrollTo({top : chatBody.scrollHeight , behavior : 'smooth'})

    }
}



function showChatbot(){
    chatBot.classList.add('active')
}
function hideChatbot(){
    chatBot.classList.remove('active')
}

function createMessage(content , ...classes){
    let textDiv = document.createElement('div')
    textDiv.classList.add('message' , ...classes)
    textDiv.innerHTML = content
    return textDiv
}

function handleOutgoingMessage(e){
    e.preventDefault()
    chatBody.style.height = `calc(100vh - 140px)`
    input.style.height = `${initHeight}px`
    document.querySelector('.form').style.borderRadius = input.scrollHeight > initHeight ? '15px' : '32px'
    userData.message = input.value.trim()
    fileWrapper.classList.remove('uploaded')
    input.value = ''
    
    let messageContent = `<div class='text' > </div>
    ${userData.file.data ? ` <img src="data:${userData.file.mime_type};base64,${userData.file.data}" />` : ''}`
    let message = createMessage( messageContent, 'user-message' )
    message.querySelector('.text').textContent = userData.message
    chatBody.appendChild(message)
    chatBody.scrollTo({top : chatBody.scrollHeight , behavior : 'smooth'})

    setTimeout(() => {


        let messageContent = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                        <path
                            d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z">
                        </path>
                    </svg>

                    <div class="text">
                        <div class="thinking-mode">
                            <span class="dot"></span>
                            <span class="dot"></span>
                            <span class="dot"></span>
                        </div>
                    </div>`
        let message = createMessage( messageContent, 'bot-message' , 'thinking' )
        chatBody.appendChild(message)
        chatBody.scrollTo({top : chatBody.scrollHeight , behavior : 'smooth'})

        generateBotResponse(message)
    } , 600)
}


input.addEventListener('keydown' , e => {
    let userMessage = e.target.value.trim()
    if (e.key === 'Enter' && userMessage && !e.shiftKey && window.innerWidth > 768){
        handleOutgoingMessage(e)
    }
})

submitButton.addEventListener('click' ,e => handleOutgoingMessage(e) )

fileInput.addEventListener('change' , () => {
    const file = fileInput.files[0]
    if (!file) return
    
    const reader = new FileReader()

    
    reader.readAsDataURL(file)
    reader.onload = e => {
        fileWrapper.classList.add('uploaded')
        fileWrapper.querySelector('img').setAttribute('src' , `${e.target.result}`)
        userData.file = {
            data : e.target.result.split(',')[1],
            mime_type : file.type
            
        }
        fileInput.value = ''
    }
})
cancelFile.onclick = () => {
    userData.file = {}
    fileWrapper.classList.remove('uploaded')
    fileWrapper.querySelector('img').removeAttribute('src')

}
fileButton.addEventListener('click' , () => fileInput.click())

const picker = new EmojiMart.Picker({
    theme : 'light',
    skinTonePosition :'none',
    previewPosition : 'none',
    onClickOutside : e => {
        if (e.target.id === 'emoji-button'){
            document.body.classList.toggle('show-emoji-picker')
        }else{
            
            document.body.classList.remove('show-emoji-picker')
        } }, 
    onEmojiSelect : emoji => {
        input.value += emoji.native
        input.focus()
    }

})

let initHeight = input.scrollHeight
input.addEventListener('input' , () => {
    input.style.height = `${input.scrollHeight}px`
    document.querySelector('.form').style.borderRadius = input.scrollHeight > initHeight ? '15px' : '32px'
    chatBody.style.height = `calc(100vh  - ${input.scrollHeight + 85}px)`
})
picker.classList.add('emoji')
document.querySelector('.form').appendChild(picker)


