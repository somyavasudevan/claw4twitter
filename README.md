# Claw
Flask backend for the chrome extension Claw for hashtag recommendation, sentiment analysis and visualization

The application currently recommends hashtags and the number of positive,negative and neutral tweets corresponding to an entity
in JSON format.

##Components
1. Tweepy/Twitter API for streaming tweets
2. AWS Elastic Search for storing the tweets
3. SQS Queues for interaction between worker and streamer.
4. Aylien API for hashtag and sentiment analysis
5. Deployment on elastic beanstalk

Hashtags Recommendations for a sample tweet:
![Screenshot](https://cloud.githubusercontent.com/assets/21965720/21211887/5f98b516-c255-11e6-9d46-52b221b04ddb.png)

Sentiment Category for a important entities in the sample tweet:
![Screenshot](https://cloud.githubusercontent.com/assets/21965720/21211946/104d0d94-c256-11e6-9c64-33f0de5b9987.png)
