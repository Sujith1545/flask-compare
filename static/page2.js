document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("text-input-form");
  const feedback = document.getElementById("feedback");
  const loader = document.getElementById("loader");

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(form);
    loader.style.display = "block"; // Show loader

    fetch("/submit_page2", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        loader.style.display = "none"; // Hide loader
        feedback.textContent = data.message; // Display feedback message
      })
      .catch((error) => {
        loader.style.display = "none"; // Hide loader
        feedback.textContent = "An error occurred: " + error.message;
      });
  });
});
