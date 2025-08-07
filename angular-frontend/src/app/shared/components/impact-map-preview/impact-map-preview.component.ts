import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { icon, latLng, Map, tileLayer, marker, LatLng, LatLngBounds, FeatureGroup } from 'leaflet';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { ThemeService } from '@services/theme.service'; // Use alias
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

interface MapLocation {
  name: string;
  lat: number;
  lng: number;
  summary: string;
}

interface TileOption {
  name: string;
  value: string;
  attribution: string;
}

@Component({
  selector: 'app-impact-map-preview',
  templateUrl: './impact-map-preview.component.html',
  styleUrls: ['./impact-map-preview.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LeafletModule,
  ]
})
export class ImpactMapPreviewComponent implements OnInit, OnDestroy {
  options: MapOptions = {
    layers: [tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' })],
    zoom: 5.5,
    center: latLng(-28.4796, 24.6981),
    zoomControl: false
  };

  tileOptions: TileOption[] = [
    {
      name: 'Light',
      value: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    {
      name: 'Dark',
      value: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; OpenStreetMap contributors'
    },
    {
      name: 'Satellite',
      value: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }
  ];
  mapTheme: string = this.tileOptions[0].value;

  mockLocations: MapLocation[] = [
    { name: 'Johannesburg', lat: -26.2041, lng: 28.0473, summary: '200 homes powered' },
    { name: 'Cape Town', lat: -33.9249, lng: 18.4241, summary: '150 homes supported' },
    { name: 'Durban', lat: -29.8587, lng: 31.0218, summary: '80 homes connected' },
    { name: 'Soweto', lat: -26.2678, lng: 27.8585, summary: '350 households engaged' },
    { name: 'Pretoria', lat: -25.7479, lng: 28.2293, summary: '180 solar installations' },
    { name: 'Port Elizabeth', lat: -33.9608, lng: 25.6022, summary: '120 energy solutions' },
    { name: 'East London', lat: -33.0292, lng: 27.8546, summary: '90 community hubs' },
    { name: 'Bloemfontein', lat: -29.0852, lng: 26.1596, summary: '65 microgrids deployed' },
    { name: 'Pietermaritzburg', lat: -29.6007, lng: 30.3796, summary: '110 smart meters' },
    { name: 'Kimberley', lat: -28.7282, lng: 24.7499, summary: '45 solar farms' },
    { name: 'Polokwane', lat: -23.8965, lng: 29.4486, summary: '75 energy kits' },
    { name: 'Rustenburg', lat: -25.6544, lng: 27.2429, summary: '95 solar water pumps' },
    { name: 'Nelspruit', lat: -25.4745, lng: 30.9703, summary: '60 community centers' },
    { name: 'Mahikeng', lat: -25.8652, lng: 25.6442, summary: '40 power stations' },
    { name: 'Mitchells Plain', lat: -34.0444, lng: 18.6107, summary: '220 households' },
    { name: 'Khayelitsha', lat: -34.0500, lng: 18.6833, summary: '300 energy grants' },
    { name: 'Alexandra', lat: -26.1174, lng: 28.0856, summary: '180 solar loans' }
  ];

  layers: Marker[] = [];
  mapBounds: LatLngBounds | undefined;

  boxBg: string = '';
  boxBorderColor: string = '';
  formLabelColor: string = '';
  selectBg: string = '';
  selectBorderColor: string = '';
  selectColor: string = '';
  selectFocusBorderColor: string = '';
  optionBg: string = '';
  optionColor: string = '';

  private themeSubscription: Subscription = new Subscription();

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
    this.setInitialMapLayer();
    this.addMarkers();
    this.setupThemeSubscription();
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }

  private setupThemeSubscription(): void {
    this.themeSubscription = this.themeService.colorMode$.subscribe((mode: 'light' | 'dark') => {
      this.boxBg = this.themeService.getColorModeValue('white', 'gray.800');
      this.boxBorderColor = this.themeService.getColorModeValue('gray.200', 'gray.700');
      this.formLabelColor = this.themeService.getColorModeValue('gray.700', 'gray.400');
      this.selectBg = this.themeService.getColorModeValue('white', 'gray.700');
      this.selectBorderColor = this.themeService.getColorModeValue('gray.200', 'gray.600');
      this.selectColor = this.themeService.getColorModeValue('gray.800', 'white');
      this.selectFocusBorderColor = this.themeService.getColorModeValue('blue.500', 'blue.300');
      this.optionBg = this.themeService.getColorModeValue('white', 'gray.700');
      this.optionColor = this.themeService.getColorModeValue('gray.800', 'white');
    });
  }

  setInitialMapLayer(): void {
    const initialTheme = this.tileOptions.find(opt => opt.value === this.mapTheme);
    if (initialTheme) {
      this.options.layers = [tileLayer(initialTheme.value, { attribution: initialTheme.attribution })];
    }
  }

  onMapThemeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.mapTheme = selectElement.value;
    const selectedTile = this.tileOptions.find(opt => opt.value === this.mapTheme);
    if (this.options.layers && selectedTile) {
      this.options.layers = [tileLayer(selectedTile.value, { attribution: selectedTile.attribution })];
    }
  }

  addMarkers(): void {
    const customIcon = icon({
      iconUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    this.layers = this.mockLocations.map(location => (
      new Marker(latLng(location.lat, location.lng), { icon: customIcon })
        .bindPopup(`<b>${location.name}</b><br>${location.summary}`)
    ));

    if (this.layers.length > 0) {
      const allMarkersGroup = new FeatureGroup(this.layers);
      this.mapBounds = allMarkersGroup.getBounds();
    }
  }

  onMapReady(map: Map): void {
    if (this.mapBounds) {
      map.fitBounds(this.mapBounds);
    }
  }
}