// Executes when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded');
    initializeJsonEntries();
    setupEventListeners();
});

// Scrolls to the highlighted element on page load
function scrollToHighlighted() {
    const highlightedElements = document.querySelectorAll('.highlight');
    if (highlightedElements.length > 0) {
        highlightedElements[0].scrollIntoView({ behavior: 'smooth' });
    }
}

// Initializes the formatting of JSON entries in log text
function initializeJsonEntries() {
    const jsonEntries = document.querySelectorAll('.json-entry');
    jsonEntries.forEach(entry => {
        const formattedJson = formatJson(entry.textContent);
        entry.textContent = formattedJson;
    });
}

// Sets up event listeners for form submission and container clicks
function setupEventListeners() {
    document.getElementById('search-form').addEventListener('submit', handleFormSubmit);
    document.querySelector('.container').addEventListener('click', handleContainerClick);
}

// Handles the form submission event for the search form
function handleFormSubmit(event) {
    event.preventDefault();
    const keyword = document.getElementById('search').value;
    filterLogEntries(keyword);
}

// Handles click events within the log container
function handleContainerClick(event) {
    const target = event.target;
    const logEntry = findParentLogEntry(target);
    if (logEntry) {
        const logId = logEntry.dataset.logId;
        toggleLogDetails(logId);
    }
}

// Finds the parent log entry element of a given element
function findParentLogEntry(element) {
    while (element && !element.classList.contains('log-entry')) {
        element = element.parentElement;
    }
    return element;
}

// Toggles the display of log details on click
function toggleLogDetails(logId) {
    const arrowElement = document.getElementById('arrow-' + logId);
    const detailsElement = document.getElementById('details-' + logId);
    if (detailsElement && arrowElement) {
        const isDisplayed = detailsElement.style.display === 'block';
        detailsElement.style.display = isDisplayed ? 'none' : 'block';
        arrowElement.classList.toggle('active');
        formatAndDisplayJson(logId, isDisplayed);
    } else {
        console.error('Could not find elements for logId:', logId);
    }
}

// Formats and displays JSON data for a specific log entry
function formatAndDisplayJson(logId, isDisplayed) {
    if (!isDisplayed) {
        const logEntry = document.querySelector(`.log-entry[data-log-id="${logId}"]`);
        if (logEntry) {
            const logTextElement = logEntry.querySelector('.log-text');
            if (logTextElement && logTextElement.textContent.includes('deployed_bots ===')) {
                const jsonPart = logTextElement.textContent.split('deployed_bots === ')[1];
                const jsonString = jsonPart.replace(/'([^']*)'/g, '"$1"');
                try {
                    const jsonObject = JSON.parse(jsonString);
                    const formattedJson = JSON.stringify(jsonObject, null, 4);
                    const detailsElement = document.getElementById('details-' + logId);
                    if (detailsElement) {
                        detailsElement.textContent = formattedJson;
                    }
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                }
            }
        }
    }
}

// Checks if a string is a valid JSON format
function isJson(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

// Formats a JSON string with proper indentation
function formatJson(jsonStr) {
    try {
        const jsonObj = JSON.parse(jsonStr);
        return JSON.stringify(jsonObj, null, 4);
    } catch (e) {
        return jsonStr;
    }
}

// Filters log entries based on a search keyword
function filterLogEntries(keyword) {
    const logContainer = document.querySelector('.log-container');
    const logEntries = document.querySelectorAll('.log-entry');
    logContainer.innerHTML = '';
    logEntries.forEach(logEntry => {
        filterAndHighlightEntry(logEntry, keyword, logContainer);
    });
    adjustContainerHeight(logContainer);
}

// Filters and highlights a log entry based on the search keyword
function filterAndHighlightEntry(logEntry, keyword, logContainer) {
    const logTextElement = logEntry.querySelector('.log-text');
    if (logTextElement) {
        const logText = logTextElement.textContent;
        const lowerCaseLogText = logText.toLowerCase();
        const lowerCaseKeyword = keyword.toLowerCase();
        const matchesKeyword = lowerCaseLogText.includes(lowerCaseKeyword);

        if (keyword === '' || matchesKeyword) {
            logTextElement.innerHTML = logText.replace(new RegExp(lowerCaseKeyword, 'ig'), match => `<span class="highlight">${match}</span>`);
            logContainer.appendChild(logEntry.cloneNode(true));
        }
    }
}

// Adjusts the height of the log container based on its content
function adjustContainerHeight(logContainer) {
    logContainer.style.height = logContainer.children.length > 0 ? 'auto' : '0';
}
