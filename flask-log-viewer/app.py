from flask import Flask, render_template, request
import json

app = Flask(__name__)

def classify_log_entry(entry):

    entry_lower = entry.lower()
    categories = ['critical', 'error', 'warning', 'notice', 'debug', 'info']
    for category in categories:
        if category in entry_lower:
            return category
    return 'normal'

def process_log_entries(log_entries):
 
    return [{"content": entry['content'], "class": classify_log_entry(entry['content'])}
            for entry in log_entries]

def get_log_entries(log_file_path):

    try:
        with open(log_file_path, 'r') as file:
            log_entries = [{"content": log.strip(), "class": classify_log_entry(log)}
                           for log in file if log.strip()]
            return log_entries
    except FileNotFoundError:
        return [{"content": "Error: Log file not found.", "class": "error"}]
    except Exception as e:
        return [{"content": f"Error reading log file: {e}", "class": "error"}]

def highlight_entries(log_entries, keyword):

    if not keyword:
        return log_entries

    keyword_lower = keyword.lower()
    return [{"content": entry['content'].replace(keyword, f'<span class="highlight">{keyword}</span>')
             if keyword_lower in entry['content'].lower() else entry['content'],
             "class": entry['class']} for entry in log_entries]

@app.route('/')
def log_viewer():

    log_file_path = 'logfile.log'
    keyword = request.args.get('search', '')
    log_entries = get_log_entries(log_file_path)
    log_entries = highlight_entries(log_entries, keyword) if keyword else log_entries
    return render_template('log_viewer.html', log_entries=log_entries, search_keyword=keyword)

@app.route('/search', methods=['GET', 'POST'])
def search():

    search_keyword = request.form.get('search', '') if request.method == 'POST' else ''
    log_entries = get_log_entries('logfile.log')
    highlighted_entries = highlight_entries(log_entries, search_keyword)
    return render_template('log_viewer.html', log_entries=highlighted_entries, search_keyword=search_keyword)

@app.route('/all')
def all_entries():

    log_entries = get_log_entries('logfile.log')
    return render_template('log_viewer.html', log_entries=log_entries)

@app.template_filter('to_pretty_json')
def to_pretty_json_filter(s):
 
    try:
        return json.dumps(json.loads(s), indent=4, sort_keys=True)
    except ValueError:
        return s

if __name__ == '__main__':
    app.run(debug=True)

