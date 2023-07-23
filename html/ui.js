//

function autoPersistItems() {
    const persistItems = document.querySelectorAll('[data-persist="true"]');
    const savedData = JSON.parse(localStorage.getItem("persistedItems")) || {};

    // Function to initialize persisted data
    function initializePersistedData(item, itemId, savedData) {
        if (savedData[itemId]) {
            if (item.tagName === "INPUT" || item.tagName === "TEXTAREA") {
		item.value = savedData[itemId];
            } else if (item.tagName === "SELECT") {
		const selectedOption = item.querySelector(`[value="${savedData[itemId]}"]`);
		if (selectedOption) {
		    selectedOption.selected = true;
		}
            }
        }
    }

    // Function to save persisted data on change
    function handleItemChange(event) {
        const item = event.target;
        const itemId = `item_${Array.from(persistItems).indexOf(item) + 1}`;
        savedData[itemId] = item.tagName === "SELECT" ? item.value : item.textContent;
        localStorage.setItem("persistedItems", JSON.stringify(savedData));
    }

    persistItems.forEach((item, index) => {
        const itemId = `item_${index + 1}`;
        initializePersistedData(item, itemId, savedData);

        // Add event listeners to persist data on change
        item.addEventListener("input", handleItemChange);
        item.addEventListener("change", handleItemChange);
    });

    const toggleThis = document.getElementsByClassName("container")[0];
    let flexDirections = ["row", "row-reverse", "column", "column-reverse"];
    let currentFlexDirection = 1;

    document.getElementById("toggleLink").addEventListener("click", () => {
        currentFlexDirection = (currentFlexDirection + 1) % flexDirections.length;
        toggleThis.style.flexDirection = flexDirections[currentFlexDirection];
    });
}

// Call autoPersistItems to auto-persist the items with data-persist attribute and initialize from persisted data
autoPersistItems();


//

const toggleThis = document.getElementsByClassName("container")[0];
let flexDirections = ["row", "row-reverse", "column", "column-reverse"];
let currentFlexDirection = 1;

const toggleLink = document.getElementById("toggleLink");
toggleLink.addEventListener("click", () => {
    currentFlexDirection = (currentFlexDirection + 1) % flexDirections.length;
    toggleThis.style.flexDirection = flexDirections[currentFlexDirection];
});

//

// Get all the headers inside the textareas
const headers = document.querySelectorAll('.myDiv > span');

// Add click event listeners to each header
headers.forEach((header) => {
  header.addEventListener('click', () => {
    // Get the parent div containing the textarea
    const myDiv = header.parentNode;

    // Create a fullscreen pop-up container
    const popup = document.createElement('div');
    popup.classList.add('fullscreen-popup');

    // Clone the content of the myDiv and add it to the popup
    const contentClone = myDiv.cloneNode(true);
    popup.appendChild(contentClone);

    // Add the popup to the body
    document.body.appendChild(popup);

    // Add a click event listener to close the popup when clicked outside
    popup.addEventListener('click', (event) => {
      if (event.target === popup) {
        popup.remove();
      }
    });
  });
});

//tell me about leipzig, the city, the origin of the name
