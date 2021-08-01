const socket=io()

// ELEMENTS
const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

//Templates
const messageTemplate=document.querySelector('#message-template').innerHTML

const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML

const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML
//options
const {username,room}=Qs.parse(location.search,{ ignoreQueryPrefix:true})

const autoScroll=()=>{
    // new message element
    const $newMessage=$messages.lastElementChild
    // height of new message
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight + newMessageMargin

    const visibleHeight=$messages.offsetHeight
    //height of messages container
    const containerHeight=$messages.scrollHeight

    //how far have i scrolled?
    const scrollOffset=$messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }


}
// for autoscrolling features

socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message: message.text, 
        createdAt:moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()

})

socket.on('locationMessage',(message)=>{
    console.log(message)

    const html=Mustache.render(locationMessageTemplate,{ 
        username:message.username,
        url:message.url, 
        createdAt:moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)

})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html

})


$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault() //prevent default behavour(browser refresh)
    $messageFormButton.setAttribute('disabled','disabled') //disable the form once it is submitted


    const message=e.target.elements.message.value

    socket.emit('sendMessage',message,(error)=>{

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error){
            return console.log(error)

        }
        console.log('Delivered')
    })
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')

    }

    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared')
        })
    }) 
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})
