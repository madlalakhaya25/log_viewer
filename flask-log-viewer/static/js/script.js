// script.js

// Executes when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM content loaded');
    initializeJsonEntries();
    setupEventListeners();
});

// Scrolls to the highlighted element on page load
function scrollToHighlighted() {
    var highlightedElements = document.querySelectorAll('.highlight');
    if (highlightedElements.length > 0) {
        highlightedElements[0].scrollIntoView({ behavior: 'smooth' });
    }
}

// Initializes the formatting of JSON entries
function initializeJsonEntries() {
    var jsonEntries = document.querySelectorAll('.json-entry');
    jsonEntries.forEach(function(entry) {
        var formattedJson = formatJson(entry.textContent);
        entry.textContent = formattedJson;
    });
}

// Sets up event listeners for form submission and container clicks
function setupEventListeners() {
    document.getElementById('search-form').addEventListener('submit', handleFormSubmit);
    document.querySelector('.container').addEventListener('click', handleContainerClick);
}

// Handles the form submission event
function handleFormSubmit(event) {
    event.preventDefault();
    var keyword = document.getElementById('search').value;
    filterLogEntries(keyword);
}

// Handles click events within the container
function handleContainerClick(event) {
    var target = event.target;
    var logEntry = findParentLogEntry(target);
    if (logEntry) {
        var logId = logEntry.dataset.logId;
        toggleLogDetails(logId);
    }
}

// Finds the parent log entry element
function findParentLogEntry(element) {
    while (element && !element.classList.contains('log-entry')) {
        element = element.parentElement;
    }
    return element;
}

// Toggles the display of log details
function toggleLogDetails(logId) {
    var arrowElement = document.getElementById('arrow-' + logId);
    var detailsElement = document.getElementById('details-' + logId);
    if (detailsElement && arrowElement) {
        var isDisplayed = detailsElement.style.display === 'block';
        detailsElement.style.display = isDisplayed ? 'none' : 'block';
        arrowElement.classList.toggle('active');
        formatAndDisplayJson(logId, isDisplayed);
    } else {
        console.error('Could not find elements for logId:', logId);
    }
}

// Formats and displays JSON data
function formatAndDisplayJson(logId, isDisplayed) {
    if (!isDisplayed) {
        var logEntry = document.querySelector('.log-entry[data-log-id="' + logId + '"]');
        if (logEntry) {
            var logTextElement = logEntry.querySelector('.log-text');
            if (logTextElement && logTextElement.textContent.includes('deployed_bots ===')) {
                var jsonPart = logTextElement.textContent.split('deployed_bots === ')[1];
                var jsonString = jsonPart.replace(/'([^']*)'/g, '"$1"');
                try {
                    var jsonObject = JSON.parse(jsonString);
                    var formattedJson = JSON.stringify(jsonObject, null, 4);
                    var detailsElement = document.getElementById('details-' + logId);
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

// Checks if a string is valid JSON
function isJson(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

// Formats a JSON string with indentation
function formatJson(jsonStr) {
    try {
        const jsonObj = JSON.parse(jsonStr);
        return JSON.stringify(jsonObj, null, 4);
    } catch (e) {
        return jsonStr;
    }
}

// Filters log entries based on a keyword
function filterLogEntries(keyword) {
    var logContainer = document.querySelector('.log-container');
    var logEntries = document.querySelectorAll('.log-entry');
    logContainer.innerHTML = '';
    logEntries.forEach(function (logEntry) {
        filterAndHighlightEntry(logEntry, keyword, logContainer);
    });
    adjustContainerHeight(logContainer);
}

// Filters and highlights a log entry based on the search keyword
function filterAndHighlightEntry(logEntry, keyword, logContainer) {
    var logTextElement = logEntry.querySelector('.log-text');
    if (logTextElement) {
        var logText = logTextElement.textContent;
        var lowerCaseLogText = logText.toLowerCase();
        var lowerCaseKeyword = keyword.toLowerCase();
        var matchesKeyword = lowerCaseLogText.includes(lowerCaseKeyword);

        if (keyword === '' || matchesKeyword) {
            logTextElement.innerHTML = logText.replace(new RegExp(lowerCaseKeyword, 'ig'), match => `<span class="highlight">${match}</span>`);
            logContainer.appendChild(logEntry);
        }
    }
}

// Adjusts the height of the log container
function adjustContainerHeight(logContainer) {
    logContainer.style.height = (logContainer.children.length > 0) ? 'auto' : '0';
}

