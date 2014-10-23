100-sdk
=======

##API/SDK:

`var sdk100 = require('100-sdk')({ config: '...' });`

<% for(var i in config.models){ %>
    <% if(!config.models[i].default){ %>

###<%= _.capitalize(config.models[i].name) %>:


####Query List:
`GET <%= config.models[i].uri %>`

#####NodeJS:
```
sdk100.<%= _.capitalize(config.models[i].name) %>.find({ }, function(err, <%= config.models[i].name %>s){
    if(err) throw err;//Error
    console.log(<%= config.models[i].name %>s);//Success
});
```

####Detail:
`POST <%= config.models[i].uri %>/:<%= config.models[i].name %>_id`

#####NodeJS:
```
sdk100.<%= _.capitalize(config.models[i].name) %>.findOne({ _id:'<%= config.models[i].name %>_id' }, function(err, <%= config.models[i].name %>){
    if(err) throw err;//Error
    if(!<%= config.models[i].name %>) throw new Error("No <%= _.capitalize(config.models[i].name) %>");

    console.log(<%= config.models[i].name %>);//Success
});
```

####Update:
`POST <%= config.models[i].uri %>/:<%= config.models[i].name %>_id`
#####NodeJS:
```
sdk100.<%= _.capitalize(config.models[i].name) %>.findOne({ _id:'<%= config.models[i].name %>_id' }, function(err, <%= config.models[i].name %>){
    if(err) throw err;//Error
    if(!<%= config.models[i].name %>) throw new Error("No <%= _.capitalize(config.models[i].name) %>");

    //console.log(<%= config.models[i].name %>);//Success

    <% for(var ii in config.models[i].fields){ %>
        <%= config.models[i].name %>.<%= ii %> = ...;
    <% } %>
    <%= config.models[i].name %>.save(function(err){
        if(err) throw err;//Error
        console.log("Successfully saved <%= config.models[i].name %>");//Success
    });
});
```

####Delete:
`DELETE <%= config.models[i].uri %>/:<%= config.models[i].name %>_id`


#####NodeJS:
!!!!NOTE: Matt has not written this yet
```
<%= config.models[i].name %>.remove(function(err){
    if(err) throw err;//Error
    console.log("Successfully removed <%= config.models[i].name %>");//Success
});
```
    <% } %>
<% } %>

//TOOD: Add Javasript Angular SDK

