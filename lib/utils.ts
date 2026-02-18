import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function formatPrice(priceInr: number): string {
    if (priceInr >= 10000000) {
        return `₹${(priceInr / 10000000).toFixed(2)} Cr`;
    } else if (priceInr >= 100000) {
        return `₹${(priceInr / 100000).toFixed(2)} L`;
    } else if (priceInr >= 1000) {
        return `₹${(priceInr / 1000).toFixed(0)}K`;
    }
    return `₹${priceInr}`;
}

export function formatSize(sizeSqft: number): string {
    return `${sizeSqft.toLocaleString()} sq ft`;
}

export function buildWhatsAppUrl(
    phoneNumber: string,
    template: string,
    propertyTitle: string,
    propertyUrl: string
): string {
    const message = template
        .replace('{propertyTitle}', propertyTitle)
        .replace('{propertyUrl}', propertyUrl);

    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

// Top Facilities utilities
export function parseTopFacilities(facilitiesJson: string | null): string[] {
    if (!facilitiesJson) return [];
    try {
        return JSON.parse(facilitiesJson);
    } catch {
        return [];
    }
}

export function stringifyTopFacilities(facilities: string[]): string {
    return JSON.stringify(facilities);
}

// Location Advantages utilities
export interface LocationAdvantage {
    name: string;
    type: string;
    distance: string;
}

export function parseLocationAdvantages(locationsJson: string | null): LocationAdvantage[] {
    if (!locationsJson) return [];
    try {
        return JSON.parse(locationsJson);
    } catch {
        return [];
    }
}


export function stringifyLocationAdvantages(locations: LocationAdvantage[]): string {
    return JSON.stringify(locations);
}

// Property Details utilities
export interface PropertyDetail {
    key: string;
    value: string;
}

export function parsePropertyDetails(detailsJson: string | null): PropertyDetail[] {
    if (!detailsJson) return [];
    try {
        return JSON.parse(detailsJson);
    } catch {
        return [];
    }
}

export function stringifyPropertyDetails(details: PropertyDetail[]): string {
    return JSON.stringify(details);
}

// Custom Sections utilities
export interface CustomSection {
    id: string;
    title: string;
    type: 'keyvalue' | 'text';
    content: PropertyDetail[] | string;
}

export function parseCustomSections(sectionsJson: string | null): CustomSection[] {
    if (!sectionsJson) return [];
    try {
        return JSON.parse(sectionsJson);
    } catch {
        return [];
    }
}

export function stringifyCustomSections(sections: CustomSection[]): string {
    return JSON.stringify(sections);
}

// Section Order utilities
export function parseSectionOrder(orderJson: string | null): string[] {
    if (!orderJson) return [];
    try {
        return JSON.parse(orderJson);
    } catch {
        return [];
    }
}

export function stringifySectionOrder(order: string[]): string {
    return JSON.stringify(order);
}

// Default section order
export const DEFAULT_SECTION_ORDER = [
    'basic-info',
    'specifications',
    'property-details',
    'facilities',
    'locations',
];
