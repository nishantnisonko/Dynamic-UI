/** @jsx React.DOM */

var RenderVal = React.createClass({
	render: function() {
		var url = document.URL;
		url = url.split('?');
		var data = url[1].split('&'), renderArr = [];
		for(var i =0; i< data.length; i++) {
			if(data[i].indexOf('=') !== -1) {
				var val = data[i].split('=');
				renderArr.push(<div>{val[0]} - {val[1]}</div>);
			} else {
			renderArr.push(<div>{data[i]}</div>);		   
			}			
		}
		return(
			<div>
				{renderArr}
			</div>
		);
	} 
});
	
React.renderComponent(<RenderVal/>,document.getElementById('main'));