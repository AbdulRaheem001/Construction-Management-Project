#!/bin/bash

# PWA Icon Generator Script
# This script creates SVG-based icons for the PWA

ICON_DIR="public/icons"
mkdir -p "$ICON_DIR"

# Create SVG base icon
cat > "$ICON_DIR/icon-base.svg" << 'EOF'
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="512" height="512" rx="115" fill="url(#grad1)"/>
  
  <!-- Building Icon -->
  <g transform="translate(106, 106)">
    <!-- Main Building -->
    <rect x="80" y="60" width="140" height="240" fill="#ffffff" rx="8"/>
    
    <!-- Windows -->
    <rect x="100" y="80" width="30" height="35" fill="#4f46e5" rx="4"/>
    <rect x="145" y="80" width="30" height="35" fill="#4f46e5" rx="4"/>
    <rect x="190" y="80" width="30" height="35" fill="#4f46e5" rx="4"/>
    
    <rect x="100" y="130" width="30" height="35" fill="#4f46e5" rx="4"/>
    <rect x="145" y="130" width="30" height="35" fill="#4f46e5" rx="4"/>
    <rect x="190" y="130" width="30" height="35" fill="#4f46e5" rx="4"/>
    
    <rect x="100" y="180" width="30" height="35" fill="#4f46e5" rx="4"/>
    <rect x="145" y="180" width="30" height="35" fill="#4f46e5" rx="4"/>
    <rect x="190" y="180" width="30" height="35" fill="#4f46e5" rx="4"/>
    
    <!-- Door -->
    <rect x="135" y="240" width="50" height="60" fill="#4f46e5" rx="6"/>
    
    <!-- Crane -->
    <line x1="40" y1="100" x2="40" y2="20" stroke="#ffffff" stroke-width="6"/>
    <line x1="40" y1="20" x2="130" y2="20" stroke="#ffffff" stroke-width="6"/>
    <line x1="130" y1="20" x2="130" y2="50" stroke="#ffffff" stroke-width="4"/>
    <rect x="125" y="50" width="10" height="15" fill="#fbbf24" rx="2"/>
    
    <!-- Ground -->
    <line x1="0" y1="300" x2="300" y2="300" stroke="#ffffff" stroke-width="4"/>
  </g>
</svg>
EOF

echo "✓ Created base SVG icon"

# Create PNG icons using ImageMagick (if available) or create placeholders
if command -v convert &> /dev/null; then
    echo "ImageMagick found. Generating PNG icons..."
    convert "$ICON_DIR/icon-base.svg" -resize 72x72 "$ICON_DIR/icon-72x72.png"
    convert "$ICON_DIR/icon-base.svg" -resize 96x96 "$ICON_DIR/icon-96x96.png"
    convert "$ICON_DIR/icon-base.svg" -resize 128x128 "$ICON_DIR/icon-128x128.png"
    convert "$ICON_DIR/icon-base.svg" -resize 144x144 "$ICON_DIR/icon-144x144.png"
    convert "$ICON_DIR/icon-base.svg" -resize 152x152 "$ICON_DIR/icon-152x152.png"
    convert "$ICON_DIR/icon-base.svg" -resize 192x192 "$ICON_DIR/icon-192x192.png"
    convert "$ICON_DIR/icon-base.svg" -resize 384x384 "$ICON_DIR/icon-384x384.png"
    convert "$ICON_DIR/icon-base.svg" -resize 512x512 "$ICON_DIR/icon-512x512.png"
    echo "✓ Generated all PNG icons"
else
    echo "⚠ ImageMagick not found. Using SVG fallback."
    echo "Install ImageMagick: sudo apt-get install imagemagick"
    echo "Or use an online tool to convert icon-base.svg to PNG sizes"
fi

# Create favicon
if [ -f "$ICON_DIR/icon-192x192.png" ]; then
    cp "$ICON_DIR/icon-192x192.png" "public/favicon.png"
    echo "✓ Created favicon.png"
fi

echo ""
echo "PWA icons created successfully!"
echo "Location: $ICON_DIR"
