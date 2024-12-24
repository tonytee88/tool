const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

async function processPhoto(note) {
    const outputDir = path.join(__dirname, 'processed_photos');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const photoUrl = note.photoUrl;
    const activityNote = note.activityNote;
    const dateStamp = note.dateStamp;
    const category = note.category;

    const imageName = path.basename(photoUrl);
    const imagePath = path.join(outputDir, imageName);

    // Download the image
    await downloadImage(photoUrl, imagePath);

    // Define text to overlay
    const overlayText = `
        <svg width="100%" height="100%">
            <rect x="575" y="-300" width="100%" height="250" fill="black" fill-opacity="0.6" />
            <text x="95%" y="50" font-size="72px" fill="white" text-anchor="end">${activityNote}</text>
            <text x="95%" y="100" font-size="72px" fill="white" text-anchor="end">${dateStamp} - ${category}</text>
        </svg>
    `;

    const outputFilePath = path.join(outputDir, `processed_${imageName}`);
    try {
        // Process the image with Sharp
        await sharp(imagePath)
            .composite([{ input: Buffer.from(overlayText), top: null, left: null }])
            .toFile(outputFilePath);

        console.log(`Processed image saved at: ${outputFilePath}`);

        // Delete the original image
        fs.unlinkSync(imagePath);
        console.log(`Deleted original image: ${imagePath}`);
    } catch (error) {
        console.error("Error processing photo:", error);
    }
}

// Helper function to download image
async function downloadImage(url, destination) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    });

    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(destination);
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}


// Main function to process all notes
async function processAllNotes() {
    const notes = await treeMongoGetNotes(); // Your existing function to fetch notes

    // Filter notes as in your original code
    const filteredNotes = notes.filter(note => {
        const hasValidPhotoUrl = note.photoUrl && note.photoUrl.includes("mpgi-bucket.s3.amazonaws.com/images");
        const hasValidActivityNote = note.activityNote && note.activityNote !== "Sample activity note";
        return hasValidPhotoUrl && hasValidActivityNote;
    });
    
    // Process each filtered note
   //for (const note of filteredNotes) {
   //     await processPhoto(note);
    //}
    const testNotes = filteredNotes.slice(0, 2);

    for (const note of testNotes) {
        await processPhoto(note);
}
}

async function treeMongoGetNotes() {
    try {
        const response = await fetch('https://j7-magic-tool.vercel.app/api/treeMongoGetNotes', {
            method: 'GET', // Should likely be a GET request if fetching data
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Expecting an array of notes as the response
        const notes = await response.json();
        return notes;
    } catch (error) {
        console.error('Error fetching notes:', error);
        return [];  // Return an empty array in case of error
    }
}

processAllNotes()
    .then(() => console.log('All photos processed.'))
    .catch(err => console.error('Error processing photos:', err));
