
async function callApi(transcript, transcriptPrompt) {
    try {
        const response = await fetch('https://j7-magic-tool.vercel.app/api/openaiCall', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ transcript, transcriptPrompt  }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        //console.log(data); // Process the response data as needed
        const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        // Check if content is undefined and return an error message if it is
        if (content === undefined) {
            return "Error: Content is undefined";
        }

        return content;
    } catch (error) {
        console.error('Error calling the API', error);
    }
}


function submitForm() {
    const transcript = document.getElementById('transcript').value;
    const transcriptPrompt = document.getElementById('promptTranscript').value; 
    callApi(transcript, transcriptPrompt).then(response => {
        document.getElementById('output').value = response;
    });
}