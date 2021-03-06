



var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        $(document).ready(function(){
            swApp.init();
        });
        
    }
};


var swApp = new function(){

  this.apiURL = 'https://app.sea-watch.org/admin/public/';
  this.clientId;
  this.emergency_case_id;
  this.operation_area;
  this.last_signal_send; //last signal send to server timestamp in unixtime
  this.reloadInterval = 15000; //reload interval
  this.last_message_received = 0;
  this.reloadIntervalObj;
  
  this.init = function(){
  
        
  
        var self  = this;
  
        this.clientId = this.getClientId();
         //preload audio file
         $("#bing").trigger('load');
        //initial call on geolocation api
        var options = { timeout: 90000, enableHighAccuracy: true, maximumAge: 10000 };
        var timeout = setTimeout( function() {
            
            confirm('test');
            
            if (true) {
                
                self.showStartScreen();

                alert('wating for position....');
                navigator.geolocation.watchPosition (
                  function (position) {
                    var newPosition = {
                        timestamp: position.timestamp,
                        coords:position.coords
                    };


                    if(JSON.stringify(newPosition) === '{}'){
                        alert('can not track your position 1');
                    }
                    
                    var coords = {
                        "speed":position.coords.speeding,
                        "heading":position.coords.heading,
                        "altitudeAccuracy":position.coords.altitudeAccuracy,
                        "accuracy":position.coords.accuracy,
                        "altitude":position.coords.altitude,
                        "longitude":position.coords.longitude,
                        "latitude":position.coords.latitude
                    };
                    
                    alert('got position');
                    
                    $('body').attr('data-geo',JSON.stringify(coords));
                  },
                  function (error) {
                    var errorTypes = {
                      0: "Unknown error",
                      1: "Permission denied by user",
                      2: "Position is not available",
                      3: "Request timed out"
                    };

                    var errorMessage = errorTypes[error.code];

                    if (error.code == 0 || error.code == 2) {
                      errorMessage += (": " + error.message);
                    }

                    alert(errorMessage);
                  },options);
              }
              else {
                alert("Geolocation support is not available.");
              }
            
            
            
        },2000);
  
        
  
  
  
  };
  
  this.takePicture = function(){
   var self = this;
      
                this.sendMessage("img ");
      
    navigator.camera.getPicture(
                    //success function
                    function(imageData){
                        var image = "III" + imageData+"III";
                        self.sendMessage(image);
                    },
                    //error function
                    function(message){
                        this.sendMessage('Failed because: ' + message);
                        alert('Failed because: ' + message);

                    }, 
                    {
                        quality: 20,
                        destinationType: Camera.DestinationType.DATA_URL
                    }
            );
  };
  
  
  //will be called at startup to check if there are any
  //open cases for the device id
  this.checkForOpenCase = function(){
      var self = this;
      self.showMainScreen();

      return null;

      $.post(this.apiURL+'api/cases/checkForOpenCase', {'session_token':this.clientId}, function(result){
          
          var result = JSON.parse(result);
          if(result.data.emergency_case_id != null){
              
              self.loadOpenCase(result);
              
          }else{
              
              self.showMainScreen();
              
          }
      });
  };
  
  this.loadOpenCase = function(caseData){
      
      var self = this;
      this.handleCaseInformation(caseData, function(){
          self.showChatScreen();
          self.reload();
      });
      
  };
  
  
  this.getGUID = function(){
        //https://andywalpole.me/#!/blog/140739/using-javascript-create-guid-from-users-browser-information
        var nav = window.navigator;
        var screen = window.screen;
        var guid = nav.mimeTypes.length;
        guid += nav.userAgent.replace(/\D+/g, '');
        guid += nav.plugins.length;
        guid += screen.height || '';
        guid += screen.width || '';
        guid += screen.pixelDepth || '';
        return guid;
  };
  this.getClientId = function(){
      if(typeof device !=='undefined'){
        return device.uuid;
      }else{
          return this.getGUID();
      }
  };
  
  this.reload= function(){
      var self = this;
      api.query(this.apiURL+'api/reloadApp', {last_message_received: this.last_message_received, emergency_case_id:this.emergency_case_id, geo_data:$('body').attr('data-geo')},function(result){
          if(result.error != null){
              alert(result.error);
          }else{
            self.setStatusMonitorNow();
            $.each(result.data.messages,function(index, value){
                var type = 'received';
                if(value.sender_type === 'refugee'){
                    type = 'sent';
                }
                self.pushChatMessage({type:type, message:value.message, message_id:value.id});
            });
          }
      });
  };
  this.initReload = function(){
      var self = this;
      this.reloadIntervalObj = setInterval(function() {
                                                    self.reload();
      }, this.reloadInterval);
  }
  
  this.showStartScreen = function(){
      var self = this;
      
      loadAfter($('body header'),'views/index.html',function(){
        $('body header').hide();
        $('body').removeClass('screen_app');
        $('body').addClass('screen_start');
        $('.language_selector__selector li a').click(function(e){
            e.preventDefault();
            //when the language is selected
            //it will be checked if there are
            //open cases with the uuid.
            //if not showMainScreen() is called
            self.checkForOpenCase();
        });
      });
      
  };
  
  this.confirmCall = function(cb){
      
      $('#presend').show();
      $('#presend form').submit(function(e){
        e.preventDefault();
        if (confirm("Are you sure to send an emergency callll?")) {
            cb();
        }
      });
      
  };
  
  this.showMainScreen = function(){
      var self = this;
      
      loadAfter($('body header'), 'views/app.html', function(){
          $('body header').show();
          
          
          
          //change classes
          $('body').removeClass('screen_start');
          $('body').addClass('screen_app');
          //init click handler
          $('.sos a').bind('click',function(e){
              e.preventDefault();
              
              if(typeof $('body').attr('data-geo') === 'undefined'){
                  alert('your connection hasn\'t been tracked yet. please wait');
              }else{
                self.confirmCall(function(){
                     //proceed
                     $('.sos a').unbind('click');
                     $('.sos a').click(function(e){
                         e.preventDefault();
                         alert('your request is pending... please wait');
                     });
                     alert('before send');
                     self.sendEmergencyCall(function(){
                       self.showChatScreen();
                     });
                });
              }
               
          });
      });
  };
  this.sendMessage = function(message){
      var self = this;
      this.submitChatMessage({message:message,'callback':function(result){
                      
                      var result = JSON.parse(result);
                      if(result.error != null){
                          alert(result.error);
                      }else{
                            self.pushChatMessage({type:'sent', message:message, message_id:result.data.emergency_case_message_id});
                            self.last_message_received = result.data.emergency_case_message_id;
                            $('.form_inline form input[type=text]').val('');
                      }
              }});
  };
  this.showChatScreen = function(){
      var self = this;
      
      var savedMessages = {};
      
      $('body').removeClass('screen_start');
      $('body').addClass('screen_app');
      
      loadAfter($('body header'), 'views/messenger.html', function(){
          
          self.pushChatMessage({type:'received', message:'Hello, we received your emergency call. Right now you are in are in the operation area '+self.operation_area+'. Your Case-ID is '+self.emergency_case_id+'. Please keep you App opened and follow the instructions.'});
          
          self.initReload();
          
          //init click on back button
          $('.info').click(function(e){
              e.preventDefault();
              self.showMainScreen();
          });
          
          $('.close_chat').click(function(e){
              e.preventDefault();
              
              $('#closeCaseOverlay').show();
              
              $('#closeCaseOverlay button').click(function(){
                  
                  self.closeCase(self.emergency_case_id,$('#closeCaseOverlay select').val(), function(){
                    $('.closeCaseOverlay').hide();
                      
                    self.showMainScreen();
                  });
                  
              });
          });
          $('.take_picture').click(function(e){
              e.preventDefault();
              self.takePicture();
          });
          
          //init sending 
          $('.form_inline form').submit(function(e){
              e.preventDefault();
              self.sendMessage( $('.form_inline form input[type=text]').val());
          });
          
          
      });
  };
  
  this.handleCaseInformation = function(result, callback){
      
        var self = this;
        
        console.log(result);
       //init chat session
       //self.openEmergencySession(result.data.emergency_case_id);
       this.emergency_case_id = parseInt(result.data.emergency_case_id);
       
       this.operation_area = parseInt(result.data.operation_area);
       
       setInterval(function(){
           self.checkConnection();
           self.updateStatusMonitor();
       }, 5000);
       
       callback();
      
  };
  
  this.sendEmergencyCall = function(callback){
    var self = this;
    var data = {
            /*'status':$('#boat_status').val(),
            'condition':$('#boat_condition').val(),
            'boat_type':$('#boat_type').val(),
            'other_involved':$('#other_involved').is('checked'),
            'engine_working':$('#engine_working').is('checked'),
            'passenger_count':$('#passenger_count').val(),
            'additional_informations':$('#additional_informations').val(),
            'spotting_distance':$('#spotting_distance').val(),
            'spotting_direction':$('#spotting_direction').val(),
            'picture':$('#picture').val(),*/
            'source_type':'refugee',
            'session_token':self.clientId,
            'location_data':$('body').attr('data-geo')
    };
    var self = this;
    //send api call
    $.post(self.apiURL+'api/cases/create', data, function(result){
        
        alert(result);
        
        var result = JSON.parse(result);
        self.setStatusMonitorNow();
        if(result.error == null){
            self.handleCaseInformation(result, callback);
        }else{
            if(result.error === 'no_operation_area'){
                alert('the location you submitted is not in a operation_area of the sea watch');
            } 
        }
    });
  };
  
  this.submitChatMessage = function(options){
      
      api.query(this.apiURL+'api/messages/send',{emergency_case_id: this.emergency_case_id ,sender_type:'refugee',sender_id:this.client_id,message:options.message,'geo_data':$('body').attr('data-geo')},function(result){
          if(typeof options.callback === 'function')
              options.callback(result);
      });
      
  };
  this.pushChatMessage = function(options){
      console.log(options);
      var divClass, pClass;
      pClass = '';
    if(options.type == 'sent'){
        divClass = "user_2 message";
    }
    if(options.type == 'received'){
        this.bing();
        divClass = "user_1 message";
    }
    if(options.type == 'notification'){
        divClass = "chat_status_notification";
        pClass = 'meta';
    }
    
    //check if message is base64 image
    //@sec base64 xss possible?: https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
     var matches = options.message.match(/III(.+?)III/g);
    if(matches != null){
        options.message = '<img class="chatImage" src="data:image/jpeg;base64,'+matches[0].replace(/III/g,'').replace('"','\"')+'">';
        console.log(options.message);
    }
    
    var html = '<div class="'+divClass+'" data-id="'+options.message_id+'">'
        html += '    <p class="'+pClass+'">'+options.message+'</p>';
        html += '</div>';
        
      if($('.message[data-id='+options.message_id+']').length === 0){
        $('.messenger__chat').append(html);
      }
  };
  
  this.checkConnection = function(){
      if(true){
          $('.status_monitor__connection').html('Stable Connection');
      }
      
  };
  
  this.setStatusMonitorNow = function(){
      var now = Math.round(new Date().getTime()/1000);
      $('.status_monitor__gps').attr('data-last-updated', now).html('Sent Position 1s ago');
  };
  this.updateStatusMonitor = function(){
      var diff = Math.round(new Date().getTime()/1000-parseInt($('.status_monitor__gps').attr('data-last-updated')));
      
      $('.status_monitor__gps').html('Send Position '+diff+'s ago');
  };
  this.updateLanguage = function(language){
  };
  
  
  this.closeCase = function(case_id, reason, callback){
      
      api.query(this.apiURL+'api/cases/closeCase', {case_id:case_id, reason:reason},function(result){
          
          callback(result);
          
      });
      
  };
  
  this.bing = function(){
    $("#bing").trigger('play');
  };

};

var isApp = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
if ( isApp ) {
    // PhoneGap application
    app.initialize();
} else {
    // Web page
    swApp.init();
}  
