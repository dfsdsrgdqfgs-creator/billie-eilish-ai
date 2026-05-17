async function uploadFile() {

  const input = document.getElementById('fileInput');
  const file = input.files[0];

  if (!file) {
    alert('Choose file first');
    return;
  }

  const formData = new FormData();
  formData.append('media', file);

  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();

  if (!data.success) {
    alert('Upload failed');
    return;
  }

  const gallery = document.getElementById('gallery');

  const card = document.createElement('div');
  card.className = 'card';

  if (file.type.startsWith('video')) {

    const video = document.createElement('video');
    video.src = data.url;
    video.controls = true;

    card.appendChild(video);

  } else {

    const img = document.createElement('img');
    img.src = data.url;

    card.appendChild(img);

  }

  const text = document.createElement('p');
  text.innerText = 'New Upload';

  card.appendChild(text);

  gallery.appendChild(card);

}
