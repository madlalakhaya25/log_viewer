from flask import Flask, render_template, request
import re

app = Flask(__name__)


def get_log_entries(log_file_path):
    with open(log_file_path, 'r') as file:
        # Read the content of the log file and split it into a list of entries
        logs = file.read().split('\n')

        # Process logs to replace Unicode characters
        processed_logs = [log.replace('\u003c', '<').replace('\u003e', '>') for log in logs]

        return processed_logs


def highlight_entries(log_entries, keyword=None):
    highlighted_entries = []

    for entry in log_entries:
        # Highlight search keyword if provided and present in the entry
        if keyword and keyword.lower() in entry.lower():
            entry = re.sub(f'({re.escape(keyword)})', r'<span class="highlight">\1</span>', entry, flags=re.IGNORECASE)

        # Highlight ERROR entries
        elif 'ERROR' in entry:
            entry = f'<span class="error">{entry}</span>'

        # Highlight WARNING entries
        elif 'WARNING' in entry:
            entry = f'<span class="warning">{entry}</span>'

        # Highlight INFO entries containing "Redis is up"
        elif 'INFO' in entry and 'Redis is up' in entry:
            entry = f'<span class="redis-up">{entry}</span>'

        # Highlight INFO entries for deployed bots
        elif 'INFO' in entry and 'deployed_bots' in entry:
            entry = f'<span class="deployed-bots">{entry}</span>'

        highlighted_entries.append(entry)

    return highlighted_entries


@app.route('/')
def index():
    # Path to the log file
    log_file_path = 'logfile.log'

    # Get log entries from the file
    log_entries = get_log_entries(log_file_path)

    # Get the search keyword from the query parameters
    keyword = request.args.get('search', '')

    print(f'Search Keyword: {keyword}')  # For debugging

    # Highlight log entries based on the presence of errors or warnings
    log_entries = highlight_entries(log_entries, keyword)

    # Render the log viewer template with the processed log entries
    return render_template('log_viewer.html', log_entries=log_entries, search_keyword=keyword)


if __name__ == '__main__':
    app.run(debug=True)
