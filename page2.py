from compare_pandasV2 import pandas_compare, compare_headers
from flask import send_file, jsonify
import os

def process_page2(request):
    input1 = request.form.get('input1')
    input2 = request.form.get('input2')



    # Example logic for processing the inputs
    if not input1 or not input2:
        return 'Missing input fields', 400

    # Here you can add any processing logic you need
    message = f'Received: Input 1 = {input1}, Input 2 = {input2}'
    
    return message, 200


def download_result_file():
    # Define the path to the file you want to serve
    file_path = "data/first.xlsx"
    
    # Check if the file exists
    if not os.path.exists(file_path):
        print('file not found',)
        return jsonify({"error": "File not found"}), 404
    
    try:
        print('file found ', file_path)
        # Serve the file as an attachment with the proper filename
        return send_file(
            file_path,
            as_attachment=True,  # Forces download
            download_name="result_file.xlsx",  # Name the file when downloaded
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"  # Excel mime type
        )
    except Exception as e:
        print('error::', e)
        return jsonify({"error": str(e)}), 500