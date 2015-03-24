/** @jsx React.DOM */

$(document).ready(function(){
    $.ajax({
        type:'GET',
        url: "../data/data.json",
        dataType : 'json',
        contentType: 'application/json; charset=utf-8',
        success:function(data){
            React.renderComponent(<DynamicTableContainer data={data}/>,  document.getElementById('root'));
        },
        error:function(data){
            console.log(data);
            React.renderComponent(<AjaxError/>,  document.getElementById('root'));
        }
    });
});

var DynamicTableContainer = React.createClass({
    submitForm: function(){
        this.refs.dataFields.validateForm();
    },
    render: function() {
        return (
            <div className = {'headerDiv'}>
                        <form id={"submitFields"} action={"./showRenderedValue.html"} method={"GET"} encType={"application/json"} target="_blank">
                            <DynamicTableComponent data = {this.props.data} ref={'dataFields'}/>
                        </form>
                        <input type={"submit"} value={"Submit"} onClick={this.submitForm}/>
                        <div id={"validationMsg"}></div>
                </div>
        )
    }
}),

DynamicTableComponent = React.createClass({
    validateForm: function() {
        var jsondata=this.props.data.fields, dataArr=[], validationMsg = '';
        for(var i=0;i<this.getDOMNode().getElementsByTagName('td').length;i++) {
            var element = this.getDOMNode().getElementsByTagName('td')[i].lastChild,
            elems = element.getAttribute("name"),dataCheck='',dataMaxLength='',dataMinLength='',
            mandatory='';
            for(var k=0;k<jsondata.length;k++){
                if(jsondata[k].name === elems) {
                    if(jsondata[k].check !== undefined) {
                        dataCheck = new RegExp(jsondata[k].check);
                    }
                    if(jsondata[k].length !== undefined) {
                        dataMaxLength = jsondata[k].length.max;
                        dataMinLength = jsondata[k].length.min;
                    }
                    if(jsondata[k].mandatory !== undefined) {
                        mandatory = jsondata[k].mandatory;
                    }
                }
            }
            if(mandatory !== '') {
                if(element.getAttribute("type") === 'radio') {
                    if(element.checked === false){
                        validationMsg += this.getDOMNode().getElementsByTagName('td')[i].firstChild.innerHTML+' is not checked.  ';
                    }
                } else {
                    if(element.value === null || element.value.trim() === '') {
                        validationMsg += this.getDOMNode().getElementsByTagName('td')[i].firstChild.innerHTML+' is empty.  ';
                    } else {
                        if(dataMaxLength !== '' && dataMinLength !== '') {
                            if(element.value.length > dataMaxLength) {
                                validationMsg += 'Texts in '+this.getDOMNode().getElementsByTagName('td')[i].firstChild.innerHTML+' must not be more than '+dataMaxLength+'. ';
                            }else if(element.value.length < dataMinLength) {
                                validationMsg += 'Texts in '+this.getDOMNode().getElementsByTagName('td')[i].firstChild.innerHTML+' must not be less than '+dataMinLength+'. ';
                            } else {
                                if(dataCheck !== '') {
                                    if (!dataCheck.test(element.value)) {
                                        validationMsg += "Invalid text in "+this.getDOMNode().getElementsByTagName('td')[i].firstChild.innerHTML+'. ';
                                    }
                                }
                            }
                        } else {
                            if(dataCheck !== '') {
                                if (!dataCheck.test(element.value)) {
                                    validationMsg += "Invalid text in "+this.getDOMNode().getElementsByTagName('td')[i].firstChild.innerHTML+'. ';
                                }
                            }
                        }
                    }
                }
            }
        }
        if(validationMsg.trim() === '') {
            document.getElementById('submitFields').submit();
        } else {
            document.getElementById("validationMsg").innerHTML = validationMsg;
        }
    },
    render: function() {
        var jsondata=this.props.data.fields, gridTRs = [],flag=false,urlFor2ndTable='',
            title = this.props.data.title ;
        console.log(this.props.data);
        if(jsondata){
            for(var i=0;i<jsondata.length; i++) {
                if(jsondata[i].type === 'select') {
                    if(jsondata[i].cascadingFormUrl!==undefined){
                        flag=true;
                    }
                    if(jsondata[i].dataUrl && jsondata[i].dataUrl!='') {
                        $.ajax({
                            type:'GET',
                            url: jsondata[i].dataUrl,
                            dataType : 'json',
                            async:false,
                            contentType: 'application/json; charset=utf-8',
                            success:function(data){
                                jsondata[i].items=data.listData;
                            },
                            error:function(eData){
                                    console.log(eData);
                                React.renderComponent(<AjaxError/>,  document.getElementById('_2ndTable'));
                            }
                        });
                    }
                    gridTRs.push(<tr><DropDownComponent jsondata = {jsondata[i]} /></tr>);
                } else {
                    gridTRs.push(<tr><InputBoxComponent jsondata = {jsondata[i]} /></tr>);
                }
            }
        }
        if(flag){
         return(
             <div>
               <span>{title}</span>
               <table id={"data-fields"}>
                  {gridTRs}
               </table>
                <div id='_2ndTable'></div>
             </div>
         );
        }
        else{
         return(
             <div>
               <span>{title}</span>
               <table id={"data-fields"}>
                  {gridTRs}
               </table>
             </div>
         );
        }
    }
}),

InputBoxComponent = React.createClass({
    render: function() {
        var type = this.props.jsondata.type, name = this.props.jsondata.name, label = this.props.jsondata.label,
        mandatory = this.props.jsondata.mandatory;
        if(mandatory === 'true') {
            return(
                <td>
                    <span>{label}</span>
                    <input type={type} name={name} required ></input>
                </td>
            )
        } else {
            return(
                <td>
                    <span>{label}</span>
                    <input type={type} name={name}></input>
                </td>
            )
        }
    }
}),
DropDownComponent = React.createClass({
    load2ndTable: function(){
        if(this.props.jsondata.cascadingFormUrl!==undefined){
            $.ajax({
            type:'GET',
            url: this.props.jsondata.cascadingFormUrl,
            dataType : 'json',
            contentType: 'application/json; charset=utf-8',
            success:function(data){
                React.renderComponent(<DynamicTableComponent data={data}/>,  document.getElementById('_2ndTable'));
            },
            error:function(eData){
                    console.log(eData);
                React.renderComponent(<AjaxError/>,  document.getElementById('_2ndTable'));
            }
        });
        }

    },
    render: function() {
        var type = this.props.jsondata.type, name = this.props.jsondata.name, label = this.props.jsondata.label
        ,items=this.props.jsondata.items,urlFor2ndTable='';

        return(
            <td>
                <span>{label}</span>
                <select name={name} onChange={this.load2ndTable}>
                    <option value='Select'>Select</option>
                    {items.map (function(item,index) {
                        return (<option value={item}>{item}</option>);
                      })}
                </select>
            </td>
        )
    }
}),

AjaxError = React.createClass({
    render: function() {
        return(
            <div>Error in AJAX call. Please try again.</div>
        )
    }
});


