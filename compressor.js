const downloadLink = document.createElement('a'); // Create download link once outside
document.body.appendChild(downloadLink); // Append it to the body once

document.getElementById('compressBtn').addEventListener('click', async function() {
    const fileInput = document.getElementById('upload');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please upload an image first!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = async function() {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');

            // Get user-defined dimensions or use the original
            let width = parseInt(document.getElementById('width').value) || img.width;
            let height = parseInt(document.getElementById('height').value) || img.height;

            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            let quality = parseFloat(document.getElementById('quality').value) / 100; // Get quality from input (0.1 to 1.0)
            let blob;

            // Compress until we reach the desired size or quality threshold
            do {
                blob = await new Promise(resolve => {
                    canvas.toBlob(resolve, 'image/jpeg', quality);
                });

                // If the size is too large, decrease quality
                if (blob.size / 1024 > 40) {
                    quality -= 0.05; // Reduce quality
                    if (quality < 0.1) quality = 0.1; // Prevent going below a certain threshold
                }

                // If the size is still too large, reduce dimensions as well
                if (blob.size / 1024 > 40 && width > 50 && height > 50) {
                    width = Math.floor(width * 0.9); // Reduce width by 10%
                    height = Math.floor(height * 0.9); // Reduce height by 10%
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }

            } while (blob.size / 1024 > 40 && quality > 0.1); // Loop until size is below 40 KB

            const outputImg = document.getElementById('output');
            outputImg.src = URL.createObjectURL(blob);
            outputImg.style.display = 'block'; // Show compressed image

            // Update download link
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = 'compressed_image.jpg'; // Set filename for JPG
            downloadLink.innerText = 'Download Compressed Image (JPG)';
            downloadLink.style.display = 'block'; // Show download link
            
            // Show size information
            const originalSizeKB = (file.size / 1024).toFixed(2);
            const compressedSizeKB = (blob.size / 1024).toFixed(2);
            document.getElementById('sizeInfo').innerText = `Original Size: ${originalSizeKB} KB, Compressed Size: ${compressedSizeKB} KB`;
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});
