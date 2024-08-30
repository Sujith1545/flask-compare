from flask import Flask, request, jsonify, send_file, render_template
import pandas as pd
import io

app = Flask(__name__)

# In-memory storage for files
uploaded_files = {}
headers = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    global uploaded_files
    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400
    
    # Read the file into a DataFrame
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
    df = pd.read_excel(file)
    uploaded_files['file2'] = df

    return jsonify({'message': 'File 2 uploaded successfully'})

@app.route('/process', methods=['POST'])
def process_files():
    if 'file1' not in uploaded_files or 'file2' not in uploaded_files:
        return jsonify({'error': 'Both files must be uploaded'}), 400
    
    data = request.json
    selected_headers = data.get('headers')

    if not selected_headers:
        return jsonify({'error': 'No headers selected'}), 400

    # Process the files based on selected headers
    df1 = uploaded_files['file1']
    df2 = uploaded_files['file2']
    
    # Example processing: merging two DataFrames on selected headers
    result_df = df1[selected_headers].merge(df2[selected_headers], how='inner')

    # Convert the result DataFrame to a byte stream
    result_stream = io.BytesIO()
    with pd.ExcelWriter(result_stream, engine='xlsxwriter') as writer:
        result_df.to_excel(writer, index=False)
    
    result_stream.seek(0)

    return send_file(
        result_stream,
        as_attachment=True,
        download_name='result.xlsx',
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

if __name__ == '__main__':
    app.run(debug=True)
