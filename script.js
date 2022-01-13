//@ts-ignore
import { v4 as uuidv4 } from "https://jspm.dev/uuid";
function reloadLocalStorage() {
  $("#main").empty();
  const cardsDiv = JSON.parse(localStorage.getItem("budgets")) || [];
  cardsDiv.forEach(({ amount, name, uuid }) => {
    addBudget(name.toString(), parseInt(amount), uuid.toString());
  });
}
reloadLocalStorage();
$("#add-budget-btn").on("click", () => {
  const budget_name = $("#add-budget-input").val();
  const budget_amount = $("#add-budget-amount-inp").val();
  $("h4").css("display", "none");
  if (!budget_name || budget_name.toString().length > 20)
    return $("h4").eq(0).css("display", "block");
  if (!budget_amount || parseInt(budget_amount.toString()) != budget_amount)
    return $("h4").eq(1).css("display", "block");
  $("input").val("");
  $("#add-budget-modal").modal("toggle");
  const UUID = uuidv4();
  addBudget(budget_name.toString(), parseInt(budget_amount.toString()), UUID);
  const budgets = JSON.parse(localStorage.getItem("budgets")) || [];
  localStorage.setItem(
    "budgets",
    JSON.stringify([
      ...budgets,
      { name: budget_name, amount: budget_amount, uuid: UUID, expenses: {} },
    ])
  );
});
function addListeners() {
  $(".card-add-expense").on("click", function () {
    const btn = $(this);
    const uuid = btn.parent().parent().attr("uuid");
    $("#add-expense-modal").attr("uuid", uuid).modal("show");
  });
  $(".card-view-expense").on("click", function () {
    const btn = $(this);
    const uuid = btn.parent().parent().attr("uuid");
    const cards = JSON.parse(localStorage.getItem("budgets"));
    const card = cards.filter((o) => o.uuid == uuid)[0];
    if (!card) return;
    $("#expense-list").empty();
    $(".card-view-expense").attr("uuid", uuid);
    for (const expense of Object.keys(card.expenses)) {
      const expense_item = $("<div></div>").addClass("expense-item");
      const expense_title = $("<div></div>")
        .addClass("expense-title")
        .text(expense);
      const percent = (card.expenses[expense] / parseInt(card.amount)) * 100;
      const expense_progress = $("<div></div>").addClass("expense-progress");
      const expense_filler = $("<div></div>")
        .addClass("expense-filler")
        .css("width", `${percent}%`);
      expense_filler.css("background-color", "green");
      if (percent >= 50) {
        expense_filler.css("background-color", "darkgoldenrod");
      }
      if (percent >= 85) {
        expense_filler.css("background-color", "red");
      }
      const expense_info = $("<div></div>")
        .addClass("expense-info")
        .text(card.expenses[expense]);
      const expense_del = $("<button></button>")
        .addClass("expense-delete")
        .text("X");
      expense_progress.append(expense_filler);
      expense_item.append(
        expense_title,
        expense_info,
        expense_progress,
        expense_del
      );
      $("#expense-list").append(expense_item);
    }
    addViewExpenseListener();
    $("#view-expense-modal").attr("uuid", uuid).modal("show");
  });
}
function addViewExpenseListener() {
  $(".expense-delete").on("click", function () {
    const btn = $(this);
    const property = btn.siblings(".expense-title").text();
    const uuid = $("#view-expense-modal").attr("uuid");
    const cards = JSON.parse(localStorage.getItem("budgets"));
    const card = cards.filter((o) => o.uuid == uuid)[0];
    if (!card) return;
    const index = cards.indexOf(card);
    cards.splice(index, 1);
    delete card.expenses[property];
    localStorage.setItem("budgets", JSON.stringify([card, ...cards]));
    btn.parent().remove();
    calculateAmount();
  });
}
function calculateAmount() {
  const cards = JSON.parse(localStorage.getItem("budgets"));
  for (let i = 0; i < cards.length; i++) {
    const obj = cards[i];
    const card = $(".card").eq(i);
    let sum = 0;
    for (const val of Object.values(obj.expenses)) {
      sum += parseInt(val.toString());
    }
    const width = (sum / obj.amount) * 100;
    card
      .children(".card-info")
      .children(".card-info-current")
      .text(sum.toString());
    const bar = card.children(".card-progress").children(".card-filler");
    bar.css("width", `${width}%`);
    bar.css("background-color", "green");
    if (width == 0) bar.css("width", "0vw");
    if (width >= 50) bar.css("background-color", "darkgoldenrod");
    if (width >= 85) bar.css("background-color", "red");
  }
}
function addBudget(name, amount, uuid) {
  const card = $("<div></div>").addClass("card").attr("uuid", uuid);
  const cardTitle = $("<div></div>").addClass("card-title").text(name);
  const cardProgress = $("<div></div>").addClass("card-progress");
  const cardFiller = $("<div></div>").addClass("card-filler");
  const cardInfo = $("<div></div>").addClass("card-info");
  const cardCurrentAmount = $("<div></div>")
    .addClass("card-info-current")
    .text(0);
  const tempDiv = $("<div></div>").text("/");
  const cardTotalAmount = $("<div></div>")
    .addClass("card-info-total")
    .text(amount);
  const cardButtons = $("<div></div>").addClass("card-buttons");
  const addExpenseBtn = $("<button> </button>")
    .addClass("card-add-expense")
    .text("Add Expense");
  // .attr("data-bs-toggle", "modal")
  // .attr("data-bs-target", "#add-expense-modal")
  const viewExpenseBtn = $("<button> </button>")
    .addClass("card-view-expense")
    .text("View Expenses");
  cardButtons.append(addExpenseBtn, viewExpenseBtn);
  cardInfo.append(cardCurrentAmount, tempDiv, cardTotalAmount);
  cardProgress.append(cardFiller);
  card.append(cardTitle, cardProgress, cardInfo, cardButtons);
  $("#main").append(card);
  addListeners();
  calculateAmount();
}
$("#add-expense-btn").on("click", () => {
  const expense_name = $("#add-expense-input").val().toString();
  const expense_amount = $("#add-expense-amount-inp").val();
  const uuid = $("#add-expense-modal").attr("uuid");
  const cards = JSON.parse(localStorage.getItem("budgets"));
  const card = cards.filter((o) => o.uuid == uuid)[0];
  const index = cards.indexOf(card);
  cards.splice(index, 1);
  $("h4").css("display", "none");
  if (!expense_name || expense_name.toString().length > 20)
    return $("h4").eq(2).css("display", "block");
  if (!expense_amount || parseInt(expense_amount.toString()) != expense_amount)
    return $("h4").eq(3).css("display", "block");
  $("h4").css("display", "none");
  $("input").val("");
  $("#add-expense-modal").modal("hide");
  if (card.expenses[expense_name])
    card.expenses[expense_name] =
      parseInt(card.expenses[expense_name]) +
      parseInt(expense_amount.toString());
  else card.expenses[expense_name] = expense_amount;
  localStorage.setItem("budgets", JSON.stringify([card, ...cards]));
  calculateAmount();
});
$("#view-budget").on("click", () => {
  $("#view-budget-modal").modal("show");
  $("#budget-list").empty();
  const cards = JSON.parse(localStorage.getItem("budgets"));
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const card_el = $(".card").eq(i);
    let sum = 0;
    for (const curr of Object.values(card.expenses)) {
      sum += parseInt(curr.toString());
    }
    const budget_item = $("<div></div>").addClass("budget-item");
    const budget_title = $("<div></div>")
      .addClass("budget-title")
      .text(card.name);
    const budget_info = $("<div></div>")
      .addClass("budget-info")
      .text(card.amount);
    const budget_progress = $("<div></div>").addClass("budget-progress");
    const budget_filler = $("<div></div>").addClass("budget-filler");
    const width = (sum / card.amount) * 100;
    budget_filler.css("width", `${width}%`);
    budget_filler.css("background-color", "green");
    if (width == 0) budget_filler.css("width", "0vw");
    if (width >= 50) budget_filler.css("background-color", "darkgoldenrod");
    if (width >= 85) budget_filler.css("background-color", "red");
    const budget_del = $("<button></button>")
      .addClass("budget-delete")
      .text("X");
    budget_del.on("click", () => {
      const budgets = JSON.parse(localStorage.getItem("budgets"));
      budgets.splice(i, 1);
      localStorage.setItem("budgets", JSON.stringify(budgets));
      budget_item.remove();
      reloadLocalStorage();
    });
    budget_progress.append(budget_filler);
    budget_item.append(budget_title, budget_info, budget_progress, budget_del);
    $("#budget-list").append(budget_item);
  }
});
