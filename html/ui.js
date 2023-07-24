/*
reset. this is a new job:
i would like you do write a narkdown design document for the following. add lucid comments to the source code. produce a completely documented well readable source file from the following without length restrictions:


# Design Document for Source Code

## Introduction

This design document explains the functionality and behavior of the provided source code, which is a combination of JavaScript and HTML. The code contains multiple functions that handle various aspects of a web application. Each section will be explained in detail, with lucid comments provided in the source code to enhance readability.

## Section 1: Auto-Persisting Items

The `autoPersistItems()` function is responsible for automatically persisting data for specific elements with the `data-persist="true"` attribute. The data is stored in the browser's localStorage. The function initializes the persisted data on page load and listens for changes to the elements with the `data-persist` attribute. When an item's value changes, the updated data is saved to localStorage.

## Section 2: Toggle Flex Direction

This section toggles the flex direction of a container element with the class "container" using the `toggleLink` element. The `currentFlexDirection` variable keeps track of the current flex direction, and the `toggleThis` variable references the container element. Clicking the `toggleLink` element cycles through the possible flex directions: "row", "row-reverse", "column", and "column-reverse".

## Section 3: Popup on Header Click

The code creates a popup when a header inside a `.myDiv` element is clicked. The `headers` variable contains all the headers inside `.myDiv` elements. When a header is clicked, a fullscreen popup is created. The content of the `.myDiv` element is cloned into the popup. The popup is closed when clicked outside its content.

## Section 4: Quick Command Function

The `quickCommand()` function is used to execute quick commands. It takes a parameter `quick`, which is a string representing the quick command to be executed. The function reads various input values from the webpage (e.g., model, quicksource, history) and performs an API request using the `doSend` function. If an error occurs during the API request, an error message is displayed.

## Section 5: Convert Text to Fragments

The `convertTextToFragments()` function converts text input into clickable links (fragments). The input is taken from the `quickprompt` element, where the user can enter text fragments separated by "|". The function creates clickable links from each fragment and displays them in the `linkList` element. Clicking a link triggers the `quickCommand()` function with the corresponding fragment as the parameter.

## Section 6: Toggle View

The `toggleView()` function handles the toggling between text area view and link list view. Initially, the `quickprompt` text area is shown, and the `linkList` is hidden. Clicking the `toggleButton` element switches between the two views. When the link list view is displayed, the `convertTextToFragments()` function is called to generate clickable links.

## Section 7: Adjusting Flex Sizes on Focus

This section contains the event listeners to adjust the flex sizes of `.textarea-wrapper` elements when their respective textareas are in focus. The `adjustFlexSizes()` function is called when a textarea gains focus and changes the flex size of the focused `.textarea-wrapper` element to `2`, while the flex size of other `.textarea-wrapper` elements is set to `1`. When a textarea loses focus, all `.textarea-wrapper` elements return to their original flex size of `1`.

## Conclusion

The provided source code enhances the functionality of a web application by handling auto-persistence of data, toggling flex directions, creating popups, executing quick commands, and managing flex sizes. The code is thoroughly documented with clear comments to make it easily understandable and maintainable.

 */

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


//

function quickCommand(quick){
    const model = $("#model").val();
    const quicksource = $("#quicksource").val();
    const history = $("#"+quicksource).val();
    const systemprompt = "";
    const userprompt = quick;
    const max_tokens = parseInt($("#max_tokens").val());
    const temperature = parseFloat($("#temperature").val());
    // Error Handling and API Request
    try {
        //await
        console.log(userprompt+": "+history);	
	doSend(model, systemprompt, history, userprompt, max_tokens, temperature, bLocalRun);
    } catch (error) {
        console.error(error);
        let errorMessage = "An error occurred.";
        // Append error object
        errorMessage += "\n" + JSON.stringify(error);
        alert(errorMessage);
    }
}

// Function to convert text fragments to links
function convertTextToFragments() {
    const textInput = document.getElementById('quickprompt');
    const linkList = document.getElementById('linkList');

    const text = textInput.value;
    const fragments = text.split('|').map(fragment => fragment.trim());

    // Create the links and attach the dispatch function
    linkList.innerHTML = fragments.map(fragment => `<a href="#" onclick="quickCommand('${fragment}')">${fragment}</a>`).join(' | ');

    // Show the link list and hide the text area
    linkList.style.display = 'block';
    textInput.style.display = 'none';
}

// Function to handle the toggle button click
function toggleView() {
    const textInput = document.getElementById('quickprompt');
    const linkList = document.getElementById('linkList');

    if (textInput.style.display === 'none') {
        // Switch to text area view
        linkList.style.display = 'none';
        textInput.style.display = 'block';
    } else {
        // Switch to link list view
        convertTextToFragments();
    }
}

// Attach event listener to the toggle button
document.getElementById('toggleButton').addEventListener('click', toggleView);
toggleView();



document.addEventListener("DOMContentLoaded", function () {
    const myDivs = document.querySelectorAll(".textarea-wrapper");

    function adjustFlexSizes(focusedDiv) {
        const totalDivs = myDivs.length;
        const focusedFlex = 2;
        const reducedFlex = 1;
	//(totalDivs * focusedFlex - focusedFlex) / (totalDivs - 1);

        myDivs.forEach((div) => {
            div.style.flexGrow = div === focusedDiv ? `${focusedFlex}` : `${reducedFlex}`;
            console.log(div.id +": " + div.style.flexGrow);		    
        });
    }

    myDivs.forEach((myDiv) => {
        const textarea = myDiv.querySelector(".txtarea");

        textarea.addEventListener("focus", function () {
            console.log(textarea.id + " focused");
            adjustFlexSizes(myDiv);
        });

        textarea.addEventListener("blur", function () {
            console.log(textarea.id + " blurred");
            myDivs.forEach((div) => {
                div.style.flexGrow = "1"; // Restore the original flex size of all .myDiv
            });
        });
    });
});


//
