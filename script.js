var nameError = document.getElementById('name-error');
var emailError = document.getElementById('email-error');
var phoneError = document.getElementById('phone-error');
var messageError = document.getElementById('message-error');
var submitError = document.getElementById('submit-error');


function ValidateName(){

    var name = document.getElementById('name').value;

    if(name.length == 0){
        nameError.innerHTML = '*Name is required';
        document.getElementById('name').style.outline='2px solid red'
        return false;
    }
    if(name.length < 3){
        nameError.innerHTML = '*At least 3 characters';
        document.getElementById('name').style.outline='2px solid red'
        return false;
    }
    if(!name.match(/^[A-Za-z]*[A-Za-z]*(\s{1,}[A-Za-z]*)*$/)){
        nameError.innerHTML = 'Enter full name';
        document.getElementById('name').style.outline='2px solid red'
        return false;
    }
        nameError.innerHTML = '<i class=" bi bi-check-lg"></i>';
        document.getElementById('name').style.outline='2px solid green'
        return true;

}

function ValidateEmail(){
    var email = document.getElementById('email').value;
    if(email.length == 0){
        emailError.innerHTML = '*Email is required';
        document.getElementById('email').style.outline='2px solid red'
        return false;
        }
        if(!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)){
            emailError.innerHTML = 'Invalid email';
            document.getElementById('email').style.outline='2px solid red'
            return false;
            }
            emailError.innerHTML = '<i class="bi bi-check-lg"></i>';
            document.getElementById('email').style.outline='2px solid green'
            return true;
}

function ValidatePhone(){
    var phone = document.getElementById('phone').value;
    if(phone.length == 0){
        phoneError.innerHTML = '*Phone is required';
        document.getElementById('phone').style.outline='2px solid red'
        return false;
        }
    if(!phone.match(/^[0-9]{10}$/)){
        phoneError.innerHTML = 'Enter 10 digit phone number';
        document.getElementById('phone').style.outline='2px solid red'
        return false;
        }
    phoneError.innerHTML = '<i class="bi bi-check-lg"></i>';
    document.getElementById('phone').style.outline='2px solid green'
    return true;
}

function ValidateMessage(){
    var message = document.getElementById('message').value;
    var required = 30;
    var minus = required - message.length;

        if(message.length == 0){
        messageError.innerHTML = '*Message is required';
        document.getElementById('message').style.outline='2px solid red'
        return false;
        }
        if( minus > 0){
            messageError.innerHTML = minus + ' Charectors required'
            document.getElementById('message').style.outline='2px solid red'
            return false;
        }
        
        messageError.innerHTML = '<i class="bi bi-check-lg"></i>' ;
        document.getElementById('message').style.outline='2px solid green'
        return true;

       
}


function ValidateForm(){

    if(!ValidateName() || !ValidatePhone() || !ValidateEmail() || !ValidateMessage()){
        submitError.innerHTML = '*please fix all above'
        setTimeout(function(){submitError.style.display = 'none';}, 5000)
        // document.getElementById('message').style.outline='2px solid red'
        // document.getElementById('phone').style.outline='2px solid red'
        // document.getElementById('email').style.outline='2px solid red'
        // document.getElementById('name').style.outline='2px solid red'
        return false;
        
    }
}



