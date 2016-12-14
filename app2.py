#!flask/bin/python
from flask import Flask, jsonify
from flask import request
from aylienapiclient import textapi
from flask import abort
from time import sleep
import boto.sqs
import ast
from boto.sqs.message import Message
from credentials import AWS_ID, AWS_REGION, AWS_SECRET_KEY, QUEUE_NAME
from  operator import itemgetter 

client = textapi.Client("46e65c9d", "f8cf31b777b9f672d9cd84c37b3e1b96")
app = Flask(__name__)

def get_sqs_queue(sqs_name):
    try:
        sqs = boto.sqs.connect_to_region(AWS_REGION, aws_access_key_id=AWS_ID, aws_secret_access_key=AWS_SECRET_KEY)
        sqs_queue = sqs.get_queue(sqs_name)
    except Exception as e:
        print('Could not connect to SQS')
        print(e)
        print('Connected to AWS SQS: '+ str(sqs))
    return sqs_queue

@app.route('/flaskhw/hashtag', methods=['POST'])
def process_tweet():
    sqs_queue = get_sqs_queue(QUEUE_NAME)
    while True:
        #poll for new notifs every second
        rs = sqs_queue.get_messages() #result set

        if len(rs) > 0:
            for m in rs:
                print('Opening notification')
                body = m.get_body()
                body= eval(body)
                tweet = body['content']
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
                tags += ','.join(keys)
                return jsonify({"tags": tags, "sentiment" : sentiment['polarity']});

                #delete notification when done
                sqs_queue.delete_message(m)
                print('Done')
        else:
            sleep(1)

if __name__ == '__main__':
    app.run(debug=True,host="0.0.0.0")
