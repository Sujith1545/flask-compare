const uploadForm1 = document.getElementById("upload-form");
const uploadForm2 = document.getElementById("upload-second-form");
const headerSelectionContainer = document.getElementById(
  "header-selection-container"
);
const loader = document.getElementById("loader");
const compareHeadersBtn = document.getElementById("compare-headers-btn");
const resetBtn = document.getElementById("reset-button"); // Updated ID

let headers = [];
let selectedHeaders = [];
let file1Uploaded = false;
let file2Uploaded = false;
let resetPerformed = false;

function showLoader(targetId) {
  document.getElementById(targetId).style.display = "block";
}

function hideLoader(targetId) {
  document.getElementById(targetId).style.display = "none";
}

function updateCompareButtonState() {
  compareHeadersBtn.style.display = "inline";
  compareHeadersBtn.disabled = !(
    file1Uploaded &&
    file2Uploaded &&
    !resetPerformed
  );
}

function updateHeaderSelection() {
  headerSelectionContainer.innerHTML = `
    <h2>Select Headers for Processing</h2>
    <form id="header-form">
      ${headers
        .map(
          (header) => `
          <div>
            <input type="checkbox" name="headers" value="${header}" id="header-${header.replace(
            /\s+/g,
            "-"
          )}" /> 
            <label for="header-${header.replace(
              /\s+/g,
              "-"
            )}" class="header-label">${header}</label>
          </div>
        `
        )
        .join("")}
      <input type="submit" value="Submit Selected" id="submit-selected">
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

      showLoader("loader"); // Show global loader
      fetch("/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ headers: selectedHeaders }),
      })
        .then((response) => {
          hideLoader("loader"); // Hide global loader
          if (response.ok) {
            return response.blob();
          } else {
            return response.json().then((data) => {
              if (data.error) {
                throw new Error(data.error);
              } else {
                throw new Error(data.success);
              }
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
}

uploadForm1.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(uploadForm1);
  showLoader("upload-file-1-loader");
  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      hideLoader("upload-file-1-loader");
      if (data.headers) {
        headers = data.headers;
        file1Uploaded = true;
        document
          .getElementById("upload-file-1")
          .classList.add("uploaded-button");
        document.getElementById("upload-file-1").value = "File 1 Uploaded";
        updateCompareButtonState();
        if (file2Uploaded) {
          updateHeaderSelection(); // Show header selection if file 2 is uploaded
        }
      } else {
        alert(data.error);
      }
    })
    .catch((error) => {
      hideLoader("upload-file-1-loader");
      console.error("Error:", error);
    });
});

uploadForm2.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(uploadForm2);
  showLoader("upload-file-2-loader");
  fetch("/upload_second", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      hideLoader("upload-file-2-loader");
      if (data.message) {
        file2Uploaded = true;
        document
          .getElementById("upload-file-2")
          .classList.add("uploaded-button");
        document.getElementById("upload-file-2").value = "File 2 Uploaded";
        updateCompareButtonState();
        if (file1Uploaded) {
          updateHeaderSelection(); // Show header selection if file 1 is uploaded
        }
      } else {
        alert(data.error);
      }
    })
    .catch((error) => {
      hideLoader("upload-file-2-loader");
      console.error("Error:", error);
    });
});

compareHeadersBtn.addEventListener("click", function () {
  fetch("/compare_headers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert("Error: " + data.error);
      } else {
        headerSelectionContainer.style.display = "block"; // Show header selection
        compareHeadersBtn.disabled = true; // Disable button after comparison
      }
    })
    .catch((error) => console.error("Error:", error));
});

// Reset button functionality
resetBtn.addEventListener("click", function () {
  // Reset the form and variables
  uploadForm1.reset();
  uploadForm2.reset();
  document.getElementById("upload-file-1").classList.remove("uploaded-button");
  document.getElementById("upload-file-2").classList.remove("uploaded-button");
  document.getElementById("upload-file-1").value = "Upload File 1";
  document.getElementById("upload-file-2").value = "Upload File 2";
  file1Uploaded = false;
  file2Uploaded = false;
  headers = [];
  selectedHeaders = [];
  headerSelectionContainer.style.display = "none";
  resetPerformed = true;
  updateCompareButtonState();
});
