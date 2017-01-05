# claw4twitter

<img src="images/claw.jpg"/>

A sharp claw (i.e. Chrome Extension) for Larry (the Twitter Bird), which adds some utility to the twitter website user experience. Claw4Twitter is an attempt and providing users and businesses with relevant data as they compose tweets. The feature of identifying and reporting tweets as malicious can prove to be important in the wake of false news and trolling being rampant across the internet.

[Chrome Web Store Download Link](https://chrome.google.com/webstore/detail/claw4twitter/pdohffpcbhglhgaijgonjedlcnjaiagd)

[Website](https://somyavasudevan.github.io/)

[YouTube Demo](https://youtu.be/_J1AU9RsFgM)

#Features:
- Recommend hashtags suitable for the typed tweet.
- Report sentiment of typed tweet.
- Find subject (entity) of typed tweet.
- Find sentiment in past of subject of tweet.
- Show cities in which subjects of tweet are currently hot topics.
- Help the user identify tweets that are malicious (fake, troll, racist etc.).
- Allow a user to report a tweet as malicious. 
- Modern design, focus on user experience.
- Downloadable from Chrome Extension Store.
- Scalable backend built using AWS components.


#Screenshots:
![Iframes inserted into Twitter.com](/images/scr1.png?raw=true "Iframes inserted into twitter.com")

Iframes inserted into Twitter.com

![Malicious tweets appear red](/images/scr2.png?raw=true "Malicious tweets appear red")

Malicious tweets appearing red

#Cloud architecture:
- AWS Elastic Beanstalk
- AWS SQS
- Elasticsearch
- Aylien API for entity extraction, related phrases.
- Flask for backend webservice.
- Twitter API and Python Scripts for tweet streaming.

![Architecture Diagram](/images/archdiag.jpg?raw=true "Architecture Diagram")
