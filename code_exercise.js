/* code_exercise.js */

const axios = require('axios');
const WebSocket = require('ws');

const codeExercise = () => {
    const message = 'My first message';
    const siteID = process.argv[2];
    const url = `https://va.idp.liveperson.net/api/account/${siteID}/signup`;
    const wsUrl = `wss://va.msg.liveperson.net/ws_api/account/${siteID}/messaging/consumer?v=3`;

    const handleRes = (res) => {
        const {jwt} = res.data;
        const options = {
            headers: {
                'Authorization': `JWT ${jwt}`
            }
        } 
        const socket = new WebSocket(wsUrl, options);
       
        socket.onopen = () => {
            const requestString = '{"kind":"req","id":1,"type":"cm.ConsumerRequestConversation"}';
            socket.send(requestString); 
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const {kind, reqId, code, body, type} = data;
            if(code === 200){
                if(reqId === '1' && kind === 'resp' && type === 'cm.RequestConversationResponse'){
                    const conversationID = body.conversationId;
                    const messageString = `{"kind":"req","id":2,"type":"ms.PublishEvent","body":{"dialogId":"${conversationID}","event":{"type":"ContentEvent","contentType":"text/plain","message":"${message}"}}}`;
                    socket.send(messageString);
                }
                if(reqId === '2' && kind === 'resp' && type === 'ms.PublishEventResponse'){
                    socket.close();
                }
            }
            else {
                socket.close();
            }
        };
    }

    axios.post(url).then(handleRes);
}

codeExercise();
