class Cryptocurrency {
  constructor(
    id,
    symbol,
    name,
    image,
    current_price,
    price_change_percentage_24h
  ) {
    this.id = id;
    this.symbol = symbol;
    this.name = name;
    this.image = image;
    this.current_price = current_price;
    this.price_change_percentage_24h = price_change_percentage_24h;
  }
}

class UserCryptocurrency {
  constructor(id, symbol, name, image, totalCryptocurrency) {
    this.id = id;
    this.symbol = symbol;
    this.name = name;
    this.image = image;
    this.totalCryptocurrency = parseFloat(totalCryptocurrency);
  }
}

class Wallet {
  constructor() {
    this.userCryptocurrencies = new Map();
  }

  insertCryptocurrency = (c) => {
    if (this.userCryptocurrencies.get(c.id.toString())) {
      let userCrypto = this.userCryptocurrencies.get(c.id);
      userCrypto.totalCryptocurrency += c.totalCryptocurrency;
    } else {
      this.userCryptocurrencies.set(c.id, c);
    }
  };
}

class Billing {
  constructor(
    date,
    cryptocurrency,
    amount,
    type,
    cFee,
    sFee,
    totalCryptoToBuy
  ) {
    this.date = date;
    this.cryptocurrency = cryptocurrency;
    this.amount = amount;
    this.type = type;
    this.cFee = cFee;
    this.sFee = sFee;
    this.totalCrypto = totalCryptoToBuy;
  }
}

class User {
  constructor(name, lastname, accountBalance) {
    this.name = name;
    this.lastname = lastname;
    this.accountBalance = parseFloat(accountBalance);
  }
}

// Global Variables

var modalAmountToBuy = document.getElementById("modalAmountToBuy");

var alertPlaceholder = document.getElementById("modalAlert");
alertPlaceholder.style.display = "none";

var alertTrigger = document.getElementById("liveAlertBtn");

var cryptoList = document.getElementById("cryptoList");

var shoppingHistory = document.getElementById("shoppingHistory");

var userWallet = document.getElementById("userWallet");

var userWallet = document.getElementById("userWalletContainer");

var homeNav = document.getElementById("homeNav");

var activityNav = document.getElementById("activityNav");

var walletNav = document.getElementById("walletNav");

var modalBuyBtn = document.getElementById("modalBuyBtn");

var user;
var amountToBuy;
var sFee;
var cFee;
var totalCryptoToBuy;
var operationType;
var cryptocurrencies = [];
var billingList = [];
var cryptoSelected;

var wallet = new Wallet();

/********** My Data in Local Storage **********/

if (!localStorage.getItem("user")) {
  user = new User("Juan", "Perez", 5500);
  localStorage.setItem("user", JSON.stringify(user));
} else {
  user = JSON.parse(localStorage.getItem("user"));
}

if (localStorage.getItem("billing")) {
  billingList = JSON.parse(localStorage.getItem("billing"));
}

if (localStorage.getItem("userWallet")) {
  wallet.userCryptocurrencies = new Map(JSON.parse(localStorage.userWallet));
}

// ******************** API ********************

const URLGET =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1";

$.ajax({
  method: "GET",
  url: URLGET,
  success: function (res) {
    // Show Spinner
    document.getElementById("spinner").style.display = "block";

    // API Response
    // console.log(res);
    res.forEach((e) => {
      cryptocurrencies.push(
        new Cryptocurrency(
          e.id,
          e.symbol,
          e.name,
          e.image,
          e.current_price,
          e.price_change_percentage_24h
        )
      );
    });

    buildCryptoList();

    // Hide Spinner
    document.getElementById("spinner").style.display = "none";
  },
  error: function () {
    console.log("API Error");
  },
});

// ******************** Functions ********************

const getCurrentDay = () => {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();

  return dd + "/" + mm + "/" + yyyy;
};

const validateAmount = (amount) => {
  return parseFloat(amount) ? true : false;
};

const validateAccountBalance = (amount) => {
  return parseFloat(amount) <= user.accountBalance;
};

