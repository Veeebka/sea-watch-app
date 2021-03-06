
  var urlBase = 'https://app.sea-watch.org/admin/public/api/';
var currentPosition = {};
var updatePosition = true;
angular.module('sw_spotter.controllers', [])


.controller('MenuCtrl', function($scope, $controller, $interval) {
    
    
  $scope.menuObj = {};
  $scope.menuObj.trackPosition = updatePosition;
  $scope.logout = function(){
      window.localStorage.clear();
  }
  $scope.getTrackingStatus = function(){
      updatePosition = $scope.menuObj.trackPosition;
      return updatePosition;
  };
    
})
.controller('CaseChatCtrl', function($scope, $controller, $state, $http, $ionicScrollDelegate) {
    
    console.log('showing chat for case #'+$state.params.caseId);
    $ionicScrollDelegate.$getByHandle('chat').scrollBottom();
    $controller('CasesCtrl', {$scope: $scope}); //This works
    $controller('CaseCtrl', {$scope: $scope}); //This works
    $scope.case = $scope.getSingleCaseObj($state.params.caseId);
    $scope.chatInput = 'type something';
    $scope.parseMessage = function(message){
        
        return message;
        
        var matches = message.match(/III(.+?)III/g);
        if(matches != null){
            message = '<img class="chatImage" src="data:image/jpeg;base64,'+matches[0].replace(/III/g,'').replace('"','\"')+'">';
            
        }
        return message;
    };
    $scope.sendMessage = function(){
        $http({
            url: urlBase+'cases/sendMessageCrew',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer '+window.localStorage['jwt']
            },
            data: {
                case_id: $state.params.caseId,
                message: $scope.chatInput,
                sender_type: 'spotter'
            }
        }).then(function(response) {
              if(!response.data.error){
                $scope.chatInput = '';
                
                $ionicScrollDelegate.$getByHandle('chat').scrollBottom();
              }else{
                  alert(response.error);
              }
        }, function(error) {
              alert(error.data);
        });
    };
})
     
.controller('AppCtrl', function($scope, $controller, $ionicModal, $interval, $cordovaGeolocation, $timeout, $http, $state) {

  $controller('VehicleCtrl', {$scope: $scope}); //This works
  $controller('CasesCtrl', {$scope: $scope}); //This works
  $controller('MenuCtrl', {$scope: $scope}); //This works
  var stopUpdateLocation;
  $scope.startLocationUpdater = function() {
      
      
    // Don't start a new fight if we are already fighting
    if ( angular.isDefined(stopUpdateLocation) ) return;
          stopUpdateLocation = $interval(function() {
              
              console.log('update location...');
              if(typeof window.localStorage['jwt'] == 'undefined'){
                  console.log('no auth token, show login');
                  $scope.login();
              }else{
                  
                  if(updatePosition)
                    $scope.updateVehiclePosition(function(){
                        
                        console.log($scope.getTrackingStatus());
                        console.log('done location...');
                    });
                  
              }
              
          }, 10000);
  };

  $scope.stopLocationUpdater = function() {
          if (angular.isDefined(stop)) {
            $interval.cancel(stop);
            stop = undefined;
          }
  };
  
  
  //wait for position to be tracked
  //when tracked->initLocationUpdater
  if(typeof $scope.updatePositionInited == 'undefined')
    $scope.updatePositionInited = false;
  var stopWatchPosition = $scope.$watch('position',function(position) {
      
        
      if ($scope.updatePositionInited )return;
      if(position) {
          
        $scope.updatePositionInited = true;
        $scope.startLocationUpdater();
        stopWatchPosition();
      }
  });
  
  //userdata
  $scope.loginData = {
      token:window.localStorage['jwt']
  };

  $scope.position = {};

  $scope.initModal = function(cb){
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
      cb();
    });
  }

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    if(typeof $scope.modal == 'undefined'||!$scope.modal._isShown)
    $scope.initModal(function(){


      $scope.modal.show();

    });
  };


  $scope.init = function(){
    
    window.plugin.backgroundMode.enable();
    
    
    
    
    
    if(typeof $scope.loginData.token === 'undefined'){
      console.log('not logged in');
      $scope.login();
    }else{
      console.log('logged in');
        //check if token needs to be refreshed
                $http({
                method: 'POST',
                url: urlBase+'user/token',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer '+window.localStorage['jwt']
                },
                data: {session_token: 1337, position:'fuck you'}
            }).then(function(response) {
                if(!response.data.error){
                  console.log(response);
                  window.localStorage['jwt'] = response.data.token;
                  console.log('token updated');
                }else{
                    console.log(response.error);
                }
            }, function(error) {
                console.log('Some error occured during the authentification with stored token:');
                console.log(error);
              
                $scope.login();
            });
    }
    
    
    
    
    //init positionwatch
    var watch = $cordovaGeolocation.watchPosition({
      timeout : 10000,
      enableHighAccuracy: true // may cause errors if true
    });

    watch.then(
      null,
      function(err) {
        // error
      },
      function(position) {
        console.log('position tracked:');
        console.log(position.coords);
        $scope.position = position;
        currentPosition = position;
    });

  };



  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
      
    
    console.log('Doing login', $scope.loginData);
    $http({
      url: urlBase+'user/auth',
      method: 'POST',
      data: $scope.loginData
    }).then(function(response) {
        if(!response.data.error){
          console.log(response);
          window.localStorage['jwt'] = response.data.token;
          window.localStorage['user'] = response.data.user_id;
          $scope.closeLogin();
          $state.go('app.overview');
        }else{
            alert(response.error);
        }
    }, function(error) {
        alert(error.error);
    });
           

    
  };
})



