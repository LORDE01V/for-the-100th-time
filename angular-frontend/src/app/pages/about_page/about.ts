import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // Import Router and RouterLink
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'; // For sanitizing image URLs

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink], // Add RouterLink here
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About implements OnInit { // Implement OnInit

  // Developer data
  team = [
    {
      name: "Kgotatso Mokgashi",
      role: "Backend",
      avatarPath: 'assets/images/kg_img.png', // Update paths for Angular assets
      initials: "KM"
    },
    {
      name: "Okuhle Gadla",
      role: "Backend",
      avatarPath: 'assets/images/sleigh.png', // Renamed from okuhleImg
      initials: "OG"
    },
    {
      name: "Thembelihle Zulu",
      role: "Database",
      avatarPath: 'assets/images/Lihle.png', // Renamed from liheImg
      initials: "TZ"
    },
    {
      name: "Mpho Ramokhoase",
      role: "Frontend",
      avatarPath: 'assets/images/Mpho.png',
      initials: "MR"
    },
    {
      name: "Nkosinathi Radebe",
      role: "Frontend",
      avatarPath: 'assets/images/IMG Nathii.jpg', // Renamed from nathiImg
      initials: "NR"
    }
  ];

  // Image paths (relative to the Angular 'public' or 'assets' folder)
  gridxBackgroundPath: SafeUrl;
  aboutBgPath: SafeUrl; // Not explicitly used in the original HTML, but keeping for reference if needed
  
  // Color variables (simplified, as SCSS will handle most styling)
  // In a real Angular app, you might use services or provide/inject tokens for theme management
  // For now, these are illustrative and mostly mapped to SCSS classes.
  bgColor: string = 'var(--chakra-colors-gray-50)'; // Example: use CSS variables or classes
  cardBg: string = 'var(--chakra-colors-white)';
  textColor: string = 'var(--chakra-colors-gray-700)';
  headingColor: string = 'var(--chakra-colors-gray-800)';
  borderColor: string = 'var(--chakra-colors-gray-200)';
  developerCardBg: string = 'var(--chakra-colors-gray-100)';
  glassCoreBg: string = 'rgba(255, 255, 255, 0.2)';
  glassCoreBorder: string = 'rgba(255, 255, 255, 0.1)';
  glassTeamBg: string = 'rgba(255, 255, 255, 0.15)';
  aboutBoxBg: string = 'rgba(255, 255, 255, 0.85)';
  aboutBorderColor: string = 'var(--chakra-colors-gray-300)';
  aboutTextColor: string = 'var(--chakra-colors-gray-700)';


  constructor(private router: Router, private sanitizer: DomSanitizer) {
    // Sanitize image URLs to prevent security warnings
    this.gridxBackgroundPath = this.sanitizer.bypassSecurityTrustUrl('assets/images/gridx_background.jpg');
    this.aboutBgPath = this.sanitizer.bypassSecurityTrustUrl('assets/images/About_Page_IMG.png');
  }

  ngOnInit(): void {
    // Any initialization logic can go here.
    // For React's useEffect with empty dependency array, ngOnInit is the equivalent.
  }

  goBack(): void {
    this.router.navigateByUrl('/'); // Navigate to home or a specific previous route
    // Alternatively, to mimic history.back(): window.history.back();
  }
}