const countryFee = (a) => parseFloat((parseFloat(a) * 0.21).toFixed(2));

const siteFee = (a) => parseFloat((parseFloat(a) * 0.01).toFixed(2));

const validSymbol = (l, s) => {
  return l.find((e) => e.symbol == s);
};

const getCryptocurrency = (id) => {
  let crypto;
  cryptocurrencies.forEach((e) => {
    e.id == id ? (crypto = e) : null;
  });
  return crypto;
};

const cleanModal = () => {
  modalAmountToBuy.value = "";
  modalBuyBtn.disabled = true;
};

const billingProcess = () => {
  let billing = new Billing(
    getCurrentDay(),
    cryptoSelected,
    amountToBuy,
    operationType,
    sFee,
    cFee,
    totalCryptoToBuy
  );
  billingList.push(billing);
  localStorage.setItem("billing", JSON.stringify(billingList));
  addCryptoToWallet();
};

const calculateFees = () => {
  amountToBuy = document.getElementById("modalAmountToBuy").value;

  if (validateAmount(amountToBuy) && validateAccountBalance(amountToBuy)) {
    hideModalAlert();

    document.getElementById("modalFeesLbl").style.display = "block";

    sFee = siteFee(amountToBuy);
    cFee = countryFee(sFee);

    totalCryptoToBuy = (
      parseFloat(amountToBuy) / parseFloat(cryptoSelected.current_price)
    ).toFixed(5);

    document.getElementById("modalSiteFee").innerHTML = `$ ${sFee}`;
    document.getElementById("modalCountryFee").innerHTML = `$ ${cFee}`;
    document.getElementById("modalTotalFee").innerHTML =
      `Total ` +
      `${cryptoSelected.symbol.toUpperCase()} ` +
      `${totalCryptoToBuy}`;

    modalBuyBtn.disabled = false;
  } else {
    showModalAlert("Invalida field");
  }
};

const updateUserAvailableAmount = () => {
  user.accountBalance = JSON.parse(localStorage.getItem("user")).accountBalance;
  document.getElementById("availableAmountNav").value =
    "$ " + user.accountBalance;
};

const addCryptoToWallet = () => {
  let userCryptocurrency = new UserCryptocurrency(
    cryptoSelected.id,
    cryptoSelected.symbol,
    cryptoSelected.name,
    cryptoSelected.image,
    totalCryptoToBuy
  );

  wallet.insertCryptocurrency(userCryptocurrency);

  localStorage.userWallet = JSON.stringify(Array.from(wallet.userCryptocurrencies.entries()));
};

// ************************** Builders **************************

const buildCryptoList = () => {
  let cryptoListContainer = document.getElementById("cryptoListContainer");
  cryptocurrencies.forEach((e) => {
    let cardContainer = document.createElement("div");
    cardContainer.classList = ["card crypto__card text-center"];

    cardContainer.innerHTML = `
          <a id="${
            e.id
          }" class="p-5" data-bs-toggle="modal" data-bs-target="#modalShop">
              <div class="card-body">
                  <div>
                      <div>
                          <img src="${e.image}" class="img-fluid crypto-img-m">
                      </div>
                      <div class="card-title my-4">
                          <h2 id="symbol"> ${e.symbol.toUpperCase()} </h2>
                      </div>
                      <div class="card-subtitle">
                          <h3 id="price">$ ${e.current_price} </h3>
                      </div> 
                  </div>
              </div>
          </a>
    `;

    cryptoListContainer.appendChild(cardContainer);

    let card = document.getElementById(e.id);
    card.addEventListener("click", function () {
      // console.log(e);
      buildModal(e);
    });
  });
};

