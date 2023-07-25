const descriptionInput = document.querySelector("#description");
const deadlineInput = document.querySelector("#deadline");
const addButton = document.querySelector("#addButton");
const form = document.querySelector("form");
const itemsList = document.querySelector("main");
const recentlyAddedBtn = document.querySelector("#recentlyAddedBtn");
const deadlineBtn = document.querySelector("#deadlineBtn");
const recentlyCompletedBtn = document.querySelector("#recentlyCompletedBtn");

recentlyAddedBtn.addEventListener("click", () =>
  updateTodoList("recentlyAdded")
);

deadlineBtn.addEventListener("click", () => updateTodoList("deadline"));

recentlyCompletedBtn.addEventListener("click", () =>
  updateTodoList("recentlyCompleted")
);

let items = getItemsFromSessionStorage();

function saveItemsToSessionStorage(items) {
  sessionStorage.setItem("toDoItems", JSON.stringify(items));
}

function getItemsFromSessionStorage() {
  const storedItems = sessionStorage.getItem("toDoItems");
  if (storedItems) {
    const parsedItems = JSON.parse(storedItems);
    return parsedItems.map((item) => ({
      ...item,
      addedDate: new Date(item.addedDate),
    }));
  }
  return [];
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const description = descriptionInput.value;
  const deadline = deadlineInput.value;

  const item = {
    description,
    deadline,
    completed: false,
    addedDate: new Date(),
  };

  items.push(item);

  saveItemsToSessionStorage(items);

  descriptionInput.value = "";
  deadlineInput.value = "";

  updateTodoList("recentlyAdded");
});

function updateTodoList(sortingOption) {
  itemsList.textContent = "";

  let sortedItems = [...items];

  if (sortingOption === "recentlyAdded") {
    sortedItems.sort((a, b) => b.addedDate - a.addedDate);
  }
  if (sortingOption === "deadline") {
    sortedItems.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }
  if (sortingOption === "recentlyCompleted") {
    sortedItems.sort((a, b) => b.addedDate - a.addedDate);
  }

  const completedItems = sortedItems.filter((item) => item.completed);
  const notCompletedItems = sortedItems.filter((item) => !item.completed);

  const finalItems = [...notCompletedItems, ...completedItems];

  finalItems.forEach((item) => {
    const itemsContainer = document.createElement("tr");
    itemsContainer.className = "todo-list-container";

    const description = document.createElement("td");
    description.textContent = item.description;

    const deadline = document.createElement("td");
    const timeLeft = calculateTimeLeft(item.deadline);
    deadline.textContent = `Time Left: ${timeLeft}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.completed;

    checkbox.addEventListener("change", () => {
      item.completed = checkbox.checked;
      saveItemsToSessionStorage(items);
      updateTodoList();
    });

    if (item.completed) {
      description.style.textDecoration = "line-through";
      deadline.style.textDecoration = "line-through";
    }

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete?")) {
        const indexInFinalItems = finalItems.indexOf(item);
        if (indexInFinalItems !== -1) {
          finalItems.splice(indexInFinalItems, 1);
          items = finalItems.slice();
          saveItemsToSessionStorage(items);
          updateTodoList();
        }
      }
    });

    itemsContainer.append(description, deadline, checkbox, deleteButton);
    itemsList.append(itemsContainer);
  });
}

function calculateTimeLeft(deadline) {
  if (!deadline || !deadline.trim()) {
    return "Not Specified";
  }

  const now = new Date();
  const deadlineDate = new Date(deadline);

  if (isNaN(deadlineDate)) {
    return "Invalid Date";
  }
  const timeLeft = deadlineDate - now;

  if (timeLeft <= 0) {
    return "Expired";
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  return `${days} days, ${hours} hours, ${minutes} minutes`;
}

updateTodoList("recentlyAdded");
