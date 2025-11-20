# User Guide

Welcome to the 2.5D Interactive Map! This guide will help you navigate and use all the features of the platform.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Navigating the Globe](#navigating-the-globe)
4. [Managing Layers](#managing-layers)
5. [Using the Timeline](#using-the-timeline)
6. [Searching for Locations](#searching-for-locations)
7. [Measurement Tools](#measurement-tools)
8. [Exporting Data](#exporting-data)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [FAQ](#faq)
11. [Troubleshooting](#troubleshooting)

---

## Getting Started

### System Requirements

**Browser Compatibility**:

- ✅ Chrome 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Hardware Requirements**:

- **GPU**: WebGL 2.0 compatible graphics card
- **RAM**: Minimum 4GB (8GB recommended)
- **Internet**: Broadband connection for streaming map data

### First Steps

1. **Access the Application**: Navigate to the application URL in your browser
2. **Allow Location Access** (Optional): For location-based features
3. **Explore the Interface**: Familiarize yourself with the main components
4. **Try the Tutorial**: Follow the interactive tutorial for new users

---

## Interface Overview

The application interface consists of several key components:

### Main Components

```
┌─────────────────────────────────────────────────────────┐
│  [Search Bar]                    [User Panel] [Tools]   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Layer]                                                 │
│  [Panel]              3D GLOBE VIEW                      │
│                                                          │
│                                                          │
├─────────────────────────────────────────────────────────┤
│              [Timeline Slider]                           │
└─────────────────────────────────────────────────────────┘
```

#### 1. **3D Globe View** (Center)

- Main visualization area showing the interactive 3D globe
- Displays all active map layers and data
- Supports mouse/touch interaction for navigation

#### 2. **Layer Panel** (Left)

- Lists all available map layers
- Toggle layers on/off
- Adjust layer opacity
- Reorder layer display

#### 3. **Timeline Slider** (Bottom)

- Navigate through historical time periods
- View data changes over time
- Play/pause animation
- Jump to specific dates

#### 4. **Search Bar** (Top)

- Search for locations worldwide
- Geocoding and reverse geocoding
- Quick navigation to places

#### 5. **Tools Panel** (Top Right)

- Measurement tools
- Drawing tools
- Data export
- Settings

#### 6. **User Panel** (Top Right)

- User account management
- Saved views
- Preferences
- Login/logout

---

## Navigating the Globe

### Mouse Controls

| Action | Control |
|--------|---------|
| **Rotate Globe** | Left-click + drag |
| **Zoom In/Out** | Scroll wheel |
| **Pan View** | Right-click + drag or Middle-click + drag |
| **Tilt View** | Ctrl + Left-click + drag (up/down) |
| **Reset View** | Double-click on globe |

### Touch Controls (Mobile/Tablet)

| Action | Control |
|--------|---------|
| **Rotate Globe** | Single finger drag |
| **Zoom** | Pinch gesture (two fingers) |
| **Tilt** | Two finger drag (up/down) |
| **Reset View** | Double-tap |

### Navigation Tips

> [!TIP]
> **Quick Navigation**: Use the search bar to instantly fly to any location worldwide. Type a city name, address, or coordinates.

> [!TIP]
> **Smooth Rotation**: Hold Shift while dragging to rotate the globe more smoothly.

> [!TIP]
> **Home View**: Press the 'H' key to return to the default home view.

---

## Managing Layers

Layers are different data sets that can be displayed on the globe. You can combine multiple layers to create custom visualizations.

### Layer Types

1. **Base Layers**: Background maps (e.g., OpenStreetMap, Satellite imagery)
2. **Terrain Layers**: 3D elevation data
3. **Data Layers**: Thematic data (borders, cities, climate, etc.)
4. **Historical Layers**: Time-specific data from the past

### Working with Layers

#### Toggle Layer Visibility

1. Open the **Layer Panel** on the left
2. Click the **eye icon** next to a layer to show/hide it
3. Active layers are highlighted

#### Adjust Layer Opacity

1. Hover over a layer in the Layer Panel
2. Use the **opacity slider** to adjust transparency (0-100%)
3. Lower opacity allows you to see layers underneath

#### Reorder Layers

1. In the Layer Panel, **drag and drop** layers to reorder them
2. Layers at the top are displayed on top of layers below
3. This affects how overlapping data is displayed

#### Filter Layers

Use the filter options at the top of the Layer Panel:

- **By Type**: Base, Terrain, Data, Historical
- **By Category**: Administrative, Topographic, Climate, etc.
- **By Status**: Active, Inactive

### Layer Examples

**Example 1: Modern Political Map**

```
✅ OpenStreetMap (Base)
✅ Current Political Borders (Data)
✅ Major Cities (Data)
```

**Example 2: Historical Visualization**

```
✅ Satellite Imagery (Base)
✅ Terrain (3D elevation)
✅ Historical Borders 1900 (Data, 70% opacity)
✅ Historical Events (Data)
```

---

## Using the Timeline

The timeline allows you to visualize how geographic data changes over time.

### Timeline Controls

| Control | Function |
|---------|----------|
| **Play/Pause Button** | Animate through time automatically |
| **Slider** | Manually select a specific date/year |
| **Speed Control** | Adjust animation speed (1x, 2x, 5x, 10x) |
| **Date Display** | Shows current selected date |
| **Range Selector** | Set start and end dates for animation |

### Using the Timeline

#### View a Specific Year

1. Locate the **Timeline Slider** at the bottom of the screen
2. **Drag the slider** to the desired year
3. The globe updates to show data from that time period
4. Historical layers adjust automatically

#### Animate Through Time

1. Click the **Play button** on the timeline
2. Watch as the globe animates through historical changes
3. Adjust the **speed** using the speed control
4. Click **Pause** to stop at any point

#### Set a Custom Time Range

1. Click the **Range Selector** icon
2. Enter **start date** and **end date**
3. The timeline will be limited to this range
4. Useful for focusing on specific historical periods

### Timeline Tips

> [!TIP]
> **Keyboard Control**: Use the left/right arrow keys to step through time one year at a time.

> [!TIP]
> **Loop Animation**: Enable loop mode to continuously animate through your selected time range.

> [!NOTE]
> Not all layers have historical data. Layers without time-specific data remain constant across all time periods.

---

## Searching for Locations

The search feature helps you quickly find and navigate to any location on Earth.

### Search Methods

#### 1. Text Search

Type a location name in the search bar:

- **Cities**: "Paris", "Tokyo", "New York"
- **Countries**: "France", "Japan", "United States"
- **Landmarks**: "Eiffel Tower", "Mount Everest"
- **Addresses**: "1600 Pennsylvania Avenue, Washington DC"

#### 2. Coordinate Search

Enter coordinates directly:

- **Decimal Degrees**: `48.8566, 2.3522`
- **DMS Format**: `48°51'24"N, 2°21'8"E`

### Search Results

Search results show:

- **Location name**
- **Type** (city, country, landmark, etc.)
- **Coordinates**
- **Relevance score**

Click on a result to:

- **Fly to location** on the globe
- **View details** in a popup
- **Save location** to favorites

### Advanced Search

Use filters to refine your search:

- **Type**: Cities, Countries, Natural Features, etc.
- **Region**: Limit search to a specific area
- **Time Period**: Find historical locations

---

## Measurement Tools

Measure distances, areas, and elevations on the globe.

### Available Tools

#### 1. Distance Measurement

**How to use**:

1. Click the **Ruler icon** in the Tools Panel
2. Click on the globe to set the **start point**
3. Click again to set the **end point**
4. The distance is displayed in kilometers/miles
5. Add more points to measure a path

**Features**:

- Accounts for Earth's curvature
- Shows both straight-line and geodesic distance
- Supports multiple waypoints

#### 2. Area Measurement

**How to use**:

1. Click the **Area icon** in the Tools Panel
2. Click on the globe to create polygon vertices
3. Double-click to complete the polygon
4. The area is displayed in km² or mi²

**Use cases**:

- Measure country sizes
- Calculate forest coverage
- Estimate urban areas

#### 3. Elevation Profile

**How to use**:

1. Click the **Elevation icon** in the Tools Panel
2. Draw a line across terrain
3. View the elevation profile chart
4. See min/max/average elevations

---

## Exporting Data

Export map data and visualizations for use in other applications.

### Export Options

#### 1. Export Screenshot

**Steps**:

1. Open the **Tools Panel**
2. Click **Export** → **Screenshot**
3. Choose resolution (1x, 2x, 4x)
4. Click **Download**

**Formats**: PNG, JPEG

#### 2. Export Data

**Steps**:

1. Select the layers you want to export
2. Open **Tools Panel** → **Export** → **Data**
3. Choose format (GeoJSON, KML, CSV)
4. Set filters (bounding box, time range)
5. Click **Download**

**Formats**:

- **GeoJSON**: For GIS applications
- **KML**: For Google Earth
- **CSV**: For spreadsheet analysis

#### 3. Export Animation

**Steps**:

1. Set up your timeline animation
2. Open **Tools Panel** → **Export** → **Animation**
3. Configure settings (resolution, frame rate, duration)
4. Click **Render** (this may take time)
5. Download the video file

**Formats**: MP4, WebM, GIF

---

## Keyboard Shortcuts

Boost your productivity with keyboard shortcuts:

### Navigation

| Shortcut | Action |
|----------|--------|
| `H` | Home view (reset camera) |
| `F` | Fly to selected location |
| `←` `→` | Step through timeline (year by year) |
| `Space` | Play/pause timeline animation |
| `+` `-` | Zoom in/out |
| `Esc` | Cancel current operation |

### Layers

| Shortcut | Action |
|----------|--------|
| `L` | Toggle Layer Panel |
| `1-9` | Toggle layers 1-9 |
| `Ctrl + L` | Show only base layers |

### Tools

| Shortcut | Action |
|----------|--------|
| `M` | Activate measurement tool |
| `D` | Activate drawing tool |
| `S` | Open search |
| `Ctrl + E` | Export screenshot |

### General

| Shortcut | Action |
|----------|--------|
| `?` | Show keyboard shortcuts help |
| `Ctrl + Z` | Undo last action |
| `Ctrl + Y` | Redo last action |
| `F11` | Toggle fullscreen |

---

## FAQ

### General Questions

**Q: Is the application free to use?**  
A: Yes, the application is open-source and free to use. Some advanced features may require registration.

**Q: Can I use this offline?**  
A: The application requires an internet connection to load map data. Offline mode is planned for future releases.

**Q: What data sources are used?**  
A: We use data from OpenStreetMap, NASA, NOAA, ESA, Natural Earth, and other open data sources.

### Technical Questions

**Q: Why is the globe loading slowly?**  
A: This can be due to:

- Slow internet connection
- Too many layers active simultaneously
- Large dataset being loaded
- Try reducing the number of active layers or lowering the quality settings.

**Q: The 3D view is not working. What should I do?**  
A: Ensure your browser supports WebGL 2.0:

1. Visit <https://get.webgl.org/webgl2/>
2. If WebGL is not supported, update your browser or graphics drivers
3. Try disabling browser extensions that might block WebGL

**Q: Can I contribute my own data?**  
A: Yes! Registered users with contributor status can submit data. See the [Contributing Guide](CONTRIBUTING.md) for details.

### Data Questions

**Q: How accurate is the historical data?**  
A: Historical data accuracy varies by source and time period. Each dataset includes metadata about its source and reliability. Always verify critical information with primary sources.

**Q: How often is the data updated?**  
A: Base maps and terrain are updated monthly. Historical datasets are static but new datasets are added regularly.

**Q: Can I download the entire dataset?**  
A: Due to size constraints, we don't offer full dataset downloads. You can export specific regions and time periods using the export tools.

---

## Troubleshooting

### Common Issues

#### Issue: Globe appears black or doesn't load

**Solutions**:

1. Check your internet connection
2. Verify WebGL support in your browser
3. Clear browser cache and reload
4. Try a different browser
5. Update graphics drivers

#### Issue: Performance is slow/choppy

**Solutions**:

1. Reduce the number of active layers
2. Lower the terrain quality in settings
3. Disable shadows and lighting effects
4. Close other browser tabs
5. Use a computer with better GPU

#### Issue: Search not finding locations

**Solutions**:

1. Check spelling of location name
2. Try alternative names (e.g., "München" vs "Munich")
3. Use coordinates instead
4. Ensure you have internet connection (search requires online access)

#### Issue: Timeline not working

**Solutions**:

1. Ensure you have historical layers enabled
2. Check that the selected year is within the layer's time range
3. Refresh the page
4. Clear browser cache

#### Issue: Cannot export data

**Solutions**:

1. Check that you have layers selected
2. Ensure popup blockers are disabled
3. Try a different export format
4. Check browser console for errors

### Getting Help

If you continue to experience issues:

1. **Check the Documentation**: Review this guide and the [API documentation](API.md)
2. **Search Issues**: Look for similar issues on [GitHub Issues](https://github.com/your-org/2.5d-map/issues)
3. **Report a Bug**: Create a new issue with:
   - Browser and version
   - Steps to reproduce
   - Screenshots if applicable
   - Console error messages
4. **Contact Support**: Email <support@example.com>

---

## Browser Compatibility

### Fully Supported

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 90+ | Recommended for best performance |
| Firefox | 88+ | Good performance |
| Safari | 14+ | macOS and iOS |
| Edge | 90+ | Chromium-based |

### Limited Support

| Browser | Notes |
|---------|-------|
| Opera | Generally works, not officially tested |
| Brave | Works with shields down |

### Not Supported

- Internet Explorer (all versions)
- Browsers without WebGL 2.0 support

---

## Tips for Best Experience

> [!TIP]
> **Use Chrome**: For the best performance and compatibility, we recommend Google Chrome.

> [!TIP]
> **Hardware Acceleration**: Ensure hardware acceleration is enabled in your browser settings for smooth 3D rendering.

> [!TIP]
> **Save Your Views**: Create an account to save your favorite views, layer configurations, and custom data.

> [!TIP]
> **Explore Presets**: Check out the preset views in the User Panel for interesting historical visualizations.

---

## Next Steps

Now that you're familiar with the basics:

1. **Explore Historical Events**: Use the timeline to discover major historical events
2. **Create Custom Visualizations**: Combine different layers to create unique views
3. **Share Your Discoveries**: Export and share interesting visualizations
4. **Contribute Data**: Help improve the platform by contributing data

For developers interested in contributing, see the [Contributing Guide](CONTRIBUTING.md).

For API integration, see the [API Documentation](API.md).

---

**Happy Exploring! 🌍**