const buildShoppingHistory = () => {
  $("#shoppingHistoryTableBody").empty();

  for (const bill of billingList) {
    let opType;

    if (bill.type == "BUY") {
      opType = '<th class="text-success"> Buy </th>';
    } else {
      opType = '<th class="text-danger"> Sell </th>';
    }

    $("#shoppingHistoryTableBody").append(`
    <tr>
      <td> ${bill.date} </td>
      ${opType}
      <td><img src="${
        bill.cryptocurrency.image
      }" class="crypto-img-s">  ${bill.cryptocurrency.symbol.toUpperCase()}</td>
      <td> ${bill.totalCrypto}</td>
      <td>$  ${bill.cryptocurrency.current_price}</td>
      <td>$ ${bill.amount}</td>
    </tr>
    `);
  }
};

const buildUserWallet = () => {
  $("#userWallet").empty();
  
  wallet.userCryptocurrencies.forEach((value,key)=>{
    $("#userWallet").append(`
    <tr>
      <td>
        <img src="${value.image}" class="wallet-crypto-img">
      </td>
      <td>
        <h3>${value.symbol.toUpperCase()}</h3>
      </td>
      <td>
        <h3>${value.totalCryptocurrency.toFixed(5)}</h3>
      </td>
    </tr>
    `);
  });

}

const buildModal = (cryptoSelected) => {
  this.cryptoSelected = cryptoSelected;

  cleanModal();

  let modalImage = document.getElementById("modalImage");
  modalImage.src = cryptoSelected.image;
  let modalSymbol = document.getElementById("modalSymbol");
  modalSymbol.innerHTML = `${cryptoSelected.symbol.toUpperCase()}`;
  let modalName = document.getElementById("modalName");
  modalName.innerHTML = `${cryptoSelected.name}`;
  let modalPrice = document.getElementById("modalPrice");
  modalPrice.innerHTML = `$ ${cryptoSelected.current_price}`;

  document.getElementById("modalFeesLbl").style.display = "none";

  let availableAmount = document.getElementById("availableAmount");
  availableAmount.value = "$ " + user.accountBalance;
};

// *************** Adding listeners to buttons *****************

homeNav.addEventListener("click", function () {
  navigateToHome();
});

activityNav.addEventListener("click", function () {
  navigateToActivity();
});

walletNav.addEventListener("click", function () {
  navigateToWallet();
});

modalAmountToBuy.onkeyup = () => {
  calculateFees();
};

modalBuyBtn.addEventListener("click", function () {
  operationType = "BUY";
  user.accountBalance = (
    user.accountBalance - parseFloat(modalAmountToBuy.value)
  ).toFixed(2);
  localStorage.setItem("user", JSON.stringify(user));
  updateUserAvailableAmount();

  billingProcess();

  // Hide modal
  let modalShop = document.getElementById("modalShop");
  let modal = bootstrap.Modal.getInstance(modalShop);
  modal.hide();

  navigateToActivity();
});

// ************************************************************

// ***************** Show and Hide Sections *******************

const showCryptoList = () => {
  cryptoList.style.display = "block";
};

const hideCryptoList = () => {
  cryptoList.style.display = "none";
};

const showShoppingHistory = () => {
  shoppingHistory.style.display = "block";
};

const hideShoppingHistory = () => {
  shoppingHistory.style.display = "none";
};

const showWallet = () => {
  userWalletContainer.style.display = "block";
};

const hideWallet = () => {
  userWalletContainer.style.display = "none";
};

const showModalAlert = (message) => {
  alertPlaceholder.style.display = "block";
  alertPlaceholder.innerHTML = message;
  modalBuyBtn.disabled = true;
};

const hideModalAlert = () => {
  alertPlaceholder.style.display = "none";
};

// ************************************************************

// ******************** Navigation ************************
const navigateToHome = () => {
  showCryptoList();
  hideShoppingHistory();
  hideWallet();
};

const navigateToActivity = () => {
  hideCryptoList();
  showShoppingHistory();
  hideWallet();

  buildShoppingHistory();
};

const navigateToWallet = () => {
  hideCryptoList();
  hideShoppingHistory();
  showWallet();

  buildUserWallet();
};

// ********************************************************

// ************************* Init Site *************************

const init = () => {
  updateUserAvailableAmount();

  buildCryptoList();
  buildShoppingHistory();

  showCryptoList();
  hideShoppingHistory();
  hideWallet();
};

init();
