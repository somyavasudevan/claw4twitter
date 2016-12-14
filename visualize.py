from flask import Flask, jsonify
from flask import request
from aylienapiclient import textapi
from flask import abort
from time import sleep
from credentials import AWS_ID, AWS_REGION, AWS_SECRET_KEY, QUEUE_NAME
from requests_aws4auth import AWS4Auth
import json
import requests
from elasticsearch import Elasticsearch, RequestsHttpConnection

client = textapi.Client("46e65c9d", "f8cf31b777b9f672d9cd84c37b3e1b96")
app = Flask(__name__)

awsauth = AWS4Auth(AWS_ID, AWS_SECRET_KEY,'us-west-2','es')
host = "search-jask-tweetmap-hhk4izgywmbpwob2zah4fcdiry.us-west-2.es.amazonaws.com"
es = Elasticsearch(
        hosts=[{'host': host, 'port': 443}],
        use_ssl=True,
        http_auth=awsauth,
        verify_certs=True,
        connection_class=RequestsHttpConnection
        )
print(es.info())

@app.route('/flaskhw/visualize', methods=['POST'])
def visualize():
    tweet = request.form.get('query')
    print tweet
    ent = []
    #Extract Entities
    entities = client.Entities({"text": tweet})
    for type,values in entities['entities'].iteritems():
        if(type == 'keyword'):
            ent = values[1:]
            print ent

    sent_list = list()
    for term in ent:
        res_pos = es.count(index="cloud_index", doc_type="twitter", body={
            "query": {
                "bool": {
                    "must": [
                        { "match": { "content": term }},
                        { "match": { "sentiment": "positive"}}
                        ]
                    }
                }
            }
            )

        res_neg = es.count(index="cloud_index", doc_type="twitter", body={
            "query": {
                "bool": {
                    "must": [
                        { "match": { "content": term }}, 
                        { "match": { "sentiment": "negative"}}
                        ]
                    }
                }
            }
            )

        res_neutral = es.count(index="cloud_index", doc_type="twitter", body={
            "query": {
                "bool": {
                    "must": [
                        { "match": { "content": term }}, 
                        { "match": { "sentiment": "neutral"}}
                        ]
                    }
                }
            }
            )

        d = dict()
        d['entity'] =  term
        d['pos'] = res_pos['count']
        d['neg'] = res_neg['count']
        d['neutral'] =  res_neutral['count']
        print d
        sent_list.append(d)
    
    print sent_list
    return jsonify(sent_list)
#return render_template(request, "polls/maps.html", {'plot':sent_List})
if __name__ == '__main__':
    app.run(debug=True,host="0.0.0.0")
