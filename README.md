Client for Crib-Lab Mercurio notification Gateway


To perform Voip Call with TTS engine (msg.type=1), set the msg with the parameters followed : 
msg.phone	(Phone to Call)
msg.message	(Text to say by TTS engine)
msg.sms	(Text to send by sms if not answer (optional)

To send sms (msg.type=2), set the msg with the parameters followed : 
msg.phone	(Phone to send sms)
msg.message	(Body of messagge)
msg.from	(Name or number of sender)

To send E-mail (msg.type=3), set the msg with the parameters followed : 
msg.from	(E-mail sender)
msg.to	(E-mail recipient)
msg.subject	(E-mail subject)
msg.message	(Body of E-mail)

To send Push notofication for Android & IOS (msg.type=4), set the msg with the parameters followed : 
msg.appname	(Name of application owner)
msg.title	(Title of notification)
msg.shortmessage	(Short message (show in title bar)
msg.longmessage	(Body of message)
msg.platform	(Platform type : 1 Android / 2 IOS)

To get logs of notifications (msg.type=5), set the msg with the parameters followed : 
msg.datefrom	(From date : YYYY-MM-DDTHH:MM)
msg.dateto	(To date : YYYY-MM-DDTHH:MM)
