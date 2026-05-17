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

    gallery.appendChild(card);

  });

}

loadPosts();
