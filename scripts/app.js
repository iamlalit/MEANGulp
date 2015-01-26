var blogApp = angular.module('blogApp', []);

blogApp.controller('blogController', ['$scope', function($scope){
	$scope.call = function(){
		alert("here");
	}
}]);