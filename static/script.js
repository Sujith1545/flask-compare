document.addEventListener("DOMContentLoaded", function () {
  const uploadForm = document.getElementById("upload-form");
  const uploadSecondForm = document.getElementById("upload-second-form");
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

  function updateHeaderSelection() {
    headerSelectionContainer.innerHTML = `
            <h2>Select Headers for Processing</h2>
            <form id="header-form">
                <div>
                    <input type="checkbox" id="select-all" /> <label for="select-all">Select All</label>
                </div>
                ${headers
                  .map(
                    (header) => `
                    <div>
                        <input type="checkbox" name="headers" value="${header}" ${
                      selectedHeaders.includes(header) ? "checked" : ""
                    }> 
                        ${header}
                    </div>
                `
                  )
                  .join("")}
                <input type="submit" value="Submit Selected" id="submit-selected">
            </form>
        `;

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
              // Automatically download the result file
              return response.blob().then((blob) => {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "result.xlsx";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              });
            } else {
              return response.json().then((data) => {
                alert(data.error);
              });
            }
          })
          .catch((error) => {
            hideLoader(); // Hide loader in case of error
            console.error("Error:", error);
          });
      });

    document
      .getElementById("select-all")
      .addEventListener("change", function () {
        const checked = this.checked;
        document
          .querySelectorAll('input[name="headers"]')
          .forEach((checkbox) => {
            checkbox.checked = checked;
          });
      });
  }

  function updateButtonLabels() {
    const uploadFile1Button = document.querySelector(
      '#upload-form input[type="submit"]'
    );
    const uploadFile2Button = document.querySelector(
      '#upload-second-form input[type="submit"]'
    );

    if (file1Uploaded) {
      uploadFile1Button.value = "File 1 Uploaded";
      uploadFile1Button.classList.add("uploaded-button");
      uploadFile1Button.disabled = true; // Optionally disable the button
    }

    if (file2Uploaded) {
      uploadFile2Button.value = "File 2 Uploaded";
      uploadFile2Button.classList.add("uploaded-button");
      uploadFile2Button.disabled = true; // Optionally disable the button
    }

    if (file1Uploaded && file2Uploaded) {
      headerSelectionContainer.style.display = "block";
    }
  }

  uploadForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(uploadForm);

    fetch("/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          headers = data.headers;
          selectedHeaders = data.selected_headers || [];
          file1Uploaded = true;
          updateButtonLabels();
          updateHeaderSelection();
        }
      })
      .catch((error) => console.error("Error:", error));
  });

  uploadSecondForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(uploadSecondForm);

    fetch("/upload_second", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          file2Uploaded = true;
          updateButtonLabels();
        }
      })
      .catch((error) => console.error("Error:", error));
  });
});
