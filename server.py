from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html', form=True)

# https://codepen.io/natewiley/pen/HBrbL;

if __name__ == '__main__':
    app.run(port=8000,debug=True)

