const { useState, useEffect } = React;

// Image Modal Component with Zoom
const ImageModal = ({ src, alt, isOpen, onClose }) => {
  const [scale, setScale] = React.useState(1.5);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const imageRef = React.useRef(null);

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    const handleWheel = (e) => {
      if (!isOpen) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => Math.max(1, Math.min(4, prev + delta)));
      AudioManager.play('hover', 0.3);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('wheel', handleWheel, { passive: false });
      document.body.style.overflow = 'hidden';
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('wheel', handleWheel);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1 && scale > 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging && scale > 1) {
      e.preventDefault();
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const zoomIn = () => {
    setScale(prev => Math.min(3, prev + 0.2));
    AudioManager.play('zoom', 0.2);
  };

  const zoomOut = () => {
    setScale(prev => Math.max(1, prev - 0.3));
    AudioManager.play('zoom', 0.2);
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    AudioManager.play('pop');
  };

  if (!isOpen) return null;

  return React.createElement('div', {
    className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in",
    onClick: onClose,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  },
    React.createElement('div', {
      className: "relative flex items-center justify-center w-screen h-screen p-8",
      onClick: (e) => e.stopPropagation()
    },
      React.createElement('div', {
        style: {
          maxWidth: '100%',
          maxHeight: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      },
        React.createElement('img', {
          ref: imageRef,
          src: src,
          alt: alt,
          className: `max-w-[90vw] max-h-[90vh] object-contain rounded-2xl cyber-border animate-glow transition-transform duration-200 ${scale > 1 ? 'cursor-move' : 'cursor-zoom-in'}`,
          style: {
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
            objectFit: 'contain',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            imageRendering: 'high-quality',
            contain: 'layout',
            willChange: 'transform'
          },
          onMouseDown: handleMouseDown,
          onTouchStart: handleTouchStart,
          onDoubleClick: () => scale === 1.5 ? zoomIn() : resetZoom()
        })
      ),
      
      React.createElement('div', {
        key: 'zoom-controls',
        className: "absolute top-4 left-4 flex flex-col space-y-2"
      },
        [
          React.createElement('button', {
            key: 'zoom-in',
            onClick: zoomIn,
            className: "w-12 h-12 bg-neon-green/20 hover:bg-neon-green/40 rounded-full flex items-center justify-center transition-all duration-300 cyber-border animate-glow group glass-effect"
          },
            React.createElement('span', { 
              key: 'plus-icon',
              className: "text-neon-green group-hover:text-white text-xl font-bold" 
            }, "+")
          ),
          React.createElement('button', {
            key: 'zoom-out',
            onClick: zoomOut,
            className: "w-12 h-12 bg-neon-blue/20 hover:bg-neon-blue/40 rounded-full flex items-center justify-center transition-all duration-300 cyber-border animate-glow group glass-effect"
          },
            React.createElement('span', { 
              key: 'minus-icon',
              className: "text-neon-blue group-hover:text-white text-xl font-bold" 
            }, "−")
          ),
          React.createElement('button', {
            key: 'reset-zoom',
            onClick: resetZoom,
            className: "w-12 h-12 bg-neon-cyan/20 hover:bg-neon-cyan/40 rounded-full flex items-center justify-center transition-all duration-300 cyber-border animate-glow group glass-effect"
          },
            React.createElement('span', { 
              key: 'home-icon',
              className: "text-neon-cyan group-hover:text-white text-sm font-bold" 
            }, "⌂")
          )
        ]
      ),

      React.createElement('button', {
        onClick: () => {
          AudioManager.play('close');
          onClose();
        },
        onMouseEnter: () => AudioManager.play('hover', 0.3),
        className: "absolute top-4 right-4 w-12 h-12 bg-neon-red/20 hover:bg-neon-red/40 rounded-full flex items-center justify-center transition-all duration-300 cyber-border animate-glow group"
      },
        React.createElement(CloseIcon, { className: "w-6 h-6 text-neon-red group-hover:text-white transition-colors duration-300" })
      ),
      
      React.createElement('div', {
        className: "absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 glass-effect rounded-xl border border-neon-blue/30 cyber-border cyber-border animate-glow"
      })
    )
  );
};

// Icons as SVG components
const FolderIcon = ({ className = "w-6 h-6" }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return React.createElement('div', { 
    className: 'relative',
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false)
  },
    React.createElement('svg', { 
      className: `${className} transition-all duration-300 ${isHovered ? 'text-neon-cyan scale-110' : 'text-neon-green'}`,
      fill: "currentColor",
      viewBox: "0 0 20 20"
    },
      React.createElement('path', {
        d: "M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
      })
    )
  );
};

const LaptopIcon = ({ className = "w-6 h-6" }) => (
  React.createElement('svg', { className, fill: "currentColor", viewBox: "0 0 20 20" },
    React.createElement('path', { fillRule: "evenodd", d: "M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z", clipRule: "evenodd" })
  )
);

const AdIcon = ({ className = "w-6 h-6" }) => (
  React.createElement('svg', { className, fill: "currentColor", viewBox: "0 0 20 20" },
    React.createElement('path', { fillRule: "evenodd", d: "M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z", clipRule: "evenodd" })
  )
);

const HomeIcon = ({ className = "w-6 h-6" }) => (
  React.createElement('svg', { className, fill: "currentColor", viewBox: "0 0 20 20" },
    React.createElement('path', { d: "M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" })
  )
);

const SearchIcon = ({ className = "w-6 h-6" }) => (
  React.createElement('svg', { className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })
  )
);

