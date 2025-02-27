// Select elements from the HTML for file input, canvas, and output messages
const imageUpload = document.getElementById('image-upload'); // Input for image upload
const canvas = document.getElementById('canvas'); // Canvas to display the image and results
const ctx = canvas.getContext('2d'); // Canvas drawing context for drawing shapes and text
const output = document.getElementById('output'); // Output message display element

// Variable to hold the loaded object detection model
let model;

// Load the CoCoSSD pre-trained object detection model
cocoSsd.load()
.then(loadedModel => {
    model = loadedModel; // Save the loaded model to the variable
    output.innerHTML = 'Model loaded! Upload an image to start detecting objects.';
});
  
// Handle image upload event
imageUpload.addEventListener('change', event => {
    const file = event.target.files[0]; // Get the selected file
    if (!file) return; // Exit if no file was selected

    const image = new Image(); // Create a new image element
    const reader = new FileReader(); // Create a file reader to read the image

    // Load the image when the file is read
    reader.onload = () => {
        image.src = reader.result; // Set the image source to the file content
        image.onload = () => {
            // Calculate scale to fit the image within a 300x300 canvas
            const maxDimension = 400; // Maximum width or height for display
            const scale = Math.min(maxDimension / image.width, maxDimension / image.height);

            const newWidth = image.width * scale; // Scaled width of the image
            const newHeight = image.height * scale; // Scaled height of the image

            // Clear any previous drawing on the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw the resized image on the canvas
            ctx.drawImage(image, 0, 0, newWidth, newHeight);

            // Detect objects in the resized image
            detectObjects(image, scale);
        };
    };

    // Read the file as a data URL (base64 encoded image)
    reader.readAsDataURL(file);
});

// Function to detect objects in the uploaded image
function detectObjects(image, scale) {
    output.innerHTML = 'Detecting objects...'; // Display detection status

    // Use the model to detect objects in the image
    model.detect(image).then(predictions => {
        output.innerHTML = ''; // Clear the message after detection

        // Loop through all detected objects
        predictions.forEach(prediction => {
            // Scale bounding box coordinates based on the canvas size
            const [x, y, width, height] = prediction.bbox.map(value => value * scale);
            const text = `${prediction.class} (${(prediction.score * 100).toFixed()}%)`; // Label text

            // Draw a red rectangle around the detected object
            ctx.strokeStyle = 'red'; // Rectangle color
            ctx.lineWidth = 2; // Rectangle border width
            ctx.strokeRect(x, y, width, height);

            // Add a label above the rectangle
            ctx.fillStyle = 'red'; // Text color
            ctx.font = '16px Arial'; // Text font style
            ctx.fillText(text, x, y > 10 ? y - 5 : 10); // Display the label near the object
        });

        // Show a message if no objects are detected
        if (predictions.length === 0) {
            output.innerHTML = 'No objects detected.';
        }
    });
}