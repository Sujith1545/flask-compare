from flask import *  
from werkzeug.utils import secure_filename
import os
from compare_pandas import *
# from io import BytesIO
# import pandas as pd
# from io import StringIO, BytesIO
from flask_session import Session


app = Flask(__name__)  


UPLOAD_FOLDER = 'uploads/'
ALLOWED_EXTENSIONS = {'xlsx', 'xls', 'csv'}

app.config['SECRET_KEY'] = 'secret'
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

cfh = [] #['Red', 'Blue', 'Black', 'Orange']
# nfh = []

curfile = None
newfile = None



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


    # d = pd.read_csv(curfile)
    # print('ddddd: dddd: ', d)
    
    # file1_path = 'uploads/' + curfile.filename
    # file2_path = 'uploads/' + newfile.filename

    # curfile.save(file1_path)
    # newfile.save(file2_path)

    # to_xlsx(file1_path, 'uploads/out1.xlsx')
    # to_xlsx(file2_path, 'uploads/out2.xlsx')

    # cfh = ['Red', 'Blue', 'Black', 'Orange'] 
    # d1 = get_df_v2(curfile)
    # print('dddddd 1: ', d1)
    # d2 = get_df_v2(newfile)
    # print('dddddd 2: ', d2)
    df1 = read_file(curfile)
    df2 = read_file(newfile)

    session['df1'] = df1
    session['df2'] = df2

    # print('session : ', session)
    # print('h1 : ', df1)
    # print('h2 : ', df2)

    h1 = get_headersV2(df1)
    h2 = get_headersV2(df2)

    # print('h1 : ', h1)
    # print('h2 : ', h2)

    # cfh =  [] #get_headers(curfile)
    cfh = get_headersV2(df1)
    # print('cfh: ', h1)
    return jsonify({"cfh": cfh})
    # return render_template("index.html", cfh=cfh)  



# @app.route('/success', methods = ['POST'])  
# def success():  
#     if request.method == 'POST':  
#         f = request.files['file']  
#         f.save(f.filename)  
#         return render_template("success.html", name = f.filename)  


@app.route('/submit', methods = ['POST'])  
def submit():
    df1 = session.get('df1', None)
    df2 = session.get('df2', None)

    keys = [i for i in request.form]

    if keys == []:
        return {'message': 'No keys found'}, 300

    # print('keys:: ', request.form)
    output = compare_v2(df1, df2, keys)
    # print('output: ', output)
    # output = compare(curfile, newfile, keys)
    return send_file('./uploads/result.xlsx', download_name="testfile.txt", as_attachment=True)
    # return send_file(BytesIO(b"Hello World!"), download_name="testfile.txt", as_attachment=True)


if __name__ == '__main__':  
    app.run(host= '0.0.0.0', debug = True)  
