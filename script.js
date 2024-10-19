const lyricsArray = [];

// Check for saved song data on page load
window.onload = function() {
    const savedData = localStorage.getItem('songData');
    if (savedData) {
        const confirmRecover = confirm("You have unsaved work. Do you want to recover it?");
        if (confirmRecover) {
            loadSavedData(JSON.parse(savedData));
        }
    }
};

function addLine() {
    const originalLine = document.getElementById('original').value;
    const translationLine = document.getElementById('translation').value;

    if (originalLine.trim() === "" || translationLine.trim() === "") {
        alert("Please enter both original line and translation.");
        return;
    }

    lyricsArray.push({ original: originalLine, translation: translationLine });
    renderLines();
    clearInputs();
    saveToLocalStorage(); // Save to local storage
}

function renderLines() {
    const addedLines = document.getElementById('addedLines');
    addedLines.innerHTML = ""; // Clear existing list

    lyricsArray.forEach((line, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';

        // Create a row for the original and translation
        const row = document.createElement('div');
        row.className = 'lyrics-row';

        const originalCol = document.createElement('div');
        originalCol.className = 'lyrics-col';
        originalCol.innerHTML = `Original: <span class="text-display">${line.original}</span>
                                 <input type="text" class="form-control editable" value="${line.original}" onchange="updateLine(${index}, 'original', this.value)" style="display:none;">`;

        const translationCol = document.createElement('div');
        translationCol.className = 'lyrics-col';
        translationCol.innerHTML = `Translation: <span class="text-display">${line.translation}</span>
                                   <input type="text" class="form-control editable" value="${line.translation}" onchange="updateLine(${index}, 'translation', this.value)" style="display:none;">`;

        // Append columns to row
        row.appendChild(originalCol);
        row.appendChild(translationCol);
        listItem.appendChild(row);

        // Controls for delete, move up, move down, and duplicate
        const controls = document.createElement('span');
        controls.className = 'controls';

        const editButton = document.createElement('button');
        editButton.className = 'btn btn-warning btn-sm';
        editButton.textContent = "Edit";
        editButton.onclick = () => toggleEdit(index);
        controls.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteLine(index);
        controls.appendChild(deleteButton);

        const duplicateButton = document.createElement('button');
        duplicateButton.className = 'btn btn-info btn-sm';
        duplicateButton.textContent = "Duplicate";
        duplicateButton.onclick = () => duplicateLine(index);
        controls.appendChild(duplicateButton);

        if (index > 0) {
            const moveUpButton = document.createElement('button');
            moveUpButton.className = 'btn btn-secondary btn-sm';
            moveUpButton.textContent = "↑";
            moveUpButton.onclick = () => moveLine(index, index - 1);
            controls.appendChild(moveUpButton);
        }

        if (index < lyricsArray.length - 1) {
            const moveDownButton = document.createElement('button');
            moveDownButton.className = 'btn btn-secondary btn-sm';
            moveDownButton.textContent = "↓";
            moveDownButton.onclick = () => moveLine(index, index + 1);
            controls.appendChild(moveDownButton);
        }

        listItem.appendChild(controls);
        addedLines.appendChild(listItem);
    });
}

function toggleEdit(index) {
    const listItem = document.querySelectorAll('#addedLines .list-group-item')[index];
    const textDisplays = listItem.querySelectorAll('.text-display');
    const inputs = listItem.querySelectorAll('.editable');

    // Toggle visibility of text and input fields
    textDisplays.forEach(display => {
        display.style.display = display.style.display === 'none' ? 'inline' : 'none';
    });
    inputs.forEach(input => {
        input.style.display = input.style.display === 'none' ? 'inline' : 'none';
    });

    // If showing inputs, focus on the first input
    if (inputs[0].style.display === 'inline') {
        inputs[0].focus();
    }
}

function updateLine(index, field, value) {
    lyricsArray[index][field] = value; // Update the specific field of the line
    renderLines(); // Refresh the displayed list
    saveToLocalStorage(); // Save to local storage
}

function deleteLine(index) {
    lyricsArray.splice(index, 1); // Remove the line from the array
    renderLines(); // Refresh the displayed list
    saveToLocalStorage(); // Save to local storage
}

function duplicateLine(index) {
    const lineToDuplicate = lyricsArray[index];
    lyricsArray.push({ original: lineToDuplicate.original, translation: lineToDuplicate.translation });
    renderLines(); // Refresh the displayed list
    saveToLocalStorage(); // Save to local storage
}

function moveLine(fromIndex, toIndex) {
    const [movedLine] = lyricsArray.splice(fromIndex, 1); // Remove the line from the original position
    lyricsArray.splice(toIndex, 0, movedLine); // Insert it in the new position
    renderLines(); // Refresh the displayed list
    saveToLocalStorage(); // Save to local storage
}

function clearInputs() {
    document.getElementById('original').value = "";
    document.getElementById('translation').value = "";
}

function downloadJSON() {
    const title = document.getElementById('title').value;
    const artist = document.getElementById('artist').value;
    const language = document.getElementById('language').value;
    const year = document.getElementById('year').value;

    const songJSON = {
        title: title,
        artist: artist,
        language: language,
        year: year,
        lyrics: lyricsArray
    };

    const blob = new Blob([JSON.stringify(songJSON, null, 4)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            loadSavedData(data);
        } catch (error) {
            alert("Invalid JSON file.");
        }
    };
    reader.readAsText(file);
}

// Save song data to localStorage
function saveToLocalStorage() {
    const title = document.getElementById('title').value;
    const artist = document.getElementById('artist').value;
    const language = document.getElementById('language').value;
    const year = document.getElementById('year').value;

    const songData = {
        title: title,
        artist: artist,
        language: language,
        year: year,
        lyrics: lyricsArray
    };

    localStorage.setItem('songData', JSON.stringify(songData));
}

// Load saved data into the form
function loadSavedData(data) {
    document.getElementById('title').value = data.title || '';
    document.getElementById('artist').value = data.artist || '';
    document.getElementById('language').value = data.language || '';
    document.getElementById('year').value = data.year || '';
    lyricsArray.length = 0; // Clear existing lines
    data.lyrics.forEach(line => {
        lyricsArray.push({ original: line.original, translation: line.translation });
    });
    renderLines(); // Render the new lyrics
}
