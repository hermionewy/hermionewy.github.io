function changePic(d){
  document.getElementById('preview').src = d.src;
}
function changePic2(d){
    document.getElementById('preview2').src = d.src;
}

function textChange(d){
  document.getElementById('introOne').innerHTML='Designing '+ d.alt + ' will be $20 per hour.<br /> You can get a 10% discount for more than one project.<br /> You can estimate the price below.<br />Please fill in the form below to get further information.';
}

function moveText(d){
  document.getElementById('introOne').innerHTML='';
}

function requestEstimate() {
  var cost = 0;
    var errorOne = document.getElementById("errorOne"),
        errorTwo = document.getElementById('errorTwo'),
        errorThree = document.getElementById('errorThree');
    errorOne.innerHTML = "";
    errorTwo.innerHTML = "";
    errorThree.innerHTML = "";
    document.getElementById("estimate").innerHTML = "";

    var logoCount = document.getElementById("logoCount").value;
    var uiviCount = document.getElementById('uiviCount').value;
    var webCount = document.getElementById('webCount').value;

    var logoCheck = document.getElementById("logoCheck").checked;
    var uiviCheck = document.getElementById('uiviCheck').checked;
    var webCheck = document.getElementById('webCheck').checked;

    var captcha= document.getElementById('captcha');
    if(captcha.value.toUpperCase()!='QGPHJD'){
        captcha.focus();
        document.getElementById("estimate").innerHTML = "Please type in the right letters!";
        return 0;}
    if(logoCheck + uiviCheck + webCheck == 0){
      document.getElementById("estimate").innerHTML = "Please check your project.";
      return 0;
    }

    if(logoCheck){
      if(logoCount== "" || logoCount < 1 || logoCount > 20 || isNaN(logoCount)){
        errorOne.innerHTML ="Please enter a number between 1 and 20.";
        document.getElementById("estimate").innerHTML = "No Estimate Available";
        return;
      } else {
        cost= 20* logoCount;
      }
    }
    if(uiviCheck){
      if(uiviCount== "" || uiviCount < 5 || uiviCount > 30 || isNaN(uiviCount)){
        errorTwo.innerHTML ="Please enter a number between 5 and 30.";
        document.getElementById("estimate").innerHTML = "No Estimate Available";
        return;
      } else {
        cost += 20* uiviCount;
      }
    }
    if(webCheck){
      if(webCount== "" || webCount < 20 || webCount > 100 || isNaN(webCount)){
        errorThree.innerHTML ="Please enter a number between 20 and 100.";
        document.getElementById("estimate").innerHTML = "No Estimate Available";
        return;
      } else {
        cost += 20* webCount;
      }
    }
    if(logoCheck+uiviCheck+webCheck>1){
      cost=0.9*cost;
    }
    document.getElementById("estimate").innerHTML = "Estimate price: "+ cost;

}
