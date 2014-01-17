$(function() {
 	var tableAv = new TableAv('#TableAv', { years:[2014, 2015], rooms:{  0:{id:0, name:'room name 1', av:{'31.1.2014':7}},1:{id:1, name:'room name 2', av:{'5.2.2014':3}}  } });
 	
 	EVENT_DISP.on('TableAvSave', function(data) {
    console.log(data);
  });
 	 
});