/**
 * Compresses an image file and converts it into a lightweight Base64 string
 * directly inside a JS variable before transmitting data.
 */
function convertFileToBase64Variable(file, maxWidth, maxHeight) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = function (event) {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = function () {
        let width = img.width;
        let height = img.height;
        
        // Maintain aspect ratio while resizing (Max 150x150 for small payload size)
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Save compressed image directly to a Base64 string variable (JPEG at 60% quality)
        const base64ImageVariable = canvas.toDataURL('image/jpeg', 0.6);
        resolve(base64ImageVariable);
      };

      img.onerror = function (err) {
        reject("Failed to process image file.");
      };
    };

    reader.onerror = function (err) {
      reject("Failed to read image file.");
    };
  });
}

async function submitStudent() {
  const saveBtn = document.getElementById('save-btn');
  const fileInput = document.getElementById('student-photo-file');
  
  const form = {
    row: document.getElementById('student-row').value,
    id: document.getElementById('student-id').value,
    name: document.getElementById('student-name').value,
    gender: document.getElementById('student-gender').value,
    status: document.getElementById('student-status').value,
    email: document.getElementById('student-email').value,
    phone: document.getElementById('student-phone').value,
    existingPassport: document.getElementById('student-existing-passport').value,
    passportDataUri: null // Will hold the converted Base64 string variable
  };

  if (!form.name) return alert("Full Name is required.");

  saveBtn.disabled = true;
  saveBtn.innerText = "Processing Image...";

  try {
    // 1. Check if a new file is picked
    if (fileInput && fileInput.files.length > 0) {
      // Store converted base64 payload into local variable
      const base64StringVariable = await convertFileToBase64Variable(fileInput.files[0], 150, 150);
      form.passportDataUri = base64StringVariable;
    } else {
      // If no new photo, retain the existing base64 string
      form.passportDataUri = form.existingPassport;
    }

    saveBtn.innerText = "Saving Profile...";
    
    // 2. Send the prepared form (containing raw base64 string) to Google Apps Script
    executeSave(form, saveBtn);

  } catch (error) {
    saveBtn.disabled = false;
    saveBtn.innerText = "Save Student";
    alert("Image Error: " + error);
  }
}
