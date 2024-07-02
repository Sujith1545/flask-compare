from flask import *  
from werkzeug.utils import secure_filename
import os
from compare_pandas import compare, get_headers
from io import BytesIO

app = Flask(__name__)  


UPLOAD_FOLDER = 'uploads/'
ALLOWED_EXTENSIONS = {'xlsx', 'xls', 'csv'}

app.config['SECRET_KEY'] = 'secret'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1000 * 1000
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

cfh = [] #['Red', 'Blue', 'Black', 'Orange']
# nfh = []

curfile = None
newfile = None


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/', methods =["GET", "POST"])  
def gfg():  
    global cfh
    # global nfh

    global curfile
    global newfile

    if request.method == "POST":
        colours = ['Red', 'Blue', 'Black', 'Orange']
        if 'curfile' not in request.files or 'newfile' not in request.files:
            flash("Sorry, the upload didn't send all of the data!")
            return redirect(request.url)
        curfile = request.files["curfile"]
        newfile = request.files["newfile"]
        
        cfh = get_headers(curfile)
        # nfh = get_headers(newfile)
   
    return render_template("index.html", variables={"cfh": cfh})  

# @app.route('/success', methods = ['POST'])  
# def success():  
#     if request.method == 'POST':  
#         f = request.files['file']  
#         f.save(f.filename)  
#         return render_template("success.html", name = f.filename)  


@app.route('/submit', methods = ['POST'])  
def submit():
    global cfh
    # global nfh

    global curfile
    global newfile

    cfh = []

    payload = request.json
    print("---------", payload)
 
    output = compare(curfile, newfile, ["Month","Category"])
    return send_file(output, download_name="testfile.txt", as_attachment=True)
    # return send_file(BytesIO(b"Hello World!"), download_name="testfile.txt", as_attachment=True)


if __name__ == '__main__':  
    app.run(host= '0.0.0.0', debug = True)  
