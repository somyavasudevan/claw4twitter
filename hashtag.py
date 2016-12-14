#!flask/bin/python
from flask import Flask, jsonify
from flask import request
from aylienapiclient import textapi
from flask import abort
from time import sleep
import ast
from credentials import AWS_ID, AWS_REGION, AWS_SECRET_KEY
from  operator import itemgetter 

client = textapi.Client("46e65c9d", "f8cf31b777b9f672d9cd84c37b3e1b96")
app = Flask(__name__)

@app.route('/flaskhw/hashtag', methods=['POST'])
def process_tweet():
    #poll for new notifs every second
    tweet = request.form.get('query')
    print tweet
    #do something with the tweet
    hashtags = client.Hashtags({"text": tweet})
    tags = ','.join(hashtags['hashtags'])
    tags += ','
    print "The hashtags are" + tags
    sentiment = client.Sentiment({"text": tweet})
    ent=[] 
    #Extract Entities
    entities = client.Entities({"text": tweet})
    for type,values in entities['entities'].iteritems():
        if(type == 'keyword'):
            ent = values[1:]
            print ent
    d = {}
    for term in ent:
        related = client.Related({"phrase":term})
        for phrase in related['related']:
            d[phrase['phrase']]=phrase['distance']
    d = sorted(d.items(), key=itemgetter(1))
    keys = [x for x,y in d];
    keys=keys[:5]
    tags += ','.join(keys)
    return jsonify({"tags": tags, "sentiment" : sentiment['polarity']});

if __name__ == '__main__':
    app.run(debug=True,host="0.0.0.0")
