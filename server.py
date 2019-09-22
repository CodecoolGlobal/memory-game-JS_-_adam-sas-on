from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html', form=True)

@app.route('/play-game', methods=['POST', 'GET'])
def play():
    if request.method == 'POST':
        try:
            memo_count = int(request.form['memos'])
        except:
            memo_count = 12

        return render_template('index.html', form=True, memo_count=memo_count*2, menu_hide=True)

    return render_template('index.html', form=True, menu_hide=True)
#

# https://codepen.io/natewiley/pen/HBrbL;

if __name__ == '__main__':
    app.run(port=8000,debug=True)

