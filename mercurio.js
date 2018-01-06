module.exports = function(RED) {
    function Mercurio(config) 
    {
        //Invia dati a server Mercurio
        const request = require('request');
        const defaultServerUrl="https://cloud.crib-lab.it:1971";
        var sendToServer=function(serverurl,fnc,requestData,callback)
        {
            request({
                method: "POST",
                url: serverurl+fnc,
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: requestData
            }, function(error, response, body) {
                if(error)
                {
                    callback(null);
                }
                else
                {
                    callback(body);
                }
            });                        
        };

        RED.nodes.createNode(this,config);
        this.username=config.username;
        this.password=config.password;
        this.notification=config.notification;
        this.serverurl=config.serverurl;
        
        var node = this;
        node.on('input', function(msg)
        {
            //Imposta url server
            const serverurl=(node.serverurl===undefined?defaultServerUrl:node.serverurl);

            //Esegue connessione con il server remoto
            const requestData={
                "username":node.username,
                "password":node.password
            };
            sendToServer(serverurl,"/users/login",requestData,function(body){
                if(body===null)
                {
                    node.status({fill:"red",shape:"dot",text:"error"});
                    msg.payload="Connection Error";
                    node.send([null,msg]);
                }
                else
                {
                    if(!body.status) // Errore di autenticazione
                    {
                        node.status({fill:"red",shape:"dot",text:"error"});
                        msg.payload=body.message;
                        node.send([null,msg]);
                    }
                    else // autenticazione avvenuta con successo
                    {
                        node.status({fill:"green",shape:"dot",text:"autenticated"});
    
                        //Ricava token per richiesta successiva
                        const token=body.data.toString();
    
                        //ricava tipologia di notifica
                        const type=(node.notification==="0"?parseInt(msg.type):node.notification);
    
                        switch(parseInt(type))
                        {
                            case 1: // voip tts
                                var phone=msg.phone;
                                var message=msg.message;
                                var sms=msg.sms;
                                if(phone===undefined||message===undefined)
                                {
                                    node.status({fill:"red",shape:"dot",text:"error"});
                                    msg.payload="msg.phone / msg.message is REQUIRED";
                                    node.send([null,msg]);
                                }
                                else
                                {
                                    const requestData={
                                        "requestParams":[
                                        {
                                         "number":phone,
                                         "text2say":message,
                                         "voice":"Carla",
                                         "filename":"",
                                         "msgSMSIfCallIsInError":(sms===undefined?"":sms)
                                        }
                                      ]
                                    };
                                    sendToServer(serverurl,"/voice?id="+token,requestData,function(body){
                                        if(body===null)
                                        {
                                            node.status({fill:"red",shape:"dot",text:"error"});
                                            msg.payload="Connection Error";
                                            node.send([null,msg]);
                                        }
                                        else
                                        {
                                            if(!body.status) // La chiamata ha tornato un errore
                                            {
                                                node.status({fill:"red",shape:"dot",text:"error"});
                                                msg.payload=body.message;
                                                node.send([null,msg]);
                                            }
                                            else // chiamata avvenuta con successo
                                            {
                                                node.status({fill:"green",shape:"dot",text:"voip executed"});
                                                msg.payload=body.message;
                                                node.send([msg,null]);
                                            }
                                        }                                    
                                    });
                                }
                                break;
                            case 2: // sms
                                var phone=msg.phone;
                                var message=msg.message;
                                var from=msg.from;
                                if(phone===undefined||message===undefined||from===undefined)
                                {
                                    node.status({fill:"red",shape:"dot",text:"error"});
                                    msg.payload="msg.phone / msg.message / msg.from is REQUIRED";
                                    node.send([null,msg]);
                                }
                                else
                                {
                                    const requestData={
                                        "requestParams":[
                                        {
                                        "message":message,
                                        "number":phone,
                                        "from":from
                                        }
                                    ]
                                    };
                                    sendToServer(serverurl,"/sms?id="+token,requestData,function(body){
                                        if(body===null)
                                        {
                                            node.status({fill:"red",shape:"dot",text:"error"});
                                            msg.payload="Connection Error";
                                            node.send([null,msg]);
                                        }
                                        else
                                        {
                                            if(!body.status) // La chiamata ha tornato un errore
                                            {
                                                node.status({fill:"red",shape:"dot",text:"error"});
                                                msg.payload=body.message;
                                                node.send([null,msg]);
                                            }
                                            else // chiamata avvenuta con successo
                                            {
                                                node.status({fill:"green",shape:"dot",text:"sms sended"});
                                                msg.payload=body.message;
                                                node.send([msg,null]);
                                            }
                                        }                                    
                                    });
                                }
                            break;
                            case 3: // email
                                var from=msg.from;
                                var to=msg.to;
                                var subject=msg.subject;
                                var message=msg.message;
                                if(from===undefined||to===undefined||subject===undefined||message===undefined)
                                {
                                    node.status({fill:"red",shape:"dot",text:"error"});
                                    msg.payload="msg.from / msg.to / msg.subject / msg.message is REQUIRED";
                                    node.send([null,msg]);
                                }
                                else
                                {
                                    const requestData={
                                        "requestParams":[
                                        {
                                         "from":msg.from,
                                         "to":msg.to,
                                         "subject":msg.subject,
                                         "message":msg.message,
                                         "attach":(msg.attach===undefined?"":msg.attach)
                                        }
                                      ]
                                    };
                                    sendToServer(serverurl,"/email?id="+token,requestData,function(body){
                                        if(body===null)
                                        {
                                            node.status({fill:"red",shape:"dot",text:"error"});
                                            msg.payload="Connection Error";
                                            node.send([null,msg]);
                                        }
                                        else
                                        {
                                            if(!body.status) // La chiamata ha tornato un errore
                                            {
                                                node.status({fill:"red",shape:"dot",text:"error"});
                                                msg.payload=body.message;
                                                node.send([null,msg]);
                                            }
                                            else // chiamata avvenuta con successo
                                            {
                                                node.status({fill:"green",shape:"dot",text:"email sended"});
                                                msg.payload=body.message;
                                                node.send([msg,null]);
                                            }
                                        }                                    
                                    });
                                }
                            break;
                            case 4: // push
                                var appName=msg.appname;
                                var title=msg.title;
                                var message=msg.shortmessage;
                                var additionalData=msg.longmessage;
                                var platformType=parseInt(msg.platform);
                                if(appName===undefined||title===undefined||message===undefined||additionalData===undefined||platformType===undefined)
                                {
                                    node.status({fill:"red",shape:"dot",text:"error"});
                                    msg.payload="msg.appname / msg.title / msg.shortmessage / msg.longmessage / msg.platform is REQUIRED";
                                    node.send([null,msg]);
                                }
                                else
                                {
                                    const requestData={
                                        "requestParams":[
                                        {
                                         "title":title,
                                         "message":message,
                                         "additionalData":additionalData,
                                         "appName":appName,
                                         "platformType":platformType
                                        }
                                      ]
                                    };
                                    sendToServer(serverurl,"/push?id="+token,requestData,function(body){
                                        if(body===null)
                                        {
                                            node.status({fill:"red",shape:"dot",text:"error"});
                                            msg.payload="Connection Error";
                                            node.send([null,msg]);
                                        }
                                        else
                                        {
                                            if(!body.status) // La chiamata ha tornato un errore
                                            {
                                                node.status({fill:"red",shape:"dot",text:"error"});
                                                msg.payload=body.message;
                                                node.send([null,msg]);
                                            }
                                            else // chiamata avvenuta con successo
                                            {
                                                node.status({fill:"green",shape:"dot",text:"push sended"});
                                                msg.payload=body.message;
                                                node.send([msg,null]);
                                            }
                                        }                                    
                                    });
                                }
                        
                            break;
                            case 5: // logs
                                var dateTo=msg.dateto.toString();
                                var dateFrom=msg.datefrom.toString();
                                if(dateFrom===undefined||dateTo===undefined)
                                {
                                    node.status({fill:"red",shape:"dot",text:"error"});
                                    msg.payload="msg.datefrom / msg.dateto is REQUIRED";
                                    node.send([null,msg]);
                                }
                                else
                                {
                                    var requestData="&code=0&dateFrom="+dateFrom+"&dateTo="+dateTo;
                                    request({
                                        method: "GET",
                                        url: serverurl+"/logs?id="+token+requestData,
                                    }, function(error, response, body) {
                                        if(body===null)
                                        {
                                            node.status({fill:"red",shape:"dot",text:"error"});
                                            msg.payload="Connection Error";
                                            node.send([null,msg]);
                                        }
                                        else
                                        {
                                            body=JSON.parse(body);
                                            if(!body.status) // La chiamata ha tornato un errore
                                            {
                                                node.status({fill:"red",shape:"dot",text:"error"});
                                                msg.payload=body.message;
                                                node.send([null,msg]);
                                            }
                                            else // chiamata avvenuta con successo
                                            {
                                                node.status({fill:"green",shape:"dot",text:"get logs"});
                                                var logs=[];
                                                body.data[0].forEach(function(r){
                                                    if(r.code!=10)
                                                    {
                                                        logs.push(r);
                                                    }
                                                });
                                                msg.payload=logs;
                                                node.send([msg,null]);
                                            }
                                        }                                    
                                    });
                                }
                            break;
                        }
                    }
                }
            });
        });

        node.on('close', function(done) {
            done();
            node.status({});
            node.send(null);
        });        
    }

    RED.nodes.registerType("mercurio",Mercurio);
}