
# Text Case Changer Project - Comprehensive Development Plan

---

## <frontend prompt>


## **Setup Instructions**
1. **Project Initialization**:
   - Create a Next.js project with TypeScript for type-safe development.
   - Ensure a clean structure by removing unnecessary default files and configurations.

2. **TailwindCSS Integration**:
   - Integrate TailwindCSS to achieve a utility-first approach for styling.
   - Configure the design system, including custom colors, spacing, and typography, to align with the project’s branding.

3. **Lucide React for Icons**:
   - Use Lucide React to ensure a modern, consistent, and lightweight icon library for all UI elements.

4. **Path Aliases**:
   - Configure path aliases for improved import readability and to maintain a clean and organized codebase.

5. **Image Optimization**:
   - Configure the project to support optimized images from external sources, ensuring the integration of high-quality, stock images.

---

## **Frontend Guidelines**

### **General UI/UX Behavior**
- **Responsiveness**:
  - Design for a mobile-first experience, ensuring smooth scaling across devices (mobile, tablet, and desktop).
  - Use consistent padding, margins, and spacing throughout the interface.

- **Theme Toggle**:
  - The application should default to a dark theme, with an option to switch to light mode. This preference should persist across user sessions.

- **Interactivity**:
  - Incorporate dynamic animations for interactive elements such as buttons, links, and tool-specific UI components to enhance user engagement.
  - Include hover and focus states for actionable elements to provide visual feedback.

### **Component Design**
- Components should follow modularity, with a focus on reusability and separation of concerns. Core components include:
  - **Header**: Contains a collapsible navigation menu and a theme toggle.
  - **Footer**: Includes internal links and placeholders for legal and informational content.
  - **Main Layout**: Wraps all pages with consistent padding and grid structures.

- **Consistency**:
  - Use TailwindCSS utility classes for all styling to maintain design consistency across the project.
  - Apply a unified typography system with clearly defined hierarchy and spacing.

### **Design System**
- **Color Palette**:
  - Utilize a modern, tech-focused palette that includes primary and secondary colors, with accessible contrast ratios for readability.

- **Typography**:
  - Implement a clean and modern sans-serif font for all text.
  - Ensure a clear visual hierarchy for headings, subheadings, and body text.

- **Spacing and Layouts**:
  - Maintain consistent padding and margin sizes.
  - Use rounded corners for cards and interactive elements to create a polished appearance.

- **Animations**:
  - Integrate animations to create smooth transitions and enhance user interactions, without overwhelming the overall design.

### **Responsive Breakpoints**
- Define breakpoints for mobile, tablet, and desktop to ensure seamless user experiences across all devices.
- Design layouts with dynamic resizing to accommodate various screen sizes.

---

## **Behavior and Functionality**
1. The header should provide easy access to navigation while collapsing into a hamburger menu on smaller screens.
2. The footer should stay consistent across all pages, with links to additional tools and placeholder legal pages.
3. The primary tool section should:
   - Update in real-time as users interact with it.
   - Offer visual feedback, such as highlighting the active transformation.
4. Buttons and links should be interactive, with hover effects to indicate their functionality.

---

## **Next Steps**
1. Finalize the setup of TailwindCSS and Lucide React for styling and icons.
2. Begin creating core components, ensuring responsiveness and reusability.
3. Test the dark/light theme toggle for seamless functionality and persistence.
4. Ensure all UI elements are interactive and align with the defined design system.


## <image_analysis>

### **Page Components**
1. **Header**
   - Includes a collapsible menu for mobile.
   - Theme toggle (dark/light mode).
   - Navigation placeholder links for future tools.

2. **Main Tool Section**
   - Real-time text case conversion tool.
   - Transformation buttons (e.g., Uppercase, Lowercase, Sentence Case).
   - Live counters for character, word, sentence, and line counts.

3. **Footer**
   - Includes internal links (placeholders) to tools and legal pages.
   - Additional links: About Us, Contact Us.

### **UI Design**
- **Sidebar Width**: 240px (placeholder for future tools menu).
- **Card Layout**: Rounded corners (12px), responsive design, 24px consistent padding.
- **Theme Color Palette**:
  - Primary Blue: `#0066FF`
  - Background Gray: `#F5F5F7`
  - Text Dark: `#1A1A1A`
  - Success Green: `#34C759`
- **Animations**: Smooth transitions and dynamic hover states.

---

## <development_planning>

### **Folder Structure**
```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── MainLayout.tsx
│   ├── tools/
│   │   ├── CaseChangerTool.tsx
│   │   └── Counter.tsx
│   └── shared/
│       ├── ThemeToggle.tsx
│       ├── Button.tsx
│       └── InputField.tsx
├── pages/
│   ├── index.tsx
│   ├── admin.tsx
│   ├── about.tsx
│   └── contact.tsx
├── styles/
├── hooks/
└── utils/
```

### **Core Features**
1. **Case Changer Tool**
   - Real-time updates for text transformations.
   - Buttons for case options (e.g., Uppercase, Sentence Case, Alternating Case).
   - Counters for characters, words, sentences, and lines.

2. **Admin Page**
   - Accessible via `/admin`.
   - Editable form for updating tool descriptions.
   - Simple password authentication for admin access.

3. **Contact Us**
   - Includes a form with Name, Email, and Message fields.
   - Static submission confirmation message.

4. **SEO Optimization**
   - Add meta tags and descriptions to all pages.
   - Target keywords:
     - "Online text case changer"
     - "Convert text format tool"
     - "Free text tools online"

---

## <page structure prompt>

### **Routes**
- `/`: Landing page with the main tool and descriptions.
- `/admin`: Admin page for managing tool descriptions.
- `/about`: About Us page.
- `/contact`: Contact Us page.

### **Page Layouts**
1. **Landing Page (`/`)**:
   - **Main Sections**:
     - Header with navigation and theme toggle.
     - Case Changer Tool with counters.
     - SEO-optimized description of the tool.
     - Footer with links to tools and legal pages.

2. **Admin Page (`/admin`)**:
   - Simple form to manage tool descriptions.

3. **About Us (`/about`)**:
   - Placeholder content for now.

4. **Contact Us (`/contact`)**:
   - Form with Name, Email, and Message fields.

---

### **Responsive Breakpoints**
- Mobile: 320px–767px.
- Tablet: 768px–1023px.
- Desktop: 1024px+.

---

## Next Steps

1. Begin development based on the provided plan.
2. Prioritize building the Case Changer Tool and layout components.
3. Test for responsiveness and finalize animations and interactions.

