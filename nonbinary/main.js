$(document).ready(function() {


    var videoOpen = document.getElementById('ratDressVideo');
    var videoRoom = document.getElementById('ratRoom');
    var videoBoth = document.getElementById('bothRat');
    var videoBeautiful = document.getElementById('ratBeautiful');
    var audioHope = document.getElementById('ratHope');
    var audioFuture = document.getElementById('ratFuture');
    var bouncyArrow =  document.getElementById('bouncyArrow1');

    var anchorsLink = ['1stPage', '2ndPage', '3rdPage','4thPage','5thPage','6thPage','7thPage',
        '8thPage','9thPage','10thPage','11thPage','12thPage','13thPage','14thPage','15thPage'];


    var allAudio = document.getElementById('ratAllAudio'),
        allAudioSrc = document.getElementById('ratAudioSource');

    $('#nb-audiobtn').css( "opacity", 0);



    // var testAudio = audioBtn().audioObj('ratDressVideo').setAudioAttr('./imgs/ratDress.webm');
    // testAudio();

    $('#fullpage').fullpage({
        anchors: anchorsLink,
        // sectionsColor: ['#000', '#fff', '#fff'],
        scrollingSpeed: 1300,
        navigation: true,
        navigationPosition: 'right',
        autoScrolling: true,
        fitToSection: true,
        scrollOverflow: false,
        fixedElements:'#bouncyArrow1，#nb-note, #nb-audiobtn, #ShowNavBar',
        bigSectionsDestination: 'top',
        navigationTooltips: ['Start', 'Second page', 'Third page', 'Forth Page', 'Fifth Page', 'Sixth Page','Seventh Page',
            'Eighth Page','Ninth Page','10th Page','11th Page','12th Page','13th Page','14th Page','End'],
        afterLoad: function(anchorLink, index){
            if(index==1){
                videoOpen.play();
                bouncyArrow.style.opacity = 1;
                $('#nb-title').addClass('leftDivActive');
            }
            if(index==2){
                console.log('ratRoom show!');
                $('#section1 .intro').fadeIn(1500);
                videoRoom.play();
            }
            if(index == 3){
                $('#nb-audiobtn').css( "opacity", 1);
                var testAudio = audioBtn().setAudioAttr('./imgs/ratPoem_body.webm');
                testAudio();
            }
            if(index ==4){
                videoBoth.play();
            }
            if(index ==5){
                $('#section4 .intro').fadeIn(1500);
            }
            if(index ==6){
                $('#section5 .intro').fadeIn(1500);
            }
            if(index==7){
                $('#nb-audiobtn').css( "opacity", 1);
                var testAudio = audioBtn().setAudioAttr('./imgs/ratComeout.webm');
                testAudio();
            }
            if(index==8){
                $('#section7 .intro').fadeIn(1500);
            }
            if(index==9){
                $('#section8 .intro').fadeIn(1500);
                $('#nb-audiobtn').css( "opacity", 1);
                var testAudio = audioBtn().setAudioAttr('./imgs/rat_Misunderstanding.webm');
                testAudio();
                //document.getElementById('ratMisd').play();
            }
            if(index==10){
                $('#section9 .intro').fadeIn(1500);
            }
            if(index==12){
                $('#nb-audiobtn').css( "opacity", 1);
                var testAudio = audioBtn().setAudioAttr('./imgs/ratHope.webm');
                testAudio();
                //audioHope.play();
            }
            if(index==13){
                $('#section12 .intro').fadeIn(1500);
            }
            if(index==14){
                $('#section13 .intro').fadeIn(1500);
                var testAudio = audioBtn().audioObj('ratBeautiful').setAudioAttr('./imgs/ratBeautiful.webm');
                testAudio();
                 // videoBeautiful.play();
                $('#nb-audiobtn').css( "opacity", 1);
                // var testAudio = audioBtn().setAudioAttr('./imgs/ratBeautiful.webm');
                // testAudio();
                // bouncyArrow.style.opacity = 1;
            }
            if(index==15){
                $('#nb-audiobtn').css( "opacity", 1);
                var testAudio = audioBtn().audioObj('ratAllAudio').setAudioAttr('./imgs/ratFuture.webm');
                testAudio();
                //audioFuture.play();
                // bouncyArrow.style.opacity = 0;
            }
        },
        onLeave: function (index, nextIndex, direction) {
            if(index==1){
                console.log('index1 left');
                videoOpen.currentTime = 0;
                $('#nb-title').removeClass('leftDivActive');
            }
            if(index==2){
                $('#section1 .intro').fadeOut();
                videoRoom.currentTime = 0;
            }
            if(index==3){
                $('#nb-audiobtn').css( "opacity", 0);
                // document.getElementById('ratPoem_body').currentTime = 0;
                // document.getElementById('audioPlay1').src='./imgs/audio.png';
                allAudio.pause();
                allAudio.currentTime =0;
            }
            if(index==4){
                videoBoth.currentTime = 0;
                console.log('left');
                if($('#nb-note').hasClass('noteActive')){
                    $('#nb-note').removeClass('noteActive');
                }
            }
            if(index ==5){
                $('#section4 .intro').fadeOut();
            }
            if(index ==6){
                $('#section5 .intro').fadeOut();
            }
            if(index==7){
                // document.getElementById('ratComeout').currentTime=0;
                $('#nb-audiobtn').css( "opacity", 0);
                allAudio.pause();
                allAudio.currentTime =0;
            }
            if(index==8){
                $('#section7 .intro').fadeOut();
            }
            if(index==9){
                $('#section8 .intro').fadeOut();
                console.log('left9');
                allAudio.pause();
                allAudio.currentTime =0;
                $('#nb-audiobtn').css( "opacity", 0);
                // document.getElementById('ratMisd').currentTime=0;
                if($('#nb-note').hasClass('noteActive')){
                    console.log('has class');
                    $('#nb-note').removeClass('noteActive');
                }
            }
            if(index==10){
                $('#section9 .intro').fadeOut();
            }
            if(index=12){
                $('#nb-audiobtn').css( "opacity", 0);
                allAudio.pause();
                allAudio.currentTime =0;
                // audioHope.currentTime =0;
            }
            if(index==13){
                $('#section12 .intro').fadeOut();
            }
            if(index=14){
                $('#section13 .intro').fadeOut();
                // allAudio.currentTime =0;
                videoBeautiful.currentTime =0;
            }
            if(index=15){
                $('#nb-audiobtn').css( "opacity", 0);
                allAudio.pause();
                allAudio.currentTime =0;
                // audioFuture.currentTime =0;
            }
        },

        afterResponsive: function(isResponsive){

        }

    });

    $('#nb-btn1').on('click', function () {
        $('#nb-note').toggleClass('noteActive');
        console.log('toggleclass noteActive');
        $('.noteTitle').text('Non-binary');
        $('#note-content').html('<p>“Non-binary” is a term unfamiliar to many, but it has been adopted by a subset of transgender people who identify as neither male or female, or both male and female at the same time. Actresses like Caitlyn Jenner and Laverne Cox have helped bring the transgender community into the spotlight, paving the way for greater acceptance of their identities, but non-binary is a category much less well-known or understood.</p>');
    });

    $('#nb-btn2').on('click', function () {
        $('#nb-note').toggleClass('noteActive');
        console.log('toggleclass noteActive');
        $('.noteTitle').text('Struggles of the non-binary');
        $('#note-content').html('<img src="./imgs/nonbinaryGraphicFinal.png"/>');
    });

    $('#audioPlay1').on('click', function () {
            if(isPlaying('ratPoem_body')){
                this.src='./imgs/audioPause.png';
                document.getElementById('ratPoem_body').pause()
            }else{
                this.src='./imgs/audioplay.png';
                document.getElementById('ratPoem_body').play()
            }
    });

    // $('#nb-note').on('click', function () {
    //     $('#nb-note').toggleClass('noteActive');
    // });
    $('#closeDiv').on('click', function () {
        console.log('closeDivImg');
        $('#nb-note').toggleClass('noteActive');
    });

    $('#audioPlay2').on('click', function () {
        if(isPlaying('ratComeout')){
            this.src='./imgs/audioPause.png';
            document.getElementById('ratComeout').pause()
        }else{
            this.src='./imgs/audioplay.png';
            document.getElementById('ratComeout').play()
        }
    });
    $('#audioPlay3').on('click', function () {
        if(isPlaying('ratMisd')){
            this.src='./imgs/audioPause.png';
            document.getElementById('ratMisd').pause()
        }else{
            this.src='./imgs/audioplay.png';
            document.getElementById('ratMisd').play()
        }
    });
    $('#audioPlay4').on('click', function () {
        if(isPlaying('ratHope')){
            this.src='./imgs/audioPause.png';
            document.getElementById('ratHope').pause()
        }else{
            this.src='./imgs/audioplay.png';
            document.getElementById('ratHope').play()
        }
    });
    $('#audioPlay5').on('click', function () {
        if(isPlaying('ratFuture')){
            this.src='./imgs/audioPause.png';
            document.getElementById('ratFuture').pause()
        }else{
            this.src='./imgs/audioplay.png';
            document.getElementById('ratFuture').play()
        }
    });
    $('#section13').on('click', function () {
        var myVideo = document.getElementById('ratBeautiful');
        if (myVideo.paused)
            myVideo.play();
        else
            myVideo.pause();
    });

    document.getElementById('ratPoem_body').addEventListener("ended", function(){
        this.currentTime = 0;
        console.log("ended");
        document.getElementById('audioPlay1').src='./imgs/audio.png';
    });

    function isPlaying(playerId) {
        var player = document.getElementById(playerId);
        return !player.paused && !player.ended && 0 < player.currentTime;
    }

});