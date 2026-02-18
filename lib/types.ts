import { Property } from '@prisma/client';

export type DealType = 'rent' | 'lease';
export type UsageType = 'residential' | 'commercial';

export interface PropertyWithParsedAmenities extends Omit<Property, 'amenities'> {
    amenities: string[];
}

export interface PropertyFilters {
    deal?: DealType;
    use?: UsageType;
    area?: string;
    minPrice?: number;
    maxPrice?: number;
    minSize?: number;
    maxSize?: number;
    amenities?: string[];
}

export interface SiteSettingsParsed {
    id: string;
    brandName: string;
    tagline: string;
    city: string;
    whatsappNumber: string;
    phoneNumber: string;
    whatsappTemplate: string;
    amenitiesVocabulary: string[];
    updatedAt: Date;
}
