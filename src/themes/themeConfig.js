export const themes = {
  // 1. macOS Tahoe / Sequoia Frosted Liquid Glass
  macos: {
    id: 'macos',
    name: 'macOS Sonoma Glass',
    bodyClass: 'font-[-apple-system,BlinkMacSystemFont,"SF_Pro_Text",sans-serif]',
    background: 'bg-[#1e1728]',
    meshStyle: {
      backgroundImage: `
        radial-gradient(ellipse 60% 50% at 20% 80%, #17384a 0%, transparent 60%),
        radial-gradient(ellipse 60% 60% at 50% 20%, #432a59 0%, transparent 70%),
        radial-gradient(ellipse 50% 50% at 85% 60%, #4a2034 0%, transparent 60%)
      `
    },
    panel: 'bg-white/[0.07] backdrop-blur-2xl border-white/10 shadow-2xl rounded-2xl',
    card: 'bg-white/[0.04] backdrop-blur-xl border-white/10 hover:bg-white/[0.08] transition rounded-xl',
    accent: 'from-purple-500 to-indigo-600 text-white',
    radius: 'rounded-2xl',
    windowControls: 'macos', // Red, Yellow, Green dots (Left aligned)
  },

  // 2. Windows 11 Fluent Mica Theme
  windows11: {
    id: 'windows11',
    name: 'Windows 11 Fluent Dark',
    bodyClass: 'font-["Segoe_UI_Variable_Text","Segoe_UI",sans-serif]',
    background: 'bg-[#181a20]',
    meshStyle: {
      backgroundImage: `
        radial-gradient(ellipse 70% 60% at 10% 90%, #0d2836 0%, transparent 70%),
        radial-gradient(ellipse 65% 55% at 35% 20%, #3a2a4c 0%, transparent 70%),
        radial-gradient(ellipse 60% 60% at 90% 40%, #3a1e28 0%, transparent 65%)
      `
    },
    panel: 'bg-[#202020]/75 backdrop-blur-3xl border-white/[0.08] shadow-lg rounded-xl',
    card: 'bg-[#2d2d2d]/60 backdrop-blur-md border-white/[0.06] hover:bg-[#383838]/80 transition rounded-lg',
    accent: 'from-cyan-500 to-blue-600 text-cyan-200',
    radius: 'rounded-xl',
    windowControls: 'windows', // Minimize, Maximize, Close on Right
  },

  // 3. Linux GNOME / Ubuntu Yaru Dark Theme
  linux: {
    id: 'linux',
    name: 'Linux GNOME Cosmic',
    bodyClass: 'font-["Ubuntu","Cantarell",sans-serif]',
    background: 'bg-[#1b1722]',
    meshStyle: {
      backgroundImage: `
        radial-gradient(circle at 10% 20%, #4a1d2d 0%, transparent 50%),
        radial-gradient(circle at 90% 80%, #1e2840 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, #221c2c 0%, transparent 70%)
      `
    },
    panel: 'bg-[#242424]/90 backdrop-blur-xl border-[#3a3a3a] shadow-2xl rounded-2xl',
    card: 'bg-[#2e2e2e]/70 border-[#3d3d3d] hover:bg-[#383838] transition rounded-xl',
    accent: 'from-orange-500 to-amber-600 text-orange-200',
    radius: 'rounded-2xl',
    windowControls: 'gnome',
  }
};