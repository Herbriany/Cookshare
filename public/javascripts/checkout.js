var displayError = document.getElementById('card-errors');
function errorHandler(err){
    changeLoadingState(false);
  displayError.textContent = err;
} 

var orderData = {
  items: [{ id: "cookshare-product-payment" }],
  currency: "usd"
};

var stripe = Stripe("pk_test_AWp2bymA8nagxKyCil9n2rht002sJj4p7R");
var elements = stripe.elements();

var style = {
  base: {
    color: "#32325d",
    fontSize:"16px"
  }
};

var card = elements.create("card", { style: style });
card.mount("#card-element");

card.addEventListener('change', function(event) {
  if (event.error) {
    errorHandler(event.error.message);
  } else {
    errorHandler('');
  }
});

var form = document.getElementById('payment-form');

form.addEventListener('submit', function(ev) {
  ev.preventDefault();

  changeLoadingState(true);

  stripe
  .createPaymentMethod("card", card)
    .then(function(result) {
      if (result.error) {
        errorHandler(result.error.message);
      } 
      else {
        orderData.paymentMethodId = result.paymentMethod.id;
        
        return fetch("/pay", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "post": post._id
          },
          body: JSON.stringify(orderData)
        });
      }
  })
  .then(function(result) {
    return result.json();
  })
  .then(function(response) {
    if (response.error) {
      errorHandler(response.error);
    } else {
      // redirect to product page with success flash message
      console.log('Payment completed')
      changeLoadingState(false);
      window.location.href = '/paid?post='+post._id;
    }
  });
});

// Show a spinner on payment submission
function changeLoadingState(isLoading) {
    if (isLoading) {
        document.querySelector("button").disabled = true;
        document.querySelector("#spinner").classList.remove("hidden");
        document.querySelector("#button-text").classList.add("hidden");
    } else {
        document.querySelector("button").disabled = false;
        document.querySelector("#spinner").classList.add("hidden");
        document.querySelector("#button-text").classList.remove("hidden");
    }
  };