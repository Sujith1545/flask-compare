const uploadForm1 = document.getElementById("upload-form");
const uploadForm2 = document.getElementById("upload-second-form");
const headerSelectionContainer = document.getElementById(
  "header-selection-container"
);
const loader = document.getElementById("loader");

let headers = [];
let selectedHeaders = [];
let file1Uploaded = false;
let file2Uploaded = false;

function showLoader() {
  loader.style.display = "block";
}

function hideLoader() {
  loader.style.display = "none";
}

uploadForm1.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(uploadForm1);
  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.headers) {
        headers = data.headers;
        file1Uploaded = true;
        const uploadButton1 = document.getElementById("upload-file-1");
        uploadButton1.classList.add("uploaded-button");
        uploadButton1.value = "File 1 Uploaded";
        uploadButton1.disabled = true; // Disable the button

        // Show header selection immediately after File 1 upload
        updateHeaderSelection();

        if (file2Uploaded) {
          updateHeaderSelection();
        }
      } else {
        alert(data.error);
      }
    })
    .catch((error) => console.error("Error:", error));
});

uploadForm2.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(uploadForm2);
  fetch("/upload_second", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        file2Uploaded = true;
        const uploadButton2 = document.getElementById("upload-file-2");
        uploadButton2.classList.add("uploaded-button");
        uploadButton2.value = "File 2 Uploaded";
        uploadButton2.disabled = true; // Disable the button

        // Only update headers after both files are uploaded
        if (file1Uploaded) {
          updateHeaderSelection();
        }
      } else {
        alert(data.error);
      }
    })
    .catch((error) => console.error("Error:", error));
});

function updateHeaderSelection() {
  headerSelectionContainer.innerHTML = `
        <h2>Select Headers for Processing</h2>
        <div id="select-all-container">
            <input type="checkbox" id="select-all" /> <label for="select-all"><strong>Select All</strong></label>
        </div>
        <form id="header-form">
            ${headers
              .map(
                (header, index) => `
                <div>
                    <input type="checkbox" id="header-${index}" name="headers" value="${header}" ${
                  selectedHeaders.includes(header) ? "checked" : ""
                }> 
                    <label for="header-${index}">${header}</label>
                </div>
            `
              )
              .join("")}
            <input type="submit" value="Submit Selected" id="submit-selected">
            <button type="button" id="reset-button">Reset</button>
        </form>
    `;

  // Add event listener for header form submission
  document
    .getElementById("header-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const checkedHeaders = Array.from(
        document.querySelectorAll('input[name="headers"]:checked')
      ).map((checkbox) => checkbox.value);

      if (!file1Uploaded || !file2Uploaded) {
        alert("Please upload both files.");
        return;
      }

      if (!checkedHeaders.length) {
        alert("Please select at least one header.");
        return;
      }

      selectedHeaders = checkedHeaders;

      showLoader(); // Show loader

      fetch("/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ headers: selectedHeaders }),
      })
        .then((response) => {
          hideLoader(); // Hide loader

          if (response.ok) {
            return response.blob();
          } else {
            return response.json().then((data) => {
              throw new Error(data.error);
            });
          }
        })
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "result.xlsx";
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(url);
        })
        .catch((error) => {
          alert("Error: " + error.message);
        });
    });

  // Add event listener for "Select All" checkbox
  document.getElementById("select-all").addEventListener("change", function () {
    const isChecked = this.checked;
    document.querySelectorAll('input[name="headers"]').forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
  });

  // Add event listener for "Reset" button
  document
    .getElementById("reset-button")
    .addEventListener("click", function () {
      // Reset state
      headers = [];
      selectedHeaders = [];
      file1Uploaded = false;
      file2Uploaded = false;

      // Clear forms
      uploadForm1.reset();
      uploadForm2.reset();

      // Reset button states
      const uploadButton1 = document.getElementById("upload-file-1");
      const uploadButton2 = document.getElementById("upload-file-2");
      uploadButton1.classList.remove("uploaded-button");
      uploadButton1.value = "Upload File 1";
      uploadButton1.disabled = false;

      uploadButton2.classList.remove("uploaded-button");
      uploadButton2.value = "Upload File 2";
      uploadButton2.disabled = false;

      // Clear header selection
      headerSelectionContainer.innerHTML = "";
      headerSelectionContainer.style.display = "none";
    });

  headerSelectionContainer.style.display = "block";
}
