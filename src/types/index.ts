export type UserRole = 'CUSTOMER' | 'RESTAURANT_OWNER' | 'ADMIN'

export interface User {
  id: string
  email: string
  role: UserRole
  displayName: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  data: {
    accessToken: string
    refreshToken: string
    user: User
  }
}

export interface RefreshResponse {
  data: {
    accessToken: string
    refreshToken: string
  }
}

export interface OpeningHours {
  monday?: string
  tuesday?: string
  wednesday?: string
  thursday?: string
  friday?: string
  saturday?: string
  sunday?: string
}

export interface Restaurant {
  id: string
  name: string
  address: string
  phone: string
  website?: string
  description?: string
  cuisine?: string
  openingHours?: OpeningHours | string
  ownerId?: string
  createdAt?: string
  updatedAt?: string
}

export interface Dish {
  id: string
  name: string
  description?: string
  price: number
  category: string
  available: boolean
  imageUrl?: string
  restaurantId: string
  createdAt?: string
  updatedAt?: string
}

export interface AdminStats {
  data: {
    users: number
    restaurants: number
    events: number
  }
}

export interface PaginatedUsers {
  data: {
    users: User[]
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface ApiError {
  message: string
  statusCode?: number
}

export interface RestaurantsListResponse {
  data: Restaurant[]
}

export interface RestaurantResponse {
  data: Restaurant
}

export interface DishesListResponse {
  data: Dish[]
}

export interface DishResponse {
  data: Dish
}

export type DishFormData = Omit<Dish, 'id' | 'restaurantId' | 'createdAt' | 'updatedAt'>

export type RestaurantFormData = Omit<Restaurant, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
