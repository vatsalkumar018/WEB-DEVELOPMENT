function showSection(sectionName) {

    const sections = document.querySelectorAll(".section");

    sections.forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(sectionName).classList.remove("hidden");
}


function updateOrder(select) {

    alert("Order status updated to: " + select.value);

}


function addItem() {

    const name = prompt("Enter food item name:");
    const price = prompt("Enter price:");

    if (name && price) {
        alert(name + " added to the menu at ₹" + price);
    }

}


function logout() {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (confirmLogout) {
        window.location.href = "index.html";
    }

}