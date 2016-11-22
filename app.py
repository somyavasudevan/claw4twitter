#!flask/bin/python
from flask import Flask, jsonify
from flask import request
from aylienapiclient import textapi
from flask import abort

client = textapi.Client("46e65c9d", "f8cf31b777b9f672d9cd84c37b3e1b96")
app = Flask(__name__)

@app.route('/flaskhw/hashtag', methods=['POST'])
def process_tweet():
    data = eval(request.data)
    data = data['tweet']
    hashtags = client.Hashtags({"text": data})
    tags = '.'.join(hashtags['hashtags'])
    print "The hashtags are" + tags
    sentiment = client.Sentiment({"text": data})
    return jsonify({"tags": tags, "sentiment" : sentiment['polarity']});


if __name__ == '__main__':
    app.run(debug=True,host="0.0.0.0")
