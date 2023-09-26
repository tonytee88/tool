// client-side code
async function callApi(prompt) {
    try {
      const response = await fetch('https://j7-magic-tool.vercel.app/api/my-serverless-function/openaiCall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(data); // Process the response data as needed
    } catch (error) {
      console.error('Error calling the API', error);
    }
  }

  function submitForm() {
    const transcript = document.getElementById('transcript').value; // Get the value from the transcript textarea
    callApi(transcript).then(response => {
        document.getElementById('output').value = JSON.stringify(response, null, 2); // Display the API response in the output textarea
    });
}