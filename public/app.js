let currentUserId = 1;

document.addEventListener('DOMContentLoaded', async () => {
  await loadUsers();
  await refreshApp();
});

async function loadUsers() {
  const res = await fetch('/api/users');
  const users = await res.json();
  
  const select = document.getElementById('current-user');
  const userList = document.getElementById('user-list');
  
  select.innerHTML = users.map(u => `<option value="${u.id}">${u.username}</option>`).join('');
  
  userList.innerHTML = users.map(u => `
    <li class="user-item">
      <span>@${u.username}</span>
      <button onclick="toggleFollow(${u.id})">Follow / Unfollow</button>
    </li>
  `).join('');
}

async function refreshApp() {
  currentUserId = document.getElementById('current-user').value;
  await fetchProfile();
  await fetchPosts();
}

function switchUser() {
  refreshApp();
}

async function fetchProfile() {
  const res = await fetch(`/api/users/${currentUserId}`);
  const user = await res.json();

  document.getElementById('profile-name').innerText = `@${user.username}`;
  document.getElementById('profile-bio').innerText = user.bio;
  document.getElementById('followers-count').innerText = user.followersCount;
  document.getElementById('following-count').innerText = user.followingCount;
}

async function fetchPosts() {
  const res = await fetch('/api/posts');
  const posts = await res.json();

  const container = document.getElementById('posts-feed');
  container.innerHTML = '';

  for (const post of posts) {
    const commentsRes = await fetch(`/api/posts/${post.id}/comments`);
    const comments = await commentsRes.json();

    const postEl = document.createElement('div');
    postEl.className = 'post';
    postEl.innerHTML = `
      <div class="post-header">@${post.username}</div>
      <div class="post-content">${post.content}</div>
      <div class="post-actions">
        <button onclick="likePost(${post.id})">❤️ Like (${post.likesCount})</button>
      </div>
      <div class="comments-section">
        <strong>Comments:</strong>
        <div id="comments-${post.id}">
          ${comments.map(c => `<div class="comment"><b>@${c.username}:</b> ${c.content}</div>`).join('')}
        </div>
        <input type="text" id="input-comment-${post.id}" placeholder="Add a comment..." style="width:70%; padding: 0.3rem;">
        <button onclick="addComment(${post.id})">Send</button>
      </div>
    `;
    container.appendChild(postEl);
  }
}

async function createPost() {
  const content = document.getElementById('post-content').value;
  if (!content) return;

  await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: currentUserId, content })
  });

  document.getElementById('post-content').value = '';
  fetchPosts();
}

async function likePost(postId) {
  await fetch(`/api/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: currentUserId })
  });
  fetchPosts();
}

async function addComment(postId) {
  const input = document.getElementById(`input-comment-${postId}`);
  const content = input.value;
  if (!content) return;

  await fetch(`/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: currentUserId, content })
  });

  input.value = '';
  fetchPosts();
}

async function toggleFollow(targetUserId) {
  await fetch(`/api/users/${targetUserId}/follow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_user_id: currentUserId })
  });
  fetchProfile();
}