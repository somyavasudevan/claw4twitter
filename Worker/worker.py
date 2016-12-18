from time import sleep
import json
import boto.sqs
from boto.sqs.message import Message
import ast
from aylienapiclient import textapi
import sys
from credentials import AWS_ID, AWS_REGION, AWS_SECRET_KEY,QUEUE_NAME
from requests_aws4auth import AWS4Auth
import requests
import pandas as pd
import numpy as np
from elasticsearch import Elasticsearch, RequestsHttpConnection
reload(sys)

class SQSNotification():
    def __init__(self, aws_id, aws_key, aws_region='us-west-2', queue_name=QUEUE_NAME):
        try:
            #connect with sqs
            self.sqs = boto.sqs.connect_to_region(aws_region, aws_access_key_id=AWS_ID, aws_secret_access_key=AWS_SECRET_KEY)
            self.sqs_queue = self.sqs.get_queue(queue_name)
            self.client = textapi.Client("46e65c9d", "f8cf31b777b9f672d9cd84c37b3e1b96") 
            self.es = es
        except Exception as e:
            print('Could not connect')
            print(e)
        print('Connected to AWS SQS: '+ str(self.sqs))

    def readAndPushES(self):
        while True:
            #poll for new notifs every second
            rs = self.sqs_queue.get_messages() #result set
            if len(rs) > 0:
                for m in rs:
                    print('Opening notification')
                    body = m.get_body()
                    tweet= ast.literal_eval(body)
                    #do something with the tweet
                    print(tweet['content'])
                    sentiment = self.client.Sentiment({"text": tweet['content']})
                    tweet['sentiment'] = sentiment['polarity']
                    cord = np.array([tweet['coordinates'][1],tweet['coordinates'][0]])
                    mat = np.column_stack((df['latitude'],df['longitude']))
                    index = np.argmin(np.apply_along_axis(np.linalg.norm, 1, mat - cord))
                    city = df.loc[index,'city']
                    tweet['city']  = city
                    print tweet
                    #send processed tweet to Elastic Search
                    try:
                        es.index(index='cloud_index', doc_type='twitter', body=tweet)
                    except Exception as e:
                         print('Elasticserch indexing failed')
                         print(e)
                    
                    #delete notification when done
                    self.sqs_queue.delete_message(m)
                    print('Done')
            else:
                sleep(1)

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
df =  pd.read_csv('locations.csv', dtype={'latitude':pd.np.float64,'longitude':pd.np.float64})
df =  df[['city','latitude','longitude']]
#df = df.drop_duplicates(subset=['city'])
df['city'] = df['city'].apply(lambda x : str(x).decode('ascii','ignore'))
sys.setdefaultencoding('utf-8')
sqs_notif = SQSNotification(AWS_ID,AWS_SECRET_KEY)
sqs_notif.readAndPushES()
