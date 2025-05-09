# EquipTrack UI Design System

## Color Palette

### Background Colors
- Primary Background: `#f8f9fc` - Main application background
- Sidebar Background: `#f5f5f5` - Sidebar and secondary areas
- Dark Mode Background: `#1D2125` - Dark mode application background

### Button Colors
- Primary Action Button: 
  - Background: `#a6e15a`
  - Text: `white`
  - Hover: `#95cc4f`
- Destructive Action Button:
  - Background: `#ef4444` (red-500)
  - Text: `white`
  - Hover: `#dc2626` (red-600)

### Text Colors
- Primary Text (Light Mode): `text-gray-800`
- Secondary Text (Light Mode): `text-gray-600`
- Primary Text (Dark Mode): `text-gray-200`
- Secondary Text (Dark Mode): `text-gray-400`

### Border Colors
- Light Mode: `border-gray-200`
- Dark Mode: `border-gray-800`

## Component Specifications

### Sidebar
- Expanded Width: `w-64` (256px)
- Collapsed Width: `w-[70px]` (70px)
- Background: `#f5f5f5` (Light), `#1D2125` (Dark)
- Border: Right border using border colors above

#### Sidebar Buttons
- Style: Pill-shaped rectangle
- Border Radius: `rounded-full`
- Height: `h-10` (40px)
- Padding: `px-3`
- Display: `flex items-center`
- Icon Size: `h-5 w-5` (20px)
- Text: Hidden when collapsed
- Transition: `transition-all duration-300`
- Colors:
  - Default: Text `text-gray-600`
  - Hover: `hover:bg-gray-200/50 hover:text-gray-900`
  - Active: `bg-gray-200/50 text-gray-900`
  - Dark Mode Toggle: Matches dark mode theme
  - Logout: Red accent with custom hover states

### Headers
- Height: `h-16` (64px)
- Background: Matches main background color
- No additional borders

### Action Buttons
- Primary Action Button:
  - Style: Pill-shaped rectangle
  - Height: `h-10` (40px)
  - Padding: `px-6`
  - Border Radius: `rounded-full`
  - Display: `flex items-center gap-2`
  - Icon Size: `h-5 w-5` (20px)
  - Text: Included next to icon
  - Colors: Solid background `#a6e15a`, white text
  - Hover: `#95cc4f`
  - Transition: `transition-all duration-300`
  - Border: None

- Secondary Action Buttons:
  - Style: Pill-shaped rectangle
  - Height: `h-10` (40px)
  - Border Radius: `rounded-full`
  - Colors: Match primary button scheme
  - Variant: Solid background with white text

- Destructive Action Buttons:
  - Style: Pill-shaped rectangle
  - Height: `h-10` (40px)
  - Border Radius: `rounded-full`
  - Colors: Solid red background (`red-500`), white text
  - Hover: Darker red (`red-600`)
  - Transition: `transition-all duration-300`
  - Border: None

### Hover Effects
- Sidebar Items: `hover:bg-gray-200/50`
- Buttons: Slightly darker shade of base color
- Interactive Elements: Smooth transitions with `transition-all duration-300`

## Layout Guidelines

### Spacing
- Container Padding: `px-4 py-4` (base)
- Component Margins: `mb-6` between major sections
- Inner Padding: `p-4 md:p-6` for cards and containers

### Responsive Behavior
- Container Width:
  - Default: `w-full`
  - MD: `container`
  - LG: `w-[85%]`
  - XL: `w-[80%]`

### Cards and Containers
- Background: `white` (Light Mode)
- Border Radius: `rounded-lg`
- Shadow: `shadow-sm`
- Border: `border-gray-100`

## Best Practices
1. Use rounded corners for containers and buttons
2. Maintain consistent spacing throughout the application
3. Use white text on dark backgrounds for better contrast
4. Implement smooth transitions for interactive elements
5. Keep UI elements minimal and clean
6. Use icons consistently with text labels where necessary
7. Ensure proper contrast ratios for accessibility 