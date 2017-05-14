(function() {
  var contentDiv = document.querySelector('.content');
  contentDiv.innerHTML = 'Loading...';

  var transactionId = window.location.search.split('=')[1];
  if (transactionId) {
    axios.get('/transactions/' + transactionId).then(function(response) {
      var transaction = response.data.transaction;
      if (!transaction) {
        contentDiv.innerHTML =
          'Transaction with ID ' + transactionId + ' not found.' +
          '<button class="another">Another</button>';
      } else {
        contentDiv.innerHTML =
          'Transaction with ID ' + transactionId + ' completed.' +
          '<ul>' +
          '<li>Succeeded: ' + (transaction.success ? 'Yes' : 'No') + '</li>' +
          '<li>Date: ' + transaction.date + '</li>' +
          '<li>Amount: ' + transaction.amount + ' ' + transaction.currency + '</li>' +
          '</ul>' +
          '<button class="another">Another</button>';
      }

      var anotherButton = document.querySelector('.another');
      return anotherButton.addEventListener('click', function(event) {
        window.location.href = '/app';
      });
    });
  } else {
    contentDiv.innerHTML =
      '<span>Enter amount</span> ' +
      '<input class="amount" type="number" value="1337"> HUF ' +
      '<button class="pay">Pay at Otpbank</button>';
    var payButton = document.querySelector('.pay');
    payButton.addEventListener('click', function(event) {
      var amountInput = document.querySelector('.amount');
      var payButton = document.querySelector('.pay');
      var amount = amountInput.value;

      return axios.post('/pay', { amount: amount }).then(function(response) {
        var url = response.data.url;
        window.location.href = url;
      });
    });
  }
})();
