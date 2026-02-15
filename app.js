// DNA Encoding/Decoding System with Authentication
// DNA base pair mapping: 2 bits -> 1 base
const DNA_MAPPING = {
    '00': 'A',
    '01': 'T',
    '10': 'G',
    '11': 'C'
};

const REVERSE_DNA_MAPPING = {
    'A': '00',
    'T': '01',
    'G': '10',
    'C': '11'
};

// Global state
let currentUser = null;
let currentEncodedFile = null;
let currentDecodedFile = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupScrollEffects();
    setupFileUpload();
    setupDecodeUpload();
    setupNavigation();
    setupAuth();
    loadUserFromStorage();
}

// Scroll effects
function setupScrollEffects() {
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// File upload for encoding
function setupFileUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    
    if (!uploadZone || !fileInput) return;
    
    uploadZone.addEventListener('click', () => fileInput.click());
    
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleEncodeFile(file);
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleEncodeFile(file);
    });
}

// File upload for decoding
function setupDecodeUpload() {
    const decodeZone = document.getElementById('decodeZone');
    const decodeInput = document.getElementById('decodeInput');
    
    if (!decodeZone || !decodeInput) return;
    
    decodeZone.addEventListener('click', () => decodeInput.click());
    
    decodeZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        decodeZone.classList.add('dragover');
    });
    
    decodeZone.addEventListener('dragleave', () => {
        decodeZone.classList.remove('dragover');
    });
    
    decodeZone.addEventListener('drop', (e) => {
        e.preventDefault();
        decodeZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.dna')) {
            handleDecodeFile(file);
        } else {
            alert('Please upload a .dna file');
        }
    });
    
    decodeInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleDecodeFile(file);
    });
}

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            handleNavigation(targetId);
        });
    });
}

