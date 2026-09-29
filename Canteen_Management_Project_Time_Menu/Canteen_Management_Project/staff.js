document.querySelectorAll(".status-select").forEach(select => {
  select.addEventListener("change", () => {
    const status = select.value;
    alert(`Order status updated to: ${status}`);
  });
});

document.querySelectorAll(".toggle input").forEach(input => {
  input.addEventListener("change", () => {
    const item = input.closest(".admin-food")?.querySelector("strong")?.textContent || "Item";
    alert(`${item} is now ${input.checked ? "available" : "out of stock"}.`);
  });
});

document.querySelectorAll(".edit-food").forEach(button => {
  button.addEventListener("click", () => {
    const row = button.closest(".admin-food");
    const name = row.querySelector("strong").textContent;
    const newPrice = prompt(`Enter new price for ${name}:`);
    if (newPrice && !isNaN(newPrice)) {
      row.querySelector("small").textContent = `₹${newPrice} · Updated`;
    }
  });
});

document.getElementById("addFoodBtn")?.addEventListener("click", () => {
  const name = prompt("Food item name:");
  if (!name) return;
  const price = prompt("Price:");
  if (!price || isNaN(price)) return;
  alert(`${name} (₹${price}) added in demo mode. Backend storage can be connected later.`);
});