.controller('CasesCtrl',['$scope', 'dataService', '$controller', '$interval', function ($scope, dataFactory, $controller, $interval) {

  $scope.cases;

  //check if cases still need to be loaded
  //so that the request isnt sent several times
  if(typeof $scope.loadCases == 'undefined')
    $scope.loadCases = true;

  $scope.getCases = function(cb) {

        $scope.loadCases = false;
        dataFactory.getCases()
            .success(function (result) {
                $scope.cases = result.data.emergency_cases;
                console.log($scope.cases);
                console.log($scope.getReloadObj());
                if(typeof cb === 'function'){
                  cb();
                }
            })
            .error(function (error) {
              if(error !== null)
                $scope.status = 'Unable to load customer data: ' + error.message;
            });
  };
  
  
  $scope.pushMessagesToCase = function(case_id, messages){
      
      angular.forEach($scope.cases, function(case_data, key) {
          if(case_data.id == case_id){
              angular.forEach(messages, function(message){
                  $scope.cases[key].messages.push(message);
              });
              console.log($scope.cases[key]);
          }
      });
      console.log($scope.cases);
  };
  
  
  
  
  
  
  
  //creates object of
  //{caseid:highestMessageId, caseid2:highestMessageId2}
  $scope.getReloadObj = function(){
      var result = {};
      
      //loop through all cases and get the highest id
      angular.forEach($scope.cases, function(value, key) {
          
        //if object isn set, start with 0
        if(typeof result[value.id] === 'undefined')
            result[value.id] = {last_message_received: 0, updated_at:value.updated_at};
        
        angular.forEach(value.messages, function(mValue, mKey){
            if(parseInt(mValue.id)>result[value.id].last_message_received){
                result[value.id] = {last_message_received: parseInt(mValue.id), updated_at:mValue.updated_at};
            }
        });
      });
      return result;
  };
  
  if($scope.loadCases){
    console.log('init Loading');
    $scope.getCases();
  }
  
  $scope.reloadState = true;
  
  
  $scope.reloadCases = function() {
        var options = {
            cases:$scope.getReloadObj()
        }
        dataFactory.updateCases(options)
            .success(function (result) {
                console.log(result);
                if(result){
                    //alert('update cases now!');
                    angular.forEach(result, function(case_values, case_id) {
                      console.log(case_id);
                      console.log(case_values.messages);
                      $scope.pushMessagesToCase(case_id, case_values.messages);
                    });
                    
                    console.log(result);
                }
                console.log('... updating cases done');
            })
            .error(function (error) {
              if(error !== null)
                console.log(error);
            });
  }
  
  var stopReload;
  $scope.initReload = function() {
      
      
    // Don't start a new fight if we are already fighting
    if ( angular.isDefined(stopReload) ) return;
          console.log('inniting reload');
          stopReload = $interval(function() {
              
              console.log('updating cases...');
              if(typeof window.localStorage['jwt'] == 'undefined'){
                  console.log('no auth token, show login');
                  $scope.login();
              }else{
                  $scope.reloadCases();
              }
              
          }, 15000);
  };
   
  //wait for position to be tracked
  //when tracked->initLocationUpdater
  if(typeof $scope.reloadInited == 'undefined')
    $scope.reloadInited = false;

  var stopWatchForReload = $scope.$watch('cases',function(cases) {
      
        
      if ($scope.reloadInited )return;
      if(cases) {
          
        $scope.reloadInited = true;
        $scope.initReload();
        stopWatchForReload();
      }
  });
  $scope.predicate = 'updated_at';
  $scope.reverse = true;
  $scope.order = function(predicate) {
      $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
      $scope.predicate = predicate;
  };
  
  
  
  
}]).

