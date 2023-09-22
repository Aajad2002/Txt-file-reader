const express = require('express');
const multer = require('multer');
const fs = require('fs');
const app = express();

const cors = require('cors')
//set middleware to running app on the different origins
app.use(cors())
// Set up middleware for parsing JSON and handling file uploads
app.use(express.json());
const upload = multer({ dest: 'uploads/' });

// Function to analyze text and calculate word frequency
function analyzeText(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            // Tokenize the text into words
            const words = data.toLowerCase().split(/\s+|[,.;?!()"'-]+/);


            // Calculate word frequency
            const wordFrequency = {};
            words.forEach((word) => {
                if (word !== '') {
                    if (wordFrequency[word]) {
                        wordFrequency[word]++;
                    } else {
                        wordFrequency[word] = 1;
                    }
                }
            });

            // Sort words by frequency in descending order
            const sortedWords = Object.keys(wordFrequency).sort(
                (a, b) => wordFrequency[b] - wordFrequency[a]
            );

            // Get the top 5 most occurring words
            const topWords = sortedWords.slice(0, 5).map((pair) => ({
                pair: wordFrequency[pair],
            }));;

            //Top 5 mostly co-occurred words ( adjacent words in pairs )

            const coOccurrences = [];
            for (let i = 0; i < words.length - 1; i++) {
                const word1 = words[i];
                const word2 = words[i + 1];
                if (word1 !== '' && word2 !== '') {
                    const pair = `${word1} ${word2}`;
                    if (coOccurrences[pair]) {
                        coOccurrences[pair]++;
                    } else {
                        coOccurrences[pair] = 1;
                    }
                }
            }
            const sortedCoOccurrences = Object.keys(coOccurrences).sort(
                (a, b) => wordFrequency[b] - wordFrequency[a]
            );
            // Get the top 5 most co-occurred word pairs with their frequencies
            const topCoOccurrences = sortedCoOccurrences.slice(0, 5).map((pair) => ({
                pair: coOccurrences[pair],
            }));
            resolve({
                wordFrequency: wordFrequency,
                topWords: topWords,
                topCoOccurrences,
                data
            });
        });
    });
}

// API endpoint for file upload and text analysis
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const filePath = req.file.path;

        // Analyze the uploaded text file
        const analysisResult = await analyzeText(filePath);
        console.log(analysisResult)
        // Return the analysis result as JSON
        res.json(analysisResult);
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'An error occurred.' });
    }
});

// Start the server
app.listen(8080, () => {
    console.log(`Server is running on port ${8080}`);
});