const MenuIcon = ({ className = "w-6 h-6" }) => (
  React.createElement('svg', { className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" })
  )
);

const CloseIcon = ({ className = "w-6 h-6" }) => (
  React.createElement('svg', { className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" })
  )
);

const ArrowLeftIcon = ({ className = "w-6 h-6" }) => (
  React.createElement('svg', { className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" })
  )
);

// Audio Manager
const AudioManager = {
  sounds: {
    click: new Audio('./audio/mouse-click-153941.mp3'),
    hover: new Audio('./audio/swoosh-sound-effect-for-fight-scenes-or-transitions-1-149889.mp3'),
    pop: new Audio('./audio/pop-sound-effect-226108.mp3'),
    ding: new Audio('./audio/ding-small-bell-sfx-233008.mp3'),
    whoosh: new Audio('./audio/woosh-effect-10-255584.mp3'),
    flash: new Audio('./audio/camera-flash-204151.mp3'),
    zoom: new Audio('./audio/zoom-sound-effect-125029.mp3'),
    game: new Audio('./audio/sound-effect-for-games-131029.mp3'),
    swoosh2: new Audio('./audio/swoosh-sound-effect-for-fight-scenes-or-transitions-2-149890.mp3'),
    swoosh4: new Audio('./audio/swoosh-sound-effect-for-fight-scenes-or-transitions-4-149887.mp3'),
    woosh11: new Audio('./audio/woosh-effect-11-255592.mp3'),
    sword: new Audio('./audio/sword-slashing-game-sound-effect-2-379229.mp3'),
    ice: new Audio('./audio/putting-ice-cubes-in-a-glass-2-395490.mp3'),
    pop2: new Audio('./audio/pop-sound-effect-226109.mp3'),
    close: new Audio('./audio/swoosh-sound-effect-for-fight-scenes-or-transitions-4-149887.mp3'),
    back: new Audio('./audio/woosh-effect-11-255592.mp3')
  },
  
  play(soundName, volume = 0.4) {
    try {
      if (this.sounds[soundName]) {
        this.sounds[soundName].volume = volume;
        this.sounds[soundName].currentTime = 0;
        this.sounds[soundName].play().catch(() => {});
      }
    } catch (error) {
      // Sessiz xato
    }
  },
  
  preload() {
    Object.values(this.sounds).forEach(audio => {
      audio.preload = 'auto';
      audio.volume = 0.3;
      // Audio fayllarni darhol yuklash uchun
      audio.load();
    });
  },

  // Audio kontekstini yoqish uchun
  initAudio() {
    // Foydalanuvchi birinchi marta sahifaga kirganida audio kontekstini yoqish
    const enableAudio = () => {
      Object.values(this.sounds).forEach(audio => {
        audio.muted = false;
        audio.play().then(() => {
          audio.pause();
          audio.currentTime = 0;
        }).catch(() => {});
      });
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };
    
    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('touchstart', enableAudio, { once: true });
    document.addEventListener('keydown', enableAudio, { once: true });
  }
};

// Main Desktop Component
const Desktop = () => {
  React.useEffect(() => {
    AudioManager.preload();
    AudioManager.initAudio();
  }, []);
  
  const [currentPath, setCurrentPath] = React.useState([]);
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedLocation, setSelectedLocation] = React.useState('default');
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  // Debug log for navigation
  React.useEffect(() => {
    console.log('Current Path:', currentPath);
  }, [currentPath]);
  
  const getCurrentItems = () => {
    try {
      if (currentPath.length === 0) {
        return sampleData.folders;
      }
      
      let currentLevel = sampleData.folders;
      let currentItems = [];
      
      // Find the current level based on the currentPath
      for (let i = 0; i < currentPath.length; i++) {
        const pathId = currentPath[i];
        const found = currentLevel.find(item => item.id === pathId);
        
        if (!found) {
          console.error('Path not found:', currentPath);
          return [];
        }
        
        if (i === currentPath.length - 1) {
          // If this is the last path segment, return its items
          return found.items || [];
        } else {
          // Otherwise, continue traversing
          currentLevel = found.items || [];
        }
      }
      
      return currentItems;
    } catch (error) {
      console.error('Error getting current items:', error);
      return [];
    }
  };

  const navigate = (folderId) => {
    AudioManager.play('click');
    setCurrentPath(prevPath => [...prevPath, folderId]);
    setSelectedItem(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateHome = () => {
    AudioManager.play('click');
    setCurrentPath([]);
    setSelectedItem(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateBack = () => {
    if (currentPath.length === 0) {
      console.log('Already at root level');
      return;
    }
    
    AudioManager.play('back');
    setCurrentPath(prev => {
      const newPath = [...prev];
      newPath.pop();
      console.log('Navigating back from:', prev, 'to:', newPath);
      return newPath;
    });
    setSelectedItem(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemClick = (item) => {
    AudioManager.play('click');
    if (item.type === 'folder') {
      console.log('Navigating to folder:', item);
      setCurrentPath(prev => {
        const newPath = [...prev, item.id];
        console.log('New path after navigation:', newPath);
        return newPath;
      });
      setSelectedItem(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      console.log('Selected item:', item);
      setSelectedItem(item);
    }
  };

  const filterItems = (items) => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = selectedLocation === 'default' || item.location === selectedLocation;
      return matchesSearch && matchesLocation;
    });
  };

  const filteredItems = filterItems(getCurrentItems());

  return React.createElement('div', { className: "min-h-screen flex flex-col bg-gradient-to-br from-transparent via-black/20 to-transparent animate-gradient-xy overflow-x-hidden" },
    // Toolbar
    React.createElement('div', { className: "glass-effect border-b border-neon-blue/20 cyber-border px-4 py-3 flex items-center justify-between animate-slide-in-left" },
      React.createElement('div', { className: "flex items-center space-x-4" },
        React.createElement('button', {
          onClick: () => {
            AudioManager.play('click', 0.7);
            setIsMenuOpen(!isMenuOpen);
          },
          onMouseEnter: () => AudioManager.play('hover', 0.5),
          className: "lg:hidden p-3 rounded-xl hover:bg-neon-blue/10 transition-all duration-300 cyber-border animate-glow glass-effect"
        }, isMenuOpen ? React.createElement(CloseIcon, { className: "w-5 h-5 text-neon-blue" }) : React.createElement(MenuIcon, { className: "w-5 h-5 text-neon-blue" })),
        
        React.createElement('div', { className: "flex items-center space-x-3" },
          React.createElement('button', {
            onClick: navigateHome,
            onMouseEnter: () => AudioManager.play('hover', 0.5),
            className: "p-3 rounded-xl hover:bg-neon-green/10 transition-all duration-300 animate-float glass-effect cyber-border animate-glow",
            title: "🏠 Bosh sahifa"
          }, React.createElement(HomeIcon, { className: "w-6 h-6 text-neon-green neon-text" })),
          
          currentPath.length > 0 && React.createElement('button', {
            onClick: navigateBack,
            onMouseEnter: () => AudioManager.play('hover', 0.5),
            className: "p-3 rounded-xl hover:bg-neon-purple/10 transition-all duration-300 animate-bounce-in glass-effect cyber-border animate-glow",
            title: "⬅️ Orqaga"
          }, React.createElement(ArrowLeftIcon, { className: "w-6 h-6 text-neon-cyan neon-text" }))
        ),
        
        React.createElement('div', { className: "hidden sm:flex items-center text-sm text-white/80 animate-fade-in-up" },
          React.createElement('span', {
            onClick: navigateHome,
            onMouseEnter: () => AudioManager.play('hover', 0.1),
            className: "cursor-pointer hover:text-neon-blue transition-all duration-300 neon-text font-bold text-xl"
          }, "Noutbuk olami"),
          currentPath.map((pathId, index) => {
            const folder = sampleData.folders.find(f => f.id === pathId);
            return React.createElement('span', { key: pathId, className: "flex items-center animate-slide-in-right" },
              React.createElement('span', { className: "mx-3 text-neon-pink" }, "▶"),
              React.createElement('span', { className: "hover:text-neon-green transition-all duration-300 neon-text font-medium" }, folder?.name || 'Unknown')
            );
          })
        )
      ),

      React.createElement('div', { className: "flex items-center space-x-4" },
        React.createElement('div', { className: "relative animate-scale-in" },
          React.createElement(SearchIcon, { className: "absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-blue animate-pulse-slow" }),
          searchQuery && React.createElement('button', {
            type: "button",
            onClick: (e) => {
              e.stopPropagation();
              e.preventDefault();
              AudioManager.play('pop', 0.5);
              setSearchQuery("");
            },
            onMouseEnter: () => AudioManager.play('hover', 0.3),
            className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-white hover:bg-red-500 rounded-full w-6 h-6 flex items-center justify-center hover:scale-110 transition-all duration-200 focus:outline-none z-10 glass-effect cyber-border animate-glow"
          }, "✕"),
          React.createElement('input', {
            type: "text",
            placeholder: "🔍 Noutbuk qidirish...",
            value: searchQuery,
            onFocus: () => AudioManager.play('pop', 0.3),
            onMouseDown: () => {
              AudioManager.play('click', 0.3);
            },
            onChange: (e) => setSearchQuery(e.target.value),
            className: `pl-12 pr-10 py-3 glass-effect border border-neon-blue/30 cyber-border rounded-2xl focus:border-neon-green/50 focus:ring-2 focus:ring-neon-green/20 w-64 sm:w-80 text-white placeholder-white/50 transition-all duration-300 animate-glow cyber-border`
          })
        )
      )
    ),

    // Main Content Area
    React.createElement('div', { className: "flex-1 flex overflow-hidden" },
      // Sidebar
      React.createElement('div', { className: `${isMenuOpen ? 'block animate-slide-in-left' : 'hidden'} lg:block w-full lg:w-72 max-w-xs lg:max-w-none glass-effect border-r border-neon-blue/20 cyber-border overflow-y-auto flex-shrink-0` },
        React.createElement('div', { className: "p-6" },
          React.createElement('h2', { className: "text-xl font-bold text-white mb-6 neon-text animate-fade-in-up" }, "⚡ Kategoriyalar"),
          React.createElement('nav', { className: "space-y-3" },
            sampleData.folders.map((folder, index) =>
              React.createElement('button', {
                key: folder.id,
                onClick: (e) => {
                  e.preventDefault();
                  AudioManager.play('click', 0.7);
                  setCurrentPath([folder.id]); // Reset path to this category
                  setSelectedItem(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                },
                onMouseEnter: () => AudioManager.play('hover', 0.5),
                className: `w-full text-left p-0.5 transition-all duration-300 hover:scale-105 animate-fade-in-up ${
                  currentPath[0] === folder.id ? 'opacity-100' : 'opacity-90 hover:opacity-100'
                }`,
                style: {
                  background: 'linear-gradient(90deg, #00f5ff,rgb(0, 4, 255), #39ff14, #ff10f0, #00f5ff)',
                  backgroundSize: '200% auto',
                  animation: 'borderGradient 3s linear infinite',
                  animationDelay: `${index * 0.1}s`,
                  borderRadius: '0.5rem',
                  padding: '1px',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
                }
              }, 
                React.createElement('div', { 
                  className: `w-full h-full p-4 rounded-lg flex items-center ${
                  folder.name.includes('Gaming') ? 'bg-gradient-to-br from-green-900/95 to-emerald-900/95 border-green-400/60' :
                  folder.name.includes('Biznes') ? 'bg-gradient-to-br from-green-900/95 to-emerald-900/95 border-green-400/60' :
                  folder.name.includes('Talaba') ? 'bg-gradient-to-br from-green-900/95 to-emerald-900/95 border-green-400/60' :
                  'bg-gradient-to-br from-green-900/95 to-emerald-900/95 border-green-400/60'
                } border-2`
                },
                  React.createElement('div', { className: 'transform transition-transform duration-300 hover:scale-110' },
                    React.createElement(folder.icon, { className: "w-6 h-6 inline-block mr-2 text-white/90" })
                  ),
                  React.createElement('p', { className: "text-white/90 text-base font-medium" }, folder.name)
                )
              )
            )
          ),
          React.createElement('div', { className: "mt-8 p-4 glass-effect rounded-2xl border border-neon-purple/30 cyber-border animate-glow cyber-border" },
            React.createElement('div', { className: "text-center" },
              React.createElement('div', { className: "text-3xl mb-2 animate-float" }, "📞"),
              React.createElement('h3', { className: "text-neon-cyan font-bold mb-2 neon-text" }, "Bog'lanish"),
              React.createElement('div', { className: "space-y-3" },
                React.createElement('div', { className: "space-y-2 text-xs" },
                  React.createElement('a', { 
                    href: "tel:+998931480006",
                    onClick: () => AudioManager.play('ding'),
                    onMouseEnter: () => AudioManager.play('hover', 0.5),
                    className: "block text-neon-green hover:text-white transition-colors duration-300 glass-effect p-2 rounded-lg cyber-border animate-glow"
                  }, React.createElement('i', { className: "fas fa-phone text-lg mr-2" }), "+998 93 148 00 06"),
                  React.createElement('a', { 
                    href: "https://t.me/Laptop_centri",
                    target: "_blank",
                    onClick: () => AudioManager.play('click', 0.7),
                    onMouseEnter: () => AudioManager.play('hover', 0.5),
                    className: "block text-blue-400 hover:text-white transition-colors duration-300 glass-effect p-2 rounded-lg cyber-border animate-glow"
                  }, React.createElement('i', { className: "fab fa-telegram text-lg mr-2" }), "Telegram manzil"),
                  React.createElement('a', { 
                    href: "https://maps.app.goo.gl/DejpApSEpvmb8YQRA?g_st=com.google.maps.preview.copy",
                    target: "_blank",
                    onClick: () => AudioManager.play('whoosh'),
                    onMouseEnter: () => AudioManager.play('hover', 0.1),
                    className: "block text-neon-cyan hover:text-white transition-colors duration-300 cursor-pointer glass-effect p-2 rounded-lg cyber-border animate-glow"
                  }, React.createElement('i', { className: "fas fa-map-marker-alt text-lg mr-2" }), "Andijon, Mashrab 245")
                ),
                React.createElement('div', { className: "flex items-center justify-center space-x-4 pt-2" },
                  React.createElement('a', {
                    href: "https://www.youtube.com/@uz_laptop",
                    target: "_blank",
                    onClick: () => AudioManager.play('click', 0.7),
                    onMouseEnter: () => AudioManager.play('hover', 0.5),
                    className: "text-red-500 hover:text-red-400 transition-colors duration-300 glass-effect p-2 rounded-lg cyber-border animate-glow"
                  }, React.createElement('i', { className: "fab fa-youtube text-2xl" })),
                  React.createElement('a', {
                    href: "https://t.me/noutbuk_olami",
                    target: "_blank",
                    onClick: () => AudioManager.play('click', 0.7),
                    onMouseEnter: () => AudioManager.play('hover', 0.5),
                    className: "text-blue-400 hover:text-blue-300 transition-colors duration-300 glass-effect p-2 rounded-lg cyber-border animate-glow"
                  }, React.createElement('i', { className: "fab fa-telegram text-2xl" })),
                  React.createElement('a', {
                    href: "https://www.instagram.com/uz_laptop/",
                    target: "_blank",
                    onClick: () => AudioManager.play('click', 0.7),
                    onMouseEnter: () => AudioManager.play('hover', 0.5),
                    className: "text-pink-500 hover:text-pink-400 transition-colors duration-300 glass-effect p-2 rounded-lg cyber-border animate-glow"
                  }, React.createElement('i', { className: "fab fa-instagram text-2xl" }))
                )
              )
            )
          )
        )
      ),

      // Content Area
      React.createElement('div', { className: "flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 min-w-0" },
        selectedItem ? 
          React.createElement(ItemDetail, { item: selectedItem, onClose: () => setSelectedItem(null) }) :
          React.createElement(ItemGrid, { 
            items: filteredItems, 
            onItemClick: handleItemClick,
            searchQuery: searchQuery,
            onClearSearch: () => setSearchQuery("")
          })
      )
    ),

    // Taskbar
    React.createElement('div', { className: "glass-effect border-t border-neon-blue/20 cyber-border px-6 py-4 flex items-center justify-between animate-slide-in-right" },
      React.createElement('div', { className: "flex items-center space-x-6" },
        React.createElement('div', { className: "flex items-center space-x-3" },
          React.createElement('div', { 
            className: "w-10 h-10 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl flex items-center justify-center animate-glow cyber-border cursor-pointer",
            onClick: navigateHome,
            onMouseEnter: () => AudioManager.play('hover', 0.1)
          },
            React.createElement(HomeIcon, { className: "w-5 h-5 text-white animate-float" })
          ),
          React.createElement('span', { className: "hidden sm:block text-cyan-400 font-bold neon-text" }, "💻 Noutbuk olami")
        ),
        React.createElement('div', { className: "flex flex-wrap gap-2 sm:gap-4 items-center" },
          React.createElement('a', {
            href: 'https://t.me/OlimjonErnazarov',
            target: '_blank',
            rel: 'noopener noreferrer',
            className: "px-3 sm:px-4 py-1.5 sm:py-2 glass-effect rounded-xl border border-neon-cyan/30 cyber-border animate-pulse-slow whitespace-nowrap text-neon-cyan hover:text-white text-sm font-medium transition-colors duration-300 flex items-center",
            onMouseEnter: () => AudioManager.play('hover', 0.1),
            onClick: (e) => {
              e.preventDefault();
              AudioManager.play('click', 0.3);
              window.open('https://t.me/OlimjonErnazarov', '_blank');
            }
          }, "👨‍💻 Olimjon Ernazarov ↗"),
          React.createElement('div', { className: "px-3 sm:px-4 py-1.5 sm:py-2 glass-effect rounded-xl border border-neon-green/30 cyber-border animate-pulse-slow whitespace-nowrap" },
            React.createElement('span', { 
              className: "text-neon-green text-sm font-medium",
              onMouseEnter: () => AudioManager.play('hover', 0.1)
            }, `📊 ${Object.keys(laptopsData).length} Noutbuk`)
          )
        )
      ),
      
      React.createElement('div', { className: "flex items-center gap-2 sm:gap-3 flex-wrap" },
        React.createElement('a', {
          href: "https://www.youtube.com/@uz_laptop",
          target: "_blank",
          onClick: () => AudioManager.play('click', 0.7),
          onMouseEnter: () => AudioManager.play('hover', 0.5),
          className: "p-2 glass-effect rounded-lg border border-red-500/30 cyber-border text-red-400 hover:text-white transition-all duration-300 animate-glow cyber-border"
        }, React.createElement('i', { className: "fab fa-youtube text-lg" })),
        React.createElement('a', {
          href: "https://t.me/noutbuk_olami",
          target: "_blank",
          onClick: () => AudioManager.play('click', 0.7),
          onMouseEnter: () => AudioManager.play('hover', 0.5),
          className: "p-2 glass-effect rounded-lg border border-blue-500/30 cyber-border text-blue-400 hover:text-white transition-all duration-300 animate-glow cyber-border"
        }, React.createElement('i', { className: "fab fa-telegram text-lg" })),
        React.createElement('a', {
          href: "https://www.instagram.com/uz_laptop/",
          target: "_blank",
          onClick: () => AudioManager.play('click', 0.7),
          onMouseEnter: () => AudioManager.play('hover', 0.5),
          className: "p-2 glass-effect rounded-lg border border-pink-500/30 cyber-border text-pink-400 hover:text-white transition-all duration-300 animate-glow cyber-border"
        }, React.createElement('i', { className: "fab fa-instagram text-lg" }))
      )
    )
  );
};

// Location data
const locations = {
    default: 'Barcha manzillar',
    mashrab: 'Andijon, Mashrab ko\'chasi 245'
};

let currentLocation = 'default';

// Filter laptops by location
const filterByLocation = (laptops, location) => {
    if (location === 'default') return laptops;
    return laptops.filter(laptop => laptop.location === location);
};

// Remove duplicates and categorize laptops
const uniqueLaptops = new Map();
const gamingLaptops = [];
const businessLaptops = [];
const studentLaptops = [];

// First pass: Identify and categorize each unique laptop
Object.values(laptopsData).forEach(laptop => {
  if (!laptop.name) return;
  
  // Add location data (for demonstration, we'll randomly assign some to Mashrab)
  laptop.location = Math.random() > 0.7 ? 'mashrab' : 'default';
  
  // Use a unique key to identify duplicates (name + processor + ram)
  const uniqueKey = `${laptop.name}-${laptop.processor || ''}-${laptop.ram || ''}`.toLowerCase();
  
  if (!uniqueLaptops.has(uniqueKey)) {
    uniqueLaptops.set(uniqueKey, laptop);
    
    // Categorize based on GPU and price
    const graphics = (laptop.graphics || '').toLowerCase();
    const price = parseFloat((laptop.price || '0$').replace(/[^0-9.]/g, '')) || 0;
    
    // Check for dedicated GPU
    if (/(rtx|gtx|mx\d*|radeon\s*(rx|pro|vega)|geforce)/i.test(graphics)) {
      gamingLaptops.push(laptop);
    } 
    // Check for integrated graphics
    else if (/(intel\s*(uhd|iris|hd\s*graphics)|amd\s*radeon\s*(vega|graphics)|radeon\s*graphics)/i.test(graphics)) {
      if (price > 0 && price <= 300) {
        studentLaptops.push(laptop);
      } else {
        businessLaptops.push(laptop);
      }
    } 
    // For laptops without GPU info, use price to decide
    else {
      if (price > 0 && price <= 300) {
        studentLaptops.push(laptop);
      } else {
        businessLaptops.push(laptop);
      }
    }
  }
});

// Kategoriyalar bo'yicha guruhlash
const sampleData = {
  folders: [
    {
      id: 1,
      name: "🎮 Gaming Noutbuk",
      type: "folder",
      icon: FolderIcon,
      items: gamingLaptops
    },
    {
      id: 2,
      name: "💼 Biznes Noutbuk",
      type: "folder",
      icon: FolderIcon,
      items: businessLaptops
    },
    {
      id: 3,
      name: "🎓 Talaba Noutbuk",
      type: "folder",
      icon: FolderIcon,
      items: studentLaptops
    },
    {
      id: 4,
      name: "🏠 Uy kompyuter",
      type: "folder",
      icon: FolderIcon,
      items: desktopItems
    },
    {
      id: 5,
      name: "🔥 Yangi Elon",
      type: "folder",
      icon: FolderIcon,
      items: (() => {
        // Get current date and calculate date from one month ago
        const now = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        
        return Object.values(laptopsData).filter(laptop => {
          // Include laptops added in the last month
          const laptopDate = new Date(laptop.addedDate || 0);
          return laptopDate >= oneMonthAgo;
        });
      })()
    }
  ]
};

// Ad Popup Component
const AdPopup = ({ isOpen, onClose, onContinue }) => {
  const [mediaFiles, setMediaFiles] = React.useState([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);
  const videoRef = React.useRef(null);
  
  // Function to shuffle array (Fisher-Yates algorithm)
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  React.useEffect(() => {
    if (isOpen) {
      // Get active ads from reklama.js
      let activeAds = window.reklamalar?.filter(ad => ad.aktiv) || [];
      
      // Shuffle the ads array
      activeAds = shuffleArray(activeAds);
      
      // Map ads to media format
      const allMedia = activeAds.map(ad => ({
        type: ad.turi,
        src: ad.manzil.startsWith('/') ? ad.manzil.substring(1) : ad.manzil,
        sarlavha: ad.sarlavha,
        tavsif: ad.tavsif,
        duration: ad.turi === 'video' ? 15000 : 5000 // 15s for video, 5s for images
      }));
      
      if (allMedia.length > 0) {
        setMediaFiles(allMedia);
        setCurrentIndex(0);
        AudioManager.play('pop'); // Play sound when ads start
      } else {
        // If no ads, close the popup
        onClose();
      }
    } else {
      // Reset when closing
      setMediaFiles([]);
      setCurrentIndex(0);
    }
  }, [isOpen, onClose]);
  
  const goToNextMedia = () => {
    if (mediaFiles.length <= 1) return;
    const newIndex = (currentIndex + 1) % mediaFiles.length;
    setCurrentIndex(newIndex);
    AudioManager.play('pop', 0.3); // Play soft sound on ad change
  };
  
  // Auto-advance ads
  React.useEffect(() => {
    if (!isOpen || mediaFiles.length <= 1) return undefined;
    
    const currentAd = mediaFiles[currentIndex];
    const timer = setTimeout(() => {
      goToNextMedia();
    }, currentAd.duration || 5000);
    
    return () => clearTimeout(timer);
  }, [currentIndex, isOpen, mediaFiles]);
  
  if (!isOpen || mediaFiles.length === 0) return null;
  
  const currentMedia = mediaFiles[currentIndex];
  if (!currentMedia) return null;
  
  return React.createElement('div', { 
    className: "fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-4 animate-fade-in" 
  },
    React.createElement('div', { 
      className: "relative w-full h-full max-w-6xl max-h-[90vh] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-neon-blue/40 cyber-border flex flex-col",
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false)
    },
      currentMedia.sarlavha && React.createElement('div', { 
        className: "bg-gradient-to-r from-neon-blue/80 to-neon-purple/80 p-3 text-center"
      },
        React.createElement('h2', { 
          className: "text-xl font-bold text-white" 
        }, currentMedia.sarlavha)
      ),
      
      currentMedia.tavsif && React.createElement('div', { 
        className: "bg-neon-blue/10 p-2 text-center"
      },
        React.createElement('p', { 
          className: "text-sm text-neon-cyan" 
        }, currentMedia.tavsif)
      ),
      
      React.createElement('div', { className: "flex-1 relative overflow-hidden" },
        React.createElement('div', { 
          key: currentIndex,
          className: `absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isHovered ? 'opacity-90' : 'opacity-100'}`
        },
          currentMedia.type === 'video' ? (
            React.createElement('video', {
              src: currentMedia.src,
              className: "w-full h-full object-contain p-2",
              autoPlay: true,
              loop: false,
              muted: true,
              playsInline: true,
              style: { maxHeight: 'calc(100% - 100px)' },
              onEnded: (e) => {
                // Auto-advance when video ends
                goToNextMedia();
              },
              onError: (e) => {
                console.error('Error loading video:', currentMedia.src);
                // Skip to next ad on error
                goToNextMedia();
              }
            })
          ) : (
            React.createElement('img', {
              src: currentMedia.src,
              className: "w-full h-full object-contain p-2",
              alt: currentMedia.sarlavha || "Reklama",
              style: { maxHeight: 'calc(100% - 100px)' },
              onError: (e) => {
                console.error('Error loading image:', currentMedia.src);
                // Skip to next ad on error
                goToNextMedia();
              }
            })
          )
        )
      ),
      
      React.createElement('div', { className: "p-2 sm:p-3 bg-gray-900/90 border-t border-neon-blue/20" },
        React.createElement('button', {
          onClick: (e) => {
            e.preventDefault();
            AudioManager.play('click', 0.6);
            onContinue();
          },
          onMouseEnter: () => AudioManager.play('hover', 0.4),
          className: "group relative w-full py-2 px-4 font-bold text-white rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center space-x-2 text-xs sm:text-sm z-10"
        },
          // Animated border
          React.createElement('span', {
            className: "absolute inset-0 rounded-lg z-[-1] p-[1px]"
          },
            React.createElement('span', {
              className: "absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple rounded-lg opacity-90 group-hover:opacity-100 transition-all duration-500 animate-gradient-xy"
            })
          ),
          // Main content with glass effect
          React.createElement('span', {
            className: "relative w-full h-full bg-gray-900/80 backdrop-blur-sm rounded-md px-4 py-1.5 flex items-center justify-center space-x-2 group-hover:bg-gray-900/70 transition-all duration-300"
          },
            // Glowing text
            React.createElement('span', {
              className: "bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500 font-['Orbitron'] tracking-wider text-xs sm:text-sm font-bold"
            }, "DAVOM ETISH"),
            // Animated arrow
            React.createElement('span', {
              className: "inline-block transition-all duration-300 transform group-hover:translate-x-0.5 group-hover:scale-110 group-hover:text-yellow-300 text-yellow-500"
            }, "→")
          )
        )
      )
    )
  );
};

// Item Grid Component
const ItemGrid = ({ items, onItemClick, searchQuery, onClearSearch }) => {
  const [showAd, setShowAd] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  
  const handleCategoryClick = (item) => {
    if (item.type === 'folder') {
      setSelectedCategory(item);
      setShowAd(true);
      AudioManager.play('pop');
    } else {
      onItemClick(item);
    }
  };
  
  const handleContinue = () => {
    setShowAd(false);
    onItemClick(selectedCategory);
  };
  
  return React.createElement(React.Fragment, {},
    React.createElement(AdPopup, {
      key: 'ad-popup',
      isOpen: showAd,
      onClose: () => setShowAd(false),
      onContinue: handleContinue
    }),
    
    React.createElement('div', { className: 'p-8 animate-fade-in-up' },
      items.length > 0 
        ? React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6' },
            items.map((item, index) =>
              React.createElement(ItemCard, { 
                key: item.id || index, 
                item: item, 
                onClick: () => handleCategoryClick(item),
                index: index
              })
            )
          )
        : React.createElement('div', { className: 'flex flex-col items-center justify-center h-64 text-white/70 animate-bounce-in' },
            React.createElement('div', { className: 'text-6xl mb-4 animate-float' }, '🔍'),
            React.createElement('p', { className: 'text-xl font-bold text-neon-red' }, 'Hech narsa topilmadi')
          )
    )
  );
};

// Item Card Component
const ItemCard = ({ item, onClick, index }) => {
  const getCategoryColor = () => {
    switch (item.category) {
      case 'gaming': return 'from-purple-900/95 to-pink-900/95 border-purple-400/60';
      case 'business': return 'from-blue-900/95 to-cyan-900/95 border-blue-400/60';
      case 'student': return 'from-green-900/95 to-emerald-900/95 border-green-400/60';
      default: return 'from-blue-900/95 to-purple-900/95 border-blue-400/60';
    }
  };

  const handleCardClick = (e) => {
    e.stopPropagation();
    AudioManager.play('click', 0.3);
    if (onClick) onClick(e);
  };

  return React.createElement('div', {
    onClick: handleCardClick,
    onMouseEnter: () => AudioManager.play('hover', 0.2),
    className: `group cursor-pointer p-6 rounded-2xl glass-effect bg-gradient-to-br ${getCategoryColor()} 
      hover:scale-105 transition-all duration-300 transform-gpu 
      border-2 border-white/20 hover:border-white/40
      shadow-lg hover:shadow-lg hover:shadow-white/10
      animate-fade-in-up cyber-border animate-glow hover:animate-pulse-slow
      text-white font-medium`,
    style: { 
      animationDelay: `${index * 0.1}s`,
      backdropFilter: 'blur(10px)',
      transformStyle: 'preserve-3d',
      perspective: '1000px'
    }
  },
    React.createElement('div', { className: "flex flex-col items-center justify-center space-y-4 h-full" },
      React.createElement('div', { className: "relative w-full h-full" },
        React.createElement('div', { className: "w-full h-40 flex items-center justify-center overflow-hidden" },
          item.image ? 
            React.createElement('div', { className: 'w-full h-full flex items-center justify-center' },
              React.createElement('img', {
                src: item.image, 
                alt: item.name,
                className: `max-w-full max-h-full w-auto h-auto object-contain ${
                  item.name?.match(/Gaming|TUF|ROG|Victus/i) ? 'gaming-border' :
                  item.name?.match(/Business|Biznes|EliteBook|ThinkPad/i) ? 'business-border' :
                  item.name?.match(/Student|Talaba|Aspire|IdeaPad/i) ? 'student-border' :
                  item.type === 'desktop' || item.category === 'desktop' || item.name?.match(/Uy kompyuter/i) ? 'desktop-border' :
                  'new-announcement-border'
                }`,
                draggable: false,
                style: { maxWidth: '100%', maxHeight: '100%' }
              })
            ) : React.createElement('div', { className: 'w-full h-full flex items-center justify-center' },
              React.createElement('img', { 
                src: item.name?.match(/Gaming|TUF|ROG|Victus/i) ? 'Kartapng/Gaming Noutbuk.png' : 
                     item.name?.match(/Business|Biznes|EliteBook|ThinkPad/i) ? 'Kartapng/Biznes Noutbuk.png' :
                     item.name?.match(/Student|Talaba|Aspire|IdeaPad/i) ? 'Kartapng/Talaba Noutbuk.PNG' :
                     item.type === 'desktop' || item.category === 'desktop' || item.name?.match(/Uy kompyuter/i) ? 'Kartapng/Uy kompyuter.png' :
                     'Kartapng/Yangi Elon.png', 
                alt: item.name || 'Noutbuk', 
                className: `max-w-full max-h-full w-auto h-auto object-contain ${
                  item.name?.match(/Gaming|TUF|ROG|Victus/i) ? 'gaming-border' :
                  item.name?.match(/Business|Biznes|EliteBook|ThinkPad/i) ? 'business-border' :
                  item.name?.match(/Student|Talaba|Aspire|IdeaPad/i) ? 'student-border' :
                  item.type === 'desktop' || item.category === 'desktop' || item.name?.match(/Uy kompyuter/i) ? 'desktop-border' :
                  'new-announcement-border'
                }`,
                draggable: false,
                style: { maxWidth: '100%', maxHeight: '100%' }
              })
            )
        ),
        React.createElement('div', { className: "absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center animate-pulse border-2 border-white shadow-lg z-10 cyber-border animate-glow" },
          React.createElement('span', { className: "text-sm text-white font-bold" }, "✓")
        )
      ),
      
      React.createElement('div', { className: "text-center w-full" },
        React.createElement('h3', { 
          className: "font-bold text-lg leading-tight text-white transition-all duration-300 group-hover:text-white"
        }, item.name),
        
        item.price && React.createElement('div', { 
          className: `mt-2 px-3 py-1 rounded-full border 
            ${item.category === 'gaming' ? 'bg-neon-purple/20 border-neon-purple/30' : 
              item.category === 'business' ? 'bg-neon-blue/20 border-neon-blue/30' : 
              item.category === 'student' ? 'bg-neon-green/20 border-neon-green/30' : 
              'bg-neon-blue/20 border-neon-blue/30'}
            transform transition-transform duration-300 group-hover:scale-110`
        },
          React.createElement('p', { 
            className: "font-bold text-lg text-white neon-text group-hover:animate-pulse" 
          }, item.price)
        ),
        
        item.processor && React.createElement('p', { className: "text-white/90 text-sm mt-2 font-normal" }, item.processor),
        
        item.features && React.createElement('div', { className: "mt-3 flex flex-wrap gap-1.5 justify-center" },
          item.features.slice(0, 2).map((feature, idx) =>
            React.createElement('span', { 
              key: idx, 
              className: "px-2.5 py-1 text-xs rounded-full border bg-white/10 text-white border-white/30 transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-fade-in-up cyber-border animate-glow",
              style: { animationDelay: `${0.2 + (idx * 0.1)}s` }
            }, feature)
          )
        ),

        item.type === 'folder' && React.createElement('div', { 
          className: "mt-3 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-400/30 text-sm font-medium text-white transition-all duration-200 transform group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-yellow-500/20"
        }, 
          React.createElement('span', { className: "inline-block mr-2 animate-pulse" }, "📁"),
          `${item.items?.length || 0} ta mahsulot`,
          React.createElement('span', { 
            className: "ml-2 transition-all duration-300 transform group-hover:translate-x-1"
          }, "→")
        )
      )
    )
  );
};

// Item Detail Component
const ItemDetail = ({ item, onClose }) => {
  const [selectedImage, setSelectedImage] = React.useState(item.image || item.images?.[0]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  return React.createElement('div', { className: "p-8 animate-fade-in-up min-h-screen" },
    React.createElement('div', { className: "max-w-7xl mx-auto" },
      React.createElement('div', { className: "glass-effect rounded-2xl sm:rounded-3xl overflow-hidden cyber-border animate-glow w-full" },
        React.createElement('div', { className: "flex items-center justify-between p-8 border-b border-neon-blue/20 cyber-border" },
          React.createElement('h1', { className: "text-2xl font-bold text-neon-cyan" }, item.name),
          React.createElement('button', {
            onClick: (e) => {
              e.stopPropagation();
              AudioManager.play('close');
              onClose();
            },
            onMouseEnter: () => AudioManager.play('hover', 0.5),
            className: "bg-red-600 hover:bg-red-700 text-neon-green hover:text-white w-10 h-10 flex items-center justify-center text-2xl font-bold transition-all duration-300 rounded-full border-2 border-red-400 hover:border-white shadow-lg hover:shadow-red-500/50 transform hover:scale-110 active:scale-95"
          }, "×")
        ),
        
        React.createElement('div', { className: "p-8" },
          React.createElement('div', { className: "grid grid-cols-1 xl:grid-cols-2 gap-12" },
            // Image Section
            React.createElement('div', { className: "space-y-6" },
              selectedImage && React.createElement('img', {
                src: selectedImage,
                alt: item.name,
                className: "w-full h-80 object-cover rounded-2xl cyber-border animate-glow hover:scale-105 transition-transform duration-500 cursor-pointer",
                onClick: () => {
                  AudioManager.play('flash');
                  setIsModalOpen(true);
                }
              }),
              
              item.images && item.images.length > 1 && React.createElement('div', { className: "grid grid-cols-4 gap-3" },
                item.images.slice(0, 8).map((img, idx) =>
                  React.createElement('img', {
                    key: idx,
                    src: img,
                    alt: `${item.name} ${idx + 1}`,
                    className: `w-full h-20 object-cover rounded-lg cursor-pointer transition-all duration-300 hover:scale-110 cyber-border ${selectedImage === img ? 'ring-2 ring-neon-blue' : ''}`,
                    onClick: () => {
                      AudioManager.play('click', 0.3);
                      setSelectedImage(img);
                    }
                  })
                )
              )
            ),
            
            // Details Section
            React.createElement('div', { className: "space-y-8" },
              // Price and Specifications
              React.createElement('div', { className: "space-y-4" },
                // Price
                item.price && React.createElement('div', { className: "p-4 glass-effect rounded-2xl border border-neon-green/30 cyber-border animate-glow" },
                  React.createElement('h4', { className: "text-neon-green font-bold mb-3 neon-text" }, "💵 Narx"),
                  React.createElement('p', { className: "text-2xl font-bold text-white" }, item.price)
                ),
                
                // Specifications
                React.createElement('div', { className: "p-6 glass-effect rounded-2xl border-2 border-neon-purple/50 cyber-border animate-glow" },
                  React.createElement('h4', { className: "text-2xl font-bold text-neon-cyan mb-4 neon-text flex items-center gap-2" },
                    React.createElement('span', { className: "text-neon-purple" }, "⚙️"),
                    "Texnik xususiyatlari"
                  ),
                  React.createElement('div', { className: "space-y-4 text-sm" },
                    item.processor && React.createElement('div', { className: "bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-3 rounded-xl border border-neon-purple/30" },
                      React.createElement('div', { className: "flex justify-between items-center" },
                        React.createElement('span', { className: "text-neon-green font-medium" }, "Protsessor:"),
                        React.createElement('span', { className: "text-white font-semibold text-right" }, item.processor)
                      )
                    ),
                    item.ram && React.createElement('div', { className: "bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-3 rounded-xl border border-neon-purple/30" },
                      React.createElement('div', { className: "flex justify-between items-center" },
                        React.createElement('span', { className: "text-neon-green font-medium" }, "Operativ xotira:"),
                        React.createElement('span', { className: "text-white font-semibold" }, item.ram)
                      )
                    ),
                    item.storage && React.createElement('div', { className: "bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-3 rounded-xl border border-neon-purple/30" },
                      React.createElement('div', { className: "flex justify-between items-center" },
                        React.createElement('span', { className: "text-neon-green font-medium" }, "Xotira:"),
                        React.createElement('span', { className: "text-white font-semibold" }, item.storage)
                      )
                    ),
                    item.graphics && React.createElement('div', { className: "bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-3 rounded-xl border border-neon-purple/30" },
                      React.createElement('div', { className: "flex flex-col" },
                        React.createElement('div', { className: "flex justify-between items-center" },
                          React.createElement('span', { className: "text-neon-green font-medium" }, "Grafik karta:"),
                        ),
                        React.createElement('span', { className: "text-white font-semibold text-right mt-1" }, item.graphics)
                      )
                    ),
                    item.display && React.createElement('div', { className: "bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-3 rounded-xl border border-neon-purple/30" },
                      React.createElement('div', { className: "flex justify-between items-center" },
                        React.createElement('span', { className: "text-neon-green font-medium" }, "Ekran:"),
                        React.createElement('span', { className: "text-white font-semibold" }, item.display)
                      )
                    )
                  )
                ),
                
                // Features
                item.features && item.features.length > 0 && React.createElement('div', { className: "p-4 glass-effect rounded-2xl border border-neon-blue/30 cyber-border animate-glow" },
                  React.createElement('h4', { className: "text-neon-blue font-bold mb-3 neon-text" }, "✨ Xususiyatlar"),
                  React.createElement('div', { className: "flex flex-wrap gap-2" },
                    item.features.map((feature, index) =>
                      React.createElement('span', {
                        key: index,
                        className: "px-3 py-1 glass-effect rounded-lg text-white border border-neon-purple/30 text-xs animate-shimmer hover:scale-105 transition-transform duration-300",
                        style: { animationDelay: `${index * 0.1}s` }
                      }, feature)
                    )
                  )
                )
              ),
              
              React.createElement('div', { className: "space-y-4" },
                React.createElement('div', { className: "p-4 glass-effect rounded-2xl border border-neon-green/30 cyber-border animate-glow cyber-border" },
                  React.createElement('h4', { className: "text-neon-green font-bold mb-3 neon-text" }, "📞 Bog'lanish"),
                  React.createElement('div', { className: "space-y-2 text-sm text-white/90" },
                    React.createElement('a', { 
                      href: "tel:+998931480006",
                      onClick: () => AudioManager.play('ding'),
                      className: "flex items-center space-x-2 text-white hover:text-neon-green transition-colors duration-300 glass-effect p-2 rounded-lg cyber-border animate-glow"
                    }, 
                      React.createElement('i', { className: "fas fa-phone text-lg" }),
                      React.createElement('span', {}, "+998 93 148 00 06 Muhammad")
                    ),
                    React.createElement('a', { 
                      href: "tel:+998973386050",
                      onClick: () => AudioManager.play('ding'),
                      className: "flex items-center space-x-2 text-white hover:text-neon-green transition-colors duration-300 glass-effect p-2 rounded-lg cyber-border animate-glow"
                    }, 
                      React.createElement('i', { className: "fas fa-phone text-lg" }),
                      React.createElement('span', {}, "+998 97 338 60 50 Mirolimjon")
                    ),
                    React.createElement('a', { 
                      href: "tel:+998888660906",
                      onClick: () => AudioManager.play('ding'),
                      className: "flex items-center space-x-2 text-white hover:text-neon-green transition-colors duration-300 glass-effect p-2 rounded-lg cyber-border animate-glow"
                    }, 
                      React.createElement('i', { className: "fas fa-phone text-lg" }),
                      React.createElement('span', {}, "+998 88 866 09 06 Admin")
                    )
                  )
                ),
                
                React.createElement('div', { className: "p-4 glass-effect rounded-2xl border border-neon-blue/30 cyber-border animate-glow persistent-animation cyber-border" },
                  React.createElement('h4', { className: "text-neon-blue font-bold mb-3 neon-text" }, React.createElement('i', { className: "fab fa-telegram text-lg mr-2" }), "Telegram"),
                  React.createElement('div', { className: "space-y-2 text-sm text-white/90" },
                    React.createElement('a', { 
                      href: "https://t.me/admin_noutbuk_olami",
                      target: "_blank",
                      onClick: () => AudioManager.play('click', 0.7),
                      className: "flex items-center space-x-2 text-white hover:text-neon-blue transition-colors duration-300 glass-effect p-2 rounded-lg cyber-border animate-glow"
                    }, 
                      React.createElement('i', { className: "fab fa-telegram text-lg" }),
                      React.createElement('span', {}, "Laptop Centri")
                    ),
                    React.createElement('a', { 
                      href: "https://t.me/Laptop0006",
                      target: "_blank",
                      onClick: () => AudioManager.play('click', 0.7),
                      className: "flex items-center space-x-2 text-white hover:text-neon-blue transition-colors duration-300 glass-effect p-2 rounded-lg cyber-border animate-glow"
                    }, 
                      React.createElement('i', { className: "fab fa-telegram text-lg" }),
                      React.createElement('span', {}, "Muhammad")
                    ),
                    React.createElement('a', { 
                      href: "https://t.me/OlimjonErnazarov",
                      target: "_blank",
                      onClick: () => AudioManager.play('click', 0.7),
                      className: "flex items-center space-x-2 text-white hover:text-neon-blue transition-colors duration-300 glass-effect p-2 rounded-lg cyber-border animate-glow"
                    }, 
                      React.createElement('i', { className: "fab fa-telegram text-lg" }),
                      React.createElement('span', {}, "Admin")
                    )
                  )
                ),

                React.createElement('div', { className: "p-4 glass-effect rounded-2xl border border-neon-purple/30 cyber-border animate-glow persistent-animation cyber-border" },
                  React.createElement('h4', { className: "text-neon-cyan font-bold mb-3 neon-text" }, "ℹ️ Ma'lumot"),
                  React.createElement('div', { className: "space-y-2 text-sm text-white/80" },
                    React.createElement('p', { className: "flex items-center space-x-2" },
                      React.createElement('span', {}, "✈️"),
                      React.createElement('span', {}, "O'zbekiston bo'ylab bepul yetkazish")
                    ),
                    React.createElement('p', { className: "flex items-center space-x-2" },
                      React.createElement('span', {}, "⚠️"),
                      React.createElement('span', {}, "95% to'lov yetkazgandan so'ng")
                    ),
                    React.createElement('button', {
                      onClick: () => {
                        AudioManager.play('click');
                        window.open("https://maps.app.goo.gl/DejpApSEpvmb8YQRA?g_st=com.google.maps.preview.copy", "_blank");
                      },
                      onMouseEnter: () => AudioManager.play('hover'),
                      className: "w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-neon-pink/60 via-purple-500/60 to-neon-cyan/60 text-white font-semibold py-2.5 px-5 rounded-xl border-2 border-white/30 hover:border-neon-cyan transition-all duration-300 hover:shadow-neon-cyan/50 hover:shadow-lg hover:scale-[1.02] glass-effect hover:from-neon-pink/70 hover:to-neon-cyan/70 transform hover:translate-y-[-2px] active:scale-95"
                    },
                      React.createElement('span', { className: "text-lg" }, "🌎"),
                      React.createElement('span', { className: "font-medium" }, "Andijon, Mashrab ko'chasi 245")
                    )
                  )
                ),

                React.createElement('div', { className: "flex gap-4" },
                  React.createElement('button', {
                    onClick: () => {
                      AudioManager.play('game');
                      window.open('https://t.me/Laptop_centri', '_blank');
                    },
                    onMouseEnter: () => AudioManager.play('hover', 0.5),
                    className: "flex-1 bg-gradient-to-r from-neon-green to-emerald-500 text-black py-4 px-8 rounded-2xl hover:scale-105 transition-all duration-300 font-bold text-lg animate-glow cyber-border glass-effect"
                  }, "🛒 Buyurtma Berish"),
                  React.createElement('button', {
                    onClick: () => AudioManager.play('ding'),
                    onMouseEnter: () => AudioManager.play('hover', 0.5),
                    className: "px-6 py-4 glass-effect rounded-2xl border border-neon-blue/30 cyber-border text-neon-blue hover:bg-neon-blue/10 transition-all duration-300 animate-float cyber-border animate-glow"
                  }, "❤️")
                )
              )
            )
          )
        )
      ),
      
      // Image Modal
      React.createElement(ImageModal, {
        src: selectedImage,
        alt: item.name,
        isOpen: isModalOpen,
        onClose: () => setIsModalOpen(false)
      })
    )
  );
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  // Scroll funksiyasini darhol yoqish
  document.body.style.overflow = 'auto';
  document.body.style.overflowY = 'auto';
  document.body.style.overflowX = 'hidden';
  
  // Audio sistemini darhol ishga tushirish
  AudioManager.preload();
  AudioManager.initAudio();
  
  // React app ni ishga tushirish
  ReactDOM.render(React.createElement(Desktop), document.getElementById('root'));
  
  // Scroll va audio ta'minlash uchun qo'shimcha
  setTimeout(() => {
    document.body.style.overflow = 'auto';
    document.body.style.overflowY = 'auto';
    
    // Audio fayllarni qayta yuklash
    Object.values(AudioManager.sounds).forEach(audio => {
      audio.load();
    });
  }, 100);
  
  // Sahifa yuklangandan keyin audio testini o'tkazish
  setTimeout(() => {
    try {
      AudioManager.play('hover', 0.1);
    } catch (e) {
      // Sessiz xato
    }
  }, 500);
});