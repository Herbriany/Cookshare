let postNewForm = document.getElementById('postNewForm');
postNewForm.addEventListener('submit', event => {
    let imageUpload = document.getElementById("images").files.length;
    if(imageUpload > 4) {
        event.preventDefault();
        let textSection = document.getElementById("text-section");
        textSection.innerText = `You need to remove at least ${imageUpload -4} more image${imageUpload === 5? '': 's'}`;
    }
});