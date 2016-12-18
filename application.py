#!flask/bin/python
from flask import Flask, jsonify
from flask import request
from aylienapiclient import textapi
from flask import abort
from time import sleep
from credentials import AWS_ID, AWS_REGION, AWS_SECRET_KEY, QUEUE_NAME,APP_ID,APP_KEY
from requests_aws4auth import AWS4Auth
import json
import requests
from elasticsearch import Elasticsearch, RequestsHttpConnection
from operator import itemgetter

client = textapi.Client(APP_ID,APP_KEY)
application = Flask(__name__)
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

@application.route("/")
def hello():
        return "Hello World!"

@application.route('/flaskhw/topCities',methods=['POST'])
def topCities():
    tweet = request.form.get('query')
    print tweet

    ent = []
    #Extract Entities
    entities = client.Entities({"text": tweet})
    for type,values in entities['entities'].iteritems():
        if(type == 'keyword'):
            ent = values[1:]
            print ent

    city_counts = es.search(index="cloud_index", doc_type="twitter", body={
            "query": {
                "bool": {
                    "should": [
                        { "match": { "content": ent[0] }},
                        { "match": { "content": ent[1] }}
                    ]
                }
            },
            "size": 0,
            "aggs" : {
                "city_counts" : {
                    "terms" : { "field" : "city" }
                }
            }
            }
            )
    cities=[]
    cities = [ d['key'] for d in city_counts['aggregations']['city_counts']['buckets']]
    city_counts_res = dict()
    city_counts_res['city_1'] =cities[0] 
    city_counts_res['city_2'] =cities[1]
    city_counts_res['city_3'] =cities[2]

    return jsonify(city_counts_res)

@application.route('/flaskhw/visualize', methods=['POST'])
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

@application.route('/flaskhw/hashtag', methods=['POST'])
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
    keys = ['#'+x.title().replace(" ","") for x,y in d];
    keys=keys[:5]
    tags += ','.join(keys)
    return jsonify({"tags": tags, "sentiment" : sentiment['polarity']});

if __name__ == '__main__':
    #application.run(debug=True,host="0.0.0.0")
    application.run(debug=True)
