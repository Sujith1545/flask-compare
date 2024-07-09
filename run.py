from flask import *  
from werkzeug.utils import secure_filename
import os
from compare_pandas import compare, get_headers, get_df, compare_v2
from io import BytesIO
import pandas as pd


app = Flask(__name__)  


UPLOAD_FOLDER = 'uploads/'
ALLOWED_EXTENSIONS = {'xlsx', 'xls', 'csv'}

app.config['SECRET_KEY'] = 'secret'
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

cfh = [] #['Red', 'Blue', 'Black', 'Orange']
# nfh = []

curfile = None
newfile = None

cfh_df = None
nfh_df = None


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')  
def index():  
    global cfh
    return render_template("index.html", cfh=cfh)  
        
    

@app.route('/upload', methods =["POST"])  
def upload_files():  
    # if request.method == "POST":
    print('---- POST: call : ')
    colours = ['Red', 'Blue', 'Black', 'Orange']
    if 'curfile' not in request.files or 'newfile' not in request.files:
        flash("Sorry, the upload didn't send all of the data!")
        return redirect(request.url)
    curfile = request.files["curfile"]
    newfile = request.files["newfile"]
    
    curfile.save('uploads/file1.xlsx')
    newfile.save('uploads/file2.xlsx')

    # cfh = ['Red', 'Blue', 'Black', 'Orange'] 
    cfh = get_headers(curfile)
    print('cfh: ', cfh)
    return jsonify({"cfh":cfh})
    # return render_template("index.html", cfh=cfh)  



# @app.route('/success', methods = ['POST'])  
# def success():  
#     if request.method == 'POST':  
#         f = request.files['file']  
#         f.save(f.filename)  
#         return render_template("success.html", name = f.filename)  


@app.route('/submit', methods = ['POST'])  
def submit():
    curfile = request.files.get('curfile')
    newfile = request.files.get('newfile')
    keys = [i for i in request.form]

    # print('keys:: ', request.form)
    # output = compare_v2(cfh_df, nfh_df, ["Month","Category"])
    output = compare(curfile, newfile, keys)
    return send_file('./uploads/result.xlsx', download_name="testfile.txt", as_attachment=True)
    # return send_file(BytesIO(b"Hello World!"), download_name="testfile.txt", as_attachment=True)


if __name__ == '__main__':  
    app.run(host= '0.0.0.0', debug = True)  