function handleNavigation(sectionId) {
    // Update active nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
        }
    });
    
    // Show/hide sections
    const sections = ['hero', 'encode', 'vault', 'decode', 'analytics', 'docs'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            if (id === sectionId || (sectionId === 'encode' && id === 'hero')) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        }
    });
    
    // Special handling for vault
    if (sectionId === 'vault') {
        if (!currentUser) {
            alert('Please sign in to access your vault');
            showAuthModal();
            return;
        }
        loadVault();
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToEncode() {
    document.getElementById('fileInput').click();
}

// Authentication
function setupAuth() {
    const authBtn = document.getElementById('authBtn');
    if (authBtn) {
        authBtn.addEventListener('click', () => {
            if (currentUser) {
                signOut();
            } else {
                showAuthModal();
            }
        });
    }
}

function showAuthModal() {
    document.getElementById('authModal').classList.add('active');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
    clearAuthForms();
}

function switchAuthTab(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active');
    
    clearAuthForms();
}

function clearAuthForms() {
    document.querySelectorAll('.auth-form input').forEach(input => input.value = '');
    document.querySelectorAll('.auth-message').forEach(msg => {
        msg.textContent = '';
        msg.className = 'auth-message';
    });
}

function signUp() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const messageEl = document.getElementById('signupMessage');
    
    if (!name || !email || !password || !confirmPassword) {
        showMessage(messageEl, 'Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage(messageEl, 'Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage(messageEl, 'Password must be at least 6 characters', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('genestore_users') || '{}');
    
    if (users[email]) {
        showMessage(messageEl, 'Email already registered', 'error');
        return;
    }
    
    users[email] = {
        name: name,
        email: email,
        password: btoa(password),
        files: [],
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('genestore_users', JSON.stringify(users));
    showMessage(messageEl, 'Account created! Switching to sign in...', 'success');
    
    setTimeout(() => {
        switchAuthTab('signin');
        document.getElementById('signinEmail').value = email;
    }, 1500);
}

function signIn() {
    const email = document.getElementById('signinEmail').value.trim();
    const password = document.getElementById('signinPassword').value;
    const messageEl = document.getElementById('signinMessage');
    
    if (!email || !password) {
        showMessage(messageEl, 'Please fill in all fields', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('genestore_users') || '{}');
    const user = users[email];
    
    if (!user || atob(user.password) !== password) {
        showMessage(messageEl, 'Invalid email or password', 'error');
        return;
    }
    
    currentUser = user;
    localStorage.setItem('genestore_current_user', email);
    showMessage(messageEl, 'Welcome back!', 'success');
    
    setTimeout(() => {
        closeAuthModal();
        updateAuthUI();
    }, 1000);
}

function signOut() {
    if (confirm('Are you sure you want to sign out?')) {
        currentUser = null;
        localStorage.removeItem('genestore_current_user');
        updateAuthUI();
        handleNavigation('encode');
    }
}

function loadUserFromStorage() {
    const userEmail = localStorage.getItem('genestore_current_user');
    if (userEmail) {
        const users = JSON.parse(localStorage.getItem('genestore_users') || '{}');
        currentUser = users[userEmail];
        updateAuthUI();
    }
}

function updateAuthUI() {
    const authBtn = document.getElementById('authBtn');
    const authIcon = document.getElementById('authIcon');
    
    if (currentUser) {
        authIcon.textContent = currentUser.name.charAt(0).toUpperCase();
        authBtn.title = 'Sign out';
    } else {
        authIcon.textContent = '👤';
        authBtn.title = 'Sign in';
    }
}

function showMessage(element, text, type) {
    element.textContent = text;
    element.className = 'auth-message ' + type;
}

// File encoding
function handleEncodeFile(file) {
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
    }
    
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatBytes(file.size);
    document.getElementById('encodingModal').classList.add('active');
    
    const reader = new FileReader();
    reader.onload = (e) => {
        encodeFileData(file.name, e.target.result, file.type);
    };
    reader.readAsArrayBuffer(file);
}

async function encodeFileData(filename, arrayBuffer, fileType) {
    const uint8Array = new Uint8Array(arrayBuffer);
    const totalBytes = uint8Array.length;
    const totalBases = totalBytes * 4; // 4 bases per byte
    
    // Reset UI
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressPercent').textContent = '0%';
    document.getElementById('dnaPreview').innerHTML = '';
    setActiveStage(1);
    
    let dnaSequence = '';
    let currentProgress = 0;
    
    // Encode in chunks for better performance
    const chunkSize = 1024;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, Math.min(i + chunkSize, uint8Array.length));
        
        for (let j = 0; j < chunk.length; j++) {
            const byte = chunk[j];
            // Convert each byte to 4 DNA bases
            for (let bit = 6; bit >= 0; bit -= 2) {
                const twoBits = ((byte >> bit) & 0b11).toString(2).padStart(2, '0');
                const base = DNA_MAPPING[twoBits];
                dnaSequence += base;
                
                // Update preview occasionally
                if (dnaSequence.length % 100 === 0) {
                    addDNAToPreview(base);
                }
            }
        }
        
        // Update progress
        currentProgress = Math.min(100, ((i + chunkSize) / uint8Array.length) * 100);
        updateEncodingProgress(currentProgress, dnaSequence.length, totalBases);
        
        // Allow UI to update
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    // Create metadata
    const metadata = {
        filename: filename,
        fileType: fileType,
        originalSize: totalBytes,
        dnaLength: dnaSequence.length,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };
    
    // Combine metadata and DNA
    const encodedData = JSON.stringify(metadata) + '\n---DNA-SEQUENCE---\n' + dnaSequence;
    
    currentEncodedFile = {
        filename: filename.replace(/\.[^/.]+$/, '') + '.dna',
        data: encodedData,
        metadata: metadata
    };
    
    // Finish encoding
    updateEncodingProgress(100, totalBases, totalBases);
    setActiveStage(3);
    
    setTimeout(() => {
        document.getElementById('downloadBtn').style.display = 'inline-flex';
        
        // Save to vault if logged in
        if (currentUser) {
            saveFileToVault({
                type: 'encoded',
                filename: filename,
                originalSize: totalBytes,
                dnaLength: dnaSequence.length,
                timestamp: metadata.timestamp
            });
        }
    }, 500);
}

function updateEncodingProgress(progress, current, total) {
    progress = Math.min(100, Math.max(0, progress));
    
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressPercent').textContent = Math.floor(progress) + '%';
    document.getElementById('bpGenerated').textContent = current.toLocaleString() + ' / ' + total.toLocaleString();
    document.getElementById('compressionRatio').textContent = '1:4';
    
    const remaining = Math.ceil((100 - progress) / 100 * 5);
    document.getElementById('estimatedTime').textContent = remaining + ' seconds';
    
    if (progress < 33) {
        setActiveStage(1);
        document.getElementById('statusText').textContent = 'Reading file data...';
    } else if (progress < 66) {
        setActiveStage(2);
        document.getElementById('statusText').textContent = 'Converting binary to nucleotide sequences...';
    } else {
        setActiveStage(3);
        document.getElementById('statusText').textContent = 'Finalizing DNA storage...';
    }
}

function setActiveStage(stageNum) {
    for (let i = 1; i <= 3; i++) {
        const stage = document.getElementById('stage' + i);
        if (stage) {
            stage.classList.remove('active', 'completed');
            if (i < stageNum) {
                stage.classList.add('completed');
            } else if (i === stageNum) {
                stage.classList.add('active');
            }
        }
    }
}

function addDNAToPreview(base) {
    const preview = document.getElementById('dnaPreview');
    if (preview.children.length >= 150) return;
    
    const span = document.createElement('span');
    span.className = 'base-' + base.toLowerCase();
    span.textContent = base;
    preview.appendChild(span);
    
    preview.scrollTop = preview.scrollHeight;
}

function downloadEncoded() {
    if (!currentEncodedFile) return;
    
    const blob = new Blob([currentEncodedFile.data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentEncodedFile.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function closeEncodingModal() {
    document.getElementById('encodingModal').classList.remove('active');
    document.getElementById('downloadBtn').style.display = 'none';
    document.getElementById('fileInput').value = '';
    currentEncodedFile = null;
}

// File decoding
function handleDecodeFile(file) {
    document.getElementById('decodeFileName').textContent = file.name;
    document.getElementById('decodingModal').classList.add('active');
    
    const reader = new FileReader();
    reader.onload = (e) => {
        decodeFileData(e.target.result);
    };
    reader.readAsText(file);
}

async function decodeFileData(content) {
    // Reset UI
    document.getElementById('decodeProgressFill').style.width = '0%';
    document.getElementById('decodeProgressPercent').textContent = '0%';
    setDecodeActiveStage(1);
    
    try {
        // Parse file
        const parts = content.split('\n---DNA-SEQUENCE---\n');
        if (parts.length !== 2) {
            throw new Error('Invalid DNA file format');
        }
        
        const metadata = JSON.parse(parts[0]);
        const dnaSequence = parts[1].trim();
        
        updateDecodingProgress(20);
        setDecodeActiveStage(2);
        
        // Display metadata
        document.getElementById('originalFileName').textContent = metadata.filename;
        document.getElementById('originalFileSize').textContent = formatBytes(metadata.originalSize);
        document.getElementById('dnaSequenceLength').textContent = metadata.dnaLength.toLocaleString() + ' bp';
        
        // Decode DNA to binary
        const bytes = [];
        const totalBases = dnaSequence.length;
        
        for (let i = 0; i < dnaSequence.length; i += 4) {
            let byte = 0;
            
            for (let j = 0; j < 4; j++) {
                if (i + j < dnaSequence.length) {
                    const base = dnaSequence[i + j];
                    const bits = REVERSE_DNA_MAPPING[base];
                    if (!bits) {
                        throw new Error('Invalid DNA base: ' + base);
                    }
                    byte = (byte << 2) | parseInt(bits, 2);
                }
            }
            
            bytes.push(byte);
            
            // Update progress
            if (i % 1000 === 0) {
                const progress = 20 + ((i / totalBases) * 70);
                updateDecodingProgress(progress);
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        const uint8Array = new Uint8Array(bytes);
        
        currentDecodedFile = {
            filename: metadata.filename,
            data: uint8Array,
            type: metadata.fileType,
            size: metadata.originalSize
        };
        
        updateDecodingProgress(100);
        setDecodeActiveStage(3);
        
        setTimeout(() => {
            document.getElementById('downloadDecodedBtn').style.display = 'inline-flex';
            
            // Save to vault if logged in
            if (currentUser) {
                saveFileToVault({
                    type: 'decoded',
                    filename: metadata.filename,
                    size: metadata.originalSize,
                    timestamp: new Date().toISOString()
                });
            }
        }, 500);
        
    } catch (error) {
        alert('Error decoding file: ' + error.message);
        closeDecodingModal();
    }
}

function updateDecodingProgress(progress) {
    progress = Math.min(100, Math.max(0, progress));
    
    document.getElementById('decodeProgressFill').style.width = progress + '%';
    document.getElementById('decodeProgressPercent').textContent = Math.floor(progress) + '%';
    
    if (progress < 33) {
        document.getElementById('decodeStatusText').textContent = 'Reading DNA sequence...';
    } else if (progress < 66) {
        document.getElementById('decodeStatusText').textContent = 'Converting to binary data...';
    } else {
        document.getElementById('decodeStatusText').textContent = 'Restoring original file...';
    }
}

function setDecodeActiveStage(stageNum) {
    for (let i = 1; i <= 3; i++) {
        const stage = document.getElementById('decodeStage' + i);
        if (stage) {
            stage.classList.remove('active', 'completed');
            if (i < stageNum) {
                stage.classList.add('completed');
            } else if (i === stageNum) {
                stage.classList.add('active');
            }
        }
    }
}

function downloadDecoded() {
    if (!currentDecodedFile) return;
    
    const blob = new Blob([currentDecodedFile.data], { type: currentDecodedFile.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentDecodedFile.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function closeDecodingModal() {
    document.getElementById('decodingModal').classList.remove('active');
    document.getElementById('downloadDecodedBtn').style.display = 'none';
    document.getElementById('decodeInput').value = '';
    currentDecodedFile = null;
}

// Vault functions
function saveFileToVault(fileInfo) {
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('genestore_users') || '{}');
    const user = users[currentUser.email];
    
    if (!user.files) {
        user.files = [];
    }
    
    const fileRecord = {
        id: Date.now(),
        type: fileInfo.type,
        filename: fileInfo.filename,
        size: fileInfo.size || fileInfo.originalSize,
        dnaLength: fileInfo.dnaLength,
        timestamp: fileInfo.timestamp
    };
    
    user.files.push(fileRecord);
    users[currentUser.email] = user;
    localStorage.setItem('genestore_users', JSON.stringify(users));
    
    currentUser = user;
}

function loadVault() {
    if (!currentUser) return;
    
    const vaultGrid = document.getElementById('vaultGrid');
    
    if (!currentUser.files || currentUser.files.length === 0) {
        vaultGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <h3>Your vault is empty</h3>
                <p>Start encoding files to see them here</p>
            </div>
        `;
        return;
    }
    
    vaultGrid.innerHTML = '';
    
    // Sort by timestamp (newest first)
    const files = [...currentUser.files].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    files.forEach(file => {
        const card = createVaultCard(file);
        vaultGrid.appendChild(card);
    });
}

function createVaultCard(file) {
    const card = document.createElement('div');
    card.className = 'file-card';
    
    const icon = getFileIcon(file.filename);
    const date = new Date(file.timestamp).toLocaleDateString();
    
    card.innerHTML = `
        <div class="file-icon">${icon}</div>
        <div class="file-name">${file.filename}</div>
        <svg class="dna-viz" viewBox="0 0 60 40">
            <path d="M 5,20 Q 15,10 25,20 T 45,20" stroke="#06B6D4" fill="none" stroke-width="2"/>
            <path d="M 5,20 Q 15,30 25,20 T 45,20" stroke="#8B5CF6" fill="none" stroke-width="2"/>
        </svg>
        <div class="bp-count">🧬 ${file.dnaLength ? file.dnaLength.toLocaleString() + ' bp' : formatBytes(file.size)}</div>
        <div class="integrity-bar">
            <div class="integrity-fill" style="width: 100%;"></div>
        </div>
        <div class="integrity-text">100% Integrity ✓</div>
        <div class="file-date">📅 ${date}</div>
        <div class="file-actions">
            <button class="btn btn-primary btn-sm" onclick="deleteVaultFile(${file.id})">Delete</button>
        </div>
    `;
    
    return card;
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return '🖼️';
    if (['pdf'].includes(ext)) return '📄';
    if (['doc', 'docx', 'txt'].includes(ext)) return '📝';
    if (['mp3', 'wav', 'ogg'].includes(ext)) return '🎵';
    if (['mp4', 'avi', 'mov'].includes(ext)) return '🎥';
    if (['zip', 'rar'].includes(ext)) return '📦';
    if (['dna'].includes(ext)) return '🧬';
    
    return '📄';
}

function deleteVaultFile(fileId) {
    if (!currentUser || !confirm('Delete this file from your vault?')) return;
    
    const users = JSON.parse(localStorage.getItem('genestore_users') || '{}');
    const user = users[currentUser.email];
    
    user.files = user.files.filter(f => f.id !== fileId);
    users[currentUser.email] = user;
    localStorage.setItem('genestore_users', JSON.stringify(users));
    
    currentUser = user;
    loadVault();
}

function filterVault(type) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter logic would go here
    loadVault();
}

function sortVault() {
    loadVault();
}

function refreshVault() {
    loadVault();
}

// Utility functions
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
