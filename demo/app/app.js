(function() {
  angular
    .module('app', [])
    .controller('AppController',['$http', function($http) {
      this.pay = function pay() {
        var amount = this.amount;
        $http.post('/pay', { amount: amount }).then(function(response) {
          var url = response.data.url;
          window.location.href = url;
        });
      };

      this.another = function another() {
        this.transaction = null;
        this.transactionId = null;
        window.location.href = '/app';
      };

      this.transactionId = window.location.search.split('=')[1];
      if (this.transactionId) {
        this.loading = true;
        $http.get('/transactions/' + this.transactionId).then(function(response) {
          this.loading = false;
          this.transaction = response.data;
        }.bind(this));
      }
    }]);
})();
