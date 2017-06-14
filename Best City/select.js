  var imgID = {'climate': [0,0] ,
  'cost': [0,0] ,
  'health': [0,0] ,
  'pollution': [0,0] ,
  'property': [0,0] ,
  'purchase': [0,0] ,
  'safety': [0,0] ,
  'traffic': [0,0] };

  var selected =0;
  var selectedIMG =[];
    $('.rowUI').each(
      function(){
        $(this).click( function(){
            imgID[$(this)[0].id][0] ++; // count clicks for each img
            if(selected <3)
            {
                if(imgID[$(this)[0].id][0]%2){ //clicked count is odd
                selected ++;
                imgID[$(this)[0].id][1] = 1;  // odd clicked means selected 1
                $(this).attr('src', 'cityUI2/'+$(this)[0].id+'1.png');

              } else if(!(imgID[$(this)[0].id][0]%2)){  //clicked count is even
                selected --; //
                imgID[$(this)[0].id][1]= 0;  //not selected
                $(this).attr('src', 'cityUI2/'+$(this)[0].id+'0.png');
              }
              if(selected <3) { $('#start').hide();}
              else if (selected ==3) {
                $('#start').show();
                for (var j in imgID){
                  if (imgID[j][1]){
                    selectedIMG.push(j);
                  }
                }
                 console.log(selectedIMG);
                 localStorage.setItem('elements', selectedIMG);
                 selectedIMG=[];
              }
            }

              else if (selected ==3){
                $('#start').show();
                if(imgID[$(this)[0].id][1]){ // selected
                  $('#start').hide();
                  selected --;
                  imgID[$(this)[0].id][1]=0;
                $(this).attr('src', 'cityUI2/'+$(this)[0].id+'0.png');
              } else if(!(imgID[$(this)[0].id][1])){ //not selected
                imgID[$(this)[0].id][0] --;
                $(this).attr('src', 'cityUI2/'+$(this)[0].id+'0.png');
                }
                if(selected <0 ){ selected =0;}
              }
             console.log($(this)[0].id, imgID[$(this)[0].id][0], imgID[$(this)[0].id][1],selected);
            });

        $(this).hover( function(){
          if(selected <3 || imgID[$(this)[0].id][1]){
            $(this).attr('src', 'cityUI2/'+$(this)[0].id+'1.png');
          }else{
              $(this).attr('src', 'cityUI2/'+$(this)[0].id+'0.png');
            }
        }, function(){// unhover
          if(imgID[$(this)[0].id][1]) {
                $(this).attr('src', 'cityUI2/'+$(this)[0].id+'1.png');
              }
              else{
                $(this).attr('src', 'cityUI2/'+$(this)[0].id+'0.png');
              }
        })
      });
