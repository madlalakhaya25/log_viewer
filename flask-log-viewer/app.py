from flask import Flask, render_template, request
import re
import json

app = Flask(__name__)


# Classify log entries based on content
def classify_log_entry(entry):
    entry_lower = entry.lower()
    if 'critical' in entry_lower:
        return 'critical'
    elif 'error' in entry_lower:
        return 'error'
    elif 'warning' in entry_lower:
        return 'warning'
    elif 'notice' in entry_lower:
        return 'notice'
    elif 'debug' in entry_lower:
        return 'debug'
    elif 'info' in entry_lower:
        return 'info'
    return 'normal'

# Process and classify log entries
def process_log_entries(log_entries):
    processed_entries = []
    for entry in log_entries:
        # Assign the 'class' property based on content
        if 'error' in entry['content'].lower():
            entry['class'] = 'error'
        elif 'warning' in entry['content'].lower():
            entry['class'] = 'warning'
        else:
            entry['class'] = 'normal'
        
        # Append the processed entry to the result list
        processed_entries.append(entry)
    
    return processed_entries


# Route to handle search functionality
@app.route('/search', methods=['GET', 'POST'])
def search():
    # Execute search and display results
    search_keyword = request.form.get('search', '') if request.method == 'POST' else ''
    log_entries = get_log_entries('path_to_log_file')
    highlighted_entries = highlight_entries(log_entries, keywords=[search_keyword])
    return render_template('log_viewer.html', log_entries=highlighted_entries, search_keyword=search_keyword)

# Retrieve and process log entries from a file
def get_log_entries(log_file_path):
    try:
        with open(log_file_path, 'r') as file:
            log_entries = [{
                "content": log.replace('<', '&lt;').replace('>', '&gt;'),
                "class": classify_log_entry(log)
            } for log in file.read().split('\n') if log.strip()]  # Ensure we don't process empty lines
            return log_entries
    except FileNotFoundError:
        return [{"content": "Error: Log file not found.", "class": "error"}]
    except Exception as e:
        return [{"content": f"Error reading log file: {e}", "class": "error"}]


# Highlight keywords in log entries
def highlight_keyword(entry, keyword):
    # Case-insensitive highlighting of keyword in entry
    entry_lower = entry.lower()
    keyword_lower = keyword.lower()
    if keyword_lower in entry_lower:
        # Wrap the matched keyword with HTML <span> tags for highlighting
        return entry_lower.replace(keyword_lower, f'<span class="highlight">{keyword_lower}</span>')
    else:
        return entry  # No keyword found, return the original entry

# Highlight a keyword within a log entry
def highlight_entries(log_entries, keywords):
    return [{"content": highlight_keyword(entry, keyword), "class": classify_log_entry(entry)}
            for entry in log_entries for keyword in keywords if keyword]

# Main route to display the log viewer
@app.route('/')
def log_viewer():
    log_file_path = 'logfile.log'
    log_entries = get_log_entries(log_file_path)
    keyword = request.args.get('search', '')
    log_entries = highlight_entries(log_entries, keywords=[keyword]) if keyword else log_entries
    return render_template('log_viewer.html', log_entries=log_entries, search_keyword=keyword)

# Route to display all log entries
@app.route('/all')
def all_entries():
    log_entries = get_log_entries('logfile.log')
    return render_template('log_viewer.html', log_entries=log_entries)

# Custom filter for pretty printing JSON
@app.template_filter('to_pretty_json')
def to_pretty_json_filter(s):
    try:
        return json.dumps(json.loads(s), indent=4, sort_keys=True)
    except ValueError:
        return s

if __name__ == '__main__':
    app.run(debug=True)