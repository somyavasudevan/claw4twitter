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

def init_moderator_table():
    users = dict()
    handles = ['kartikeya','aashima56584982']
    for h in handles:
        try:
            """
            res = es.search(index='moderators', doc_type="twitter", body={
                "query": {
                    "term": {
                        handle : h 
                        }
                    }
                })
            if res['hits']['total'] == 0:
            """
            data = {
                    'handle': h,
                    'weight': 10
            }
            es.index(index='moderators', doc_type='twitter', body=data)

        except Exception as e:
            print('Elasticsearch indexing failed')
            print(e)

@application.route('/flaskhw/checkFake',methods=['POST'])
def checkFake():
    tweetids = request.form.get('query')
    id_list = tweetids.strip().split(',')
    tweet_csv = ""
    for val in id_list:
        #Run elastic search in malicious
        res = es.search(index="malicious_tweets", doc_type="twitter", body={
                "query": {
                    "term": {
                        "tweet_id": val
                        }
                    }
                })
        if res['hits']['total'] > 0:
            tweet_csv += str(val) + ","
    return tweet_csv

@application.route('/flaskhw/updateWeights',methods=['POST'])
def updateTweetWeights():
    content = request.get_json(silent=True)
    user_id = content['user_id']
    tweet_id= content['tweet_id']
    print tweet_id
    print user_id

    #check if user id exists in moderator table
    moderator_res=es.count(index="moderator", doc_type="twitter", body={
        "query": {
            "term": {
                "handle": user_id
                }
            }
        })
    if(moderator_res['count']>1):
        weight=10
    else:
        weight=1

    #Write Update Query here(update with weight), if query does not exixts then create
    #get current count and incr count
    tweet_weight=es.search(index="malicious_tweets", doc_type="twitter", body={
        "query": {
            "term": {
                "tweet_id": tweet_id
                }
            }
        })

    if(tweet_weight['hits']['total']>1):  #if query exists in Elastic Search then update by using index id
        index_id= [d['_id'] for d in tweet_weight['hits']['hits']]
        print  index_id[0]
        source = [d['_source'] for d in tweet_weight['hits']['hits']]
        old_weight = [d['weight'] for d in  source] 
        new_weight = old_weight[0] + weight
        #update weigth
        es.update(index='malicious_tweets', doc_type='twitter', id=str(index_id[0]), body={
            'doc': {
                'weight': new_weight
                }
            })
    else: #tweet does not exist hence create new
        data = {
            'tweet_id': tweet_id,
            'count': 1,
            'weight': weight
            }
        try:
            es.index(index="malicious_tweets", doc_type="twitter", body=data)
        except Exception as e:
            print('Elasticserch indexing failed')
            print(e)

    return "UPDATION DONE"

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

        city_counts = es.search(index="cloud_index", doc_type="twitter", body={
            "query": {
                "bool": {
                    "should": [
                        { "match": { "content": term }},
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
        d = dict()
        d['entity'] =  term
        d['pos'] = res_pos['count']
        d['neg'] = res_neg['count']
        d['neutral'] =  res_neutral['count']
        city_list = ""
        count  = 0
        for i in range(len(cities)):
            if count < 3:
                city_list += cities[i] + ", "
                count = count + 1
            else:
                break

        city_list = city_list[:-2]
        d['cities']  = city_list
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
            ent = values[1:3]
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
    #init_moderator_table()
    #application.run(debug=True)
    """
    data = {
            'tweet_id': '811564284706689024',
            'count': 1,
            'weight': 10
            }
    try:
        es.index(index="malicious_tweets", doc_type="twitter", body=data)
    except Exception as e:
        print('Elasticserch indexing failed')
        print(e)
    """
    application.run(debug=True,host="0.0.0.0")
