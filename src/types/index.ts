export type BourdainShow = 'no_reservations' | 'parts_unknown' | 'the_layover'

export interface BourdainLocation {
  id: string
  show: BourdainShow
  season: number | null
  episode: number | null
  episode_title: string | null
  location_name: string
  city: string
  country: string
  lat: number
  lng: number
  description: string | null
  air_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Restaurant {
  id: string
  user_id: string
  name: string
  description: string | null
  address: string | null
  city: string
  country: string
  lat: number
  lng: number
  cuisine_type: string | null
  website: string | null
  created_at: string
}

export interface RestaurantImage {
  id: string
  restaurant_id: string
  user_id: string
  storage_path: string
  caption: string | null
  created_at: string
}

export interface RestaurantComment {
  id: string
  restaurant_id: string
  user_id: string
  body: string
  created_at: string
}

export interface RestaurantVote {
  restaurant_id: string
  user_id: string
}

export interface MapFilters {
  show: BourdainShow | null
  country: string | null
  season: number | null
}

// Broad food-style shortcuts first, then alphabetical by cuisine
export const CUISINE_LIST = [
  'BBQ', 'Burgers', 'Pizza', 'Ramen', 'Seafood', 'Soul Food', 'Sushi', 'Tacos',
  'Afghan', 'African', 'Albanian', 'Algerian', 'American', 'Andorran', 'Argentine',
  'Armenian', 'Australian', 'Austrian', 'Azerbaijani',
  'Balinese', 'Bangladeshi', 'Basque', 'Belgian', 'Bolivian', 'Brazilian', 'Bulgarian', 'Burmese',
  'Cajun', 'Cambodian', 'Canadian', 'Cantonese', 'Caribbean', 'Chilean', 'Chinese',
  'Colombian', 'Congolese', 'Costa Rican', 'Creole', 'Croatian', 'Cuban', 'Czech',
  'Danish', 'Dutch',
  'East African', 'Egyptian', 'Emirati', 'Ethiopian',
  'Filipino', 'Finnish', 'French', 'Fusion',
  'Georgian', 'German', 'Ghanaian', 'Greek', 'Guatemalan',
  'Haitian', 'Hawaiian', 'Hungarian',
  'Icelandic', 'Indian', 'Indonesian', 'Iranian', 'Iraqi', 'Irish', 'Israeli', 'Italian',
  'Jamaican', 'Japanese', 'Jordanian',
  'Kashmiri', 'Kazakh', 'Kenyan', 'Korean', 'Kurdish',
  'Lao', 'Lebanese', 'Libyan', 'Lithuanian', 'Luxembourgian',
  'Malaysian', 'Mediterranean', 'Mexican', 'Middle Eastern', 'Mongolian', 'Moroccan',
  'Nepalese', 'New American', 'New Nordic', 'New Zealand', 'Nigerian', 'North African', 'Norwegian',
  'Okinawan',
  'Pakistani', 'Palestinian', 'Peranakan', 'Peruvian', 'Polish', 'Portuguese', 'Puerto Rican',
  'Romanian', 'Russian',
  'Saudi Arabian', 'Scottish', 'Senegalese', 'Serbian', 'Sicilian', 'Singaporean',
  'Slovak', 'Slovenian', 'Somali', 'South African', 'Southern American', 'Spanish', 'Sri Lankan',
  'Sudanese', 'Swedish', 'Swiss', 'Syrian',
  'Taiwanese', 'Tanzanian', 'Tex-Mex', 'Thai', 'Tibetan', 'Trinidadian', 'Tunisian', 'Turkish',
  'Ugandan', 'Ukrainian', 'Uruguayan', 'Uzbek',
  'Venezuelan', 'Vietnamese',
  'Welsh', 'West African',
  'Yemeni',
  'Zimbabwean',
  'Other',
] as const
