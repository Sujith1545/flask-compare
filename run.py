from flask import Flask, request, jsonify, send_file, render_template
import pandas as pd
from compare_pandasV2 import pandas_compare, compare_headers
from page2 import process_page2, download_result_file
from calculate.calculate_xlsx import run

app = Flask(__name__)

# In-memory storage for files
uploaded_files = {}
uploaded_files_page2 = {}
headers = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/page2')
def page2():
    return render_template('page2.html')

@app.route('/submit_page2', methods=['POST'])
def submit_text():
    message, status_code = process_page2(request)
    return jsonify({'message': message}), status_code


@app.route('/upload', methods=['POST'])
def upload_file():
    global uploaded_files
    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400
    
    # Read the file into a DataFrame
    if file.filename.endswith('.csv'):
        df = pd.read_csv(file)
    else:
        df = pd.read_excel(file)

    uploaded_files['file1'] = df

    # Extract headers
    global headers
    headers = df.columns.tolist()

    return jsonify({'headers': headers})

@app.route('/upload_second', methods=['POST'])
def upload_second_file():
    global uploaded_files
    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400
    
    # Read the second file into a DataFrame
    if file.filename.endswith('.csv'):
        df = pd.read_csv(file)
    else:
        df = pd.read_excel(file)

    uploaded_files['file2'] = df

    return jsonify({'message': 'File 2 uploaded successfully'})


@app.route('/compare_headers', methods=['POST'])
def compare_headers_route():
    if 'file1' not in uploaded_files or 'file2' not in uploaded_files:
        return jsonify({'error': 'Both files must be uploaded'}), 400

    df1 = uploaded_files['file1']
    df2 = uploaded_files['file2']

    # Compare headers
    error_message = compare_headers(df1, df2)
    if error_message:
        return jsonify({'error': error_message}), 400

    return jsonify({'message': 'Headers matched successfully'})


@app.route('/process', methods=['POST'])
def process_files():
    if 'file1' not in uploaded_files or 'file2' not in uploaded_files:
        return jsonify({'error': 'Both files must be uploaded'}), 400
    
    data = request.json
    selected_headers = data.get('headers')
    selected_method = data.get('selectedMethod')
    print('selected_method: ', selected_method)

    if not selected_headers:
        return jsonify({'error': 'No headers selected'}), 400

    # Ensure selected_headers is a list
    if isinstance(selected_headers, set):
        selected_headers = list(selected_headers)

    # Process the files based on selected headers
    df1 = uploaded_files['file1']
    df2 = uploaded_files['file2']


    # try:
    #     error = compare_headers(df1, df2, selected_headers)
    #     if len(error) > 0:
    #          return jsonify({'error': f'2: {str(error)}'}), 400
    # except ValueError as e:
    #     return jsonify({'error': f'3: {str(e)}'}), 400
    
    # print('still runnnign....')
    result_df = None
    try:
        result_df = pandas_compare(df1, df2, selected_headers)
        if result_df is None:
            return jsonify({'success': f'All matched'}), 400
    except KeyError as e:
        return jsonify({'error': f'KeyError 2: {str(e)}'}), 400

    

    return send_file(
        result_df,
        as_attachment=True,
        download_name='result.xlsx',
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )


@app.route('/calculate', methods=['POST'])
def calculate_xlsx():

    raw_file_path = 'calculate/raw.xlsx'    
    df = pd.read_excel(raw_file_path, sheet_name='Sheet1')
    r = run(df)
    return r

@app.route('/common', methods=['POST'])
def get_common():
    first_path = 'data/first.xlsx'
    second_path = 'data/second.xlsx'    
    df1 = pd.read_excel(first_path, sheet_name='Sheet1')
    df2 = pd.read_excel(second_path, sheet_name='Sheet1')
    r = pandas_compare(df1, df2, ['A', 'B'])
    if r:
        return send_file(
            r,
            as_attachment=True,
            download_name='result.xlsx',
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    else:
        return jsonify({'error': 'All mathched'})


@app.route('/donload_page2_file', methods=['GET'])
def donload_page2_file():
    r = download_result_file()
    return r


@app.route('/upload_get_data_file', methods=['POST'])
def upload_get_data_file():
    return jsonify({'message': 'Page 2 uploaded file successfully'})
    global uploaded_files_page2
    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400
    
    # Read the second file into a DataFrame
    if file.filename.endswith('.csv'):
        df = pd.read_csv(file)
    else:
        df = pd.read_excel(file)

    print('page 2 file: ', df)
    return jsonify({'message': 'Page 2 uploaded file successfully'})


if __name__ == '__main__':
    app.run(debug=True)
