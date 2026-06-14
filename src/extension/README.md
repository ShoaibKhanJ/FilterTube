# FilterTube v1.0 – YouTube Content Filter Chrome Extension

> Take control of your YouTube experience. Filter keywords, block content, hide Shorts, enable Focus Mode, and whitelist your favorite channels.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **Keyword Filter** | Show only videos matching your interests |
| 🚫 **Blocked Keywords** | Automatically hide unwanted content |
| ⚡ **Hide Shorts** | Remove Shorts from all YouTube pages |
| ⭐ **Channel Whitelist** | Always show your favorite channels |
| 🎯 **Focus Mode** | Hide distractions and sidebar recommendations |
| 🔄 **Real-time Filtering** | Instant updates as you scroll |
| 💾 **Persistent Settings** | Survives browser restarts, syncs across devices |

---

## 🚀 Installation (Developer Mode)

Since FilterTube is not yet on the Chrome Web Store, install it manually:

### Step 1: Download the Extension

Clone or download this repository:

```bash
git clone https://github.com/yourusername/filtertube.git
cd filtertube
```

### Step 2: Open Chrome Extensions

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **Developer Mode** (toggle in the top-right corner)

### Step 3: Load the Extension

1. Click **"Load unpacked"**
2. Select the `youtube-content-filter/` folder
3. FilterTube will appear in your extensions list

### Step 4: Pin the Extension

1. Click the puzzle piece 🧩 icon in Chrome toolbar
2. Find **FilterTube**
3. Click the pin 📌 icon to pin it

---

## 📁 Project Structure

```
youtube-content-filter/
├── manifest.json              # Chrome Extension Manifest V3
│
├── popup/
│   ├── popup.html             # Extension popup UI
│   ├── popup.css              # Premium dark theme styles
│   └── popup.js               # Popup logic & storage interactions
│
├── content/
│   ├── content.js             # YouTube DOM filtering logic
│   └── content.css            # Focus mode & animation styles
│
├── background/
│   └── background.js          # Service worker & message handling
│
├── storage/
│   └── settings.js            # Storage utility (import in modules)
│
├── utils/
│   ├── filter.js              # Core filter decision engine
│   └── youtubeHelpers.js      # YouTube DOM selectors & helpers
│
├── assets/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
└── README.md
```

---

## ⚙️ How It Works

### Content Script Flow

```
YouTube page loads
       ↓
content.js injects
       ↓
Settings loaded from Chrome Storage
       ↓
MutationObserver starts watching DOM
       ↓
New video elements detected
       ↓
For each video:
  1. Extract title & channel name
  2. Check channel whitelist → always show if matched
  3. Check blocked keywords → hide if matched
  4. Check filter keywords → hide if no match
  5. Show or hide with smooth animation
       ↓
YouTube SPA navigation detected → re-filter
```

### Filter Priority Rules

| Priority | Rule | Action |
|---|---|---|
| 1 (Highest) | Channel is whitelisted | ✅ Always show |
| 2 | Title/channel contains blocked keyword | ❌ Always hide |
| 3 | Filter keywords active + no match | ❌ Hide |
| 4 (Default) | No rules match | ✅ Show |

---

## 🛠️ Configuration

### Filter Keywords
Videos must match **at least one** filter keyword to appear.
- Leave empty to show all videos (only blocked keywords apply)
- Case-insensitive matching
- Examples: `python`, `machine learning`, `web development`

### Blocked Keywords
Videos matching **any** blocked keyword are always hidden.
- Examples: `prank`, `drama`, `reaction`, `celebrity`

### Channel Whitelist
Channels in this list **always appear**, regardless of keyword filters.
- Use partial name matching: `freeCodeCamp` matches "freeCodeCamp.org"
- Examples: `Fireship`, `Traversy Media`, `The Primeagen`

### Hide Shorts
Removes all Shorts from:
- Home feed
- Search results
- Sidebar navigation
- Recommendations

### Focus Mode
Hides on video watch pages:
- Right sidebar ("Up Next" recommendations)
- Trending sections
- Distracting homepage shelves

---

## 🔒 Privacy

FilterTube:
- ✅ Runs **100% locally** in your browser
- ✅ **Never** collects your data
- ✅ **Never** sends anything to external servers
- ✅ Only requires `storage` and `activeTab` permissions
- ✅ Only runs on `youtube.com`

---

## 🧑‍💻 Development

### Prerequisites
- Google Chrome or Chromium
- Basic knowledge of JavaScript, Chrome Extension APIs

### Making Changes

1. Edit source files in the respective folders
2. Go to `chrome://extensions/`
3. Click the **refresh** icon on the FilterTube card
4. Reload the YouTube tab

### Adding New Features

The codebase is modular:
- **New filter types** → add logic to `utils/filter.js`
- **New YouTube selectors** → update `utils/youtubeHelpers.js`
- **New storage fields** → update `DEFAULT_SETTINGS` in `storage/settings.js`
- **New popup UI** → edit `popup/popup.html` + `popup.js`

---

## 🗺️ Roadmap (V2)

- [ ] Import/Export settings as JSON
- [ ] Per-domain filter profiles
- [ ] Filter statistics & analytics dashboard
- [ ] Regex support for advanced filtering
- [ ] Dark/Light theme toggle
- [ ] Minimum view count filter
- [ ] Channel-specific keyword rules
- [ ] Keyboard shortcuts

---

## 📝 License

MIT License – free to use, modify, and distribute.

---

## 🙏 Contributing

Pull requests welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Follow the existing code style
4. Add comments for complex logic
5. Test on YouTube before submitting

---

*Built with ❤️ using Vanilla JS + Chrome Extension Manifest V3*
