let postEditForm = document.getElementById('postEditForm');
postEditForm.addEventListener('submit', event => {
    let imageUpload = document.getElementById("imageUpload").files.length;
    let existingImg = document.querySelectorAll(".imageDeleteCheckbox").length;
    let deletedImg = document.querySelectorAll(".imageDeleteCheckbox:checked").length;
    let newTotal = existingImg + imageUpload - deletedImg;
    if(newTotal > 4) {
        event.preventDefault();
        let textSection = document.getElementById("text-section");
        textSection.innerText = `You need to remove at least ${newTotal -4} more image${newTotal === 5? '': 's'}`;
    }
});