controller('CreateCaseCtr',function($scope, $controller, Camera, dataService){


  $scope.createCase = function(){


        $controller('AppCtrl', {$scope: $scope});
        $scope.case = {};
        //add source type to scope
        $scope.case.source_type = 'spotter_app';
        $scope.case.location_data = {accuracy:currentPosition.coords.accuracy, altitudeAccuracy: currentPosition.coords.altitudeAccuracy, heading: currentPosition.coords.heading,  speed: currentPosition.coords.speed,  latitude: currentPosition.coords.latitude,  longitude: currentPosition.coords.longitude};
        dataService.createCase({params:$scope.case})
            .success(function (result) {

                //push result
                console.log(result);
                if(typeof cb === 'function'){
                  cb();
                }
            })
            .error(function (error) {
              if(error !== null)
                $scope.status = 'Unable to load customer data: ' + error.message;
            });

          console.log($scope.case);
  }
})

.controller('CaseCtrl', function($scope, $stateParams,$controller,$http, Camera, dataService) {

  $controller('CasesCtrl', {$scope: $scope});
  $controller('AppCtrl', {$scope: $scope});

  //returns single case object by id
  //taken from $scope.cases
  $scope.getSingleCaseObj = function(case_id){
      var result = null
          angular.forEach($scope.cases, function(case_values, key) {
            if(case_values.id == case_id){
               result = case_values;
            }
          });
          return result;
  };

  $scope.getlastLocation = function(case_id){

    var case_data = {};
    angular.forEach($scope.cases, function(case_values, key) {
      if(case_values.id == case_id){
        case_data = case_values;
      }
    });
    return case_data.locations[case_data.locations.length-1];
  };

  //there must be a better way...
  if(typeof $stateParams.caseId !== 'undefined')
    var case_id = $stateParams.caseId;


    //wait for cases to be loaded
    var stopWatching = $scope.$watch('cases',function(cases) {
      if(cases) {
          
          $scope.case = $scope.getSingleCaseObj(case_id);
          
          $scope.case.lastLocation = $scope.getlastLocation(case_id+1);
         stopWatching();
      }
    });







  $scope.takePicture = function() {
    console.log('$scope.takePicture() initted, if app crashes => no browser support html5 cam');
    Camera.getPicture().then(function(imageURI) {
      console.log(imageURI);
    }, function(err) {
      console.err(err);
    });
  }

  $scope.createCase = function(){

        //add source type to scope
        $scope.case.source_type = 'spotter_app';
        $scope.case.location_data = {accuracy:$scope.position.coords.accuracy,altitude:$scope.position.coords.altitude,latitude:$scope.position.coords.latitude, longitude:$scope.position.coords.longitude};
        dataService.createCase({params:$scope.case})
            .success(function (result) {

                //push result
                console.log(result);
                if(typeof cb === 'function'){
                  cb();
                }
            })
            .error(function (error) {
              if(error !== null)
                $scope.status = 'Unable to load customer data: ' + error.message;
            });

    console.log($scope.case);
  };
  
  $scope.updateCaseDetail = function(){
      console.log($scope.case);
      
          $http({
            method: 'PUT',
            url: urlBase+'case/'+$scope.case.id,
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer '+window.localStorage['jwt']
            },
            data: $scope.case
          }).then(function(response) {
                alert('Details updated');
                if(!response.data.error){
                  console.log(response);
                }else{
                    console.log(response.error);
                }
            }, function(error) {
                console.log('Some error occured while updating the case:');
                console.log(error);
            });
          
  };
  $scope.updateCaseLocation = function(){
      console.log(currentPosition);
      if(typeof currentPosition.coords == 'undefined'){
          alert('your position can not be tracked');
          return true;
      }
          $http({
            method: 'PUT',
            url: urlBase+'caseLocation/'+$scope.case.id,
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer '+window.localStorage['jwt']
            },
            data: {
                spotting_distance:$scope.case.spotting_distance,
                spotting_direction:$scope.case.spotting_direction,
                //strange geolocation object needs this transformation:
                position:{accuracy:currentPosition.coords.accuracy, altitudeAccuracy: currentPosition.coords.altitudeAccuracy, heading: currentPosition.coords.heading,  speed: currentPosition.coords.speed,  latitude: currentPosition.coords.latitude,  longitude: currentPosition.coords.longitude}
            }
          }).then(function(response) {
                if(!response.data.error){
                  alert('Position updated');
                }else{
                    console.log(response.error);
                }
            }, function(error) {
                console.log('Some error occured while updating the case:');
                console.log(error);
            });
          
  };
});