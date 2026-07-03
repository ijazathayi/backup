document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const fileElem = document.getElementById('fileElem');
    const fileInfo = document.getElementById('file-info');
    const fileNameDisplay = document.getElementById('file-name');
    const fileSizeDisplay = document.getElementById('file-size');
    const removeBtn = document.getElementById('remove-btn');
    const processBtn = document.getElementById('process-btn');
    const progressContainer = document.getElementById('progress-container');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    let currentFile = null;

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop area
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropArea.classList.add('highlight');
    }

    function unhighlight(e) {
        dropArea.classList.remove('highlight');
    }

    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Handle selected files
    fileElem.addEventListener('change', function(e) {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length === 0) return;
        const file = files[0];
        
        if (file.type !== 'application/pdf') {
            showError('Please select a valid PDF file.');
            return;
        }

        currentFile = file;
        
        // Update UI
        fileNameDisplay.textContent = file.name;
        fileSizeDisplay.textContent = formatBytes(file.size);
        
        dropArea.classList.add('hidden');
        fileInfo.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        
        processBtn.classList.remove('disabled');
        processBtn.disabled = false;
    }

    // Format file size
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // Remove file
    removeBtn.addEventListener('click', () => {
        currentFile = null;
        fileElem.value = '';
        
        fileInfo.classList.add('hidden');
        dropArea.classList.remove('hidden');
        
        processBtn.classList.add('disabled');
        processBtn.disabled = true;
    });

    // Process file
    processBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        const outputFormat = document.querySelector('input[name="output_format"]:checked').value;
        
        // Update UI for processing state
        processBtn.classList.add('hidden');
        fileInfo.style.pointerEvents = 'none';
        removeBtn.style.display = 'none';
        progressContainer.classList.remove('hidden');
        errorMessage.classList.add('hidden');

        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('output_format', outputFormat);

        try {
            // Adjust the URL if your backend is hosted elsewhere
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                let errorMessage = 'Processing failed';
                try {
                    const errorText = await response.text();
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorMessage;
                    } catch (e) {
                        errorMessage = errorText || errorMessage;
                    }
                } catch (e) {}
                throw new Error(errorMessage);
            }

            // Handle successful download
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadUrl;
            
            // Set filename based on format
            const baseName = currentFile.name.replace(/\.[^/.]+$/, "");
            a.download = `${baseName}_processed.${outputFormat}`;
            
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            a.remove();
            
            // Reset UI slightly to allow new uploads
            setTimeout(() => {
                resetUI();
            }, 1000);

        } catch (error) {
            showError(error.message);
            
            // Revert UI to allow retry
            processBtn.classList.remove('hidden');
            progressContainer.classList.add('hidden');
            fileInfo.style.pointerEvents = 'auto';
            removeBtn.style.display = 'block';
        }
    });

    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
    }
    
    function resetUI() {
        currentFile = null;
        fileElem.value = '';
        
        fileInfo.classList.add('hidden');
        dropArea.classList.remove('hidden');
        progressContainer.classList.add('hidden');
        processBtn.classList.remove('hidden', 'disabled');
        processBtn.disabled = true;
        processBtn.classList.add('disabled');
        fileInfo.style.pointerEvents = 'auto';
        removeBtn.style.display = 'block';
    }
});
