const ADMIN_PASSWORD = "0698";

async function uploadFile() {

  const password = document.getElementById('adminPassword').value;

  if (password !== ADMIN_PASSWORD) {

    alert('Only admin can upload');

    return;

  }

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

    alert(data.error || 'Upload failed');

    return;

  }

  loadPosts();

}

async function deletePost(id) {

  const password = document.getElementById('adminPassword').value;

  if (password !== ADMIN_PASSWORD) {

    alert('Wrong admin password');

    return;

  }

  await fetch('/delete/' + id, {
    method: 'DELETE'
  });

  loadPosts();

}

async function loadPosts() {

  const response = await fetch('/posts');

  const posts = await response.json();

  const gallery = document.getElementById('gallery');

  gallery.innerHTML = '';

  posts.forEach(post => {

    const card = document.createElement('div');

    card.className = 'card';

    if (post.type.startsWith('video')) {

      const video = document.createElement('video');

      video.src = post.url;

      video.controls = true;

      card.appendChild(video);

    } else {

      const img = document.createElement('img');

      img.src = post.url;

      card.appendChild(img);

    }

    const deleteBtn = document.createElement('button');

    deleteBtn.innerText = 'Delete';

    deleteBtn.className = 'delete-btn';

    deleteBtn.onclick = () => deletePost(post._id);

    card.appendChild(deleteBtn);

    gallery.appendChild(card);

  });

}

loadPosts();
