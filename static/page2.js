document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("submit-text-form");
  const feedback = document.getElementById("feedback");
  const loader = document.getElementById("loader");
  const downloadBtn = document.getElementById("download-btn-id");

  const uploadFileForm = document.getElementById("upload-file-form");
  const fileUploadInput = document.getElementById("upload-btn-id");

  // const compareBtn = document.getElementById("compare-btn-id");
  // const compareLoader = document.getElementById("compare-loader");

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

  downloadBtn.addEventListener("click", function () {
    loader.style.display = "block"; // Show loader

    var fileName = "";

    fetch("/donload_page2_file", {
      method: "GET", // Assuming you are using a GET request to download the file
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("File download failed.");
        }

        // Extract the filename from the Content-Disposition header
        const cd = response.headers.get("Content-Disposition");
        fileName = getContentDisposition(cd) || "default-file.xlsx"; // Fallback filename if not provided
        return response.blob(); // Convert response to Blob
      })
      .then((blob) => {
        loader.style.display = "none"; // Hide loader

        // Create a link element to trigger the file download
        const link = document.createElement("a");
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = fileName; // Set the filename from Content-Disposition header or fallback
        document.body.appendChild(link); // Append the link to the body (it must be in the DOM to work)
        link.click(); // Trigger the download

        // Clean up after download
        document.body.removeChild(link); // Remove the link from the DOM
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        loader.style.display = "none"; // Hide loader
        feedback.textContent =
          "An error occurred while downloading the file: " + error.message;
      });
  });

  // uploadFileForm.addEventListener("submit", function (event) {
  //   event.preventDefault(); //

  //   const file = event.target.files[0];
  //   if (!file) {
  //     feedback.textContent = "No file selected.";
  //     return;
  //   }

  //   hideLoader("loader");

  //   const formData = new FormData(file);
  //   fetch("/upload_get_data_file", {
  //     method: "POST",
  //     body: formData,
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       feedback.textContent = "File uploaded successfully!"; // Show success message
  //     })
  //     .catch((error) => {
  //       feedback.textContent = "An error occurred: " + error.message;
  //     })
  //     .finally((e) => {
  //       hideLoader("loader");
  //     });
  // });

  // Handle file upload action
  // fileUploadInput.addEventListener("change", function (event) {
  //   const file = fileUploadInput.files[0]; // Get the selected file
  //   if (!file) {
  //     feedback.textContent = "No file selected.";
  //     return;
  //   }

  //   // Show loader
  //   hideLoader("loader");

  //   // // replace this with api call
  //   // let progress = 0; // Start the progress at 0%
  //   // const interval = setInterval(() => {
  //   //   progress += 10; // Increment the progress by 10%
  //   //   if (progress >= 100) {
  //   //     clearInterval(interval); // Stop the interval once we reach 100%
  //   //     hideLoader("loader"); // Hide loader when upload is complete
  //   //     feedback.textContent = "File uploaded successfully!"; // Show success message
  //   //   } else {
  //   //     feedback.textContent = `Uploading... ${progress}%`; // Show progress
  //   //   }
  //   // }, 500); // Update the progress every 500ms (simulate upload delay)

  //   // const formData = new FormData(file);
  //   // fetch("/upload_get_data_file", {
  //   //   method: "POST",
  //   //   body: formData,
  //   // })
  //   //   .then((response) => response.json())
  //   //   .then((data) => {
  //   //     feedback.textContent = "File uploaded successfully!"; // Show success message
  //   //   })
  //   //   .catch((error) => {
  //   //     feedback.textContent = "An error occurred: " + error.message;
  //   //   })
  //   //   .finally((e) => {
  //   //     hideLoader("loader");
  //   //   });
  // });

  // compareBtn.addEventListener("click", function (event) {
  //   compareLoader.classList.remove("hidden");

  //   // Simulate processing (replace with actual logic)
  //   setTimeout(function () {
  //     // After 3 seconds, hide the loader and show feedback
  //     compareLoader.classList.add("hidden");
  //     document.getElementById("feedback").innerText = "Comparison Complete!";
  //   }, 3000); // Simulate a 3-second operation
  // });
});

function showLoader(targetId) {
  const loader = document.getElementById(targetId);
  if (loader) {
    loader.style.display = "block"; // Show the loader
  } else {
    console.warn(`Loader with ID "${targetId}" not found.`);
  }
}

function hideLoader(targetId) {
  const loader = document.getElementById(targetId);
  if (loader) {
    loader.style.display = "none"; // Hide the loader
  } else {
    console.warn(`Loader with ID "${targetId}" not found.`);
  }
}

function getContentDisposition(cd) {
  const regex = /filename[^;=\n]*=\s*['"]?([^'";\n]*)['"]?/i;
  const matches = regex.exec(cd);
  return matches && matches[1] ? matches[1] : null;
}
