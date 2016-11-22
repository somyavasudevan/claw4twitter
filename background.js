alert("in background");
chrome.runtime.onConnect.addListener(function(port) {
    if(port.name == "my-channel"){
        port.onMessage.addListener(function(msg) {
            alert("inside background addListener");
			 $.ajax({
           		type: "GET", 
           		url: "http://jsonplaceholder.typicode.com/posts/1",
           		success: function(data){
              	// do something with data
			 	//console.log(data);
			 	port.postMessage({data1: data});
			 	}
      		});
        });
    }
});
