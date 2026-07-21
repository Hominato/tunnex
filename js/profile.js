/* Profile Editor Controller */

const AVATARS = ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5'];
const AVATAR_COLORS = { avatar1: '#4f46e5', avatar2: '#10b981', avatar3: '#f59e0b', avatar4: '#ef4444', avatar5: '#3b82f6' };
let selectedAvatarFile = null;

document.addEventListener('DOMContentLoaded', () => {
  const user = DB.getCurrentUser();
  if (!user) return;

  populateReadOnlyInfo(user);
  buildAvatarGrid(user);
  prefillForm(user);
  hookAvatarUpload(user);

  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveProfile(user);
  });

  // Password toggle buttons
  document.querySelectorAll('.password-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.querySelector('i').className = input.type === 'password' ? 'far fa-eye' : 'far fa-eye-slash';
    });
  });
});

function populateReadOnlyInfo(user) {
  document.getElementById('profile-name').innerText = user.fullName;
  document.getElementById('profile-username').innerText = `@${user.username}`;
  document.getElementById('info-account').innerText = user.accountNumber;
  document.getElementById('info-customer').innerText = user.customerId;
  document.getElementById('info-email').innerText = user.email;
  document.getElementById('info-joined').innerText = new Date(user.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('info-balance').innerText = Utils.formatCurrency(user.balance);

  // Render current avatar in display
  renderAvatarDisplay(user.profileImage, user.fullName);
}

function renderAvatarDisplay(avatarId, fullName) {
  const display = document.getElementById('profile-avatar-display');
  const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  if (avatarId && (avatarId.startsWith('data:image') || avatarId.startsWith('http://') || avatarId.startsWith('https://'))) {
    display.innerHTML = `<img src="${avatarId}" style="width:100%; height:100%; object-fit:cover;">`;
  } else {
    const color = AVATAR_COLORS[avatarId] || '#4f46e5';
    display.innerHTML = `<svg viewBox="0 0 100 100" style="width:100%; height:100%;"><circle cx="50" cy="50" r="45" fill="${color}"/><text x="50" y="55" font-family="Poppins" font-size="30" font-weight="700" fill="white" text-anchor="middle" alignment-baseline="middle">${initials}</text></svg>`;
  }
}

function buildAvatarGrid(user) {
  const grid = document.getElementById('avatar-grid');
  if (!grid) return;

  AVATARS.forEach(id => {
    const initials = user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const color = AVATAR_COLORS[id];
    const div = document.createElement('div');
    div.className = `avatar-option${user.profileImage === id ? ' selected' : ''}`;
    div.setAttribute('data-avatar', id);
    div.innerHTML = `<svg viewBox="0 0 100 100" style="width:100%; height:100%;"><circle cx="50" cy="50" r="50" fill="${color}"/><text x="50" y="55" font-family="Poppins" font-size="32" font-weight="700" fill="white" text-anchor="middle" alignment-baseline="middle">${initials}</text></svg>`;
    div.addEventListener('click', () => {
      grid.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
      div.classList.add('selected');
      selectedAvatarFile = null; // Clear custom uploaded file when choosing a preset
      user.profileImage = id;
      renderAvatarDisplay(id, user.fullName);
    });
    grid.appendChild(div);
  });
}

function prefillForm(user) {
  document.getElementById('edit-name').value = user.fullName;
  document.getElementById('edit-phone').value = user.phone || '';
  document.getElementById('edit-address').value = user.address || '';
}

function hookAvatarUpload(user) {
  const fileInput = document.getElementById('avatar-upload');
  if (!fileInput) return;
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    
    selectedAvatarFile = file; // Cache file to upload on submit
    
    // Display local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      renderAvatarDisplay(e.target.result, user.fullName);
      // Deselect preset avatars
      document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
    };
    reader.readAsDataURL(file);
  });
}

async function saveProfile(user) {
  const newName = document.getElementById('edit-name').value.trim();
  const newPhone = document.getElementById('edit-phone').value.trim();
  const newAddress = document.getElementById('edit-address').value.trim();

  // If user selected a custom photo
  if (selectedAvatarFile) {
    if (typeof SupabaseService !== 'undefined' && SupabaseService.isReady()) {
      Utils.showToast('Uploading', 'Uploading picture to Supabase storage...', 'info');
      const publicUrl = await SupabaseService.uploadAvatar(user.id, selectedAvatarFile);
      if (publicUrl) {
        user.profileImage = publicUrl;
      }
    } else {
      // Fallback: Read as base64 and save locally
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(selectedAvatarFile);
      });
      user.profileImage = base64;
    }
  }

  user.fullName = newName;
  user.phone = newPhone;
  user.address = newAddress;

  // Save back to users array
  const users = DB.getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx !== -1) users[idx] = user;
  DB.saveUsers(users);
  DB.setCurrentUser(user);

  // Clear cache variable after successful save
  selectedAvatarFile = null;

  // Update display
  document.getElementById('profile-name').innerText = user.fullName;
  document.getElementById('profile-username').innerText = `@${user.username}`;

  // Dynamically refresh sidebar avatar if present on the screen
  const sidebarAvatar = document.getElementById('sidebar-avatar');
  if (sidebarAvatar && typeof getAvatarMarkup === 'function') {
    sidebarAvatar.innerHTML = getAvatarMarkup(user.profileImage, user.fullName);
  }

  Utils.showToast('Profile Saved', 'Your account details have been updated.', 'success');
}
