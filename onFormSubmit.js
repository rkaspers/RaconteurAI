// Replace with your OpenAI API key and endpoint
const API_KEY = 'API_KEY';
const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

function onFormSubmit(e) {
  // Extract form data
  const email = e.values[1];
  const storyline = e.values[3];
  const ageOfAudience = e.values[4];
  const storyType = e.values[5];
  const writingStyle = e.values[6];
  const language = e.values[2];
  const mainCharacter = e.values[7];

  // Format the message
  const userMessageContent = `Create a 500-word story for a ${ageOfAudience} audience with the theme "${storyType}" and storyline "${storyline}". Use ${writingStyle} writing style and write the story in the following language: ${language}. The Main Character is ${mainCharacter}. Give the story a title and start with giving the title in the response then leave a paragraph before the story.`;

   // Log the userMessageContent
  Logger.log('User Message Content: ' + userMessageContent);

  // Send data to the ChatGPT API
  const response = sendToChatGPT(userMessageContent);

  // Extract the generated story from the API response
  const generatedStory = response.choices[0].message.content;

// Send the generated story via email
sendEmail(email, generatedStory, response, storyline);

}

function sendToChatGPT(userMessageContent) {
  // Configure the ChatGPT API request
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    payload: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates stories.',
        },
        {
          role: 'user',
          content: userMessageContent,
        },
      ],
    }),
  };

  // Send the request to the ChatGPT API
  const response = UrlFetchApp.fetch(API_ENDPOINT, options);

  // Parse and return the response
  return JSON.parse(response.getContentText());
}

function sendEmail(email, generatedStory, response, storyline) {
  // Configure the email subject to include the storyline
  const subject = `Your AI-Generated Story: ${storyline}`;

  // Add paragraphs to the generated story
  const storyWithParagraphs = generatedStory.split('\n\n').join('</p><p>');

  // Create the HTML file with the story and the necessary attributes for Immersive Reader
  const htmlBody = `
    <!DOCTYPE html>
    <html lang="en" dir="ltr" class="reader-optimized">
      <head>
        <title>${storyline}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="theme-color" content="#0088CC">
        <meta name="msapplication-TileColor" content="#0088CC">
        <link rel="stylesheet" href="https://c.s-microsoft.com/static/fonts/segoe-ui/vfLc0aBjVjwgf1n0tVvYcQZY.woff2">
      </head>
      <body>
        <article class="reader-content">
          <p>${storyWithParagraphs}</p>
        </article>
      </body>
    </html>
  `;
  const blob = Utilities.newBlob(htmlBody, 'text/html', 'AIgenerated_story.html');

  // Send the email with the HTML file attached and the generated story in the email body
  const emailBody = generatedStory.split('\n\n').join('<br/><br/>');
  const emailOptions = {
    htmlBody: `${emailBody}<br/><br/><b>Attached is the HTML file for your generated story:</b>`,
    attachments: [blob],
  };
  MailApp.sendEmail(email, subject, emailBody, emailOptions);

  // Log the response
  Logger.log('Generated Story Response: ' + JSON.stringify(response));
}
