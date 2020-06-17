'use strict';
const uuid = require("uuid");

module.exports = async function detectTextIntent(queries, resolve, reject) {
    // [START dialogflow_detect_intent_text]
    // Imports the Dialogflow library
    const dialogflow = require('dialogflow');
    // Instantiates a session client
    const sessionClient = new dialogflow.SessionsClient();
    const projectId = process.env.project_id;
    const sessionId = uuid();
    const languageCode = process.env.languageCode || "ja";
  
    //projectId, sessionId, queries, languageCode
    async function detectIntent(projectId, sessionId, query, contexts, languageCode) {
      // The path to identify the agent that owns the created intent.
      const sessionPath = sessionClient.sessionPath(
        projectId,
        sessionId
      );
  
      // The text query request.
      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: query,
            languageCode: languageCode,
          },
        },
      };
  
      if (contexts && contexts.length > 0) {
        request.queryParams = {
          contexts: contexts,
        };
      }
  
      const responses = await sessionClient.detectIntent(request);
      return responses[0];
    }
  
    async function executeQueries(projectId, sessionId, queries, languageCode) {
      // Keeping the context across queries let's us simulate an ongoing conversation with the bot
      let context;
      let intentResponse;
      for (const query of queries) {
        intentResponse = await detectIntent(
          projectId,
          sessionId,
          query,
          context,
          languageCode
        );
        // Use the context from this response for next queries
        context = intentResponse.queryResult.outputContexts;
      }
      return intentResponse;
    }
  
    return await executeQueries(projectId, sessionId, queries, languageCode);
    /*
    executeQueries(projectId, sessionId, queries, languageCode).then((v)=>{
      resolve(v);
    }).catch((error)=>{
      console.error(error);
      reject(error);
    });
    // [END dialogflow_detect_intent_text]
    */
}
