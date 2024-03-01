function addNewRule() {
  let ruleContainer = document.getElementById("rulesContainer");
  let newRule = document.createElement("div");
  newRule.innerHTML = `
          <input class="ruleInput" type="text" id="rule_${
            ruleContainer.childElementCount + 1
          }" required>
          <button class="btn btn-primary" onclick="deleteRule(this)">Delete</button>
        `;
  ruleContainer.appendChild(newRule);
}

function deleteRule(button) {
  let ruleContainer = document.getElementById("rulesContainer");
  ruleContainer.removeChild(button.parentElement);
}

function addCoordinator() {
  const coordinatorContainer = document.getElementById("coordinatorContainer");
  const coordinator = document.createElement("div");
  coordinator.classList.add("coordinator");
  coordinator.innerHTML = `
          <br />
          <label for="coordinatorName">Name: </label>
          <input type="text" class="form-control" id="coordinatorName" name="coordinatorName" required>
          <label for="coordinatorContact">Contact Number: </label>
          <input type="text" class="form-control" id="coordinatorContact" name="coordinatorContact" maxlength="10" required>
          <label for="coordinatorImg">Coordinator Photo</label>
          <input type="file" accept="image/png, image/jpeg" class="form-control" id="coordinatorImg" name="coordinatorImg" onchange="checkFileSize(this)" required>
          <button class="btn btn-primary mt-1" type="button" onclick="deleteCoordinator(this)">Delete</button>
        `;
  coordinatorContainer.appendChild(coordinator);
}

function deleteCoordinator(coordinator) {
  coordinator.parentElement.remove();
}

function checkFileSize(input) {
  if (input.files && input.files[0]) {
    var fileSize = input.files[0].size; // Size in bytes
    var maxSize = 1048576 * 2; // 1MB in bytes (adjust as needed)

    if (fileSize > maxSize) {
      alert("Please select an image file smaller than 2MB.");
      input.value = ""; // Clear the file input
    }
  }
}

function generateUID() {
  // Generate a random 4-character string
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }

  // Concatenate random strings to form a UID
  return (
    S4() +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  );
}

function submitData() {
  // Get form data
  var formData = new FormData();
  formData.append("title", document.getElementById("title").value);
  formData.append("club", document.getElementById("club").value);
  formData.append("description", document.getElementById("description").value);
  formData.append("team_size", document.getElementById("teamSize").value);
  formData.append(
    "min_team_size",
    document.getElementById("minTeamSize").value
  );
  formData.append("rounds", document.getElementById("rounds").value);
  formData.append(
    "registration_limit",
    document.getElementById("registrationLimit").value
  );
  formData.append(
    "whatsapp_group",
    document.getElementById("whatsAppGroupInvite").value
  );

  // Get rules
  var rules = [];
  var ruleInputs = document.querySelectorAll(".ruleInput");
  ruleInputs.forEach(function (input) {
    rules.push(input.value);
  });
  formData.append("rules", JSON.stringify(rules));
  console.log(rules);

  // Get coordinators
  var coordinators = [];
  var coordinatorImgs = [];
  var coordinatorInputs = document.querySelectorAll(".coordinator");
  coordinatorInputs.forEach(function (input) {
    var coordinator = {
      name: input.querySelector("#coordinatorName").value,
      contact_number: input.querySelector("#coordinatorContact").value,
    };
    coordinator.imgId = generateUID();
    let img = input.querySelector("#coordinatorImg");
    // Set the image ID as the name of the file
    var modifiedFile = new File([img.files[0]], coordinator.imgId, {
      type: img.files[0].type,
    });
    coordinatorImgs.push(modifiedFile);
    coordinators.push(coordinator);
  });
  coordinatorImgs.forEach(function (img) {
    formData.append("coordinatorImgs", img, img.name);
  });
  formData.append("event_coordinators", JSON.stringify(coordinators));
  console.log(formData);

  //   convert form data to JSON
  var object = {};
  formData.forEach(function (value, key) {
    object[key] = value;
  });
  console.log(object);

  // Send form data with images to the server
  fetch("/event", {
    method: "POST",
    body: formData,
    type: "multipart/form-data",
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle response from server
      document.getElementById("finalData").value = JSON.stringify(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  // Prevent default form submission
  return false;
}

console.log(generateUID());
